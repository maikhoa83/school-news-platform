/**
 * SEO General Settings Form Component
 * School News Platform - Step 09.5C
 *
 * Configures:
 * - meta_title_pattern (%s token placeholder)
 * - meta_description_default (SERP snippet fallback)
 * - meta_keywords_default (standard comma-separated keywords)
 * - canonical_base_url (domain canonicalization root)
 */

import React from 'react';
import { FileText, Type, Hash, Globe, HelpCircle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { SEO_LIMITS } from '../config/seoConfig';

interface SeoGeneralSettingsFormProps {
  metaTitlePattern: string;
  metaDescriptionDefault: string;
  metaKeywordsDefault: string;
  canonicalBaseUrl: string;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  schoolName?: string;
}

export function SeoGeneralSettingsForm({
  metaTitlePattern,
  metaDescriptionDefault,
  metaKeywordsDefault,
  canonicalBaseUrl,
  onChange,
  disabled = false,
  errors = {},
  schoolName = 'Cổng thông tin điện tử trường học',
}: SeoGeneralSettingsFormProps) {
  // Title pattern quick presets
  const titlePresets = [
    `%s | ${schoolName}`,
    `%s - ${schoolName}`,
    `${schoolName} | %s`,
    `%s | Cổng thông tin điện tử trường học`,
  ];

  const handleApplyPreset = (preset: string) => {
    if (disabled) return;
    onChange('meta_title_pattern', preset);
  };

  const titleLen = metaTitlePattern.length;
  const descLen = metaDescriptionDefault.length;
  const keywordsLen = metaKeywordsDefault.length;
  const urlLen = canonicalBaseUrl.length;

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-base text-slate-900">
              Cấu Hình Thẻ Meta & Định Dạng Tiêu Đề
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Thiết lập quy tắc hiển thị tiêu đề và thẻ thông tin tìm kiếm mặc định áp dụng trên toàn website.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* 1. Meta Title Pattern */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Mẫu tiêu đề trang (Title Pattern) <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs font-mono ${
                titleLen > SEO_LIMITS.TITLE_PATTERN_MAX ? 'text-red-600 font-bold' : 'text-slate-400'
              }`}
            >
              {titleLen}/{SEO_LIMITS.TITLE_PATTERN_MAX} ký tự
            </span>
          </div>

          <Input
            value={metaTitlePattern}
            onChange={(e) => onChange('meta_title_pattern', e.target.value)}
            placeholder="%s | Tên trường học"
            disabled={disabled}
            error={errors.meta_title_pattern}
            leftIcon={<Type className="h-4 w-4" />}
          />

          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium">
              <HelpCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Hướng dẫn sử dụng mã thay thế <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-800">%s</code>:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Ký tự <code className="font-mono font-bold text-blue-800">%s</code> đại diện cho tiêu đề của từng trang cụ thể (tin tức, văn bản, thông báo, trang tĩnh). Ví dụ khi cấu hình <code className="font-mono text-slate-800">%s | THPT Amsterdam</code>, trang tin tức "Lịch thi học kỳ" sẽ hiển thị thành <strong className="text-slate-800">"Lịch thi học kỳ | THPT Amsterdam"</strong>.
            </p>

            {/* Quick Presets */}
            {!disabled && (
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Mẫu gợi ý nhanh:
                </span>
                {titlePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-mono transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Canonical Base URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Tên miền gốc chuẩn hóa (Canonical Base URL)
            </label>
            <span
              className={`text-xs font-mono ${
                urlLen > SEO_LIMITS.URL_MAX ? 'text-red-600 font-bold' : 'text-slate-400'
              }`}
            >
              {urlLen}/{SEO_LIMITS.URL_MAX} ký tự
            </span>
          </div>

          <Input
            value={canonicalBaseUrl}
            onChange={(e) => onChange('canonical_base_url', e.target.value)}
            placeholder="https://truongthpt.edu.vn"
            disabled={disabled}
            error={errors.canonical_base_url}
            leftIcon={<Globe className="h-4 w-4" />}
            helperText="Định dạng bắt buộc: http:// hoặc https:// (ví dụ: https://c3amsterdam.edu.vn). Dấu gạch chéo cuối trang sẽ được tự động chuẩn hóa."
          />
        </div>

        {/* 3. Default Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Thẻ mô tả mặc định (Meta Description)
            </label>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`font-mono ${
                  descLen >= 120 && descLen <= 160
                    ? 'text-emerald-600 font-semibold'
                    : descLen > SEO_LIMITS.DESCRIPTION_MAX
                    ? 'text-red-600 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {descLen}/{SEO_LIMITS.DESCRIPTION_MAX} ký tự
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">(Khuyến nghị: 120 – 160)</span>
            </div>
          </div>

          <Textarea
            value={metaDescriptionDefault}
            onChange={(e) => onChange('meta_description_default', e.target.value)}
            placeholder="Cổng thông tin điện tử chính thức của trường, cung cấp tin tức, thông báo, hoạt động giáo dục..."
            rows={3}
            disabled={disabled}
            error={errors.meta_description_default}
            helperText="Được các công cụ tìm kiếm sử dụng làm đoạn trích (snippet) mô tả trang chủ hoặc khi một trang con không có tóm tắt riêng."
          />
        </div>

        {/* 4. Default Meta Keywords */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Từ khóa tìm kiếm mặc định (Meta Keywords)
            </label>
            <span
              className={`text-xs font-mono ${
                keywordsLen > SEO_LIMITS.KEYWORDS_MAX ? 'text-red-600 font-bold' : 'text-slate-400'
              }`}
            >
              {keywordsLen}/{SEO_LIMITS.KEYWORDS_MAX} ký tự
            </span>
          </div>

          <Input
            value={metaKeywordsDefault}
            onChange={(e) => onChange('meta_keywords_default', e.target.value)}
            placeholder="trường học, giáo dục, tin tức, thông báo, tuyển sinh"
            disabled={disabled}
            error={errors.meta_keywords_default}
            leftIcon={<Hash className="h-4 w-4" />}
            helperText="Nhập các từ khóa phân cách bằng dấu phẩy (,). Ví dụ: thpt, tin tức nhà trường, giáo dục đào tạo, thông báo học sinh."
          />

          {/* Keywords preview pills */}
          {metaKeywordsDefault && metaKeywordsDefault.trim().length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-500">Các từ khóa đã nhận diện:</span>
              {metaKeywordsDefault
                .split(',')
                .map((k) => k.trim())
                .filter((k) => k.length > 0)
                .map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-medium border border-slate-200"
                  >
                    #{kw}
                  </span>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
