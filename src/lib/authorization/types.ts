/**
 * School News Platform - Authorization Types
 * Step 10.2: Centralized RBAC Authorization Layer
 *
 * Strict Compliance:
 * - Exactly 40 approved AppPermission codes across 10 resources.
 * - Exactly 5 immutable system roles: SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, PUBLIC_VISITOR.
 * - Deterministic PermissionActionGroup: READ, WRITE, PUBLISH, DELETE, MANAGE.
 * - Zero invented permissions.
 */

import type { RoleCode } from '../../types/auth';

/**
 * The 5 Immutable System Roles in School News Platform
 */
export type AppRole = RoleCode; // 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'PUBLIC_VISITOR'

/**
 * Exactly 40 Verified AppPermission Codes from Database Seeds & Migrations
 * Grouped across 10 system resources:
 * - news (10)
 * - documents (6)
 * - announcements (5)
 * - media (4)
 * - pages (4)
 * - homepage (3)
 * - users (4)
 * - settings (2)
 * - audit (1)
 * - health (1)
 */
export type AppPermission =
  // NEWS (10)
  | 'news.view'
  | 'news.create'
  | 'news.edit_own'
  | 'news.edit'
  | 'news.submit'
  | 'news.publish'
  | 'news.delete'
  | 'news.manage_categories'
  | 'news.manage_tags'
  | 'news.manage_comments'

  // DOCUMENTS (6)
  | 'documents.view'
  | 'documents.create'
  | 'documents.edit'
  | 'documents.publish'
  | 'documents.upload'
  | 'documents.delete'

  // ANNOUNCEMENTS (5)
  | 'announcements.view'
  | 'announcements.create'
  | 'announcements.edit'
  | 'announcements.publish'
  | 'announcements.delete'

  // MEDIA (4) - Note: media.create does NOT exist; album management uses media.edit
  | 'media.view'
  | 'media.upload'
  | 'media.edit'
  | 'media.delete'

  // PAGES (4)
  | 'pages.view'
  | 'pages.create'
  | 'pages.edit'
  | 'pages.delete'

  // HOMEPAGE (3)
  | 'homepage.view'
  | 'homepage.edit'
  | 'homepage.publish'

  // USERS (4)
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'

  // SETTINGS (2)
  | 'settings.view'
  | 'settings.edit'

  // AUDIT (1)
  | 'audit.view'

  // HEALTH (1)
  | 'health.view';

/**
 * Standard Action Categorization Groups for UI & Auditing
 */
export type PermissionActionGroup = 'READ' | 'WRITE' | 'PUBLISH' | 'DELETE' | 'MANAGE';

/**
 * Metadata descriptor for each permission entry
 */
export interface PermissionDefinition {
  readonly code: AppPermission;
  readonly resource: string;
  readonly action: string;
  readonly actionGroup: PermissionActionGroup;
  readonly description: string;
}

/**
 * Metadata descriptor for each system role entry
 */
export interface RoleDefinition {
  readonly code: AppRole;
  readonly name: string;
  readonly description: string;
  readonly hierarchy: number;
  readonly is_system: true;
}

/**
 * Result interface exposed by useAuthorization() hook
 */
export interface UseAuthorizationResult {
  /** Check if current user has a specific permission */
  readonly can: (permission: AppPermission) => boolean;

  /** Check if user possesses ANY of the specified permissions (Fail-closed: empty array -> false) */
  readonly canAny: (permissions: readonly AppPermission[]) => boolean;

  /** Check if user possesses ALL of the specified permissions (Fail-closed: empty array -> false) */
  readonly canAll: (permissions: readonly AppPermission[]) => boolean;

  /** Check if user possesses a specific role */
  readonly hasRole: (role: AppRole) => boolean;

  /** Check if user possesses ANY of the specified roles (Fail-closed: empty array -> false) */
  readonly hasAnyRole: (roles: readonly AppRole[]) => boolean;

  /** True if user possesses the SUPER_ADMIN role */
  readonly isSuperAdmin: boolean;

  /** True if user possesses ADMIN or SUPER_ADMIN role */
  readonly isAdmin: boolean;

  /** Loading state of authentication and authorization snapshot (Fail-closed when true) */
  readonly isLoading: boolean;

  /** Authentication state */
  readonly isAuthenticated: boolean;

  /** Raw roles assigned to user */
  readonly roles: readonly RoleCode[];

  /** Raw permissions assigned to user */
  readonly permissions: readonly string[];
}

/**
 * Props for declarative <Authorize> component
 */
export interface AuthorizeProps {
  /** Single permission required */
  readonly permission?: AppPermission;

  /** Multiple permissions required */
  readonly permissions?: readonly AppPermission[];

  /** Strategy when multiple permissions provided: 'all' requires every permission, 'any' requires at least one */
  readonly strategy?: 'all' | 'any';

  /** Role requirement if checking role directly */
  readonly role?: AppRole;

  /** Multiple roles requirement */
  readonly roles?: readonly AppRole[];

  /** Render mode when unauthorized: 'hide' (unmount) or 'disable' (render disabled UI) */
  readonly mode?: 'hide' | 'disable';

  /** Optional custom fallback to render when unauthorized in 'hide' mode */
  readonly fallback?: React.ReactNode;

  /** Tooltip or explanation reason when element is disabled */
  readonly disabledReason?: string;

  /** Child element to protect */
  readonly children: React.ReactNode | ((context: { isAuthorized: boolean }) => React.ReactNode);
}
