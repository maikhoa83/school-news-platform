#!/bin/bash
# ==============================================================================
# SCRIPT ĐÓNG GÓI BẢN CÀI ĐẶT SẴN SÀNG CHO WEB HOSTING & VIBEHOST
# ==============================================================================

set -e

echo "🚀 Bắt đầu đóng gói bản cài đặt School News Platform..."

# 1. Biên dịch dự án Vite
npm run build

# 2. Xóa bỏ _redirects nếu có trong dist để tránh VibeHost ghi đè toàn bộ tệp tĩnh (.js, .css, .jpg) thành index.html
rm -f dist/_redirects

# 3. Đảm bảo file .htaccess và installer được tích hợp vào thư mục dist
echo "📦 Sao chép cấu hình web server vào dist/..."
cp public/.htaccess dist/.htaccess
mkdir -p dist/installer
cp installer/index.html dist/installer/index.html

# 4. Tạo file ZIP bằng tiện ích zip chuẩn (mọi tệp nằm tại gốc archive)
echo "🗜️ Đang nén tệp school-news-platform-dist.zip..."
rm -f school-news-platform-dist.zip public/school-news-platform-dist.zip dist/school-news-platform-dist.zip

(cd dist && zip -r -9 ../school-news-platform-dist.zip . -x "*.DS_Store" -x "school-news-platform-dist.zip")

cp school-news-platform-dist.zip public/school-news-platform-dist.zip

echo "✅ Đã tạo thành công: school-news-platform-dist.zip (Dung lượng: $(du -h school-news-platform-dist.zip | cut -f1))"
echo "🎉 Hoàn tất đóng gói bản cài đặt!"
