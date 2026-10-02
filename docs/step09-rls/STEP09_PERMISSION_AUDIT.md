# STEP 09.3B — PERMISSION & RBAC AUDIT REPORT

**Project:** SCHOOL NEWS PLATFORM  
**Phase:** STEP 09.3B — RLS POLICIES & PERMISSIONS IMPLEMENTATION  
**Date:** 2026-09-16  
**Security Standard:** Strict RBAC Compliance, Zero Invented Permissions  

---

## 1. TỔNG QUAN KIỂM TOÁN PHÂN QUYỀN (PERMISSION AUDIT OVERVIEW)

Báo cáo này đối chiếu và xác thực toàn bộ các mã quyền được sử dụng trong Step 09 so với:
1. Bản hợp đồng hạt nhân `supabase/seed/00_roles_and_permissions.sql`.
2. Định tuyến và giao diện quản trị `src/navigation/adminNavigation.ts`.
3. Chỉ thị kiến trúc được phê duyệt (D04: "Reuse existing role / permission architecture. Không tự ý mở rộng quyền AUTHOR").
4. Quy tắc tối thượng: **DO NOT INVENT PERMISSIONS** (Section VII).

---

## 2. BẢNG ĐỐI CHIẾU MÃ QUYỀN (PERMISSION INVENTORY & MAPPING)

| Mã quyền (Code) | Tài nguyên (Resource) | Hành động (Action) | Đã có trong Seed 00? | Sử dụng trong Admin Navigation? | Áp dụng trong RLS Step 09? | Đánh giá phân loại |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| `pages.view` | `pages` | `view` | **CÓ** (Dòng 43) | **CÓ** (Dòng 104) | **CÓ** (SELECT trên `pages`) | **HỢP LỆ — TÁI SỬ DỤNG (REUSE)** |
| `pages.create` | `pages` | `create` | **CÓ** (Dòng 44) | — | **CÓ** (INSERT trên `pages`) | **HỢP LỆ — TÁI SỬ DỤNG (REUSE)** |
| `pages.edit` | `pages` | `edit` | **CÓ** (Dòng 45) | — | **CÓ** (UPDATE trên `pages`) | **HỢP LỆ — TÁI SỬ DỤNG (REUSE)** |
| `pages.delete` | `pages` | `delete` | **CÓ** (Dòng 46) | — | **CÓ** (DELETE trên `pages`) | **HỢP LỆ — TÁI SỬ DỤNG (REUSE)** |
| `settings.view` | `settings` | `view` | **CÓ** (Dòng 57) | **CÓ** (Dòng 118) | **CÓ** (SELECT trên `menus`, `menu_items`) | **HỢP LỆ — TÁI SỬ DỤNG (REUSE)** |
| `settings.edit` | `settings` | `edit` | **CÓ** (Dòng 58) | **CÓ** (Dòng 126: Menu) | **CÓ** (CUD trên `menus`, `menu_items`, `seo_settings`) | **HỢP LỆ — TÁI SỬ DỤNG (REUSE)** |

---

## 3. XỬ LÝ CÁC QUYỀN KHÔNG TỒN TẠI (NO INVENTED PERMISSIONS COMPLIANCE)

Tuân thủ triệt để Section VII của tài liệu chỉ đạo:
- **`pages.manage`:** **KHÔNG TẠO MỚI**. Thay vào đó, sử dụng tổ hợp các quyền hạt nhân `pages.view`, `pages.create`, `pages.edit`, `pages.delete`.
- **`menus.manage` / `menu.manage`:** **KHÔNG TẠO MỚI**. Menu là cấu hình điều hướng thuộc cài đặt trường, đã được gắn với quyền `settings.edit` trong `src/navigation/adminNavigation.ts` dòng 126. Tái sử dụng `settings.edit`.
- **`seo.manage` / `seo.edit`:** **KHÔNG TẠO MỚI**. Cấu hình SEO toàn trường thuộc danh mục cài đặt hệ thống của trường học (`site_settings`), tái sử dụng `settings.edit`.
- **`AUTHOR` role protection:** Tuyệt đối không gán bất kỳ quyền nào thuộc `pages.*` hay `settings.*` cho vai trò `AUTHOR` (bảo toàn nguyên tắc: AUTHOR chỉ là người viết tin bài, không có quyền quản trị website trường).

---

## 4. MA TRẬN PHÂN QUYỀN CHO CÁC VAI TRÒ (ROLE-TO-PERMISSION ASSIGNMENT)

| Vai trò (Role) | `pages.view` | `pages.create` | `pages.edit` | `pages.delete` | `settings.view` | `settings.edit` |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `PUBLIC_VISITOR` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `AUTHOR` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `EDITOR` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SUPER_ADMIN` | ✅ (Bypass) | ✅ (Bypass) | ✅ (Bypass) | ✅ (Bypass) | ✅ (Bypass) | ✅ (Bypass) |

---

## 5. KẾT LUẬN KIỂM TOÁN

- Không có quyền bị phát minh trái phép (**0 Invented Permissions**).
- 100% quyền được sử dụng đều có trong hợp đồng cơ sở từ Step 00 hoặc tái sử dụng từ Step 03.
- Ranh giới bảo mật giữa các vai trò được phân định nghiêm ngặt.
- Sẵn sàng chuyển giao sang các giai đoạn tiếp theo của Step 09.
