# BÁO CÁO TRIỂN KHAI STEP 10.1 — USERS + RBAC FOUNDATION
## Hệ Thống Cổng Thông Tin Trường Học (School News Platform)

---

### 1. TỔNG QUAN TRIỂN KHAI
Step 10.1 thiết lập toàn diện phân hệ Quản trị Người Dùng và Nền tảng Phân quyền RBAC (Role-Based Access Control) cho School News Platform, tuân thủ nghiêm ngặt kiến trúc:
```
Admin UI (React Pages & Modals)
  └── React Hooks (useUsers, useUser, useUserRoles, useRoles, useSystemPermissions, useUserMutations)
        └── Service Layer (src/modules/users/services/userService.ts)
              └── Supabase Client (Standard Client with RLS)
                    └── PostgreSQL / RLS Policies (Public & System Schemas)
```

---

### 2. CÁC TẬP TIN & THÀNH PHẦN ĐÃ TRIỂN KHAI

#### A. Domain Types & Schemas
- `src/types/user.ts`: Facade domain type cho toàn bộ hệ thống (UserRecord, Role, Permission, RoleCode, etc.).
- `src/modules/users/types/user.ts`: Khai báo chi tiết các kiểu dữ liệu nội bộ của phân hệ Users & RBAC.
- `src/modules/users/config/userConfig.ts`: Cấu hình danh mục 5 vai trò chuẩn cơ sở (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `PUBLIC_VISITOR`), trọng số thứ bậc `ROLE_HIERARCHY`, nhãn tài nguyên `RESOURCE_LABELS`, giới hạn ký tự `USER_LIMITS`.
- `src/modules/users/schemas/userSchema.ts`: Zod schema validation với chế độ `.strict()`, kiểm tra nghiêm ngặt định dạng UUID, tên tối thiểu 2 ký tự, ngăn chặn mass-assignment và privilege escalation qua payload.

#### B. Service Layer
- `src/modules/users/services/userService.ts`:
  - `listUsers(params)`: Truy vấn danh sách người dùng, tìm kiếm theo tên và email, phân trang, lọc theo vai trò và trạng thái.
  - `getUserById(id)`: Lấy thông tin chi tiết một tài khoản kèm danh sách vai trò và quyền hạn.
  - `listRoles()`: Lấy danh mục 5 vai trò kèm số lượng tài khoản được gán và danh sách quyền hạn.
  - `listPermissions()`: Lấy toàn bộ danh mục quyền hệ thống nhóm theo tài nguyên.
  - `getUserStats()`: Thống kê tổng số người dùng, số tài khoản đang hoạt động, đã khóa, và số quản trị viên.
  - `assignUserRoles(input, currentActor)`: Gán vai trò cho người dùng với cơ chế bảo vệ phân quyền nhiều tầng.
  - `updateUserProfile(input, currentActor)`: Cập nhật hồ sơ (họ tên, số điện thoại, ảnh đại diện, trạng thái kích hoạt).
  - `countActiveSuperAdmins()`: Đếm số lượng tài khoản `SUPER_ADMIN` đang hoạt động để bảo vệ tài khoản quản trị tối cao cuối cùng.
  - `UserServiceError`: Phân loại lỗi chuẩn hóa (`SELF_ESCALATION_DENIED`, `UNAUTHORIZED`, `LAST_SUPER_ADMIN_PROTECTED`, `VALIDATION_ERROR`, etc.).
- `src/services/userService.ts`: Re-export facade layer đảm bảo tương thích ngược.

#### C. React Hooks
- `src/modules/users/hooks/useUsers.ts`: Quản lý danh sách người dùng, thống kê, bộ lọc, phân trang, debounced search.
- `src/modules/users/hooks/useUser.ts`: Lấy và quản lý chi tiết một tài khoản.
- `src/modules/users/hooks/useUserRoles.ts`: Lấy danh sách vai trò của một tài khoản.
- `src/modules/users/hooks/useRoles.ts`: Lấy toàn bộ danh sách vai trò và ma trận quyền hạn.
- `src/modules/users/hooks/usePermissions.ts`: Lấy danh mục quyền hạn hệ thống.
- `src/modules/users/hooks/useUserMutations.ts`: Điều phối các thao tác gán vai trò và cập nhật hồ sơ với callback thông báo.
- `src/modules/users/hooks/index.ts`: Barrel export cho toàn bộ hooks của phân hệ.

#### D. UI Components & Pages
- `src/modules/users/components/UserRoleBadge.tsx`: Huy hiệu vai trò hiển thị trực quan theo cấp bậc và mã màu quy chuẩn.
- `src/modules/users/components/UserStatusBadge.tsx`: Huy hiệu trạng thái hoạt động (Đang hoạt động / Đã khóa).
- `src/modules/users/components/AssignRoleModal.tsx`: Hộp thoại phân quyền vai trò, cảnh báo và vô hiệu hóa tự phân quyền (Self-Role Escalation Prevention), khóa lựa chọn `SUPER_ADMIN` đối với actor không phải `SUPER_ADMIN`.
- `src/modules/users/components/UserEditModal.tsx`: Hộp thoại chỉnh sửa thông tin hồ sơ và trạng thái tài khoản.
- `src/modules/users/components/RoleDetailModal.tsx`: Hộp thoại xem chi tiết ma trận quyền hạn theo từng tài nguyên.
- `src/modules/users/components/index.ts`: Barrel export cho toàn bộ components.
- `src/modules/users/pages/AdminUsersPage.tsx`: Trang quản trị danh sách người dùng và cán bộ.
- `src/modules/users/pages/AdminRolesPage.tsx`: Trang trực quan hóa ma trận vai trò và phân quyền (RBAC Matrix).
- `src/pages/admin/AdminUsersPage.tsx`: Re-export routing layer cho Users page.
- `src/pages/admin/AdminRolesPage.tsx`: Re-export routing layer cho Roles page.

#### E. Navigation & Routing Integration
- `src/routes/index.tsx`:
  - Tuyến `/admin/users` được bảo vệ bởi `ProtectedRoute` (`requiredPermission="users.view"`) và `ModuleGuard` (`moduleKey="users"`).
  - Tuyến `/admin/roles` được bảo vệ bởi `ProtectedRoute` (`requiredPermission="users.edit"`) và `ModuleGuard` (`moduleKey="roles"`).
- `src/lib/moduleRegistry.ts`: Đăng ký 2 module `users` và `roles` với quyền hạn tương ứng.
- `src/navigation/adminNavigation.ts`: Đăng ký menu Quản lý Người dùng và Phân quyền Vai trò trong sidebar quản trị.

---

### 3. ĐÁNH GIÁ CHẤT LƯỢNG (CODE QUALITY AUDIT)
- Zero `service_role` trong toàn bộ mã nguồn frontend/client.
- Zero `@ts-ignore` trong toàn bộ phân hệ.
- Zero `any` keyword trong toàn bộ phân hệ (đã dùng explicit type interfaces `RawUserRow`, `RawSuperAdminRow`, etc.).
- Zero direct `supabase.from()` hay `supabase.auth` trong UI components và hooks.
- 100% tuân thủ TypeScript compiler (`tsc --noEmit` hoàn thành không lỗi).
- 100% production build bundle (`vite build` & `esbuild server.ts` thành công).
