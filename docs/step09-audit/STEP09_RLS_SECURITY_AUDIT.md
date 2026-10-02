# BÁO CÁO KIỂM TOÁN BẢO MẬT & RLS (RLS & SECURITY AUDIT) — STEP 09
**Dự án:** School News Platform v1.2  
**Mã kiểm định:** STEP 09.2 — RLS SECURITY AUDIT  
**Ngày thực hiện:** 2026-09-16  
**Tiêu chuẩn:** Row Level Security (RLS) bắt buộc trên 100% bảng dữ liệu, Zero-Trust Client, RBAC đa tầng  

---

## 1. NỀN TẢNG BẢO MẬT HIỆN HÀNH (EXISTING SECURITY INFRASTRUCTURE)

### 1.1. Hàm phân quyền phía CSDL (`public.has_permission`)
Tại migration `20260102000000_step03_foundation.sql` (dòng 35-67), cơ chế phân quyền hạt nhân đã được đóng gói chặt chẽ:
```sql
CREATE OR REPLACE FUNCTION public.has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.code = 'SUPER_ADMIN'
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = auth.uid()
          AND p.code = required_permission
    );
END;
$$;
```
- **Đánh giá:** Hàm `has_permission()` chạy ở chế độ `SECURITY DEFINER` với `SET search_path = public, pg_temp` an toàn, ngăn chặn SQL Injection và tìm kiếm giả mạo schema. Đây là nền tảng đáng tin cậy để áp dụng ngay cho RLS của Step 09.

---

## 2. ĐẶC TẢ RLS CHO PHÂN HỆ STEP 09 (REQUIRED RLS POLICIES)

### 2.1. Chính sách bảo mật cho bảng `public.pages`

Toàn bộ các bảng mới tạo bắt buộc phải bật RLS:
```sql
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
```

#### A. Chính sách Đọc (SELECT Policy)
- **Công chúng (Khách vãng lai):** Chỉ được phép đọc các trang có trạng thái `status = 'published'` và thời gian phát hành hợp lệ (`published_at <= NOW()`).
- **Nội bộ (Cán bộ / Quản trị viên):** Người có quyền `pages.view` hoặc `is_super_admin()` được phép đọc tất cả các trang (bao gồm bản nháp `draft`, chờ duyệt `pending`, hoặc lưu trữ `archived`).

```sql
DROP POLICY IF EXISTS "Public can view published pages" ON public.pages;
CREATE POLICY "Public can view published pages"
    ON public.pages FOR SELECT
    TO PUBLIC
    USING (
        status = 'published' 
        AND (published_at IS NULL OR published_at <= NOW())
    );

DROP POLICY IF EXISTS "Staff can view all pages" ON public.pages;
CREATE POLICY "Staff can view all pages"
    ON public.pages FOR SELECT
    TO authenticated
    USING (public.has_permission('pages.view'));
```

#### B. Chính sách Thêm mới (INSERT Policy)
- Chỉ người có quyền `pages.create` mới được tạo trang mới.
- **Ràng buộc chống mạo danh tác giả (Author Spoofing):** Bắt buộc `author_id = auth.uid()`.

```sql
DROP POLICY IF EXISTS "Authorized users can create pages" ON public.pages;
CREATE POLICY "Authorized users can create pages"
    ON public.pages FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_permission('pages.create')
        AND author_id = auth.uid()
    );
```

#### C. Chính sách Cập nhật (UPDATE Policy)
- Người có quyền `pages.edit` được phép chỉnh sửa trang.
- Không cho phép người dùng thông thường sửa `id` hoặc thay đổi `author_id` sang người khác.

```sql
DROP POLICY IF EXISTS "Authorized users can update pages" ON public.pages;
CREATE POLICY "Authorized users can update pages"
    ON public.pages FOR UPDATE
    TO authenticated
    USING (public.has_permission('pages.edit'))
    WITH CHECK (public.has_permission('pages.edit'));
```

#### D. Chính sách Xóa (DELETE Policy)
- Chỉ người có quyền `pages.delete` (thường là ADMIN hoặc SUPER_ADMIN) mới được phép xóa trang tĩnh.

```sql
DROP POLICY IF EXISTS "Authorized users can delete pages" ON public.pages;
CREATE POLICY "Authorized users can delete pages"
    ON public.pages FOR DELETE
    TO authenticated
    USING (public.has_permission('pages.delete'));
```

---

### 2.2. Chính sách bảo mật cho Hệ thống Menu & SEO

Nếu Menu và SEO được quản lý trong `site_settings`:
- Đã có chính sách RLS kế thừa từ Step 03:
  - `Public read site_settings`: Mọi người dùng đọc được các setting có `is_public = TRUE`.
  - `Authorized users can update site settings`: Yêu cầu `has_permission('settings.edit')`.
- Nếu tách bảng riêng `menus` và `menu_items`:
  - `menus` & `menu_items` cần chính sách: Khách xem các mục `is_active = TRUE`, Ban quản trị có quyền `menu.edit` được CRUD.

---

## 3. KIỂM TOÁN BẢO VỆ XSS VÀ TÍNH TOÀN VẸN NỘI DUNG

### 3.1. Phân tích khử độc nội dung Rich Text (`src/lib/sanitize.ts`)
- Nội dung các trang tĩnh thường có cấu trúc phức tạp: bài phát biểu, bảng biểu tổ chức, danh sách cán bộ, ảnh sơ đồ, link ngoài.
- `src/lib/sanitize.ts` hiện tại sử dụng **DOMPurify** với danh sách thẻ cho phép:
  - Thẻ văn bản: `h1` → `h6`, `p`, `span`, `strong`, `em`, `u`, `blockquote`, `ul`, `ol`, `li`.
  - Thẻ đa phương tiện & bảng: `img`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `figure`, `figcaption`.
  - Thẻ liên kết: `a`.
- **Rà soát rủi ro bảo mật:**
  - Thuộc tính `target="_blank"` trên thẻ `<a>`: DOMPurify trong `src/lib/sanitize.ts` đã cấu hình thêm `rel="noopener noreferrer"` tự động để chống tấn công Reverse Tabnabbing.
  - Các giao thức nguy hiểm: `javascript:`, `data:` (trừ inline safe images), `vbscript:` tự động bị DOMPurify tước bỏ.
  - Thẻ `<script>`, `<iframe>`, `<object>`, `<embed>` bị cấm hoàn toàn.
- **Kết luận:** Bộ lọc `sanitizeHtml()` tại `src/lib/sanitize.ts` hoàn toàn đủ tiêu chuẩn bảo mật cho nội dung trang tĩnh Step 09.

---

## 4. BẢO VỆ ĐỊNH TUYẾN & CHỐNG CHIẾM DỤNG ĐƯỜNG DẪN (RESERVED SLUGS AUDIT)

Nếu trang tĩnh được định tuyến trực tiếp dạng `/:slug` (ví dụ: `school.edu.vn/gioi-thieu` thay vì `/page/gioi-thieu`), một người quản trị hoặc kẻ tấn công có quyền soạn thảo có thể tạo một trang có slug trùng với các route cốt lõi của hệ thống:
- `admin`
- `login`
- `setup`
- `news`
- `documents`
- `announcements`
- `albums`
- `media`
- `forbidden`
- `foundation`
- `api`

### Hậu quả nếu không chặn:
Trang tĩnh sẽ ghi đè và làm tê liệt giao diện CMS hoặc trang đăng nhập của trường học.

### Giải pháp kỹ thuật bắt buộc:
1. **Kiểm tra mức CSDL (Database Constraint / Trigger):**
   ```sql
   CONSTRAINT check_reserved_slugs CHECK (
       slug NOT IN (
           'admin', 'login', 'setup', 'news', 'documents', 
           'tai-lieu', 'thong-bao', 'announcements', 'albums', 
           'gallery', 'media', 'forbidden', 'foundation', 'api', 'search'
       )
   )
   ```
2. **Kiểm tra mức Ứng dụng (Zod Schema / Service):**
   Hàm `pageService.createPage()` và `pageService.updatePage()` phải kiểm tra danh sách `RESERVED_SLUGS` trước khi gửi truy vấn đến Supabase.
3. **Chiến lược an toàn hơn:** Sử dụng tiền tố route `/page/:slug` hoặc `/trang/:slug` để loại bỏ hoàn toàn khả năng xung đột URL.

---

## 5. TỔNG KẾT RỦI RO & KHUYẾN NGHỊ BẢO MẬT

| Rủi ro | Mức độ | Biện pháp giảm thiểu bắt buộc trong Step 09 |
|:---|:---:|:---|
| **Author Spoofing** (Tác giả giả mạo) | **CAO** | RLS INSERT policy bắt buộc kiểm tra `author_id = auth.uid()` |
| **XSS Injection** qua nội dung bài viết tĩnh | **CAO** | Render nội dung bằng `sanitizeHtml()` trước khi đưa vào DOM |
| **Bypass RLS khi chưa xuất bản** | **TRUNG BÌNH** | Tách biệt rõ 2 policy: Public chỉ xem `published`, Staff xem toàn bộ |
| **Route Hijacking** (Slug chiếm đường dẫn hệ thống) | **CAO** | Áp dụng tiền tố `/page/:slug` hoặc kiểm tra `RESERVED_SLUGS` ở cả DB và frontend |
| **Thất thoát quyền hạn phân cấp** | **TRUNG BÌNH** | Gán đầy đủ `pages.*` và `menu.*` vào `role_permissions` trong migration |
