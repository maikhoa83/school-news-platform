# STEP 09.3A — MIGRATION REPORT

**Project:** SCHOOL NEWS PLATFORM  
**Execution Phase:** STEP 09.3A — DATABASE SCHEMA & MIGRATION IMPLEMENTATION  
**Target Migration:** `supabase/migrations/20260113000000_step09_pages_menu_seo.sql`  
**Date:** 2026-09-16  

---

## Migration File

- **Relative Path:** `supabase/migrations/20260113000000_step09_pages_menu_seo.sql`
- **File Size:** 9,561 bytes
- **Line Count:** 215 dòng SQL
- **Format:** PostgreSQL 15+ / Supabase PL/pgSQL
- **Idempotency Strategy:** Sử dụng triệt để `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`, `CREATE OR REPLACE FUNCTION`, `ON CONFLICT DO NOTHING`.

---

## Migration Order

Thứ tự thực thi trong toàn bộ chuỗi migration của dự án:
1. `20260101000000_initial_schema.sql` (Step 01 - Core Foundation)
2. `20260102000000_step03_foundation.sql` (Step 03 - Setup State & has_permission)
3. `20260103000000_step04_homepage_builder.sql` (Step 04 - Homepage Layouts & Blocks)
4. `20260104000000_step05_news_module.sql` (Step 05 - News Module Schema)
5. `20260105000000_step05a_news_integrity_hardening.sql` (Step 05 - News Hardening)
6. `20260106000000_step06_documents_module.sql` (Step 06 - Documents Schema)
7. `20260107000000_step06_security_hardening.sql` (Step 06 - Documents Security)
8. `20260108000000_step06_final_fix.sql` (Step 06 - Documents Final Fix)
9. `20260109000000_step07_announcements_module.sql` (Step 07 - Announcements Schema)
10. `20260110000000_step07_security_integrity_fix.sql` (Step 07 - Announcements Hardening)
11. `20260111000000_step07_author_authorization_fix.sql` (Step 07 - Announcements Author Fix)
12. `20260112000000_step08_media_module.sql` (Step 08 - Media & Albums Module - PASS)
13. **`20260113000000_step09_pages_menu_seo.sql`** ← **CURRENT MIGRATION (Thứ tự 13/13, kế thừa hoàn hảo)**

---

## Objects Created

### Tables (4 bảng)
1. `public.pages`
2. `public.menus`
3. `public.menu_items`
4. `public.seo_settings`

### Functions (1 hàm mới, 1 hàm idempotent)
1. `public.pages_generate_search_vector()`: Tự động cập nhật `search_vector` TSVECTOR với trọng số (A: title, B: excerpt, C: content).
2. `public.set_updated_at_timestamp()`: Khai báo idempotent đảm bảo cập nhật trường `updated_at`.

### Triggers (5 triggers)
1. `trg_pages_updated_at` ON `public.pages`
2. `trg_pages_search_vector` ON `public.pages`
3. `trg_menus_updated_at` ON `public.menus`
4. `trg_menu_items_updated_at` ON `public.menu_items`
5. `trg_seo_settings_updated_at` ON `public.seo_settings`

---

## Objects Altered

**NONE** (Không có bất kỳ bảng hoặc hàm hiện có nào bị thay đổi hay xóa bỏ).

---

## Constraints

### Primary Keys
- `pages_pkey`: `PRIMARY KEY (id)`
- `menus_pkey`: `PRIMARY KEY (id)`
- `menu_items_pkey`: `PRIMARY KEY (id)`
- `seo_settings_pkey`: `PRIMARY KEY (id)`

### Foreign Keys
- `pages.parent_id REFERENCES public.pages(id) ON DELETE SET NULL`
- `pages.author_id REFERENCES public.profiles(id) ON DELETE RESTRICT`
- `pages.published_by REFERENCES public.profiles(id) ON DELETE SET NULL`
- `menu_items.menu_id REFERENCES public.menus(id) ON DELETE CASCADE`
- `menu_items.parent_id REFERENCES public.menu_items(id) ON DELETE CASCADE`
- `menu_items.page_id REFERENCES public.pages(id) ON DELETE SET NULL`

### Unique Constraints
- `pages_slug_key`: `UNIQUE (slug)`
- `menus_code_key`: `UNIQUE (code)`

### Check Constraints
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

## Indexes

### B-Tree Indexes
- `idx_pages_slug` ON `public.pages(slug)`
- `idx_pages_status` ON `public.pages(status)`
- `idx_pages_status_published` ON `public.pages(status, published_at DESC) WHERE status = 'published'`
- `idx_pages_parent_id` ON `public.pages(parent_id)`
- `idx_pages_author_id` ON `public.pages(author_id)`
- `idx_pages_sort_order` ON `public.pages(sort_order ASC)`
- `idx_menus_code` ON `public.menus(code)`
- `idx_menus_location` ON `public.menus(location)`
- `idx_menus_is_active` ON `public.menus(is_active)`
- `idx_menu_items_menu_id` ON `public.menu_items(menu_id)`
- `idx_menu_items_parent_id` ON `public.menu_items(parent_id)`
- `idx_menu_items_page_id` ON `public.menu_items(page_id)`
- `idx_menu_items_ordering` ON `public.menu_items(menu_id, sort_order ASC)`
- `idx_menu_items_is_active` ON `public.menu_items(is_active)`

### GIN Indexes
- `idx_pages_search_vector` ON `public.pages USING gin(search_vector)`

---

## Existing Migrations Modified?

**NO**  
*(Xác nhận: Toàn bộ 12 migration trước đó giữ nguyên vẹn 100%, không bị sửa đổi một ký tự nào).*

---

## RLS Modified?

**NO**  
*(Xác nhận: Không có câu lệnh CREATE POLICY nào trong migration này theo đúng ranh giới của Step 09.3A. RLS sẽ được thực hiện riêng trong Step 09.3B).*

---

## Auth Modified?

**NO**  
*(Xác nhận: Không can thiệp vào lược đồ `auth` hoặc bảng `profiles`).*

---

## Storage Modified?

**NO**  
*(Xác nhận: Không tạo bucket mới, không sửa đổi chính sách storage hiện tại).*

---

## Unrelated Tables Modified?

**NO**  
*(Xác nhận: Không đụng chạm tới các phân hệ Tin tức, Văn bản, Thông báo, Media, Trang chủ hay Cấu hình).*
