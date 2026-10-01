/**
 * Documents Module Domain Types & Schemas
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import { z } from 'zod';

export type DocumentStatus = 'draft' | 'published' | 'archived';

export interface DocumentItem {
  id: string;
  title: string;
  document_number: string;
  document_type: string;
  issuing_authority: string;
  signer?: string | null;
  issue_date: string;
  effective_date?: string | null;
  excerpt?: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  mime_type?: string | null;
  download_count: number;
  status: DocumentStatus;
  is_featured: boolean;
  created_by?: string | null;
  published_at?: string | null;
  published_by?: string | null;
  created_at: string;
  updated_at: string;
  // Baseline schema aliases for compatibility (S06-004)
  issuer?: string;
  description?: string | null;
  file_id?: string;
  creator?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
}

export interface DocumentFilterParams {
  documentType?: string;
  issuingAuthority?: string;
  searchQuery?: string;
  status?: DocumentStatus;
  year?: string | number;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'downloads' | 'oldest';
}

export interface DocumentPaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentTypeStat {
  type: string;
  count: number;
}

export const STANDARD_DOCUMENT_TYPES = [
  'Quyết định',
  'Công văn',
  'Thông báo',
  'Kế hoạch',
  'Hướng dẫn',
  'Biểu mẫu',
  'Quy chế - Quy định',
  'Báo cáo',
  'Tờ trình',
  'Nghị quyết',
] as const;

export const STANDARD_ISSUING_AUTHORITIES = [
  'Ban Giám hiệu',
  'Hiệu trưởng',
  'Hội đồng Trường',
  'Hội đồng Sư phạm',
  'Hội đồng Chuyên môn',
  'Công đoàn Trường',
  'Đoàn Thanh niên',
  'Phòng Đào tạo',
  'Văn phòng Nhà trường',
  'Tổ Tin học & CNTT',
  'Sở GD&ĐT',
  'Bộ GD&ĐT',
] as const;

export const documentFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Tên văn bản tối thiểu 3 ký tự')
    .max(500, 'Tên văn bản không vượt quá 500 ký tự'),
  document_number: z
    .string()
    .min(1, 'Vui lòng nhập số ký hiệu')
    .max(100, 'Số ký hiệu không vượt quá 100 ký tự'),
  document_type: z
    .string()
    .min(1, 'Loại văn bản không được để trống'),
  issuing_authority: z
    .string()
    .min(1, 'Cơ quan ban hành không được để trống'),
  signer: z.string().max(200, 'Tên người ký không vượt quá 200 ký tự').optional().nullable(),
  issue_date: z
    .string()
    .min(1, 'Vui lòng chọn ngày ban hành'),
  effective_date: z.string().optional().nullable(),
  excerpt: z.string().max(2000, 'Trích yếu không vượt quá 2000 ký tự').optional().nullable(),
  file_url: z
    .string()
    .min(1, 'Vui lòng tải lên tệp văn bản đính kèm'),
  file_name: z.string().min(1, 'Tên tệp không hợp lệ'),
  file_size: z.number().nonnegative('Dung lượng tệp không hợp lệ'),
  file_type: z.string().min(1, 'Định dạng tệp không hợp lệ'),
  mime_type: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived'] as const),
  is_featured: z.boolean().default(false),
});

export type DocumentFormData = z.infer<typeof documentFormSchema>;
