/**
 * Media Module Database & Domain Service Layer
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album
 *
 * Architecture:
 * Component / Page -> Hook -> mediaService.ts -> Supabase Client -> PostgreSQL / RLS
 *
 * Coordinates domain logic for:
 * 1. public.media_folders
 * 2. public.media
 * 3. public.albums
 * 4. public.album_items
 *
 * Enforces:
 * - Pure client-safe Supabase connection (no Service Role Key)
 * - Authoritative database RLS enforcement (Author isolation, Editor/Admin permissions)
 * - Safe PostgREST search input sanitization
 * - Exact storage path invariant (media.file_path === storage.objects.name)
 * - Coordinated storage deletion via mediaStorage.ts
 */

import { supabase } from '../lib/supabase';
import { deleteMediaFile } from '../lib/mediaStorage';
import type {
  MediaFolder,
  MediaFolderWithCount,
  MediaItem,
  MediaWithFolder,
  Album,
  AlbumWithItems,
  AlbumMediaItem,
  MediaListParams,
  PublicMediaFilterParams,
  AlbumListParams,
  MediaPaginationResult,
  CreateMediaFolderInput,
  UpdateMediaFolderInput,
  CreateMediaInput,
  UpdateMediaInput,
  CreateAlbumInput,
  UpdateAlbumInput,
} from '../types/media';
import {
  mediaFolderSchema,
  mediaUpdateSchema,
  albumFormSchema,
  albumItemOrderSchema,
  SLUG_REGEX,
} from '../modules/media/schemas/mediaSchema';

// ==============================================================================
// 1. ERROR TAXONOMY
// ==============================================================================

export type MediaServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_MIME'
  | 'NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'DATABASE_ERROR';

export class MediaServiceError extends Error {
  readonly code: MediaServiceErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: MediaServiceErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'MediaServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// ==============================================================================
// 2. INTERNAL UTILITIES
// ==============================================================================

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates a standard UUID v4 string.
 */
function validateUUID(id: string, fieldName: string = 'ID'): void {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new MediaServiceError(
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
 * Normalizes title or name into a safe lowercase slug if not provided.
 */
function generateFallbackSlug(nameOrTitle: string): string {
  const base = nameOrTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base || 'item'}-${randomSuffix}`;
}

/**
 * Maps Supabase / PostgREST error codes to standard MediaServiceError.
 */
function handleDatabaseError(error: unknown, defaultMessage: string): never {
  if (error instanceof MediaServiceError) {
    throw error;
  }

  const pgError = error as { code?: string; message?: string; details?: string };
  const message = pgError?.message || defaultMessage;
  const code = pgError?.code;

  if (code === '42501' || message.includes('permission denied') || message.includes('violates row-level security')) {
    throw new MediaServiceError(
      'Bạn không có quyền thực hiện thao tác này.',
      'UNAUTHORIZED',
      error
    );
  }

  if (code === '23505' || message.includes('duplicate key value') || message.includes('unique constraint')) {
    throw new MediaServiceError(
      'Dữ liệu đã tồn tại hoặc trùng lặp định danh (slug/file path).',
      'VALIDATION_ERROR',
      error
    );
  }

  if (code === '23503' || message.includes('foreign key constraint')) {
    throw new MediaServiceError(
      'Mục liên kết không tồn tại hoặc đã bị xóa.',
      'VALIDATION_ERROR',
      error
    );
  }

  if (code === 'PGRST116') {
    throw new MediaServiceError('Không tìm thấy dữ liệu yêu cầu.', 'NOT_FOUND', error);
  }

  throw new MediaServiceError(message, 'DATABASE_ERROR', error);
}

// ==============================================================================
// 3. MEDIA FOLDERS SERVICE
// ==============================================================================

/**
 * Fetches media folders with deterministic sorting (name ASC)
 * and aggregates media_count per folder.
 */
export async function getMediaFolders(): Promise<MediaFolderWithCount[]> {
  try {
    const { data: folders, error: foldersError } = await supabase
      .from('media_folders')
      .select('*')
      .order('name', { ascending: true });

    if (foldersError) {
      handleDatabaseError(foldersError, 'Không thể tải danh sách thư mục.');
    }

    if (!folders || folders.length === 0) {
      return [];
    }

    // Fetch media count per folder
    const { data: mediaCounts, error: countError } = await supabase
      .from('media')
      .select('folder_id');

    if (countError) {
      // Return folders without counts if count query encounters permission boundary
      return folders.map((f: MediaFolder) => ({ ...f, media_count: 0 }));
    }

    const countMap: Record<string, number> = {};
    if (mediaCounts) {
      for (const item of mediaCounts) {
        if (item.folder_id) {
          countMap[item.folder_id] = (countMap[item.folder_id] || 0) + 1;
        }
      }
    }

    return folders.map((folder: MediaFolder) => ({
      ...folder,
      media_count: countMap[folder.id] || 0,
    }));
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải danh sách thư mục.');
  }
}

/**
 * Creates a new media folder.
 * Validates payload with mediaFolderSchema.
 * created_by is assigned by PostgreSQL trigger / auth.uid().
 */
export async function createMediaFolder(data: CreateMediaFolderInput): Promise<MediaFolder> {
  const parseResult = mediaFolderSchema.safeParse(data);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu thư mục không hợp lệ.';
    throw new MediaServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }

  const validated = parseResult.data;
  let finalSlug = validated.slug;
  if (!finalSlug || finalSlug.trim() === '') {
    finalSlug = generateFallbackSlug(validated.name);
  }

  try {
    const { data: created, error } = await supabase
      .from('media_folders')
      .insert({
        name: validated.name,
        slug: finalSlug,
        description: validated.description ?? null,
        parent_id: validated.parent_id ?? null,
      })
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể tạo thư mục đa phương tiện.');
    }

    return created as MediaFolder;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tạo thư mục.');
  }
}

/**
 * Updates an existing media folder.
 * Validates UUID and payload. Excludes database-managed fields.
 */
export async function updateMediaFolder(
  id: string,
  data: UpdateMediaFolderInput
): Promise<MediaFolder> {
  validateUUID(id, 'Mã thư mục');

  const parseResult = mediaFolderSchema.partial().safeParse(data);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật không hợp lệ.';
    throw new MediaServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }

  const validated = parseResult.data;
  const updatePayload: Record<string, unknown> = {};

  if (validated.name !== undefined) updatePayload.name = validated.name;
  if (validated.slug !== undefined) updatePayload.slug = validated.slug;
  if (validated.description !== undefined) updatePayload.description = validated.description;
  if (validated.parent_id !== undefined) updatePayload.parent_id = validated.parent_id;

  try {
    const { data: updated, error } = await supabase
      .from('media_folders')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật thư mục.');
    }

    return updated as MediaFolder;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi cập nhật thư mục.');
  }
}

/**
 * Deletes a media folder by UUID.
 * Respects ON DELETE SET NULL on media.folder_id and ON DELETE CASCADE on child folders.
 */
export async function deleteMediaFolder(id: string): Promise<void> {
  validateUUID(id, 'Mã thư mục');

  try {
    const { error } = await supabase.from('media_folders').delete().eq('id', id);

    if (error) {
      handleDatabaseError(error, 'Không thể xóa thư mục.');
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi xóa thư mục.');
  }
}

// ==============================================================================
// 4. MEDIA SERVICE
// ==============================================================================

/**
 * Fetches published media for public view.
 * Hard-enforces is_published = true.
 */
export async function getPublicMedia(
  params: PublicMediaFilterParams = {}
): Promise<MediaPaginationResult<MediaItem>> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  try {
    let query = supabase
      .from('media')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (params.folderId !== undefined) {
      if (params.folderId === null) {
        query = query.is('folder_id', null);
      } else {
        validateUUID(params.folderId, 'Mã thư mục');
        query = query.eq('folder_id', params.folderId);
      }
    }

    if (params.fileType && params.fileType !== 'all') {
      query = query.eq('file_type', params.fileType);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách đa phương tiện công khai.');
    }

    const items = (data || []) as MediaItem[];
    const total = count ?? items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải tệp đa phương tiện công khai.');
  }
}

/**
 * Fetches media list for administrators / editors with media.view permission.
 * Supports search, folder filtering, file type filtering, publication status filtering,
 * and deterministic sorting.
 */
export async function getAdminMediaList(
  params: MediaListParams = {}
): Promise<MediaPaginationResult<MediaWithFolder>> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  try {
    let query = supabase.from('media').select(
      `
        *,
        folder:media_folders (
          id,
          name,
          slug,
          description,
          parent_id,
          created_by,
          created_at,
          updated_at
        )
      `,
      { count: 'exact' }
    );

    // Apply safe search filter
    if (params.search && params.search.trim().length > 0) {
      const safeSearch = sanitizePostgrestFilter(params.search);
      if (safeSearch.length > 0) {
        query = query.or(
          `title.ilike.%${safeSearch}%,file_name.ilike.%${safeSearch}%,alt_text.ilike.%${safeSearch}%,caption.ilike.%${safeSearch}%`
        );
      }
    }

    // Filter by folder
    if (params.folderId !== undefined) {
      if (params.folderId === null) {
        query = query.is('folder_id', null);
      } else {
        validateUUID(params.folderId, 'Mã thư mục');
        query = query.eq('folder_id', params.folderId);
      }
    }

    // Filter by file type
    if (params.fileType && params.fileType !== 'all') {
      query = query.eq('file_type', params.fileType);
    }

    // Filter by publication status
    if (params.isPublished !== undefined) {
      query = query.eq('is_published', params.isPublished);
    }

    // Deterministic sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder === 'asc';
    query = query
      .order(sortBy, { ascending: sortOrder })
      .order('id', { ascending: true }) // deterministic secondary tie-breaker
      .range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách quản lý đa phương tiện.');
    }

    const items = (data || []) as MediaWithFolder[];
    const total = count ?? items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải danh sách quản lý media.');
  }
}

/**
 * Fetches a single media record by UUID, including its parent folder.
 */
export async function getMediaById(id: string): Promise<MediaWithFolder> {
  validateUUID(id, 'Mã tệp đa phương tiện');

  try {
    const { data, error } = await supabase
      .from('media')
      .select(
        `
        *,
        folder:media_folders (
          id,
          name,
          slug,
          description,
          parent_id,
          created_by,
          created_at,
          updated_at
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể tìm thấy tệp đa phương tiện.');
    }

    return data as MediaWithFolder;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải thông tin tệp đa phương tiện.');
  }
}

/**
 * Creates a media database record after a successful physical file upload.
 *
 * CRITICAL INVARIANT:
 * data.file_path MUST equal exact storage.objects.name generated by mediaStorage.ts.
 * created_by is populated by PostgreSQL trigger / auth.uid().
 */
export async function createMediaRecord(data: CreateMediaInput): Promise<MediaItem> {
  if (!data.title || data.title.trim().length === 0) {
    throw new MediaServiceError('Tiêu đề tệp không được để trống.', 'VALIDATION_ERROR');
  }

  if (!data.file_path || !data.file_path.startsWith('media/')) {
    throw new MediaServiceError(
      'Đường dẫn lưu trữ tệp (file_path) không hợp lệ hoặc vi phạm tiền tố canonical "media/".',
      'VALIDATION_ERROR'
    );
  }

  if (data.folder_id) {
    validateUUID(data.folder_id, 'Mã thư mục');
  }

  try {
    const { data: created, error } = await supabase
      .from('media')
      .insert({
        title: data.title.trim(),
        file_name: data.file_name,
        file_path: data.file_path,
        file_size: data.file_size,
        mime_type: data.mime_type,
        file_type: data.file_type,
        width: data.width ?? null,
        height: data.height ?? null,
        alt_text: data.alt_text ? data.alt_text.trim() : null,
        caption: data.caption ? data.caption.trim() : null,
        folder_id: data.folder_id ?? null,
        is_published: data.is_published ?? true,
      })
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể lưu bản ghi đa phương tiện vào cơ sở dữ liệu.');
    }

    return created as MediaItem;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tạo bản ghi tệp đa phương tiện.');
  }
}

/**
 * Updates metadata for an existing media record.
 * Validates payload via mediaUpdateSchema. Excludes immutable fields.
 */
export async function updateMediaRecord(
  id: string,
  data: UpdateMediaInput
): Promise<MediaItem> {
  validateUUID(id, 'Mã tệp đa phương tiện');

  const parseResult = mediaUpdateSchema.safeParse(data);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật không hợp lệ.';
    throw new MediaServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }

  const validated = parseResult.data;
  const updatePayload: Record<string, unknown> = {};

  if (validated.title !== undefined) updatePayload.title = validated.title;
  if (validated.alt_text !== undefined) updatePayload.alt_text = validated.alt_text;
  if (validated.caption !== undefined) updatePayload.caption = validated.caption;
  if (validated.folder_id !== undefined) updatePayload.folder_id = validated.folder_id;
  if (validated.is_published !== undefined) updatePayload.is_published = validated.is_published;

  try {
    const { data: updated, error } = await supabase
      .from('media')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật tệp đa phương tiện.');
    }

    return updated as MediaItem;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi cập nhật tệp đa phương tiện.');
  }
}

/**
 * Deletes a media record in coordinated database + storage sequence:
 * 1. Retrieves media record and file_path.
 * 2. Deletes database record (RLS authorized).
 *    FK behavior: album_items are CASCADE deleted, albums.cover_media_id is SET NULL.
 * 3. Deletes physical storage file via mediaStorage.deleteMediaFile().
 */
export async function deleteMediaRecord(id: string): Promise<void> {
  validateUUID(id, 'Mã tệp đa phương tiện');

  let mediaRecord: MediaItem;
  try {
    const { data, error } = await supabase
      .from('media')
      .select('id, file_path')
      .eq('id', id)
      .single();

    if (error || !data) {
      handleDatabaseError(error || new Error('Không tìm thấy tệp'), 'Không tìm thấy tệp để xóa.');
    }
    mediaRecord = data as MediaItem;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi kiểm tra bản ghi trước khi xóa.');
  }

  // Delete database record first
  try {
    const { error: dbDeleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (dbDeleteError) {
      handleDatabaseError(dbDeleteError, 'Không thể xóa bản ghi tệp trong cơ sở dữ liệu.');
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi xóa bản ghi trong cơ sở dữ liệu.');
  }

  // Delete physical file from Storage
  try {
    await deleteMediaFile(mediaRecord.file_path);
  } catch (storageErr) {
    // Database deletion succeeded, physical file deletion encountered warning
    console.warn(
      `[mediaService] Database record ${id} deleted, but physical file deletion for ${mediaRecord.file_path} failed:`,
      storageErr
    );
    throw new MediaServiceError(
      'Bản ghi tệp trong cơ sở dữ liệu đã được xóa thành công, nhưng xảy ra lỗi khi xóa tệp vật lý khỏi bộ lưu trữ Storage.',
      'STORAGE_ERROR',
      storageErr
    );
  }
}

// ==============================================================================
// 5. ALBUM SERVICE
// ==============================================================================

/**
 * Fetches publicly visible published albums.
 * Enforces is_published = true.
 */
export async function getPublicAlbums(
  params: { page?: number; pageSize?: number } = {}
): Promise<MediaPaginationResult<AlbumWithItems>> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 12));
  const offset = (page - 1) * pageSize;

  try {
    const { data, count, error } = await supabase
      .from('albums')
      .select(
        `
        *,
        cover_media:media!albums_cover_media_id_fkey (
          id,
          title,
          file_name,
          file_path,
          file_size,
          mime_type,
          file_type,
          width,
          height,
          alt_text,
          caption,
          is_published
        )
      `,
        { count: 'exact' }
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách album công khai.');
    }

    const items = (data || []) as AlbumWithItems[];
    const total = count ?? items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải danh sách album.');
  }
}

/**
 * Fetches a single public album by slug, including its items and underlying media.
 * Enforces is_published = true and published items.
 */
export async function getPublicAlbumBySlug(slug: string): Promise<AlbumWithItems> {
  if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug.trim())) {
    throw new MediaServiceError('Đường dẫn định danh (slug) không hợp lệ.', 'VALIDATION_ERROR');
  }

  try {
    const { data: album, error } = await supabase
      .from('albums')
      .select(
        `
        *,
        cover_media:media!albums_cover_media_id_fkey (
          id,
          title,
          file_name,
          file_path,
          file_size,
          mime_type,
          file_type,
          width,
          height,
          alt_text,
          caption,
          is_published
        )
      `
      )
      .eq('slug', slug.trim())
      .eq('is_published', true)
      .single();

    if (error || !album) {
      handleDatabaseError(error || new Error('Không tìm thấy album'), 'Không tìm thấy album yêu cầu.');
    }

    // Fetch album items sorted by sort_order ASC
    const { data: items, error: itemsError } = await supabase
      .from('album_items')
      .select(
        `
        id,
        album_id,
        media_id,
        sort_order,
        caption,
        created_at,
        media:media (
          id,
          title,
          file_name,
          file_path,
          file_size,
          mime_type,
          file_type,
          width,
          height,
          alt_text,
          caption,
          is_published,
          created_at
        )
      `
      )
      .eq('album_id', album.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (itemsError) {
      handleDatabaseError(itemsError, 'Không thể tải danh sách ảnh trong album.');
    }

    const rawItems = (items || []) as unknown as Array<{
      id: string;
      album_id: string;
      media_id: string;
      sort_order: number;
      caption: string | null;
      created_at: string;
      media: MediaItem | MediaItem[] | null;
    }>;

    const mappedItems: AlbumMediaItem[] = rawItems.map((item) => {
      const resolvedMedia: MediaItem | null = Array.isArray(item.media)
        ? (item.media[0] ?? null)
        : (item.media ?? null);
      return {
        id: item.id,
        album_id: item.album_id,
        media_id: item.media_id,
        sort_order: item.sort_order,
        caption: item.caption,
        created_at: item.created_at,
        media: resolvedMedia,
      };
    });

    const filteredItems = mappedItems.filter((item) => item.media?.is_published !== false);

    return {
      ...(album as Album),
      items: filteredItems,
      items_count: filteredItems.length,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải album.');
  }
}

/**
 * Fetches admin album list for users with media.view / media.edit permission.
 */
export async function getAdminAlbums(
  params: AlbumListParams = {}
): Promise<MediaPaginationResult<AlbumWithItems>> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  try {
    let query = supabase.from('albums').select(
      `
        *,
        cover_media:media!albums_cover_media_id_fkey (
          id,
          title,
          file_name,
          file_path,
          file_size,
          mime_type,
          file_type,
          width,
          height,
          alt_text,
          caption,
          is_published
        )
      `,
      { count: 'exact' }
    );

    if (params.search && params.search.trim().length > 0) {
      const safeSearch = sanitizePostgrestFilter(params.search);
      if (safeSearch.length > 0) {
        query = query.or(`title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
      }
    }

    if (params.isPublished !== undefined) {
      query = query.eq('is_published', params.isPublished);
    }

    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder === 'asc';
    query = query
      .order(sortBy, { ascending: sortOrder })
      .order('id', { ascending: true })
      .range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách quản lý album.');
    }

    const items = (data || []) as AlbumWithItems[];
    const total = count ?? items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải danh sách quản lý album.');
  }
}

/**
 * Creates a new album.
 * Validates payload with albumFormSchema.
 * created_by is handled by PostgreSQL trigger / auth.uid().
 */
export async function createAlbum(data: CreateAlbumInput): Promise<Album> {
  const parseResult = albumFormSchema.safeParse(data);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu album không hợp lệ.';
    throw new MediaServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }

  const validated = parseResult.data;
  let finalSlug = validated.slug;
  if (!finalSlug || finalSlug.trim() === '') {
    finalSlug = generateFallbackSlug(validated.title);
  }

  const isPublished = validated.is_published ?? false;
  const publishedAt = isPublished
    ? validated.published_at ?? new Date().toISOString()
    : null;

  try {
    const { data: created, error } = await supabase
      .from('albums')
      .insert({
        title: validated.title,
        slug: finalSlug,
        description: validated.description ?? null,
        cover_media_id: validated.cover_media_id ?? null,
        is_published: isPublished,
        published_at: publishedAt,
      })
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể tạo album mới.');
    }

    return created as Album;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tạo album.');
  }
}

/**
 * Updates an existing album.
 * Validates UUID and payload.
 */
export async function updateAlbum(id: string, data: UpdateAlbumInput): Promise<Album> {
  validateUUID(id, 'Mã album');

  const parseResult = albumFormSchema.partial().safeParse(data);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật album không hợp lệ.';
    throw new MediaServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }

  const validated = parseResult.data;
  const updatePayload: Record<string, unknown> = {};

  if (validated.title !== undefined) updatePayload.title = validated.title;
  if (validated.slug !== undefined) updatePayload.slug = validated.slug;
  if (validated.description !== undefined) updatePayload.description = validated.description;
  if (validated.cover_media_id !== undefined) updatePayload.cover_media_id = validated.cover_media_id;
  if (validated.is_published !== undefined) {
    updatePayload.is_published = validated.is_published;
    if (validated.is_published && !validated.published_at) {
      updatePayload.published_at = new Date().toISOString();
    } else if (!validated.is_published) {
      updatePayload.published_at = null;
    }
  }
  if (validated.published_at !== undefined) updatePayload.published_at = validated.published_at;

  try {
    const { data: updated, error } = await supabase
      .from('albums')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật album.');
    }

    return updated as Album;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi cập nhật album.');
  }
}

/**
 * Deletes an album.
 * Established database FK constraint automatically cascades deletion of public.album_items.
 */
export async function deleteAlbum(id: string): Promise<void> {
  validateUUID(id, 'Mã album');

  try {
    const { error } = await supabase.from('albums').delete().eq('id', id);

    if (error) {
      handleDatabaseError(error, 'Không thể xóa album.');
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi xóa album.');
  }
}

// ==============================================================================
// 6. ALBUM ITEMS SERVICE
// ==============================================================================

/**
 * Fetches all items in an album ordered by sort_order ASC.
 */
export async function getAlbumItems(albumId: string): Promise<AlbumMediaItem[]> {
  validateUUID(albumId, 'Mã album');

  try {
    const { data, error } = await supabase
      .from('album_items')
      .select(
        `
        id,
        album_id,
        media_id,
        sort_order,
        caption,
        created_at,
        media:media (
          id,
          title,
          file_name,
          file_path,
          file_size,
          mime_type,
          file_type,
          width,
          height,
          alt_text,
          caption,
          is_published,
          created_at
        )
      `
      )
      .eq('album_id', albumId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách mục trong album.');
    }

    const rawItems = (data || []) as unknown as Array<{
      id: string;
      album_id: string;
      media_id: string;
      sort_order: number;
      caption: string | null;
      created_at: string;
      media: MediaItem | MediaItem[] | null;
    }>;

    return rawItems.map((item) => {
      const resolvedMedia: MediaItem | null = Array.isArray(item.media)
        ? (item.media[0] ?? null)
        : (item.media ?? null);
      return {
        id: item.id,
        album_id: item.album_id,
        media_id: item.media_id,
        sort_order: item.sort_order,
        caption: item.caption,
        created_at: item.created_at,
        media: resolvedMedia,
      };
    });
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi tải các mục trong album.');
  }
}

/**
 * Adds a media item to an album.
 * Checks for existing items to compute next sort_order if not provided.
 */
export async function addMediaToAlbum(
  albumId: string,
  mediaId: string,
  caption?: string | null
): Promise<AlbumMediaItem> {
  validateUUID(albumId, 'Mã album');
  validateUUID(mediaId, 'Mã tệp đa phương tiện');

  try {
    // Determine the next sort_order
    const { data: latestItem, error: sortError } = await supabase
      .from('album_items')
      .select('sort_order')
      .eq('album_id', albumId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sortError) {
      handleDatabaseError(sortError, 'Không thể kiểm tra thứ tự sắp xếp trong album.');
    }

    const nextSortOrder = latestItem ? latestItem.sort_order + 1 : 0;

    const { data: created, error } = await supabase
      .from('album_items')
      .insert({
        album_id: albumId,
        media_id: mediaId,
        caption: caption ? caption.trim() : null,
        sort_order: nextSortOrder,
      })
      .select(
        `
        id,
        album_id,
        media_id,
        sort_order,
        caption,
        created_at,
        media:media (
          id,
          title,
          file_name,
          file_path,
          file_size,
          mime_type,
          file_type,
          width,
          height,
          alt_text,
          caption,
          is_published,
          created_at
        )
      `
      )
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể thêm ảnh vào album.');
    }

    const rawCreated = created as unknown as {
      id: string;
      album_id: string;
      media_id: string;
      sort_order: number;
      caption: string | null;
      created_at: string;
      media: MediaItem | MediaItem[] | null;
    };

    const resolvedMedia: MediaItem | null = Array.isArray(rawCreated.media)
      ? (rawCreated.media[0] ?? null)
      : (rawCreated.media ?? null);

    return {
      id: rawCreated.id,
      album_id: rawCreated.album_id,
      media_id: rawCreated.media_id,
      sort_order: rawCreated.sort_order,
      caption: rawCreated.caption,
      created_at: rawCreated.created_at,
      media: resolvedMedia,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi thêm ảnh vào album.');
  }
}

/**
 * Reorders album items deterministically.
 * Enforces album item ownership and duplicate prevention.
 *
 * Atomicity Note:
 * Updates are performed deterministically per item id scoped strictly
 * to the given album_id without inventing custom RPCs or raw SQL.
 */
export async function reorderAlbumItems(
  albumId: string,
  orderedItemIds: string[]
): Promise<void> {
  validateUUID(albumId, 'Mã album');

  const parseResult = albumItemOrderSchema.safeParse({ orderedItemIds });
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Danh sách sắp xếp không hợp lệ.';
    throw new MediaServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }

  try {
    // 1. Verify that all item IDs actually belong to this album
    const { data: existingItems, error: fetchError } = await supabase
      .from('album_items')
      .select('id')
      .eq('album_id', albumId);

    if (fetchError) {
      handleDatabaseError(fetchError, 'Không thể xác thực danh sách mục của album.');
    }

    const existingIdSet = new Set((existingItems || []).map((i: { id: string }) => i.id));
    for (const itemId of orderedItemIds) {
      if (!existingIdSet.has(itemId)) {
        throw new MediaServiceError(
          `Mục ${itemId} không thuộc album được chỉ định. Thao tác sắp xếp bị từ chối.`,
          'VALIDATION_ERROR'
        );
      }
    }

    // 2. Perform deterministic sort_order updates
    // In order to avoid potential transient collisions on composite unique index,
    // update items using their index sequence.
    for (let index = 0; index < orderedItemIds.length; index++) {
      const itemId = orderedItemIds[index];
      const { error: updateError } = await supabase
        .from('album_items')
        .update({ sort_order: index })
        .eq('id', itemId)
        .eq('album_id', albumId);

      if (updateError) {
        handleDatabaseError(updateError, `Không thể cập nhật thứ tự cho mục ${itemId}.`);
      }
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi sắp xếp lại các mục trong album.');
  }
}

/**
 * Removes a media item relationship from an album.
 * DOES NOT delete the underlying media record or physical storage file.
 */
export async function removeMediaFromAlbum(albumId: string, mediaId: string): Promise<void> {
  validateUUID(albumId, 'Mã album');
  validateUUID(mediaId, 'Mã tệp đa phương tiện');

  try {
    const { error } = await supabase
      .from('album_items')
      .delete()
      .eq('album_id', albumId)
      .eq('media_id', mediaId);

    if (error) {
      handleDatabaseError(error, 'Không thể xóa tệp khỏi album.');
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi hệ thống khi xóa tệp khỏi album.');
  }
}
