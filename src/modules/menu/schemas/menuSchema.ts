/**
 * Menu & Menu Items Zod Validation Schemas
 * School News Platform - Step 09.4B
 */

import { z } from 'zod';
import { MENU_LOCATIONS, MENU_ITEM_TARGETS } from '../config/menuConfig';

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MENU_CODE_REGEX = /^[a-zA-Z0-9_-]+$/;

export const menuLocationSchema = z.enum(MENU_LOCATIONS);
export const menuItemTargetSchema = z.enum(MENU_ITEM_TARGETS);

export const menuSortFieldSchema = z.enum([
  'code',
  'name',
  'location',
  'created_at',
  'updated_at',
] as const);

export const menuItemSortFieldSchema = z.enum([
  'sort_order',
  'created_at',
  'title',
] as const);

export const sortOrderSchema = z.enum(['asc', 'desc'] as const);

/**
 * Zod schema for creating a new Menu
 */
export const menuCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Mã menu không được để trống.')
    .max(100, 'Mã menu không được vượt quá 100 ký tự.')
    .regex(
      MENU_CODE_REGEX,
      'Mã menu chỉ được chứa chữ cái, số, dấu gạch ngang (-) hoặc gạch dưới (_).'
    ),
  name: z
    .string()
    .trim()
    .min(1, 'Tên menu không được để trống.')
    .max(255, 'Tên menu không được vượt quá 255 ký tự.'),
  description: z.string().trim().max(500, 'Mô tả không được vượt quá 500 ký tự.').nullable().optional(),
  location: menuLocationSchema.default('header'),
  is_active: z.boolean().default(true),
});

/**
 * Zod schema for updating an existing Menu
 */
export const menuUpdateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Mã menu không được để trống.')
    .max(100, 'Mã menu không được vượt quá 100 ký tự.')
    .regex(
      MENU_CODE_REGEX,
      'Mã menu chỉ được chứa chữ cái, số, dấu gạch ngang (-) hoặc gạch dưới (_).'
    )
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Tên menu không được để trống.')
    .max(255, 'Tên menu không được vượt quá 255 ký tự.')
    .optional(),
  description: z.string().trim().max(500, 'Mô tả không được vượt quá 500 ký tự.').nullable().optional(),
  location: menuLocationSchema.optional(),
  is_active: z.boolean().optional(),
});

/**
 * Zod schema for listing Menus
 */
export const menuListParamsSchema = z.object({
  location: z.union([menuLocationSchema, z.literal('all')]).optional(),
  isActive: z.union([z.boolean(), z.literal('all')]).optional(),
  search: z.string().trim().max(100, 'Từ khóa tìm kiếm tối đa 100 ký tự.').optional(),
  sortBy: menuSortFieldSchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});

/**
 * Zod schema for creating a new MenuItem
 */
export const menuItemCreateSchema = z.object({
  menu_id: z
    .string()
    .regex(UUID_REGEX, 'ID menu phải có định dạng UUID hợp lệ.'),
  parent_id: z
    .string()
    .regex(UUID_REGEX, 'ID mục cha phải có định dạng UUID hợp lệ.')
    .nullable()
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề mục menu không được để trống.')
    .max(255, 'Tiêu đề mục menu không được vượt quá 255 ký tự.'),
  url: z
    .string()
    .trim()
    .min(1, 'Đường dẫn liên kết không được để trống.')
    .max(500, 'Đường dẫn liên kết không được vượt quá 500 ký tự.'),
  target: menuItemTargetSchema.default('_self'),
  sort_order: z.number().int('Thứ tự sắp xếp phải là số nguyên.').default(0),
  icon: z.string().trim().max(100, 'Mã icon không được vượt quá 100 ký tự.').nullable().optional(),
  is_active: z.boolean().default(true),
  page_id: z
    .string()
    .regex(UUID_REGEX, 'ID trang liên kết phải có định dạng UUID hợp lệ.')
    .nullable()
    .optional(),
});

/**
 * Zod schema for updating an existing MenuItem
 */
export const menuItemUpdateSchema = z.object({
  parent_id: z
    .string()
    .regex(UUID_REGEX, 'ID mục cha phải có định dạng UUID hợp lệ.')
    .nullable()
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề mục menu không được để trống.')
    .max(255, 'Tiêu đề mục menu không được vượt quá 255 ký tự.')
    .optional(),
  url: z
    .string()
    .trim()
    .min(1, 'Đường dẫn liên kết không được để trống.')
    .max(500, 'Đường dẫn liên kết không được vượt quá 500 ký tự.')
    .optional(),
  target: menuItemTargetSchema.optional(),
  sort_order: z.number().int('Thứ tự sắp xếp phải là số nguyên.').optional(),
  icon: z.string().trim().max(100, 'Mã icon không được vượt quá 100 ký tự.').nullable().optional(),
  is_active: z.boolean().optional(),
  page_id: z
    .string()
    .regex(UUID_REGEX, 'ID trang liên kết phải có định dạng UUID hợp lệ.')
    .nullable()
    .optional(),
});

/**
 * Zod schema for listing MenuItems
 */
export const menuItemListParamsSchema = z.object({
  menuId: z.string().regex(UUID_REGEX, 'ID menu phải là UUID hợp lệ.').optional(),
  parentId: z.union([z.string().regex(UUID_REGEX), z.literal('root'), z.literal('all'), z.null()]).optional(),
  isActive: z.union([z.boolean(), z.literal('all')]).optional(),
  sortBy: menuItemSortFieldSchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});
