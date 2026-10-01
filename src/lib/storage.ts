/**
 * Secure Supabase Storage Helper for News Media & Thumbnails
 * Validates file type, extension, size, and applies proper namespace.
 * School News Platform - Step 05
 */

import { supabase } from './supabase';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadNewsThumbnail(file: File): Promise<UploadResult> {
  // 1. Validate file size
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      success: false,
      error: 'Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 5MB).',
    };
  }

  // 2. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF.',
    };
  }

  // 3. Validate file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      success: false,
      error: 'Phần mở rộng tệp không hợp lệ.',
    };
  }

  // 4. Generate namespaced path
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uniqueId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 11);
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `news/thumbnails/${year}/${month}/${uniqueId}_${cleanFileName}`;

  try {
    // Attempt upload to Supabase Storage bucket 'media'
    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadErr) {
      console.warn('[storage] Storage upload error:', uploadErr.message);
      return {
        success: false,
        error: `Không thể tải ảnh lên Storage: ${uploadErr.message || 'Vui lòng kiểm tra cấu hình bucket media hoặc thử lại.'}`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      return {
        success: false,
        error: 'Không tìm thấy đường dẫn công khai (Public URL) cho tệp ảnh sau khi tải lên.',
      };
    }

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err) {
    console.warn('[storage] Exception during storage upload:', err);
    return {
      success: false,
      error:
        err instanceof Error
          ? `Lỗi tải ảnh: ${err.message}`
          : 'Không thể tải ảnh lên Storage. Vui lòng kiểm tra cấu hình bucket media hoặc thử lại.',
    };
  }
}
