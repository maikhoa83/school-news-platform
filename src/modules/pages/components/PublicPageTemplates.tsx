/**
 * Public Page Templates Component
 * Handles the 4 supported templates: 'default' | 'fullwidth' | 'sidebar' | 'contact'
 * Fully responsive and accessible
 * School News Platform - Step 09.6A
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  FileText,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import type { PageWithRelations } from '../types/page';
import { PublicPageBreadcrumb } from './PublicPageBreadcrumb';
import { PublicPageHeader } from './PublicPageHeader';
import { PublicPageContent } from './PublicPageContent';
import { useConfig } from '../../../hooks/useConfig';
import { defaultSchoolIdentity } from '../../../config/schoolIdentity';

interface PublicPageTemplateProps {
  page: PageWithRelations;
}

/**
 * 1. Default Template: Balanced centered card layout (max-w-5xl)
 */
export const DefaultPageTemplate: React.FC<PublicPageTemplateProps> = ({ page }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <PublicPageBreadcrumb page={page} />
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-xs">
        <PublicPageHeader page={page} />
        <PublicPageContent content={page.content} />
      </div>
    </div>
  );
};

/**
 * 2. Fullwidth Template: Expansive container (max-w-7xl)
 */
export const FullwidthPageTemplate: React.FC<PublicPageTemplateProps> = ({ page }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <PublicPageBreadcrumb page={page} />
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-xs">
        <PublicPageHeader page={page} />
        <PublicPageContent content={page.content} />
      </div>
    </div>
  );
};

/**
 * 3. Sidebar Template: 8-col content + 4-col context sidebar
 */
export const SidebarPageTemplate: React.FC<PublicPageTemplateProps> = ({ page }) => {
  const { schoolIdentity: configIdentity } = useConfig();
  const schoolIdentity = configIdentity || defaultSchoolIdentity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <PublicPageBreadcrumb page={page} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main 8-column content */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-xs">
          <PublicPageHeader page={page} />
          <PublicPageContent content={page.content} />
        </div>

        {/* Sticky 4-column contextual sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Parent page context card if applicable */}
          {page.parent && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Trang cấp trên</span>
              </h3>
              <Link
                to={`/page/${page.parent.slug}`}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/70 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                  {page.parent.title}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}

          {/* School Identity Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Thông tin Nhà trường</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="font-semibold text-slate-900 text-sm">
                {schoolIdentity.school_name || 'Cổng thông tin trường học'}
              </div>

              {schoolIdentity.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{schoolIdentity.address}</span>
                </div>
              )}

              {schoolIdentity.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${schoolIdentity.phone}`}
                    className="hover:text-blue-700 transition-colors font-medium text-slate-800"
                  >
                    {schoolIdentity.phone}
                  </a>
                </div>
              )}

              {schoolIdentity.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${schoolIdentity.email}`}
                    className="hover:text-blue-700 transition-colors truncate"
                  >
                    {schoolIdentity.email}
                  </a>
                </div>
              )}

              {schoolIdentity.slogan && (
                <div className="pt-2 border-t border-slate-100 italic text-slate-500">
                  &ldquo;{schoolIdentity.slogan}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-blue-50/70 rounded-2xl border border-blue-100 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Cổng Thông Tin Điện Tử</span>
            </div>
            <p className="text-xs text-blue-800/80 leading-relaxed">
              Văn bản chỉ đạo, thông báo học vụ và tin tức sự kiện luôn được cập nhật chính thức
              trên hệ thống của nhà trường.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

/**
 * 4. Contact Template: Layout optimized for school contact & feedback
 */
export const ContactPageTemplate: React.FC<PublicPageTemplateProps> = ({ page }) => {
  const { schoolIdentity: configIdentity } = useConfig();
  const schoolIdentity = configIdentity || defaultSchoolIdentity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <PublicPageBreadcrumb page={page} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 columns: Page main content */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-xs">
          <PublicPageHeader page={page} />
          <PublicPageContent content={page.content} />
        </div>

        {/* Right 5 columns: Dedicated Contact Directory Card */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Liên hệ chính thức</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {schoolIdentity.school_name || 'Thông tin liên hệ'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Bộ phận thường trực tiếp nhận thông tin và giải đáp thắc mắc
              </p>
            </div>

            <div className="divide-y divide-slate-100 space-y-4 text-sm">
              {schoolIdentity.address && (
                <div className="flex items-start gap-3 pt-4 first:pt-0">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Địa chỉ</div>
                    <div className="text-slate-800 font-medium mt-0.5 leading-relaxed">
                      {schoolIdentity.address}
                    </div>
                  </div>
                </div>
              )}

              {schoolIdentity.phone && (
                <div className="flex items-start gap-3 pt-4">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Điện thoại liên hệ
                    </div>
                    <a
                      href={`tel:${schoolIdentity.phone}`}
                      className="text-blue-700 hover:text-blue-800 font-bold mt-0.5 block"
                    >
                      {schoolIdentity.phone}
                    </a>
                  </div>
                </div>
              )}

              {schoolIdentity.email && (
                <div className="flex items-start gap-3 pt-4">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Hòm thư điện tử
                    </div>
                    <a
                      href={`mailto:${schoolIdentity.email}`}
                      className="text-slate-800 hover:text-blue-700 font-medium mt-0.5 block break-all"
                    >
                      {schoolIdentity.email}
                    </a>
                  </div>
                </div>
              )}

              {schoolIdentity.website && (
                <div className="flex items-start gap-3 pt-4">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Trang web</div>
                    <a
                      href={schoolIdentity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline font-medium mt-0.5 inline-flex items-center gap-1"
                    >
                      <span>{schoolIdentity.website}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 pt-4">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">
                    Thời gian làm việc
                  </div>
                  <div className="text-slate-800 font-medium mt-0.5">
                    Thứ Hai - Thứ Sáu: 07:30 - 17:00
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Thứ Bảy: 07:30 - 11:30 (Trực ban)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
