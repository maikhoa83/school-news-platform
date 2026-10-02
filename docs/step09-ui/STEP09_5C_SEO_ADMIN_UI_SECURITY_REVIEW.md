# STEP 09.5C — SEO SETTINGS ADMIN UI SECURITY REVIEW

**Dự án:** School News Platform  
**Phase:** STEP 09.5C — SEO Settings Admin UI  
**Ngày đánh giá:** 2026-09-17  
**Phạm vi đánh giá:** Giao diện quản trị SEO, định tuyến, phân quyền và phòng chống rủi ro bảo mật.

---

## 1. Mô Hình Mối Nguy & Rủi Ro (Threat Modeling)

| Mã mối nguy | Mô tả rủi ro | Mức độ rủi ro | Biện pháp phòng vệ triển khai | Trạng thái |
|---|---|---|---|---|
| **TH-SEO-01** | Người dùng không có thẩm quyền truy cập và sửa đổi cấu hình SEO | Cao | Tuyến đường được bảo vệ bởi `ProtectedRoute` với quyền `settings.view` và `ModuleGuard` với `moduleKey="seo"`. Nút lưu và trường chỉnh sửa bị vô hiệu hóa nếu thiếu `settings.edit`. RLS tại tầng cơ sở dữ liệu ngăn chặn triệt để mọi truy vấn sửa đổi trái phép. | **ĐÃ GIẢI QUYẾT** |
| **TH-SEO-02** | Tấn công chèn mã độc XSS qua các trường tiêu đề, mô tả hoặc mã xác minh | Cao | Toàn bộ dữ liệu được validate chặt chẽ qua Zod schema (`seoSettingsUpdateSchema`). Các trường chỉ cho phép chuỗi ký tự hợp lệ với giới hạn độ dài nghiêm ngặt (Title Pattern: 255, Description: 500, Keywords: 500, Verification Token: 255). Trình hiển thị React tự động mã hóa HTML entities. | **ĐÃ GIẢI QUYẾT** |
| **TH-SEO-03** | Tấn công Open Redirect hoặc liên kết giả mạo qua `canonical_base_url` | Trung bình | Zod schema yêu cầu `canonical_base_url` phải bắt đầu bằng giao thức hợp lệ `http://` hoặc `https://`. Mọi ký tự gạch chéo cuối trang (`trailing slash`) được tự động chuẩn hóa để tránh phân mảnh URL. | **ĐÃ GIẢI QUYẾT** |
| **TH-SEO-04** | Vô tình khóa toàn bộ website khỏi các công cụ tìm kiếm qua `robots.txt` | Trung bình | Form `SeoRobotsTxtForm` tích hợp cơ chế phát hiện chỉ thị `Disallow: /` và hiển thị cảnh báo đỏ trực quan cho người quản trị trước khi lưu. | **ĐÃ GIẢI QUYẾT** |
| **TH-SEO-05** | Phá vỡ tính toàn vẹn Singleton (`id = 'default'`) | Cao | UI tuyệt đối không hiển thị các trường nhập `id`, không có thao tác tạo bản ghi mới hay xóa bản ghi. Service và Hook cố định `id = 'default'` trong mọi truy vấn. | **ĐÃ GIẢI QUYẾT** |
| **TH-SEO-06** | Lộ lọt mã bí mật hoặc API keys | Cao | Module SEO chỉ lưu trữ các mã định danh xác minh công khai (Search Console Token). Không lưu trữ hoặc truyền bất kỳ API secret, service role key hay thông tin nhạy cảm nào. | **ĐÃ GIẢI QUYẾT** |

---

## 2. Kiểm Tra Ranh Giới Kiến Trúc & Code Review

1. **Bảo toàn Service Layer:**
   - 100% các thành phần UI gọi thông qua `useSeoSettings` và `useUpdateSeoSettings`.
   - Tuyệt đối không xuất hiện `supabase.from('seo_settings')` trong bất kỳ component hay page nào.
2. **Kiểm tra quyền hạn chuẩn tắc:**
   - Hệ thống chỉ sử dụng hai quyền đã được định nghĩa trong Master Document: `settings.view` và `settings.edit`.
   - Không xuất hiện bất kỳ quyền giả định nào như `seo.view`, `seo.edit`, `seo.create` hay `seo.delete`.
3. **An toàn kiểu dữ liệu:**
   - Hoàn toàn không có `@ts-ignore` hoặc ép kiểu không an toàn (`any`).
   - Linter (`tsc --noEmit`) hoàn thành với 0 lỗi cảnh báo.

---

## 3. Kết Luận Đánh Giá An Ninh

Giao diện quản trị SEO tại STEP 09.5C tuân thủ toàn diện các tiêu chuẩn bảo mật của hệ thống Cổng thông tin trường học, đạt trạng thái **APPROVED FOR PRODUCTION**.
