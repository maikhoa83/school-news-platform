# STEP 09.3A — DATABASE IMPLEMENTATION REPORT

**Project:** SCHOOL NEWS PLATFORM  
**Phase:** STEP 09.3A — DATABASE SCHEMA & MIGRATION IMPLEMENTATION  
**Role:** Senior PostgreSQL / Supabase Database Engineer  
**Date:** 2026-09-16  
**Architecture:** ONE CODEBASE → ONE SCHOOL INSTALLATION → ONE DATABASE → ZERO CROSS-TENANT POLLUTION  
**Scope:** DATABASE ONLY (No UI, no Service, no Hook, no Route, no RLS policy, no Permission mutation)

---

## A. Result

**PASS**

---

## B. Scope Implemented

Chỉ triển khai các thành phần CSDL thuộc phạm vi được phê duyệt cho Step 09.3A:
1. **Bảng `public.pages`**: Lưu trữ các trang thông tin tĩnh độc lập (Giới thiệu chung, Lịch sử nhà trường, Cơ cấu tổ chức, Quy chế hoạt động, v.v.), hỗ trợ quan hệ phân cấp trang cha - con (`parent_id`), trường tìm kiếm toàn văn (`search_vector`) và các trường metadata SEO trực tiếp trên từng trang.
2. **Bảng `public.menus`**: Lưu trữ các container vị trí menu trên giao diện trường học (`header_main`, `footer_quick_links`, `footer_educational`).
3. **Bảng `public.menu_items`**: Lưu trữ các mục điều hướng liên kết trong menu, hỗ trợ phân cấp dropdown (`parent_id`), sắp xếp thứ tự (`sort_order`), icon hiển thị và liên kết khóa ngoại tùy chọn sang trang tĩnh (`page_id`).
4. **Bảng `public.seo_settings`**: Lưu trữ cấu hình SEO toàn trang theo mô hình quan hệ Single-Row kiến trúc trường học (`single_seo_settings_row CHECK (id = 'default')`).
5. **Ràng buộc, Chỉ mục & Triggers**: Khởi tạo đầy đủ PK, FK, NOT NULL, CHECK, UNIQUE, B-Tree & GIN indexes, trigger cập nhật `updated_at` tự động và trigger tạo vector tìm kiếm tiếng Việt cho `pages`.

---

## C. Current Schema Findings

Đối chiếu toàn diện với 12 migration hiện có:
- `public.profiles`: **EXISTS** (Migration `20260101000000_initial_schema.sql`)
- `public.roles`, `public.permissions`, `public.role_permissions`, `public.user_roles`: **EXISTS**
- `public.site_settings`: **EXISTS** (Lưu cấu hình nhận diện trường học `school_identity`, `branding`)
- `public.module_settings`: **EXISTS** (Đã kích hoạt module `pages`, `menu`, `seo` từ Step 03)
- `public.setup_state`: **EXISTS** (Migration `20260102000000_step03_foundation.sql`)
- `public.pages`: **MISSING** (Chưa từng tồn tại trong 12 migration trước)
- `public.menus`: **MISSING** (Chưa từng tồn tại trong 12 migration trước)
- `public.menu_items`: **MISSING** (Chưa từng tồn tại trong 12 migration trước)
- `public.seo_settings`: **MISSING** (Chưa từng tồn tại trong 12 migration trước)
- `public.set_updated_at_timestamp()`: **EXISTS** (Hàm trigger cập nhật dấu thời gian tái sử dụng)
- `Conflict status`: **NONE** (Không có xung đột tên bảng, cột hoặc kiểu dữ liệu với các phân hệ Tin tức, Văn bản, Thông báo, Album/Media)

---

## D. Migration

- **Filename:** `supabase/migrations/20260113000000_step09_pages_menu_seo.sql`
- **Timestamp:** `20260113000000` (Nối tiếp tuần tự sau `20260112000000_step08_media_module.sql`)
- **Purpose:** Thiết lập cấu trúc cơ sở dữ liệu quan hệ hoàn chỉnh cho phân hệ Trang tĩnh, Hệ thống Menu điều hướng và Cấu hình SEO toàn trường.
- **Objects changed:**
  - Tạo bảng mới: `public.pages`, `public.menus`, `public.menu_items`, `public.seo_settings`
  - Tạo hàm trigger mới: `public.pages_generate_search_vector()`
  - Tái sử dụng hàm trigger: `public.set_updated_at_timestamp()`
  - Tạo triggers: `trg_pages_updated_at`, `trg_pages_search_vector`, `trg_menus_updated_at`, `trg_menu_items_updated_at`, `trg_seo_settings_updated_at`
  - Tạo 15 chỉ mục (indexes) phục vụ tối ưu hóa truy vấn định tuyến và phân trang.

---

## E. Schema Changes

### Pages (`public.pages`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|:---|:---|:---|:---|
| `id` | UUID | PRIMARY KEY DEFAULT uuid_generate_v4() | Định danh duy nhất của trang |
| `title` | TEXT | NOT NULL, CHECK (length(trim(title)) > 0) | Tiêu đề hiển thị |
| `slug` | TEXT | NOT NULL UNIQUE, CHECK (length(trim(slug)) > 0) | Định tuyến `/page/:slug` |
| `content` | TEXT | NOT NULL DEFAULT '' | Nội dung HTML/Rich text |
| `excerpt` | TEXT | NULL | Tóm tắt ngắn gọn của trang |
| `featured_image`| TEXT | NULL | Đường dẫn ảnh đại diện/banner |
| `parent_id` | UUID | REFERENCES public.pages(id) ON DELETE SET NULL | Phân cấp trang cha - con |
| `template` | TEXT | NOT NULL DEFAULT 'default' CHECK (template IN ('default', 'fullwidth', 'sidebar', 'contact')) | Kiểu bố cục giao diện |
| `status` | TEXT | NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) | Trạng thái (TUYỆT ĐỐI không có 'pending') |
| `sort_order` | INT | NOT NULL DEFAULT 0 | Thứ tự sắp xếp hiển thị |
| `view_count` | INT | NOT NULL DEFAULT 0 CHECK (view_count >= 0) | Đếm số lượt xem trang |
| `author_id` | UUID | NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT | Tác giả biên soạn trang |
| `published_at` | TIMESTAMPTZ | NULL | Thời điểm công bố trang |
| `published_by` | UUID | REFERENCES public.profiles(id) ON DELETE SET NULL | Người duyệt xuất bản |
| `meta_title` | TEXT | NULL | Tiêu đề SEO riêng của trang |
| `meta_description`| TEXT | NULL | Thẻ mô tả SEO riêng |
| `meta_keywords`| TEXT | NULL | Từ khóa tìm kiếm |
| `og_image` | TEXT | NULL | Ảnh chia sẻ mạng xã hội |
| `canonical_url`| TEXT | NULL | Thẻ chuẩn hóa URL |
| `no_index` | BOOLEAN | NOT NULL DEFAULT FALSE | Chặn bọ tìm kiếm đánh chỉ mục |
| `search_vector`| TSVECTOR | NULL | Vector tìm kiếm toàn văn |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm tạo bản ghi |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm cập nhật cuối |

### Menus (`public.menus`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|:---|:---|:---|:---|
| `id` | UUID | PRIMARY KEY DEFAULT uuid_generate_v4() | Định danh duy nhất của menu |
| `code` | TEXT | NOT NULL UNIQUE, CHECK (length(trim(code)) > 0) | Mã định danh code (vd: header_main) |
| `name` | TEXT | NOT NULL, CHECK (length(trim(name)) > 0) | Tên hiển thị quản trị |
| `description` | TEXT | NULL | Mô tả chức năng |
| `location` | TEXT | NOT NULL DEFAULT 'header' CHECK (location IN ('header', 'footer', 'sidebar')) | Vị trí cắm menu trên giao diện |
| `is_active` | BOOLEAN | NOT NULL DEFAULT TRUE | Trạng thái kích hoạt |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm tạo |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm cập nhật |

### Menu Items (`public.menu_items`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|:---|:---|:---|:---|
| `id` | UUID | PRIMARY KEY DEFAULT uuid_generate_v4() | Định danh mục menu |
| `menu_id` | UUID | NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE | Thuộc về menu nào |
| `parent_id` | UUID | REFERENCES public.menu_items(id) ON DELETE CASCADE | Phân cấp menu đa cấp (dropdown) |
| `title` | TEXT | NOT NULL, CHECK (length(trim(title)) > 0) | Nhãn hiển thị liên kết |
| `url` | TEXT | NOT NULL, CHECK (length(trim(url)) > 0) | Đường dẫn đích |
| `target` | TEXT | NOT NULL DEFAULT '_self' CHECK (target IN ('_self', '_blank')) | Mở tab hiện tại hoặc tab mới |
| `sort_order` | INT | NOT NULL DEFAULT 0 | Thứ tự hiển thị từ trái qua phải / trên xuống |
| `icon` | TEXT | NULL | Tên Lucide icon hiển thị |
| `is_active` | BOOLEAN | NOT NULL DEFAULT TRUE | Trạng thái hiển thị |
| `page_id` | UUID | REFERENCES public.pages(id) ON DELETE SET NULL | Liên kết trang tĩnh (không copy nội dung) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm tạo |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm cập nhật |

### SEO Settings (`public.seo_settings`)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mục đích |
|:---|:---|:---|:---|
| `id` | TEXT | PRIMARY KEY DEFAULT 'default' CHECK (id = 'default') | Single-row pattern chuẩn hóa |
| `meta_title_pattern` | TEXT | NOT NULL DEFAULT '%s \| School News Portal' | Khuôn mẫu tiêu đề SEO toàn trường |
| `meta_description_default` | TEXT | NULL | Mô tả mặc định khi trang con không có |
| `meta_keywords_default` | TEXT | NULL | Từ khóa mặc định toàn trường |
| `og_image_default` | TEXT | NULL | Ảnh banner đại diện mặc định |
| `canonical_base_url` | TEXT | NULL | Tên miền gốc (vd: https://c3vinhphong.edu.vn) |
| `robots_txt_content` | TEXT | NULL | Nội dung tùy chỉnh robots.txt |
| `sitemap_enabled` | BOOLEAN | NOT NULL DEFAULT TRUE | Bật/tắt sinh sitemap tự động |
| `structured_data_enabled`| BOOLEAN | NOT NULL DEFAULT TRUE | Bật/tắt Schema.org JSON-LD |
| `google_site_verification` | TEXT | NULL | Mã xác thực thẻ HTML Google Search Console |
| `bing_site_verification` | TEXT | NULL | Mã xác thực thẻ HTML Bing Webmaster |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm tạo |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Thời điểm cập nhật |

---

## F. Constraints

- **Primary Keys (PK):**
  - `pages_pkey`: `PRIMARY KEY (id)`
  - `menus_pkey`: `PRIMARY KEY (id)`
  - `menu_items_pkey`: `PRIMARY KEY (id)`
  - `seo_settings_pkey`: `PRIMARY KEY (id)`
- **Foreign Keys (FK):**
  - `pages.parent_id` → `pages(id)` (`ON DELETE SET NULL`)
  - `pages.author_id` → `profiles(id)` (`ON DELETE RESTRICT`)
  - `pages.published_by` → `profiles(id)` (`ON DELETE SET NULL`)
  - `menu_items.menu_id` → `menus(id)` (`ON DELETE CASCADE`)
  - `menu_items.parent_id` → `menu_items(id)` (`ON DELETE CASCADE`)
  - `menu_items.page_id` → `pages(id)` (`ON DELETE SET NULL`)
- **Unique Constraints (UNIQUE):**
  - `pages.slug`: UNIQUE
  - `menus.code`: UNIQUE
- **Check Constraints (CHECK):**
  - `chk_pages_title_not_empty`: `length(trim(title)) > 0`
  - `chk_pages_slug_not_empty`: `length(trim(slug)) > 0`
  - `chk_pages_status`: `status IN ('draft', 'published', 'archived')`
  - `chk_pages_template`: `template IN ('default', 'fullwidth', 'sidebar', 'contact')`
  - `chk_pages_view_count_non_negative`: `view_count >= 0`
  - `chk_pages_parent_not_self`: `parent_id IS NULL OR parent_id != id`
  - `chk_menus_code_not_empty`: `length(trim(code)) > 0`
  - `chk_menus_name_not_empty`: `length(trim(name)) > 0`
  - `chk_menus_location`: `location IN ('header', 'footer', 'sidebar')`
  - `chk_menu_items_title_not_empty`: `length(trim(title)) > 0`
  - `chk_menu_items_url_not_empty`: `length(trim(url)) > 0`
  - `chk_menu_items_target`: `target IN ('_self', '_blank')`
  - `chk_menu_items_parent_not_self`: `parent_id IS NULL OR parent_id != id`
  - `single_seo_settings_row`: `id = 'default'`

---

## G. Indexes

### Existing Indexes
- Giữ nguyên toàn bộ 100% các index đã được tạo từ các Step 01 đến Step 08.

### New Indexes Created in Step 09.3A
1. `idx_pages_slug`: B-Tree index trên `pages(slug)` (Tối ưu tìm kiếm URL route `/page/:slug`).
2. `idx_pages_status`: B-Tree index trên `pages(status)`.
3. `idx_pages_status_published`: Partial B-Tree index trên `pages(status, published_at DESC) WHERE status = 'published'`.
4. `idx_pages_parent_id`: B-Tree index trên `pages(parent_id)` (Tối ưu truy vấn cây trang con).
5. `idx_pages_author_id`: B-Tree index trên `pages(author_id)`.
6. `idx_pages_sort_order`: B-Tree index trên `pages(sort_order ASC)`.
7. `idx_pages_search_vector`: GIN index trên `pages USING gin(search_vector)`.
8. `idx_menus_code`: B-Tree index trên `menus(code)`.
9. `idx_menus_location`: B-Tree index trên `menus(location)`.
10. `idx_menus_is_active`: B-Tree index trên `menus(is_active)`.
11. `idx_menu_items_menu_id`: B-Tree index trên `menu_items(menu_id)`.
12. `idx_menu_items_parent_id`: B-Tree index trên `menu_items(parent_id)`.
13. `idx_menu_items_page_id`: B-Tree index trên `menu_items(page_id)`.
14. `idx_menu_items_ordering`: Composite index trên `menu_items(menu_id, sort_order ASC)`.
15. `idx_menu_items_is_active`: B-Tree index trên `menu_items(is_active)`.

---

## H. Referential Integrity

- **Pages Hierarchy (`pages.parent_id`):** Khi một trang cha bị xóa, các trang con tự động được chuyển thành trang cấp 1 thông qua hành vi `ON DELETE SET NULL`, ngăn chặn hoàn toàn việc xóa dây chuyền vô ý làm mất nội dung giáo dục. Ràng buộc `chk_pages_parent_not_self` ngăn chặn vòng lặp tự trỏ vào chính nó.
- **Pages Author (`pages.author_id`):** Sử dụng `ON DELETE RESTRICT` bảo đảm không thể xóa tài khoản cán bộ giáo viên khi người đó đang là tác giả đứng tên của các trang văn kiện/thông tin trường học.
- **Menu Hierarchy & Items (`menu_items.menu_id`, `menu_items.parent_id`):** Khi một menu hoặc một mục menu cha bị xóa, toàn bộ các mục con tương ứng sẽ được dọn dẹp sạch sẽ thông qua `ON DELETE CASCADE`.
- **Menu Page Link (`menu_items.page_id`):** Khi một trang tĩnh bị xóa, mục menu tương ứng vẫn được bảo toàn nhãn và URL thông qua hành vi `ON DELETE SET NULL`, tránh gây đứt gãy cấu trúc điều hướng hoặc tạo các khóa ngoại mồ côi (orphan foreign keys).

---

## I. Compatibility

Đã kiểm tra đối chiếu tính tương thích tuyệt đối với các phân hệ hiện có:
- **Auth & Profiles:** Tương thích 100%, khóa ngoại `author_id` và `published_by` trỏ chuẩn xác về `public.profiles(id)`.
- **RBAC:** Giữ nguyên trạng 100%, không can thiệp vào `roles`, `permissions`, `role_permissions` hay `has_permission()` trong phase này.
- **News Module (Step 05):** Không bị ảnh hưởng, không trùng lặp bảng hay cột.
- **Documents Module (Step 06):** Không bị ảnh hưởng.
- **Announcements Module (Step 07):** Không bị ảnh hưởng.
- **Media Module (Step 08 - PASS):** Giữ nguyên trạng 100%, không can thiệp vào `media`, `albums`, bucket storage hay media policies.

---

## J. Security Boundary

- **Không chứa Secrets / Credentials:** Tuyệt đối không lưu mật khẩu, API private key, token hay thông tin nhạy cảm trong `seo_settings` hay bất kỳ bảng nào. Các trường verification (`google_site_verification`, `bing_site_verification`) chỉ lưu mã định danh thẻ HTML meta công khai.
- **Auth Boundary:** Không sửa đổi bảng người dùng hay logic xác thực.
- **RBAC Boundary:** Không tự ý thêm quyền hay thay đổi vai trò trong phase 09.3A.
- **RLS Boundary:** Tuân thủ triệt để nguyên tắc phân định trách nhiệm: Không viết câu lệnh `CREATE POLICY` nào trong phase này. Toàn bộ chính sách RLS sẽ được thiết kế tập trung và khép kín ở **Step 09.3B**.
- **Storage Boundary:** Không tạo hoặc chỉnh sửa bucket lưu trữ trong phase này.

---

## K. Verification Commands

1. **Python Migration Static Analysis & Compliance Engine:**
   - Command: `python3 [automated checks]`
   - Result: **9/9 PASS** (0 Failed). Xác nhận: Zero multi-tenancy columns, Zero CREATE POLICY in 09.3A, Pages status constraint khép kín (`draft`, `published`, `archived`), Đầy đủ 4 bảng, 6 Foreign Keys, 15 Indexes, 5 Triggers, Single-row SEO pattern, Zero credentials.
2. **Migration Sequence & Hash Integrity:**
   - Command: `python3 [glob & size check on supabase/migrations/*.sql]`
   - Result: **13 files tổng cộng**, 12 file migration cũ từ Step 01 đến Step 08 giữ nguyên vẹn 100% kích thước và nội dung.
3. **Application Typecheck & Lint:**
   - Command: `npm run lint` (`tsc --noEmit`)
   - Result: **PASS** (Exit code 0, không có lỗi TypeScript nào phát sinh).
4. **Applet Compilation:**
   - Command: `npm run build` (`vite build`)
   - Result: **PASS** (Biên dịch thành công 100%).

---

## L. Changed Files

1. `supabase/migrations/20260113000000_step09_pages_menu_seo.sql` (File tạo mới)
2. `docs/step09-db/STEP09_DATABASE_IMPLEMENTATION_REPORT.md` (File báo cáo tạo mới)
3. `docs/step09-db/STEP09_SCHEMA_DIFF.md` (File so sánh lược đồ tạo mới)
4. `docs/step09-db/STEP09_MIGRATION_REPORT.md` (File chi tiết migration tạo mới)
5. `docs/step09-db/STEP09_DATABASE_VERIFICATION.md` (File kiểm định kỹ thuật tạo mới)

*(Ghi chú: Toàn bộ 12 migration cũ từ Step 01 đến Step 08 và mã nguồn ứng dụng hiện tại hoàn toàn KHÔNG bị sửa đổi).*

---

## M. Regression

- Regression đối với các module hiện hữu: **PASS** (Zero regression)
- Trạng thái biên dịch: **PASS**

---

## N. Findings

- **Critical:** 0
- **High:** 0
- **Medium:** 0
- **Low:** 0
- **Informational:**
  - `INFO-01`: Bảng `public.seo_settings` áp dụng mô hình quan hệ Single-Row với bản ghi mặc định `id = 'default'`. Điều này vừa đảm bảo tuân thủ nguyên tắc relational model (D02/D03), vừa hoàn toàn phù hợp với kiến trúc "One School Installation → One Database".
  - `INFO-02`: Toàn bộ 4 bảng mới đã sẵn sàng đón nhận việc cấu hình Row Level Security (RLS) và phân bổ quyền hạn (RBAC) trong phase kế tiếp (**Step 09.3B**).

---

## O. Final Gate

**STEP 09.3A FINAL GATE: PASS**
