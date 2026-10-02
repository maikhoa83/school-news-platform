/**
 * SEO Status & Singleton Identity Badge Component
 * School News Platform - Step 09.5C
 *
 * Displays singleton record metadata, audit timestamps, and configuration health pills.
 */

import React from 'react';
import { Shield, Clock, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { SeoSettings } from '../types/seo';

interface SeoStatusBadgeProps {
  settings: SeoSettings | null;
  isLoading?: boolean;
}

export function SeoStatusBadge({ settings, isLoading }: SeoStatusBadgeProps) {
  if (isLoading || !settings) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-6 w-24 bg-slate-200 rounded-md" />
        <div className="h-6 w-32 bg-slate-200 rounded-md" />
      </div>
    );
  }

  const hasCanonical = Boolean(settings.canonical_base_url && settings.canonical_base_url.trim().length > 0);
  const hasDescription = Boolean(settings.meta_description_default && settings.meta_description_default.trim().length > 0);
  const hasOgImage = Boolean(settings.og_image_default && settings.og_image_default.trim().length > 0);
  const hasGoogleVerification = Boolean(settings.google_site_verification && settings.google_site_verification.trim().length > 0);

  const formattedUpdatedAt = settings.updated_at
    ? new Date(settings.updated_at).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Chưa xác định';

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Singleton Lock Indicator */}
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium"
        title="Bản ghi cấu hình SEO là duy nhất trong toàn hệ thống (Singleton invariant: id = 'default')"
      >
        <Shield className="h-3.5 w-3.5 text-blue-600" />
        <span>Bản ghi: <strong className="font-mono text-blue-900">id="{settings.id}"</strong></span>
      </span>

      {/* Last Updated Timestamp */}
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
        title="Thời điểm cập nhật cấu hình lần cuối"
      >
        <Clock className="h-3.5 w-3.5 text-slate-500" />
        <span>Cập nhật: {formattedUpdatedAt}</span>
      </span>

      {/* Canonical URL Health Pill */}
      <Badge
        variant={hasCanonical ? 'success' : 'warning'}
        className="text-[11px] py-0.5 px-2"
        title={hasCanonical ? `Canonical Base URL: ${settings.canonical_base_url}` : 'Chưa cấu hình tên miền chuẩn (Canonical URL)'}
      >
        <Globe className="h-3 w-3 mr-1" />
        {hasCanonical ? 'Canonical URL: Đã thiết lập' : 'Canonical URL: Chưa thiết lập'}
      </Badge>

      {/* Sitemap Status */}
      <Badge
        variant={settings.sitemap_enabled ? 'primary' : 'outline'}
        className="text-[11px] py-0.5 px-2"
      >
        {settings.sitemap_enabled ? 'Sitemap: Bật' : 'Sitemap: Tắt'}
      </Badge>

      {/* Verification Status */}
      {hasGoogleVerification ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Google GSC: Đã xác minh
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="h-3 w-3 text-amber-600" />
          Google GSC: Chưa kết nối
        </span>
      )}
    </div>
  );
}
