# STEP 09.5C — SEO SETTINGS ADMIN UI IMPLEMENTATION REPORT

**Dự án:** School News Platform  
**Phase:** STEP 09.5C — SEO Settings Admin UI  
**Ngày thực hiện:** 2026-09-17  
**Tác giả:** Senior React / TypeScript / UI Architecture / Supabase Integration Engineer  

---

## 1. Tổng Quan Triển Khai

Giai đoạn STEP 09.5C tập trung triển khai giao diện quản trị cấu hình SEO & Siêu dữ liệu toàn trường tại đường dẫn `/admin/seo`. Toàn bộ quá trình triển khai tuân thủ nghiêm ngặt nguyên tắc cốt lõi:
- **Kiến trúc Singleton:** Cấu hình SEO chỉ có duy nhất 1 bản ghi với `id = 'default'`. Giao diện không cung cấp tính năng tạo thêm bản ghi, không cho chọn bản ghi và không có chức năng xóa.
- **Ranh giới cứng (Hard Boundary):**
  - Giao diện UI KHÔNG gọi trực tiếp Supabase client (`supabase.from`).
  - Toàn bộ giao tiếp thông qua hook `useSeoSettings` và `useUpdateSeoSettings`.
  - Mọi dữ liệu trước khi gửi đến mutation hook đều được kiểm tra chặt chẽ bởi `seoSettingsUpdateSchema` (Zod).
- **Phân quyền đa tầng (Defense in Depth):**
  - Tầng route: `ProtectedRoute` với quyền `settings.view` và `ModuleGuard` với module `seo`.
  - Tầng UI: Kiểm tra `settings.edit` để chuyển giao diện sang chế độ chỉ đọc nếu người dùng không đủ quyền.
  - Tầng Database: RLS policy từ Step 09.3B đảm bảo chỉ tài khoản có quyền `settings.edit` mới có thể thực hiện `UPDATE` trên bảng `seo_settings`.

---

## 2. Danh Mục Tệp Đã Tạo & Cập Nhật

### 2.1. Thành phần giao diện (UI Components)
1. `src/modules/seo/components/SeoStatusBadge.tsx`:
   - Huy hiệu định danh Singleton `id="default"`.
   - Hiển thị ngày giờ cập nhật lần cuối (`updated_at`).
   - Huy hiệu trạng thái nhanh: Canonical URL, Sitemap XML, Google Verification.
2. `src/modules/seo/components/SeoPreviewCard.tsx`:
   - Trình mô phỏng kết quả tìm kiếm Google (SERP Simulator) trên Desktop & Mobile.
   - Trình mô phỏng chia sẻ mạng xã hội (OpenGraph Share Preview).
   - Trình kiểm tra dữ liệu có cấu trúc Schema.org WebSite JSON-LD với tính năng sao chép nhanh.
3. `src/modules/seo/components/SeoGeneralSettingsForm.tsx`:
   - Cấu hình mẫu tiêu đề (`meta_title_pattern`) với hướng dẫn sử dụng mã `%s` và danh sách mẫu gợi ý nhanh.
   - Cấu hình tên miền gốc chuẩn hóa (`canonical_base_url`).
   - Cấu hình mô tả mặc định (`meta_description_default`) kèm bộ đếm ký tự (khuyến nghị 120-160 ký tự).
   - Cấu hình từ khóa mặc định (`meta_keywords_default`) với chip từ khóa tự động bóc tách.
4. `src/modules/seo/components/SeoSocialSettingsForm.tsx`:
   - Cấu hình đường dẫn ảnh OpenGraph mặc định (`og_image_default`).
   - Khung xem trước ảnh đại diện với tỉ lệ chuẩn 1.91 : 1 (1200 × 630 px).
   - Hướng dẫn kỹ thuật chuẩn bị tệp hình ảnh cho mạng xã hội.
5. `src/modules/seo/components/SeoIndexingSettingsForm.tsx`:
   - Công tắc Bật/Tắt Sơ đồ trang web (`sitemap_enabled`) kèm đường dẫn sitemap tự động suy diễn.
   - Công tắc Bật/Tắt Dữ liệu có cấu trúc Schema.org (`structured_data_enabled`).
   - Mã xác minh Google Search Console (`google_site_verification`) với bộ lọc tự động trích xuất mã token khi người dùng dán toàn bộ thẻ HTML `<meta>`.
   - Mã xác minh Bing Webmaster Tools (`bing_site_verification`).
6. `src/modules/seo/components/SeoRobotsTxtForm.tsx`:
   - Trình soạn thảo văn bản `robots.txt` với font chữ đơn cách (monospace).
   - Nút "Khởi tạo cấu hình tiêu chuẩn" tự động gọi hàm sinh mã `generateRobotsTxt`.
   - Cảnh báo trực quan nguy cơ chặn toàn bộ website nếu phát hiện chỉ thị `Disallow: /`.
7. `src/modules/seo/pages/SeoAdminPage.tsx`:
   - Trang quản trị SEO chính kết hợp Form theo 4 tab chuyên sâu và cột bên hiển thị Live Preview mô phỏng thời gian thực.
   - Theo dõi trạng thái thay đổi (`isDirty`), hỗ trợ Hủy thay đổi (`handleResetForm`) và Lưu cấu hình (`handleSave`).
   - Xử lý trạng thái tải (Skeleton loading) và lỗi tải lại (Retry).
8. `src/pages/admin/AdminSeoSettingsPage.tsx`:
   - Tệp Wrapper điều hướng tại `src/pages/admin/`.

### 2.2. Cập nhật hệ thống định tuyến và thanh điều hướng
1. `src/routes/index.tsx`:
   - Đăng ký tuyến đường `/admin/seo` và `/admin/seo/*`.
   - Bọc bởi `ProtectedRoute` (`settings.view`) và `ModuleGuard` (`moduleKey="seo"`).
2. `src/navigation/adminNavigation.ts`:
   - Bổ sung mục điều hướng `admin-seo` vào nhóm `CẤU HÌNH & HỆ THỐNG`.
   - Biểu tượng `Globe`, liên kết `/admin/seo`, quyền `settings.view`.
3. `src/modules/seo/index.ts`:
   - Xuất khẩu toàn bộ các component và trang mới qua Barrel export.

---

## 3. Kết Quả Kiểm Thử & Xác Minh

Toàn bộ 99 bài kiểm thử tự động trong kịch bản `scripts/step09/run_step09_5c_verification.ts` đã vượt qua 100%:
- **Kiểm tra tệp và xuất khẩu:** 17/17 PASS.
- **Kiểm tra an toàn tĩnh và ranh giới kiến trúc:** 49/49 PASS (Không có lệnh gọi trực tiếp `supabase.from`, không có `@ts-ignore`, không dùng quyền ảo).
- **Kiểm tra định tuyến và thanh điều hướng:** 9/9 PASS.
- **Kiểm tra ràng buộc Singleton:** 5/5 PASS (Không có nút tạo, xóa hay chọn bản ghi).
- **Kiểm thử logic nghiệp vụ & Schema Zod:** 14/14 PASS.
- **Kiểm tra ranh giới nghiêm ngặt:** 4/4 PASS (Zero public page, zero public robots.txt, chính xác 14 migrations).
- **Biên dịch TypeScript (`compile_applet` & `tsc --noEmit`):** Build thành công, 0 lỗi.
- **Hồi quy toàn bộ các bước trước (09.4C, 09.5A, 09.5B):** 110/110 bài kiểm thử vượt qua.
