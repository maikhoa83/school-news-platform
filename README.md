# School News Platform

> Nền tảng Website tin tức & Cổng thông tin điện tử tích hợp Hệ quản trị nội dung (CMS) chuẩn mực dành cho các trường trung học phổ thông và cơ sở giáo dục tại Việt Nam.

---

## 1. Triết lý & Kiến trúc hệ thống

Dự án tuân thủ nghiêm ngặt mô hình kiến trúc **Single-Tenant độc lập**:

```
ONE CODEBASE
  └── ONE SCHOOL INSTALLATION
        ├── ONE SUPABASE DATABASE
        ├── ONE STORAGE SYSTEM
        ├── ONE AUTH INSTANCE
        └── ONE SCHOOL DOMAIN
```

- **Độc lập dữ liệu tuyệt đối:** Mỗi trường học sở hữu một cơ sở dữ liệu riêng, cấu hình riêng, không dùng chung database (No SaaS Multi-Tenant, No Shared Schema).
- **Phân quyền chặt chẽ (RBAC + RLS):** 5 vai trò hệ thống (`PUBLIC_VISITOR`, `AUTHOR`, `EDITOR`, `ADMIN`, `SUPER_ADMIN`) với 40 quyền hạn chi tiết được bảo vệ từ giao diện, routing tới Row-Level Security (RLS) ở tầng PostgreSQL.
- **Bảo mật tối đa:** Không bao giờ chứa khóa `SUPABASE_SERVICE_ROLE_KEY` trong mã nguồn client. Toàn bộ hoạt động của người dùng tuân theo RLS qua `anon` key và phiên JWT.

---

## 2. Công nghệ cốt lõi (Tech Stack)

- **Giao diện & Ứng dụng:** React 19, TypeScript strict mode, Vite 6.
- **Định tuyến:** React Router v7.
- **Phong cách & Giao diện:** Tailwind CSS v4, Lucide React, các thành phần UI lấy cảm hứng từ shadcn/ui.
- **Quản lý trạng thái & Truy vấn:** TanStack Query v5.
- **Xử lý biểu mẫu & Xác thực dữ liệu:** React Hook Form, Zod.
- **Backend & Cơ sở dữ liệu:** Supabase (PostgreSQL 15+, Supabase Auth, Supabase Storage, PostgreSQL RLS).

---

## 3. Cấu trúc thư mục

```
├── .env.example              # File mẫu cấu hình biến môi trường
├── .gitignore                # Danh sách loại trừ an toàn (loại trừ secrets, zips, cache)
├── index.html                # Entry point HTML chuẩn SEO và OpenGraph
├── package.json              # Khai báo dependencies và script kiểm thử
├── tsconfig.json             # Cấu hình TypeScript Strict
├── vite.config.ts            # Cấu hình Vite bundler & Tailwind CSS
├── public/                   # Tài nguyên tĩnh công khai
│   ├── _redirects            # Cấu hình SPA routing cho Cloudflare Pages
│   └── assets/               # Hình ảnh và icon mặc định
├── src/                      # Toàn bộ mã nguồn ứng dụng
│   ├── components/           # Component dùng chung (Navbar, Footer, Modals, Breadcrumb)
│   ├── contexts/             # Context API (Auth, Theme, ...)
│   ├── hooks/                # Custom React hooks (useAuth, usePermissions, useHealth, ...)
│   ├── lib/                  # Tiện ích hạ tầng (supabase.ts, env.ts, authorization.ts)
│   ├── modules/              # Các module chức năng theo miền nghiệp vụ:
│   │   ├── audit/            # Nhật ký kiểm toán an toàn (Audit Log + Sanitizer)
│   │   ├── categories/       # Danh mục chuyên mục tin tức
│   │   ├── documents/        # Quản lý văn bản, công văn hành chính
│   │   ├── health/           # Bảng kiểm tra sức khỏe hệ thống 6 tầng (Health Check)
│   │   ├── homepage/         # Trình dựng bố cục trang chủ (Homepage Builder)
│   │   ├── media/            # Thư viện ảnh và đa phương tiện
│   │   ├── menu/             # Hệ thống menu đa cấp động
│   │   ├── news/             # Soạn thảo và duyệt bài viết tin tức
│   │   ├── pages/            # Quản lý trang tĩnh giới thiệu
│   │   ├── seo/              # Quản trị cấu hình SEO & thẻ mạng xã hội
│   │   ├── settings/         # Nhận diện trường và thông tin liên hệ
│   │   └── users/            # Quản lý người dùng và phân quyền RBAC
│   ├── pages/                # Các trang hiển thị công khai và trang quản trị Admin
│   └── routes/               # Cấu hình router tập trung và bộ bảo vệ quyền truy cập
├── supabase/
│   ├── migrations/           # 15 file migration SQL chuẩn hóa (Hard Baseline)
│   └── seed/                 # Dữ liệu khởi tạo vai trò, quyền và thiết lập mẫu
├── scripts/                  # Bộ công cụ kiểm thử tự động (Step 07 -> Step 11)
└── docs/                     # Tài liệu thiết kế và kiến trúc qua các giai đoạn
```

---

## 4. Yêu cầu môi trường (Prerequisites)

- **Node.js:** Phiên bản 20.x hoặc 22.x LTS.
- **npm:** Phiên bản 10.x trở lên.
- **Supabase Account / Project:** Một dự án Supabase mới (hoặc local Supabase CLI) dành riêng cho trường học.

---

## 5. Hướng dẫn cài đặt & Chạy ứng dụng

### Bước 1: Sao chép repository
```bash
git clone <URL_REPOSITORY_GITHUB>
cd school-news-platform
```

### Bước 2: Cài đặt thư viện dependencies
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` và điền thông tin dự án Supabase:
```env
# URL kết nối tới dự án Supabase của nhà trường
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"

# Khóa công khai Anon Key của Supabase
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Môi trường chạy ứng dụng (development | staging | production)
VITE_APP_ENV="development"

# (Tùy chọn) Chỉ cần khi chạy scripts kiểm thử Step 07/08 server-side
SUPABASE_SERVICE_ROLE_KEY=""
```

### Bước 4: Khởi động môi trường phát triển (Dev server)
```bash
npm run dev
```
Ứng dụng sẽ hoạt động tại địa chỉ: `http://localhost:3000`.

---

## 6. Khởi tạo Cơ sở dữ liệu Supabase

Để khởi tạo đầy đủ hệ thống bảng, hàm và chính sách RLS cho trường học, hãy chạy 15 migration theo đúng thứ tự thời gian trong Supabase SQL Editor:

1. `20260101000000_initial_schema.sql` (Cơ sở dữ liệu cốt lõi, bảng users, roles, site_settings)
2. `20260102000000_step03_foundation.sql` (Hoàn thiện bảng danh mục và bảng dữ liệu nền)
3. `20260103000000_step04_homepage_builder.sql` (Khối bố cục trang chủ linh hoạt)
4. `20260104000000_step05_news_module.sql` (Bảng tin tức, bài viết, tags)
5. `20260105000000_step05a_news_integrity_hardening.sql` (Bảo vệ tính toàn vẹn tin tức)
6. `20260106000000_step06_documents_module.sql` (Bảng văn bản hành chính)
7. `20260107000000_step06_security_hardening.sql` (Gia cố bảo mật văn bản)
8. `20260108000000_step06_final_fix.sql` (Hoàn thiện chính sách truy cập văn bản)
9. `20260109000000_step07_announcements_module.sql` (Bảng thông báo nhà trường)
10. `20260110000000_step07_security_integrity_fix.sql` (Bảo vệ toàn vẹn thông báo)
11. `20260111000000_step07_author_authorization_fix.sql` (Hoàn thiện quyền tác giả)
12. `20260112000000_step08_media_module.sql` (Thư viện media, albums)
13. `20260113000000_step09_pages_menu_seo.sql` (Trang tĩnh, menu đa cấp, cấu hình SEO)
14. `20260114000000_step09_rls_permissions.sql` (Chính sách RLS nâng cao cho trang tĩnh & menu)
15. `00015_create_audit_logs.sql` (Nhật ký kiểm toán Append-Only chống sửa xóa)

### Khởi tạo dữ liệu mẫu (Seed):
Sau khi chạy xong 15 migrations, chạy tiếp:
- `supabase/seed/00_roles_and_permissions.sql`: Nạp 5 vai trò hệ thống, 40 quyền hạn chuẩn và thông tin nhận diện mặc định của trường.

### Cấu hình Supabase Storage Buckets:
Tạo 3 buckets trong mục Storage:
- `media`: Bucket công khai (`public: true`) chứa hình ảnh hoạt động, sự kiện.
- `documents`: Bucket lưu trữ công văn, tài liệu PDF, DOCX.
- `site-assets`: Bucket công khai (`public: true`) chứa logo trường, banner, favicon.

---

## 7. Đóng gói & Triển khai (Build & Deployment)

### Đóng gói sản phẩm:
```bash
npm run build
```
Thư mục xuất bản: `dist/`.

### Triển khai lên Cloudflare Pages:
1. Kết nối kho mã nguồn GitHub với Cloudflare Pages.
2. Thiết lập cấu hình Build:
   - **Framework preset:** `Vite` (hoặc `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:**
     - `VITE_SUPABASE_URL`: `<URL Supabase của trường>`
     - `VITE_SUPABASE_ANON_KEY`: `<Anon key>`
     - `VITE_APP_ENV`: `production`
3. Tệp `public/_redirects` đã được cấu hình sẵn quy tắc `/* /index.html 200` để đảm bảo định tuyến React Router SPA không bị lỗi 404 khi tải lại trang.

---

## 8. Kiểm thử & Đảm bảo chất lượng (Verification)

Hệ thống tích hợp sẵn các bộ kiểm thử tự động toàn diện:

- **Kiểm tra kiểu dữ liệu (TypeScript Strict):**
  ```bash
  npm run lint
  ```
- **Kiểm tra Module Quản trị & Health Dashboard (Step 10.4):**
  ```bash
  npm run verify:step10:4
  ```
- **Kiểm tra hồi quy toàn diện hệ thống (Step 11 Regression Suite):**
  ```bash
  npm run verify:step11
  ```

---

## 9. Ranh giới bất biến (Hard Boundaries)

1. **Tuyệt đối không sửa đổi 15 file migration đã khóa:** Cơ sở dữ liệu là ranh giới cố định. Mọi thay đổi trong tương lai phải được hội đồng kiến trúc phê duyệt.
2. **Không đưa bí mật vào Git:** File `.env` chứa mật khẩu/khóa phải luôn nằm trong `.gitignore`.
3. **Tuân thủ đơn trường:** Không bổ sung cơ chế multi-tenant làm phức tạp hóa mô hình vận hành của nhà trường.
