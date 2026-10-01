# PHÂN TÍCH KHOẢNG TRỐNG KIẾN TRÚC (ARCHITECTURE GAP ANALYSIS) — STEP 09
**Dự án:** School News Platform v1.2  
**Mã kiểm định:** STEP 09.2 — ARCHITECTURE GAP ANALYSIS  
**Ngày thực hiện:** 2026-09-16  
**Nguyên tắc cốt lõi:** Strict Layered Architecture (UI Page → UI Component → Custom Hook → Service → Supabase)  

---

## 1. MÔ HÌNH KIẾN TRÚC PHÂN TẦNG (LAYERED ARCHITECTURE PRINCIPLE)

School News Platform tuân thủ nghiêm ngặt nguyên tắc phân tầng hướng dịch vụ:
```
[Tầng 1: Presentation / Page]
         ↓
[Tầng 2: UI Component Primitives]
         ↓
[Tầng 3: Custom React Hooks (State, Query, Cache)]
         ↓
[Tầng 4: Service Layer (Business Logic, Validation, DTO Mapping)]
         ↓
[Tầng 5: Data Access Layer (Supabase Client + RLS Security)]
```

**Quy tắc bất biến:**
1. Các component giao diện (Page, Component) **TUYỆT ĐỐI KHÔNG** được gọi trực tiếp `supabase.from(...)`.
2. Toàn bộ logic nghiệp vụ, xử lý dữ liệu và truy vấn CSDL phải nằm trong Tầng 4 (`src/services/`).
3. Toàn bộ quản lý trạng thái, nạp dữ liệu (fetch), phân trang, và phản hồi lỗi phải nằm trong Tầng 3 (`src/hooks/`).

---

## 2. BẢNG PHÂN TÍCH KHOẢNG TRỐNG THEO TỪNG TẦNG (GAP ANALYSIS BY LAYER)

### 2.1. Tầng Kiểu dữ liệu & Giao diện hợp đồng (`src/types/`)

| File mục tiêu | Trạng thái hiện tại | Nội dung cần thiết lập cho Step 09 |
|:---|:---:|:---|
| `src/types/page.ts` | `[MISSING]` | - `PageStatus`: `'draft' \| 'published' \| 'archived'`<br>- `PageTemplate`: `'default' \| 'fullwidth' \| 'sidebar' \| 'contact'`<br>- `Page`: Thực thể trang tĩnh đầy đủ<br>- `PageCreateInput`, `PageUpdateInput`<br>- `PageFilterParams`, `PagePaginationResult` |
| `src/types/menu.ts` | `[PARTIAL]`<br>(Chỉ có `NavigationItem` tĩnh trong `navigation/types.ts`) | - `MenuLocation`: `'header_main' \| 'footer_quick' \| 'footer_edu'`<br>- `MenuItem`: Thực thể item có id, parent_id, sort_order, url, target, icon, module_key, page_id<br>- `MenuTree`: Cấu trúc cây phân cấp đa tầng<br>- `MenuUpdatePayload` |
| `src/types/seo.ts` | `[MISSING]` | - `SiteSEOSettings`: Cấu hình SEO tổng thể trong `site_settings`<br>- `PageSEOMetadata`: Thẻ meta riêng của từng trang/bài<br>- `SchemaOrgSchool`, `SchemaOrgNewsArticle`, `SchemaOrgBreadcrumb` |

---

### 2.2. Tầng Dịch vụ Nghiệp vụ (`src/services/`)

| File mục tiêu | Trạng thái hiện tại | Trách nhiệm kiến trúc cần triển khai |
|:---|:---:|:---|
| `src/services/pageService.ts` | `[MISSING]` | - `getPublishedPages(params)`: Lấy danh sách trang tĩnh công khai<br>- `getPageBySlug(slug)`: Lấy chi tiết trang tĩnh đã xuất bản theo slug<br>- `incrementPageView(id)`: Tăng lượt xem an toàn<br>- `getAdminPages(params)`: Quản trị viên tra cứu toàn bộ bản nháp/bản xuất bản<br>- `createPage(input)`: Tạo trang mới kèm kiểm tra `RESERVED_SLUGS`<br>- `updatePage(id, input)`: Cập nhật nội dung trang<br>- `deletePage(id)`: Xóa trang tĩnh an toàn |
| `src/services/menuService.ts` | `[MISSING]` | - `getNavigationMenus()`: Đọc cây menu Header & Footer (kèm fallback tĩnh nếu CSDL trống)<br>- `updateNavigationMenus(payload)`: Lưu cấu trúc cây menu kéo thả từ CMS<br>- `validateMenuLinks(items)`: Kiểm tra tính hợp lệ của các URL nội bộ và ngoại bộ |
| `src/services/seoService.ts` | `[MISSING]` | - `getSEOSettings()`: Lấy cấu hình SEO từ `site_settings`<br>- `updateSEOSettings(settings)`: Lưu cấu hình SEO, GA4, GSC<br>- `generateSitemapXml()`: Biên soạn chuỗi XML sitemap chuẩn từ CSDL<br>- `getRobotsTxtContent()`: Lấy nội dung robots.txt tùy biến |

---

### 2.3. Tầng React Hooks (`src/hooks/`)

| File mục tiêu | Trạng thái hiện tại | Trách nhiệm kiến trúc cần triển khai |
|:---|:---:|:---|
| `src/hooks/usePages.ts` | `[MISSING]` | Hook quản lý danh sách trang cho Quản trị viên (lọc theo trạng thái, tìm kiếm, phân trang). |
| `src/hooks/usePageDetail.ts` | `[MISSING]` | Hook nạp trang tĩnh công khai theo slug (xử lý loading, error, not found, và tự động gọi tăng view). |
| `src/hooks/useAdminPageEditor.ts` | `[MISSING]` | Hook quản lý form tạo/sửa trang tĩnh: kiểm soát dirty state, auto-slug từ tiêu đề, chuyển đổi trạng thái draft/published, lưu dữ liệu. |
| `src/hooks/useMenus.ts` | `[MISSING]` | Hook nạp và quản lý cây menu cho cả Public Shell (Header/Footer) và Admin CMS Builder. |
| `src/hooks/useSEO.ts` | `[MISSING]` | Hook quản lý thẻ `<head>` động, đồng bộ tiêu đề trang, meta description và chèn JSON-LD. |

---

### 2.4. Tầng Giao diện & Thành phần (`src/components/` & `src/pages/`)

| File mục tiêu | Trạng thái hiện tại | Trách nhiệm kiến trúc cần triển khai |
|:---|:---:|:---|
| `src/pages/public/PublicPageView.tsx` | `[MISSING]` | Trang hiển thị nội dung trang tĩnh cho người truy cập: Breadcrumbs, Tiêu đề, Tác giả, Ngày phát hành, Khung RichText đã khử độc XSS, Khối chia sẻ mạng xã hội. |
| `src/pages/admin/AdminPagesListPage.tsx` | `[MISSING]` | Trang quản lý danh sách trang tĩnh trong CMS: Tìm kiếm, lọc trạng thái, bảng hiển thị cột tiêu đề, slug, ngày tạo, lượt xem, nút sửa/xóa/đổi trạng thái. |
| `src/pages/admin/AdminPageEditorPage.tsx` | `[MISSING]` | Trang soạn thảo trang tĩnh: Nhập tiêu đề (tự sinh slug), chọn bố cục (template), trình soạn thảo RichTextEditor, upload ảnh đại diện, cấu hình SEO riêng cho trang. |
| `src/pages/admin/AdminMenusPage.tsx` | `[MISSING]` | Giao diện quản lý Menu điều hướng trực quan: Cho phép thêm mới mục menu, chọn liên kết đến trang tĩnh hoặc module, kéo thả thay đổi vị trí, tạo menu con. |
| `src/components/common/SEOHead.tsx` | `[MISSING]` | Component quản lý Document Head đồng bộ React 19 Metadata. |

---

## 3. TÍCH HỢP CONTEXT TOÀN CỤC (`src/contexts/ConfigContext.tsx`)

Hiện tại, `ConfigContext` quản lý:
- `schoolIdentity`: Thông tin nhận diện trường học (từ `site_settings`).
- `branding`: Bảng màu sắc (từ `site_settings`).
- `modules`: Trạng thái bật/tắt các module (từ `module_settings`).

### Đề xuất tích hợp cho Step 09:
1. **Bổ sung `seoSettings` vào `ConfigContext`:** Tải đồng thời với `schoolIdentity` khi ứng dụng khởi động. Điều này giúp toàn bộ các trang con có sẵn cấu hình SEO mặc định (Title template, GA4 ID) mà không cần gọi truy vấn CSDL riêng lẻ.
2. **Cung cấp `menus` có bộ nhớ đệm (Cached Menus):** Menu Header và Footer xuất hiện trên 100% các trang. Cung cấp dữ liệu menu qua `ConfigContext` giúp Public Shell render tức thời khi điều hướng qua lại giữa các trang mà không gây hiện tượng giật màn hình (flicker).

---

## 4. TỔNG KẾT ĐÁNH GIÁ KHOẢNG TRỐNG KIẾN TRÚC

Hệ thống hiện tại có cấu trúc thư mục và quy chuẩn mã nguồn rất kỷ luật. Toàn bộ khoảng trống của Step 09 đều tuân theo đúng khuôn mẫu đã triển khai thành công ở các Step 05 (News), Step 06 (Documents), Step 07 (Announcements), và Step 08 (Media). Việc thực thi Step 09 sẽ là sự hoàn thiện tự nhiên của bức tranh kiến trúc, hoàn toàn không gây xáo trộn các module đã có.
