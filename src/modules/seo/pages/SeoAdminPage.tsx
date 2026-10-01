/**
 * SEO Settings Admin Page Component
 * School News Platform - Step 09.5C
 *
 * Route: /admin/seo
 * Coordinates:
 * - Singleton record management (id = 'default')
 * - useSeoSettings() query hook
 * - useUpdateSeoSettings() mutation hook
 * - usePermissions() authorization enforcement (settings.view, settings.edit)
 * - seoSettingsUpdateSchema Zod client validation
 * - Live SERP & OpenGraph real-time simulator
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Type,
  Share2,
  Search,
  Bot,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useSeoSettings } from '../hooks/useSeoSettings';
import { useUpdateSeoSettings } from '../hooks/useUpdateSeoSettings';
import { usePermissions } from '../../../hooks/usePermissions';
import { useConfig } from '../../../hooks/useConfig';
import { seoSettingsUpdateSchema } from '../schemas/seoSchema';
import type { SeoSettingsUpdateInput } from '../types/seo';
import { DEFAULT_SEO_SETTINGS, SEO_SINGLETON_ID } from '../config/seoConfig';

import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { SeoStatusBadge } from '../components/SeoStatusBadge';
import { SeoPreviewCard } from '../components/SeoPreviewCard';
import { SeoGeneralSettingsForm } from '../components/SeoGeneralSettingsForm';
import { SeoSocialSettingsForm } from '../components/SeoSocialSettingsForm';
import { SeoIndexingSettingsForm } from '../components/SeoIndexingSettingsForm';
import { SeoRobotsTxtForm } from '../components/SeoRobotsTxtForm';

interface FormState {
  meta_title_pattern: string;
  meta_description_default: string;
  meta_keywords_default: string;
  og_image_default: string;
  canonical_base_url: string;
  robots_txt_content: string;
  sitemap_enabled: boolean;
  structured_data_enabled: boolean;
  google_site_verification: string;
  bing_site_verification: string;
}

const emptyFormState: FormState = {
  meta_title_pattern: DEFAULT_SEO_SETTINGS.meta_title_pattern,
  meta_description_default: DEFAULT_SEO_SETTINGS.meta_description_default || '',
  meta_keywords_default: DEFAULT_SEO_SETTINGS.meta_keywords_default || '',
  og_image_default: DEFAULT_SEO_SETTINGS.og_image_default || '',
  canonical_base_url: DEFAULT_SEO_SETTINGS.canonical_base_url || '',
  robots_txt_content: DEFAULT_SEO_SETTINGS.robots_txt_content || '',
  sitemap_enabled: DEFAULT_SEO_SETTINGS.sitemap_enabled,
  structured_data_enabled: DEFAULT_SEO_SETTINGS.structured_data_enabled,
  google_site_verification: DEFAULT_SEO_SETTINGS.google_site_verification || '',
  bing_site_verification: DEFAULT_SEO_SETTINGS.bing_site_verification || '',
};

export function SeoAdminPage() {
  const { hasPermission } = usePermissions();
  const { schoolIdentity } = useConfig();
  const canEdit = hasPermission('settings.edit');

  // Query & Mutation Hooks
  const { seoSettings, isLoading, isFetching, isError, error, refetch } = useSeoSettings();
  const updateMutation = useUpdateSeoSettings();

  // Controlled Form State
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Synchronize form when data loads
  useEffect(() => {
    if (seoSettings) {
      setFormState({
        meta_title_pattern: seoSettings.meta_title_pattern || '',
        meta_description_default: seoSettings.meta_description_default || '',
        meta_keywords_default: seoSettings.meta_keywords_default || '',
        og_image_default: seoSettings.og_image_default || '',
        canonical_base_url: seoSettings.canonical_base_url || '',
        robots_txt_content: seoSettings.robots_txt_content || '',
        sitemap_enabled: seoSettings.sitemap_enabled ?? true,
        structured_data_enabled: seoSettings.structured_data_enabled ?? true,
        google_site_verification: seoSettings.google_site_verification || '',
        bing_site_verification: seoSettings.bing_site_verification || '',
      });
      setFieldErrors({});
    }
  }, [seoSettings]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    if (!seoSettings) return false;
    return (
      formState.meta_title_pattern !== (seoSettings.meta_title_pattern || '') ||
      formState.meta_description_default !== (seoSettings.meta_description_default || '') ||
      formState.meta_keywords_default !== (seoSettings.meta_keywords_default || '') ||
      formState.og_image_default !== (seoSettings.og_image_default || '') ||
      formState.canonical_base_url !== (seoSettings.canonical_base_url || '') ||
      formState.robots_txt_content !== (seoSettings.robots_txt_content || '') ||
      formState.sitemap_enabled !== (seoSettings.sitemap_enabled ?? true) ||
      formState.structured_data_enabled !== (seoSettings.structured_data_enabled ?? true) ||
      formState.google_site_verification !== (seoSettings.google_site_verification || '') ||
      formState.bing_site_verification !== (seoSettings.bing_site_verification || '')
    );
  }, [formState, seoSettings]);

  // Generic field updater
  const handleFieldChange = (field: string, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field-specific error if present
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Reset form to server values
  const handleResetForm = () => {
    if (seoSettings) {
      setFormState({
        meta_title_pattern: seoSettings.meta_title_pattern || '',
        meta_description_default: seoSettings.meta_description_default || '',
        meta_keywords_default: seoSettings.meta_keywords_default || '',
        og_image_default: seoSettings.og_image_default || '',
        canonical_base_url: seoSettings.canonical_base_url || '',
        robots_txt_content: seoSettings.robots_txt_content || '',
        sitemap_enabled: seoSettings.sitemap_enabled ?? true,
        structured_data_enabled: seoSettings.structured_data_enabled ?? true,
        google_site_verification: seoSettings.google_site_verification || '',
        bing_site_verification: seoSettings.bing_site_verification || '',
      });
      setFieldErrors({});
      setNotice(null);
    }
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || updateMutation.isPending) return;

    setNotice(null);
    setFieldErrors({});

    // 1. Prepare payload with sanitization
    const rawPayload: SeoSettingsUpdateInput = {
      meta_title_pattern: formState.meta_title_pattern.trim(),
      meta_description_default: formState.meta_description_default.trim() || null,
      meta_keywords_default: formState.meta_keywords_default.trim() || null,
      og_image_default: formState.og_image_default.trim() || null,
      canonical_base_url: formState.canonical_base_url.trim() || null,
      robots_txt_content: formState.robots_txt_content.trim() || null,
      sitemap_enabled: formState.sitemap_enabled,
      structured_data_enabled: formState.structured_data_enabled,
      google_site_verification: formState.google_site_verification.trim() || null,
      bing_site_verification: formState.bing_site_verification.trim() || null,
    };

    // 2. Validate client-side via Zod schema
    const validationResult = seoSettingsUpdateSchema.safeParse(rawPayload);
    if (!validationResult.success) {
      const errorsMap: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName && !errorsMap[fieldName]) {
          errorsMap[fieldName] = issue.message;
        }
      }
      setFieldErrors(errorsMap);
      setNotice({
        type: 'error',
        message: validationResult.error.issues[0]?.message || 'Vui lòng kiểm tra lại thông tin đã nhập.',
      });
      return;
    }

    // 3. Execute mutation via hook
    try {
      await updateMutation.mutateAsync(rawPayload);
      setNotice({
        type: 'success',
        message: 'Cập nhật cấu hình SEO & Siêu dữ liệu hệ thống thành công!',
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi không xác định khi lưu cấu hình SEO.';
      setNotice({
        type: 'error',
        message: errMsg,
      });
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-96 bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="danger" title="Không thể tải cấu hình SEO">
          {error instanceof Error ? error.message : 'Lỗi kết nối cơ sở dữ liệu khi tải cấu hình SEO.'}
        </Alert>
        <Button variant="primary" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Header & Breadcrumb Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              <Globe className="h-3.5 w-3.5 mr-1" />
              CẤU HÌNH SEO & MXH
            </span>
            <span className="text-xs text-slate-400">• Step 09.5C CMS Admin UI</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quản Trị Cấu Hình SEO & Siêu Dữ Liệu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Tối ưu hóa khả năng hiển thị của cổng thông tin trên các công cụ tìm kiếm (Google, Bing) và tùy biến cách hiển thị liên kết khi chia sẻ qua Zalo, Facebook.
          </p>

          <div className="pt-1">
            <SeoStatusBadge settings={seoSettings} isLoading={isLoading} />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Tải lại dữ liệu mới nhất từ máy chủ"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          {canEdit && (
            <>
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetForm}
                  disabled={updateMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Hủy thay đổi
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={updateMutation.isPending}
                disabled={!isDirty && !updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1.5" />
                Lưu cấu hình SEO
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Read-only Warning if user lacks settings.edit */}
      {!canEdit && (
        <Alert variant="warning" title="Chế độ chỉ xem (Read-only)">
          Tài khoản của bạn có quyền <code className="font-mono font-bold">settings.view</code> nhưng chưa được cấp quyền <code className="font-mono font-bold">settings.edit</code>. Tất cả biểu mẫu đã được chuyển sang chế độ chỉ đọc.
        </Alert>
      )}

      {/* 3. Success / Error Notification */}
      {notice && (
        <Alert
          variant={notice.type === 'success' ? 'success' : 'danger'}
          title={notice.type === 'success' ? 'Thành công' : 'Lỗi'}
        >
          {notice.message}
        </Alert>
      )}

      {/* 4. Main Content Layout: Form Tabs + Sticky Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Tabs (7 cols on xl) */}
        <div className="xl:col-span-7 space-y-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="general" className="text-xs sm:text-sm">
                <Type className="h-4 w-4 mr-1.5" />
                Thẻ Meta & Tiêu Đề
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs sm:text-sm">
                <Share2 className="h-4 w-4 mr-1.5" />
                Mạng Xã Hội (OG)
              </TabsTrigger>
              <TabsTrigger value="indexing" className="text-xs sm:text-sm">
                <Search className="h-4 w-4 mr-1.5" />
                Sitemap & Xác Minh
              </TabsTrigger>
              <TabsTrigger value="robots" className="text-xs sm:text-sm">
                <Bot className="h-4 w-4 mr-1.5" />
                Robots.txt
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: General Meta & Title Pattern */}
            <TabsContent value="general">
              <SeoGeneralSettingsForm
                metaTitlePattern={formState.meta_title_pattern}
                metaDescriptionDefault={formState.meta_description_default}
                metaKeywordsDefault={formState.meta_keywords_default}
                canonicalBaseUrl={formState.canonical_base_url}
                onChange={handleFieldChange}
                disabled={!canEdit}
                errors={fieldErrors}
                schoolName={schoolIdentity.school_name || 'Cổng thông tin điện tử trường học'}
              />
            </TabsContent>

            {/* TAB 2: Social Media & OpenGraph */}
            <TabsContent value="social">
              <SeoSocialSettingsForm
                ogImageDefault={formState.og_image_default}
                onChange={handleFieldChange}
                disabled={!canEdit}
                error={fieldErrors.og_image_default}
                canonicalBaseUrl={formState.canonical_base_url}
              />
            </TabsContent>

            {/* TAB 3: Indexing, Sitemap & Site Verification */}
            <TabsContent value="indexing">
              <SeoIndexingSettingsForm
                sitemapEnabled={formState.sitemap_enabled}
                structuredDataEnabled={formState.structured_data_enabled}
                googleSiteVerification={formState.google_site_verification}
                bingSiteVerification={formState.bing_site_verification}
                canonicalBaseUrl={formState.canonical_base_url}
                onChange={handleFieldChange}
                disabled={!canEdit}
                errors={fieldErrors}
              />
            </TabsContent>

            {/* TAB 4: Robots.txt */}
            <TabsContent value="robots">
              <SeoRobotsTxtForm
                robotsTxtContent={formState.robots_txt_content}
                canonicalBaseUrl={formState.canonical_base_url}
                sitemapEnabled={formState.sitemap_enabled}
                onChange={handleFieldChange}
                disabled={!canEdit}
                error={fieldErrors.robots_txt_content}
              />
            </TabsContent>
          </Tabs>

          {/* Mobile/Tablet Save Button Footer */}
          {canEdit && (
            <div className="flex xl:hidden items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs text-slate-500">
                {isDirty ? 'Có thay đổi chưa lưu' : 'Tất cả thay đổi đã được đồng bộ'}
              </span>
              <div className="flex items-center gap-2">
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetForm}
                    disabled={updateMutation.isPending}
                  >
                    Hủy
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={updateMutation.isPending}
                  disabled={!isDirty}
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Lưu cấu hình
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Real-time SERP & Social Preview (5 cols on xl) */}
        <div className="xl:col-span-5 xl:sticky xl:top-6 space-y-4">
          <SeoPreviewCard
            metaTitlePattern={formState.meta_title_pattern}
            metaDescriptionDefault={formState.meta_description_default}
            canonicalBaseUrl={formState.canonical_base_url}
            ogImageDefault={formState.og_image_default}
            structuredDataEnabled={formState.structured_data_enabled}
            schoolName={schoolIdentity.school_name || 'Cổng thông tin điện tử trường học'}
          />

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Cơ chế Singleton bất biến (Single-row invariant)</span>
            </div>
            <p className="leading-relaxed">
              Cấu hình SEO của toàn trường được lưu trữ duy nhất tại bản ghi có khóa chính <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-bold">id = 'default'</code>. Hệ thống không cho phép tạo bản ghi thứ hai hoặc xóa cấu hình này để đảm bảo website luôn có siêu dữ liệu dự phòng chuẩn xác.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
