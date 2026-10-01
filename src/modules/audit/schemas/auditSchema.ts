/**
 * Audit Log Validation Schemas
 * School News Platform - Step 10.3
 *
 * Enforces strict input validation with Zod to prevent mass-assignment and malformed queries.
 */

import { z } from 'zod';
import { AUDIT_LIMITS } from '../config/auditConfig';

export const uuidSchema = z
  .string()
  .uuid({ message: 'Định dạng UUID không hợp lệ.' });

export const auditClassificationSchema = z.enum([
  'AUTH',
  'AUTHORIZATION',
  'USER',
  'ROLE',
  'CONTENT',
  'SETTINGS',
  'SECURITY',
]);

export const auditResultSchema = z.enum(['SUCCESS', 'DENIED', 'FAILURE']);

export const auditActionSchema = z.enum([
  'AUTH_LOGIN_SUCCESS',
  'AUTH_LOGIN_FAILURE',
  'AUTH_LOGOUT',
  'AUTHORIZATION_DENIED',
  'PERMISSION_CHECK_DENIED',
  'USER_CREATED',
  'USER_ROLE_ASSIGNED',
  'USER_ROLE_REVOKED',
  'USER_PROFILE_UPDATED',
  'USER_ACCOUNT_DISABLED',
  'USER_DELETED',
  'ROLE_PERMISSIONS_UPDATED',
  'CONTENT_CREATED',
  'CONTENT_UPDATED',
  'CONTENT_DELETED',
  'CONTENT_PUBLISHED',
  'CONTENT_SUBMITTED',
  'CONTENT_ARCHIVED',
  'SETTINGS_UPDATED',
  'MODULE_STATUS_CHANGED',
  'SEO_SETTINGS_UPDATED',
  'PRIVILEGE_ESCALATION_ATTEMPT',
  'SUSPICIOUS_ACCESS_DETECTED',
]);

export const auditDateRangeSchema = z.enum(['24h', '7d', '30d', 'all']);

export const auditFilterParamsSchema = z
  .object({
    search: z
      .string()
      .max(AUDIT_LIMITS.MAX_SEARCH_LENGTH, 'Từ khóa tìm kiếm tối đa 100 ký tự')
      .optional(),
    classification: z
      .union([auditClassificationSchema, z.literal('ALL')])
      .optional()
      .default('ALL'),
    result: z
      .union([auditResultSchema, z.literal('ALL')])
      .optional()
      .default('ALL'),
    resource: z.string().max(50).optional().default('ALL'),
    actor: z.string().max(100).optional(),
    dateRange: auditDateRangeSchema.optional().default('all'),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    page: z
      .number()
      .int()
      .min(1, 'Trang phải lớn hơn hoặc bằng 1')
      .optional()
      .default(1),
    pageSize: z
      .number()
      .int()
      .min(1, 'Số bản ghi mỗi trang phải ít nhất là 1')
      .max(
        AUDIT_LIMITS.MAX_PAGE_SIZE,
        `Số bản ghi mỗi trang tối đa ${AUDIT_LIMITS.MAX_PAGE_SIZE}`
      )
      .optional()
      .default(AUDIT_LIMITS.DEFAULT_PAGE_SIZE),
    sortBy: z
      .enum(['created_at', 'action', 'result', 'resource'])
      .optional()
      .default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .strict();

export const recordAuditEventSchema = z
  .object({
    actor: z
      .object({
        actor_id: z.string().max(100).nullable().optional(),
        actor_email: z.string().email().nullable().optional(),
        actor_name: z.string().max(100).nullable().optional(),
        actor_role: z.string().max(50).nullable().optional(),
      })
      .strict()
      .optional(),
    action: auditActionSchema,
    classification: auditClassificationSchema,
    resource: z.string().min(1).max(50),
    resource_id: z.string().max(100).nullable().optional(),
    result: auditResultSchema,
    description: z
      .string()
      .min(1, 'Mô tả không được để trống')
      .max(500, 'Mô tả tối đa 500 ký tự'),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
    ip_address: z.string().max(45).nullable().optional(),
    user_agent: z.string().max(255).nullable().optional(),
  })
  .strict();

export const auditLogQuerySchema = auditFilterParamsSchema;
export const recordAuditLogSchema = recordAuditEventSchema;
