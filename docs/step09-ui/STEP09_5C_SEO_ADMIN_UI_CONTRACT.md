# STEP 09.5C — SEO SETTINGS ADMIN UI CONTRACT

**Dự án:** School News Platform  
**Phase:** STEP 09.5C — SEO Settings Admin UI  
**Mục tiêu:** Định nghĩa hợp đồng giao diện, luồng dữ liệu, schema, props, và singleton pattern của module SEO CMS.

---

## 1. Route & Navigation Contract

### 1.1. URL Routes
| Đường dẫn | Quyền yêu cầu | Module Guard | Component phụ trách | Mục đích |
|---|---|---|---|---|
| `/admin/seo` | `settings.view` | `seo` | `AdminSeoSettingsPage` | Giao diện quản trị cấu hình SEO & Siêu dữ liệu toàn trường |
| `/admin/seo/*` | `settings.view` | `seo` | `AdminSeoSettingsPage` | Fallback routing bảo vệ subroutes |

### 1.2. Sidebar Navigation Item
- **Key:** `admin-seo`
- **Label:** `Cấu hình SEO & MXH`
- **Href:** `/admin/seo`
- **Icon:** `Globe` (lucide-react)
- **ModuleKey:** `seo`
- **RequiredPermission:** `settings.view`

---

## 2. Singleton Identity Contract

### 2.1. Invariant
- Record ID duy nhất: `id = 'default'`.
- Khóa chính luôn cố định, không thể thay đổi (`SEO_SINGLETON_ID = 'default'`).
- UI KHÔNG cung cấp bất kỳ chức năng nào cho phép:
  - Tạo thêm bản ghi thứ hai (`INSERT` thêm dòng)
  - Chọn lựa bản ghi (`record switcher` hoặc `list selector`)
  - Xóa bản ghi (`DELETE` cấu hình hệ thống)
- Khi cơ sở dữ liệu chưa có dữ liệu, service tự động khởi tạo bản ghi mặc định an toàn.

---

## 3. Component Contracts & Props

### 3.1. `SeoStatusBadge`
```typescript
interface SeoStatusBadgeProps {
  settings: SeoSettings | null;
  isLoading?: boolean;
}
```
Hiển thị:
- Định danh Singleton: `id="default"`
- Thời gian cập nhật lần cuối: `updated_at` định dạng `vi-VN`
- Tình trạng Canonical Base URL (Đã thiết lập / Chưa thiết lập)
- Tình trạng Sitemap (Bật / Tắt)
- Tình trạng xác minh Google Search Console (Đã xác minh / Chưa kết nối)

### 3.2. `SeoPreviewCard`
```typescript
interface SeoPreviewCardProps {
  metaTitlePattern: string;
  metaDescriptionDefault: string;
  canonicalBaseUrl: string;
  ogImageDefault: string;
  structuredDataEnabled: boolean;
  samplePageTitle?: string;
  schoolName?: string;
}
```
Cung cấp 3 chế độ xem trước:
1. **Google SERP Simulator:** Mô phỏng hiển thị trên máy tính (Desktop) và điện thoại (Mobile), tính toán độ dài ký tự tiêu đề và đoạn trích mô tả theo chuẩn Google.
2. **Mạng xã hội (OpenGraph):** Mô phỏng chia sẻ liên kết trên Facebook/Zalo với khung tỉ lệ 1.91:1 (1200 × 630 px).
3. **Schema JSON-LD Inspector:** Hiển thị khối mã dữ liệu có cấu trúc `WebSite` và nút sao chép JSON-LD nhanh.

### 3.3. `SeoGeneralSettingsForm`
```typescript
interface SeoGeneralSettingsFormProps {
  metaTitlePattern: string;
  metaDescriptionDefault: string;
  metaKeywordsDefault: string;
  canonicalBaseUrl: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  schoolName?: string;
}
```

### 3.4. `SeoSocialSettingsForm`
```typescript
interface SeoSocialSettingsFormProps {
  ogImageDefault: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  error?: string;
  canonicalBaseUrl?: string;
}
```

### 3.5. `SeoIndexingSettingsForm`
```typescript
interface SeoIndexingSettingsFormProps {
  sitemapEnabled: boolean;
  structuredDataEnabled: boolean;
  googleSiteVerification: string;
  bingSiteVerification: string;
  canonicalBaseUrl: string;
  onChange: (field: string, value: unknown) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}
```

### 3.6. `SeoRobotsTxtForm`
```typescript
interface SeoRobotsTxtFormProps {
  robotsTxtContent: string;
  canonicalBaseUrl: string;
  sitemapEnabled: boolean;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  error?: string;
}
```

### 3.7. `SeoAdminPage`
- Hook truy vấn: `useSeoSettings()`
- Hook biến đổi: `useUpdateSeoSettings()`
- Phân quyền: `usePermissions()` kiểm tra `settings.view` và `settings.edit`.
- Xác thực: `seoSettingsUpdateSchema` (Zod schema).

---

## 4. Permissions & Access Control

| Quyền hạn | Hành vi giao diện | Hành vi nghiệp vụ |
|---|---|---|
| Không có `settings.view` | Chuyển hướng về `/forbidden` (AccessDeniedPage) | RLS chặn truy vấn `seo_settings` |
| Có `settings.view`, không có `settings.edit` | Xem đầy đủ dữ liệu, thanh cảnh báo "Chế độ chỉ xem", tất cả trường nhập và nút Lưu bị vô hiệu hóa | RLS chặn cập nhật `UPDATE` |
| Có cả `settings.view` và `settings.edit` | Cho phép sửa, kiểm tra dữ liệu trước khi gửi, lưu cập nhật thành công | RLS cho phép `UPDATE` trên `id = 'default'` |
