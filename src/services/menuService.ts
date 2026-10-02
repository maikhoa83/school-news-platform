/**
 * Menu & Menu Items Database & Domain Service Layer
 * School News Platform - Step 09.4B
 *
 * Architecture:
 * Component / Page -> Hook -> menuService.ts -> Supabase Client -> PostgreSQL / RLS
 *
 * Coordinates domain logic for:
 * 1. public.menus
 * 2. public.menu_items
 *
 * Enforces:
 * - Pure client-safe Supabase connection (Zero Service Role Key)
 * - Authoritative database RLS enforcement (settings.view, settings.edit)
 * - Anti-tampering: immutable fields (id, created_at, updated_at) protected
 * - Strict hierarchy validation:
 *     * parent item must exist
 *     * parent item must belong to the exact same menu_id
 *     * self-parent rejected (parent_id !== id)
 *     * cycle detection rejected (A -> B -> C -> A)
 * - In-memory O(n) Menu Tree builder with deterministic ordering
 * - Fail-closed error handling and detailed error taxonomy
 * - Safe PostgREST query input sanitization
 */

import { supabase } from '../lib/supabase';
import { envConfig } from '../lib/env';
import type {
  Menu,
  MenuItem,
  MenuItemWithRelations,
  MenuItemTree,
  MenuCreateInput,
  MenuUpdateInput,
  MenuListParams,
  MenuItemCreateInput,
  MenuItemUpdateInput,
  MenuItemListParams,
} from '../types/menu';
import {
  menuCreateSchema,
  menuUpdateSchema,
  menuListParamsSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
  menuItemListParamsSchema,
  UUID_REGEX,
  MENU_CODE_REGEX,
} from '../modules/menu/schemas/menuSchema';

// ==============================================================================
// 1. ERROR TAXONOMY
// ==============================================================================

export type MenuServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'DUPLICATE_CODE'
  | 'INTEGRITY_ERROR'
  | 'DATABASE_ERROR';

export class MenuServiceError extends Error {
  readonly code: MenuServiceErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: MenuServiceErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'MenuServiceError';
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
    throw new MenuServiceError(
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
 * Maps PostgreSQL and Supabase error codes to domain MenuServiceError.
 */
function handleDatabaseError(error: unknown, defaultMessage: string): never {
  if (error instanceof MenuServiceError) {
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
    throw new MenuServiceError(
      'Bạn không có quyền thực hiện thao tác này.',
      'UNAUTHORIZED',
      error
    );
  }

  // 23505: Unique constraint violation (e.g. duplicate menu code)
  if (
    code === '23505' ||
    message.includes('duplicate key value') ||
    message.includes('unique constraint') ||
    message.includes('menus_code_key')
  ) {
    throw new MenuServiceError(
      'Mã định danh menu (code) đã tồn tại. Vui lòng chọn mã khác.',
      'DUPLICATE_CODE',
      error
    );
  }

  // 23503: Foreign key violation (e.g. invalid menu_id, parent_id, or page_id)
  if (code === '23503' || message.includes('foreign key constraint')) {
    throw new MenuServiceError(
      'Dữ liệu liên kết không tồn tại hoặc đã bị xóa (menu, trang hoặc mục cha).',
      'INTEGRITY_ERROR',
      error
    );
  }

  // 23514: Check constraint violation
  if (code === '23514' || message.includes('check constraint')) {
    throw new MenuServiceError(
      'Dữ liệu vi phạm ràng buộc kiểm tra của CSDL (tên/mã/url không được rỗng, mục cha không thể là chính mình).',
      'VALIDATION_ERROR',
      error
    );
  }

  // PGRST116: PostgREST error: No rows found for single result
  if (code === 'PGRST116') {
    throw new MenuServiceError('Không tìm thấy menu hoặc mục menu yêu cầu.', 'NOT_FOUND', error);
  }

  throw new MenuServiceError(message, 'DATABASE_ERROR', error);
}

// ==============================================================================
// 3. MENU SERVICES (public.menus)
// ==============================================================================

/**
 * List menus with filtering, search, and deterministic sorting.
 * Guarded by RLS:
 * - Public visitors only receive active menus (is_active = TRUE).
 * - Staff with settings.view or settings.edit receive all menus.
 */
export async function listMenus(params: MenuListParams = {}): Promise<Menu[]> {
  if (!envConfig.isConfigured) {
    throw new MenuServiceError(
      'Hệ thống chưa cấu hình kết nối CSDL Supabase.',
      'DATABASE_ERROR'
    );
  }

  const parsedParams = menuListParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    const firstIssue = parsedParams.error.issues[0]?.message || 'Tham số lọc menu không hợp lệ.';
    throw new MenuServiceError(firstIssue, 'VALIDATION_ERROR', parsedParams.error);
  }

  const validParams = parsedParams.data;

  try {
    let query = supabase.from('menus').select('*');

    // Location filter
    if (validParams.location && validParams.location !== 'all') {
      query = query.eq('location', validParams.location);
    }

    // Active status filter
    if (validParams.isActive !== undefined && validParams.isActive !== 'all') {
      query = query.eq('is_active', validParams.isActive);
    }

    // Search filter (sanitized)
    if (validParams.search && validParams.search.trim()) {
      const sanitized = sanitizePostgrestFilter(validParams.search);
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,code.ilike.%${sanitized}%`);
      }
    }

    // Deterministic sorting
    const sortBy = validParams.sortBy || 'name';
    const sortOrder = validParams.sortOrder || (sortBy === 'name' ? 'asc' : 'desc');
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Tie-breaker order
    if (sortBy !== 'name') {
      query = query.order('name', { ascending: true });
    }
    query = query.order('id', { ascending: true });

    const { data, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách menu.');
    }

    return (data as Menu[]) || [];
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi tải danh sách menu.');
  }
}

/**
 * Fetch a single menu by UUID.
 */
export async function getMenuById(id: string): Promise<Menu | null> {
  validateUUID(id, 'ID menu');

  try {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Không thể tải thông tin menu theo ID.');
    }

    return (data as Menu) || null;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi truy vấn menu theo ID.');
  }
}

/**
 * Fetch a single menu by its unique code identifier (e.g. 'header-main', 'footer-links').
 */
export async function getMenuByCode(code: string): Promise<Menu | null> {
  if (!code || typeof code !== 'string' || !MENU_CODE_REGEX.test(code.trim())) {
    throw new MenuServiceError(
      'Mã menu (code) không đúng định dạng hợp lệ.',
      'VALIDATION_ERROR'
    );
  }

  try {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('code', code.trim())
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Không thể tải thông tin menu theo mã code.');
    }

    return (data as Menu) || null;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi truy vấn menu theo mã code.');
  }
}

/**
 * Create a new Menu.
 * Requires settings.edit permission enforced by RLS.
 */
export async function createMenu(input: MenuCreateInput): Promise<Menu> {
  const parseResult = menuCreateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu tạo menu không hợp lệ.';
    throw new MenuServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  try {
    // Explicit allow-list payload mapping
    const payload = {
      code: validated.code,
      name: validated.name,
      description: validated.description ?? null,
      location: validated.location,
      is_active: validated.is_active,
    };

    const { data: created, error } = await supabase
      .from('menus')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể tạo menu mới.');
    }

    return created as Menu;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi tạo menu mới.');
  }
}

/**
 * Update an existing Menu.
 * Immutable fields (id, created_at, updated_at) are strictly protected.
 */
export async function updateMenu(id: string, input: MenuUpdateInput): Promise<Menu> {
  validateUUID(id, 'ID menu');

  const parseResult = menuUpdateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật menu không hợp lệ.';
    throw new MenuServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  // Construct explicit allow-listed payload
  const payload: Record<string, unknown> = {};
  if (validated.code !== undefined) payload.code = validated.code;
  if (validated.name !== undefined) payload.name = validated.name;
  if (validated.description !== undefined) payload.description = validated.description;
  if (validated.location !== undefined) payload.location = validated.location;
  if (validated.is_active !== undefined) payload.is_active = validated.is_active;

  if (Object.keys(payload).length === 0) {
    throw new MenuServiceError('Không có dữ liệu thay đổi nào được gửi lên.', 'VALIDATION_ERROR');
  }

  try {
    const { data: updated, error } = await supabase
      .from('menus')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật menu.');
    }

    return updated as Menu;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi cập nhật menu.');
  }
}

/**
 * Delete a Menu by UUID.
 * Child menu_items are automatically deleted via PostgreSQL ON DELETE CASCADE.
 * Associated pages and media are preserved intact.
 */
export async function deleteMenu(id: string): Promise<void> {
  validateUUID(id, 'ID menu');

  try {
    const { error } = await supabase.from('menus').delete().eq('id', id);

    if (error) {
      handleDatabaseError(error, 'Không thể xóa menu.');
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi xóa menu.');
  }
}

// ==============================================================================
// 4. MENU ITEMS SERVICES (public.menu_items)
// ==============================================================================

/**
 * List menu items with optional filtering by menuId, parentId, and active status.
 */
export async function listMenuItems(
  params: MenuItemListParams = {}
): Promise<MenuItemWithRelations[]> {
  const parsedParams = menuItemListParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    const firstIssue = parsedParams.error.issues[0]?.message || 'Tham số lọc mục menu không hợp lệ.';
    throw new MenuServiceError(firstIssue, 'VALIDATION_ERROR', parsedParams.error);
  }

  const validParams = parsedParams.data;

  try {
    let query = supabase
      .from('menu_items')
      .select('*, page:pages!page_id(id, title, slug, status)');

    if (validParams.menuId) {
      query = query.eq('menu_id', validParams.menuId);
    }

    if (validParams.parentId !== undefined && validParams.parentId !== 'all') {
      if (validParams.parentId === 'root' || validParams.parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', validParams.parentId);
      }
    }

    if (validParams.isActive !== undefined && validParams.isActive !== 'all') {
      query = query.eq('is_active', validParams.isActive);
    }

    // Deterministic sorting
    const sortBy = validParams.sortBy || 'sort_order';
    const sortOrder = validParams.sortOrder || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Tie-breaker order
    if (sortBy !== 'sort_order') {
      query = query.order('sort_order', { ascending: true });
    }
    query = query.order('created_at', { ascending: true });
    query = query.order('id', { ascending: true });

    const { data, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách mục menu.');
    }

    return (data as MenuItemWithRelations[]) || [];
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi tải danh sách mục menu.');
  }
}

/**
 * Fetch a single menu item by UUID with joined page details.
 */
export async function getMenuItemById(id: string): Promise<MenuItemWithRelations | null> {
  validateUUID(id, 'ID mục menu');

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, page:pages!page_id(id, title, slug, status)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Không thể tải thông tin mục menu.');
    }

    return (data as MenuItemWithRelations) || null;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi truy vấn mục menu theo ID.');
  }
}

/**
 * Create a new MenuItem.
 * Validates:
 * - Zod input contract
 * - Parent exists and belongs to the exact same menu_id
 * - Anti-mass assignment: explicit allow-list payload
 */
export async function createMenuItem(input: MenuItemCreateInput): Promise<MenuItem> {
  const parseResult = menuItemCreateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu mục menu không hợp lệ.';
    throw new MenuServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  // Verify menu existence
  validateUUID(validated.menu_id, 'ID menu');

  // Hierarchy validation if parent_id is specified
  if (validated.parent_id) {
    validateUUID(validated.parent_id, 'ID mục cha');

    const { data: parentItem, error: parentErr } = await supabase
      .from('menu_items')
      .select('id, menu_id')
      .eq('id', validated.parent_id)
      .maybeSingle();

    if (parentErr) {
      handleDatabaseError(parentErr, 'Lỗi khi kiểm tra mục cha.');
    }

    if (!parentItem) {
      throw new MenuServiceError('Mục cha không tồn tại hoặc đã bị xóa.', 'INTEGRITY_ERROR');
    }

    // Cross-menu parent injection guard
    if (parentItem.menu_id !== validated.menu_id) {
      throw new MenuServiceError(
        'Mục cha phải thuộc cùng một Menu với mục hiện tại (không được chọn mục cha từ menu khác).',
        'INTEGRITY_ERROR'
      );
    }
  }

  try {
    // Explicit allow-list payload mapping
    const payload = {
      menu_id: validated.menu_id,
      parent_id: validated.parent_id ?? null,
      title: validated.title,
      url: validated.url,
      target: validated.target,
      sort_order: validated.sort_order,
      icon: validated.icon ?? null,
      is_active: validated.is_active,
      page_id: validated.page_id ?? null,
    };

    const { data: created, error } = await supabase
      .from('menu_items')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể tạo mục menu mới.');
    }

    return created as MenuItem;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi tạo mục menu mới.');
  }
}

/**
 * Update an existing MenuItem.
 * Enforces:
 * - Self-parent rejection (parent_id !== id)
 * - Same-menu parent validation
 * - Cycle detection (A -> B -> C -> A)
 * - Anti-mass assignment: explicit allow-list payload
 */
export async function updateMenuItem(
  id: string,
  input: MenuItemUpdateInput
): Promise<MenuItem> {
  validateUUID(id, 'ID mục menu');

  const parseResult = menuItemUpdateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật mục menu không hợp lệ.';
    throw new MenuServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  // 1. Fetch current item to inspect current menu_id and hierarchy
  const { data: currentItem, error: currentErr } = await supabase
    .from('menu_items')
    .select('id, menu_id, parent_id')
    .eq('id', id)
    .maybeSingle();

  if (currentErr) {
    handleDatabaseError(currentErr, 'Lỗi khi kiểm tra mục menu hiện tại.');
  }
  if (!currentItem) {
    throw new MenuServiceError('Không tìm thấy mục menu yêu cầu.', 'NOT_FOUND');
  }

  // 2. Hierarchy validation if parent_id is modified
  if (validated.parent_id !== undefined) {
    // Self-parent check
    if (validated.parent_id === id) {
      throw new MenuServiceError(
        'Mục menu không thể tự chọn chính mình làm mục cha.',
        'VALIDATION_ERROR'
      );
    }

    if (validated.parent_id !== null) {
      validateUUID(validated.parent_id, 'ID mục cha');

      // Fetch all items in this menu to perform cross-menu check & cycle detection
      const { data: allMenuItems, error: itemsErr } = await supabase
        .from('menu_items')
        .select('id, menu_id, parent_id')
        .eq('menu_id', currentItem.menu_id);

      if (itemsErr) {
        handleDatabaseError(itemsErr, 'Lỗi khi kiểm tra cấu trúc phân cấp menu.');
      }

      const itemsList = allMenuItems || [];
      const parentInSameMenu = itemsList.find((item) => item.id === validated.parent_id);

      // Parent must belong to the exact same menu
      if (!parentInSameMenu) {
        // Check if parent exists anywhere
        const { data: outsideParent } = await supabase
          .from('menu_items')
          .select('id, menu_id')
          .eq('id', validated.parent_id)
          .maybeSingle();

        if (outsideParent) {
          throw new MenuServiceError(
            'Mục cha phải thuộc cùng một Menu với mục hiện tại (không được chọn mục cha từ menu khác).',
            'INTEGRITY_ERROR'
          );
        } else {
          throw new MenuServiceError('Mục cha không tồn tại hoặc đã bị xóa.', 'INTEGRITY_ERROR');
        }
      }

      // Cycle detection: check if id is an ancestor of the target parent_id
      const parentMap = new Map<string, string | null>();
      for (const it of itemsList) {
        parentMap.set(it.id, it.parent_id);
      }

      let curr: string | null | undefined = validated.parent_id;
      const visited = new Set<string>();

      while (curr) {
        if (curr === id) {
          throw new MenuServiceError(
            'Không thể gán mục con/hậu duệ làm mục cha (phát hiện vòng lặp phân cấp menu).',
            'INTEGRITY_ERROR'
          );
        }
        if (visited.has(curr)) {
          break; // Existing cycle in broken data, stop traversal
        }
        visited.add(curr);
        curr = parentMap.get(curr);
      }
    }
  }

  // 3. Construct explicit allow-listed update payload
  const payload: Record<string, unknown> = {};
  if (validated.parent_id !== undefined) payload.parent_id = validated.parent_id;
  if (validated.title !== undefined) payload.title = validated.title;
  if (validated.url !== undefined) payload.url = validated.url;
  if (validated.target !== undefined) payload.target = validated.target;
  if (validated.sort_order !== undefined) payload.sort_order = validated.sort_order;
  if (validated.icon !== undefined) payload.icon = validated.icon;
  if (validated.is_active !== undefined) payload.is_active = validated.is_active;
  if (validated.page_id !== undefined) payload.page_id = validated.page_id;

  if (Object.keys(payload).length === 0) {
    throw new MenuServiceError('Không có dữ liệu thay đổi nào được gửi lên.', 'VALIDATION_ERROR');
  }

  try {
    const { data: updated, error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật mục menu.');
    }

    return updated as MenuItem;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi cập nhật mục menu.');
  }
}

/**
 * Delete a MenuItem by UUID.
 * Child items are cascaded by PostgreSQL ON DELETE CASCADE.
 * Does NOT delete or mutate associated pages or media.
 */
export async function deleteMenuItem(id: string): Promise<void> {
  validateUUID(id, 'ID mục menu');

  try {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);

    if (error) {
      handleDatabaseError(error, 'Không thể xóa mục menu.');
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi xóa mục menu.');
  }
}

/**
 * Reorder menu items within a menu by assigning sequential sort_order indices.
 */
export async function reorderMenuItems(
  menuId: string,
  orderedIds: string[]
): Promise<void> {
  validateUUID(menuId, 'ID menu');

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new MenuServiceError(
      'Danh sách ID sắp xếp không được rỗng.',
      'VALIDATION_ERROR'
    );
  }

  for (const itemId of orderedIds) {
    validateUUID(itemId, 'ID mục menu sắp xếp');
  }

  try {
    // Perform sequential/batch updates safely
    const updatePromises = orderedIds.map((itemId, index) =>
      supabase
        .from('menu_items')
        .update({ sort_order: index })
        .eq('id', itemId)
        .eq('menu_id', menuId)
    );

    const results = await Promise.all(updatePromises);
    for (const res of results) {
      if (res.error) {
        handleDatabaseError(res.error, 'Không thể cập nhật thứ tự sắp xếp mục menu.');
      }
    }
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi cập nhật thứ tự sắp xếp mục menu.');
  }
}

// ==============================================================================
// 5. MENU TREE BUILDER (Application Layer In-Memory Tree Construction)
// ==============================================================================

/**
 * Builds a deterministic hierarchical menu tree in O(n) memory complexity.
 * Guarantees:
 * - All valid items are preserved.
 * - Deterministic ordering: sort_order ASC, secondary created_at ASC, tertiary id ASC.
 * - Detects and reports broken hierarchy (self-parent, cross-menu parent, orphan, cycle)
 *   as typed INTEGRITY_ERROR.
 */
export async function getMenuTree(menuId: string): Promise<MenuItemTree[]> {
  validateUUID(menuId, 'ID menu');

  try {
    const { data: rawItems, error } = await supabase
      .from('menu_items')
      .select('*, page:pages!page_id(id, title, slug, status)')
      .eq('menu_id', menuId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      handleDatabaseError(error, 'Không thể tải cấu trúc menu.');
    }

    const items = (rawItems as MenuItemWithRelations[]) || [];
    if (items.length === 0) {
      return [];
    }

    // Step 1: Create node map with initialized children array
    const nodesById = new Map<string, MenuItemTree>();
    for (const item of items) {
      nodesById.set(item.id, {
        ...item,
        children: [],
      });
    }

    // Step 2: Assemble tree and validate relationships
    const roots: MenuItemTree[] = [];

    for (const item of items) {
      const node = nodesById.get(item.id)!;

      if (!item.parent_id) {
        roots.push(node);
      } else {
        // Self-parent check
        if (item.parent_id === item.id) {
          throw new MenuServiceError(
            `Phát hiện dữ liệu bất toàn: mục "${item.title}" tự trỏ tới chính mình làm mục cha.`,
            'INTEGRITY_ERROR'
          );
        }

        const parentNode = nodesById.get(item.parent_id);

        // Orphan check: parent_id exists but parent item not found in this menu
        if (!parentNode) {
          throw new MenuServiceError(
            `Phát hiện mục menu mồ côi: mục "${item.title}" trỏ tới mục cha không tồn tại trong menu này.`,
            'INTEGRITY_ERROR'
          );
        }

        // Cycle check: verify item is not an ancestor of parentNode
        let curr: MenuItemTree | undefined = parentNode;
        const visited = new Set<string>();
        while (curr) {
          if (curr.id === item.id) {
            throw new MenuServiceError(
              `Phát hiện vòng lặp phân cấp menu liên quan đến mục "${item.title}".`,
              'INTEGRITY_ERROR'
            );
          }
          if (visited.has(curr.id)) break;
          visited.add(curr.id);
          curr = curr.parent_id ? nodesById.get(curr.parent_id) : undefined;
        }

        parentNode.children.push(node);
      }
    }

    // Step 3: Ensure deterministic sorting on children recursively
    const sortTreeRecursively = (nodes: MenuItemTree[]) => {
      nodes.sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        if (a.created_at !== b.created_at) return a.created_at.localeCompare(b.created_at);
        return a.id.localeCompare(b.id);
      });
      for (const n of nodes) {
        if (n.children.length > 0) {
          sortTreeRecursively(n.children);
        }
      }
    };

    sortTreeRecursively(roots);

    return roots;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi không xác định khi xây dựng cây menu.');
  }
}
