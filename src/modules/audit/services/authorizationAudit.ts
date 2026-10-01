/**
 * Authorization Audit Integration Helper
 * School News Platform - Step 10.3
 *
 * Provides controlled, deliberate logging for security-significant authorization decisions.
 * CRITICAL INVARIANT:
 * - MUST NOT be invoked on every render / can() evaluation.
 * - Only called when an actual privileged mutation or administrative action is denied.
 * - Always fail-closed: audit logging failures never bypass authorization or break UX.
 */

import { auditService } from './auditService';
import type { AuditActor } from '../types/audit';

export async function auditAuthorizationDenied(params: {
  actor?: Partial<AuditActor>;
  permission: string;
  resource: string;
  resource_id?: string | null;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await auditService.recordAuditEvent({
      actor: params.actor,
      action: 'AUTHORIZATION_DENIED',
      classification: 'AUTHORIZATION',
      resource: params.resource,
      resource_id: params.resource_id || null,
      result: 'DENIED',
      description:
        params.description ||
        `Thao tác bị từ chối do tài khoản không có quyền: ${params.permission}`,
      metadata: {
        attempted_permission: params.permission,
        ...params.metadata,
      },
    });
  } catch (err) {
    console.warn('[authorizationAudit] Error recording denied audit:', err);
  }
}

export async function auditSecurityAlert(params: {
  actor?: Partial<AuditActor>;
  action: 'PRIVILEGE_ESCALATION_ATTEMPT' | 'SUSPICIOUS_ACCESS_DETECTED';
  resource: string;
  resource_id?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await auditService.recordAuditEvent({
      actor: params.actor,
      action: params.action,
      classification: 'SECURITY',
      resource: params.resource,
      resource_id: params.resource_id || null,
      result: 'DENIED',
      description: params.description,
      metadata: params.metadata,
    });
  } catch (err) {
    console.warn('[authorizationAudit] Error recording security alert:', err);
  }
}

export const authorizationAudit = {
  logDeniedAccess: (params: {
    attempted_permission: string;
    held_roles?: string[];
    resource: string;
    resource_id?: string | null;
    actor_id?: string;
    actor_email?: string;
    reason?: string;
  }) =>
    auditAuthorizationDenied({
      actor: { actor_id: params.actor_id, actor_email: params.actor_email },
      permission: params.attempted_permission,
      resource: params.resource,
      resource_id: params.resource_id,
      description: params.reason,
      metadata: { held_roles: params.held_roles },
    }),

  logPrivilegeEscalationAttempt: (params: {
    actor_id?: string;
    actor_email?: string;
    target_user_id?: string;
    attempted_role?: string;
    guard?: string;
  }) =>
    auditSecurityAlert({
      actor: { actor_id: params.actor_id, actor_email: params.actor_email },
      action: 'PRIVILEGE_ESCALATION_ATTEMPT',
      resource: 'users',
      resource_id: params.target_user_id || null,
      description: `Chặn hành vi cố ý tự nâng cấp vai trò thành ${params.attempted_role || 'SUPER_ADMIN'}`,
      metadata: { ...params },
    }),

  logRoleMutation: async (params: {
    actor_id?: string;
    actor_email?: string;
    target_user_id?: string;
    target_user_email?: string;
    assigned_roles?: string[];
    previous_roles?: string[];
    success: boolean;
  }): Promise<void> => {
    try {
      await auditService.recordAuditEvent({
        actor: { actor_id: params.actor_id, actor_email: params.actor_email },
        action: 'USER_ROLE_ASSIGNED',
        classification: 'ROLE',
        resource: 'users',
        resource_id: params.target_user_id || null,
        result: params.success ? 'SUCCESS' : 'FAILURE',
        description: `Phân quyền người dùng ${params.target_user_email || params.target_user_id}`,
        metadata: { ...params },
      });
    } catch (err) {
      console.warn('[authorizationAudit] Error recording role mutation:', err);
    }
  },
};
