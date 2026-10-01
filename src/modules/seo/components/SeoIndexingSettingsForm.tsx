/**
 * SEO Indexing, Sitemap & Search Engine Verification Settings Form Component
 * School News Platform - Step 09.5C
 *
 * Configures:
 * - sitemap_enabled (XML sitemap discovery)
 * - structured_data_enabled (Schema.org WebSite JSON-LD)
 * - google_site_verification (Google Search Console token)
 * - bing_site_verification (Bing Webmaster Tools token)
 */

import React from 'react';
import {
  Search,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { SEO_LIMITS } from '../config/seoConfig';

interface SeoIndexingSettingsFormProps {
  sitemapEnabled: boolean;
  structuredDataEnabled: boolean;
  googleSiteVerification: string;
  bingSiteVerification: string;
  canonicalBaseUrl: string;
  onChange: (field: string, value: unknown) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

export function SeoIndexingSettingsForm({
  sitemapEnabled,
  structuredDataEnabled,
  googleSiteVerification,
  bingSiteVerification,
  canonicalBaseUrl,
  onChange,
  disabled = false,
  errors = {},
}: SeoIndexingSettingsFormProps) {
  const sitemapUrl = canonicalBaseUrl && canonicalBaseUrl.trim().length > 0
    ? `${canonicalBaseUrl.trim().replace(/\/+$/, '')}/sitemap.xml`
    : '/sitemap.xml';

  /**
   * Auto-cleaner helper: If user accidentally pastes full HTML meta tag,
   * extract the content="..." attribute automatically.
   */
  const handleVerificationChange = (field: 'google_site_verification' | 'bing_site_verification', rawValue: string) => {
    let clean = rawValue.trim();
    if (clean.includes('<meta') && clean.includes('content=')) {
      const match = clean.match(/content=["']([^"']+)["']/i);
      if (match && match[1]) {
        clean = match[1];
      }
    }
    onChange(field, clean);
  };

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-base text-slate-900">
              Lập Chỉ Mục, Sơ Đồ Trang Web & Xác Minh Công Cụ Tìm Kiếm
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Cấu hình các giao thức kỹ thuật để Google Search và Bingbot thu thập và xác thực quyền sở hữu website.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* 1. Feature Toggles: Sitemap & Structured Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sitemap Toggle */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-sm text-slate-900">Sơ đồ trang web (Sitemap XML)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tự động tạo danh sách tất cả các bài viết, văn bản và thông báo công khai để bot tìm kiếm thu thập định kỳ.
              </p>
              <div className="pt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-600">
                <span className="text-slate-400">Đường dẫn:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700 font-semibold">
                  {sitemapUrl}
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => !disabled && onChange('sitemap_enabled', !sitemapEnabled)}
              disabled={disabled}
              aria-label="Bật tắt sitemap"
              className={`p-1 rounded-lg transition-colors focus:outline-none ${
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              } ${sitemapEnabled ? 'text-blue-800 hover:text-blue-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {sitemapEnabled ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>

          {/* Structured Data Toggle */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-sm text-slate-900">Dữ liệu có cấu trúc (Schema.org)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kích hoạt thẻ JSON-LD WebSite và công cụ tìm kiếm nội bộ để Google hiển thị khung tìm kiếm nhanh (Sitelinks Searchbox).
              </p>
              <div className="pt-1.5">
                <Badge variant={structuredDataEnabled ? 'success' : 'outline'} className="text-[10px]">
                  {structuredDataEnabled ? 'Chuẩn Schema.org: Kích hoạt' : 'Chuẩn Schema.org: Vô hiệu hóa'}
                </Badge>
              </div>
            </div>

            <button
              type="button"
              onClick={() => !disabled && onChange('structured_data_enabled', !structuredDataEnabled)}
              disabled={disabled}
              aria-label="Bật tắt dữ liệu có cấu trúc"
              className={`p-1 rounded-lg transition-colors focus:outline-none ${
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              } ${structuredDataEnabled ? 'text-blue-800 hover:text-blue-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {structuredDataEnabled ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>

        {/* 2. Webmaster Verification Tokens */}
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Mã Xác Minh Quyền Sở Hữu (Site Verification Tokens)
          </h4>

          {/* Google Search Console */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-800">
                Mã xác minh Google Search Console
              </label>
              <span className="text-xs font-mono text-slate-400">
                {googleSiteVerification.length}/{SEO_LIMITS.VERIFICATION_TOKEN_MAX}
              </span>
            </div>

            <Input
              value={googleSiteVerification}
              onChange={(e) => handleVerificationChange('google_site_verification', e.target.value)}
              placeholder="ví dụ: 4zY5bEXAMPLE_token_google..."
              disabled={disabled}
              error={errors.google_site_verification}
              helperText="Nhập chuỗi mã token xác minh (hoặc dán toàn bộ thẻ <meta name='google-site-verification' content='...' /> hệ thống sẽ tự động tách mã)."
            />
          </div>

          {/* Bing Webmaster Tools */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-800">
                Mã xác minh Bing Webmaster Tools
              </label>
              <span className="text-xs font-mono text-slate-400">
                {bingSiteVerification.length}/{SEO_LIMITS.VERIFICATION_TOKEN_MAX}
              </span>
            </div>

            <Input
              value={bingSiteVerification}
              onChange={(e) => handleVerificationChange('bing_site_verification', e.target.value)}
              placeholder="ví dụ: 9F8E7D6C5B4A3EXAMPLE_token_bing..."
              disabled={disabled}
              error={errors.bing_site_verification}
              helperText="Nhập chuỗi mã xác minh Bing Webmaster Tools để xác thực quyền quản trị trên công cụ tìm kiếm Bing & Yahoo."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
