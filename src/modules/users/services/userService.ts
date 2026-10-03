/**
 * Users & RBAC Service Layer
 * School News Platform - Step 10.1 Users + RBAC Foundation
 *
 * Architecture:
 * Admin UI -> React Hooks -> userService.ts -> Supabase Client -> PostgreSQL / RLS
 *
 * Enforces:
 * - Pure client-safe Supabase connection (Zero Service Role Key)
 * - Critical Self-Role Escalation Prevention:
 *     * An actor cannot modify or re-assign their own roles
 *     * Non-SUPER_ADMIN actors cannot assign or revoke SUPER_ADMIN role
 *     * Last remaining SUPER_ADMIN cannot be revoked or deactivated
 * - Input validation with Zod (UUIDs, clean inputs, .strict() schemas)
 * - Comprehensive Error Taxonomy with fail-closed semantics
 */

import { supabase } from '../../../lib/supabase';
import { envConfig } from '../../../lib/env';
import type {
  UserRecord,
  Role,
  Permission,
  RoleWithPermissions,
  UserFilterParams,
  UserPaginationResult,
  AssignRolesInput,
  UpdateUserProfileInput,
  UserStats,
  RoleCode,
} from '../types/user';
import {
  assignRolesSchema,
  updateUserProfileSchema,
  userFilterParamsSchema,
  uuidSchema,
} from '../schemas/userSchema';
import { ROLE_HIERARCHY } from '../config/userConfig';

// ==============================================================================
// 1. ERROR TAXONOMY
// ==============================================================================

export type UserServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'SELF_ESCALATION_DENIED'
  | 'LAST_SUPER_ADMIN_PROTECTED'
  | 'DATABASE_ERROR';

export class UserServiceError extends Error {
  readonly code: UserServiceErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: UserServiceErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'UserServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Maps database/PostgREST errors to UserServiceError
 */
function handleDatabaseError(error: unknown, defaultMessage: string): never {
  if (error instanceof UserServiceError) {
    throw error;
  }

  const pgError = error as { code?: string; message?: string; details?: string };
  const message = pgError?.message || defaultMessage;
  const code = pgError?.code;

  // 42501: RLS Violation / Insufficient privilege
  if (
    code === '42501' ||
    message.includes('permission denied') ||
    message.includes('violates row-level security')
  ) {
    throw new UserServiceError(
      'Bạn không có quyền thực hiện thao tác quản trị người dùng (yêu cầu quyền users.view hoặc users.edit).',
      'UNAUTHORIZED',
      error
    );
  }

  // 23505: Unique constraint violation
  if (code === '23505') {
    throw new UserServiceError('Dữ liệu người dùng bị trùng lặp.', 'VALIDATION_ERROR', error);
  }

  // 23503: Foreign key violation
  if (code === '23503') {
    throw new UserServiceError(
      'Mục liên kết không tồn tại (người dùng hoặc vai trò không hợp lệ).',
      'NOT_FOUND',
      error
    );
  }

  // PGRST116: No rows found
  if (code === 'PGRST116') {
    throw new UserServiceError('Không tìm thấy thông tin người dùng yêu cầu.', 'NOT_FOUND', error);
  }

  throw new UserServiceError(message, 'DATABASE_ERROR', error);
}

// ==============================================================================
// 2. READ OPERATIONS
// ==============================================================================

/**
 * List users with search, role filter, status filter, and pagination
 */
export async function listUsers(
  rawParams: UserFilterParams = {}
): Promise<UserPaginationResult<UserRecord>> {
  const params = userFilterParamsSchema.parse(rawParams);

  if (!envConfig.isConfigured) {
    // Graceful offline mock / placeholder response if backend is unconfigured
    return {
      data: [],
      total: 0,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 0,
    };
  }

  try {
    // 1. Build profile query
    let query = supabase.from('profiles').select(
      `
        id,
        email,
        full_name,
        avatar_url,
        phone,
        is_active,
        created_at,
        updated_at,
        user_roles (
          role_id,
          roles (
            id,
            code,
            name,
            description,
            is_system,
            created_at
          )
        )
      `,
      { count: 'exact' }
    );

    // Filter by search query
    if (params.search && params.search.trim().length > 0) {
      const sanitized = params.search.trim().replace(/[%_]/g, '\\$&');
      query = query.or(`full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
    }

    // Filter by active status
    if (params.is_active !== 'ALL') {
      query = query.eq('is_active', params.is_active);
    }

    // Sort order
    query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' });

    // Pagination bounds
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách người dùng.');
    }

    // Transform raw rows into typed UserRecord instances
    interface RawRoleItem {
      id: string;
      code: string;
      name: string;
      description?: string | null;
      is_system?: boolean;
      created_at?: string;
    }
    interface RawUserRoleItem {
      role_id: string;
      roles?: RawRoleItem | RawRoleItem[] | null;
    }
    interface RawUserRow {
      id: string;
      email: string;
      full_name: string;
      avatar_url?: string | null;
      phone?: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      user_roles?: RawUserRoleItem[] | null;
    }

    const records: UserRecord[] = ((data as unknown as RawUserRow[]) || []).map((row) => {
      const userRoles = Array.isArray(row.user_roles) ? row.user_roles : [];
      const roles: Role[] = [];
      const roleCodes: RoleCode[] = [];

      for (const ur of userRoles) {
        const r = Array.isArray(ur.roles) ? ur.roles[0] : ur.roles;
        if (r && r.code) {
          roles.push({
            id: r.id,
            code: r.code as RoleCode,
            name: r.name,
            description: r.description || '',
            is_system: r.is_system ?? true,
            created_at: r.created_at || row.created_at,
          });
          roleCodes.push(r.code as RoleCode);
        }
      }

      // Sort roles by hierarchy weight
      roles.sort((a, b) => {
        const idxA = ROLE_HIERARCHY.indexOf(a.code);
        const idxB = ROLE_HIERARCHY.indexOf(b.code);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });

      return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        avatar_url: row.avatar_url || null,
        phone: row.phone || null,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        roles,
        role_codes: roleCodes,
        permissions: roleCodes.includes('SUPER_ADMIN') ? ['*'] : [],
      };
    });

    // Client-side filter by role if specified
    let filteredRecords = records;
    if (params.role !== 'ALL') {
      filteredRecords = records.filter((u) => u.role_codes.includes(params.role as RoleCode));
    }

    const totalCount = count ?? filteredRecords.length;

    return {
      data: filteredRecords,
      total: totalCount,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(totalCount / params.pageSize) || 1,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi tải danh sách người dùng.');
  }
}

/**
 * Get detailed user record by ID
 */
export async function getUserById(userId: string): Promise<UserRecord> {
  const validId = uuidSchema.parse(userId);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        `
          id,
          email,
          full_name,
          avatar_url,
          phone,
          is_active,
          created_at,
          updated_at,
          user_roles (
            role_id,
            roles (
              id,
              code,
              name,
              description,
              is_system,
              created_at
            )
          )
        `
      )
      .eq('id', validId)
      .single();

    if (error) {
      handleDatabaseError(error, 'Không tìm thấy người dùng.');
    }

    const userRoles = Array.isArray(data.user_roles) ? data.user_roles : [];
    const roles: Role[] = [];
    const roleCodes: RoleCode[] = [];
    const roleIds: string[] = [];

    for (const ur of userRoles) {
      const r = Array.isArray(ur.roles) ? ur.roles[0] : ur.roles;
      if (r && r.code) {
        roles.push({
          id: r.id,
          code: r.code as RoleCode,
          name: r.name,
          description: r.description || '',
          is_system: r.is_system ?? true,
          created_at: r.created_at || data.created_at,
        });
        roleCodes.push(r.code as RoleCode);
        roleIds.push(r.id);
      }
    }

    // Resolve permissions from role_permissions
    let permissions: string[] = [];
    if (roleCodes.includes('SUPER_ADMIN')) {
      permissions = ['*'];
    } else if (roleIds.length > 0) {
      const { data: permData } = await supabase
        .from('role_permissions')
        .select('permissions(code)')
        .in('role_id', roleIds);

      if (permData) {
        const set = new Set<string>();
        for (const p of permData) {
          const perm = Array.isArray(p.permissions) ? p.permissions[0] : p.permissions;
          if (perm?.code) {
            set.add(perm.code);
          }
        }
        permissions = Array.from(set);
      }
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url || null,
      phone: data.phone || null,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
      roles,
      role_codes: roleCodes,
      permissions,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi lấy thông tin người dùng.');
  }
}

/**
 * List all roles with attached permissions and user counts
 */
export async function listRoles(): Promise<RoleWithPermissions[]> {
  try {
    // 1. Fetch all roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (rolesError) {
      handleDatabaseError(rolesError, 'Không thể tải danh sách vai trò.');
    }

    // 2. Fetch role_permissions with permissions
    const { data: rpData, error: rpError } = await supabase
      .from('role_permissions')
      .select('role_id, permissions(id, code, resource, action, description, created_at)');

    if (rpError) {
      console.warn('[userService] Could not fetch role_permissions:', rpError.message);
    }

    // 3. Fetch user counts per role
    const { data: urData, error: urError } = await supabase
      .from('user_roles')
      .select('role_id');

    if (urError) {
      console.warn('[userService] Could not fetch user_roles count:', urError.message);
    }

    const userCountMap = new Map<string, number>();
    if (urData) {
      for (const ur of urData) {
        userCountMap.set(ur.role_id, (userCountMap.get(ur.role_id) || 0) + 1);
      }
    }

    const rolePermsMap = new Map<string, Permission[]>();
    if (rpData) {
      for (const item of rpData) {
        const p = Array.isArray(item.permissions) ? item.permissions[0] : item.permissions;
        if (p) {
          const list = rolePermsMap.get(item.role_id) || [];
          list.push({
            id: p.id,
            code: p.code,
            resource: p.resource,
            action: p.action,
            description: p.description || '',
            created_at: p.created_at,
          });
          rolePermsMap.set(item.role_id, list);
        }
      }
    }

    const result: RoleWithPermissions[] = (rolesData || []).map((r) => {
      const perms = rolePermsMap.get(r.id) || [];
      return {
        id: r.id,
        code: r.code as RoleCode,
        name: r.name,
        description: r.description || '',
        is_system: r.is_system ?? true,
        created_at: r.created_at,
        permissions: perms,
        permission_codes: perms.map((p) => p.code),
        user_count: userCountMap.get(r.id) || 0,
      };
    });

    // Sort by hierarchical weight
    result.sort((a, b) => {
      const idxA = ROLE_HIERARCHY.indexOf(a.code);
      const idxB = ROLE_HIERARCHY.indexOf(b.code);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return result;
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi tải danh sách vai trò.');
  }
}

/**
 * List all available system permissions
 */
export async function listPermissions(): Promise<Permission[]> {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (error) {
      handleDatabaseError(error, 'Không thể tải danh sách quyền hạn.');
    }

    return (data || []).map((p) => ({
      id: p.id,
      code: p.code,
      resource: p.resource,
      action: p.action,
      description: p.description || '',
      created_at: p.created_at,
    }));
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi tải danh sách quyền hạn.');
  }
}

/**
 * Get aggregate user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, is_active');

    if (pErr) {
      handleDatabaseError(pErr, 'Không thể tải thống kê người dùng.');
    }

    const { data: userRoles, error: urErr } = await supabase
      .from('user_roles')
      .select('role_id, roles(code)');

    if (urErr) {
      console.warn('[userService] user_roles stats warning:', urErr.message);
    }

    const totalUsers = profiles?.length || 0;
    const activeUsers = profiles?.filter((p) => p.is_active).length || 0;
    const inactiveUsers = totalUsers - activeUsers;

    const rolesDistribution: Record<RoleCode, number> = {
      SUPER_ADMIN: 0,
      ADMIN: 0,
      EDITOR: 0,
      AUTHOR: 0,
      PUBLIC_VISITOR: 0,
    };

    if (userRoles) {
      for (const ur of userRoles) {
        const r = Array.isArray(ur.roles) ? ur.roles[0] : ur.roles;
        if (r && r.code && r.code in rolesDistribution) {
          rolesDistribution[r.code as RoleCode]++;
        }
      }
    }

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      rolesDistribution,
    };
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi tính toán thống kê người dùng.');
  }
}

// ==============================================================================
// 3. MUTATION OPERATIONS WITH CRITICAL SECURITY CHECKS
// ==============================================================================

/**
 * Counts total active users who hold the SUPER_ADMIN role.
 * Used for orphan protection.
 */
export async function countActiveSuperAdmins(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, profiles(is_active), roles!inner(code)')
      .eq('roles.code', 'SUPER_ADMIN');

    if (error) {
      console.warn('[userService] countActiveSuperAdmins warning:', error.message);
      return 1; // Fail-closed: assume at least 1 to avoid accidental complete lockout
    }

    if (!data) return 0;

    // Filter by active profile
    interface RawSuperAdminRow {
      user_id: string;
      profiles?: { is_active?: boolean } | Array<{ is_active?: boolean }> | null;
      roles?: { code: string } | Array<{ code: string }> | null;
    }
    const activeSuperAdmins = ((data as unknown as RawSuperAdminRow[]) || []).filter((row) => {
      const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return prof?.is_active !== false;
    });

    return activeSuperAdmins.length;
  } catch {
    return 1;
  }
}

/**
 * Assign Roles to User
 *
 * CRITICAL SECURITY DIRECTIVES:
 * 1. An actor CANNOT modify or assign roles to themselves (Self-Escalation & Lockout Prevention).
 * 2. Only an actor with SUPER_ADMIN can assign or revoke the SUPER_ADMIN role.
 * 3. The last remaining SUPER_ADMIN cannot have their role revoked.
 */
export async function assignUserRoles(
  rawInput: AssignRolesInput,
  currentActor: { id: string; roles: RoleCode[] }
): Promise<UserRecord> {
  const input = assignRolesSchema.parse(rawInput);

  // --- SECURITY CHECK 1: Self-Role Escalation & Modification Prevention ---
  if (input.userId === currentActor.id) {
    throw new UserServiceError(
      'Bạn không được phép tự phân quyền hoặc sửa đổi vai trò của chính mình để đảm bảo tính toàn vẹn hệ thống.',
      'SELF_ESCALATION_DENIED'
    );
  }

  // --- SECURITY CHECK 2: Validate Target User Exists ---
  const targetUser = await getUserById(input.userId);

  // --- SECURITY CHECK 3: Validate Role IDs & Codes to Assign ---
  const { data: targetRoleRecords, error: roleFetchErr } = await supabase
    .from('roles')
    .select('id, code, name')
    .in('id', input.roleIds);

  if (roleFetchErr || !targetRoleRecords || targetRoleRecords.length !== input.roleIds.length) {
    throw new UserServiceError(
      'Một hoặc nhiều vai trò được chọn không tồn tại trên hệ thống.',
      'NOT_FOUND'
    );
  }

  const assigningSuperAdmin = targetRoleRecords.some((r) => r.code === 'SUPER_ADMIN');
  const actorIsSuperAdmin = currentActor.roles.includes('SUPER_ADMIN');

  // --- SECURITY CHECK 4: Non-SUPER_ADMIN cannot grant SUPER_ADMIN ---
  if (assigningSuperAdmin && !actorIsSuperAdmin) {
    throw new UserServiceError(
      'Chỉ Quản trị viên tối cao (SUPER_ADMIN) mới có quyền phân bổ vai trò SUPER_ADMIN.',
      'UNAUTHORIZED'
    );
  }

  // --- SECURITY CHECK 5: Non-SUPER_ADMIN cannot revoke SUPER_ADMIN ---
  const userCurrentlyHasSuperAdmin = targetUser.role_codes.includes('SUPER_ADMIN');
  if (userCurrentlyHasSuperAdmin && !assigningSuperAdmin) {
    if (!actorIsSuperAdmin) {
      throw new UserServiceError(
        'Chỉ Quản trị viên tối cao (SUPER_ADMIN) mới có quyền thu hồi vai trò SUPER_ADMIN.',
        'UNAUTHORIZED'
      );
    }

    // Check orphan protection: is this the last active SUPER_ADMIN?
    const superAdminCount = await countActiveSuperAdmins();
    if (superAdminCount <= 1) {
      throw new UserServiceError(
        'Không thể thu hồi vai trò của Quản trị viên tối cao duy nhất trong hệ thống.',
        'LAST_SUPER_ADMIN_PROTECTED'
      );
    }
  }

  try {
    // 1. Delete existing user_roles for this user
    const { error: deleteErr } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', input.userId);

    if (deleteErr) {
      handleDatabaseError(deleteErr, 'Không thể cập nhật vai trò người dùng.');
    }

    // 2. Insert new user_roles mappings
    const rowsToInsert = input.roleIds.map((roleId) => ({
      user_id: input.userId,
      role_id: roleId,
    }));

    const { error: insertErr } = await supabase.from('user_roles').insert(rowsToInsert);

    if (insertErr) {
      handleDatabaseError(insertErr, 'Không thể lưu vai trò mới.');
    }

    // Return refreshed UserRecord
    return await getUserById(input.userId);
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi thực hiện phân quyền người dùng.');
  }
}

/**
 * Update User Profile
 *
 * Guardrails:
 * - Anti-mass assignment with .strict() schema
 * - Cannot deactivate the last remaining active SUPER_ADMIN
 */
export async function updateUserProfile(
  userId: string,
  rawInput: UpdateUserProfileInput,
  currentActor?: { id: string; roles: RoleCode[] }
): Promise<UserRecord> {
  const validId = uuidSchema.parse(userId);
  const input = updateUserProfileSchema.parse(rawInput);

  const targetUser = await getUserById(validId);

  // Orphan protection: Check deactivation of last SUPER_ADMIN
  if (input.is_active === false && targetUser.role_codes.includes('SUPER_ADMIN')) {
    const activeSuperAdmins = await countActiveSuperAdmins();
    if (activeSuperAdmins <= 1) {
      throw new UserServiceError(
        'Không thể khóa tài khoản của Quản trị viên tối cao duy nhất đang hoạt động.',
        'LAST_SUPER_ADMIN_PROTECTED'
      );
    }
  }

  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.full_name !== undefined) updatePayload.full_name = input.full_name;
    if (input.phone !== undefined) updatePayload.phone = input.phone;
    if (input.avatar_url !== undefined) updatePayload.avatar_url = input.avatar_url;
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', validId);

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật hồ sơ người dùng.');
    }

    return await getUserById(validId);
  } catch (err) {
    handleDatabaseError(err, 'Lỗi khi cập nhật thông tin người dùng.');
  }
}

export interface CreateUserInput {
  email: string;
  full_name: string;
  phone?: string | null;
  department?: string | null;
  role_code?: RoleCode;
  is_active?: boolean;
}

/**
 * Create a new user profile and assign initial role
 */
export async function createUserRecord(input: CreateUserInput): Promise<UserRecord> {
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const email = input.email.trim().toLowerCase();
  const fullName = input.full_name.trim();

  // 1. Insert profile record
  const { error: profileError } = await supabase.from('profiles').insert({
    id: newId,
    email,
    full_name: fullName,
    phone: input.phone?.trim() || null,
    is_active: input.is_active ?? true,
    created_at: now,
    updated_at: now,
  });

  if (profileError) {
    handleDatabaseError(profileError, 'Không thể tạo hồ sơ người dùng mới.');
  }

  // 2. Assign initial role
  const targetRoleCode = input.role_code || 'AUTHOR';
  try {
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('code', targetRoleCode)
      .maybeSingle();

    if (roleData?.id) {
      await supabase.from('user_roles').insert({
        user_id: newId,
        role_id: roleData.id,
      });
    }
  } catch (roleErr) {
    console.warn('[userService] Could not assign role automatically:', roleErr);
  }

  return await getUserById(newId);
}

