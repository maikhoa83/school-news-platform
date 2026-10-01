/**
 * Users & RBAC Domain Type Definitions
 * School News Platform - Step 10.1 Users + RBAC Foundation
 *
 * Enforces:
 * - Baseline Roles: PUBLIC_VISITOR | AUTHOR | EDITOR | ADMIN | SUPER_ADMIN
 * - Approved Permission Catalog based on database schema
 * - Strict typing for User Management, Profile Updates, and Role Assignments
 */

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
  code: string;
  resource: string;
  action: string;
  description: string;
  created_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
  permission_codes: string[];
  user_count?: number;
}

export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
}

export interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: Role[];
  role_codes: RoleCode[];
  permissions: string[];
}

export type UserSortField = 'full_name' | 'email' | 'created_at' | 'updated_at';
export type UserSortOrder = 'asc' | 'desc';

export interface UserFilterParams {
  search?: string;
  role?: RoleCode | 'ALL';
  is_active?: boolean | 'ALL';
  page?: number;
  pageSize?: number;
  sortBy?: UserSortField;
  sortOrder?: UserSortOrder;
}

export interface UserPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AssignRolesInput {
  userId: string;
  roleIds: string[];
}

export interface UpdateUserProfileInput {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  rolesDistribution: Record<RoleCode, number>;
}
