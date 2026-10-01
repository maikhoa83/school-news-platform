/**
 * Announcements Module Service
 * Core business logic and database access for Announcements (Thông báo điều hành)
 * School News Platform - Step 07
 *
 * Directives strictly enforced:
 * - Supabase is the single source of truth for production data
 * - Fail-closed mutations (no false success on errors)
 * - Authenticated user identity via auth context & database triggers
 * - Hardened PostgREST search filter against malformed query injections
 * - Pure data paths: real Supabase data or controlled error states with zero fake/seed fallbacks
 */

import { supabase } from '../lib/supabase';
import { envConfig } from '../lib/env';
import {
  AnnouncementItem,
  AnnouncementFilterParams,
  AnnouncementPaginationResult,
  AnnouncementFormData,
  AnnouncementPriority,
} from '../types/announcement';
import { announcementFormSchema } from '../modules/announcements/schemas/announcementSchema';

/**
 * Sanitize PostgREST query input to prevent malformed expression errors.
 * Removes characters that break PostgREST or filter syntax: () , " \ % :
 */
function sanitizePostgrestFilter(term: string): string {
  if (!term || typeof term !== 'string') return '';
  return term.replace(/[(),"\\%:]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Priority weighting for sorting (urgent > important > normal)
 */
function getPriorityWeight(priority: AnnouncementPriority): number {
  switch (priority) {
    case 'urgent':
      return 3;
    case 'important':
      return 2;
    case 'normal':
    default:
      return 1;
  }
}

// ==============================================================================
// PUBLIC SERVICE METHODS
// ==============================================================================

/**
 * Fetch publicly visible announcements adhering strictly to:
 * - status = 'published'
 * - published_at <= NOW()
 * - expires_at IS NULL OR expires_at > NOW()
 * - Ordered by is_pinned DESC, priority (urgent -> important -> normal), published_at DESC
 */
export async function getPublicAnnouncements(
  params: AnnouncementFilterParams = {}
): Promise<AnnouncementPaginationResult<AnnouncementItem>> {
  if (!envConfig.isConfigured) {
    throw new Error('Hệ thống chưa cấu hình kết nối CSDL Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }

  const nowIso = new Date().toISOString();
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('announcements')
    .select('*, creator:profiles!created_by(id, full_name)', { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

  if (params.priority && params.priority !== 'all') {
    query = query.eq('priority', params.priority);
  }

  if (params.searchQuery && params.searchQuery.trim()) {
    const safeQ = sanitizePostgrestFilter(params.searchQuery);
    if (safeQ) {
      const truncated = safeQ.slice(0, 100);
      query = query.or(`title.ilike.%${truncated}%,content.ilike.%${truncated}%`);
    }
  }

  // Supabase primary ordering: pinned first, then published_at DESC
  query = query
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.warn('[announcementService] Error fetching public announcements:', error.message || error);
    throw new Error(error.message || 'Không thể tải danh sách thông báo điều hành từ máy chủ');
  }

  const items = (data as AnnouncementItem[]) || [];

  // In-memory sort tie-breaker to guarantee exact priority weighting on real data:
  // 1. is_pinned DESC
  // 2. priority weight (urgent -> important -> normal)
  // 3. published_at DESC
  items.sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    const pA = getPriorityWeight(a.priority);
    const pB = getPriorityWeight(b.priority);
    if (pA !== pB) {
      return pB - pA;
    }
    return (
      new Date(b.published_at || b.created_at).getTime() -
      new Date(a.published_at || a.created_at).getTime()
    );
  });

  const total = count ?? items.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

// ==============================================================================
// ADMIN SERVICE METHODS
// ==============================================================================

/**
 * Fetch announcements for Admin CMS with comprehensive filtering,
 * derived status, pagination, and sorting.
 */
export async function getAdminAnnouncements(
  params: AnnouncementFilterParams = {}
): Promise<AnnouncementPaginationResult<AnnouncementItem>> {
  if (!envConfig.isConfigured) {
    throw new Error('Hệ thống chưa cấu hình kết nối CSDL Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('announcements')
    .select('*, creator:profiles!created_by(id, full_name, email)', { count: 'exact' });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params.priority && params.priority !== 'all') {
    query = query.eq('priority', params.priority);
  }

  if (params.isPinned !== undefined) {
    query = query.eq('is_pinned', params.isPinned);
  }

  if (params.searchQuery && params.searchQuery.trim()) {
    const safeQ = sanitizePostgrestFilter(params.searchQuery);
    if (safeQ) {
      const truncated = safeQ.slice(0, 100);
      query = query.or(`title.ilike.%${truncated}%,content.ilike.%${truncated}%`);
    }
  }

  // Handle derived status tabs directly at query level
  const nowIso = new Date().toISOString();
  if (params.derivedStatus && params.derivedStatus !== 'all') {
    if (params.derivedStatus === 'draft') {
      query = query.eq('status', 'draft');
    } else if (params.derivedStatus === 'published') {
      query = query
        .eq('status', 'published')
        .lte('published_at', nowIso)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
    } else if (params.derivedStatus === 'scheduled') {
      query = query.eq('status', 'published').gt('published_at', nowIso);
    } else if (params.derivedStatus === 'expired') {
      query = query.eq('status', 'published').lte('expires_at', nowIso);
    }
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.warn('[announcementService] Error fetching admin announcements from DB:', error.message || error);
    throw new Error(error.message || 'Không thể tải danh sách thông báo quản trị từ máy chủ');
  }

  const items = (data as AnnouncementItem[]) || [];
  const total = count ?? items.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get single announcement by ID
 */
export async function getAnnouncementById(id: string): Promise<AnnouncementItem | null> {
  if (!envConfig.isConfigured) {
    throw new Error('Hệ thống chưa cấu hình kết nối CSDL Supabase.');
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*, creator:profiles!created_by(id, full_name, email)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.warn('[announcementService] Error fetching announcement by id:', error.message || error);
    throw new Error(error.message || 'Lỗi khi tải thông tin thông báo từ máy chủ');
  }

  return (data as AnnouncementItem) || null;
}

/**
 * Create announcement
 * Server trigger automatically forces created_by and published_by to auth.uid()
 */
export async function createAnnouncement(
  formData: AnnouncementFormData
): Promise<{ success: boolean; data?: AnnouncementItem; error?: string }> {
  // Validate schema
  const parseResult = announcementFormSchema.safeParse(formData);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
    return { success: false, error: firstError };
  }

  if (!envConfig.isConfigured) {
    return {
      success: false,
      error: 'Chưa cấu hình Supabase CSDL (Vui lòng thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY để lưu trữ đám mây).',
    };
  }

  // Verify authenticated session
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { success: false, error: 'Bạn cần đăng nhập để tạo thông báo điều hành.' };
  }

  const now = new Date();

  // Determine status & published_at
  let status: 'draft' | 'published' = 'draft';
  let published_at: string | null = null;

  if (formData.publish_mode === 'publish_now') {
    status = 'published';
    published_at = now.toISOString();
  } else if (formData.publish_mode === 'schedule') {
    status = 'published';
    published_at = formData.published_at ? new Date(formData.published_at).toISOString() : now.toISOString();
  }

  // Determine expires_at
  const expires_at = formData.has_expiry && formData.expires_at
    ? new Date(formData.expires_at).toISOString()
    : null;

  const insertPayload = {
    title: formData.title.trim(),
    content: formData.content.trim(),
    priority: formData.priority,
    is_pinned: Boolean(formData.is_pinned),
    status,
    published_at,
    expires_at,
    created_by: user.id,
    published_by: status === 'published' ? user.id : null,
  };

  const { data, error } = await supabase
    .from('announcements')
    .insert(insertPayload)
    .select('*, creator:profiles!created_by(id, full_name, email)')
    .single();

  if (error || !data) {
    console.warn('[announcementService] Supabase insert error:', error?.message);
    return {
      success: false,
      error: error?.message || 'Không thể tạo mới thông báo. Vui lòng kiểm tra quyền hạn.',
    };
  }

  return { success: true, data: data as AnnouncementItem };
}

/**
 * Update announcement
 * Fails closed on database rejection
 */
export async function updateAnnouncement(
  id: string,
  formData: AnnouncementFormData
): Promise<{ success: boolean; data?: AnnouncementItem; error?: string }> {
  const parseResult = announcementFormSchema.safeParse(formData);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
    return { success: false, error: firstError };
  }

  if (!envConfig.isConfigured) {
    return {
      success: false,
      error: 'Chưa cấu hình Supabase CSDL (Vui lòng thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY để lưu trữ đám mây).',
    };
  }

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { success: false, error: 'Bạn cần đăng nhập để cập nhật thông báo.' };
  }

  const now = new Date();

  // Determine status & published_at
  let status: 'draft' | 'published' = 'draft';
  let published_at: string | null = null;

  if (formData.publish_mode === 'publish_now') {
    status = 'published';
    published_at = formData.published_at ? new Date(formData.published_at).toISOString() : now.toISOString();
  } else if (formData.publish_mode === 'schedule') {
    status = 'published';
    published_at = formData.published_at ? new Date(formData.published_at).toISOString() : now.toISOString();
  }

  const expires_at = formData.has_expiry && formData.expires_at
    ? new Date(formData.expires_at).toISOString()
    : null;

  const updatePayload: Record<string, unknown> = {
    title: formData.title.trim(),
    content: formData.content.trim(),
    priority: formData.priority,
    is_pinned: Boolean(formData.is_pinned),
    status,
    published_at,
    expires_at,
    updated_at: now.toISOString(),
  };

  if (status === 'published') {
    updatePayload.published_by = user.id;
  } else {
    updatePayload.published_by = null;
  }

  const { data, error } = await supabase
    .from('announcements')
    .update(updatePayload)
    .eq('id', id)
    .select('*, creator:profiles!created_by(id, full_name, email)')
    .single();

  if (error || !data) {
    console.warn('[announcementService] Supabase update error:', error?.message);
    return {
      success: false,
      error: error?.message || 'Không thể cập nhật thông báo. Vui lòng kiểm tra quyền hạn.',
    };
  }

  return { success: true, data: data as AnnouncementItem };
}

/**
 * Toggle announcement pin state
 */
export async function togglePinAnnouncement(
  id: string,
  is_pinned: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!envConfig.isConfigured) {
    return {
      success: false,
      error: 'Chưa cấu hình Supabase CSDL để cập nhật ghim thông báo.',
    };
  }

  const { error } = await supabase
    .from('announcements')
    .update({ is_pinned, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.warn('[announcementService] Supabase pin error:', error?.message);
    return { success: false, error: error.message || 'Không thể thay đổi trạng thái ghim.' };
  }

  return { success: true };
}

/**
 * Delete announcement
 */
export async function deleteAnnouncement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!envConfig.isConfigured) {
    return {
      success: false,
      error: 'Chưa cấu hình Supabase CSDL để xóa thông báo.',
    };
  }

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.warn('[announcementService] Supabase delete error:', error?.message);
    return { success: false, error: error.message || 'Không thể xóa thông báo điều hành.' };
  }

  return { success: true };
}

/**
 * Quick publish action
 */
export async function publishAnnouncement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!envConfig.isConfigured) {
    return {
      success: false,
      error: 'Chưa cấu hình Supabase CSDL để xuất bản thông báo.',
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('announcements')
    .update({
      status: 'published',
      published_at: now,
      published_by: user?.id || null,
      updated_at: now,
    })
    .eq('id', id);

  if (error) {
    console.warn('[announcementService] Supabase publish error:', error?.message);
    return { success: false, error: error.message || 'Không thể xuất bản thông báo.' };
  }

  return { success: true };
}

/**
 * Quick unpublish / revert to draft action
 */
export async function unpublishAnnouncement(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!envConfig.isConfigured) {
    return {
      success: false,
      error: 'Chưa cấu hình Supabase CSDL để chuyển về bản nháp.',
    };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('announcements')
    .update({
      status: 'draft',
      published_by: null,
      updated_at: now,
    })
    .eq('id', id);

  if (error) {
    console.warn('[announcementService] Supabase unpublish error:', error?.message);
    return { success: false, error: error.message || 'Không thể chuyển thông báo về bản nháp.' };
  }

  return { success: true };
}

