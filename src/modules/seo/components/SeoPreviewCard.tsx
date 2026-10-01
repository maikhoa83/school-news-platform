/**
 * SEO Real-Time Preview Card Component
 * School News Platform - Step 09.5C
 *
 * Provides instant visual simulation for:
 * 1. Google SERP (Desktop & Mobile search snippet)
 * 2. OpenGraph / Facebook Social Sharing Card
 * 3. Schema.org WebSite JSON-LD Payload
 */

import React, { useState } from 'react';
import {
  Search,
  Share2,
  Code2,
  Smartphone,
  Monitor,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatMetaTitle } from '../services/seoService';

interface SeoPreviewCardProps {
  metaTitlePattern: string;
  metaDescriptionDefault: string;
  canonicalBaseUrl: string;
  ogImageDefault: string;
  structuredDataEnabled: boolean;
  samplePageTitle?: string;
  schoolName?: string;
}

export function SeoPreviewCard({
  metaTitlePattern,
  metaDescriptionDefault,
  canonicalBaseUrl,
  ogImageDefault,
  structuredDataEnabled,
  samplePageTitle = 'Thông báo tuyển sinh vào lớp 10 năm học mới',
  schoolName = 'Cổng thông tin điện tử trường học',
}: SeoPreviewCardProps) {
  const [activeTab, setActiveTab] = useState<'serp' | 'social' | 'schema'>('serp');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [isCopied, setIsCopied] = useState(false);

  // Compute live simulated values
  const simulatedTitle = formatMetaTitle(
    metaTitlePattern || '%s | Cổng thông tin điện tử trường học',
    samplePageTitle,
    schoolName
  );

  const cleanBaseUrl = canonicalBaseUrl && canonicalBaseUrl.trim().length > 0
    ? canonicalBaseUrl.trim().replace(/\/+$/, '')
    : 'https://truong-thpt.edu.vn';

  const simulatedUrl = `${cleanBaseUrl}/tin-tuc/thong-bao-tuyen-sinh`;
  const urlDisplayPath = cleanBaseUrl.replace(/^https?:\/\//, '') + ' › tin-tuc › thong-bao-tuyen-sinh';

  const simulatedDescription = metaDescriptionDefault && metaDescriptionDefault.trim().length > 0
    ? metaDescriptionDefault.trim()
    : 'Cổng thông tin điện tử chính thức của nhà trường, cung cấp tin tức, thông báo học vụ, văn bản chỉ đạo điều hành và các hoạt động sư phạm nổi bật.';

  // Structured Data Schema.org WebSite
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: simulatedTitle,
    description: simulatedDescription,
    url: cleanBaseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${cleanBaseUrl}/tim-kiem?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const schemaString = JSON.stringify(schemaJsonLd, null, 2);

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(schemaString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Card className="border-slate-200 shadow-xs overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Xem trước hiển thị thực tế (Live Preview)
            </CardTitle>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('serp')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'serp'
                  ? 'bg-blue-800 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Google SERP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'social'
                  ? 'bg-blue-800 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Mạng xã hội (OG)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'schema'
                  ? 'bg-blue-800 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Schema JSON-LD</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {/* 1. Google SERP Simulator */}
        {activeTab === 'serp' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span>Mô phỏng kết quả tìm kiếm Google</span>
                <Badge variant="outline" className="text-[10px]">
                  Tiêu đề: {simulatedTitle.length} ký tự
                </Badge>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1 rounded ${
                    deviceView === 'desktop' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'
                  }`}
                  title="Xem dạng máy tính để bàn (Desktop)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1 rounded ${
                    deviceView === 'mobile' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'
                  }`}
                  title="Xem dạng điện thoại di động (Mobile)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Google Search Card Box */}
            <div
              className={`p-4 bg-white rounded-lg border border-slate-200 ${
                deviceView === 'mobile' ? 'max-w-md mx-auto shadow-sm' : 'w-full'
              }`}
            >
              {/* Site Icon & URL Breadcrumb */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-blue-700">
                  VN
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-800 truncate leading-tight">
                    {schoolName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate leading-tight">
                    {urlDisplayPath}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                {simulatedTitle}
              </h3>

              {/* Description Snippet */}
              <p className="text-xs sm:text-sm text-[#4d5156] mt-1.5 leading-relaxed line-clamp-3">
                {simulatedDescription}
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span>* Độ dài tiêu đề tối ưu cho Google: 50 – 60 ký tự</span>
              <span>•</span>
              <span>Độ dài mô tả tối ưu: 120 – 160 ký tự</span>
            </div>
          </div>
        )}

        {/* 2. OpenGraph / Facebook Social Sharing Simulator */}
        {activeTab === 'social' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>Mô phỏng hiển thị liên kết khi chia sẻ qua Facebook, Zalo, mạng xã hội</span>
              <Badge variant="outline" className="text-[10px]">
                Tỉ lệ ảnh chuẩn 1.91:1 (1200 × 630px)
              </Badge>
            </div>

            {/* Social Share Card Mock */}
            <div className="max-w-md mx-auto rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
              {/* OG Image Container */}
              <div className="relative aspect-[1.91/1] w-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {ogImageDefault && ogImageDefault.trim().length > 0 ? (
                  <img
                    src={ogImageDefault}
                    alt="Xem trước OpenGraph"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Chưa có ảnh đại diện OpenGraph mặc định</p>
                    <p className="text-[11px] text-slate-400">Kích thước khuyến nghị: 1200 x 630 px</p>
                  </div>
                )}
              </div>

              {/* Social Content */}
              <div className="p-3.5 bg-white border-t border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  {cleanBaseUrl.replace(/^https?:\/\//, '').toUpperCase()}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                  {simulatedTitle}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {simulatedDescription}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Schema.org WebSite JSON-LD */}
        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span>Dữ liệu có cấu trúc Schema.org (JSON-LD WebSite)</span>
                <Badge
                  variant={structuredDataEnabled ? 'success' : 'outline'}
                  className="text-[10px]"
                >
                  {structuredDataEnabled ? 'Đang kích hoạt' : 'Đã vô hiệu hóa'}
                </Badge>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCopySchema}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Sao chép JSON-LD
                  </>
                )}
              </Button>
            </div>

            <div className="relative rounded-lg bg-slate-900 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto max-h-56">
              <pre>
                <code>{schemaString}</code>
              </pre>
            </div>

            <p className="text-[11px] text-slate-500">
              Mã này được chèn tự động vào thẻ <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">&lt;script type="application/ld+json"&gt;</code> tại phần đầu trang (head) để hỗ trợ các công cụ tìm kiếm hiểu rõ thực thể website nhà trường.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
