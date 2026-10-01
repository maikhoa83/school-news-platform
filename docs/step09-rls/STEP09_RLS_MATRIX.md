# STEP 09.3B — RLS POLICIES MATRIX

**Project:** SCHOOL NEWS PLATFORM  
**Phase:** STEP 09.3B — RLS POLICIES & PERMISSIONS IMPLEMENTATION  
**Date:** 2026-09-16  
**Security Architecture:** Principle of Least Privilege, Explicit Allow, Default Deny  

---

## 1. MA TRẬN PHÂN QUYỀN RLS TỔNG THỂ (COMPREHENSIVE RLS MATRIX)

| Bảng (Table) | Thao tác (Operation) | Đối tượng (Actor / Role) | Cho phép (Allowed?) | Điều kiện USING | Điều kiện WITH CHECK | Mã quyền (Permission Code) | Ghi chú an toàn & Hồi quy |
|:---|:---|:---|:---:|:---|:---|:---|:---|
| `pages` | SELECT | Public / Anonymous | **CÓ** | `status = 'published' AND (published_at IS NULL OR published_at <= NOW())` | N/A | None | Chỉ xem trang đã xuất bản. Chặn draft/archived. |
| `pages` | SELECT | AUTHOR | **CÓ (Chỉ published)** | Theo policy public | N/A | None | Tuân thủ D04: Không cấp quyền xem toàn bộ trang nội bộ. |
| `pages` | SELECT | EDITOR | **CÓ (Tất cả)** | `public.has_permission('pages.view')` | N/A | `pages.view` | Ban biên tập xem được bài nháp để duyệt/sửa. |
| `pages` | SELECT | ADMIN | **CÓ (Tất cả)** | `public.has_permission('pages.view')` | N/A | `pages.view` | Quản trị viên xem toàn bộ trang của trường. |
| `pages` | SELECT | SUPER_ADMIN | **CÓ (Tất cả)** | `public.has_permission('pages.view')` | N/A | Global Bypass | Super Admin bypass qua hàm `has_permission()`. |
| `pages` | INSERT | Public / Anonymous | **KHÔNG** | N/A (Default Deny) | N/A | None | Chặn 100% người dùng chưa đăng nhập. |
| `pages` | INSERT | AUTHOR | **KHÔNG** | N/A (Default Deny) | N/A | `pages.create` | Chặn AUTHOR: chỉ biên tập viên tin tức, không quản trị trang tĩnh. |
| `pages` | INSERT | EDITOR | **CÓ** | N/A | `public.has_permission('pages.create') AND author_id = auth.uid()` | `pages.create` | Chống IDOR/Spoofing: bắt buộc `author_id` là chính mình. |
| `pages` | INSERT | ADMIN | **CÓ** | N/A | `public.has_permission('pages.create') AND author_id = auth.uid()` | `pages.create` | Chống IDOR/Spoofing: bắt buộc `author_id` là chính mình. |
| `pages` | INSERT | SUPER_ADMIN | **CÓ** | N/A | Global Bypass | Global Bypass | Toàn quyền tạo trang. |
| `pages` | UPDATE | Public / Anonymous | **KHÔNG** | N/A (Default Deny) | N/A | None | Chặn 100% khách vãng lai. |
| `pages` | UPDATE | AUTHOR | **KHÔNG** | N/A (Default Deny) | N/A | `pages.edit` | AUTHOR không có quyền sửa trang trường. |
| `pages` | UPDATE | EDITOR | **CÓ** | `public.has_permission('pages.edit')` | `public.has_permission('pages.edit') AND (author_id = (SELECT p.author_id FROM public.pages p WHERE p.id = pages.id) OR public.is_super_admin())` | `pages.edit` | Khóa bất biến `author_id`: không thể chuyển quyền tác giả. |
| `pages` | UPDATE | ADMIN | **CÓ** | `public.has_permission('pages.edit')` | `public.has_permission('pages.edit') AND (author_id = (SELECT p.author_id FROM public.pages p WHERE p.id = pages.id) OR public.is_super_admin())` | `pages.edit` | Khóa bất biến `author_id`: không thể chuyển quyền tác giả. |
| `pages` | UPDATE | SUPER_ADMIN | **CÓ** | `public.has_permission('pages.edit')` | Global Bypass | Global Bypass | Super Admin được phép điều chỉnh khi cần bảo trì. |
| `pages` | DELETE | Public / Anonymous | **KHÔNG** | N/A (Default Deny) | N/A | None | Chặn 100%. |
| `pages` | DELETE | AUTHOR | **KHÔNG** | N/A (Default Deny) | N/A | None | Chặn 100%. |
| `pages` | DELETE | EDITOR | **KHÔNG** | N/A (Default Deny) | N/A | `pages.delete` | EDITOR không được xóa trang tĩnh. |
| `pages` | DELETE | ADMIN | **CÓ** | `public.has_permission('pages.delete')` | N/A | `pages.delete` | Chỉ ADMIN và SUPER_ADMIN mới được xóa trang. |
| `pages` | DELETE | SUPER_ADMIN | **CÓ** | `public.has_permission('pages.delete')` | N/A | Global Bypass | Toàn quyền xóa trang. |
| `menus` | SELECT | Public / Anonymous | **CÓ (Chỉ active)** | `is_active = TRUE` | N/A | None | Chỉ hiển thị menu công khai trên giao diện trường. |
| `menus` | SELECT | Staff có quyền | **CÓ (Tất cả)** | `public.has_permission('settings.view') OR public.has_permission('settings.edit')` | N/A | `settings.view` / `settings.edit` | Xem cả menu ẩn để quản trị và cấu hình. |
| `menus` | INSERT | Public / Anonymous | **KHÔNG** | N/A (Default Deny) | N/A | None | Chặn 100%. |
| `menus` | INSERT | Staff có quyền | **CÓ** | N/A | `public.has_permission('settings.edit')` | `settings.edit` | Tái sử dụng `settings.edit` đồng bộ với `adminNavigation.ts`. |
| `menus` | UPDATE | Staff có quyền | **CÓ** | `public.has_permission('settings.edit')` | `public.has_permission('settings.edit')` | `settings.edit` | Tái sử dụng `settings.edit`. |
| `menus` | DELETE | Staff có quyền | **CÓ** | `public.has_permission('settings.edit')` | N/A | `settings.edit` | Tái sử dụng `settings.edit`. CASCADE sẽ xóa items con. |
| `menu_items` | SELECT | Public / Anonymous | **CÓ (Chỉ active)** | `is_active = TRUE AND EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_items.menu_id AND m.is_active = TRUE)` | N/A | None | Chỉ hiển thị mục active thuộc menu active. |
| `menu_items` | SELECT | Staff có quyền | **CÓ (Tất cả)** | `public.has_permission('settings.view') OR public.has_permission('settings.edit')` | N/A | `settings.view` / `settings.edit` | Xem toàn bộ cây mục menu trên admin. |
| `menu_items` | INSERT | Staff có quyền | **CÓ** | N/A | `public.has_permission('settings.edit') AND EXISTS (menu_id) AND (parent_id IS NULL OR EXISTS (parent_id cùng menu_id))` | `settings.edit` | Kiểm tra quan hệ toàn vẹn, chống liên kết mồ côi/chéo menu. |
| `menu_items` | UPDATE | Staff có quyền | **CÓ** | `public.has_permission('settings.edit')` | `public.has_permission('settings.edit') AND EXISTS (menu_id) AND (parent_id IS NULL OR EXISTS (parent_id cùng menu_id))` | `settings.edit` | Kiểm tra quan hệ toàn vẹn khi cập nhật phân cấp menu. |
| `menu_items` | DELETE | Staff có quyền | **CÓ** | `public.has_permission('settings.edit')` | N/A | `settings.edit` | Cho phép gỡ bỏ mục menu. |
| `seo_settings` | SELECT | Public / Anonymous | **CÓ** | `TRUE` | N/A | None | Mở công khai cho search engines đọc thẻ meta, canonical, sitemap. |
| `seo_settings` | UPDATE | Staff có quyền | **CÓ** | `public.has_permission('settings.edit')` | `public.has_permission('settings.edit')` | `settings.edit` | Chỉ quản trị viên cài đặt mới được sửa SEO toàn trường. |
| `seo_settings` | INSERT | Staff có quyền | **CÓ** | N/A | `public.has_permission('settings.edit') AND id = 'default'` | `settings.edit` | Chỉ cho phép khởi tạo bản ghi duy nhất `id = 'default'`. |
| `seo_settings` | DELETE | Mọi đối tượng | **KHÔNG** | N/A (Default Deny) | N/A | None | Bị chặn hoàn toàn: Không được phép xóa cấu hình SEO trường. |

---

## 2. PHÂN TÍCH RỦI RO & BẢO VỆ TOÀN VẸN (INTEGRITY & REGRESSION AUDIT)

1. **Rủi ro rò rỉ trang nháp qua Menu Items (CFC-08):**
   - Bản ghi `menu_items` chỉ lưu tiêu đề hiển thị và URL định tuyến.
   - Nội dung chi tiết trang tĩnh (`content`, `excerpt`, `meta_description`) được bảo vệ hoàn toàn độc lập bởi RLS của bảng `pages`.
   - Nếu một liên kết menu trỏ tới một trang đang ở trạng thái `draft`, người dùng công khai truy cập vào URL đó sẽ nhận kết quả rỗng (404 Not Found) từ `public.pages`.
2. **Rủi ro giả mạo tác giả trang tĩnh (CFC-07):**
   - Áp dụng kiểm tra `author_id = auth.uid()` trong mệnh đề `WITH CHECK` của chính sách INSERT.
   - Áp dụng kiểm tra đối chiếu bản ghi hiện hữu trong mệnh đề `WITH CHECK` của chính sách UPDATE nhằm ngăn chặn việc sửa đổi trường `author_id`.
3. **Bảo toàn các bảng đã triển khai từ trước:**
   - Các bảng `news`, `documents`, `announcements`, `media` hoàn toàn không bị thay đổi chính sách hay cấu trúc.
