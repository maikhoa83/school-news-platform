#!/bin/bash
# ==============================================================================
# SCRIPT ĐÓNG GÓI BẢN CÀI ĐẶT SẴN SÀNG (DISTRIBUTION BUNDLE)
# ==============================================================================

set -e

echo "🚀 Bắt đầu đóng gói bản cài đặt School News Platform..."

# 1. Biên dịch dự án Vite
npm run build

# 2. Đảm bảo file .htaccess và file cài đặt được tích hợp vào thư mục dist
echo "📦 Sao chép cấu hình web server vào dist/..."
cp public/.htaccess dist/.htaccess
mkdir -p dist/installer
cp installer/index.html dist/installer/index.html

# 3. Tạo file ZIP
if command -v zip >/dev/null 2>&1; then
  echo "🗜️ Đang tạo tệp school-news-platform-dist.zip..."
  (cd dist && zip -r ../school-news-platform-dist.zip . -x "*.DS_Store")
  echo "✅ Đã tạo thành công: school-news-platform-dist.zip"
elif command -v python3 >/dev/null 2>&1; then
  echo "🗜️ Đang nén tệp school-news-platform-dist.zip qua Python..."
  python3 -c "import shutil; shutil.make_archive('school-news-platform-dist', 'zip', 'dist')"
  echo "✅ Đã tạo thành công: school-news-platform-dist.zip"
else
  echo "ℹ️ Thư mục dist/ đã sẵn sàng để tải lên host."
fi

echo "🎉 Hoàn tất đóng gói bản cài đặt!"
