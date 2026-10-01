/**
 * Media Module Validation Schemas
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album
 */

import { z } from 'zod';

// ==============================================================================
// 1. CONSTANTS & ALLOWED SPECIFICATIONS
// ==============================================================================

/**
 * Maximum media file size allowed in storage & database (50MB = 52,428,800 bytes).
 */
export const MEDIA_MAX_FILE_SIZE = 52_428_800;

/**
 * Approved MIME types strictly verified against G1 Storage bucket configuration.
 */
export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
] as const;

export const mediaMimeTypeSchema = z.enum(ALLOWED_MEDIA_MIME_TYPES);

/**
 * Slug regex pattern: lowercase alphanumeric and hyphens only (no spaces, no uppercase, no special characters).
 */
export const SLUG_REGEX = /^[a-z0-9-]+$/;

// ==============================================================================
// 2. MEDIA FOLDER SCHEMA
// ==============================================================================

/**
 * Schema for creating or updating media folders.
 * Corresponds to CreateMediaFolderInput / UpdateMediaFolderInput.
 */
export const mediaFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên thư mục không được để trống')
    .max(255, 'Tên thư mục không được vượt quá 255 ký tự'),
  slug: z
    .string()
    .trim()
    .min(1, 'Đường dẫn định danh (slug) không được để trống')
    .max(255, 'Đường dẫn định danh không được vượt quá 255 ký tự')
    .regex(
      SLUG_REGEX,
      'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang (không chứa khoảng trắng hay ký tự đặc biệt)'
    )
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Mô tả không được vượt quá 1.000 ký tự')
    .nullable()
    .optional(),
  parent_id: z
    .string()
    .uuid('Mã thư mục cha không hợp lệ (phải là UUID)')
    .nullable()
    .optional(),
});

export type MediaFolderFormValues = z.infer<typeof mediaFolderSchema>;

// ==============================================================================
// 3. MEDIA UPLOAD METADATA SCHEMA
// ==============================================================================

/**
 * Schema for validating metadata supplied during media upload.
 * Validates text properties, destination folder, and publication status.
 */
export const mediaUploadMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề tệp không được để trống')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự'),
  alt_text: z
    .string()
    .trim()
    .max(255, 'Văn bản thay thế (alt_text) không được vượt quá 255 ký tự')
    .nullable()
    .optional(),
  caption: z
    .string()
    .trim()
    .max(1000, 'Chú thích không được vượt quá 1.000 ký tự')
    .nullable()
    .optional(),
  folder_id: z
    .string()
    .uuid('Mã thư mục không hợp lệ (phải là UUID)')
    .nullable()
    .optional(),
  is_published: z.boolean().default(true),
});

export type MediaUploadMetadataValues = z.infer<typeof mediaUploadMetadataSchema>;

// ==============================================================================
// 4. MEDIA UPDATE SCHEMA
// ==============================================================================

/**
 * Schema for updating existing media metadata and publication status.
 * Corresponds to UpdateMediaInput in src/types/media.ts.
 * Immutable fields (id, created_by, file_path, file_size, etc.) are strictly excluded.
 */
export const mediaUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề tệp không được để trống')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự')
    .optional(),
  alt_text: z
    .string()
    .trim()
    .max(255, 'Văn bản thay thế không được vượt quá 255 ký tự')
    .nullable()
    .optional(),
  caption: z
    .string()
    .trim()
    .max(1000, 'Chú thích không được vượt quá 1.000 ký tự')
    .nullable()
    .optional(),
  folder_id: z
    .string()
    .uuid('Mã thư mục không hợp lệ (phải là UUID)')
    .nullable()
    .optional(),
  is_published: z.boolean().optional(),
});

export type MediaUpdateValues = z.infer<typeof mediaUpdateSchema>;

// ==============================================================================
// 5. ALBUM FORM SCHEMA
// ==============================================================================

/**
 * Schema for creating or updating albums.
 * Corresponds to CreateAlbumInput / UpdateAlbumInput in src/types/media.ts.
 */
export const albumFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề album không được để trống')
    .max(255, 'Tiêu đề album không được vượt quá 255 ký tự'),
  slug: z
    .string()
    .trim()
    .min(1, 'Đường dẫn định danh (slug) không được để trống')
    .max(255, 'Đường dẫn định danh không được vượt quá 255 ký tự')
    .regex(
      SLUG_REGEX,
      'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang (không chứa khoảng trắng hay ký tự đặc biệt)'
    )
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, 'Mô tả album không được vượt quá 2.000 ký tự')
    .nullable()
    .optional(),
  cover_media_id: z
    .string()
    .uuid('Mã ảnh bìa không hợp lệ (phải là UUID)')
    .nullable()
    .optional(),
  is_published: z.boolean().default(false),
  published_at: z.string().datetime().nullable().optional(),
});

export type AlbumFormValues = z.infer<typeof albumFormSchema>;

// ==============================================================================
// 6. ALBUM ITEM ORDER SCHEMA
// ==============================================================================

/**
 * Schema for validating the reordering of media items inside an album.
 * Enforces non-empty UUID list without duplicate elements.
 */
export const albumItemOrderSchema = z.object({
  orderedItemIds: z
    .array(z.string().uuid('Mỗi mã mục trong danh sách phải là UUID hợp lệ'))
    .min(1, 'Danh sách sắp xếp phải có ít nhất 1 phần tử')
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Danh sách sắp xếp không được chứa các mã mục trùng lặp'
    ),
});

export type AlbumItemOrderValues = z.infer<typeof albumItemOrderSchema>;

// ==============================================================================
// 7. FILE SIZE & MIME VALIDATION HELPER (OPTIONAL FIELD-LEVEL VALIDATOR)
// ==============================================================================

export const mediaFileSizeSchema = z
  .number()
  .int('Dung lượng tệp phải là số nguyên')
  .positive('Dung lượng tệp phải lớn hơn 0')
  .max(
    MEDIA_MAX_FILE_SIZE,
    'Dung lượng tệp vượt quá giới hạn tối đa cho phép (50MB = 52.428.800 bytes)'
  );
