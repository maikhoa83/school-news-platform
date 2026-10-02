# BÁO CÁO KIỂM TOÁN ĐỊNH TUYẾN & GIAO DIỆN KHUNG (ROUTING & SHELL AUDIT) — STEP 09
**Dự án:** School News Platform v1.2  
**Mã kiểm định:** STEP 09.2 — ROUTING & SHELL AUDIT  
**Ngày thực hiện:** 2026-09-16  
**Kiến trúc:** React Router v7 + Multi-Shell Pattern (PublicShell, AdminShell, AuthShell)  

---

## 1. PHÂN TÍCH ĐỊNH TUYẾN HIỆN TẠI (`src/routes/index.tsx`)

### 1.1. Khung Public Shell
Tại `src/routes/index.tsx` (dòng 62-160):
- Các route chính: `/`, `/home-demo`, `/news`, `/news/search`, `/news/:slug`, `/documents`, `/tai-lieu`, `/thong-bao`, `/announcements`, `/albums`, `/gallery`.
- Các route trang tĩnh hiện tại:
  - `path="/about"` → `<GenericPageDemo />`
  - `path="/activities"` → `<GenericPageDemo />`
  - `path="/admissions"` → `<GenericPageDemo />`
  - `path="/contact"` → `<GenericPageDemo />`

#### Điểm hạn chế nghiêm trọng:
1. **Hardcoded Routes:** 4 đường dẫn trên được gắn cứng vào component `GenericPageDemo`.
2. **Thiếu Route Trang Động:** Nếu quản trị viên nhà trường tạo trang "Quy chế chi tiêu nội bộ" hay "Lịch sử 50 năm thành lập trường", người dùng không thể truy cập vì không có route tiếp nhận slug động.
3. **Phương án định tuyến động cho Step 09:**
   - **Lựa chọn 1: `/page/:slug` (Khuyến nghị chuẩn kiến trúc):**
     - Tuyệt đối tránh xung đột với các route hệ thống.
     - Rõ ràng về ngữ nghĩa và cấu trúc URL.
     - Ví dụ: `/page/gioi-thieu`, `/page/tuyen-sinh-2026`.
     - Đồng thời duy trì redirect mềm cho các route cũ (`/about` → `/page/gioi-thieu`).
   - **Lựa chọn 2: `/:slug` (Catch-all):**
     - Đẹp về mặt thẩm mỹ (`school.edu.vn/gioi-thieu`), nhưng có rủi ro cạnh tranh thứ tự với các route khác và đòi hỏi danh sách `RESERVED_SLUGS` cực kỳ nghiêm ngặt.

---

### 1.2. Khung Admin Shell
Tại `src/routes/index.tsx` (dòng 400-414):
```tsx
<Route
  path="pages/*"
  element={
    <ModuleGuard moduleKey="pages" moduleName="Trang thông tin tĩnh">
      <AdminDashboardDemo />
    </ModuleGuard>
  }
/>
<Route
  path="menus/*"
  element={
    <ModuleGuard moduleKey="menu" moduleName="Menu & Điều hướng">
      <AdminDashboardDemo />
    </ModuleGuard>
  }
/>
```

#### Lỗ hổng & Khoảng trống định tuyến Admin:
1. **Thiếu phân quyền chi tiết (Missing Granular Guard):** Trong khi các module News, Documents, Announcements đều có `ProtectedRoute requiredPermission="..."`, hai route `pages/*` và `menus/*` chỉ bọc bằng `ModuleGuard` mà không kiểm tra quyền người dùng!
2. **Chưa có tuyến đường con (Sub-routes):**
   - Cần bổ sung cho `pages`:
     - `/admin/pages`: Danh sách trang tĩnh (`AdminPagesListPage`)
     - `/admin/pages/new`: Tạo trang tĩnh mới (`AdminPageEditorPage`)
     - `/admin/pages/:id/edit`: Sửa trang tĩnh (`AdminPageEditorPage`)
   - Cần bổ sung cho `menus`:
     - `/admin/menus`: Trình quản lý menu Header, Footer và cây điều hướng (`AdminMenusPage`)
   - Cần bổ sung cho `seo`:
     - Tab cấu hình SEO trong `/admin/settings` hoặc trang riêng `/admin/seo`.

---

## 2. KIỂM TOÁN HỆ THỐNG MENU & KHUNG GIAO DIỆN (SHELL & NAVIGATION AUDIT)

### 2.1. Kiểm toán Hợp đồng Điều hướng (`src/navigation/types.ts`)
Giao diện `NavigationItem` đã được thiết kế rất tốt:
```ts
export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  external?: boolean;
  description?: string;
  children?: NavigationItem[];
  moduleKey?: string;
  requiredPermission?: string | string[];
}
```
- Đã tách biệt khỏi JSX, hỗ trợ thuộc tính phân cấp (`children`), `badge`, `moduleKey`, và `requiredPermission`.
- **Cơ sở cho Step 09:** Định dạng này là chuẩn hoàn hảo để làm giao diện trung gian (DTO) khi đọc dữ liệu từ CSDL Supabase truyền xuống các component giao diện.

### 2.2. Kiểm toán Public Header (`src/layouts/public/PublicHeader.tsx`)
- Đã hỗ trợ:
  - Thanh tiện ích phía trên (Hotline, Email, Liên kết CMS, Đăng nhập).
  - Khung nhận diện thương hiệu trường (Logo, Slogan, Tên trường).
  - Thanh điều hướng Desktop với hiệu ứng Dropdown 2 cấp mượt mà, hỗ trợ accessibility (`role="menu"`, `aria-label`).
  - Nút đóng/mở Mobile Hamburger.
- **Hạn chế:** `navItems` hiện đang nhận giá trị mặc định là `publicNavigationItems` (mảng tĩnh). Cần cơ chế nhận dữ liệu động từ Hook mà không làm gián đoạn UX khi dữ liệu đang tải (cung cấp fallback tĩnh trong quá trình fetch).

### 2.3. Kiểm toán Public Footer (`src/layouts/public/PublicFooter.tsx`)
- Gồm 4 cột giao diện responsive chuẩn:
  - Cột 1: Thông tin trường học (tự động lấy từ `schoolIdentity`).
  - Cột 2: Tra cứu & Điều hướng nhanh (Quick Links) — **Đang hardcoded hoàn toàn trong JSX**.
  - Cột 3: Liên kết ngành giáo dục (Educational Portals) — **Đang hardcoded hoàn toàn trong JSX**.
  - Cột 4: Kiến trúc nền tảng & Liên kết Admin.
  - Thanh bản quyền chân trang.
- **Yêu cầu Step 09:** Cần tách Cột 2 và Cột 3 để nạp từ cấu hình `navigation_menus` (hoặc bảng `menus`) trong CSDL, cho phép nhà trường tự thêm bớt liên kết văn bản, cổng tra cứu điểm thi, liên kết đoàn đội, v.v.

### 2.4. Kiểm toán Mobile Navigation (`src/layouts/public/PublicMobileNav.tsx`)
- Hỗ trợ slide-over drawer từ cạnh màn hình.
- Accordion mở rộng menu con (`expandedKeys`).
- Đã có bẫy tiêu điểm (Focus Trap) và đóng khi bấm Escape.
- Nhận `items` đồng bộ với Header, sẵn sàng tiếp nhận menu động khi Header được kích hoạt.

---

## 3. MA TRẬN THAY ĐỔI ĐỊNH TUYẾN DỰ KIẾN (ROUTING CHANGE MATRIX)

| Vùng | Đường dẫn URL | Component đích | Bảo vệ (Guards) | Trạng thái hiện tại | Đề xuất Step 09 |
|:---|:---|:---|:---|:---:|:---|
| **Public** | `/page/:slug` | `PublicPageView` | `ModuleGuard('pages')` | `[MISSING]` | Thêm mới, render nội dung trang tĩnh động |
| **Public** | `/about` | `Navigate to="/page/gioi-thieu"` | Không | `[PARTIAL]` | Chuyển hướng mềm sang slug tương ứng |
| **Public** | `/activities` | `Navigate to="/page/hoat-dong"` | Không | `[PARTIAL]` | Chuyển hướng mềm sang slug tương ứng |
| **Public** | `/admissions` | `Navigate to="/page/tuyen-sinh"` | Không | `[PARTIAL]` | Chuyển hướng mềm sang slug tương ứng |
| **Public** | `/contact` | `Navigate to="/page/lien-he"` | Không | `[PARTIAL]` | Chuyển hướng mềm sang slug tương ứng |
| **Admin** | `/admin/pages` | `AdminPagesListPage` | `pages.view` + `ModuleGuard` | `[MISSING]` | Thay thế `AdminDashboardDemo` |
| **Admin** | `/admin/pages/new` | `AdminPageEditorPage` | `pages.create` + `ModuleGuard` | `[MISSING]` | Màn hình soạn thảo trang tĩnh mới |
| **Admin** | `/admin/pages/:id/edit` | `AdminPageEditorPage` | `pages.edit` + `ModuleGuard` | `[MISSING]` | Màn hình chỉnh sửa trang tĩnh |
| **Admin** | `/admin/menus` | `AdminMenusPage` | `settings.edit` (hoặc `menu.edit`) | `[MISSING]` | Thay thế `AdminDashboardDemo` bằng cây kéo thả menu |
| **Admin** | `/admin/settings` (Tab SEO) | `AdminSettingsPage` (Tab SEO) | `settings.view` + `settings.edit` | `[PARTIAL]` | Bổ sung tab cấu hình SEO & Search Engine |

---

## 4. KẾT LUẬN & ĐÁNH GIÁ SẴN SÀNG SHELL

Khung Shell (`PublicShell`, `PublicHeader`, `PublicFooter`, `PublicMobileNav`, `AdminShell`) đã hoàn chỉnh về mặt thẩm mỹ, tương thích di động và trợ năng WCAG. Điểm yếu duy nhất là **sự ngắt kết nối với dữ liệu CSDL** (dùng mảng tĩnh). Khi dịch vụ `menuService` và `pageService` được cung cấp ở Step 09, các component này có thể chuyển đổi sang dữ liệu động 100% mà không cần viết lại bố cục.
