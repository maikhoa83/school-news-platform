/**
 * Audit Log & Authorization Audit Domain Types
 * School News Platform - Step 10.3
 *
 * Core Principles:
 * - Strict type safety for audit classifications, actions, resources, and results
 * - Read-only investigation layer; zero client-side mutation endpoints
 * - Strict segregation of SUCCESS / DENIED / FAILURE
 * - Safe metadata guarantees (Zero secrets, tokens, passwords)
 */

export type AuditClassification =
  | 'AUTH'
  | 'AUTHORIZATION'
  | 'USER'
  | 'ROLE'
  | 'CONTENT'
  | 'SETTINGS'
  | 'SECURITY';

export type AuditResult = 'SUCCESS' | 'DENIED' | 'FAILURE';

export type AuditAction =
  // Authentication events
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  // Authorization events
  | 'AUTHORIZATION_DENIED'
  | 'PERMISSION_CHECK_DENIED'
  // User administration events
  | 'USER_CREATED'
  | 'USER_ROLE_ASSIGNED'
  | 'USER_ROLE_REVOKED'
  | 'USER_PROFILE_UPDATED'
  | 'USER_ACCOUNT_DISABLED'
  | 'USER_DELETED'
  // Role & Permission events
  | 'ROLE_PERMISSIONS_UPDATED'
  // Content lifecycle events
  | 'CONTENT_CREATED'
  | 'CONTENT_UPDATED'
  | 'CONTENT_DELETED'
  | 'CONTENT_PUBLISHED'
  | 'CONTENT_SUBMITTED'
  | 'CONTENT_ARCHIVED'
  // Settings & Configuration events
  | 'SETTINGS_UPDATED'
  | 'MODULE_STATUS_CHANGED'
  | 'SEO_SETTINGS_UPDATED'
  // Security & Guardrail events
  | 'PRIVILEGE_ESCALATION_ATTEMPT'
  | 'SUSPICIOUS_ACCESS_DETECTED';

export type AuditResource =
  | 'news'
  | 'documents'
  | 'announcements'
  | 'media'
  | 'pages'
  | 'homepage'
  | 'users'
  | 'roles'
  | 'settings'
  | 'audit'
  | 'health'
  | 'auth'
  | 'system';

export interface AuditActor {
  actor_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  actor_role: string | null;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  actor_role: string | null;
  action: AuditAction;
  classification: AuditClassification;
  resource: string;
  resource_id: string | null;
  result: AuditResult;
  description: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AuditDateRange = '24h' | '7d' | '30d' | 'all';

export interface AuditFilterParams {
  search?: string;
  classification?: AuditClassification | 'ALL';
  result?: AuditResult | 'ALL';
  resource?: string | 'ALL';
  actor?: string;
  dateRange?: AuditDateRange;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'action' | 'result' | 'resource';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditStats {
  totalLogs: number;
  successCount: number;
  deniedCount: number;
  failureCount: number;
  securityAlertCount: number;
}

export interface RecordAuditEventInput {
  actor?: Partial<AuditActor>;
  action: AuditAction;
  classification: AuditClassification;
  resource: string;
  resource_id?: string | null;
  result: AuditResult;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
}
