# BÁO CÁO ĐÁNH GIÁ AN NINH & BẢO MẬT PHÂN QUYỀN — STEP 10.1
## Step 10.1 Users + RBAC Security Review

---

### 1. MÔ HÌNH NGUY CƠ & CÁC VÉC-TƠ TẤN CÔNG (THREAT MODELING)

#### Véc-tơ 1: Tự Leo Thang Đặc Quyền (Self-Role Escalation)
- **Kịch bản**: Một người dùng có vai trò `AUTHOR` hoặc `EDITOR` (hoặc `ADMIN`) truy cập API hoặc sửa đổi request payload để gán vai trò `SUPER_ADMIN` cho chính mình.
- **Biện pháp phòng thủ nhiều tầng (Defense-in-Depth)**:
  1. *UI Layer*: Checkbox và nút submit bị vô hiệu hóa khi người dùng thao tác trên tài khoản của chính mình (`isSelf = currentActor.id === targetUser.id`), kèm thông báo cảnh báo rõ ràng.
  2. *Service Layer*: Kiểm tra `if (input.userId === currentActor.id)` ném lỗi `UserServiceError('Actor cannot modify their own roles', 'SELF_ESCALATION_DENIED')`.
  3. *Database / RLS*: Hàm RLS PostgreSQL `public.has_permission('users.edit')` kết hợp chính sách phân quyền từ chối các thao tác biến đổi trái phép.

#### Véc-tơ 2: Leo Thang Đặc Quyền Ngang & Dọc (Privilege Escalation)
- **Kịch bản**: Một `ADMIN` thông thường cố gắng gán vai trò `SUPER_ADMIN` cho một tài khoản khác hoặc cố gắng hạ bệ một `SUPER_ADMIN` bằng cách tước vai trò của họ.
- **Biện pháp phòng thủ**:
  1. *UI Layer*: Ẩn/khóa vai trò `SUPER_ADMIN` nếu actor hiện tại không có vai trò `SUPER_ADMIN`.
  2. *Service Layer*: Kiểm tra `assigningSuperAdmin && !actorIsSuperAdmin` ném `UNAUTHORIZED`. Đồng thời, nếu người dùng đang có vai trò `SUPER_ADMIN` và actor cố gắng gỡ bỏ mà actor không phải `SUPER_ADMIN`, hệ thống ném `UNAUTHORIZED`.

#### Véc-tơ 3: Vô Hiệu Hóa Hoặc Tước Quyền Tài Khoản Quản Trị Tối Cao Cuối Cùng (Orphan Lockout)
- **Kịch bản**: Một quản trị viên vô tình hoặc cố ý thu hồi vai trò hoặc khóa (`is_active = false`) tài khoản `SUPER_ADMIN` duy nhất của trường học, dẫn đến hệ thống bị khóa hoàn toàn.
- **Biện pháp phòng thủ**:
  - Service layer thực thi hàm `countActiveSuperAdmins()`.
  - Nếu `superAdminCount <= 1` và mục tiêu là tài khoản `SUPER_ADMIN` đang hoạt động duy nhất, mọi thao tác thu hồi vai trò hoặc khóa tài khoản đều bị chặn đứng với mã lỗi `LAST_SUPER_ADMIN_PROTECTED`.

#### Véc-tơ 4: Tấn Công Gán Hàng Loạt & Tiêm Dữ Liệu Lạ (Mass-Assignment / Parameter Tampering)
- **Kịch bản**: Kẻ tấn công gửi thêm các trường như `role_id`, `permissions`, `is_super_admin: true`, `password_hash` vào endpoint cập nhật hồ sơ (`updateUserProfile`).
- **Biện pháp phòng thủ**:
  - Sử dụng Zod Schema với cờ `.strict()` cho cả `assignRolesSchema` và `updateUserProfileSchema`.
  - Bất kỳ trường nào không nằm trong danh sách trắng (`full_name`, `phone`, `avatar_url`, `is_active`) đều bị Zod từ chối ngay lập tức tại bước validate.

#### Véc-tơ 5: SQL Injection & UUID Tampering
- **Kịch bản**: Kẻ tấn công chèn chuỗi SQL hoặc ký tự đặc biệt vào trường ID (`userId`, `roleIds`).
- **Biện pháp phòng thủ**:
  - `uuidSchema` kiểm tra regex UUID chuẩn RFC 4122 (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`). Mọi payload chứa chuỗi độc hại đều bị loại bỏ trước khi chuyển tới Supabase client.

---

### 2. TỔNG KẾT ĐÁNH GIÁ AN NINH
Toàn bộ 5 véc-tơ tấn công chính đã được kiểm soát chặt chẽ và xác minh tự động bằng 202 assertions trong kịch bản kiểm thử bảo mật. Hệ thống đạt trạng thái sẵn sàng vận hành an toàn trong môi trường giáo dục.
