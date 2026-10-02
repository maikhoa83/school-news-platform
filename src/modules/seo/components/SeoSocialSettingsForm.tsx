/**
 * SEO Social Media (OpenGraph) Settings Form Component
 * School News Platform - Step 09.5C
 *
 * Configures:
 * - og_image_default (fallback social share banner)
 * - OpenGraph protocol tags information and live aspect ratio check
 */

import React from 'react';
import { Share2, Image as ImageIcon, ExternalLink, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { SEO_LIMITS } from '../config/seoConfig';

interface SeoSocialSettingsFormProps {
  ogImageDefault: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  error?: string;
  canonicalBaseUrl?: string;
}

export function SeoSocialSettingsForm({
  ogImageDefault,
  onChange,
  disabled = false,
  error,
  canonicalBaseUrl,
}: SeoSocialSettingsFormProps) {
  const imageLen = ogImageDefault.length;

  // Resolve preview image source if it's a relative path
  let previewSrc = ogImageDefault;
  if (previewSrc.startsWith('/') && canonicalBaseUrl) {
    previewSrc = `${canonicalBaseUrl.replace(/\/+$/, '')}${previewSrc}`;
  }

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-base text-slate-900">
              Cấu Hình Mạng Xã Hội (OpenGraph / Zalo / Facebook)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Ảnh đại diện và các thông số hiển thị trực quan khi liên kết bài viết được chia sẻ trên mạng xã hội và ứng dụng nhắn tin.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* OG Image URL Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Đường dẫn ảnh OpenGraph mặc định (OG Image Default)
            </label>
            <span
              className={`text-xs font-mono ${
                imageLen > SEO_LIMITS.URL_MAX ? 'text-red-600 font-bold' : 'text-slate-400'
              }`}
            >
              {imageLen}/{SEO_LIMITS.URL_MAX} ký tự
            </span>
          </div>

          <Input
            value={ogImageDefault}
            onChange={(e) => onChange('og_image_default', e.target.value)}
            placeholder="https://example.edu.vn/images/og-banner.jpg hoặc /images/banner.png"
            disabled={disabled}
            error={error}
            leftIcon={<ImageIcon className="h-4 w-4" />}
            helperText="Hỗ trợ đường dẫn tuyệt đối (bắt đầu bằng http://, https://) hoặc đường dẫn tương đối từ thư mục gốc (bắt đầu bằng /)."
          />
        </div>

        {/* Visual Aspect Ratio Box & Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Visual Container */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-700">
              Khung xem trước ảnh đại diện (Tỉ lệ chuẩn 1.91 : 1):
            </span>
            <div className="relative aspect-[1.91/1] w-full rounded-xl border border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden">
              {ogImageDefault && ogImageDefault.trim().length > 0 ? (
                <img
                  src={ogImageDefault}
                  alt="OpenGraph banner preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Chưa có ảnh OpenGraph mặc định</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Khuyến nghị chuẩn bị ảnh 1200 x 630 px</p>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Tiêu chuẩn kỹ thuật ảnh chia sẻ mạng xã hội</span>
            </div>

            <ul className="space-y-2 list-disc list-inside leading-relaxed text-slate-600">
              <li>
                <strong>Kích thước tối ưu:</strong> <code className="font-mono text-slate-800">1200 × 630 pixels</code> (tỉ lệ 1.91:1) giúp hiển thị sắc nét nhất trên cả màn hình Retina và thiết bị di động.
              </li>
              <li>
                <strong>Định dạng được khuyến nghị:</strong> PNG, JPG hoặc WebP. Dung lượng tệp nên dưới 2MB để đảm bảo tốc độ phản hồi nhanh khi robot Zalo / Facebook thu thập dữ liệu.
              </li>
              <li>
                <strong>Vị trí nội dung chính:</strong> Nên đặt logo trường học và nội dung quan trọng ở khu vực trung tâm an toàn (<em className="text-slate-700">safe zone</em>) để tránh bị cắt góc khi hiển thị trên các ứng dụng di động khác nhau.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
