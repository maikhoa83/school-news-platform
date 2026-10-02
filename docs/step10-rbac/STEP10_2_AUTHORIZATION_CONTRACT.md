# STEP 10.2: AUTHORIZATION API CONTRACT & TYPE SPECIFICATION

**Project:** School News Platform  
**Version:** 1.0 (Step 10.2)  
**Status:** Canonical Reference  
**Audience:** Frontend Engineers, Security Auditors, Backend Integrators  

---

## 1. System Roles Registry

The platform defines exactly **5 baseline system roles**, ordered hierarchically by numerical privilege weight:

```typescript
export type AppRole =
  | 'SUPER_ADMIN'     // Hierarchy 100: Wildcard bypass (*)
  | 'ADMIN'           // Hierarchy 80: Full operational school administration (40/40 permissions)
  | 'EDITOR'          // Hierarchy 60: Editorial content moderation & publication
  | 'AUTHOR'          // Hierarchy 40: Content drafting, editing own articles, asset upload
  | 'PUBLIC_VISITOR'; // Hierarchy 10: Anonymous public website visitor (0 staff permissions)
```

System roles are **immutable**. They cannot be renamed, deleted, or re-hierarchized via UI or client services.

---

## 2. System Permissions Registry (40 Permissions)

All 40 permissions are strictly grouped across 10 functional resources:

```typescript
export type AppPermission =
  // 1. News (10)
  | 'news.view' | 'news.create' | 'news.edit' | 'news.edit_own' | 'news.delete'
  | 'news.delete_own' | 'news.publish' | 'news.unpublish' | 'news.feature' | 'news.archive'
  // 2. Documents (6)
  | 'documents.view' | 'documents.create' | 'documents.edit' | 'documents.delete'
  | 'documents.publish' | 'documents.archive'
  // 3. Announcements (5)
  | 'announcements.view' | 'announcements.create' | 'announcements.edit'
  | 'announcements.delete' | 'announcements.publish'
  // 4. Media (4) - NOTE: media.create does NOT exist; media.edit covers album admin
  | 'media.view' | 'media.upload' | 'media.edit' | 'media.delete'
  // 5. Pages (4)
  | 'pages.view' | 'pages.create' | 'pages.edit' | 'pages.delete'
  // 6. Homepage (3)
  | 'homepage.view' | 'homepage.edit' | 'homepage.publish'
  // 7. Users & Roles (4)
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
  // 8. Settings (2)
  | 'settings.view' | 'settings.edit'
  // 9. Audit (1)
  | 'audit.view'
  // 10. Health (1)
  | 'health.view';
```

---

## 3. Hook Contracts

### 3.1 `useAuthorization()`
Canonical React hook for centralized RBAC checks:

```typescript
export interface UseAuthorizationReturn {
  // Evaluation Helpers (Fail-Closed)
  can: (permission: AppPermission) => boolean;
  canAny: (permissions: readonly AppPermission[]) => boolean;
  canAll: (permissions: readonly AppPermission[]) => boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: readonly AppRole[]) => boolean;

  // Identity State
  roles: readonly AppRole[];
  permissions: readonly string[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

#### Evaluation Rules:
1. **Loading State**: If `isLoading === true`, ALL methods return `false`.
2. **Unauthenticated State**: If `isAuthenticated === false`, ALL methods return `false`.
3. **Wildcard Expansion**: If user has role `SUPER_ADMIN` or permission `*`, `can()`, `canAny()`, and `canAll()` return `true`.
4. **Empty Target Arrays**: `canAny([])`, `canAll([])`, and `hasAnyRole([])` return `false`.

### 3.2 Backward-Compatible `usePermissions()`
Facade wrapping `useAuthorization()` for legacy call sites:

```typescript
export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  can: (permission: AppPermission) => boolean;
  canAny: (permissions: readonly AppPermission[]) => boolean;
  canAll: (permissions: readonly AppPermission[]) => boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: readonly AppRole[]) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

---

## 4. UI Component Contract: `<Authorize />`

Declarative authorization component:

```typescript
export interface AuthorizeProps {
  // Permission requirements
  permission?: AppPermission;
  permissions?: readonly AppPermission[];
  strategy?: 'all' | 'any'; // Default: 'all'

  // Role requirements
  role?: AppRole;
  roles?: readonly AppRole[];

  // Handling mode
  mode?: 'hide' | 'disable'; // Default: 'hide'
  fallback?: React.ReactNode; // Rendered when mode === 'hide' and unauthorized
  disabledReason?: string;    // Tooltip message when mode === 'disable'

  children: React.ReactNode;
}
```

### Modes:
- **`hide` (default)**: Returns `fallback` (or `null`) when unauthorized.
- **`disable`**: Wraps children in a container with `aria-disabled="true"`, pointer events disabled, opacity reduced, and accessible `title` tooltip.
