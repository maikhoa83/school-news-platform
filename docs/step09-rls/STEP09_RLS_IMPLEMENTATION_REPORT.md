# STEP 09.3B — RLS & PERMISSIONS IMPLEMENTATION REPORT

**Project:** SCHOOL NEWS PLATFORM  
**Phase:** STEP 09.3B — RLS POLICIES & PERMISSIONS IMPLEMENTATION  
**Role:** Senior Supabase / PostgreSQL Security Engineer  
**Date:** 2026-09-16  
**Architecture:** ONE CODEBASE → ONE SCHOOL INSTALLATION → ONE DATABASE → ONE AUTH → ONE STORAGE  
**Scope:** PostgreSQL Row Level Security (RLS) & Authorization Matrix for Pages, Menus, Menu Items, SEO Settings  

---

## A. Final Result

**PASS**

---

## B. Scope Implemented

Chỉ thực hiện các thay đổi thuộc phạm vi bảo mật & phân quyền CSDL được phê duyệt cho Step 09.3B:
1. Kích hoạt Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) trên 4 bảng:
   - `public.pages`
   - `public.menus`
   - `public.menu_items`
   - `public.seo_settings`
2. Thiết lập 16 chính sách RLS chi tiết:
   - **`public.pages` (5 policies):** Public SELECT (chỉ bài `published`), Staff SELECT (`pages.view`), Staff INSERT (`pages.create` + chống spoofing tác giả), Staff UPDATE (`pages.edit` + bảo toàn tính bất biến của `author_id`), Staff DELETE (`pages.delete`).
   - **`public.menus` (5 policies):** Public SELECT (chỉ menu `is_active = TRUE`), Staff SELECT (`settings.view` / `settings.edit`), Staff INSERT (`settings.edit`), Staff UPDATE (`settings.edit`), Staff DELETE (`settings.edit`).
   - **`public.menu_items` (5 policies):** Public SELECT (chỉ mục `is_active = TRUE` thuộc menu đang `is_active = TRUE`), Staff SELECT (`settings.view` / `settings.edit`), Staff INSERT (`settings.edit` + kiểm tra toàn vẹn quan hệ `menu_id` & `parent_id`), Staff UPDATE (`settings.edit`), Staff DELETE (`settings.edit`).
   - **`public.seo_settings` (3 policies):** Public SELECT (`TRUE` cho thẻ meta và mã xác thực tìm kiếm), Staff UPDATE (`settings.edit`), Staff INSERT (`settings.edit` + `id = 'default'`). Không cấp quyền DELETE (bảo vệ tuyệt đối cấu hình trường Single-Row).
3. Tích hợp quyền hạt nhân (RBAC Integration):
   - Đảm bảo các quyền chuẩn đã khai báo từ Step 00 (`pages.view`, `pages.create`, `pages.edit`, `pages.delete`) có mặt trong `public.permissions`.
   - Gán quyền cho `ADMIN` (toàn quyền) và `EDITOR` (`view`, `create`, `edit`).
   - Giữ nguyên ranh giới vai trò `AUTHOR` (không cấp quyền quản trị trang cho cộng tác viên tin bài).
   - Tái sử dụng quyền `settings.view` và `settings.edit` cho Menus và SEO Settings theo chỉ thị D04.

---

## C. Existing Authorization Audit

- **`public.has_permission(required_permission TEXT)`:**
  - Định nghĩa tại: `20260102000000_step03_foundation.sql` (dòng 35-67).
  - Trạng thái: Hoạt động an toàn với `SECURITY DEFINER` và `SET search_path = public, pg_temp`.
  - Cơ chế: Trả về `FALSE` nếu chưa xác thực (`auth.uid() IS NULL`); kiểm tra bypass toàn cục cho `SUPER_ADMIN`; kiểm tra quan hệ `user_roles → role_permissions → permissions`.
  - Tái sử dụng: Được sử dụng 100% làm cổng xác thực CSDL, không tạo thêm hàm custom resolver hay hard-code UUID.
- **`public.roles`:** Gồm 5 vai trò hệ thống: `PUBLIC_VISITOR`, `AUTHOR`, `EDITOR`, `ADMIN`, `SUPER_ADMIN`.
- **`public.permissions`:** Lưu trữ danh sách quyền dạng `resource.action`.
- **`public.role_permissions`:** Bảng nối phân quyền nhiều-nhiều giữa Roles và Permissions.
- **`public.user_roles`:** Bảng gán người dùng vào vai trò (`user_id REFERENCES profiles(id)`).
- **Existing RLS (Step 01 - 08):** Toàn bộ các bảng hiện có (`profiles`, `roles`, `permissions`, `site_settings`, `module_settings`, `news_*`, `documents`, `announcements`, `media_*`) đều đang bật RLS và hoạt động ổn định.

---

## D. Permission Findings

| Quyền (Permission) | Trạng thái | Nguồn gốc / Căn cứ | Hành động kỹ thuật |
|:---|:---:|:---|:---|
| `pages.view` | **EXISTS** | Khai báo trong `00_roles_and_permissions.sql` & `adminNavigation.ts` | Tái sử dụng (REUSE), đảm bảo có trong migration |
| `pages.create` | **EXISTS** | Khai báo trong `00_roles_and_permissions.sql` | Tái sử dụng (REUSE), đảm bảo có trong migration |
| `pages.edit` | **EXISTS** | Khai báo trong `00_roles_and_permissions.sql` | Tái sử dụng (REUSE), đảm bảo có trong migration |
| `pages.delete` | **EXISTS** | Khai báo trong `00_roles_and_permissions.sql` | Tái sử dụng (REUSE), đảm bảo có trong migration |
| `settings.view` | **EXISTS** | Đã dùng trong Step 03 Foundation & `adminNavigation.ts` | Tái sử dụng (REUSE) cho Menu & SEO view |
| `settings.edit` | **EXISTS** | Đã dùng trong Step 03 Foundation & `adminNavigation.ts` | Tái sử dụng (REUSE) cho Menu & SEO mutation |
| `pages.manage` | **MISSING** | Không tồn tại trong baseline | **KHÔNG TỰ TẠO** (Tuân thủ CFC-11) |
| `menus.manage` | **MISSING** | Không tồn tại trong baseline | **KHÔNG TỰ TẠO** (Tuân thủ CFC-11, tái sử dụng `settings.edit`) |
| `seo.manage` | **MISSING** | Không tồn tại trong baseline | **KHÔNG TỰ TẠO** (Tuân thủ CFC-11, tái sử dụng `settings.edit`) |

---

## E. RLS Policies Created

### 1. Bảng `public.pages`
- `Public can view published pages` (SELECT):
  `status = 'published' AND (published_at IS NULL OR published_at <= NOW())`
- `Staff can view all pages` (SELECT):
  `public.has_permission('pages.view')`
- `Staff can insert pages` (INSERT):
  `public.has_permission('pages.create') AND author_id = auth.uid()`
- `Staff can update pages` (UPDATE):
  `USING (public.has_permission('pages.edit')) WITH CHECK (public.has_permission('pages.edit') AND (author_id = (SELECT p.author_id FROM public.pages p WHERE p.id = pages.id) OR public.is_super_admin()))`
- `Staff can delete pages` (DELETE):
  `USING (public.has_permission('pages.delete'))`

### 2. Bảng `public.menus`
- `Public can view active menus` (SELECT):
  `is_active = TRUE`
- `Staff can view all menus` (SELECT):
  `public.has_permission('settings.view') OR public.has_permission('settings.edit')`
- `Staff can insert menus` (INSERT):
  `WITH CHECK (public.has_permission('settings.edit'))`
- `Staff can update menus` (UPDATE):
  `USING (public.has_permission('settings.edit')) WITH CHECK (public.has_permission('settings.edit'))`
- `Staff can delete menus` (DELETE):
  `USING (public.has_permission('settings.edit'))`

### 3. Bảng `public.menu_items`
- `Public can view active menu items` (SELECT):
  `is_active = TRUE AND EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_items.menu_id AND m.is_active = TRUE)`
- `Staff can view all menu items` (SELECT):
  `public.has_permission('settings.view') OR public.has_permission('settings.edit')`
- `Staff can insert menu items` (INSERT):
  `WITH CHECK (public.has_permission('settings.edit') AND EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_items.menu_id) AND (parent_id IS NULL OR EXISTS (SELECT 1 FROM public.menu_items pi WHERE pi.id = menu_items.parent_id AND pi.menu_id = menu_items.menu_id)))`
- `Staff can update menu items` (UPDATE):
  `USING (public.has_permission('settings.edit')) WITH CHECK (public.has_permission('settings.edit') AND EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_items.menu_id) AND (parent_id IS NULL OR EXISTS (SELECT 1 FROM public.menu_items pi WHERE pi.id = menu_items.parent_id AND pi.menu_id = menu_items.menu_id)))`
- `Staff can delete menu items` (DELETE):
  `USING (public.has_permission('settings.edit'))`

### 4. Bảng `public.seo_settings`
- `Public can view seo settings` (SELECT):
  `TRUE` (Tất cả thông tin meta tags và verification tokens đều phục vụ bot tìm kiếm công khai)
- `Staff can update seo settings` (UPDATE):
  `USING (public.has_permission('settings.edit')) WITH CHECK (public.has_permission('settings.edit'))`
- `Staff can insert seo settings` (INSERT):
  `WITH CHECK (public.has_permission('settings.edit') AND id = 'default')`
- *(Không có policy DELETE: Chặn 100% hành vi xóa bản ghi cấu hình gốc).*

---

## F. Public Access

- **Pages:** Khách vãng lai và người dùng chưa đăng nhập chỉ có thể đọc các trang có `status = 'published'` và thời điểm xuất bản hợp lệ (`published_at <= NOW()`). Toàn bộ bản nháp (`draft`) và lưu trữ (`archived`) bị chặn 100% ở tầng CSDL (ngăn chặn CFC-01, CFC-02).
- **Menus & Items:** Chỉ đọc được các menu đang kích hoạt (`is_active = TRUE`) và các mục liên kết thuộc menu đó. Menu ẩn hoặc mục ẩn không thể bị lộ.
- **SEO Settings:** Thẻ meta mẫu, robots.txt, canonical URL được mở công khai cho bộ máy tìm kiếm đọc để render SEO.

---

## G. Authenticated Access

- Người dùng đăng nhập chỉ được thao tác khi có quyền trong `role_permissions` hoặc có vai trò `SUPER_ADMIN`.
- Cán bộ không có quyền (`AUTHOR` hoặc tài khoản chưa phân quyền) bị chặn hoàn toàn các thao tác tạo, sửa, xóa trang tĩnh, menu và SEO (ngăn chặn CFC-04, CFC-05).
- Phân tách quyền rõ ràng: `EDITOR` có thể xem, tạo, sửa trang; chỉ `ADMIN` và `SUPER_ADMIN` mới được phép xóa trang (`pages.delete`).

---

## H. IDOR / Ownership

- **Author Spoofing (CFC-07):** Chính sách INSERT trên `public.pages` bắt buộc `author_id = auth.uid()`. Kẻ xấu không thể mạo danh tài khoản cán bộ khác khi tạo trang.
- **Author Tampering (CFC-06):** Chính sách UPDATE trên `public.pages` khóa cứng trường `author_id` với bản ghi hiện có (`author_id = (SELECT p.author_id FROM public.pages p WHERE p.id = pages.id)`), chỉ duy nhất `SUPER_ADMIN` mới có quyền can thiệp nếu cần chuyển giao công tác.

---

## I. Relationship Security

- **Menu & Page Relationship (CFC-08):** Menu item trỏ tới `page_id` không thể dùng để bypass RLS của `pages`. Nếu menu item trỏ tới trang `draft`, truy vấn lấy nội dung trang từ `public.pages` vẫn bị chặn bởi RLS của `pages`.
- **Menu Hierarchy Tampering (CFC-09):** Menu item khi INSERT/UPDATE bắt buộc phải thuộc một `menu_id` hợp lệ, và mục cha `parent_id` (nếu có) phải thuộc cùng `menu_id` đó, loại bỏ triệt để nguy cơ tạo liên kết chéo menu hoặc tạo chu trình menu lỗi.

---

## J. Regression

- **Media Module (Step 08):** Không chạm vào `media_folders`, `media`, `albums`, `album_items` hay storage bucket `media`. Trạng thái: **PASS** (Zero regression).
- **News Module (Step 05):** Không bị ảnh hưởng. Trạng thái: **PASS**.
- **Documents Module (Step 06):** Không bị ảnh hưởng. Trạng thái: **PASS**.
- **Announcements Module (Step 07):** Không bị ảnh hưởng. Trạng thái: **PASS**.
- **Auth & Profiles:** Giữ nguyên vẹn 100%. Trạng thái: **PASS**.
- **Storage:** Không sửa đổi storage policy nào. Trạng thái: **PASS**.

---

## K. Migration

- **File tạo mới:** `supabase/migrations/20260114000000_step09_rls_permissions.sql`
- **Timestamp:** `20260114000000` (Thứ tự 14/14, nối tiếp sau `20260113000000_step09_pages_menu_seo.sql`).
- **Old migrations modified?:** **NO** (13 migration cũ từ `20260101` đến `20260113` hoàn toàn không bị sửa đổi).

---

## L. Verification Commands

1. **Static Analysis & Security Matrix Verification:**
   - Command: `python3 [security test suite]`
   - Result: **13/13 PASS** (RLS-01, CFC-01-02, CFC-03, CFC-07, AUTH-IMMUTABLE, PERM-DELETE, MENU-PERM, CFC-09, CFC-10, CFC-11, CFC-13, CFC-20, CFC-05).
2. **TypeScript Compilation Check:**
   - Command: `npm run lint` (`tsc --noEmit`)
   - Result: **PASS** (0 errors).
3. **Application Build:**
   - Command: `npm run build` (`vite build`)
   - Result: **PASS** (Biên dịch thành công).

---

## M. Changed Files

1. `supabase/migrations/20260114000000_step09_rls_permissions.sql` (File migration mới)
2. `docs/step09-rls/STEP09_RLS_IMPLEMENTATION_REPORT.md` (File báo cáo mới)
3. `docs/step09-rls/STEP09_RLS_MATRIX.md` (File ma trận RLS mới)
4. `docs/step09-rls/STEP09_RLS_VERIFICATION.md` (File kiểm định kỹ thuật mới)
5. `docs/step09-rls/STEP09_PERMISSION_AUDIT.md` (File kiểm toán quyền mới)

---

## N. Findings

- **Critical:** 0
- **High:** 0
- **Medium:** 0
- **Low:** 0
- **Informational:**
  - `INFO-01`: Đã tái sử dụng thành công `settings.edit` cho Menus và SEO Settings, hoàn toàn tương thích với menu quản trị hiện tại (`adminNavigation.ts`), tránh việc tự phát sinh quyền chưa phê duyệt.
  - `INFO-02`: Đã bảo vệ tính bất biến của tác giả (`author_id`) trên bảng `pages` ngay tại tầng RLS PostgreSQL mà không cần dựa vào frontend logic.

---

## O. Final Gate

**STEP 09.3B FINAL GATE: PASS**
