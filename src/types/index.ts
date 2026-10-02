/**
 * Core type definitions for School News Platform
 * Foundation & Design System (Step 01 - Step 03)
 */

export * from './auth';
export * from './config';
export * from './media';
export * from './page';
export * from './menu';
export * from './seo';
export * from '../homepage/types';
export type {
  UserRecord,
  UserFilterParams,
  UserPaginationResult,
  AssignRolesInput,
  UpdateUserProfileInput,
  UserStats,
  RoleWithPermissions,
  UserRoleAssignment,
  UserSortField,
  UserSortOrder,
} from './user';

export type RoleCode = 'PUBLIC_VISITOR' | 'AUTHOR' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  code: string; // e.g. 'news.view', 'news.create'
  resource: string;
  action: string;
  description: string;
  created_at: string;
}

export type ModuleKey =
  | 'news'
  | 'categories'
  | 'documents'
  | 'announcements'
  | 'media'
  | 'albums'
  | 'pages'
  | 'menu'
  | 'homepage'
  | 'users'
  | 'roles'
  | 'settings'
  | 'seo'
  | 'audit'
  | 'health';

/**
 * ModuleDefinition represents the static contract and metadata of a module.
 * It strictly DOES NOT hold persistent dynamic state (which is stored in module_settings).
 */
export interface ModuleDefinition {
  key: ModuleKey;
  name: string;
  description: string;
  category: 'core' | 'content' | 'administration';
  requiredPermissions: string[];
  publicRoute?: string;
  adminRoute?: string;
  navIconName: string;
  badge?: string;
}

/**
 * Backwards compatibility alias
 */
export type ModuleContract = ModuleDefinition & { enabled?: boolean };

export interface SiteSetting<T = unknown> {
  key: string;
  value: T;
  is_public: boolean;
  updated_at: string;
}

export interface ModuleSetting {
  module_key: ModuleKey;
  is_enabled: boolean;
  config: Record<string, unknown>;
  created_at?: string;
  updated_at: string;
}

