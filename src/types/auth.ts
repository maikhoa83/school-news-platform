/**
 * Authentication and Authorization Type Definitions
 * School News Platform - Step 03 Foundation
 */

export type RoleCode = 'PUBLIC_VISITOR' | 'AUTHOR' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserRole {
  role_id: string;
  code: RoleCode;
  name: string;
}

export interface UserPermission {
  code: string;
  resource: string;
  action: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: RoleCode[];
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  roles: RoleCode[];
  permissions: string[];
  error: string | null;
}
