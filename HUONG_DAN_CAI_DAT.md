# HƯỚNG DẪN CÀI ĐẶT VÀ THIẾT LẬP (SETUP WIZARD)
## CỔNG THÔNG TIN ĐIỆN TỬ TRƯỜNG HỌC (SCHOOL NEWS PLATFORM)
> **Phiên bản:** v1.2.0 Production  
> **Đơn vị thiết kế:** MVK  
> **Áp dụng:** Trường THCS & THPT Vĩnh Phong và các trường học phổ thông

---

## MỤC LỤC
1. [Giới Thiệu Bản Cài Đặt Độc Lập](#1-giới-thiệu-bản-cài-đặt-độc-lập)
2. [Phương Án 1: Đẩy Lên Repo GitHub Mới](#2-phương-án-1-đẩy-lên-repo-github-mới)
3. [Phương Án 2: Cài Đặt Lên Web Hosting (cPanel / DirectAdmin / Apache)](#3-phương-án-2-cài-đặt-lên-web-hosting-cpanel--directadmin)
4. [Phương Án 3: Triển Khai Miễn Phí 100% (Vercel / Netlify / Cloudflare Pages)](#4-phương-án-3-triển-khai-miễn-phí-100-vercel--netlify)
5. [Phương Án 4: Triển Khai Trên Máy Chủ Riêng (VPS Linux / Docker)](#5-phương-án-4-triển-khai-trên-máy-chủ-riêng-vps-linux--docker)
6. [Quy Trình Chạy Setup Wizard Từng Bước Trên Trình Duyệt](#6-quy-trình-chạy-setup-wizard-từng-bước)
7. [Tài Khoản Quản Trị & Cơ Chế Khóa An Toàn](#7-tài-khoản-quản-trị--cơ-chế-khóa-an-toàn)
8. [Sao Lưu, Khôi Phục Và Cập Nhật Dữ Liệu](#8-sao-lưu-khôi-phục-và-cập-nhật-dữ-liệu)

---

## 1. GIỚI THIỆU BẢN CÀI ĐẶT ĐỘC LẬP

Bản cài đặt này được thiết kế và đóng gói theo kiến trúc độc lập, giúp nhà trường có thể đưa lên bất kỳ dịch vụ lưu trữ nào mà **không bị phụ thuộc cấu hình phức tạp**.

### Các tính năng cốt lõi đã tích hợp sẵn:
* **Bộ nhận diện chuẩn hóa:** Logo trường, Banner Header trang chủ, Favicon trình duyệt, Footer ghi rõ *"Thiết kế web bởi MVK"*.
* **Banner Chuyên đề Học tập theo Bác:** *"Đẩy mạnh học tập, thực hành tư tưởng, đạo đức, phương pháp, phong cách Hồ Chí Minh trong giai đoạn phát triển mới"* kèm trang Landing Page chuyên đề độc lập (`/chuyen-de/hoc-tap-va-lam-theo-bac`).
* **Dòng chữ chạy ngang Header (Marquee Ticker):** Khởi tạo sẵn chủ đề năm học mới:  
  `Năm học 2026 - 2027: "Đổi mới tư duy - Chuyển biến mạnh mẽ - Kết quả thực chất"`.
* **Slider Thông điệp & Phương châm sư phạm:** Kích thước cố định chuẩn mực, hiển thị các thông điệp: *Dạy tốt - Học tốt, Rèn đức - Luyện tài, Trường học hạnh phúc*.
* **Hệ thống 7 Chuyên mục tin tức chuẩn:**
  1. Hoạt động chuyên môn
  2. Hoạt động đoàn thể
  3. Tin giáo dục
  4. Tin trường
  5. Hoạt động phong trào
  6. Thông báo học tập
  7. Lịch công tác
* **Trình xem trước Văn bản 2 cột:** Cột thông tin 30% và cột xem trước 70% kèm chức năng In ấn, Mở tab mới và Tải về máy tự động.
* **Kế hoạch công tác Tuần/Tháng:** Bảng biểu điều hành trực quan 4 cột trong trang quản trị thông báo.
* **Hai chế độ hoạt động linh hoạt:**
  * **Chế độ Tự Quản (Standalone Mode):** Lưu trữ trên trình duyệt (LocalStorage / IndexedDB). Chạy ngay trên mọi Web Host / Host tĩnh mà không cần tài khoản Supabase.
  * **Chế độ Đám Mây (Supabase Cloud PostgreSQL):** Kết nối cơ sở dữ liệu đám mây đồng bộ nhiều thiết bị.

---

## 2. PHƯƠNG ÁN 1: ĐẨY LÊN REPO GITHUB MỚI

Nếu bạn muốn tạo một kho lưu trữ (repository) mới trên GitHub để quản lý riêng:

### Bước 1: Tạo Repository mới trên GitHub
1. Đăng nhập vào [GitHub](https://github.com).
2. Nhấn nút **New** (Tạo repo mới).
3. Đặt tên (VD: `c3vinhphong-website` hoặc `school-news-platform-release`).
4. Chọn chế độ **Public** hoặc **Private** theo nhu cầu. Nhấn **Create repository**.

### Bước 2: Đẩy toàn bộ mã nguồn lên repo mới
Mở terminal tại thư mục dự án và thực hiện các lệnh sau:

```bash
# 1. Kiểm tra trạng thái git hiện tại
git status

# 2. Xóa liên kết remote cũ (nếu có)
git remote remove origin

# 3. Thêm địa chỉ kho lưu trữ mới của bạn
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo-moi>.git

# 4. Đổi tên nhánh chính thành main (nếu cần)
git branch -M main

# 5. Đẩy toàn bộ mã nguồn lên GitHub
git push -u origin main
```

*(Nếu GitHub yêu cầu đăng nhập hoặc Personal Access Token (PAT), hãy sử dụng token của bạn để xác thực).*

---

## 3. PHƯƠNG ÁN 2: CÀI ĐẶT LÊN WEB HOSTING (CPANEL / DIRECTADMIN)

Đây là cách phổ biến nhất để đưa website lên tên miền riêng của trường (VD: `thcsvathptvinhphong.edu.vn`).

### Bước 1: Lấy bản cài đặt nén sẵn (school-news-platform-dist.zip)
Bạn có thể lấy gói cài đặt theo một trong hai cách:
* **Cách A (Tải trực tiếp bằng 1 click):** Truy cập đường dẫn trực tiếp trên trình duyệt:  
  `https://ais-pre-kya5nfq7xtgltvrhpa6ne5-782880727569.asia-southeast1.run.app/school-news-platform-dist.zip`  
  *(hoặc bấm nút "Tải ZIP Bản Cài Đặt" trong trang Quản trị hoặc Setup Wizard).*
* **Cách B (Biên dịch trên máy cá nhân qua dòng lệnh):**
  ```bash
  npm install
  npm run package
  ```
Tệp `school-news-platform-dist.zip` (dung lượng ~9.2 MB) chứa toàn bộ mã nguồn HTML/CSS/JS tĩnh đã tối ưu, hình ảnh trường học và tệp `.htaccess` chống lỗi 404.

### Bước 2: Tải lên Web Hosting
1. Đăng nhập vào bảng điều khiển **cPanel** hoặc **DirectAdmin** của nhà trường.
2. Mở công cụ **File Manager** (Quản lý tập tin).
3. Truy cập vào thư mục gốc của website (thường là `public_html` hoặc thư mục tên miền con `subdomain`).
4. Nhấn **Upload** và tải tệp `school-news-platform-dist.zip` (hoặc toàn bộ các tệp trong thư mục `dist/`) lên.
5. Nhấn chuột phải vào tệp zip vừa tải lên và chọn **Extract** (Giải nén).

### Bước 3: Kiểm tra tệp `.htaccess`
Đảm bảo tệp `.htaccess` (đã được tạo sẵn trong `dist/`) nằm ngay tại thư mục gốc `public_html`. Tệp này chịu trách nhiệm điều hướng URL Single Page Application (SPA), giúp khi người dùng F5 hoặc gõ link như `/setup`, `/admin`, `/news` không bị lỗi 404 Not Found.

Nội dung chuẩn của `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

### Bước 4: Kích hoạt Setup Wizard
Mở trình duyệt và truy cập:
```
https://ten-mien-cua-truong.edu.vn/setup
```
Trình hướng dẫn cài đặt sẽ xuất hiện để bạn thiết lập thông tin.

---

## 4. PHƯƠNG ÁN 3: TRIỂN KHAI MIỄN PHÍ 100% (VERCEL / NETLIFY)

Nếu nhà trường chưa có hosting riêng hoặc muốn chạy thử nghiệm với tốc độ CDN toàn cầu siêu tốc và chứng chỉ SSL miễn phí:

### Cách 1: Triển khai qua Vercel
1. Đăng nhập [Vercel](https://vercel.com) bằng tài khoản GitHub.
2. Nhấn **Add New...** -> **Project**.
3. Chọn kho lưu trữ GitHub của bạn và nhấn **Import**.
4. Các thiết lập tự động:
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Nhấn **Deploy**. Sau khoảng 1 phút, bạn sẽ nhận được một địa chỉ web trực tuyến (VD: `https://ten-truong.vercel.app`).
6. Bạn có thể gắn tên miền riêng `.edu.vn` hoàn toàn miễn phí trong mục **Settings > Domains**.

---

## 5. PHƯƠNG ÁN 4: TRIỂN KHAI TRÊN MÁY CHỦ RIÊNG (VPS LINUX / DOCKER)

Nếu nhà trường có máy chủ riêng (Ubuntu / Debian / CentOS):

### Sử dụng Docker Compose (Khuyên dùng):
Tệp cấu hình đã được tạo sẵn trong thư mục `installer/`:

```bash
# 1. Di chuyển vào thư mục installer
cd installer

# 2. Khởi chạy container ngầm
docker compose up -d
```
Hệ thống sẽ chạy qua web server Nginx siêu nhẹ trên cổng 80.

---

## 6. QUY TRÌNH CHẠY SETUP WIZARD TỪNG BƯỚC

Khi truy cập vào `/setup` (hoặc `/install`), bạn sẽ đi qua **10 bước chuẩn hóa**:

| Bước | Tên Bước | Thao Tác Cần Thực Hiện |
| :--- | :--- | :--- |
| **01** | **Khởi đầu (Welcome)** | Giới thiệu hệ thống. Có nút bấm *"Nạp mẫu THCS & THPT Vĩnh Phong"* để tự động điền sẵn mọi dữ liệu chuẩn. |
| **02** | **Môi trường (Environment)** | Lựa chọn giữa **Chế độ Tự Quản (Standalone)** (chạy ngay không cần database) hoặc **Supabase Cloud** (nhập URL và Key với nút Ping Test). |
| **03** | **Cơ sở dữ liệu (Database)** | Kiểm tra độ sẵn sàng của các bảng dữ liệu `site_settings`, `module_settings`, `setup_state`. |
| **04** | **Lược đồ (Migration)** | Xác nhận trạng thái các schema phân quyền và tin tức. |
| **05** | **Lưu trữ Media (Storage)** | Xác nhận kho lưu trữ hình ảnh bài viết và tệp văn bản. |
| **06** | **Nhận diện (Identity)** | Cấu hình tên trường, tên viết tắt, khẩu hiệu sư phạm, chủ đề năm học 2026-2027, điện thoại, email và thông tin *"Thiết kế web bởi MVK"*. |
| **07** | **Quản trị viên (Admin)** | Khởi tạo tài khoản Quản trị tối cao (Super Admin) gồm: Họ tên, Email, Tên đăng nhập và Mật khẩu. |
| **08** | **Dữ liệu mẫu (Seed Data)** | Tùy chọn nạp 7 chuyên mục chuẩn, banner Bác Hồ, slider phương châm và chữ chạy năm học mới. |
| **09** | **Giao diện (Homepage)** | Kiểm tra tổng thể bố cục trang chủ 12 cột, menu sticky và nhận diện màu sắc Deep Blue & Amber Gold. |
| **10** | **Khóa & Bàn giao (Lock)** | Tải file cấu hình dự phòng `school-config.json`, tệp `.env`, sau đó nhấn nút **"Xác Nhận Khóa Cài Đặt (Lock Installation)"**. |

---

## 7. TÀI KHOẢN QUẢN TRỊ & CƠ CHẾ KHÓA AN TOÀN

### Thông tin đăng nhập Quản trị mặc định:
* **Đường dẫn đăng nhập:** `https://ten-mien-cua-truong.edu.vn/login` (hoặc `/admin`)
* **Tài khoản (Email hoặc Username):** `admin@vinhphong.edu.vn` (hoặc `admin`)
* **Mật khẩu khởi tạo:** `Admin@2026!`
* *(Bạn có thể đổi mật khẩu và tạo thêm cán bộ biên tập bất kỳ lúc nào tại mục Quản lý người dùng).*

### Cơ chế Khóa an toàn (Setup Lock):
* Sau khi hoàn tất cài đặt, hệ thống sẽ kích hoạt cờ `is_completed = true` để khóa đường dẫn `/setup`. Mọi người dùng thông thường khi truy cập `/setup` sẽ tự động chuyển hướng về trang quản trị để đảm bảo an toàn tuyệt đối.
* **Cách mở lại Setup Wizard khi cần cấu hình lại:**
  1. Đăng nhập quyền Quản trị tối cao.
  2. Vào menu **Quản trị > Cấu hình hệ thống**, nhấn nút **"Chạy Trình Cài Đặt (Setup Wizard)"** ở góc trên bên phải.
  3. Hoặc truy cập trực tiếp đường dẫn có tham số ép buộc:  
     `https://ten-mien-cua-truong.edu.vn/setup?force=true`

---

## 8. SAO LƯU, KHÔI PHỤC VÀ CẬP NHẬT DỮ LIỆU

### Sao lưu cấu hình:
* Tại Bước 10 của Setup Wizard hoặc trong trang Cấu hình, nhấn nút **"Tải file cấu hình (school-config.json)"** để lưu trữ một bản sao lưu an toàn về máy tính của quản trị viên.

### Cập nhật mã nguồn mới trong tương lai:
* Khi có bản cập nhật giao diện hoặc tính năng mới, bạn chỉ cần tải bản build mới và chép đè vào thư mục `public_html` trên hosting.
* Toàn bộ cấu hình thông tin trường, dữ liệu tin tức và tài khoản quản trị được bảo toàn nguyên vẹn.

---
*Chúc quý trường triển khai và vận hành Cổng thông tin điện tử thành công, hiệu quả và an toàn!*  
**Hỗ trợ kỹ thuật & Thiết kế: MVK**
