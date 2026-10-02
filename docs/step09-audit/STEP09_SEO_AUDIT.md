# BÁO CÁO KIỂM TOÁN TỐI ƯU HÓA TÌM KIẾM (SEO AUDIT) — STEP 09
**Dự án:** School News Platform v1.2  
**Mã kiểm định:** STEP 09.2 — SEO AUDIT  
**Ngày thực hiện:** 2026-09-16  
**Tiêu chuẩn:** W3C Semantic HTML, OpenGraph Protocol, Twitter Cards, Schema.org (JSON-LD), Google Search Essentials  

---

## 1. HIỆN TRẠNG TỐI ƯU HÓA TÌM KIẾM CỦA CODEBASE

### 1.1. Thẻ Meta tĩnh trong `index.html`
Kiểm tra `index.html` (dòng 4-12):
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>School News Platform</title>
  <meta name="description" content="Nền tảng website tin tức và CMS cho các trường phổ thông Việt Nam." />
  <meta property="og:title" content="School News Platform" />
  <meta property="og:description" content="Nền tảng website tin tức và CMS cho các trường phổ thông Việt Nam." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</head>
```
- **Hạn chế nghiêm trọng:**
  - Tiêu đề cố định: Dù truy cập bất kỳ trang nào (Trang chủ, Chi tiết bài viết, Văn bản điều hành, Thông báo khẩn), tiêu đề trình duyệt luôn hiển thị "School News Platform".
  - Mô tả cố định: Không thay đổi theo tóm tắt bài viết hay nội dung trang.
  - OpenGraph / Social Share: Khi giáo viên, phụ huynh chia sẻ link bài viết lên Zalo, Facebook, Messenger, mạng xã hội chỉ hiển thị thông tin chung của nền tảng, không hiển thị ảnh đại diện (thumbnail) hay tiêu đề bài viết.
  - Thiếu thẻ `canonical` để chống trùng lặp nội dung.

### 1.2. Trạng thái mã nguồn Frontend (React SPA)
- Kiểm tra toàn bộ mã nguồn `src/`:
  - **Không có bất kỳ lệnh `document.title = ...` nào** được gọi khi chuyển trang.
  - `NewsDetailPage.tsx`: Chỉ nhận slug, lấy dữ liệu và render nội dung, hoàn toàn bỏ qua việc cập nhật thẻ `<title>` hay `<meta>`.
  - Không có gói thư viện quản lý header nào (`react-helmet` hay `react-helmet-async` chưa được cài đặt).

### 1.3. Trạng thái Tệp tin Robots.txt & Sitemap.xml
- Kiểm tra thư mục `public/`:
  - Hoàn toàn **không có `robots.txt`**.
  - Hoàn toàn **không có `sitemap.xml`**.
  - Search Engine Crawlers (Googlebot, Bingbot) không có sơ đồ thu thập bài viết tự động.

---

## 2. YÊU CẦU & KIẾN TRÚC SEO CHO STEP 09

### 2.1. Quản lý Thẻ Đầu trang Động (Dynamic Document Head Management)
Dự án sử dụng **React 19 (`^19.0.1`)**. React 19 hỗ trợ tính năng **Native Metadata Hoisting**:
- Khi render các thẻ `<title>`, `<meta>`, `<link>` bên trong bất kỳ component nào, React sẽ tự động nhấc (hoist) chúng vào thẻ `<head>` của tài liệu HTML.
- **Giải pháp tối ưu:** Xây dựng một component tái sử dụng `SEOHead.tsx` (hoặc hook `useSEO.ts`) không cần cài thêm thư viện ngoài:

```tsx
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noIndex?: boolean;
  publishedTime?: string;
  authorName?: string;
  structuredData?: Record<string, unknown>;
}
```

Nhiệm vụ của `SEOHead`:
1. Đồng bộ `document.title` theo khuôn mẫu cài đặt trường: `{Tiêu đề} | {Tên viết tắt của trường}`.
2. Cập nhật thẻ `<meta name="description" content="..." />`.
3. Cập nhật thẻ OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`).
4. Cập nhật thẻ Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
5. Thêm thẻ `<link rel="canonical" href="..." />`.
6. Thêm thẻ `<meta name="robots" content="noindex, nofollow" />` nếu trang được đánh dấu riêng tư/nháp.

---

### 2.2. Dữ liệu có cấu trúc Schema.org (JSON-LD Structured Data)
Cần triển khai 3 mẫu Schema.org chuẩn cho trường học phổ thông Việt Nam:

#### A. Schema Cơ sở Giáo dục (EducationalOrganization / School) — Áp dụng cho Trang chủ:
```json
{
  "@context": "https://schema.org",
  "@type": "School",
  "name": "Trường Trung Học Phổ Thông Mẫu",
  "alternateName": "THPT Mẫu",
  "url": "https://thptmau.edu.vn",
  "logo": "https://thptmau.edu.vn/logo.svg",
  "telephone": "024 3825 xxxx",
  "email": "c3phothong@moet.edu.vn",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Số 1 Đường Giáo Dục",
    "addressLocality": "Quận Hoàn Kiếm",
    "addressRegion": "Hà Nội",
    "addressCountry": "VN"
  }
}
```

#### B. Schema Bài báo Tin tức (NewsArticle) — Áp dụng cho Chi tiết Tin tức:
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Lễ khai giảng năm học mới 2026 - 2027",
  "image": ["https://.../thumbnail.jpg"],
  "datePublished": "2026-09-05T07:30:00+07:00",
  "dateModified": "2026-09-05T08:00:00+07:00",
  "author": {
    "@type": "Person",
    "name": "Ban Biên Tập"
  },
  "publisher": {
    "@type": "School",
    "name": "Trường THPT Mẫu",
    "logo": {
      "@type": "ImageObject",
      "url": "https://.../logo.svg"
    }
  }
}
```

#### C. Schema BreadcrumbList — Áp dụng cho Trang tĩnh và Danh mục bài viết:
Giúp Google hiển thị thanh điều hướng phân cấp trực tiếp trên trang kết quả tìm kiếm (SERP).

---

### 2.3. Cơ chế Khởi tạo Sitemap.xml & Robots.txt

#### A. Robots.txt chuẩn cho Trường học
Tạo tệp tĩnh mặc định tại `public/robots.txt`:
```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /setup/
Disallow: /forbidden
Disallow: /foundation

Sitemap: https://your-school-domain.edu.vn/sitemap.xml
```

#### B. Trình tạo Sitemap động (Sitemap Generator Utility)
Trong kiến trúc client-side SPA + Supabase:
1. Xây dựng dịch vụ `seoService.generateSitemapXml()` tổng hợp:
   - Các tuyến trang chính: `/`, `/news`, `/documents`, `/announcements`, `/albums`.
   - Toàn bộ các trang tĩnh đã xuất bản (`status = 'published'`): `/page/{slug}`.
   - Toàn bộ tin tức đã xuất bản: `/news/{slug}`.
   - Toàn bộ album hoạt động đã xuất bản: `/albums/{slug}`.
2. Cung cấp chức năng trong trang Quản trị CMS:
   - Cho phép quản trị viên xem trước danh sách URL được lập chỉ mục.
   - Tải về tệp `sitemap.xml` chuẩn để đưa lên Google Search Console hoặc tự động cập nhật khi cấu hình proxy.

---

### 2.4. Giao diện Quản trị Cấu hình SEO trong CMS
Bổ sung Tab **"Cấu hình SEO & Search Engine"** trong `AdminSettingsPage.tsx`:
1. **Tiêu đề & Khung nhận diện:**
   - Cấu hình tiền tố / hậu tố tiêu đề trang (Template Title).
   - Mô tả mặc định toàn trang (Meta Description fallback).
   - Ảnh đại diện chia sẻ mặc định (Social Share Default Image).
2. **Mã xác minh & Đo lường:**
   - Mã xác minh Google Search Console (`google-site-verification`).
   - Mã đo lường Google Analytics 4 (GA4 Tracking ID: `G-XXXXXXXXXX`).
3. **Trình điều khiển Crawler:**
   - Bật/tắt lập chỉ mục tìm kiếm (Search Engine Indexing Switch).
   - Xem và sao chép nội dung `robots.txt`.
   - Xem thống kê số lượng URL sẵn sàng cho `sitemap.xml`.

---

## 3. TỔNG KẾT KHOẢNG TRỐNG SEO (SEO GAP SUMMARY)

| Tiêu chí | Hiện trạng | Yêu cầu Step 09 | Mức ưu tiên |
|:---|:---|:---|:---:|
| **Dynamic Title** | Hoàn toàn thiếu (Cố định 1 tiêu đề) | Tự động đổi theo từng trang và bài viết | **P0 (Bắt buộc)** |
| **Dynamic Meta Description** | Hoàn toàn thiếu | Lấy từ `excerpt` hoặc `meta_description` | **P0 (Bắt buộc)** |
| **OpenGraph & Social Share** | Tĩnh trong index.html | Tự động gắn ảnh thumbnail, title, URL | **P0 (Bắt buộc)** |
| **Robots.txt** | Chưa có file | Bổ sung file chuẩn trong `public/` | **P1 (Quan trọng)** |
| **Sitemap.xml** | Chưa có file | Tạo tiện ích sinh XML sitemap từ CSDL | **P1 (Quan trọng)** |
| **JSON-LD Schema.org** | Hoàn toàn thiếu | Hỗ trợ School, NewsArticle, Breadcrumb | **P1 (Quan trọng)** |
| **Google Analytics / Search Console** | Chưa có trường cấu hình | Thêm cấu hình trong `site_settings` | **P2 (Nâng cao)** |
