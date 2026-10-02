# STEP 09.5B — MENUS & MENU ITEMS ADMIN UI IMPLEMENTATION REPORT

**Dự án:** School News Platform  
**Phase:** STEP 09.5B — Menus & Menu Items Admin UI Implementation  
**Status:** COMPLETED & VERIFIED  
**Architecture:** ONE CODEBASE → ONE SCHOOL INSTALLATION → ONE DATABASE → ONE AUTH → ONE STORAGE → ONE DOMAIN  

---

## 1. Executive Summary

STEP 09.5B triển khai giao diện Quản trị Menu & Điều hướng (Menus & Menu Items Admin UI) tại đường dẫn `/admin/menus`. Phase này kết nối trực tiếp với tầng dịch vụ và hooks đã hoàn thiện từ STEP 09.4B (`useMenus`, `useMenuTree`, `useMenuMutations`, `menuSchema.ts`, `menuService.ts`).

Giao diện được thiết kế theo cấu trúc **Master-Detail** đáp ứng trải nghiệm desktop và di động tối ưu:
- **Cột Master (Danh sách Menu):** Tìm kiếm theo tên/mã định danh, lọc theo vị trí hiển thị (`header`, `footer`, `sidebar`), lọc theo trạng thái (`active`, `inactive`), sắp xếp linh hoạt, kích hoạt modal tạo menu và quản lý menu.
- **Cột Detail (Cây Mục Menu):** Hiển thị trực quan cấu trúc dạng cây phân cấp đa cấp với thụt đầu dòng, phân biệt rõ ràng liên kết trang tĩnh nội bộ (`page_id`) và liên kết tùy biến/ngoài (`url`), biểu tượng mở tab mới (`_blank`), điều khiển thứ tự cùng cấp thông qua cả kéo thả HTML5 và nút điều hướng bàn phím (Move Up / Move Down), cùng cơ chế chống tạo vòng lặp cây (cycle prevention) ngay tại UI.

---

## 2. File & Component Structure

Tất cả thành phần được cấu trúc chuẩn hóa trong module `src/modules/menu/`:

```
src/modules/menu/
├── components/
│   ├── MenuLocationBadge.tsx          # Badge hiển thị vị trí (header, footer, sidebar)
│   ├── MenuStatusBadge.tsx            # Badge trạng thái kích hoạt (hoạt động / đang ẩn)
│   ├── MenuDeleteConfirmModal.tsx     # Modal xác nhận xóa Menu với cảnh báo CASCADE DELETE
│   ├── MenuFormModal.tsx              # Modal tạo / sửa Menu với validation Zod
│   ├── MenuItemDeleteConfirmModal.tsx # Modal xác nhận xóa MenuItem với cảnh báo xóa mục con CASCADE
│   ├── MenuItemFormModal.tsx          # Modal tạo / sửa MenuItem, chọn trang tĩnh, chống vòng lặp
│   ├── MenuItemTreeNode.tsx           # Render đệ quy node mục menu và các mục con
│   ├── MenuItemTree.tsx               # Container cây menu với sắp xếp thứ tự và rỗng/đang tải
│   └── MenuList.tsx                   # Cột danh sách menu, lọc, tìm kiếm và chọn menu
├── pages/
│   └── MenuAdminPage.tsx              # Trang quản trị chính tích hợp master-detail và RBAC
└── index.ts                           # Barrel export chuẩn hóa
src/pages/admin/
└── AdminMenusPage.tsx                 # Proxy re-export kết nối vào hệ thống routes
```

---

## 3. Core Features Implemented

### 3.1. Quản lý Menu (Master Column)
- Xem toàn bộ danh sách menu của trường học.
- Lọc theo vị trí hiển thị: Header (Đầu trang), Footer (Chân trang), Sidebar (Thanh bên).
- Lọc theo trạng thái hoạt động: Đang kích hoạt / Đang ẩn.
- Sắp xếp theo tên, mã menu, vị trí, ngày tạo, ngày cập nhật.
- Tạo menu mới với mã định danh duy nhất (regex `^[a-zA-Z0-9_-]+$`), hiển thị lỗi `DUPLICATE_CODE` rõ ràng.
- Chỉnh sửa thông tin và vị trí menu.
- Xóa menu với cảnh báo rõ ràng về việc các menu items trực thuộc sẽ bị xóa theo cơ chế `CASCADE`.

### 3.2. Quản lý Cây Mục Menu (Detail Column)
- Hiển thị cây phân cấp đệ quy với thụt đầu dòng rõ ràng.
- Hỗ trợ 2 hình thức liên kết:
  1. **Trang tĩnh nội bộ:** Chọn trang từ danh sách trang đã tạo trong hệ thống (`usePages`), tự động thiết lập `page_id` và sinh URL dạng `/page/{slug}`.
  2. **Liên kết tùy biến / ngoài:** Cho phép nhập URL tự do (tương đối như `/tin-tuc` hoặc tuyệt đối như `https://moet.gov.vn`).
- Thuộc tính đích mở liên kết: `_self` (Tab hiện tại) và `_blank` (Tab mới).
- Phòng chống vòng lặp dữ liệu (Circular Reference Prevention):
  - Khi tạo hoặc sửa mục menu, dropdown chọn mục cha tự động loại trừ chính nó và **toàn bộ các mục con cháu hậu duệ** của nó.
- Sắp xếp thứ tự cùng cấp:
  - Hỗ trợ kéo thả trực quan HTML5 (Drag and Drop native, không bổ sung thư viện nặng).
  - Cung cấp nút bấm mũi tên Lên/Xuống (Move Up / Move Down) để người dùng thao tác dễ dàng trên mọi thiết bị và đảm bảo khả năng tiếp cận (Accessibility).
- Bật/tắt nhanh trạng thái hiển thị của từng mục menu.
- Xóa mục menu có kiểm tra đệ quy: Nếu mục có mục con, hệ thống cảnh báo cụ thể số lượng mục con sẽ bị xóa đồng thời.

---

## 4. RBAC & Security Adherence

- **Quyền đọc (READ):** Giao diện yêu cầu quyền `settings.view` thông qua `ProtectedRoute`. Người dùng có quyền xem danh sách và cây menu.
- **Quyền ghi (WRITE):** Toàn bộ các nút tạo, sửa, xóa, kéo thả, thay đổi thứ tự và bật/tắt trạng thái đều được kiểm tra điều kiện `settings.edit`. Nếu người dùng chỉ có quyền xem, hệ thống hiển thị thanh thông báo "Chế độ chỉ xem" và vô hiệu hóa các nút chỉnh sửa.
- **Không bypass RLS:** Toàn bộ dữ liệu được xử lý qua hook và service layer, đi qua client Supabase tiêu chuẩn, tuân thủ chính sách RLS trên database.
- **Không truy cập trực tiếp:** Không có bất kỳ lệnh gọi `supabase.from()` trực tiếp nào từ UI components.

---

## 5. Scope Discipline & Hard Boundaries

Đã tuân thủ nghiêm ngặt các ranh giới:
1. **Zero Database Changes:** Không tạo migration mới, không sửa đổi schema của `menus` hoặc `menu_items`.
2. **Zero New Permissions:** Tái sử dụng `settings.view` và `settings.edit`, không phát sinh quyền mới.
3. **Zero Public Route Changes:** Không tạo route `/page/:slug` công khai, không can thiệp header/footer công khai.
4. **Zero Heavy DnD Dependencies:** Sử dụng tương tác kéo thả HTML5 kết hợp nút bấm mũi tên dễ tiếp cận.

---

## 6. Verification Results

Kịch bản kiểm thử `scripts/step09/run_step09_5b_verification.ts` đã được thực thi và đạt kết quả:
- **Tổng số kiểm tra:** 110/110 checks PASSED (0 FAILED).
- Kiểm tra hồi quy STEP 09.4C: 43/43 PASSED.
- Kiểm tra hồi quy STEP 09.5A: 55/55 PASSED.
- TypeScript linting (`tsc --noEmit`): PASSED.
- Build production (`vite build`): PASSED.
