# TỔNG HỢP CÁC QUYẾT ĐỊNH KIẾN TRÚC MỞ (OPEN DECISIONS) — STEP 09
**Dự án:** School News Platform v1.2  
**Mã kiểm định:** STEP 09.2 — ARCHITECTURAL DECISION RECORDS (ADR INPUT)  
**Ngày thực hiện:** 2026-09-16  
**Mục tiêu:** Xác định và xin phê duyệt các quyết định kiến trúc then chốt trước khi bước vào giai đoạn Implementation Contract của Step 09.  

---

## 1. QUYẾT ĐỊNH 1: CẤU TRÚC ĐƯỜNG DẪN TRANG TĨNH (PUBLIC PAGE URL STRUCTURE)

### Bối cảnh:
Các trang tĩnh giới thiệu trường học cần có cấu trúc URL thân thiện, dễ nhớ và chuẩn SEO.

| Phương án | Mô tả | Ưu điểm | Nhược điểm | Đề xuất của Auditor |
|:---|:---|:---|:---|:---:|
| **Phương án 1A** | **`/page/:slug`**<br>(VD: `/page/gioi-thieu`) | - Tuyệt đối không xung đột với bất kỳ route hiện tại hoặc tương lai.<br>- Dễ dàng áp dụng `ModuleGuard('pages')`.<br>- Cấu trúc rõ ràng, tường minh. | URL dài hơn 5 ký tự. | **CHỌN (KHUYẾN NGHỊ)** |
| **Phương án 1B** | **`/:slug`**<br>(VD: `/gioi-thieu`) | - URL ngắn gọn, đẹp mắt. | - Nguy cơ xung đột URL hệ thống.<br>- Phải duy trì bảng danh sách `RESERVED_SLUGS` chặt chẽ ở cả CSDL và Frontend.<br>- Cần cơ chế kiểm tra 404 phức tạp hơn. | Dự phòng |
| **Phương án 1C** | **`/trang/:slug`** | - Thuần tiếng Việt. | - Không đồng bộ với các module khác vốn dùng tiếng Anh trên route (`/news`, `/documents`, `/albums`). | Không khuyến nghị |

---

## 2. QUYẾT ĐỊNH 2: MÔ HÌNH LƯU TRỮ HỆ THỐNG MENU ĐIỀU HƯỚNG

### Bối cảnh:
Menu trường học có đặc thù: tối đa 10 - 25 mục, phân cấp tối đa 2 cấp (Dropdown), thường xuyên thay đổi thứ tự hiển thị bằng thao tác kéo thả (drag-and-drop).

| Phương án | Mô tả | Ưu điểm | Nhược điểm | Đề xuất của Auditor |
|:---|:---|:---|:---|:---:|
| **Phương án 2A** | **JSONB trong `site_settings`**<br>(Key: `'navigation_menus'`) | - Không phát sinh bảng CSDL mới.<br>- Tải nguyên tử trong 1 truy vấn cùng `schoolIdentity`.<br>- Lưu trạng thái kéo thả cực kỳ đơn giản (lưu toàn bộ mảng JSONB).<br>- Đúng triết lý `BUILD ONCE → CONFIGURE PER SCHOOL`. | Khi xóa một trang tĩnh, link menu trỏ tới đó trở thành dead link (phải xử lý cảnh báo ở giao diện quản lý). | **CHỌN (KHUYẾN NGHỊ)** |
| **Phương án 2B** | **2 Bảng quan hệ**<br>(`menus` + `menu_items`) | - Chuẩn hóa quan hệ dữ liệu SQL.<br>- Có thể tạo `FOREIGN KEY` liên kết `page_id`. | - Tăng độ phức tạp kiến trúc không cần thiết.<br>- Cần nhiều truy vấn JOIN hoặc CTE đệ quy để dựng cây menu.<br>- Khó khăn hơn khi sắp xếp lại thứ tự nhiều mục cùng lúc. | Dự phòng |

---

## 3. QUYẾT ĐỊNH 3: CHIẾN LƯỢC QUẢN LÝ THẺ HEAD/META TRÊN REACT 19 SPA

### Bối cảnh:
Dự án sử dụng React 19 (`^19.0.1`). React 19 đã tích hợp cơ chế tự động hoist các thẻ `<title>`, `<meta>`, `<link>` lên `<head>`.

| Phương án | Mô tả | Ưu điểm | Nhược điểm | Đề xuất của Auditor |
|:---|:---|:---|:---|:---:|
| **Phương án 3A** | **Component Native `SEOHead.tsx`** | - Không cài thêm thư viện phụ thuộc ngoài (zero dependency).<br>- Tận dụng tính năng cốt lõi của React 19.<br>- Tránh xung đột bundle với `react-helmet`. | Cần kiểm tra kỹ cơ chế cleanup khi unmount component giữa các lần chuyển trang. | **CHỌN (KHUYẾN NGHỊ)** |
| **Phương án 3B** | **Cài đặt `react-helmet-async`** | - Quen thuộc với các dự án React cũ (React 16 - 18). | - Thêm dependency nặng vào `package.json`.<br>- Có thể cảnh báo deprecation hoặc xung đột với cơ chế hoisting mới của React 19. | Không khuyến nghị |

---

## 4. QUYẾT ĐỊNH 4: PHÂN BỔ QUYỀN HẠN QUẢN TRỊ MENU VÀ SEO (RBAC DESIGN)

### Bối cảnh:
Hiện tại `adminNavigation.ts` đang gán quyền `settings.edit` cho Quản lý Menu. `00_roles_and_permissions.sql` chưa có mã quyền `menu.*` hay `seo.*`.

| Phương án | Mô tả | Ưu điểm | Đề xuất của Auditor |
|:---|:---|:---|:---:|
| **Phương án 4A** | **Tạo quyền chuyên biệt:**<br>`menu.view`, `menu.edit`, `seo.view`, `seo.edit` | Phân quyền hạt nhân: Ban biên tập có thể được giao sắp xếp menu mà không có quyền thay đổi mật khẩu hệ thống hay cấu hình trường học. | **CHỌN (KHUYẾN NGHỊ)** |
| **Phương án 4B** | **Gộp vào `settings.edit`** | Đơn giản, không cần bổ sung quyền mới. Tuy nhiên làm mất tính tách biệt vai trò (Separation of Concerns). | Không khuyến nghị |

---

## 5. QUYẾT ĐỊNH 5: TÁI SỬ DỤNG TRÌNH SOẠN THẢO RICHTEXT CHO TRANG TĨNH

### Bối cảnh:
Module News (Step 05) đã xây dựng `src/components/admin/news/RichTextEditor.tsx` (dựa trên textarea mở rộng với toolbar hỗ trợ H2-H4, bold, italic, list, quote, link, image, preview tab, và sanitization).

| Quyết định | Hành động kiến trúc | Lợi ích |
|:---|:---|:---|
| **TÁI SỬ DỤNG HOÀN TOÀN** | Sử dụng component `RichTextEditor` cho `AdminPageEditorPage.tsx`. Có thể trích xuất ra `src/components/common/RichTextEditor.tsx` hoặc import trực tiếp. | - Đảm bảo tính nhất quán trải nghiệm cho giáo viên và ban biên tập.<br>- Tiết kiệm dung lượng bundle.<br>- Tận dụng 100% bộ lọc bảo mật `sanitizeHtml()`. |

---

## 6. QUYẾT ĐỊNH 6: XỬ LÝ 4 ROUTE TĨNH HIỆN CÓ (`/about`, `/activities`, `/admissions`, `/contact`)

### Bối cảnh:
Các route `/about`, `/activities`, `/admissions`, `/contact` đang trỏ vào `GenericPageDemo`.

| Phương án xử lý | Hành động kỹ thuật |
|:---|:---|
| **Chuyển hướng mềm (Soft Redirect)** | Trong `src/routes/index.tsx`, thay thế component `GenericPageDemo` bằng lệnh `<Navigate to="/page/gioi-thieu" replace />` tương ứng cho từng route. |
| **Đồng thời Seed dữ liệu** | Tạo sẵn 4 trang tĩnh tương ứng trong CSDL (`gioi-thieu`, `hoat-dong`, `tuyen-sinh`, `lien-he`) để liên kết không bao giờ bị đứt gãy. |
