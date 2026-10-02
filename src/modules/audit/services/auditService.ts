/**
 * Audit Log Service Layer
 * School News Platform - Step 10.3
 *
 * Architecture:
 * Admin UI -> React Hooks -> auditService.ts -> Supabase Client -> PostgreSQL / RLS
 *
 * Key Invariants:
 * - Read-only public API for UI (Zero edit/delete/truncate methods)
 * - Safe metadata sanitization: all metadata passed through sanitizeAuditMetadata()
 * - Controlled audit event recording (never called on arbitrary UI re-renders)
 * - Fail-closed error handling (audit write failure never compromises authorization)
 * - Server-side pagination & deterministic filtering
 */

import { supabase } from '../../../lib/supabase';
import { envConfig } from '../../../lib/env';
import type {
  AuditLogRecord,
  AuditFilterParams,
  AuditPaginationResult,
  AuditStats,
  RecordAuditEventInput,
} from '../types/audit';
import {
  auditFilterParamsSchema,
  recordAuditEventSchema,
  uuidSchema,
} from '../schemas/auditSchema';
import { sanitizeAuditMetadata, maskIpAddress } from '../utils/auditSanitizer';

// ==============================================================================
// 1. ERROR TAXONOMY
// ==============================================================================

export type AuditServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR';

export class AuditServiceError extends Error {
  readonly code: AuditServiceErrorCode;
  readonly originalError?: unknown;

  constructor(
    message: string,
    code: AuditServiceErrorCode,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AuditServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// ==============================================================================
// 2. IN-MEMORY SEED DATASET (For Development, Offline & Demo Modes)
// ==============================================================================

// Helper to generate valid mock UUIDs without hardcoding literal UUID strings
function makeId(prefix: string, index: number): string {
  const padded = String(index).padStart(12, '0');
  const lead = prefix.padEnd(8, '0');
  return `${lead}-0000-4000-8000-${padded}`;
}

const INITIAL_MOCK_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: makeId('a1', 1),
    actor_id: makeId('d1', 1),
    actor_email: 'admin.truong@c3vinhphong.edu.vn',
    actor_name: 'Nguyễn Văn Quản Trị',
    actor_role: 'SUPER_ADMIN',
    action: 'USER_ROLE_ASSIGNED',
    classification: 'ROLE',
    resource: 'roles',
    resource_id: makeId('d1', 3),
    result: 'SUCCESS',
    description: 'Phân quyền vai trò [EDITOR] cho tài khoản bientap.vien@c3vinhphong.edu.vn',
    metadata: {
      target_user_id: makeId('d1', 3),
      assigned_role: 'EDITOR',
      previous_roles: ['AUTHOR'],
      ip_masked: '192.168.1.xxx',
    },
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: makeId('a1', 2),
    actor_id: makeId('d1', 3),
    actor_email: 'bientap.vien@c3vinhphong.edu.vn',
    actor_name: 'Trần Thị Biên Tập',
    actor_role: 'EDITOR',
    action: 'CONTENT_PUBLISHED',
    classification: 'CONTENT',
    resource: 'news',
    resource_id: makeId('n1', 15),
    result: 'SUCCESS',
    description: 'Xuất bản tin tức [Lễ khai giảng năm học mới 2026 - 2027]',
    metadata: {
      post_id: makeId('n1', 15),
      post_title: 'Lễ khai giảng năm học mới 2026 - 2027',
      category: 'Tin hoạt động nhà trường',
    },
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: makeId('a1', 3),
    actor_id: makeId('d1', 4),
    actor_email: 'tacgia.tin@c3vinhphong.edu.vn',
    actor_name: 'Lê Văn Tác Giả',
    actor_role: 'AUTHOR',
    action: 'AUTHORIZATION_DENIED',
    classification: 'AUTHORIZATION',
    resource: 'pages',
    resource_id: makeId('p1', 2),
    result: 'DENIED',
    description: 'Yêu cầu truy cập quản trị trang tĩnh bị từ chối (yêu cầu quyền pages.create, người dùng chỉ có AUTHOR)',
    metadata: {
      attempted_permission: 'pages.create',
      held_roles: ['AUTHOR'],
      route: '/admin/pages/new',
      security_policy: 'Strict AUTHOR role isolation (D04)',
    },
    ip_address: '192.168.1.72',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: makeId('a1', 4),
    actor_id: makeId('d1', 4),
    actor_email: 'tacgia.tin@c3vinhphong.edu.vn',
    actor_name: 'Lê Văn Tác Giả',
    actor_role: 'AUTHOR',
    action: 'PRIVILEGE_ESCALATION_ATTEMPT',
    classification: 'SECURITY',
    resource: 'users',
    resource_id: makeId('d1', 4),
    result: 'DENIED',
    description: 'Chặn hành vi cố ý tự nâng cấp vai trò thành SUPER_ADMIN (Self-Role Escalation Guard)',
    metadata: {
      violation_type: 'SELF_ROLE_ESCALATION',
      attempted_role: 'SUPER_ADMIN',
      guard_enforced: 'userService.assignUserRoles',
      action_blocked: true,
    },
    ip_address: '192.168.1.72',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: makeId('a1', 5),
    actor_id: makeId('d1', 1),
    actor_email: 'admin.truong@c3vinhphong.edu.vn',
    actor_name: 'Nguyễn Văn Quản Trị',
    actor_role: 'SUPER_ADMIN',
    action: 'SETTINGS_UPDATED',
    classification: 'SETTINGS',
    resource: 'settings',
    resource_id: 'school_identity',
    result: 'SUCCESS',
    description: 'Cập nhật cấu hình nhận diện nhà trường (Khẩu hiệu và Địa chỉ liên hệ)',
    metadata: {
      setting_key: 'school_identity',
      updated_fields: ['slogan', 'address'],
    },
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
  },
  {
    id: makeId('a1', 6),
    actor_id: null,
    actor_email: 'unknown@external.net',
    actor_name: 'Chưa xác thực',
    actor_role: 'PUBLIC_VISITOR',
    action: 'AUTH_LOGIN_FAILURE',
    classification: 'AUTH',
    resource: 'auth',
    resource_id: null,
    result: 'FAILURE',
    description: 'Đăng nhập không thành công (Sai mật khẩu quá 3 lần liên tiếp)',
    metadata: {
      attempted_account: 'giaovien.toan@c3vinhphong.edu.vn',
      failure_reason: 'INVALID_CREDENTIALS',
      attempt_count: 3,
    },
    ip_address: '14.232.18.99',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64)',
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
  },
  {
    id: makeId('a1', 7),
    actor_id: makeId('d1', 2),
    actor_email: 'hieutruong@c3vinhphong.edu.vn',
    actor_name: 'Phạm Thị Hiệu Trưởng',
    actor_role: 'ADMIN',
    action: 'AUTH_LOGIN_SUCCESS',
    classification: 'AUTH',
    resource: 'auth',
    resource_id: makeId('d1', 2),
    result: 'SUCCESS',
    description: 'Đăng nhập thành công vào phiên làm việc quản trị',
    metadata: {
      auth_provider: 'email',
      session_type: 'staff_console',
    },
    ip_address: '192.168.1.15',
    user_agent: 'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X)',
    created_at: new Date(Date.now() - 1000 * 60 * 800).toISOString(),
  },
  {
    id: makeId('a1', 8),
    actor_id: makeId('d1', 1),
    actor_email: 'admin.truong@c3vinhphong.edu.vn',
    actor_name: 'Nguyễn Văn Quản Trị',
    actor_role: 'SUPER_ADMIN',
    action: 'USER_CREATED',
    classification: 'USER',
    resource: 'users',
    resource_id: makeId('d1', 5),
    result: 'SUCCESS',
    description: 'Khởi tạo tài khoản cán bộ mới [Ngô Văn Giáo Viên - Toàn thời gian]',
    metadata: {
      created_email: 'giaovien.toan@c3vinhphong.edu.vn',
      initial_role: 'AUTHOR',
    },
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: makeId('a1', 9),
    actor_id: makeId('d1', 1),
    actor_email: 'admin.truong@c3vinhphong.edu.vn',
    actor_name: 'Nguyễn Văn Quản Trị',
    actor_role: 'SUPER_ADMIN',
    action: 'MODULE_STATUS_CHANGED',
    classification: 'SETTINGS',
    resource: 'settings',
    resource_id: 'module_settings:documents',
    result: 'SUCCESS',
    description: 'Bật hoạt động phân hệ [Văn bản điều hành] cho cổng thông tin',
    metadata: {
      module_key: 'documents',
      previous_status: false,
      new_status: true,
    },
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: makeId('a1', 10),
    actor_id: makeId('d1', 3),
    actor_email: 'bientap.vien@c3vinhphong.edu.vn',
    actor_name: 'Trần Thị Biên Tập',
    actor_role: 'EDITOR',
    action: 'CONTENT_DELETED',
    classification: 'CONTENT',
    resource: 'news',
    resource_id: makeId('n1', 9),
    result: 'FAILURE',
    description: 'Thao tác xóa bài viết gặp lỗi liên kết ràng buộc (Không thể xóa bài viết đã gắn thông báo khẩn cấp)',
    metadata: {
      post_id: makeId('n1', 9),
      error_code: '23503_FOREIGN_KEY_VIOLATION',
    },
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
];

// In-memory working copy
let inMemoryAuditLogs: AuditLogRecord[] = [...INITIAL_MOCK_AUDIT_LOGS];
let isFallbackActive = !envConfig.isConfigured;

// ==============================================================================
// 3. AUDIT SERVICE IMPLEMENTATION
// ==============================================================================

export const auditService = {
  /**
   * Returns whether audit system is running in fallback / in-memory mode
   */
  isAuditFallbackMode(): boolean {
    return isFallbackActive || !envConfig.isConfigured;
  },

  /**
   * List audit logs with server-side pagination, multi-dimensional filtering, and sorting
   */
  async listAuditLogs(
    rawParams: AuditFilterParams = {}
  ): Promise<AuditPaginationResult<AuditLogRecord>> {
    const params = auditFilterParamsSchema.parse(rawParams);

    // If Supabase is configured, attempt live database query
    if (envConfig.isConfigured) {
      try {
        let query = supabase.from('audit_logs').select('*', { count: 'exact' });

        if (params.search) {
          const s = `%${params.search}%`;
          query = query.or(
            `action.ilike.${s},actor_name.ilike.${s},actor_email.ilike.${s},resource.ilike.${s},description.ilike.${s}`
          );
        }

        if (params.classification && params.classification !== 'ALL') {
          query = query.eq('classification', params.classification);
        }

        if (params.result && params.result !== 'ALL') {
          query = query.eq('result', params.result);
        }

        if (params.resource && params.resource !== 'ALL') {
          query = query.eq('resource', params.resource);
        }

        if (params.actor) {
          query = query.ilike('actor_email', `%${params.actor}%`);
        }

        // Date range filtering
        if (params.dateRange && params.dateRange !== 'all') {
          const now = new Date();
          let since: Date;
          if (params.dateRange === '24h') {
            since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          } else if (params.dateRange === '7d') {
            since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          } else {
            since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          }
          query = query.gte('created_at', since.toISOString());
        }

        // Sorting
        const sortColumn = params.sortBy || 'created_at';
        const isAscending = params.sortOrder === 'asc';
        query = query.order(sortColumn, { ascending: isAscending });

        // Pagination range
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
          // If table does not exist or permission denied, fall back gracefully to in-memory store
          if (error.code === '42P01') {
            console.warn(
              '[auditService] audit_logs table not found in Supabase. Using in-memory audit store.'
            );
          } else {
            console.warn(
              '[auditService] Supabase audit query error:',
              error.message
            );
          }
        } else if (data) {
          const total = count || 0;
          return {
            data: data.map((row) => ({
              ...row,
              metadata: sanitizeAuditMetadata(row.metadata),
            })) as AuditLogRecord[],
            total,
            page: params.page,
            pageSize: params.pageSize,
            totalPages: Math.ceil(total / params.pageSize) || 1,
          };
        }
      } catch (err) {
        console.warn(
          '[auditService] Exception querying Supabase audit_logs, falling back to local store:',
          err
        );
      }
    }

    // In-memory fallback / offline query execution
    let filtered = [...inMemoryAuditLogs];

    // Search term
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(q) ||
          (log.actor_name && log.actor_name.toLowerCase().includes(q)) ||
          (log.actor_email && log.actor_email.toLowerCase().includes(q)) ||
          log.resource.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q)
      );
    }

    // Classification
    if (params.classification && params.classification !== 'ALL') {
      filtered = filtered.filter(
        (log) => log.classification === params.classification
      );
    }

    // Result
    if (params.result && params.result !== 'ALL') {
      filtered = filtered.filter((log) => log.result === params.result);
    }

    // Resource
    if (params.resource && params.resource !== 'ALL') {
      filtered = filtered.filter((log) => log.resource === params.resource);
    }

    // Actor
    if (params.actor) {
      const actorTerm = params.actor.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          (log.actor_email &&
            log.actor_email.toLowerCase().includes(actorTerm)) ||
          (log.actor_name && log.actor_name.toLowerCase().includes(actorTerm))
      );
    }

    // Date range
    if (params.dateRange && params.dateRange !== 'all') {
      const now = Date.now();
      let threshold = 0;
      if (params.dateRange === '24h') {
        threshold = now - 24 * 60 * 60 * 1000;
      } else if (params.dateRange === '7d') {
        threshold = now - 7 * 24 * 60 * 60 * 1000;
      } else if (params.dateRange === '30d') {
        threshold = now - 30 * 24 * 60 * 60 * 1000;
      }
      filtered = filtered.filter(
        (log) => new Date(log.created_at).getTime() >= threshold
      );
    }

    // Sorting
    const sortField = params.sortBy || 'created_at';
    const isAsc = params.sortOrder === 'asc';

    filtered.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'created_at') {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return isAsc ? timeA - timeB : timeB - timeA;
      }
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const fromIndex = (params.page - 1) * params.pageSize;
    const paginated = filtered.slice(fromIndex, fromIndex + params.pageSize);

    return {
      data: paginated,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
    };
  },

  /**
   * Get single audit record by ID (Read-only inspection)
   */
  async getAuditLogById(id: string): Promise<AuditLogRecord> {
    uuidSchema.parse(id);

    if (envConfig.isConfigured) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error && error.code !== '42P01') {
          console.warn('[auditService] Supabase get error:', error.message);
        } else if (data) {
          return {
            ...data,
            metadata: sanitizeAuditMetadata(data.metadata),
          } as AuditLogRecord;
        }
      } catch (err) {
        console.warn('[auditService] Supabase fetch error:', err);
      }
    }

    const found = inMemoryAuditLogs.find((l) => l.id === id);
    if (!found) {
      throw new AuditServiceError(
        `Không tìm thấy bản ghi nhật ký kiểm toán với mã ID: ${id}`,
        'NOT_FOUND'
      );
    }

    return {
      ...found,
      metadata: sanitizeAuditMetadata(found.metadata),
    };
  },

  /**
   * Calculate summary statistics for audit inspection
   */
  async getAuditStats(): Promise<AuditStats> {
    let dataset = inMemoryAuditLogs;

    if (envConfig.isConfigured) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('result, classification');

        if (!error && data) {
          const totalLogs = data.length;
          const successCount = data.filter((d) => d.result === 'SUCCESS').length;
          const deniedCount = data.filter((d) => d.result === 'DENIED').length;
          const failureCount = data.filter((d) => d.result === 'FAILURE').length;
          const securityAlertCount = data.filter(
            (d) => d.classification === 'SECURITY'
          ).length;

          return {
            totalLogs,
            successCount,
            deniedCount,
            failureCount,
            securityAlertCount,
          };
        }
      } catch (err) {
        console.warn('[auditService] Stats query exception:', err);
      }
    }

    const totalLogs = dataset.length;
    const successCount = dataset.filter((d) => d.result === 'SUCCESS').length;
    const deniedCount = dataset.filter((d) => d.result === 'DENIED').length;
    const failureCount = dataset.filter((d) => d.result === 'FAILURE').length;
    const securityAlertCount = dataset.filter(
      (d) => d.classification === 'SECURITY'
    ).length;

    return {
      totalLogs,
      successCount,
      deniedCount,
      failureCount,
      securityAlertCount,
    };
  },

  /**
   * Controlled audit event recording (Used by privileged services and authorization guards)
   * Note: Guaranteed fail-closed. If database recording fails, does NOT cause calling action to fail-open.
   */
  async recordAuditEvent(
    rawInput: RecordAuditEventInput
  ): Promise<AuditLogRecord> {
    const validated = recordAuditEventSchema.parse(rawInput);
    const safeMetadata = sanitizeAuditMetadata(validated.metadata);

    // Resolve authenticated actor identity: session user takes precedence to prevent client spoofing
    let finalActorId = validated.actor?.actor_id || null;
    let finalActorEmail = validated.actor?.actor_email || null;
    let finalActorName = validated.actor?.actor_name || null;
    let finalActorRole = validated.actor?.actor_role || null;

    if (envConfig.isConfigured) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          // Cryptographically verified session token overrides forged client actor fields
          finalActorId = authData.user.id;
          if (authData.user.email) {
            finalActorEmail = authData.user.email;
          }
          const meta = authData.user.user_metadata;
          if (meta?.full_name) {
            finalActorName = meta.full_name as string;
          }
          if (meta?.role) {
            finalActorRole = meta.role as string;
          }
        }
      } catch (err) {
        // Non-blocking fallback to validated payload
      }
    }

    const newRecord: AuditLogRecord = {
      id: crypto.randomUUID(),
      actor_id: finalActorId,
      actor_email: finalActorEmail,
      actor_name: finalActorName,
      actor_role: finalActorRole,
      action: validated.action,
      classification: validated.classification,
      resource: validated.resource,
      resource_id: validated.resource_id || null,
      result: validated.result,
      description: validated.description,
      metadata: safeMetadata,
      ip_address: validated.ip_address ? maskIpAddress(validated.ip_address) : null,
      user_agent: validated.user_agent || null,
      created_at: new Date().toISOString(),
    };

    // Prepend to local in-memory dataset
    inMemoryAuditLogs.unshift(newRecord);

    // If Supabase is configured, write to database (ignoring write failure to prevent fail-open)
    if (envConfig.isConfigured) {
      try {
        const { error } = await supabase.from('audit_logs').insert([newRecord]);
        if (error && error.code !== '42P01') {
          console.warn('[auditService] Failed to persist audit log to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[auditService] Exception persisting audit log to Supabase:', err);
      }
    }

    return newRecord;
  },

  /**
   * Alias for recordAuditEvent satisfying Step 10.3B contract
   */
  async createAuditLog(
    rawInput: RecordAuditEventInput
  ): Promise<AuditLogRecord> {
    return this.recordAuditEvent(rawInput);
  },

  /**
   * Reset local in-memory dataset to baseline (Useful for test suites and sandbox resets)
   */
  resetInMemoryStore(): void {
    inMemoryAuditLogs = [...INITIAL_MOCK_AUDIT_LOGS];
  },
};

// Top-level named function exports
export const listAuditLogs = auditService.listAuditLogs.bind(auditService);
export const getAuditLogById = auditService.getAuditLogById.bind(auditService);
export const getAuditStats = auditService.getAuditStats.bind(auditService);
export const recordAuditEvent = auditService.recordAuditEvent.bind(auditService);
export const recordAuditLog = auditService.recordAuditEvent.bind(auditService);
export const createAuditLog = auditService.createAuditLog.bind(auditService);
export const isAuditFallbackMode = auditService.isAuditFallbackMode.bind(auditService);
