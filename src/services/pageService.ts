/**
 * Pages Module Database & Domain Service Layer
 * School News Platform - Step 09 Quản lý Trang tĩnh (Pages), Menu & Cấu hình SEO
 *
 * Architecture:
 * Component / Page -> Hook -> pageService.ts -> Supabase Client -> PostgreSQL / RLS
 *
 * Coordinates domain logic for:
 * 1. public.pages
 *
 * Enforces:
 * - Pure client-safe Supabase connection (Zero Service Role Key)
 * - Authoritative database RLS enforcement (Staff permissions: pages.view, pages.create, pages.edit, pages.delete)
 * - Public reading strictly constrained to published pages (status = 'published' AND published_at <= NOW())
 * - Anti-author spoofing: author_id is authoritatively assigned to auth.uid() on INSERT
 * - Immutable/system fields protection: id, author_id, created_at, updated_at, search_vector
 * - Fail-closed error handling and detailed error taxonomy
 * - Safe PostgREST query input sanitization
 */

import { supabase } from '../lib/supabase';
import { envConfig } from '../lib/env';
import type {
  Page,
  PageWithRelations,
  PageCreateInput,
  PageUpdateInput,
  PageListParams,
  PagePaginationResult,
} from '../types/page';
import {
  pageCreateSchema,
  pageUpdateSchema,
  pageListParamsSchema,
  UUID_REGEX,
  SLUG_REGEX,
} from '../modules/pages/schemas/pageSchema';
import { PAGE_PAGINATION_DEFAULTS } from '../modules/pages/config/pagesConfig';

// ==============================================================================
// 1. ERROR TAXONOMY
// ==============================================================================

export type PageServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'DUPLICATE_SLUG'
  | 'DATABASE_ERROR';

export class PageServiceError extends Error {
  readonly code: PageServiceErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: PageServiceErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'PageServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// ==============================================================================
// 2. INTERNAL UTILITIES & DATABASE ERROR HANDLER
// ==============================================================================

/**
 * Validates a standard UUID v4 string.
 */
function validateUUID(id: string, fieldName: string = 'ID'): void {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new PageServiceError(
      `${fieldName} không hợp lệ (phải có định dạng UUID v4 chuẩn).`,
      'VALIDATION_ERROR'
    );
  }
}

/**
 * Sanitize PostgREST query input to prevent malformed filter expression injection.
 * Removes characters that break PostgREST filter syntax: () , " \ % :
 */
function sanitizePostgrestFilter(term: string): string {
  if (!term || typeof term !== 'string') return '';
  return term.replace(/[(),"\\%:]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Maps PostgreSQL and Supabase error codes to domain PageServiceError.
 */
function handleDatabaseError(error: unknown, defaultMessage: string): never {
  if (error instanceof PageServiceError) {
    throw error;
  }

  const pgError = error as { code?: string; message?: string; details?: string };
  const message = pgError?.message || defaultMessage;
  const code = pgError?.code;

  // 42501: Insufficient privilege or RLS violation
  if (
    code === '42501' ||
    message.includes('permission denied') ||
    message.includes('violates row-level security')
  ) {
    throw new PageServiceError(
      'Bạn không có quyền thực hiện thao tác này.',
      'UNAUTHORIZED',
      error
    );
  }

  // 23505: Unique constraint violation (e.g. duplicate slug)
  if (
    code === '23505' ||
    message.includes('duplicate key value') ||
    message.includes('unique constraint') ||
    message.includes('pages_slug_key')
  ) {
    throw new PageServiceError(
      'Đường dẫn định danh (slug) đã được sử dụng. Vui lòng chọn slug khác.',
      'DUPLICATE_SLUG',
      error
    );
  }

  // 23503: Foreign key violation (e.g. invalid parent_id or author_id)
  if (code === '23503' || message.includes('foreign key constraint')) {
    throw new PageServiceError(
      'Mục liên kết không tồn tại hoặc đã bị xóa (trang cha hoặc tài khoản tác giả).',
      'VALIDATION_ERROR',
      error
    );
  }

  // 23514: Check constraint violation (e.g. empty title/slug, parent_id == id, invalid template/status)
  if (code === '23514' || message.includes('check constraint')) {
    throw new PageServiceError(
      'Dữ liệu vi phạm ràng buộc kiểm tra của CSDL (tiêu đề/slug không được rỗng, trang cha không thể là chính mình).',
      'VALIDATION_ERROR',
      error
    );
  }

  // PGRST116: PostgREST error: No rows found for single result
  if (code === 'PGRST116') {
    throw new PageServiceError('Không tìm thấy trang yêu cầu.', 'NOT_FOUND', error);
  }

  throw new PageServiceError(message, 'DATABASE_ERROR', error);
}

// ==============================================================================
// 3. READ OPERATIONS
// ==============================================================================

/**
 * List pages with search, filtering, pagination, and sorting.
 * Serves CMS management view as well as hierarchical lists.
 * Authorization is strictly guarded by RLS policies:
 * - Public callers only receive published pages where published_at <= NOW().
 * - Staff callers with pages.view receive full records according to their permissions.
 */
export async function listPages(
  params: PageListParams = {}
): Promise<PagePaginationResult<PageWithRelations>> {
  if (!envConfig.isConfigured) {
    throw new PageServiceError(
      'Hệ thống chưa cấu hình kết nối CSDL Supabase.',
      'DATABASE_ERROR'
    );
  }

  const parsedParams = pageListParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    const firstIssue = parsedParams.error.issues[0]?.message || 'Tham số truy vấn trang không hợp lệ.';
    throw new PageServiceError(firstIssue, 'VALIDATION_ERROR', parsedParams.error);
  }

  const validParams = parsedParams.data;
  const page = Math.max(1, validParams.page ?? PAGE_PAGINATION_DEFAULTS.DEFAULT_PAGE);
  const limit = Math.min(
    PAGE_PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, validParams.limit ?? PAGE_PAGINATION_DEFAULTS.DEFAULT_LIMIT)
  );
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from('pages')
      .select(
        '*, author:profiles!author_id(id, full_name, email, avatar_url), parent:pages!parent_id(id, title, slug)',
        { count: 'exact' }
      );

    // 1. Status filter
    if (validParams.status && validParams.status !== 'all') {
      query = query.eq('status', validParams.status);
    }

    // 2. Template filter
    if (validParams.template && validParams.template !== 'all') {
      query = query.eq('template', validParams.template);
    }

    // 3. Parent ID filter
    if (validParams.parentId !== undefined && validParams.parentId !== 'all') {
      if (validParams.parentId === 'root' || validParams.parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', validParams.parentId);
      }
    }

    // 4. Text search (sanitized)
    if (validParams.search && validParams.search.trim()) {
      const sanitized = sanitizePostgrestFilter(validParams.search);
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,content.ilike.%${sanitized}%`);
      }
    }

    // 5. Sorting
    const sortBy = validParams.sortBy || 'sort_order';
    const sortOrder = validParams.sortOrder || (sortBy === 'sort_order' ? 'asc' : 'desc');
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Tie-breaker order for stable deterministic pagination
    if (sortBy !== 'sort_order') {
      query = query.order('sort_order', { ascending: true });
    }
    query = query.order('id', { ascending: true });

    // 6. Pagination range
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách trang.');
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: (data as PageWithRelations[]) || [],
      total,
      page,
      limit,
      totalPages,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi tải danh sách trang.');
  }
}

/**
 * Fetch a single page by its UUID primary key with author and parent joined.
 * Used for admin editor and detailed preview.
 * Authorization is strictly evaluated by RLS.
 */
export async function getPageById(id: string): Promise<PageWithRelations | null> {
  validateUUID(id, 'ID trang');

  try {
    const { data, error } = await supabase
      .from('pages')
      .select(
        '*, author:profiles!author_id(id, full_name, email, avatar_url), parent:pages!parent_id(id, title, slug)'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Không thể tải thông tin trang.');
    }

    return (data as PageWithRelations) || null;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi truy vấn trang theo ID.');
  }
}

/**
 * Fetch a publicly visible page by its unique slug.
 * Used for public website rendering: /page/:slug
 * Enforces:
 * - Direct lookup by slug
 * - RLS policy 1 strictly prevents anonymous users from seeing drafts, archived, or scheduled pages.
 */
export async function getPublishedPageBySlug(slug: string): Promise<PageWithRelations | null> {
  if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
    throw new PageServiceError(
      'Đường dẫn định danh (slug) không đúng định dạng hợp lệ.',
      'VALIDATION_ERROR'
    );
  }

  try {
    const { data, error } = await supabase
      .from('pages')
      .select(
        '*, author:profiles!author_id(id, full_name, email, avatar_url), parent:pages!parent_id(id, title, slug)'
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Không thể tải nội dung trang.');
    }

    return (data as PageWithRelations) || null;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi truy vấn trang công khai theo slug.');
  }
}

// ==============================================================================
// 4. MUTATION OPERATIONS
// ==============================================================================

/**
 * Create a new static page.
 * Security & Data Integrity guarantees:
 * - Caller input is strictly validated via Zod.
 * - Caller CANNOT specify id, search_vector, created_at, updated_at, view_count.
 * - author_id is retrieved directly from supabase.auth.getUser() and bound to auth.uid(),
 *   preventing author spoofing (IDOR) and strictly satisfying RLS Policy 3.
 * - Staff caller must possess pages.create permission.
 */
export async function createPage(input: PageCreateInput): Promise<Page> {
  // 1. Zod schema validation
  const parseResult = pageCreateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu tạo trang không hợp lệ.';
    throw new PageServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  // 2. Identity resolution (Prevent author spoofing)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new PageServiceError(
      'Vui lòng đăng nhập để thực hiện thao tác tạo trang tĩnh.',
      'UNAUTHORIZED',
      authError
    );
  }

  // 3. Publish metadata resolution
  const isPublished = validated.status === 'published';
  const nowIso = new Date().toISOString();
  const publishedAt = isPublished ? validated.published_at || nowIso : validated.published_at || null;
  const publishedBy = isPublished ? user.id : null;

  try {
    // 4. Explicit allow-list payload mapping
    const payload = {
      title: validated.title,
      slug: validated.slug,
      content: validated.content,
      excerpt: validated.excerpt ?? null,
      featured_image: validated.featured_image || null,
      parent_id: validated.parent_id ?? null,
      template: validated.template,
      status: validated.status,
      sort_order: validated.sort_order,
      author_id: user.id, // Strictly authentic user ID, prevents author spoofing
      published_at: publishedAt,
      published_by: publishedBy,
      meta_title: validated.meta_title ?? null,
      meta_description: validated.meta_description ?? null,
      meta_keywords: validated.meta_keywords ?? null,
      og_image: validated.og_image || null,
      canonical_url: validated.canonical_url || null,
      no_index: validated.no_index,
    };

    const { data: created, error } = await supabase
      .from('pages')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể tạo trang mới.');
    }

    return created as Page;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi tạo trang mới.');
  }
}

/**
 * Update an existing static page.
 * Security & Data Integrity guarantees:
 * - Validates target ID is a valid UUID.
 * - Caller input is strictly validated via Zod allow-list.
 * - Caller CANNOT modify id, author_id, created_at, updated_at, search_vector, view_count.
 * - Circular parent hierarchy check: parent_id cannot equal page id.
 * - Staff caller must possess pages.edit permission.
 */
export async function updatePage(id: string, input: PageUpdateInput): Promise<Page> {
  validateUUID(id, 'ID trang');

  // 1. Zod schema validation
  const parseResult = pageUpdateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật trang không hợp lệ.';
    throw new PageServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  // 2. Self-parent check
  if (validated.parent_id && validated.parent_id === id) {
    throw new PageServiceError(
      'Trang không thể tự chọn chính mình làm trang cha.',
      'VALIDATION_ERROR'
    );
  }

  // 3. Construct explicit allow-listed update payload
  const payload: Record<string, unknown> = {};

  if (validated.title !== undefined) payload.title = validated.title;
  if (validated.slug !== undefined) payload.slug = validated.slug;
  if (validated.content !== undefined) payload.content = validated.content;
  if (validated.excerpt !== undefined) payload.excerpt = validated.excerpt;
  if (validated.featured_image !== undefined) payload.featured_image = validated.featured_image || null;
  if (validated.parent_id !== undefined) payload.parent_id = validated.parent_id;
  if (validated.template !== undefined) payload.template = validated.template;
  if (validated.status !== undefined) {
    payload.status = validated.status;
    // If transitioning to published and published_at was not provided, set published_at
    if (validated.status === 'published' && validated.published_at === undefined) {
      payload.published_at = new Date().toISOString();
    }
  }
  if (validated.sort_order !== undefined) payload.sort_order = validated.sort_order;
  if (validated.published_at !== undefined) payload.published_at = validated.published_at;
  if (validated.meta_title !== undefined) payload.meta_title = validated.meta_title;
  if (validated.meta_description !== undefined) payload.meta_description = validated.meta_description;
  if (validated.meta_keywords !== undefined) payload.meta_keywords = validated.meta_keywords;
  if (validated.og_image !== undefined) payload.og_image = validated.og_image || null;
  if (validated.canonical_url !== undefined) payload.canonical_url = validated.canonical_url || null;
  if (validated.no_index !== undefined) payload.no_index = validated.no_index;

  if (Object.keys(payload).length === 0) {
    throw new PageServiceError(
      'Không có dữ liệu thay đổi nào được gửi lên.',
      'VALIDATION_ERROR'
    );
  }

  try {
    const { data: updated, error } = await supabase
      .from('pages')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật trang.');
    }

    return updated as Page;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi cập nhật trang.');
  }
}

/**
 * Delete a static page by its UUID.
 * Security & Data Integrity guarantees:
 * - Validates target ID is a valid UUID.
 * - Subordinated pages (children) have parent_id ON DELETE SET NULL in PostgreSQL,
 *   preserving child pages without accidental cascade deletion or orphaned corruption.
 * - Staff caller must possess pages.delete permission (strictly ADMIN / SUPER_ADMIN).
 */
export async function deletePage(id: string): Promise<void> {
  validateUUID(id, 'ID trang');

  try {
    const { error } = await supabase.from('pages').delete().eq('id', id);

    if (error) {
      handleDatabaseError(error, 'Không thể xóa trang.');
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi xóa trang.');
  }
}
