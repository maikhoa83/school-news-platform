# STEP 09.5B — MENUS & MENU ITEMS ADMIN UI SECURITY REVIEW

**Dự án:** School News Platform  
**Phase:** STEP 09.5B — Menus & Menu Items Admin UI  
**Phạm vi đánh giá:** An toàn bảo mật, phân quyền RBAC, kiểm soát dữ liệu đầu vào và phòng chống leo thang đặc quyền.

---

## 1. Phân quyền & RBAC Enforcement

### 1.1. Nguyên tắc cốt lõi
> *"Frontend permission check chỉ là UI behavior. Không được coi frontend permission check là security boundary. RLS trên Supabase là ranh giới bảo mật tối cao."*

Giao diện người dùng tuân thủ chặt chẽ:
- **Route Level:** Tuyến đường `/admin/menus` được bọc bởi `<ProtectedRoute requiredPermission="settings.view">`. Người dùng không có quyền này sẽ bị chặn ngay lập tức và chuyển hướng về trang Từ chối truy cập (`/access-denied`).
- **Component / Action Level:** Toàn bộ các hành động mang tính sửa đổi dữ liệu (tạo mới, sửa, xóa, kéo thả, di chuyển, bật/tắt kích hoạt) đều được kiểm tra điều kiện `hasPermission('settings.edit')`.
- Nếu tài khoản chỉ có quyền `settings.view` (chế độ chỉ xem):
  - Hiển thị thanh cảnh báo trực quan: *"Chế độ chỉ xem (Cần quyền settings.edit để sửa đổi)"*.
  - Ẩn hoặc vô hiệu hóa tất cả các nút tạo Menu, tạo Mục con, sửa, xóa, và kéo thả.

---

## 2. Kiểm soát dữ liệu đầu vào & Validation (Input Sanitization)

### 2.1. Zod Validation Schemas
- Mọi payload gửi lên server đều được validate qua Zod schema kế thừa từ `src/modules/menu/schemas/menuSchema.ts`.
- `MenuCreateInputSchema` và `MenuUpdateInputSchema` bắt buộc mã menu phải khớp định dạng `^[a-zA-Z0-9_-]+$`, chiều dài từ 1 đến 100 ký tự.
- `MenuItemCreateInputSchema` và `MenuItemUpdateInputSchema`:
  - `title`: từ 1 đến 255 ký tự, loại bỏ khoảng trắng thừa.
  - `url`: từ 1 đến 1000 ký tự.
  - `target`: chỉ chấp nhận `_self` hoặc `_blank`.
  - `page_id`: bắt buộc phải là UUID hợp lệ hoặc `null`.

### 2.2. Xử lý lỗi trùng lặp (Duplicate Code)
- Lỗi trùng lặp mã menu (`DUPLICATE_CODE`) được service bắt và ánh xạ thành lỗi trực quan trên trường nhập liệu, ngăn chặn lỗi crash ứng dụng hoặc thông báo lỗi kỹ thuật khó hiểu cho người quản trị.

---

## 3. Phòng chống tấn công & Tác động phụ (Attack Vectors & Side Effects)

### 3.1. Chống lỗi vòng lặp cây (Tree Cycle Prevention)
- Khi chỉnh sửa một mục menu, dropdown chọn mục cha tự động tính toán tập hợp các hậu duệ (`getDescendantIds`).
- Người dùng không thể chọn chính mục đó hoặc bất kỳ mục con/cháu nào của nó làm mục cha. Điều này triệt tiêu hoàn toàn khả năng gây lỗi lặp vô tận (infinite recursion / stack overflow) trong thuật toán dựng cây của frontend và backend.

### 3.2. Cảnh báo xóa lan truyền (Cascade Deletion Warnings)
- Menu có quan hệ khóa ngoại `ON DELETE CASCADE` tới bảng `menu_items`. Khi xóa menu, modal yêu cầu xác nhận rõ ràng với cảnh báo: *"Hành động này sẽ XÓA VĨNH VIỄN toàn bộ các mục menu trực thuộc menu này"*.
- Tương tự, bảng `menu_items` có quan hệ tự tham chiếu `parent_id ON DELETE CASCADE`. Modal xóa mục menu phân tích số lượng mục con và thông báo số mục con sẽ bị xóa đồng thời.

### 3.3. RLS Boundary
- Mọi truy vấn và mutation đều đi qua `supabaseClient` trong ngữ cảnh của người dùng đăng nhập hiện tại (Session Auth Token).
- Hệ thống không sử dụng `service_role` key tại bất kỳ điểm nào trong mã nguồn giao diện.
