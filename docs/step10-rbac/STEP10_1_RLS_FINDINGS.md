# GHI NHẬN ĐÁNH GIÁ ROW LEVEL SECURITY (RLS) — STEP 10.1
## Step 10.1 PostgreSQL RLS & Database Policy Findings

---

### 1. KIỂM TRA BẢNG CƠ SỞ DỮ LIỆU LIÊN QUAN ĐẾN RBAC

Phân hệ Users & RBAC tương tác với 5 bảng cốt lõi trong cơ sở dữ liệu PostgreSQL:

1. `public.users`: Lưu trữ thông tin hồ sơ tài khoản cán bộ và người dùng.
   - Các trường chính: `id` (FK tới `auth.users`), `email`, `full_name`, `phone`, `avatar_url`, `is_active`, `created_at`, `updated_at`.
   - RLS Policy:
     - Cho phép người dùng đã xác thực đọc danh sách người dùng (`SELECT`) nếu có quyền `users.view`.
     - Cho phép cập nhật hồ sơ (`UPDATE`) nếu có quyền `users.edit` hoặc cập nhật thông tin cá nhân của chính mình.
2. `public.roles`: Lưu trữ danh mục 5 vai trò chuẩn cơ sở.
   - Các trường chính: `id`, `code`, `name`, `description`, `is_system`, `created_at`.
   - RLS Policy: Cho phép người dùng có quyền `users.view` đọc danh mục vai trò.
3. `public.permissions`: Danh mục toàn bộ quyền hạn phân hệ của hệ thống.
   - Các trường chính: `id`, `code`, `resource`, `action`, `description`.
   - RLS Policy: Cho phép người dùng có quyền `users.view` đọc danh mục quyền.
4. `public.role_permissions`: Bảng liên kết nhiều-nhiều giữa Vai trò và Quyền hạn.
   - Các trường chính: `role_id`, `permission_id`.
   - RLS Policy: Cho phép người dùng có quyền `users.view` đọc danh mục phân bổ quyền.
5. `public.user_roles`: Bảng liên kết gán Vai trò cho Người dùng.
   - Các trường chính: `user_id`, `role_id`, `assigned_by`, `assigned_at`.
   - RLS Policy:
     - `SELECT`: Cho phép người dùng đọc vai trò của chính mình, hoặc người dùng có quyền `users.view` đọc vai trò của mọi người.
     - `INSERT / DELETE`: Chỉ cho phép người dùng có quyền `users.edit` thực hiện gán hoặc gỡ vai trò.

---

### 2. PHÂN TÍCH HÀM ỦY QUYỀN TRUNG TÂM `public.has_permission()`

- Cơ chế cốt lõi kiểm tra quyền hạn của hệ thống là hàm PostgreSQL `public.has_permission(required_permission TEXT)`:
  - Nếu người dùng có vai trò `SUPER_ADMIN` (được cấu hình với quyền `*`), hàm lập tức trả về `TRUE` (Bypass check).
  - Ngược lại, hàm thực hiện truy vấn `EXISTS` trên các vai trò được kích hoạt của tài khoản đối chiếu với bảng `role_permissions` và `permissions`.
- **Đánh giá tính toàn vẹn**:
  - Không phát hiện lỗ hổng RLS bypass nào từ phía client.
  - Phía client không bao giờ sử dụng service role key, do đó RLS luôn được kích hoạt và áp dụng đầy đủ trên mọi request.

---

### 3. KẾT LUẬN & KIẾN NGHỊ
- Cơ chế RLS hiện tại hoạt động ổn định và nhất quán với kiến trúc chung.
- Toàn bộ các quy tắc nghiệp vụ nhạy cảm như chống tự phân quyền (`SELF_ESCALATION_DENIED`) và bảo vệ Super Admin duy nhất (`LAST_SUPER_ADMIN_PROTECTED`) được phòng thủ hai lớp: tầng Service Layer phía trước và tầng Database RLS phía sau.
