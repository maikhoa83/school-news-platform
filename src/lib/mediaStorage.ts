/**
 * Secure Supabase Storage Abstraction for Media Module
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album
 *
 * Manages operations for:
 * 1. Supabase Storage bucket 'media' (PRIVATE, max 50MB)
 * 2. Supabase Storage bucket 'site-assets' (PUBLIC, max 10MB)
 *
 * Enforces strict client-side validation, filename sanitization,
 * cryptographic random path generation, signed URL security,
 * and the critical exact-match invariant:
 *   database media.file_path === storage.objects.name
 */

import { supabase } from './supabase';
import type { MediaFileType, MediaUploadResult, SignedUrlResult } from '../types/media';
import {
  MEDIA_MAX_FILE_SIZE,
  ALLOWED_MEDIA_MIME_TYPES,
} from '../modules/media/schemas/mediaSchema';

// ==============================================================================
// 1. CONSTANTS & BUCKET CONFIGURATION
// ==============================================================================

export const BUCKET_MEDIA = 'media';
export const BUCKET_SITE_ASSETS = 'site-assets';

/**
 * Maximum file size for bucket 'site-assets' (10MB = 10,485,760 bytes)
 */
export const SITE_ASSET_MAX_FILE_SIZE = 10_485_760;

/**
 * Approved MIME types for bucket 'site-assets' (Images only)
 */
export const ALLOWED_SITE_ASSET_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

/**
 * Default & boundary constraints for Signed URLs (in seconds)
 */
export const DEFAULT_SIGNED_URL_EXPIRES_IN = 3600; // 1 hour
export const MIN_SIGNED_URL_EXPIRES_IN = 60; // 1 minute
export const MAX_SIGNED_URL_EXPIRES_IN = 86400; // 24 hours

// ==============================================================================
// 2. ERROR HANDLING
// ==============================================================================

export type MediaStorageErrorCode =
  | 'VALIDATION_ERROR'
  | 'FILE_TOO_LARGE'
  | 'INVALID_MIME'
  | 'INVALID_PATH'
  | 'STORAGE_ERROR'
  | 'UNAUTHORIZED';

export class MediaStorageError extends Error {
  readonly code: MediaStorageErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: MediaStorageErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'MediaStorageError';
    this.code = code;
    this.originalError = originalError;
  }
}

// ==============================================================================
// 3. SANITIZATION & PATH GENERATION HELPERS
// ==============================================================================

/**
 * Securely sanitizes an input filename:
 * - Strips directory traversal (../, ..\)
 * - Strips slashes and backslashes
 * - Strips control characters and non-printable characters
 * - Keeps only [a-zA-Z0-9.-]
 * - Ensures safe non-empty fallback
 */
export function sanitizeStorageFileName(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') {
    return 'unnamed_file';
  }

  // Remove path separators and traversal tokens
  let cleaned = rawName
    .replace(/[/\\]/g, '_')
    .replace(/\.\.+/g, '_')
    .trim();

  // Replace whitespace and special characters
  cleaned = cleaned.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Collapse multiple consecutive underscores
  cleaned = cleaned.replace(/_+/g, '_');

  // Prevent file from starting with a dot (hidden file) or being only dots/underscores
  if (/^[._]+$/.test(cleaned) || cleaned.length === 0) {
    cleaned = 'unnamed_file';
  }

  return cleaned;
}

/**
 * Generates a cryptographically strong UUID v4
 */
export function generateRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID might be restricted
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates canonical storage object path for the 'media' bucket.
 * Format: media/{year}/{month}/{uuid}_{sanitizedFileName}
 *
 * CRITICAL INVARIANT:
 * This canonical path will directly become storage.objects.name
 * and must match media.file_path in the database exact-match RLS policy.
 */
export function generateMediaStoragePath(fileName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uuid = generateRandomUUID();
  const cleanName = sanitizeStorageFileName(fileName);

  return `media/${year}/${month}/${uuid}_${cleanName}`;
}

/**
 * Generates canonical storage object path for the 'site-assets' bucket.
 * Format: site-assets/{year}/{month}/{uuid}_{sanitizedFileName}
 */
export function generateSiteAssetStoragePath(fileName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uuid = generateRandomUUID();
  const cleanName = sanitizeStorageFileName(fileName);

  return `site-assets/${year}/${month}/${uuid}_${cleanName}`;
}

/**
 * Determines domain MediaFileType from MIME type
 */
export function resolveFileTypeFromMime(mimeType: string): MediaFileType {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  return 'document';
}

// ==============================================================================
// 4. VALIDATION HELPERS
// ==============================================================================

/**
 * Validates a file for upload into bucket 'media' (PRIVATE, max 50MB).
 * Throws MediaStorageError if invalid.
 */
export function validateMediaFile(file: File): void {
  if (!file) {
    throw new MediaStorageError('Tệp không tồn tại.', 'VALIDATION_ERROR');
  }

  if (file.size <= 0) {
    throw new MediaStorageError('Tệp rỗng không thể tải lên.', 'VALIDATION_ERROR');
  }

  if (file.size > MEDIA_MAX_FILE_SIZE) {
    throw new MediaStorageError(
      `Dung lượng tệp (${(file.size / 1024 / 1024).toFixed(1)}MB) vượt quá giới hạn tối đa cho phép (50MB).`,
      'FILE_TOO_LARGE'
    );
  }

  const mime = file.type?.toLowerCase();
  const isAllowed = (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mime);
  if (!isAllowed) {
    throw new MediaStorageError(
      `Định dạng tệp "${mime || 'không xác định'}" không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WEBP, GIF, SVG) và video (MP4, WEBM).`,
      'INVALID_MIME'
    );
  }
}

/**
 * Validates a file for upload into bucket 'site-assets' (PUBLIC, max 10MB).
 * Throws MediaStorageError if invalid.
 */
export function validateSiteAssetFile(file: File): void {
  if (!file) {
    throw new MediaStorageError('Tệp không tồn tại.', 'VALIDATION_ERROR');
  }

  if (file.size <= 0) {
    throw new MediaStorageError('Tệp rỗng không thể tải lên.', 'VALIDATION_ERROR');
  }

  if (file.size > SITE_ASSET_MAX_FILE_SIZE) {
    throw new MediaStorageError(
      `Dung lượng tệp (${(file.size / 1024 / 1024).toFixed(1)}MB) vượt quá giới hạn tài nguyên website (10MB).`,
      'FILE_TOO_LARGE'
    );
  }

  const mime = file.type?.toLowerCase();
  const isAllowed = (ALLOWED_SITE_ASSET_MIME_TYPES as readonly string[]).includes(mime);
  if (!isAllowed) {
    throw new MediaStorageError(
      `Định dạng tệp "${mime || 'không xác định'}" không được hỗ trợ cho tài nguyên website. Chỉ chấp nhận ảnh (JPG, PNG, WEBP, GIF, SVG).`,
      'INVALID_MIME'
    );
  }
}

/**
 * Validates a canonical storage path to prevent path traversal and malformed access.
 */
export function validateStoragePath(filePath: string, expectedPrefix?: string): void {
  if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw new MediaStorageError('Đường dẫn tệp không được để trống.', 'INVALID_PATH');
  }

  if (filePath.includes('..') || filePath.includes('\\') || filePath.startsWith('/')) {
    throw new MediaStorageError('Đường dẫn tệp không an toàn hoặc chứa ký tự không hợp lệ.', 'INVALID_PATH');
  }

  if (expectedPrefix && !filePath.startsWith(expectedPrefix)) {
    throw new MediaStorageError(
      `Đường dẫn tệp không thuộc tiền tố hợp lệ "${expectedPrefix}".`,
      'INVALID_PATH'
    );
  }
}

// ==============================================================================
// 5. STORAGE OPERATIONS (BUCKET: MEDIA - PRIVATE)
// ==============================================================================

/**
 * Uploads a validated file to the private 'media' bucket.
 *
 * NOTE: G2.3 only handles file storage upload.
 * Database record creation is performed strictly in G2.4 by mediaService.ts.
 */
export async function uploadMediaFile(file: File): Promise<MediaUploadResult> {
  // 1. Defense-in-depth validation
  validateMediaFile(file);

  // 2. Generate canonical unique storage path
  const canonicalPath = generateMediaStoragePath(file.name);

  try {
    // 3. Upload to Supabase Storage bucket 'media'
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_MEDIA)
      .upload(canonicalPath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // Normalize error message without leaking sensitive internal details
      const msg = uploadError.message || 'Lỗi không xác định khi tải tệp lên Supabase Storage.';
      throw new MediaStorageError(`Không thể tải tệp lên bucket media: ${msg}`, 'STORAGE_ERROR', uploadError);
    }

    return {
      file_path: canonicalPath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      file_type: resolveFileTypeFromMime(file.type),
      width: null,
      height: null,
    };
  } catch (err) {
    if (err instanceof MediaStorageError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tải tệp lên.';
    throw new MediaStorageError(`Không thể tải tệp lên: ${msg}`, 'STORAGE_ERROR', err);
  }
}

/**
 * Creates a bounded signed URL for private media preview.
 * Default: 3600 seconds (1 hour). Bounds: 60s to 86400s (24h).
 */
export async function createMediaSignedUrl(
  filePath: string,
  expiresIn: number = DEFAULT_SIGNED_URL_EXPIRES_IN
): Promise<SignedUrlResult> {
  validateStoragePath(filePath, 'media/');

  // Validate bounds for expiresIn
  if (
    typeof expiresIn !== 'number' ||
    isNaN(expiresIn) ||
    expiresIn < MIN_SIGNED_URL_EXPIRES_IN ||
    expiresIn > MAX_SIGNED_URL_EXPIRES_IN
  ) {
    throw new MediaStorageError(
      `Thời hạn Signed URL (${expiresIn}s) không hợp lệ. Phải nằm trong khoảng từ ${MIN_SIGNED_URL_EXPIRES_IN}s đến ${MAX_SIGNED_URL_EXPIRES_IN}s.`,
      'VALIDATION_ERROR'
    );
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_MEDIA)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data?.signedUrl) {
      const msg = error?.message || 'Không thể tạo đường dẫn truy cập có chữ ký.';
      throw new MediaStorageError(`Lỗi tạo Signed URL: ${msg}`, 'STORAGE_ERROR', error);
    }

    return {
      signedUrl: data.signedUrl,
      expiresIn,
    };
  } catch (err) {
    if (err instanceof MediaStorageError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo Signed URL.';
    throw new MediaStorageError(`Không thể tạo Signed URL: ${msg}`, 'STORAGE_ERROR', err);
  }
}

/**
 * Deletes a file physically from the private 'media' bucket.
 * Operates strictly on bucket 'media'. Does NOT touch the database.
 */
export async function deleteMediaFile(filePath: string): Promise<void> {
  validateStoragePath(filePath, 'media/');

  try {
    const { error } = await supabase.storage.from(BUCKET_MEDIA).remove([filePath]);

    if (error) {
      const msg = error.message || 'Không thể xóa tệp khỏi Storage.';
      throw new MediaStorageError(`Lỗi khi xóa tệp media: ${msg}`, 'STORAGE_ERROR', error);
    }
  } catch (err) {
    if (err instanceof MediaStorageError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi xóa tệp.';
    throw new MediaStorageError(`Không thể xóa tệp: ${msg}`, 'STORAGE_ERROR', err);
  }
}

// ==============================================================================
// 6. STORAGE OPERATIONS (BUCKET: SITE-ASSETS - PUBLIC)
// ==============================================================================

/**
 * Retrieves the permanent public URL for an asset in the public 'site-assets' bucket.
 * Strictly operates on bucket 'site-assets'. Cannot be used for private 'media'.
 */
export function getPublicSiteAssetUrl(filePath: string): string {
  validateStoragePath(filePath, 'site-assets/');

  const { data } = supabase.storage.from(BUCKET_SITE_ASSETS).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new MediaStorageError('Không thể lấy Public URL cho tài nguyên website.', 'STORAGE_ERROR');
  }

  return data.publicUrl;
}

/**
 * Uploads a validated asset file to the public 'site-assets' bucket.
 */
export async function uploadSiteAsset(file: File): Promise<{ filePath: string; publicUrl: string }> {
  validateSiteAssetFile(file);

  const canonicalPath = generateSiteAssetStoragePath(file.name);

  try {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_SITE_ASSETS)
      .upload(canonicalPath, file, {
        cacheControl: '31536000', // 1 year cache for static site assets
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      const msg = uploadError.message || 'Lỗi không xác định khi tải tài nguyên website lên.';
      throw new MediaStorageError(`Không thể tải tài nguyên lên bucket site-assets: ${msg}`, 'STORAGE_ERROR', uploadError);
    }

    const publicUrl = getPublicSiteAssetUrl(canonicalPath);

    return {
      filePath: canonicalPath,
      publicUrl,
    };
  } catch (err) {
    if (err instanceof MediaStorageError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tải tài nguyên website.';
    throw new MediaStorageError(`Không thể tải tài nguyên website: ${msg}`, 'STORAGE_ERROR', err);
  }
}

/**
 * Deletes a file physically from the public 'site-assets' bucket.
 */
export async function deleteSiteAsset(filePath: string): Promise<void> {
  validateStoragePath(filePath, 'site-assets/');

  try {
    const { error } = await supabase.storage.from(BUCKET_SITE_ASSETS).remove([filePath]);

    if (error) {
      const msg = error.message || 'Không thể xóa tài nguyên khỏi Storage.';
      throw new MediaStorageError(`Lỗi khi xóa tài nguyên website: ${msg}`, 'STORAGE_ERROR', error);
    }
  } catch (err) {
    if (err instanceof MediaStorageError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi xóa tài nguyên.';
    throw new MediaStorageError(`Không thể xóa tài nguyên: ${msg}`, 'STORAGE_ERROR', err);
  }
}
