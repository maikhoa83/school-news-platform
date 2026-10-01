# BÁO CÁO KIỂM KÊ MÃ NGUỒN (CODEBASE INVENTORY) — STEP 09: PAGES / MENU / SEO MODULE
**Dự án:** School News Platform v1.2  
**Mã kiểm định:** STEP 09.2 — CODEBASE AUDIT  
**Ngày thực hiện:** 2026-09-16  
**Vai trò kiểm định:** Senior Codebase Auditor / Solution Architect  
**Trạng thái tuân thủ:** AUDIT ONLY — ZERO CODE MODIFICATION / ZERO MIGRATION / ZERO DESTRUCTIVE ACTION  

---

## 1. MỤC ĐÍCH & PHẠM VI KIỂM KÊ

Kiểm kê toàn diện hiện trạng mã nguồn, lược đồ cơ sở dữ liệu, định tuyến, giao diện shell và cấu hình của dự án School News Platform nhằm chuẩn bị cho việc thiết kế và triển khai **STEP 09 — PAGES / MENU / SEO MODULE**.

Phân loại trạng thái kiểm kê:
- **`[EXISTS]`**: Thành phần đã tồn tại trong codebase, có kiểm tra cú pháp và bằng chứng file/dòng cụ thể.
- **`[PARTIAL]`**: Thành phần đã được khai báo khung (skeleton), mockup hoặc cấu hình một phần nhưng chưa hoàn thiện chức năng, chưa kết nối DB, hoặc dùng dữ liệu tĩnh/demo.
- **`[MISSING]`**: Thành phần hoàn toàn chưa có trong mã nguồn hoặc lược đồ CSDL.
- **`[CONFLICT]`**: Thành phần có sự bất đồng bộ giữa các tầng kiến trúc (ví dụ: route URL, tên key, quyền hạn).
- **`[UNKNOWN]`**: Thành phần chưa đủ cơ sở chứng minh nếu không có quyết định bổ sung.

---

## 2. MA TRẬN TỔNG HỢP TRẠNG THÁI (STATUS MATRIX)

| STT | Phân hệ / Thành phần | Vị trí kiểm tra | Trạng thái | Bằng chứng Codebase | Ghi chú & Tác động kiến trúc |
|:---:|:---|:---|:---:|:---|:---|
| **1** | **Bảng `pages`** | `supabase/migrations/*.sql` | `[MISSING]` | Không có migration nào chứa `CREATE TABLE public.pages` | Cần tạo migration mới cho bảng `pages` |
| **2** | **Bảng `menus` / `menu_items`** | `supabase/migrations/*.sql` | `[MISSING]` | Không có migration nào chứa `CREATE TABLE public.menus` | Cần quyết định: bảng chuẩn hóa hay JSONB trong `site_settings` |
| **3** | **Bảng `seo_settings`** | `supabase/migrations/*.sql` | `[MISSING]` | Không có bảng SEO riêng biệt | Cần quyết định lưu dạng key `seo_settings` trong `site_settings` |
| **4** | **Quyền hạn `pages.*`** | `supabase/seed/00_roles_and_permissions.sql` | `[PARTIAL]` | Dòng 43-46: `pages.view`, `pages.create`, `pages.edit`, `pages.delete` | Đã seed vào bảng `permissions`, nhưng **chưa gán vào bất kỳ vai trò nào** trong `role_permissions` |
| **5** | **Quyền hạn `menu.*`** | `supabase/seed/00_roles_and_permissions.sql` | `[MISSING]` | Không có quyền `menu.*`; hệ thống đang mượn `settings.edit` | Thiếu tính phân quyền hạt nhân cho ban biên tập menu |
| **6** | **Quyền hạn `seo.*`** | `supabase/seed/00_roles_and_permissions.sql` | `[MISSING]` | Không có quyền `seo.*`; phụ thuộc `settings.edit` | Thiếu quyền tinh chỉnh SEO chuyên biệt |
| **7** | **Module Registration `pages`** | `src/lib/moduleRegistry.ts` | `[PARTIAL]` | Dòng 67-75: key `pages`, `adminRoute: '/admin/pages'` | Thiếu `publicRoute`, chưa liên kết dynamic route |
| **8** | **Module Registration `menu`** | `src/lib/moduleRegistry.ts` | `[PARTIAL]` | Dòng 76-84: key `menu`, `adminRoute: '/admin/menu'` | Xung đột route với `adminNavigation.ts` (`/admin/menus`) |
| **9** | **Kiểu dữ liệu `Page`** | `src/types/` | `[MISSING]` | Không có file `src/types/page.ts` | Cần định nghĩa `Page`, `PageStatus`, `PageCreateInput`,... |
| **10** | **Kiểu dữ liệu `Menu`** | `src/types/` | `[PARTIAL]` | `src/navigation/types.ts` (dòng 7-24: `NavigationItem`) | Là kiểu tĩnh UI, thiếu kiểu CSDL (id, parent_id, sort_order, target,...) |
| **11** | **Kiểu dữ liệu `SEO`** | `src/types/` | `[MISSING]` | Không có file `src/types/seo.ts` | Thiếu interface SEO metadata, OpenGraph, JSON-LD Schema |
| **12** | **Dịch vụ `pageService`** | `src/services/` | `[MISSING]` | Không có file `src/services/pageService.ts` | Chưa có tầng giao tiếp Supabase cho Pages |
| **13** | **Dịch vụ `menuService`** | `src/services/` | `[MISSING]` | Không có file `src/services/menuService.ts` | Chưa có tầng CRUD menu động từ CSDL |
| **14** | **Dịch vụ `seoService`** | `src/services/` | `[MISSING]` | Không có file `src/services/seoService.ts` | Chưa có tầng quản lý SEO metadata |
| **15** | **Hooks cho Pages** | `src/hooks/` | `[MISSING]` | Không có `usePages.ts`, `usePageDetail.ts`, `useAdminPages.ts` | Tầng Presentation chưa có state hook |
| **16** | **Hooks cho Menus** | `src/hooks/` | `[MISSING]` | Không có `useMenus.ts` | Shell hiện load mảng tĩnh `publicNavigationItems` |
| **17** | **Trang Admin Pages List** | `src/pages/admin/` | `[MISSING]` | Không có `AdminPagesListPage.tsx` | Route `/admin/pages/*` hiện trỏ về `AdminDashboardDemo` |
| **18** | **Trang Admin Page Editor** | `src/pages/admin/` | `[MISSING]` | Không có `AdminPageEditorPage.tsx` | Chưa có giao diện soạn thảo trang tĩnh |
| **19** | **Trang Admin Menus Manager** | `src/pages/admin/` | `[MISSING]` | Không có `AdminMenusPage.tsx` | Route `/admin/menus/*` hiện trỏ về `AdminDashboardDemo` |
| **20** | **Trang Public Page Detail** | `src/pages/public/` | `[PARTIAL]` | `src/pages/public/GenericPageDemo.tsx` (dòng 1-119) | Là mockup tĩnh 6 trang cứng (`about`, `documents`,...), không đọc DB |
| **21** | **Định tuyến Dynamic Route** | `src/routes/index.tsx` | `[MISSING]` | Không có `/:slug` hoặc `/page/:slug` | Chỉ có 5 routes tĩnh trỏ về `GenericPageDemo` |
| **22** | **Public Header Menu** | `src/layouts/public/PublicHeader.tsx` | `[PARTIAL]` | Dòng 27-32, 141-224: nhận `navItems` từ props tĩnh | Chưa có hook nạp menu từ Supabase, fallback về mảng tĩnh |
| **23** | **Public Footer Links** | `src/layouts/public/PublicFooter.tsx` | `[PARTIAL]` | Dòng 66-156: Quick Links & Educational Links | Toàn bộ links và cột footer đang hardcoded trong JSX |
| **24** | **Public Mobile Navigation** | `src/layouts/public/PublicMobileNav.tsx` | `[PARTIAL]` | Dòng 20-32, 100-270: nhận mảng tĩnh `publicNavigationItems` | Đã hỗ trợ accordion đa cấp nhưng hoàn toàn dùng dữ liệu cứng |
| **25** | **Thư viện Sanitizer XSS** | `src/lib/sanitize.ts` | `[EXISTS]` | Dòng 1-76: `sanitizeHtml()` dựa trên DOMPurify | Tái sử dụng an toàn tuyệt đối cho rich text của Pages |
| **26** | **Thư viện Slugify tiếng Việt** | `src/lib/slugify.ts` | `[EXISTS]` | Dòng 1-32: `slugifyVietnamese()` | Tái sử dụng cho việc tạo slug trang tĩnh chuẩn SEO |
| **27** | **RichText Editor CMS** | `src/components/admin/news/RichTextEditor.tsx` | `[EXISTS]` | Dòng 1-288: H2-H4, bold, list, quote, link, image, preview | Có thể tái sử dụng hoặc tách thành common component |
| **28** | **SEO Head Management** | Toàn bộ codebase | `[MISSING]` | Chỉ có thẻ tĩnh trong `index.html` (dòng 6-12) | Không có thẻ meta động, không có OpenGraph theo từng trang |
| **29** | **Robots.txt & Sitemap.xml** | Thư mục `public/` | `[MISSING]` | Thư mục `public/` không chứa `robots.txt` hay `sitemap.xml` | Search Engine bots chưa có chỉ dẫn thu thập dữ liệu |

---

## 3. CHI TIẾT BẰNG CHỨNG CODEBASE THEO PHÂN HỆ

### 3.1. Phân hệ Cơ sở dữ liệu & Phân quyền (Database & RBAC)

#### A. Kiểm tra Migrations (`supabase/migrations/`)
- Đã kiểm tra toàn bộ 12 file migration từ `20260101000000_initial_schema.sql` đến `20260112000000_step08_media_module.sql`.
- **Kết quả:** Không có bảng nào tên `pages`, `menus`, `menu_items`, `page_templates`, hay `seo_settings`.
- **Dấu hiệu đã xuất hiện:**
  - `supabase/migrations/20260102000000_step03_foundation.sql` (dòng 121):
    ```sql
    ('pages', TRUE, '{}'::jsonb),
    ```
    Bản ghi module `pages` đã được seed vào bảng `module_settings` với `is_enabled = TRUE`.
  - Không có bản ghi nào cho module `menu` trong `module_settings` (chỉ có trong file registry TypeScript).

#### B. Kiểm tra Seed Phân quyền (`supabase/seed/00_roles_and_permissions.sql`)
- Các quyền liên quan đến Pages đã được định nghĩa tại dòng 43-46:
  ```sql
  ('pages.view', 'pages', 'view', 'Xem trang tĩnh giới thiệu'),
  ('pages.create', 'pages', 'create', 'Tạo trang tĩnh mới'),
  ('pages.edit', 'pages', 'edit', 'Chỉnh sửa nội dung trang tĩnh'),
  ('pages.delete', 'pages', 'delete', 'Xóa trang tĩnh'),
  ```
- **Lỗ hổng phân quyền phát hiện được:**
  - Không có lệnh `INSERT INTO public.role_permissions` nào liên kết 4 quyền trên với các vai trò `ADMIN`, `EDITOR`, hay `AUTHOR`.
  - Do đó, nếu kiểm tra `public.has_permission('pages.create')`, chỉ duy nhất `SUPER_ADMIN` (được bypass qua điều kiện `is_super_admin()`) có quyền truy cập, các tài khoản `ADMIN` hay `EDITOR` sẽ bị từ chối (`403 Forbidden`).

---

### 3.2. Phân hệ Định tuyến & Bảo vệ (Routing & Guards)

#### A. Định tuyến Public (`src/routes/index.tsx`)
Tại `src/routes/index.tsx` (dòng 89-160):
```tsx
<Route path="/about" element={<GenericPageDemo />} />
<Route path="/activities" element={<GenericPageDemo />} />
<Route path="/admissions" element={<GenericPageDemo />} />
<Route path="/contact" element={<GenericPageDemo />} />
```
- Các đường dẫn trên đang cố định trỏ đến component `GenericPageDemo`.
- Không có route bắt biến (wildcard/parameterized route) như `/:slug` hay `/page/:slug`.
- Nếu người quản trị tạo một trang mới trong CMS với slug bất kỳ (ví dụ: `gioi-thieu-hoi-dong-truong`), hệ thống public hiện tại sẽ rơi vào `Route path="*"` và hiển thị `NotFoundState`.

#### B. Định tuyến Admin (`src/routes/index.tsx`)
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
- Cả hai tuyến đường admin cho `pages` và `menus` chỉ được bọc bởi `ModuleGuard`, nhưng **KHÔNG có `ProtectedRoute requiredPermission="..."`** trực tiếp trên thẻ Route cấp con.
- Cả hai tuyến đều đang trỏ về `AdminDashboardDemo` (trang placeholder tổng quan).

---

### 3.3. Phân hệ Menu & Shell Điều hướng (Shell & Navigation)

#### A. Menu tĩnh hiện tại (`src/navigation/publicNavigation.ts`)
- Mảng `publicNavigationItems` định nghĩa 8 mục chính: Trang chủ, Giới thiệu (3 menu con), Tin tức & Sự kiện (3 menu con), Văn bản - Tài liệu, Hoạt động Đoàn - Đội, Tuyển sinh, Thư viện ảnh, Liên hệ.
- Đây là mảng dữ liệu tĩnh hardcoded trong mã TypeScript, chưa thể quản lý qua giao diện CMS.

#### B. Khung giao diện Public (`src/layouts/public/`)
- `PublicShell.tsx` (dòng 35-41): Lọc `navItems` dựa trên `isModuleEnabled(item.moduleKey)`. Tuy nhiên, nếu một menu link đến trang tĩnh (`/about`, `/activities`, `/contact`), nó không có `moduleKey` nên luôn hiển thị dù trang có tồn tại hay không.
- `PublicHeader.tsx`: Nhận `navItems` qua props, mặc định gán `publicNavigationItems`.
- `PublicFooter.tsx`: Chứa các khối đường dẫn tĩnh (Quick Links, Liên kết ngành giáo dục). Chưa có cơ chế hiển thị menu chân trang động từ CSDL.

---

### 3.4. Phân hệ Tối ưu hóa Tìm kiếm (SEO)

#### A. HTML Head cơ bản (`index.html`)
- Chứa các thẻ meta tĩnh:
  - `<title>School News Platform</title>`
  - `<meta name="description" content="Nền tảng website tin tức và CMS cho các trường phổ thông Việt Nam." />`
  - `<meta property="og:title" ... />`
  - `<meta property="og:description" ... />`
- Không có bất kỳ cơ chế client-side nào để thay đổi tiêu đề trang theo ngữ cảnh (ví dụ: khi xem bài viết tin tức, xem tài liệu, hoặc xem trang tĩnh).
- Kiểm tra toàn bộ mã nguồn: `document.title = ...` **hoàn toàn chưa được gọi ở bất kỳ trang nào**.

#### B. Phụ thuộc & Thư viện liên quan SEO
- `package.json` không chứa `react-helmet` hay `react-helmet-async`.
- Dự án sử dụng **React 19 (`^19.0.1`)** và **Vite (`^6.2.3`)**. React 19 có tính năng native Document Metadata (`<title>`, `<meta>`, `<link>` được tự động hoist lên `<head>`), cần đánh giá tính tương thích và chiến lược triển khai.

---

## 4. DANH MỤC XUNG ĐỘT KIẾN TRÚC PHÁT HIỆN (CONFLICT INVENTORY)

1. **Xung đột tên Module Key (`menu` vs `menus`):**
   - Trong `src/types/index.ts` (dòng 39): `ModuleKey` là `'menu'`.
   - Trong `src/lib/moduleRegistry.ts` (dòng 77): key là `'menu'`.
   - Trong `src/navigation/adminNavigation.ts` (dòng 124): `href: '/admin/menus'`, `moduleKey: 'menu'`.
   - Trong `src/routes/index.tsx` (dòng 408): route là `menus/*`, `moduleKey: 'menu'`.
   - Cần chuẩn hóa thống nhất: Tên route là `/admin/menus` hay `/admin/menu`, và `moduleKey` là `menu` hay `menus`.

2. **Xung đột quyền hạn Menu (`settings.edit` vs `menu.edit`):**
   - Trong `adminNavigation.ts` (dòng 126): `requiredPermission: 'settings.edit'`.
   - Trong `moduleRegistry.ts` (dòng 81): `requiredPermissions: ['settings.edit']`.
   - Trong khi đó, module `pages` lại có hệ thống quyền riêng (`pages.view`, `pages.create`, `pages.edit`, `pages.delete`). Nếu menu phụ thuộc `settings.edit`, người được giao quản lý menu bắt buộc phải có toàn quyền cấu hình nhận diện trường học và hệ thống.

3. **Xung đột định tuyến Public (`/about`, `/contact` vs dynamic pages):**
   - Các đường dẫn `/about`, `/activities`, `/admissions`, `/contact` đang được khai báo cứng trong `src/routes/index.tsx`.
   - Nếu Step 09 chuyển sang trang tĩnh động từ CSDL, các route này sẽ xung đột trực tiếp với định tuyến động nếu không được dọn dẹp hoặc định tuyến chuyển tiếp.

---

## 5. KẾT LUẬN KIỂM KÊ

Codebase hiện tại ở trạng thái **nền tảng sạch** (clean foundation). Các module News (Step 05), Documents (Step 06), Announcements (Step 07), và Media (Step 08) đã hoàn thiện và ổn định. Phân hệ Step 09 (Pages, Menu, SEO) hiện tại:
- **Cơ sở dữ liệu:** Chưa có bảng nào, cần thiết kế mới hoàn toàn.
- **Phân quyền:** Đã có 4 permissions cốt lõi cho Pages trong seed nhưng chưa phân bổ vào `role_permissions`. Thiếu permissions cho Menu và SEO.
- **Tầng dịch vụ/Hook:** Trống 100%.
- **Tầng giao diện:** Đang ở mức Mockup / Placeholder (`GenericPageDemo`, `AdminDashboardDemo`).
- **Tài sản tái sử dụng được ngay:** `RichTextEditor`, `sanitizeHtml`, `slugifyVietnamese`, `PublicShell`, `ModuleGuard`, `ProtectedRoute`.
