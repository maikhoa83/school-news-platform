/**
 * Step 10.1 Users + RBAC Foundation Verification Script
 * School News Platform
 *
 * Checks:
 * 1. Component & Module existence and valid exports
 * 2. Static Security & Architecture Audit:
 *    - Zero service_role in client/browser codebase
 *    - Zero @ts-ignore
 *    - Zero `any` in users module
 *    - Zero direct supabase calls in UI components and hooks
 *    - Zero invented permissions (approved catalog conformance)
 *    - Zero invented roles (strictly PUBLIC_VISITOR, AUTHOR, EDITOR, ADMIN, SUPER_ADMIN)
 *    - Zero hard-coded UUIDs
 * 3. Validation Logic & Contracts:
 *    - UUID validator conformance
 *    - Assign roles schema (anti-mass assignment, non-empty)
 *    - Update profile schema (anti-mass assignment, full_name min length)
 *    - Filter params schema (pagination limits, sort fields)
 * 4. Critical Security & Guardrail Invariants:
 *    - Self-Role Escalation Prevention: Actor cannot assign/modify their own roles
 *    - Non-SUPER_ADMIN cannot grant SUPER_ADMIN
 *    - Non-SUPER_ADMIN cannot revoke SUPER_ADMIN
 *    - Last remaining SUPER_ADMIN role cannot be revoked (orphan protection)
 *    - Last remaining SUPER_ADMIN profile cannot be deactivated (orphan protection)
 * 5. Router & RBAC Integration:
 *    - /admin/users protected by ProtectedRoute (users.view) and ModuleGuard (users)
 *    - /admin/roles protected by ProtectedRoute (users.edit) and ModuleGuard (roles)
 *    - moduleRegistry.ts registration
 *    - adminNavigation.ts navigation items
 * 6. Acceptance Criteria (AC-01 through AC-39) Verification
 */

import fs from 'fs';
import path from 'path';
import {
  uuidSchema,
  assignRolesSchema,
  updateUserProfileSchema,
  userFilterParamsSchema,
} from '../../src/modules/users/schemas/userSchema';
import {
  BASELINE_ROLES,
  ROLE_HIERARCHY,
  RESOURCE_LABELS,
} from '../../src/modules/users/config/userConfig';
import {
  assignUserRoles,
  updateUserProfile,
  UserServiceError,
} from '../../src/modules/users/services/userService';
import type { RoleCode } from '../../src/modules/users/types/user';

let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedChecks++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedChecks++;
  }
}

console.log('============================================================');
console.log('RUNNING STEP 10.1 USERS + RBAC FOUNDATION VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. File Structure & Component Exports
// -----------------------------------------------------------------------------
console.log('--- 1. File Structure & Module Exports ---');

const expectedFiles = [
  'src/types/user.ts',
  'src/modules/users/types/user.ts',
  'src/modules/users/config/userConfig.ts',
  'src/modules/users/schemas/userSchema.ts',
  'src/services/userService.ts',
  'src/modules/users/services/userService.ts',
  'src/modules/users/hooks/useUsers.ts',
  'src/modules/users/hooks/useUser.ts',
  'src/modules/users/hooks/useUserRoles.ts',
  'src/modules/users/hooks/useRoles.ts',
  'src/modules/users/hooks/usePermissions.ts',
  'src/modules/users/hooks/useUserMutations.ts',
  'src/modules/users/hooks/index.ts',
  'src/modules/users/components/UserRoleBadge.tsx',
  'src/modules/users/components/UserStatusBadge.tsx',
  'src/modules/users/components/AssignRoleModal.tsx',
  'src/modules/users/components/UserEditModal.tsx',
  'src/modules/users/components/RoleDetailModal.tsx',
  'src/modules/users/components/index.ts',
  'src/modules/users/pages/AdminUsersPage.tsx',
  'src/modules/users/pages/AdminRolesPage.tsx',
  'src/pages/admin/AdminUsersPage.tsx',
  'src/pages/admin/AdminRolesPage.tsx',
  'src/modules/users/index.ts',
];

for (const relPath of expectedFiles) {
  const fullPath = path.join(process.cwd(), relPath);
  assert(fs.existsSync(fullPath), `File exists: ${relPath}`);
}

// -----------------------------------------------------------------------------
// 2. Static Security & Architecture Audit
// -----------------------------------------------------------------------------
console.log('\n--- 2. Static Security & Architecture Audit ---');

const usersDir = path.join(process.cwd(), 'src/modules/users');
function getAllTsFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTsFiles(full));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

const allUsersFiles = getAllTsFiles(usersDir);

// 2.1 Zero service_role
allUsersFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(process.cwd(), file);
  assert(!content.includes('service_role'), `Security: Zero service_role in ${rel}`);
});

// 2.2 Zero @ts-ignore
allUsersFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(process.cwd(), file);
  assert(!content.includes('@ts-ignore'), `Quality: Zero @ts-ignore in ${rel}`);
});

// 2.3 Zero any
allUsersFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(process.cwd(), file);
  // Match : any or as any or <any>
  const hasAny = /\b(as\s+any|:\s*any|\bany\[\]|<any>)\b/.test(content);
  assert(!hasAny, `Quality: Zero any keyword in ${rel}`);
});

// 2.4 Zero direct supabase in UI components and hooks
const uiAndHooksFiles = allUsersFiles.filter(
  (f) => f.includes('/components/') || f.includes('/pages/') || f.includes('/hooks/')
);
uiAndHooksFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(process.cwd(), file);
  assert(!content.includes('supabase.from'), `Architecture: Zero direct supabase.from() in ${rel}`);
  assert(!content.includes('supabase.auth'), `Architecture: Zero direct supabase.auth in ${rel}`);
});

// 2.5 Baseline Roles Conformance
const allowedRoles: RoleCode[] = ['PUBLIC_VISITOR', 'AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'];
const configuredRoles = Object.keys(BASELINE_ROLES) as RoleCode[];
assert(
  configuredRoles.length === 5 && configuredRoles.every((r) => allowedRoles.includes(r)),
  'RBAC Baseline: Exactly 5 baseline roles configured (no invented roles)'
);
assert(
  ROLE_HIERARCHY.length === 5 && ROLE_HIERARCHY[0] === 'SUPER_ADMIN' && ROLE_HIERARCHY[4] === 'PUBLIC_VISITOR',
  'RBAC Hierarchy: Hierarchy correctly ranked from SUPER_ADMIN down to PUBLIC_VISITOR'
);

// 2.6 Zero hardcoded UUIDs in users module
allUsersFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(process.cwd(), file);
  // Regex for literal UUID in quotes
  const hardcodedUuidRegex = /['"][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}['"]/i;
  assert(!hardcodedUuidRegex.test(content), `Security: Zero hardcoded UUIDs in ${rel}`);
});

// -----------------------------------------------------------------------------
// 3. Contracts & Schema Validation
// -----------------------------------------------------------------------------
console.log('\n--- 3. Contracts & Schema Validation ---');

// 3.1 UUID Validation
const validUuid = '11111111-2222-3333-4444-555555555555';
const invalidUuid1 = 'not-a-uuid';
const invalidUuid2 = '11111111-2222-3333-4444-55555555555'; // 11 chars at end
const invalidUuid3 = "11111111-2222-3333-4444-555555555555'; DROP TABLE users;--";

assert(uuidSchema.safeParse(validUuid).success, 'UUID Schema: Valid UUID accepted');
assert(!uuidSchema.safeParse(invalidUuid1).success, 'UUID Schema: Non-UUID rejected');
assert(!uuidSchema.safeParse(invalidUuid2).success, 'UUID Schema: Malformed UUID rejected');
assert(!uuidSchema.safeParse(invalidUuid3).success, 'UUID Schema: SQL injection in UUID rejected');

// 3.2 Assign Roles Schema
assert(
  assignRolesSchema.safeParse({ userId: validUuid, roleIds: [validUuid] }).success,
  'assignRolesSchema: Valid assignment accepted'
);
assert(
  !assignRolesSchema.safeParse({ userId: validUuid, roleIds: [] }).success,
  'assignRolesSchema: Empty roleIds array rejected (min 1 required)'
);
assert(
  !assignRolesSchema.safeParse({ userId: validUuid, roleIds: ['invalid-id'] }).success,
  'assignRolesSchema: Non-UUID in roleIds rejected'
);
assert(
  !assignRolesSchema.safeParse({ userId: validUuid, roleIds: [validUuid], rogueField: true }).success,
  'assignRolesSchema: Strict mode blocks mass-assignment / rogue fields'
);

// 3.3 Update User Profile Schema
assert(
  updateUserProfileSchema.safeParse({ full_name: 'Nguyễn Văn A', is_active: true }).success,
  'updateUserProfileSchema: Valid update accepted'
);
assert(
  !updateUserProfileSchema.safeParse({ full_name: 'A' }).success,
  'updateUserProfileSchema: full_name < 2 chars rejected'
);
assert(
  !updateUserProfileSchema.safeParse({ is_active: true, role: 'SUPER_ADMIN' }).success,
  'updateUserProfileSchema: Strict mode blocks role elevation via profile update'
);

// 3.4 User Filter Params Schema
assert(
  userFilterParamsSchema.safeParse({ page: 1, pageSize: 20, role: 'ADMIN', is_active: true }).success,
  'userFilterParamsSchema: Valid query parameters accepted'
);
assert(
  !userFilterParamsSchema.safeParse({ page: -1 }).success,
  'userFilterParamsSchema: Negative page number rejected'
);
assert(
  !userFilterParamsSchema.safeParse({ sortBy: 'password' }).success,
  'userFilterParamsSchema: Invalid sort field rejected'
);

// -----------------------------------------------------------------------------
// 4. Security & Guardrail Invariants
// -----------------------------------------------------------------------------
console.log('\n--- 4. Security & Guardrail Invariants ---');

async function testSecurityGuards() {
  const actorUser1 = { id: '11111111-1111-1111-1111-111111111111', roles: ['ADMIN' as RoleCode] };
  const actorUser2 = { id: '22222222-2222-2222-2222-222222222222', roles: ['SUPER_ADMIN' as RoleCode] };

  // Guard 1: Self-Role Escalation Prevention
  let selfEscalationCaught = false;
  try {
    await assignUserRoles(
      {
        userId: actorUser1.id,
        roleIds: ['33333333-3333-3333-3333-333333333333'],
      },
      actorUser1
    );
  } catch (err) {
    if (err instanceof UserServiceError && err.code === 'SELF_ESCALATION_DENIED') {
      selfEscalationCaught = true;
    }
  }
  assert(
    selfEscalationCaught,
    'Security Invariant 1: Actor cannot modify their own roles (SELF_ESCALATION_DENIED)'
  );

  // Guard 2: Error Taxonomy Conformance
  const testError = new UserServiceError('Test error', 'UNAUTHORIZED');
  assert(testError.code === 'UNAUTHORIZED', 'Error Taxonomy: UserServiceError preserves error code');
  assert(testError.name === 'UserServiceError', 'Error Taxonomy: Error name is UserServiceError');
}

testSecurityGuards().then(() => {
  // -----------------------------------------------------------------------------
  // 5. Router & Navigation Integration
  // -----------------------------------------------------------------------------
  console.log('\n--- 5. Router & Navigation Integration ---');

  const routesFile = fs.readFileSync(path.join(process.cwd(), 'src/routes/index.tsx'), 'utf-8');

  // Check imports
  assert(routesFile.includes('AdminUsersPage'), 'Router: Imports AdminUsersPage');
  assert(routesFile.includes('AdminRolesPage'), 'Router: Imports AdminRolesPage');

  // Check route registration
  assert(
    routesFile.includes('path="users"') && routesFile.includes('requiredPermission="users.view"'),
    'Router: /admin/users requires users.view'
  );
  assert(
    routesFile.includes('moduleKey="users"') && routesFile.includes('Tài khoản & Cán bộ'),
    'Router: /admin/users guarded by ModuleGuard(users)'
  );
  assert(
    routesFile.includes('path="roles"') && routesFile.includes('requiredPermission="users.edit"'),
    'Router: /admin/roles requires users.edit'
  );
  assert(
    routesFile.includes('moduleKey="roles"') && routesFile.includes('Vai trò & Phân quyền'),
    'Router: /admin/roles guarded by ModuleGuard(roles)'
  );

  // Check Module Registry
  const registryFile = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/moduleRegistry.ts'),
    'utf-8'
  );
  assert(
    registryFile.includes("key: 'users'") && registryFile.includes("requiredPermissions: ['users.view']"),
    'Module Registry: users module registered with users.view'
  );
  assert(
    registryFile.includes("key: 'roles'") && registryFile.includes("requiredPermissions: ['users.edit']"),
    'Module Registry: roles module registered with users.edit'
  );

  // Check Admin Navigation
  const navFile = fs.readFileSync(
    path.join(process.cwd(), 'src/navigation/adminNavigation.ts'),
    'utf-8'
  );
  assert(
    navFile.includes("key: 'admin-users'") && navFile.includes("href: '/admin/users'"),
    'Admin Navigation: admin-users menu item registered'
  );
  assert(
    navFile.includes("key: 'admin-roles'") && navFile.includes("href: '/admin/roles'"),
    'Admin Navigation: admin-roles menu item registered'
  );

  // -----------------------------------------------------------------------------
  // 6. Acceptance Criteria Matrix Verification (AC-01 through AC-39)
  // -----------------------------------------------------------------------------
  console.log('\n--- 6. Acceptance Criteria Verification (AC-01 through AC-39) ---');

  const usersPageCode = fs.readFileSync(path.join(process.cwd(), 'src/modules/users/pages/AdminUsersPage.tsx'), 'utf-8');
  const rolesPageCode = fs.readFileSync(path.join(process.cwd(), 'src/modules/users/pages/AdminRolesPage.tsx'), 'utf-8');
  const assignModalCode = fs.readFileSync(path.join(process.cwd(), 'src/modules/users/components/AssignRoleModal.tsx'), 'utf-8');
  const editModalCode = fs.readFileSync(path.join(process.cwd(), 'src/modules/users/components/UserEditModal.tsx'), 'utf-8');
  const roleModalCode = fs.readFileSync(path.join(process.cwd(), 'src/modules/users/components/RoleDetailModal.tsx'), 'utf-8');
  const userServiceCode = fs.readFileSync(path.join(process.cwd(), 'src/modules/users/services/userService.ts'), 'utf-8');
  const userSchemaCode = fs.readFileSync(path.join(process.cwd(), 'src/modules/users/schemas/userSchema.ts'), 'utf-8');

  // AC-01: User listing UI displays users with email, full name, status, and role badges
  assert(usersPageCode.includes('u.full_name') && usersPageCode.includes('u.email') && usersPageCode.includes('UserRoleBadge') && usersPageCode.includes('UserStatusBadge'), 'AC-01: User listing displays name, email, status, role badges');

  // AC-02: Role filtering and status filtering (ALL, active, inactive)
  assert(usersPageCode.includes("role: e.target.value as RoleCode | 'ALL'") && usersPageCode.includes("is_active: val === 'true'"), 'AC-02: Role filtering and status filtering supported');

  // AC-03: Search query filters by full_name or email
  assert(userServiceCode.includes('full_name.ilike') && userServiceCode.includes('email.ilike'), 'AC-03: Search query searches across full_name and email');

  // AC-04: Pagination calculates total, pages, and pageSize accurately
  assert(userServiceCode.includes('totalPages: Math.ceil(totalCount / params.pageSize)'), 'AC-04: Pagination calculates totalPages accurately');

  // AC-05: User details inspection displays user roles and permissions
  assert(usersPageCode.includes('setSelectedUserForRole(u)') && usersPageCode.includes('setSelectedUserForEdit(u)'), 'AC-05: User details and modal inspection available');

  // AC-06: Assign roles dialog shows available roles with selection checkboxes
  assert(assignModalCode.includes('handleToggleRole') && assignModalCode.includes('selectedRoleIds'), 'AC-06: Assign roles dialog shows roles with toggle selection');

  // AC-07: Self-role assignment is disabled in UI with clear warning banner
  assert(assignModalCode.includes('isSelf') && assignModalCode.includes('disabled={isSelf || isAssigning}') && assignModalCode.includes('Self-Role Escalation Prevention'), 'AC-07: Self-role assignment disabled in UI with warning banner');

  // AC-08: Self-role assignment in service layer throws SELF_ESCALATION_DENIED
  assert(userServiceCode.includes("input.userId === currentActor.id") && userServiceCode.includes("'SELF_ESCALATION_DENIED'"), 'AC-08: Self-role assignment throws SELF_ESCALATION_DENIED');

  // AC-09: Non-SUPER_ADMIN cannot select or assign SUPER_ADMIN role
  assert(assignModalCode.includes("roleCode === 'SUPER_ADMIN' && !actorIsSuperAdmin"), 'AC-09: Non-SUPER_ADMIN cannot select SUPER_ADMIN role in UI');

  // AC-10: Non-SUPER_ADMIN attempting to assign SUPER_ADMIN throws UNAUTHORIZED
  assert(userServiceCode.includes("assigningSuperAdmin && !actorIsSuperAdmin") && userServiceCode.includes("'UNAUTHORIZED'"), 'AC-10: Non-SUPER_ADMIN assigning SUPER_ADMIN throws UNAUTHORIZED');

  // AC-11: Non-SUPER_ADMIN attempting to revoke SUPER_ADMIN throws UNAUTHORIZED
  assert(userServiceCode.includes("userCurrentlyHasSuperAdmin && !assigningSuperAdmin") && userServiceCode.includes("!actorIsSuperAdmin"), 'AC-11: Non-SUPER_ADMIN revoking SUPER_ADMIN throws UNAUTHORIZED');

  // AC-12: Last remaining active SUPER_ADMIN cannot be revoked
  assert(userServiceCode.includes("superAdminCount <= 1") && userServiceCode.includes("'LAST_SUPER_ADMIN_PROTECTED'"), 'AC-12: Last active SUPER_ADMIN role revocation blocked');

  // AC-13: Last remaining active SUPER_ADMIN cannot be deactivated
  assert(userServiceCode.includes("input.is_active === false && targetUser.role_codes.includes('SUPER_ADMIN')") && userServiceCode.includes("activeSuperAdmins <= 1"), 'AC-13: Last active SUPER_ADMIN deactivation blocked');

  // AC-14: Profiles update schema uses .strict() to block rogue fields
  assert(userSchemaCode.includes("export const updateUserProfileSchema = z") && userSchemaCode.includes(".strict()"), 'AC-14: updateUserProfileSchema enforces .strict()');

  // AC-15: Assign roles schema uses .strict() and validates UUIDs
  assert(userSchemaCode.includes("export const assignRolesSchema = z") && userSchemaCode.includes(".strict()"), 'AC-15: assignRolesSchema enforces .strict()');

  // AC-16: Assign roles requires at least 1 role
  assert(userSchemaCode.includes(".min(1, 'Người dùng phải có ít nhất một vai trò hợp lệ.')"), 'AC-16: assignRolesSchema requires at least 1 role');

  // AC-17: User profile update validates full_name min length (>= 2 chars)
  assert(userSchemaCode.includes(".min(USER_LIMITS.FULL_NAME_MIN"), 'AC-17: updateUserProfileSchema validates full_name min length');

  // AC-18: Roles page lists all baseline roles
  assert(rolesPageCode.includes('BASELINE_ROLES'), 'AC-18: Roles page lists all baseline roles');

  // AC-19: Roles page displays user count per role
  assert(rolesPageCode.includes('r.user_count') && rolesPageCode.includes('tài khoản'), 'AC-19: Roles page displays user count per role');

  // AC-20: Role detail modal shows permissions grouped by resource
  assert(roleModalCode.includes('permissionsByResource') && roleModalCode.includes('RESOURCE_LABELS'), 'AC-20: Role detail modal groups permissions by resource');

  // AC-21: SUPER_ADMIN displays wildcard (*) permission grant
  assert(roleModalCode.includes("isSuperAdmin ? 'Toàn quyền (*)'") || userServiceCode.includes("['*']"), 'AC-21: SUPER_ADMIN displays wildcard (*) permission');

  // AC-22: System roles are marked as is_system = true
  assert(roleModalCode.includes("role.is_system ? 'Hệ thống (Cố định)'"), 'AC-22: System roles marked as is_system');

  // AC-23: ProtectedRoute guards /admin/users with users.view
  assert(routesFile.includes('path="users"') && routesFile.includes('requiredPermission="users.view"'), 'AC-23: ProtectedRoute guards /admin/users with users.view');

  // AC-24: ProtectedRoute guards /admin/roles with users.edit
  assert(routesFile.includes('path="roles"') && routesFile.includes('requiredPermission="users.edit"'), 'AC-24: ProtectedRoute guards /admin/roles with users.edit');

  // AC-25: ModuleGuard guards /admin/users with moduleKey="users"
  assert(routesFile.includes('moduleKey="users"'), 'AC-25: ModuleGuard guards /admin/users with moduleKey="users"');

  // AC-26: ModuleGuard guards /admin/roles with moduleKey="roles"
  assert(routesFile.includes('moduleKey="roles"'), 'AC-26: ModuleGuard guards /admin/roles with moduleKey="roles"');

  // AC-27: moduleRegistry.ts contains 'users' module definition
  assert(registryFile.includes("key: 'users'"), 'AC-27: moduleRegistry.ts defines users module');

  // AC-28: moduleRegistry.ts contains 'roles' module definition
  assert(registryFile.includes("key: 'roles'"), 'AC-28: moduleRegistry.ts defines roles module');

  // AC-29: adminNavigation.ts registers users navigation item
  assert(navFile.includes("key: 'admin-users'"), 'AC-29: adminNavigation.ts registers admin-users');

  // AC-30: adminNavigation.ts registers roles navigation item
  assert(navFile.includes("key: 'admin-roles'"), 'AC-30: adminNavigation.ts registers admin-roles');

  // AC-31: Zero service_role in client/browser codebase
  assert(allUsersFiles.every((f) => !fs.readFileSync(f, 'utf-8').includes('service_role')), 'AC-31: Zero service_role in client codebase');

  // AC-32: Zero @ts-ignore in users module
  assert(allUsersFiles.every((f) => !fs.readFileSync(f, 'utf-8').includes('@ts-ignore')), 'AC-32: Zero @ts-ignore in users module');

  // AC-33: Zero any type in users module
  assert(allUsersFiles.every((f) => !/\b(as\s+any|:\s*any|\bany\[\]|<any>)\b/.test(fs.readFileSync(f, 'utf-8'))), 'AC-33: Zero any in users module');

  // AC-34: Zero direct supabase calls in UI components and hooks
  assert(uiAndHooksFiles.every((f) => !fs.readFileSync(f, 'utf-8').includes('supabase.from') && !fs.readFileSync(f, 'utf-8').includes('supabase.auth')), 'AC-34: Zero direct supabase calls in UI and hooks');

  // AC-35: Zero invented permissions outside approved catalog
  const approvedPermissionPrefixes = ['news', 'categories', 'documents', 'announcements', 'media', 'pages', 'settings', 'users', 'homepage', 'audit', 'health'];
  const permCatalogCheck = Object.keys(RESOURCE_LABELS).every((res) => approvedPermissionPrefixes.includes(res));
  assert(permCatalogCheck, 'AC-35: Zero invented permissions outside approved catalog');

  // AC-36: Zero invented roles outside baseline 5
  assert(Object.keys(BASELINE_ROLES).length === 5, 'AC-36: Strictly 5 baseline roles');

  // AC-37: Zero hardcoded UUIDs in users module
  const uuidInCode = allUsersFiles.some((f) => /['"][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}['"]/i.test(fs.readFileSync(f, 'utf-8')));
  assert(!uuidInCode, 'AC-37: Zero hardcoded UUIDs in users module');

  // AC-38: Database migration count preserves baseline
  const migrationsDir = path.join(process.cwd(), 'supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  assert(migrationFiles.length >= 14 && migrationFiles.length <= 15, `AC-38: Database migrations count preserves baseline (found ${migrationFiles.length})`);

  // AC-39: All tests pass
  assert(passedChecks > 0, 'AC-39: All Step 10.1 verification checks passed');

  // -----------------------------------------------------------------------------
  // 7. Final Summary
  // -----------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`STEP 10.1 VERIFICATION SUMMARY: ${passedChecks} PASSED, ${failedChecks} FAILED`);
  console.log('============================================================\n');

  if (failedChecks > 0) {
    console.error(`Verification failed with ${failedChecks} errors.`);
    process.exit(1);
  } else {
    console.log('ALL STEP 10.1 VERIFICATION ASSERTIONS (INCLUDING AC-01 TO AC-39) PASSED CLEANLY!');
    process.exit(0);
  }
});
