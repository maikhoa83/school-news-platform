# BÁO CÁO KIỂM TOÁN CƠ SỞ DỮ LIỆU (DATABASE AUDIT) — STEP 09
**Dự án:** School News Platform v1.2  
**Mã kiểm định:** STEP 09.2 — DATABASE AUDIT  
**Ngày thực hiện:** 2026-09-16  
**Môi trường:** PostgreSQL 15+ / Supabase  
**Nguyên tắc:** ONE CODEBASE → ONE SCHOOL INSTALLATION → ONE DATABASE → ZERO CROSS-TENANT POLLUTION  

---

## 1. HIỆN TRẠNG LƯỢC ĐỒ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA STATE)

Tính đến migration `20260112000000_step08_media_module.sql`, CSDL hiện có 16 bảng chính:
1. `public.profiles` (Hồ sơ người dùng)
2. `public.roles` (Danh mục vai trò)
3. `public.permissions` (Danh mục quyền hạn)
4. `public.role_permissions` (Liên kết vai trò - quyền hạn)
5. `public.user_roles` (Gán vai trò cho người dùng)
6. `public.site_settings` (Cấu hình cài đặt theo trường - Key/Value JSONB)
7. `public.module_settings` (Cấu hình bật/tắt module - Key/Value JSONB)
8. `public.setup_state` (Trạng thái wizard cài đặt trường ban đầu)
9. `public.homepage_layouts` & `public.homepage_blocks` (Trang chủ builder)
10. `public.news_categories`, `public.news_tags`, `public.news`, `public.news_tag_relations`, `public.news_comments` (Module tin tức)
11. `public.documents` (Module văn bản điều hành)
12. `public.announcements` (Module thông báo học đường)
13. `public.media_folders`, `public.media`, `public.albums`, `public.album_items` (Module media & album)

**Kết luận xác thực:**
- Hoàn toàn **chưa có** các bảng phục vụ Step 09: `pages`, `menus`, `menu_items`.
- Bảng `site_settings` đã tồn tại và đang lưu trữ `school_identity` và `branding`.
- Bảng `module_settings` đã có bản ghi `'pages'` với `is_enabled = TRUE`, nhưng chưa có bản ghi `'menu'` hoặc `'seo'`.

---

## 2. PHÂN TÍCH THIẾT KẾ CSDL CHO STEP 09

### 2.1. Thực thể Trang tĩnh (`public.pages`)

Trang tĩnh trong cổng thông tin trường học phục vụ các nội dung: Giới thiệu chung, Lịch sử nhà trường, Cơ cấu tổ chức, Hội đồng trường, Các tổ chuyên môn, Thành tích nhà trường, Quy chế hoạt động, v.v.

#### A. Đề xuất lược đồ bảng `public.pages`
```sql
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT,
    featured_image TEXT,
    parent_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    template TEXT NOT NULL DEFAULT 'default' CHECK (template IN ('default', 'fullwidth', 'sidebar', 'contact')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    sort_order INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    published_at TIMESTAMPTZ,
    
    -- SEO Metadata tích hợp trực tiếp trên từng trang
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    og_image TEXT,
    canonical_url TEXT,
    no_index BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Tìm kiếm toàn văn (Fulltext Search tiếng Việt)
    search_vector TSVECTOR,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### B. Đánh giá tính toàn vẹn và Ràng buộc (Constraints & Indexes)
1. **Ràng buộc Slug:** `slug TEXT NOT NULL UNIQUE` đảm bảo không trùng URL. Cần hàm chuẩn hóa và danh sách `RESERVED_SLUGS` (tránh xung đột với `/admin`, `/news`, `/documents`, v.v.).
2. **Hỗ trợ phân cấp (Hierarchy):** Cột `parent_id REFERENCES public.pages(id) ON DELETE SET NULL` cho phép tổ chức trang cha - trang con (ví dụ: `Giới thiệu` -> `Cơ cấu tổ chức`). Khi xóa trang cha, các trang con tự động chuyển thành trang cấp 1 (`SET NULL`), không gây mất dữ liệu đột ngột.
3. **Chỉ mục cần thiết (Indexes):**
   - `idx_pages_slug ON public.pages(slug)` (Unique B-tree phục vụ truy vấn định tuyến tức thời).
   - `idx_pages_status_pub ON public.pages(status, published_at DESC) WHERE status = 'published'` (Tối ưu truy vấn danh sách trang công khai).
   - `idx_pages_parent ON public.pages(parent_id, sort_order ASC)` (Tối ưu truy vấn cây thư mục trang).
   - `idx_pages_search_vector ON public.pages USING gin(search_vector)` (Tìm kiếm từ khóa trong tiêu đề và nội dung trang).
4. **Trigger tự động:**
   - Cập nhật `updated_at` tự động trước khi UPDATE.
   - Cập nhật `search_vector` tự động từ `title` và `excerpt`.

---

### 2.2. Thực thể Hệ thống Menu & Điều hướng (Menus & Navigation)

Có hai phương án kỹ thuật lưu trữ Menu trong CSDL:

#### Phương án 1: Bảng quan hệ chuẩn hóa (`menus` và `menu_items`)
- Tạo 2 bảng:
  - `public.menus` (id, code, name, location, is_active, created_at, updated_at)
  - `public.menu_items` (id, menu_id, parent_id, title, url, target, sort_order, icon, is_active, page_id, module_key)
- **Ưu điểm:** Chuẩn hóa SQL, hỗ trợ foreign key sang bảng `pages` (`ON DELETE SET NULL`), truy vấn phân trang, khóa từng dòng.
- **Nhược điểm:** Cần nhiều phép JOIN hoặc đệ quy CTE khi lấy cây menu phân cấp; cấu trúc phức tạp hơn mức cần thiết cho menu trường học vốn chỉ có từ 10 - 25 items và sâu tối đa 2 cấp (Dropdown).

#### Phương án 2: Lưu trữ cấu hình có cấu trúc trong `site_settings` (Key: `'navigation_menus'`)
- Tận dụng bảng `site_settings` sẵn có:
  ```json
  {
    "header_main": [
      {
        "id": "nav-1",
        "label": "Trang chủ",
        "url": "/",
        "icon": "Home"
      },
      {
        "id": "nav-2",
        "label": "Giới thiệu",
        "url": "/page/gioi-thieu",
        "children": [
          { "id": "nav-2-1", "label": "Ban Giám hiệu", "url": "/page/ban-giam-hieu" },
          { "id": "nav-2-2", "label": "Tổ chuyên môn", "url": "/page/to-chuyen-mon" }
        ]
      }
    ],
    "footer_quick_links": [ ... ],
    "footer_educational_links": [ ... ]
  }
  ```
- **Ưu điểm:**
  - Không cần thêm bảng mới.
  - Phù hợp tuyệt đối với mô hình `BUILD ONCE → CONFIGURE PER SCHOOL`.
  - Tải toàn bộ cây menu trong 1 lần đọc cache đơn giản từ `site_settings`.
  - Cập nhật nguyên tử (atomic update) toàn bộ thứ tự kéo thả của menu trong một lần lưu.
- **Nhược điểm:**
  - Không tự động kích hoạt `FOREIGN KEY CASCADE` khi một trang tĩnh bị xóa (phải xử lý mềm ở tầng service).

#### Kiến nghị kiểm toán (Auditor Recommendation):
Khuyến nghị sử dụng **Phương án 1 (Bảng chuẩn hóa `menus` + `menu_items`)** NẾU cần kiểm soát chặt chẽ quan hệ dữ liệu và audit log từng item; hoặc sử dụng **Phương án 2 (`site_settings.navigation_menus`)** nếu muốn kiến trúc tinh gọn, đồng bộ với `school_identity` và tối ưu tốc độ render của Header/Footer. Quyết định này được đưa vào mục Quyết định mở (Open Decisions).

---

### 2.3. Thực thể Cấu hình SEO Hệ thống (`seo_settings`)

Hiện tại, bảng `site_settings` đã có cơ chế lưu trữ JSONB:
- `school_identity` (Tên trường, slogan, hotline, email, logo, favicon, mạng xã hội).
- `branding` (Bảng màu primary, secondary, custom CSS).

Do đó, cấu hình SEO toàn trang nên được chuẩn hóa thành một key trong `site_settings`:
- **Key:** `'seo_settings'`
- **Đặc điểm:** `is_public = TRUE` (để crawler và public shell có thể đọc không cần đăng nhập).
- **Cấu trúc JSONB dự kiến:**
  ```json
  {
    "meta_title_template": "%s | Trường THPT Mẫu",
    "meta_description_default": "Cổng thông tin điện tử trường THPT...",
    "meta_keywords_default": "trường học, giáo dục, thpt, tin tức nhà trường",
    "og_image_default": "/assets/school-banner.jpg",
    "google_site_verification": "google-verification-code-xyz",
    "google_analytics_id": "G-XXXXXXXXXX",
    "robots_txt_content": "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /setup/\nSitemap: https://thptmau.edu.vn/sitemap.xml",
    "sitemap_enabled": true,
    "structured_data_enabled": true
  }
  ```

---

## 3. ĐÁNH GIÁ PHÂN BỔ QUYỀN HẠN TRONG CSDL (RBAC SEED AUDIT)

Kiểm tra bảng `permissions` hiện tại:
- Đã có 4 bản ghi:
  - `pages.view`: Xem trang tĩnh giới thiệu
  - `pages.create`: Tạo trang tĩnh mới
  - `pages.edit`: Chỉnh sửa nội dung trang tĩnh
  - `pages.delete`: Xóa trang tĩnh
- **Thiếu:**
  - `menu.view`: Xem danh sách menu
  - `menu.edit`: Quản trị và sắp xếp menu
  - `seo.view`: Xem cấu hình SEO
  - `seo.edit`: Cập nhật cấu hình SEO & Google Analytics

Kiểm tra bảng `role_permissions`:
- Cả 4 quyền `pages.*` đều **chưa được gán** cho vai trò nào trong `role_permissions`.
- Khi triển khai Step 09, cần seed phân bổ:
  - `SUPER_ADMIN`: Có tất cả quyền.
  - `ADMIN`: Nhận toàn bộ quyền `pages.*`, `menu.*`, `seo.*`.
  - `EDITOR`: Nhận `pages.view`, `pages.create`, `pages.edit`, `menu.view`.
  - `AUTHOR`: Nhận `pages.view` (hoặc không có quyền sửa trang tĩnh của trường).
  - `PUBLIC_VISITOR`: Xem các trang có `status = 'published'`.

---

## 4. TỔNG KẾT & ĐÁNH GIÁ SẴN SÀNG CSDL

1. **Schema Readiness:** 25% (Đã có sẵn nền móng `site_settings`, `module_settings`, `profiles` và hàm `has_permission`).
2. **Missing Migrations:** Cần đúng 1 migration tổng thể cho Step 09 tạo bảng `pages`, hoàn thiện phân quyền và seed cấu hình menu/seo ban đầu.
3. **Data Integrity Risks:** Cực thấp, vì Step 09 là phân hệ độc lập, không làm thay đổi các bảng đã có (`news`, `documents`, `announcements`, `media`).
