/**
 * Pages Module Zod Validation Schemas
 * School News Platform - Step 09.4A
 */

import { z } from 'zod';

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PAGE_STATUSES = ['draft', 'published', 'archived'] as const;
export const pageStatusSchema = z.enum(PAGE_STATUSES);

export const PAGE_TEMPLATES = ['default', 'fullwidth', 'sidebar', 'contact'] as const;
export const pageTemplateSchema = z.enum(PAGE_TEMPLATES);

export const PAGE_SORT_FIELDS = [
  'sort_order',
  'published_at',
  'created_at',
  'title',
  'updated_at',
] as const;
export const pageSortFieldSchema = z.enum(PAGE_SORT_FIELDS);

export const pageSortOrderSchema = z.enum(['asc', 'desc'] as const);

/**
 * Zod schema for creating a new Page
 */
export const pageCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề trang không được để trống.')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Đường dẫn định danh (slug) không được để trống.')
    .max(100, 'Đường dẫn định danh không được vượt quá 100 ký tự.')
    .regex(
      SLUG_REGEX,
      'Đường dẫn định danh (slug) chỉ được chứa chữ thường không dấu (a-z), chữ số (0-9) và dấu gạch ngang (-), không có dấu gạch ở đầu hoặc cuối.'
    ),
  content: z.string().default(''),
  excerpt: z.string().trim().max(500, 'Tóm tắt không được vượt quá 500 ký tự.').nullable().optional(),
  featured_image: z.string().url('Đường dẫn ảnh đại diện không hợp lệ.').nullable().optional().or(z.literal('')),
  parent_id: z
    .string()
    .regex(UUID_REGEX, 'ID trang cha phải có định dạng UUID v4 hợp lệ.')
    .nullable()
    .optional(),
  template: pageTemplateSchema.default('default'),
  status: pageStatusSchema.default('draft'),
  sort_order: z.number().int('Thứ tự sắp xếp phải là số nguyên.').default(0),
  published_at: z
    .string()
    .datetime()
    .nullable()
    .optional(),
  meta_title: z.string().trim().max(255, 'Meta title không vượt quá 255 ký tự.').nullable().optional(),
  meta_description: z
    .string()
    .trim()
    .max(500, 'Meta description không vượt quá 500 ký tự.')
    .nullable()
    .optional(),
  meta_keywords: z
    .string()
    .trim()
    .max(500, 'Meta keywords không vượt quá 500 ký tự.')
    .nullable()
    .optional(),
  og_image: z.string().url('Đường dẫn ảnh OpenGraph không hợp lệ.').nullable().optional().or(z.literal('')),
  canonical_url: z.string().url('Đường dẫn Canonical URL không hợp lệ.').nullable().optional().or(z.literal('')),
  no_index: z.boolean().default(false),
});

/**
 * Zod schema for updating an existing Page
 */
export const pageUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề trang không được để trống.')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự.')
    .optional(),
  slug: z
    .string()
    .trim()
    .min(1, 'Đường dẫn định danh (slug) không được để trống.')
    .max(100, 'Đường dẫn định danh không được vượt quá 100 ký tự.')
    .regex(
      SLUG_REGEX,
      'Đường dẫn định danh (slug) chỉ được chứa chữ thường không dấu (a-z), chữ số (0-9) và dấu gạch ngang (-).'
    )
    .optional(),
  content: z.string().optional(),
  excerpt: z.string().trim().max(500, 'Tóm tắt không được vượt quá 500 ký tự.').nullable().optional(),
  featured_image: z.string().url('Đường dẫn ảnh đại diện không hợp lệ.').nullable().optional().or(z.literal('')).or(z.null()),
  parent_id: z
    .string()
    .regex(UUID_REGEX, 'ID trang cha phải có định dạng UUID v4 hợp lệ.')
    .nullable()
    .optional(),
  template: pageTemplateSchema.optional(),
  status: pageStatusSchema.optional(),
  sort_order: z.number().int('Thứ tự sắp xếp phải là số nguyên.').optional(),
  published_at: z
    .string()
    .datetime()
    .nullable()
    .optional(),
  meta_title: z.string().trim().max(255, 'Meta title không vượt quá 255 ký tự.').nullable().optional(),
  meta_description: z
    .string()
    .trim()
    .max(500, 'Meta description không vượt quá 500 ký tự.')
    .nullable()
    .optional(),
  meta_keywords: z
    .string()
    .trim()
    .max(500, 'Meta keywords không vượt quá 500 ký tự.')
    .nullable()
    .optional(),
  og_image: z.string().url('Đường dẫn ảnh OpenGraph không hợp lệ.').nullable().optional().or(z.literal('')).or(z.null()),
  canonical_url: z.string().url('Đường dẫn Canonical URL không hợp lệ.').nullable().optional().or(z.literal('')).or(z.null()),
  no_index: z.boolean().optional(),
});

/**
 * Zod schema for list/filter parameters
 */
export const pageListParamsSchema = z.object({
  search: z.string().trim().max(100, 'Từ khóa tìm kiếm tối đa 100 ký tự.').optional(),
  status: z.union([pageStatusSchema, z.literal('all')]).optional(),
  template: z.union([pageTemplateSchema, z.literal('all')]).optional(),
  parentId: z.union([z.string().regex(UUID_REGEX), z.literal('root'), z.literal('all'), z.null()]).optional(),
  page: z.number().int().min(1, 'Trang phải lớn hơn hoặc bằng 1.').optional(),
  limit: z.number().int().min(1).max(100, 'Số lượng tối đa mỗi trang là 100.').optional(),
  sortBy: pageSortFieldSchema.optional(),
  sortOrder: pageSortOrderSchema.optional(),
});
