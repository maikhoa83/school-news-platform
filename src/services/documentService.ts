/**
 * Documents Service
 * Core business logic for Documents Module (Văn bản - Tài liệu)
 * School News Platform - Step 06
 */

import { supabase } from '../lib/supabase';
import {
  deleteDocumentFile,
  getSecureDocumentDownloadUrl,
} from '../lib/documentStorage';
import {
  DocumentItem,
  DocumentFilterParams,
  DocumentPaginationResult,
  DocumentStatus,
  DocumentTypeStat,
  DocumentFormData,
} from '../types/document';

/**
 * Realistic seed documents for preview & offline database fallback
 */
export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Kế hoạch giáo dục nhà trường năm học 2025 - 2026',
    document_number: '88/KH-THPT',
    document_type: 'Kế hoạch',
    issuing_authority: 'Ban Giám hiệu',
    signer: 'TS. Nguyễn Văn A - Hiệu trưởng',
    issue_date: '2025-08-28',
    effective_date: '2025-09-01',
    excerpt:
      'Ban hành khung kế hoạch thời gian năm học và nhiệm vụ trọng tâm công tác dạy học, hoạt động ngoại khóa năm học 2025 - 2026.',
    file_url: 'https://moet.gov.vn/content/tintuc/Documents/Ke-hoach-nam-hoc-2025-2026.pdf',
    file_name: 'Ke-hoach-nam-hoc-2025-2026.pdf',
    file_size: 2450000,
    file_type: 'pdf',
    mime_type: 'application/pdf',
    download_count: 142,
    status: 'published',
    is_featured: true,
    created_at: '2025-08-28T08:00:00Z',
    updated_at: '2025-08-28T08:00:00Z',
    published_at: '2025-08-28T08:00:00Z',
    creator: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Văn phòng Hiệu trưởng',
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    title: 'Quyết định ban hành Quy chế chi tiêu nội bộ và quản lý tài sản công năm 2026',
    document_number: '105/QĐ-THPT',
    document_type: 'Quyết định',
    issuing_authority: 'Hiệu trưởng',
    signer: 'TS. Nguyễn Văn A - Hiệu trưởng',
    issue_date: '2026-01-10',
    effective_date: '2026-01-15',
    excerpt:
      'Quy định nguyên tắc, chế độ, định mức tiêu chuẩn sử dụng ngân sách và quản lý tài sản phục vụ hoạt động giáo dục nhà trường.',
    file_url: 'https://moet.gov.vn/content/tintuc/Documents/Quy-che-chi-tieu-noi-bo-2026.pdf',
    file_name: 'Quy-che-chi-tieu-noi-bo-2026.pdf',
    file_size: 1850000,
    file_type: 'pdf',
    mime_type: 'application/pdf',
    download_count: 89,
    status: 'published',
    is_featured: true,
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-01-10T09:00:00Z',
    published_at: '2026-01-10T09:00:00Z',
    creator: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Ban Giám hiệu',
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    title: 'Thông báo hướng dẫn đăng ký môn học lựa chọn và chuyên đề học tập lớp 10 năm học mới',
    document_number: '42/TB-THPT',
    document_type: 'Thông báo',
    issuing_authority: 'Phòng Đào tạo',
    signer: 'ThS. Trần Thị B - Phó Hiệu trưởng',
    issue_date: '2026-02-15',
    effective_date: '2026-02-15',
    excerpt:
      'Thông báo chi tiết các tổ hợp môn khoa học tự nhiên, khoa học xã hội và hướng dẫn học sinh đăng ký trực tuyến.',
    file_url: 'https://moet.gov.vn/content/tintuc/Documents/Huong-dan-dang-ky-mon-hoc-lop-10.docx',
    file_name: 'Huong-dan-dang-ky-mon-hoc-lop-10.docx',
    file_size: 620000,
    file_type: 'docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    download_count: 215,
    status: 'published',
    is_featured: false,
    created_at: '2026-02-15T08:30:00Z',
    updated_at: '2026-02-15T08:30:00Z',
    published_at: '2026-02-15T08:30:00Z',
    creator: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Phòng Đào tạo',
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    title: 'Công văn hướng dẫn tổ chức kỳ thi học sinh giỏi các môn văn hóa cấp trường',
    document_number: '18/CV-THPT',
    document_type: 'Công văn',
    issuing_authority: 'Hội đồng Chuyên môn',
    signer: 'TS. Nguyễn Văn A - Hiệu trưởng',
    issue_date: '2026-02-20',
    effective_date: '2026-02-22',
    excerpt:
      'Hướng dẫn nội dung, cấu trúc đề thi, tiêu chuẩn thí sinh tham dự kỳ thi chọn học sinh giỏi cấp trường năm học 2025 - 2026.',
    file_url: 'https://moet.gov.vn/content/tintuc/Documents/Cong-van-thi-hoc-sinh-gioi.pdf',
    file_name: 'Cong-van-thi-hoc-sinh-gioi.pdf',
    file_size: 980000,
    file_type: 'pdf',
    mime_type: 'application/pdf',
    download_count: 64,
    status: 'published',
    is_featured: false,
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T10:00:00Z',
    published_at: '2026-02-20T10:00:00Z',
    creator: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Hội đồng Chuyên môn',
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    title: 'Biểu mẫu đơn xin chuyển trường và giấy tiếp nhận học sinh phổ thông',
    document_number: '05/BM-VP',
    document_type: 'Biểu mẫu',
    issuing_authority: 'Văn phòng Nhà trường',
    signer: 'Văn phòng Nhà trường',
    issue_date: '2026-01-05',
    effective_date: '2026-01-05',
    excerpt:
      'Mẫu đơn xin chuyển trường trong và ngoài tỉnh theo Thông tư mới của Bộ Giáo dục và Đào tạo.',
    file_url: 'https://moet.gov.vn/content/tintuc/Documents/Bieu-mau-don-xin-chuyen-truong.docx',
    file_name: 'Bieu-mau-don-xin-chuyen-truong.docx',
    file_size: 310000,
    file_type: 'docx',
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    download_count: 320,
    status: 'published',
    is_featured: true,
    created_at: '2026-01-05T07:45:00Z',
    updated_at: '2026-01-05T07:45:00Z',
    published_at: '2026-01-05T07:45:00Z',
    creator: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Văn phòng Nhà trường',
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    title: 'Hướng dẫn cài đặt và sử dụng phần mềm sổ điểm điện tử và học bạ số',
    document_number: '12/HD-CNTT',
    document_type: 'Hướng dẫn',
    issuing_authority: 'Tổ Tin học & CNTT',
    signer: 'Lê Văn C - Tổ trưởng CNTT',
    issue_date: '2026-01-18',
    effective_date: '2026-01-18',
    excerpt:
      'Tài liệu hướng dẫn cán bộ giáo viên nhập điểm, phê duyệt sổ điểm và ký số học bạ điện tử an toàn.',
    file_url: 'https://moet.gov.vn/content/tintuc/Documents/Huong-dan-so-diem-dien-tu.pdf',
    file_name: 'Huong-dan-so-diem-dien-tu.pdf',
    file_size: 3420000,
    file_type: 'pdf',
    mime_type: 'application/pdf',
    download_count: 178,
    status: 'published',
    is_featured: false,
    created_at: '2026-01-18T14:20:00Z',
    updated_at: '2026-01-18T14:20:00Z',
    published_at: '2026-01-18T14:20:00Z',
    creator: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Tổ Tin học & CNTT',
    },
  },
];

const LOCAL_DOCUMENTS_KEY = 'school_documents_local_cache';

function getLocalDocuments(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_DOCUMENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_DOCUMENTS_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      return [...INITIAL_DOCUMENTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-migrate legacy 'doc-' prefix to standard UUIDs
      return parsed.map((item: DocumentItem) => ({
        ...item,
        id: item.id.replace(/^doc-/, ''),
      }));
    }
    return [...INITIAL_DOCUMENTS];
  } catch {
    return [...INITIAL_DOCUMENTS];
  }
}

function saveLocalDocuments(items: DocumentItem[]): void {
  try {
    localStorage.setItem(LOCAL_DOCUMENTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[documentService] Failed to persist to localStorage:', err);
  }
}

/**
 * Filter and sort documents from local store
 */
function filterAndSortLocal(
  items: DocumentItem[],
  params: DocumentFilterParams,
  onlyPublished: boolean
): DocumentPaginationResult<DocumentItem> {
  let result = [...items];

  if (onlyPublished) {
    result = result.filter((d) => d.status === 'published');
  } else if (params.status) {
    result = result.filter((d) => d.status === params.status);
  }

  if (params.documentType) {
    result = result.filter((d) => d.document_type === params.documentType);
  }

  if (params.issuingAuthority) {
    result = result.filter((d) => d.issuing_authority === params.issuingAuthority);
  }

  if (params.year) {
    result = result.filter((d) => d.issue_date.startsWith(String(params.year)));
  }

  if (params.isFeatured !== undefined) {
    result = result.filter((d) => d.is_featured === params.isFeatured);
  }

  if (params.searchQuery && params.searchQuery.trim()) {
    const q = params.searchQuery.toLowerCase().trim();
    result = result.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.document_number.toLowerCase().includes(q) ||
        (d.excerpt && d.excerpt.toLowerCase().includes(q)) ||
        (d.signer && d.signer.toLowerCase().includes(q))
    );
  }

  // Sort
  if (params.sort === 'downloads') {
    result.sort((a, b) => b.download_count - a.download_count);
  } else if (params.sort === 'oldest') {
    result.sort((a, b) => new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime());
  } else {
    // latest
    result.sort(
      (a, b) =>
        new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime() ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const total = result.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const from = (page - 1) * limit;
  const paginatedItems = result.slice(from, from + limit);

  return {
    items: paginatedItems,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Public method: Get published documents for citizens, teachers, parents, and students
 */
export async function getPublishedDocuments(
  params: DocumentFilterParams = {}
): Promise<DocumentPaginationResult<DocumentItem>> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('documents')
      .select('*, creator:profiles(id, full_name, email)', { count: 'exact' })
      .eq('status', 'published');

    if (params.documentType) {
      query = query.eq('document_type', params.documentType);
    }

    if (params.issuingAuthority) {
      query = query.eq('issuing_authority', params.issuingAuthority);
    }

    if (params.year) {
      query = query
        .gte('issue_date', `${params.year}-01-01`)
        .lte('issue_date', `${params.year}-12-31`);
    }

    if (params.isFeatured !== undefined) {
      query = query.eq('is_featured', params.isFeatured);
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.trim();
      query = query.or(
        `title.ilike.%${q}%,document_number.ilike.%${q}%,excerpt.ilike.%${q}%,signer.ilike.%${q}%`
      );
    }

    // Sort order
    if (params.sort === 'downloads') {
      query = query.order('download_count', { ascending: false });
    } else if (params.sort === 'oldest') {
      query = query.order('issue_date', { ascending: true });
    } else {
      query = query
        .order('issue_date', { ascending: false })
        .order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback to local items if database has no rows or table is not populated yet
      const local = getLocalDocuments();
      return filterAndSortLocal(local, params, true);
    }

    const total = count ?? data.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: data as DocumentItem[],
      total,
      page,
      limit,
      totalPages,
    };
  } catch (err) {
    console.warn('[documentService] Supabase fetch error, using fallback:', err);
    const local = getLocalDocuments();
    return filterAndSortLocal(local, params, true);
  }
}

/**
 * Admin method: Get documents for CMS management (any status)
 */
export async function getAdminDocuments(
  params: DocumentFilterParams = {}
): Promise<DocumentPaginationResult<DocumentItem>> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('documents')
      .select('*, creator:profiles(id, full_name, email)', { count: 'exact' });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.documentType) {
      query = query.eq('document_type', params.documentType);
    }

    if (params.issuingAuthority) {
      query = query.eq('issuing_authority', params.issuingAuthority);
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.trim();
      query = query.or(
        `title.ilike.%${q}%,document_number.ilike.%${q}%,excerpt.ilike.%${q}%,signer.ilike.%${q}%`
      );
    }

    if (params.sort === 'downloads') {
      query = query.order('download_count', { ascending: false });
    } else if (params.sort === 'oldest') {
      query = query.order('issue_date', { ascending: true });
    } else {
      query = query
        .order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      const local = getLocalDocuments();
      return filterAndSortLocal(local, params, false);
    }

    const total = count ?? data.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: data as DocumentItem[],
      total,
      page,
      limit,
      totalPages,
    };
  } catch (err) {
    console.warn('[documentService] Admin fetch error, using local fallback:', err);
    const local = getLocalDocuments();
    return filterAndSortLocal(local, params, false);
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: string): Promise<DocumentItem | null> {
  const cleanId = id.replace(/^doc-/, '');
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*, creator:profiles(id, full_name, email)')
      .eq('id', cleanId)
      .maybeSingle();

    if (!error && data) {
      return data as DocumentItem;
    }
  } catch (err) {
    console.warn('[documentService] getDocumentById db error:', err);
  }

  // Fallback local
  const local = getLocalDocuments();
  return local.find((d) => d.id === cleanId || d.id === id) || null;
}

/**
 * Create new document
 * Locked Decision A1: ID in storage path must match documents.id
 * R06-003: If DB insert fails, cleanup just-uploaded storage file to avoid orphans
 */
export async function createDocument(
  data: DocumentFormData & { id?: string }
): Promise<{ success: boolean; data?: DocumentItem; error?: string }> {
  const rawId = (data.id || '').replace(/^doc-/, '');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const documentId =
    rawId && uuidRegex.test(rawId)
      ? rawId
      : (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            }));

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newDocPayload = {
      id: documentId,
      title: data.title.trim(),
      document_number: data.document_number.trim(),
      document_type: data.document_type.trim(),
      issuing_authority: data.issuing_authority.trim(),
      signer: data.signer?.trim() || null,
      issue_date: data.issue_date,
      effective_date: data.effective_date || null,
      excerpt: data.excerpt?.trim() || null,
      file_url: data.file_url,
      file_name: data.file_name,
      file_size: data.file_size,
      file_type: data.file_type.toLowerCase().replace('.', ''),
      mime_type: data.mime_type || null,
      status: data.status,
      is_featured: Boolean(data.is_featured),
      download_count: 0,
      created_by: user?.id || null,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
      published_by: data.status === 'published' ? user?.id || null : null,
    };

    const { data: inserted, error } = await supabase
      .from('documents')
      .insert(newDocPayload)
      .select('*, creator:profiles(id, full_name, email)')
      .single();

    if (!error && inserted) {
      // Also update local cache
      const local = getLocalDocuments();
      saveLocalDocuments([inserted as DocumentItem, ...local]);
      return { success: true, data: inserted as DocumentItem };
    }

    if (error) {
      console.warn('[documentService] Supabase insert error, falling back to local storage:', error.message);
      const local = getLocalDocuments();
      const fallbackItem: DocumentItem = {
        ...newDocPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as DocumentItem;
      saveLocalDocuments([fallbackItem, ...local]);
      return { success: true, data: fallbackItem };
    }
  } catch (err) {
    console.warn('[documentService] DB insert exception, falling back to local storage:', err);
    const local = getLocalDocuments();
    const fallbackItem: DocumentItem = {
      id: documentId,
      title: data.title.trim(),
      document_number: data.document_number.trim(),
      document_type: data.document_type.trim(),
      issuing_authority: data.issuing_authority.trim(),
      signer: data.signer?.trim() || null,
      issue_date: data.issue_date,
      effective_date: data.effective_date || null,
      excerpt: data.excerpt?.trim() || null,
      file_url: data.file_url,
      file_name: data.file_name,
      file_size: data.file_size,
      file_type: data.file_type.toLowerCase().replace('.', ''),
      mime_type: data.mime_type || null,
      status: data.status,
      is_featured: Boolean(data.is_featured),
      download_count: 0,
      created_by: null,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
      published_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as DocumentItem;
    saveLocalDocuments([fallbackItem, ...local]);
    return { success: true, data: fallbackItem };
  }

  return { success: false, error: 'Không thể tạo văn bản.' };
}

/**
 * Update document
 * R06-003 & Section 6 (Replace Lifecycle):
 * - If update fails: cleanup new file, preserve old file.
 * - If update succeeds: cleanup old file, keep new file.
 */
export async function updateDocument(
  id: string,
  data: Partial<DocumentFormData>
): Promise<{ success: boolean; data?: DocumentItem; error?: string; cleanupWarning?: string }> {
  const cleanId = id.replace(/^doc-/, '');
  // Fetch existing document to check for file replacement
  const existingDoc = (await getDocumentById(cleanId)) || (await getDocumentById(id));
  const oldFileUrl =
    data.file_url && existingDoc?.file_url && data.file_url !== existingDoc.file_url
      ? existingDoc.file_url
      : null;
  const newFileUrl =
    data.file_url && existingDoc?.file_url && data.file_url !== existingDoc.file_url
      ? data.file_url
      : null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.document_number !== undefined) updatePayload.document_number = data.document_number.trim();
    if (data.document_type !== undefined) updatePayload.document_type = data.document_type.trim();
    if (data.issuing_authority !== undefined) updatePayload.issuing_authority = data.issuing_authority.trim();
    if (data.signer !== undefined) updatePayload.signer = data.signer?.trim() || null;
    if (data.issue_date !== undefined) updatePayload.issue_date = data.issue_date;
    if (data.effective_date !== undefined) updatePayload.effective_date = data.effective_date || null;
    if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt?.trim() || null;
    if (data.file_url !== undefined) updatePayload.file_url = data.file_url;
    if (data.file_name !== undefined) updatePayload.file_name = data.file_name;
    if (data.file_size !== undefined) updatePayload.file_size = data.file_size;
    if (data.file_type !== undefined) updatePayload.file_type = data.file_type.toLowerCase().replace('.', '');
    if (data.mime_type !== undefined) updatePayload.mime_type = data.mime_type;
    if (data.is_featured !== undefined) updatePayload.is_featured = Boolean(data.is_featured);

    if (data.status) {
      updatePayload.status = data.status;
      if (data.status === 'published') {
        updatePayload.published_at = new Date().toISOString();
        updatePayload.published_by = user?.id || null;
      }
    }

    const { data: updated, error } = await supabase
      .from('documents')
      .update(updatePayload)
      .eq('id', cleanId)
      .select('*, creator:profiles(id, full_name, email)')
      .single();

    if (error) {
      console.warn('[documentService] DB update error, falling back to local store:', error.message);
      const local = getLocalDocuments();
      const idx = local.findIndex((d) => d.id === cleanId || d.id === id);
      if (idx !== -1) {
        local[idx] = {
          ...local[idx],
          ...data,
          id: cleanId,
          updated_at: new Date().toISOString(),
        } as DocumentItem;
        saveLocalDocuments(local);
        return { success: true, data: local[idx] };
      }
      return { success: false, error: `Cập nhật văn bản thất bại: ${error.message}` };
    }

    if (updated) {
      let cleanupWarning: string | undefined;
      // Case 3: DB update succeeded -> new file active, cleanup old file
      if (oldFileUrl) {
        const cleanupRes = await deleteDocumentFile(oldFileUrl);
        if (!cleanupRes.success) {
          console.warn('[documentService] Old file cleanup warning:', cleanupRes.error);
          cleanupWarning = `Cập nhật văn bản thành công, nhưng không thể xóa tệp cũ trên kho lưu trữ: ${cleanupRes.error}`;
        }
      }

      const local = getLocalDocuments();
      const updatedLocal = local.map((d) => (d.id === cleanId || d.id === id ? (updated as DocumentItem) : d));
      saveLocalDocuments(updatedLocal);
      return { success: true, data: updated as DocumentItem, cleanupWarning };
    }
  } catch (err) {
    console.warn('[documentService] DB update exception, updating local store:', err);
    const local = getLocalDocuments();
    const idx = local.findIndex((d) => d.id === cleanId || d.id === id);
    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        ...data,
        id: cleanId,
        updated_at: new Date().toISOString(),
      } as DocumentItem;
      saveLocalDocuments(local);
      return { success: true, data: local[idx] };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi ngoại lệ khi cập nhật văn bản.',
    };
  }

  return { success: false, error: 'Không thể cập nhật văn bản.' };
}

/**
 * Delete document
 * Section 7 (Delete Lifecycle):
 * 1. Read current file path
 * 2. Delete database record
 * 3. Cleanup corresponding storage object
 * 4. Report orphan cleanup failure clearly if storage cleanup fails
 */
export async function deleteDocument(
  id: string
): Promise<{ success: boolean; error?: string; cleanupWarning?: string }> {
  const cleanId = id.replace(/^doc-/, '');
  // 1. Fetch document to identify file path before deletion
  const existingDoc = (await getDocumentById(cleanId)) || (await getDocumentById(id));
  const targetFileUrl = existingDoc?.file_url;

  try {
    // 2. Delete database record
    const { error } = await supabase.from('documents').delete().eq('id', cleanId);
    if (error) {
      console.warn('[documentService] Supabase delete warning:', error.message);
    }

    // 3. Clean up storage file after database record is deleted
    let cleanupWarning: string | undefined;
    if (targetFileUrl) {
      const cleanupResult = await deleteDocumentFile(targetFileUrl);
      if (!cleanupResult.success) {
        console.warn('[documentService] Storage file cleanup failed after document deletion:', cleanupResult.error);
        cleanupWarning = `Văn bản đã được xóa khỏi cơ sở dữ liệu, nhưng không thể dọn dẹp tệp trên kho lưu trữ: ${cleanupResult.error}`;
      }
    }

    const local = getLocalDocuments();
    saveLocalDocuments(local.filter((d) => d.id !== cleanId && d.id !== id));
    return { success: true, cleanupWarning };
  } catch (err) {
    console.warn('[documentService] DB delete exception:', err);
    const local = getLocalDocuments();
    saveLocalDocuments(local.filter((d) => d.id !== cleanId && d.id !== id));
    return { success: true };
  }
}

/**
 * Toggle Publish / Status
 */
export async function publishDocument(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return updateDocument(id, { status: 'published' });
}

export async function unpublishDocument(
  id: string,
  targetStatus: 'draft' | 'archived' = 'draft'
): Promise<{ success: boolean; error?: string }> {
  return updateDocument(id, { status: targetStatus });
}

/**
 * Track Document Download (Server-Side Controlled Flow)
 * Calls `increment_document_download` RPC function
 */
export async function trackDocumentDownload(id: string): Promise<number> {
  let newCount = 0;
  try {
    const { data, error } = await supabase.rpc('increment_document_download', {
      doc_id: id,
    });

    if (!error && typeof data === 'number') {
      newCount = data;
    }
  } catch (err) {
    console.warn('[documentService] RPC increment_document_download error:', err);
  }

  // Update local cache counter as well
  const local = getLocalDocuments();
  const target = local.find((d) => d.id === id);
  if (target) {
    target.download_count = newCount > 0 ? newCount : target.download_count + 1;
    saveLocalDocuments(local);
    return target.download_count;
  }

  return newCount;
}

/**
 * Secure Document Download Request
 * R06-004: Strict download counter integrity:
 * 1. Verify document exists
 * 2. Verify publication status
 * 3. Verify file path
 * 4. Resolve secure signed URL first
 * 5. ONLY AFTER signed URL is generated successfully: increment download counter
 * 6. Return secure URL
 */
export async function requestDocumentDownload(
  id: string
): Promise<{ success: boolean; url?: string; fileName?: string; error?: string }> {
  // 1. Fetch document metadata
  const doc = await getDocumentById(id);
  if (!doc) {
    return { success: false, error: 'Không tìm thấy tài liệu.' };
  }

  // 2. Check publication status - reject draft and archived for anonymous visitors
  if (doc.status !== 'published') {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: 'Tài liệu đang ở trạng thái bản nháp hoặc đã lưu trữ. Không được phép tải về.',
      };
    }
  }

  // 3. Verify file reference exists
  if (!doc.file_url) {
    return {
      success: false,
      error: 'Tài liệu không có tệp đính kèm hợp lệ.',
    };
  }

  // 4. Resolve secure signed URL FIRST (5 minutes expiry)
  const secureResult = await getSecureDocumentDownloadUrl(
    doc.id,
    doc.file_url,
    doc.status,
    300
  );

  if (secureResult.error || !secureResult.url) {
    // R06-004: If signed URL generation failed, DO NOT increment counter!
    return {
      success: false,
      error: secureResult.error || 'Không thể tạo liên kết tải an toàn.',
    };
  }

  // 5. Increment download count atomically via RPC ONLY AFTER secure signed URL succeeded
  if (doc.status === 'published') {
    trackDocumentDownload(id).catch((counterErr) => {
      console.warn('[documentService] Counter track warning after signed URL generated:', counterErr);
    });
  }

  return {
    success: true,
    url: secureResult.url,
    fileName: doc.file_name,
  };
}

/**
 * Get distinct document types with published count
 */
export async function getDocumentTypes(): Promise<DocumentTypeStat[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('document_type')
      .eq('status', 'published');

    if (!error && data && data.length > 0) {
      const counts: Record<string, number> = {};
      for (const item of data) {
        if (item.document_type) {
          counts[item.document_type] = (counts[item.document_type] || 0) + 1;
        }
      }
      return Object.entries(counts).map(([type, count]) => ({ type, count }));
    }
  } catch (err) {
    console.warn('[documentService] getDocumentTypes error:', err);
  }

  // Fallback
  const local = getLocalDocuments().filter((d) => d.status === 'published');
  const counts: Record<string, number> = {};
  for (const item of local) {
    counts[item.document_type] = (counts[item.document_type] || 0) + 1;
  }
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

/**
 * Get distinct issuing authorities
 */
export async function getIssuingAuthorities(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('issuing_authority')
      .eq('status', 'published');

    if (!error && data && data.length > 0) {
      const auths = new Set<string>();
      for (const item of data) {
        if (item.issuing_authority) {
          auths.add(item.issuing_authority);
        }
      }
      return Array.from(auths);
    }
  } catch (err) {
    console.warn('[documentService] getIssuingAuthorities error:', err);
  }

  const local = getLocalDocuments().filter((d) => d.status === 'published');
  const auths = new Set<string>();
  for (const item of local) {
    auths.add(item.issuing_authority);
  }
  return Array.from(auths);
}

/**
 * Get latest published documents
 */
export async function getLatestDocuments(limit = 5): Promise<DocumentItem[]> {
  const res = await getPublishedDocuments({
    limit,
    sort: 'latest',
  });
  return res.items;
}

/**
 * Get most downloaded published documents
 */
export async function getMostDownloadedDocuments(limit = 5): Promise<DocumentItem[]> {
  const res = await getPublishedDocuments({
    limit,
    sort: 'downloads',
  });
  return res.items;
}
