/**
 * Users & RBAC Zod Validation Schemas
 * School News Platform - Step 10.1 Users + RBAC Foundation
 *
 * Enforces:
 * - Strict UUID validation for all foreign key lookups
 * - Anti-mass assignment (.strict()) on mutations
 * - Phone and Name sanitization
 */

import { z } from 'zod';
import { USER_LIMITS } from '../config/userConfig';
import { RoleCode } from '../types/user';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z
  .string()
  .trim()
  .regex(UUID_REGEX, 'Định dạng UUID không hợp lệ.');

export const roleCodeSchema = z.enum([
  'PUBLIC_VISITOR',
  'AUTHOR',
  'EDITOR',
  'ADMIN',
  'SUPER_ADMIN',
]);

/**
 * Assign Roles Schema
 * Protects against invalid UUIDs or empty payload
 */
export const assignRolesSchema = z
  .object({
    userId: uuidSchema,
    roleIds: z
      .array(uuidSchema)
      .min(1, 'Người dùng phải có ít nhất một vai trò hợp lệ.')
      .max(5, 'Không thể gán quá 5 vai trò cùng lúc.'),
  })
  .strict();

/**
 * Update User Profile Schema
 * Anti-mass assignment: only permitted profile fields can be modified.
 */
export const updateUserProfileSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(USER_LIMITS.FULL_NAME_MIN, `Họ và tên phải có ít nhất ${USER_LIMITS.FULL_NAME_MIN} ký tự.`)
      .max(USER_LIMITS.FULL_NAME_MAX, `Họ và tên không được vượt quá ${USER_LIMITS.FULL_NAME_MAX} ký tự.`)
      .optional(),
    phone: z
      .string()
      .trim()
      .max(USER_LIMITS.PHONE_MAX, `Số điện thoại không được vượt quá ${USER_LIMITS.PHONE_MAX} ký tự.`)
      .refine(
        (val) => {
          if (!val) return true;
          return /^[0-9+\-\s().]{7,20}$/.test(val);
        },
        { message: 'Số điện thoại không đúng định dạng.' }
      )
      .transform((val) => (val && val.length > 0 ? val : null))
      .nullable()
      .optional(),
    avatar_url: z
      .string()
      .trim()
      .max(USER_LIMITS.AVATAR_URL_MAX, `Đường dẫn ảnh đại diện quá dài.`)
      .refine(
        (val) => {
          if (!val) return true;
          if (val.startsWith('/')) return true;
          try {
            const parsed = new URL(val);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        { message: 'Ảnh đại diện phải là đường dẫn tương đối (bắt đầu bằng /) hoặc URL hợp lệ.' }
      )
      .transform((val) => (val && val.length > 0 ? val : null))
      .nullable()
      .optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

/**
 * Filter Parameters Schema
 */
export const userFilterParamsSchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.union([roleCodeSchema, z.literal('ALL')]).optional().default('ALL'),
  is_active: z.union([z.boolean(), z.literal('ALL')]).optional().default('ALL'),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(USER_LIMITS.MAX_PAGE_SIZE)
    .optional()
    .default(USER_LIMITS.DEFAULT_PAGE_SIZE),
  sortBy: z.enum(['full_name', 'email', 'created_at', 'updated_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
