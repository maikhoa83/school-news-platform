# STEP 09.3A — SCHEMA DIFF

**Project:** SCHOOL NEWS PLATFORM  
**Component:** DATABASE SCHEMA DIFF (Before vs. Approved Requirements vs. After Migration)  
**Date:** 2026-09-16  

---

## Existing

Hiện trạng CSDL trước khi thực hiện Step 09.3A (Tính đến migration `20260112000000_step08_media_module.sql`):
- **Core RBAC & Identity:** `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles` (12 bảng liên kết)
- **Cấu hình hệ thống:** `site_settings` (chỉ có school_identity, branding), `module_settings`, `setup_state`
- **Homepage Builder:** `homepage_layouts`, `homepage_blocks`
- **News Module (Step 05):** `news_categories`, `news_tags`, `news`, `news_tag_relations`, `news_comments`
- **Documents Module (Step 06):** `documents`
- **Announcements Module (Step 07):** `announcements`
- **Media Module (Step 08):** `media_folders`, `media`, `albums`, `album_items`
- **Thực thể thuộc Step 09:**
  - `pages`: **KHÔNG TỒN TẠI**
  - `menus`: **KHÔNG TỒN TẠI**
  - `menu_items`: **KHÔNG TỒN TẠI**
  - `seo_settings`: **KHÔNG TỒN TẠI**

---

## Required

Theo Master Documents và Quyết định đã được phê duyệt (D01–D06):
1. **Pages (`pages`):**
   - Định danh, tiêu đề, slug URL duy nhất (cho `/page/:slug`), nội dung, tóm tắt, ảnh đại diện
   - Hỗ trợ quan hệ phân cấp `parent_id` (trang cha - trang con)
   - Trạng thái xuất bản tuân thủ hợp đồng: `draft`, `published`, `archived` (KHÔNG có `pending`)
   - Bố cục trang: `default`, `fullwidth`, `sidebar`, `contact`
   - Tác giả: Khóa ngoại `author_id` bắt buộc trỏ tới `profiles(id)`
   - Trường tìm kiếm toàn văn tiếng Việt `search_vector`
   - Trường metadata SEO tích hợp trực tiếp trên từng trang: `meta_title`, `meta_description`, `meta_keywords`, `og_image`, `canonical_url`, `no_index`
2. **Menus (`menus`):**
   - Mô hình quan hệ (relational model), không dùng JSONB trong site_settings
   - Các trường: `id`, `code`, `name`, `description`, `location`, `is_active`, timestamps
3. **Menu Items (`menu_items`):**
   - Quan hệ 1-N với `menus` (`menu_id` ON DELETE CASCADE)
   - Quan hệ phân cấp tự trỏ `parent_id` (hỗ trợ menu dropdown đa cấp)
   - Các trường nhãn `title`, đích đến `url`, `target` (`_self`/`_blank`), thứ tự `sort_order`, `icon`, `is_active`
   - Liên kết tùy chọn sang trang tĩnh `page_id REFERENCES pages(id) ON DELETE SET NULL` (không copy nội dung trang)
4. **SEO Settings (`seo_settings`):**
   - Mô hình quan hệ chuẩn hóa (relational model), không dùng JSONB
   - Single-Row architecture phù hợp kiến trúc 1 trường học / 1 CSDL
   - Cấu hình SEO toàn trường: khuôn mẫu tiêu đề, mô tả mặc định, từ khóa mặc định, ảnh OG mặc định, URL gốc, robots.txt tùy chỉnh, cờ bật sitemap và dữ liệu có cấu trúc, mã xác thực Google/Bing (không chứa bí mật/API key).

---

## Actual

Sau khi tạo migration `20260113000000_step09_pages_menu_seo.sql`:
1. **`public.pages`**:
   - 23 cột hoàn chỉnh với đầy đủ kiểu dữ liệu và giá trị mặc định chuẩn xác.
   - 6 ràng buộc CHECK và UNIQUE nghiêm ngặt.
   - 7 chỉ mục B-Tree và GIN tối ưu truy vấn.
   - 2 trigger: cập nhật `updated_at` và tự động sinh vector tìm kiếm từ `title`, `excerpt`, `content`.
2. **`public.menus`**:
   - 8 cột theo mô hình quan hệ chuẩn hóa.
   - Ràng buộc vị trí `location IN ('header', 'footer', 'sidebar')`.
   - 3 chỉ mục trên `code`, `location`, `is_active`.
   - Trigger tự động cập nhật `updated_at`.
3. **`public.menu_items`**:
   - 12 cột với 2 khóa ngoại liên kết cascade (`menu_id`, `parent_id`) và 1 khóa ngoại bảo toàn dữ liệu (`page_id ON DELETE SET NULL`).
   - 4 ràng buộc CHECK ngăn chặn chuỗi rỗng, giá trị target không hợp lệ và vòng lặp tự trỏ cha.
   - 5 chỉ mục tối ưu hóa tốc độ dựng menu cây.
   - Trigger tự động cập nhật `updated_at`.
4. **`public.seo_settings`**:
   - 13 cột đại diện đầy đủ các cấu hình SEO trường học.
   - Ràng buộc Single-Row: `CONSTRAINT single_seo_settings_row CHECK (id = 'default')`.
   - Trigger tự động cập nhật `updated_at`.
   - Khởi tạo sẵn bản ghi mặc định an toàn (`id = 'default'`).

---

## Delta

| Đối tượng (Object) | Loại đối tượng | Hiện trạng trước | Yêu cầu | Trạng thái sau Migration | Phân loại Delta |
|:---|:---|:---|:---|:---|:---|
| `public.pages` | Table | Chưa có | Cần thiết | Đã định nghĩa đầy đủ 23 cột | **ADDED** |
| `chk_pages_status` | Constraint | Chưa có | draft, published, archived | Đã áp dụng (không có pending) | **ADDED** |
| `idx_pages_slug` | Index | Chưa có | Cần cho /page/:slug | Đã áp dụng (B-tree) | **ADDED** |
| `idx_pages_search_vector` | Index | Chưa có | Tìm kiếm toàn văn | Đã áp dụng (GIN) | **ADDED** |
| `trg_pages_updated_at` | Trigger | Chưa có | Tự động hóa | Đã áp dụng | **ADDED** |
| `trg_pages_search_vector` | Trigger | Chưa có | Tự động hóa | Đã áp dụng | **ADDED** |
| `public.menus` | Table | Chưa có | Cần thiết | Đã định nghĩa đầy đủ 8 cột | **ADDED** |
| `idx_menus_code` | Index | Chưa có | Tối ưu tra cứu | Đã áp dụng (B-tree) | **ADDED** |
| `public.menu_items` | Table | Chưa có | Cần thiết | Đã định nghĩa đầy đủ 12 cột | **ADDED** |
| `fk_menu_items_page` | Constraint (FK) | Chưa có | SET NULL khi xóa trang | Đã áp dụng | **ADDED** |
| `idx_menu_items_ordering` | Index | Chưa có | Sắp xếp menu | Đã áp dụng | **ADDED** |
| `public.seo_settings` | Table | Chưa có | Relational model | Đã định nghĩa 13 cột | **ADDED** |
| `single_seo_settings_row` | Constraint | Chưa có | Single-Row pattern | Đã áp dụng | **ADDED** |
| `RLS Policies (Pages/Menu/SEO)` | Security | Chưa có | Dành cho Step 09.3B | Không triển khai trong 09.3A | **NOT IMPLEMENTED (BY DESIGN)** |
| `RBAC Permissions` | Authorization | Đã có các quyền cũ | Dành cho Step 09.3B | Không sửa đổi trong 09.3A | **UNCHANGED (BY DESIGN)** |
| `12 Migrations cũ` | Migration History | 12 files | Phải giữ nguyên | Giữ nguyên trạng 100% | **UNCHANGED** |
| `Media Module (Step 08)` | Module | Đã hoàn thành | Không được ảnh hưởng | Giữ nguyên trạng 100% | **UNCHANGED** |
