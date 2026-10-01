/**
 * SEO Robots.txt Content Editor Form Component
 * School News Platform - Step 09.5C
 *
 * Configures:
 * - robots_txt_content (custom crawler directive file)
 * - Auto-generator for standard educational portal crawler rules
 * - Security warnings against accidental full-site blocking
 */

import React from 'react';
import { Bot, RotateCcw, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { SEO_LIMITS } from '../config/seoConfig';
import { generateRobotsTxt } from '../services/seoService';

interface SeoRobotsTxtFormProps {
  robotsTxtContent: string;
  canonicalBaseUrl: string;
  sitemapEnabled: boolean;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function SeoRobotsTxtForm({
  robotsTxtContent,
  canonicalBaseUrl,
  sitemapEnabled,
  onChange,
  disabled = false,
  error,
}: SeoRobotsTxtFormProps) {
  const contentLen = robotsTxtContent.length;

  const handleGenerateStandardRobots = () => {
    if (disabled) return;
    const generated = generateRobotsTxt({
      canonical_base_url: canonicalBaseUrl,
      sitemap_enabled: sitemapEnabled,
      robots_txt_content: null,
    });
    onChange('robots_txt_content', generated);
  };

  // Check for dangerous directives like Disallow: /
  const hasGlobalBlock = /^Disallow:\s*\/\s*$/m.test(robotsTxtContent);

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-base text-slate-900">
                Tệp Chỉ Dẫn Robot Tìm Kiếm (Robots.txt)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Chỉ dẫn cho các bot tìm kiếm (Googlebot, Bingbot, Yandex...) phạm vi thư mục được phép và không được phép thu thập.
              </CardDescription>
            </div>
          </div>

          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateStandardRobots}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Khởi tạo cấu hình tiêu chuẩn
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Warning if global block detected */}
        {hasGlobalBlock && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Cảnh báo: Chỉ thị chặn toàn bộ website (Disallow: /)</p>
              <p className="text-red-700 mt-0.5">
                Cấu hình hiện tại có chứa lệnh <code className="font-mono bg-red-100 px-1 py-0.5 rounded font-bold">Disallow: /</code>. Lệnh này sẽ yêu cầu các công cụ tìm kiếm KHÔNG lập chỉ mục toàn bộ website của nhà trường.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Nội dung tệp robots.txt
            </label>
            <span
              className={`text-xs font-mono ${
                contentLen > SEO_LIMITS.ROBOTS_TXT_MAX ? 'text-red-600 font-bold' : 'text-slate-400'
              }`}
            >
              {contentLen}/{SEO_LIMITS.ROBOTS_TXT_MAX} ký tự
            </span>
          </div>

          <Textarea
            value={robotsTxtContent}
            onChange={(e) => onChange('robots_txt_content', e.target.value)}
            rows={8}
            disabled={disabled}
            error={error}
            className="font-mono text-xs leading-relaxed bg-slate-900 text-emerald-400 placeholder:text-slate-600 focus:ring-emerald-500 focus:border-emerald-500 selection:bg-emerald-900 selection:text-white"
            placeholder="User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: /sitemap.xml"
          />
        </div>

        {/* Guidance and best practices */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>Quy chuẩn khuyến nghị cho website trường học:</span>
          </div>
          <p className="leading-relaxed">
            Nên cho phép (<code className="font-mono bg-white px-1 py-0.5 rounded border text-blue-700">Allow: /</code>) các bài viết, văn bản và thông báo công khai để phục vụ phụ huynh và học sinh tra cứu; đồng thời chặn (<code className="font-mono bg-white px-1 py-0.5 rounded border text-red-700">Disallow: /admin/</code>) các trang quản trị để tối ưu hóa tài nguyên máy chủ.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
