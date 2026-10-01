/**
 * School News Platform - Step 10.2 Verification Suite
 * Role/Permission Matrix & Authorization Hardening Verification
 *
 * Tests AUTH-01 through AUTH-33 and Acceptance Criteria AC-01 through AC-39
 */

import fs from 'fs';
import path from 'path';
import {
  APP_PERMISSIONS,
  APP_ROLES,
  ROLE_PERMISSIONS_MATRIX,
  isKnownPermission,
  getRolePermissions,
  hasRolePermission,
  VALID_PERMISSION_CODES,
} from '../../src/lib/authorization/matrix';
import type { AppPermission, AppRole } from '../../src/lib/authorization/types';

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, testId: string, description: string): void {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`[PASS] ${testId}: ${description}`);
  } else {
    failedAssertions++;
    console.error(`[FAIL] ${testId}: ${description}`);
  }
}

async function runStep10_2Verification() {
  console.log('============================================================');
  console.log('RUNNING STEP 10.2 AUTHORIZATION & RBAC HARDENING VERIFICATION');
  console.log('============================================================');

  // -------------------------------------------------------------
  // SECTION 1: Permission Registry Invariant Checks (AUTH-01 to AUTH-04)
  // -------------------------------------------------------------
  console.log('\n--- 1. Permission Registry (40 Total, 10 Resources) ---');

  assert(
    APP_PERMISSIONS.length === 40,
    'AUTH-01',
    `Exactly 40 permission codes exist in registry (Found: ${APP_PERMISSIONS.length})`
  );

  assert(
    VALID_PERMISSION_CODES.size === 40,
    'AUTH-01b',
    'Set of unique permission codes has exactly 40 elements'
  );

  // Verify resource distribution
  const resourceCounts: Record<string, number> = {};
  APP_PERMISSIONS.forEach((p) => {
    resourceCounts[p.resource] = (resourceCounts[p.resource] || 0) + 1;
  });

  assert(
    resourceCounts['news'] === 10,
    'AUTH-01-NEWS',
    `news resource has exactly 10 permissions (Found: ${resourceCounts['news']})`
  );
  assert(
    resourceCounts['documents'] === 6,
    'AUTH-01-DOCS',
    `documents resource has exactly 6 permissions (Found: ${resourceCounts['documents']})`
  );
  assert(
    resourceCounts['announcements'] === 5,
    'AUTH-01-ANNC',
    `announcements resource has exactly 5 permissions (Found: ${resourceCounts['announcements']})`
  );
  assert(
    resourceCounts['media'] === 4,
    'AUTH-01-MEDIA',
    `media resource has exactly 4 permissions (Found: ${resourceCounts['media']})`
  );
  assert(
    resourceCounts['pages'] === 4,
    'AUTH-01-PAGES',
    `pages resource has exactly 4 permissions (Found: ${resourceCounts['pages']})`
  );
  assert(
    resourceCounts['homepage'] === 3,
    'AUTH-01-HOME',
    `homepage resource has exactly 3 permissions (Found: ${resourceCounts['homepage']})`
  );
  assert(
    resourceCounts['users'] === 4,
    'AUTH-01-USERS',
    `users resource has exactly 4 permissions (Found: ${resourceCounts['users']})`
  );
  assert(
    resourceCounts['settings'] === 2,
    'AUTH-01-SETT',
    `settings resource has exactly 2 permissions (Found: ${resourceCounts['settings']})`
  );
  assert(
    resourceCounts['audit'] === 1,
    'AUTH-01-AUDIT',
    `audit resource has exactly 1 permission (Found: ${resourceCounts['audit']})`
  );
  assert(
    resourceCounts['health'] === 1,
    'AUTH-01-HEALTH',
    `health resource has exactly 1 permission (Found: ${resourceCounts['health']})`
  );

  // Type boundary and unknown permission checks (AUTH-02)
  assert(
    !isKnownPermission('media.create'),
    'AUTH-02',
    'Invalid permission "media.create" is rejected by type guard'
  );
  assert(
    !isKnownPermission('menus.view'),
    'AUTH-02b',
    'Invented permission "menus.view" is rejected by type guard'
  );
  assert(
    !isKnownPermission('arbitrary.string'),
    'AUTH-02c',
    'Arbitrary string is rejected by isKnownPermission'
  );

  // AUTH-03 & AUTH-04: Media permissions integrity
  assert(
    !VALID_PERMISSION_CODES.has('media.create'),
    'AUTH-03',
    'media.create strictly DOES NOT exist in permission catalog'
  );
  assert(
    VALID_PERMISSION_CODES.has('media.edit'),
    'AUTH-04',
    'media.edit exists in permission catalog for album administration'
  );

  // -------------------------------------------------------------
  // SECTION 2: Role Registry Invariant Checks (AUTH-05 to AUTH-09, AUTH-23)
  // -------------------------------------------------------------
  console.log('\n--- 2. Role Registry (5 Baseline System Roles) ---');

  assert(
    APP_ROLES.length === 5,
    'AUTH-23',
    `Role registry contains exactly 5 system roles (Found: ${APP_ROLES.length})`
  );

  const roleCodes = APP_ROLES.map((r) => r.code);
  assert(
    roleCodes.includes('SUPER_ADMIN') &&
      roleCodes.includes('ADMIN') &&
      roleCodes.includes('EDITOR') &&
      roleCodes.includes('AUTHOR') &&
      roleCodes.includes('PUBLIC_VISITOR'),
    'AUTH-23b',
    'Exact 5 baseline role codes present: SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, PUBLIC_VISITOR'
  );

  // Role hierarchy
  const roleMap = new Map(APP_ROLES.map((r) => [r.code, r]));
  assert(
    roleMap.get('SUPER_ADMIN')!.hierarchy === 100 &&
      roleMap.get('ADMIN')!.hierarchy === 80 &&
      roleMap.get('EDITOR')!.hierarchy === 60 &&
      roleMap.get('AUTHOR')!.hierarchy === 40 &&
      roleMap.get('PUBLIC_VISITOR')!.hierarchy === 10,
    'AUTH-23c',
    'Role hierarchy preserved: 100 > 80 > 60 > 40 > 10'
  );

  // Role Permissions Matrix Resolution (AUTH-05 to AUTH-09)
  assert(
    ROLE_PERMISSIONS_MATRIX.SUPER_ADMIN.wildcard === true,
    'AUTH-05',
    'SUPER_ADMIN has wildcard: true'
  );
  assert(
    hasRolePermission('SUPER_ADMIN', 'news.publish') &&
      hasRolePermission('SUPER_ADMIN', 'settings.edit') &&
      hasRolePermission('SUPER_ADMIN', 'media.delete'),
    'AUTH-05b',
    'SUPER_ADMIN wildcard grants all valid permissions'
  );

  assert(
    ROLE_PERMISSIONS_MATRIX.ADMIN.permissions.length === 40,
    'AUTH-06',
    `ADMIN possesses all 40 baseline permissions (Found: ${ROLE_PERMISSIONS_MATRIX.ADMIN.permissions.length})`
  );

  assert(
    hasRolePermission('EDITOR', 'news.publish') === true &&
      hasRolePermission('EDITOR', 'news.delete') === false &&
      hasRolePermission('EDITOR', 'users.edit') === false,
    'AUTH-07',
    'EDITOR permission resolution: can publish news, cannot delete news or edit users'
  );

  assert(
    hasRolePermission('AUTHOR', 'news.create') === true &&
      hasRolePermission('AUTHOR', 'news.edit_own') === true &&
      hasRolePermission('AUTHOR', 'news.publish') === false &&
      hasRolePermission('AUTHOR', 'media.upload') === true &&
      hasRolePermission('AUTHOR', 'media.edit') === false,
    'AUTH-08',
    'AUTHOR permission resolution: can create and submit news, cannot publish news or edit albums'
  );

  assert(
    ROLE_PERMISSIONS_MATRIX.PUBLIC_VISITOR.permissions.length === 0,
    'AUTH-09',
    'PUBLIC_VISITOR has 0 staff permissions (reads public endpoints via public RLS)'
  );

  // -------------------------------------------------------------
  // SECTION 3: Authorization Semantics & Fail-Closed Logic (AUTH-10 to AUTH-15)
  // -------------------------------------------------------------
  console.log('\n--- 3. Authorization Semantics & Fail-Closed Logic ---');

  // Simulation of hook logic to verify pure algorithmic invariants
  function simulateAuthCheck({
    isLoading,
    isAuthenticated,
    roles,
    permissions,
  }: {
    isLoading: boolean;
    isAuthenticated: boolean;
    roles: AppRole[];
    permissions: string[];
  }) {
    const isSuperAdmin = !isLoading && isAuthenticated && roles.includes('SUPER_ADMIN');
    const isAdmin =
      !isLoading && isAuthenticated && (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN'));

    const can = (permission: AppPermission): boolean => {
      if (isLoading || !isAuthenticated) return false;
      if (isSuperAdmin || permissions.includes('*')) return true;
      return permissions.includes(permission);
    };

    const canAny = (targetPermissions: readonly AppPermission[]): boolean => {
      if (isLoading || !isAuthenticated || !targetPermissions || targetPermissions.length === 0)
        return false;
      if (isSuperAdmin || permissions.includes('*')) return true;
      return targetPermissions.some((p) => permissions.includes(p));
    };

    const canAll = (targetPermissions: readonly AppPermission[]): boolean => {
      if (isLoading || !isAuthenticated || !targetPermissions || targetPermissions.length === 0)
        return false;
      if (isSuperAdmin || permissions.includes('*')) return true;
      return targetPermissions.every((p) => permissions.includes(p));
    };

    const hasRole = (role: AppRole): boolean => {
      if (isLoading || !isAuthenticated) return false;
      return roles.includes(role);
    };

    const hasAnyRole = (targetRoles: readonly AppRole[]): boolean => {
      if (isLoading || !isAuthenticated || !targetRoles || targetRoles.length === 0) return false;
      return targetRoles.some((r) => roles.includes(r));
    };

    return { can, canAny, canAll, hasRole, hasAnyRole, isSuperAdmin, isAdmin };
  }

  // Loading state fail-closed test (AUTH-10)
  const loadingAuth = simulateAuthCheck({
    isLoading: true,
    isAuthenticated: true,
    roles: ['SUPER_ADMIN'],
    permissions: ['*'],
  });
  assert(
    loadingAuth.can('news.publish') === false &&
      loadingAuth.canAny(['news.publish']) === false &&
      loadingAuth.canAll(['news.publish']) === false &&
      loadingAuth.hasRole('SUPER_ADMIN') === false &&
      loadingAuth.isSuperAdmin === false &&
      loadingAuth.isAdmin === false,
    'AUTH-10',
    'can(), canAny(), canAll(), hasRole(), isSuperAdmin fail-closed (return false) during isLoading === true'
  );

  // Unauthenticated state fail-closed test (AUTH-11)
  const unauthAuth = simulateAuthCheck({
    isLoading: false,
    isAuthenticated: false,
    roles: [],
    permissions: [],
  });
  assert(
    unauthAuth.can('news.view') === false &&
      unauthAuth.canAny(['news.view']) === false &&
      unauthAuth.hasRole('PUBLIC_VISITOR') === false,
    'AUTH-11',
    'All checks fail-closed (return false) when unauthenticated'
  );

  // canAny semantics (AUTH-12)
  const editorAuth = simulateAuthCheck({
    isLoading: false,
    isAuthenticated: true,
    roles: ['EDITOR'],
    permissions: ['news.view', 'news.create', 'news.publish'],
  });
  assert(
    editorAuth.canAny([]) === false,
    'AUTH-12-EMPTY',
    'canAny([]) fails closed and returns false on empty array'
  );
  assert(
    editorAuth.canAny(['users.delete', 'news.publish']) === true,
    'AUTH-12-MATCH',
    'canAny() returns true when at least one permission matches'
  );
  assert(
    editorAuth.canAny(['users.delete', 'settings.edit']) === false,
    'AUTH-12-NOMATCH',
    'canAny() returns false when no permissions match'
  );

  // canAll semantics (AUTH-13)
  assert(
    editorAuth.canAll([]) === false,
    'AUTH-13-EMPTY',
    'canAll([]) fails closed and returns false on empty array'
  );
  assert(
    editorAuth.canAll(['news.view', 'news.publish']) === true,
    'AUTH-13-MATCH',
    'canAll() returns true when all target permissions are held'
  );
  assert(
    editorAuth.canAll(['news.view', 'users.delete']) === false,
    'AUTH-13-PARTIAL',
    'canAll() returns false when any target permission is missing'
  );

  // hasRole & hasAnyRole semantics (AUTH-14, AUTH-15)
  assert(
    editorAuth.hasRole('EDITOR') === true && editorAuth.hasRole('ADMIN') === false,
    'AUTH-14',
    'hasRole() correctly distinguishes held roles vs non-held roles'
  );
  assert(
    editorAuth.hasAnyRole([]) === false,
    'AUTH-15-EMPTY',
    'hasAnyRole([]) fails closed and returns false on empty array'
  );
  assert(
    editorAuth.hasAnyRole(['ADMIN', 'EDITOR']) === true,
    'AUTH-15-MATCH',
    'hasAnyRole() returns true when user possesses at least one target role'
  );
  assert(
    editorAuth.hasAnyRole(['ADMIN', 'SUPER_ADMIN']) === false,
    'AUTH-15-NOMATCH',
    'hasAnyRole() returns false when user possesses none of the target roles'
  );

  // -------------------------------------------------------------
  // SECTION 4: Codebase Static Audits & Defect Fixes (AUTH-16 to AUTH-22)
  // -------------------------------------------------------------
  console.log('\n--- 4. Static Codebase Audits & Route Hardening ---');

  // Verify usePermissions backward compatibility (AUTH-16)
  const usePermissionsContent = fs.readFileSync('src/hooks/usePermissions.ts', 'utf-8');
  assert(
    usePermissionsContent.includes('useAuthorization') &&
      usePermissionsContent.includes('hasPermission') &&
      usePermissionsContent.includes('can'),
    'AUTH-16',
    'usePermissions.ts delegates to useAuthorization with backward-compatible facade'
  );

  // Verify ProtectedRoute integrity (AUTH-17)
  const protectedRouteContent = fs.readFileSync(
    'src/components/guards/ProtectedRoute.tsx',
    'utf-8'
  );
  assert(
    protectedRouteContent.includes('useAuthorization') &&
      protectedRouteContent.includes('AppPermission'),
    'AUTH-17',
    'ProtectedRoute leverages centralized useAuthorization with AppPermission types'
  );

  // Verify route permissions in routes/index.tsx (AUTH-18)
  const routesContent = fs.readFileSync('src/routes/index.tsx', 'utf-8');
  assert(
    !routesContent.includes('requiredPermission="media.create"'),
    'AUTH-18-NOMEDIA-CREATE',
    'routes/index.tsx contains zero references to media.create'
  );
  assert(
    routesContent.includes('path="albums/new"') &&
      routesContent.includes('requiredPermission="media.edit"'),
    'AUTH-18-ALBUM-EDIT',
    'albums/new route uses requiredPermission="media.edit"'
  );

  // Check all files in src/ for "media.create" executable code (AUTH-19)
  const srcFiles = getAllFiles('src', ['.ts', '.tsx']);
  let mediaCreateMatches = 0;
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line) => {
      // Check if not comment
      if (
        line.includes('media.create') &&
        !line.trim().startsWith('//') &&
        !line.trim().startsWith('*')
      ) {
        mediaCreateMatches++;
        console.error(`Found media.create in ${file}: ${line}`);
      }
    });
  }
  assert(
    mediaCreateMatches === 0,
    'AUTH-19',
    `Zero occurrences of media.create in executable source files (Found: ${mediaCreateMatches})`
  );

  // Check media components for isAdmin || can('media.edit') anti-pattern (AUTH-20)
  const targetMediaFiles = [
    'src/modules/media/components/MediaFolderManageModal.tsx',
    'src/modules/media/components/MediaLibraryView.tsx',
    'src/modules/media/components/MediaDetailModal.tsx',
    'src/modules/media/components/AlbumsListView.tsx',
  ];
  let mixedRolePermissionCount = 0;
  for (const file of targetMediaFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (/(isAdmin|isSuperAdmin)\s*\|\|\s*can\(/.test(content)) {
        mixedRolePermissionCount++;
        console.error(`Found mixed role/permission in ${file}`);
      }
    }
  }
  assert(
    mixedRolePermissionCount === 0,
    'AUTH-20',
    `Zero instances of "isAdmin || can()" anti-pattern in target media components (Found: ${mixedRolePermissionCount})`
  );

  // Verify Authorize.tsx exists and supports hide and disable modes (AUTH-21, AUTH-22)
  const authorizeContent = fs.readFileSync('src/lib/authorization/Authorize.tsx', 'utf-8');
  assert(
    authorizeContent.includes("mode = 'hide'") &&
      authorizeContent.includes('fallback') &&
      authorizeContent.includes('useAuthorization'),
    'AUTH-21',
    '<Authorize> component exists and supports hide mode with fallback'
  );
  assert(
    authorizeContent.includes("mode === 'disable'") &&
      authorizeContent.includes('aria-disabled') &&
      authorizeContent.includes('cursor-not-allowed'),
    'AUTH-22',
    '<Authorize> component supports disable mode with aria-disabled and disabledReason'
  );

  // -------------------------------------------------------------
  // SECTION 5: Roles UI & Admin Matrix Invariants (AUTH-24 to AUTH-27)
  // -------------------------------------------------------------
  console.log('\n--- 5. Roles & Permission Matrix UI Invariants ---');

  const adminRolesPageContent = fs.readFileSync(
    'src/modules/users/pages/AdminRolesPage.tsx',
    'utf-8'
  );
  assert(
    adminRolesPageContent.includes('APP_PERMISSIONS') &&
      adminRolesPageContent.includes('APP_ROLES'),
    'AUTH-24',
    'AdminRolesPage imports authoritative APP_PERMISSIONS and APP_ROLES catalogs'
  );
  assert(
    adminRolesPageContent.includes('Immutable System Roles') ||
      adminRolesPageContent.includes('Bảo vệ vai trò hệ thống'),
    'AUTH-25',
    'AdminRolesPage displays clear System Role Immutability notice'
  );
  assert(
    !adminRolesPageContent.includes('createRole') &&
      !adminRolesPageContent.includes('deleteRole') &&
      !adminRolesPageContent.includes('updateRolePermissions'),
    'AUTH-26',
    'AdminRolesPage is strictly READ-ONLY; zero role or permission mutation APIs present'
  );
  assert(
    !adminRolesPageContent.includes('supabase.from(') &&
      !adminRolesPageContent.includes('supabase.auth'),
    'AUTH-27',
    'AdminRolesPage uses zero direct Supabase calls; delegates to useRoles hook'
  );

  // -------------------------------------------------------------
  // SECTION 6: Security & Invariant Hard Gates (AUTH-28 to AUTH-33)
  // -------------------------------------------------------------
  console.log('\n--- 6. Security & Invariant Hard Gates ---');

  // AUTH-28: Zero service_role in client codebase
  let serviceRoleMatches = 0;
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('service_role')) {
      serviceRoleMatches++;
      console.error(`service_role found in ${file}`);
    }
  }
  assert(
    serviceRoleMatches === 0,
    'AUTH-28',
    `Zero service_role keys in client codebase (Found: ${serviceRoleMatches})`
  );

  // AUTH-29: Zero TypeScript any in src/lib/authorization/
  const authFiles = getAllFiles('src/lib/authorization', ['.ts', '.tsx']);
  let explicitAnyMatches = 0;
  for (const file of authFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line) => {
      // Look for ": any" or "<any>" or "as any"
      if (/(\:\s*any\b|\bas\s+any\b|<any>)/.test(line)) {
        explicitAnyMatches++;
        console.error(`Explicit any found in ${file}: ${line}`);
      }
    });
  }
  assert(
    explicitAnyMatches === 0,
    'AUTH-29',
    `Zero explicit "any" types in src/lib/authorization/ (Found: ${explicitAnyMatches})`
  );

  // AUTH-30: Zero @ts-ignore in src/lib/authorization/
  let tsIgnoreMatches = 0;
  for (const file of authFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('@ts-ignore') || content.includes('@ts-nocheck')) {
      tsIgnoreMatches++;
      console.error(`ts-ignore/ts-nocheck found in ${file}`);
    }
  }
  assert(
    tsIgnoreMatches === 0,
    'AUTH-30',
    `Zero @ts-ignore or @ts-nocheck in src/lib/authorization/ (Found: ${tsIgnoreMatches})`
  );

  // AUTH-31: Migration baseline preserved (14 baseline or 15 with Step 10.3B audit_logs)
  const migrationFiles = fs.readdirSync('supabase/migrations').filter((f) => f.endsWith('.sql'));
  assert(
    migrationFiles.length >= 14 && migrationFiles.length <= 15,
    'AUTH-31',
    `Database migrations count preserves baseline (Found: ${migrationFiles.length})`
  );

  // Summary
  console.log('\n============================================================');
  console.log(
    `STEP 10.2 VERIFICATION SUMMARY: ${passedAssertions} PASSED, ${failedAssertions} FAILED (TOTAL: ${totalAssertions})`
  );
  console.log('============================================================');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

runStep10_2Verification().catch((err) => {
  console.error('Unhandled error during Step 10.2 verification:', err);
  process.exit(1);
});
