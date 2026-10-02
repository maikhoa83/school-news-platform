# BẢN ĐẶC TẢ GIAO ƯỚC DỮ LIỆU & BẢO MẬT — STEP 10.1
## Step 10.1 Users + RBAC Foundation Contract

---

### 1. NGUYÊN TẮC RÀNG BUỘC KIẾN TRÚC (ARCHITECTURAL INVARIANTS)
1. **Ranh giới bảo mật tối cao là Database RLS**:
   - Giao diện người dùng và React Hooks chỉ đóng vai trò hỗ trợ trải nghiệm (UX Layer), tuyệt đối không coi là ranh giới bảo mật.
   - Mọi truy vấn và biến đổi dữ liệu thực thi bằng standard Supabase client với Session Token của người dùng hiện tại.
   - Tuyệt đối không dùng `service_role` trong mã nguồn frontend/client.
2. **Không tự tạo vai trò (Zero Invented Roles)**:
   - Hệ thống cố định đúng 5 vai trò chuẩn:
     1. `SUPER_ADMIN` (Quản trị viên tối cao — Bypass mọi giới hạn)
     2. `ADMIN` (Quản trị viên trường — Quản trị nội dung và người dùng)
     3. `EDITOR` (Biên tập viên — Duyệt và xuất bản bài viết)
     4. `AUTHOR` (Tác giả / Cộng tác viên — Soạn thảo nội dung)
     5. `PUBLIC_VISITOR` (Khách vãng lai — Đọc dữ liệu công khai)
3. **Không tự tạo quyền hạn (Zero Invented Permissions)**:
   - Toàn bộ quyền hạn thuộc danh mục đã được phê duyệt trong schema cơ sở dữ liệu (`news.*`, `categories.*`, `documents.*`, `announcements.*`, `media.*`, `pages.*`, `settings.*`, `users.*`, `homepage.*`, `audit.*`, `health.*`).
4. **Không hardcode UUIDs**:
   - Mọi định danh vai trò, người dùng, quyền hạn đều được tra cứu động qua database queries hoặc nhận từ tham số runtime.

---

### 2. GIAO ƯỚC DỮ LIỆU SCHEMA (DATA SCHEMAS & INPUT VALIDATION)

#### A. UUID Validation Schema
```typescript
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const uuidSchema = z.string().trim().regex(UUID_REGEX, 'Định dạng UUID không hợp lệ.');
```

#### B. Gán Vai Trò (Assign Roles Contract)
```typescript
export const assignRolesSchema = z.object({
  userId: uuidSchema,
  roleIds: z
    .array(uuidSchema)
    .min(1, 'Người dùng phải có ít nhất một vai trò hợp lệ.')
    .max(5, 'Không thể gán quá 5 vai trò cùng lúc.'),
}).strict(); // Ngăn chặn mass-assignment và truyền trường lạ
```

#### C. Cập Nhật Hồ Sơ (Update Profile Contract)
```typescript
export const updateUserProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(USER_LIMITS.FULL_NAME_MIN, `Họ và tên phải có ít nhất ${USER_LIMITS.FULL_NAME_MIN} ký tự.`)
    .max(USER_LIMITS.FULL_NAME_MAX, `Họ và tên không được vượt quá ${USER_LIMITS.FULL_NAME_MAX} ký tự.`)
    .optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  avatar_url: z.string().trim().url().nullable().optional(),
  is_active: z.boolean().optional(),
}).strict(); // Khóa chặt: Nghiêm cấm gán role_id, email hoặc quyền qua payload này
```

---

### 3. GIAO ƯỚC LOGIC BẢO VỆ PHÂN QUYỀN (SECURITY GUARD CONTRACTS)

| Mã Lỗi | Tên Lỗi | Hành Vi Bị Chặn |
| :--- | :--- | :--- |
| `SELF_ESCALATION_DENIED` | Tự leo thang đặc quyền | Actor tự gán hoặc thay đổi danh sách vai trò của chính mình (`actor.id === input.userId`). |
| `UNAUTHORIZED` | Gán vai trò vượt thẩm quyền | Actor không có vai trò `SUPER_ADMIN` cố gắng gán vai trò `SUPER_ADMIN` cho bất kỳ ai. |
| `UNAUTHORIZED` | Thu hồi vai trò tối cao trái phép | Actor không có vai trò `SUPER_ADMIN` cố gắng tước bỏ vai trò `SUPER_ADMIN` của người khác. |
| `LAST_SUPER_ADMIN_PROTECTED` | Bảo vệ Super Admin cuối cùng | Ngăn chặn việc thu hồi vai trò hoặc vô hiệu hóa (`is_active: false`) tài khoản `SUPER_ADMIN` đang hoạt động duy nhất của trường học. |
| `VALIDATION_ERROR` | Vi phạm schema hợp đồng | Payload chứa dữ liệu sai định dạng UUID, họ tên < 2 ký tự, hoặc mảng vai trò rỗng. |

---

### 4. GIAO ƯỚC ROUTE & MODULE GUARD

| Đường dẫn (Route) | Module Guard (`moduleKey`) | Protected Route (`requiredPermission`) | Component |
| :--- | :--- | :--- | :--- |
| `/admin/users` | `users` ("Tài khoản & Cán bộ") | `users.view` | `AdminUsersPage` |
| `/admin/roles` | `roles` ("Vai trò & Phân quyền") | `users.edit` | `AdminRolesPage` |
