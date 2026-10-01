/**
 * Public Page Header Component
 * Renders title, metadata bar, excerpt, and featured image
 * School News Platform - Step 09.6A
 */

import React from 'react';
import { Calendar, User, Eye } from 'lucide-react';
import type { PageWithRelations } from '../types/page';

interface PublicPageHeaderProps {
  page: PageWithRelations;
}

export const PublicPageHeader: React.FC<PublicPageHeaderProps> = ({ page }) => {
  const formattedDate = page.published_at
    ? new Date(page.published_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <header className="mb-8 space-y-5">
      {/* 1. Page Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
        {page.title}
      </h1>

      {/* 2. Metadata Bar */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
        {page.author?.full_name && (
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{page.author.full_name}</span>
          </div>
        )}

        {formattedDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Ngày đăng: {formattedDate}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{page.view_count.toLocaleString('vi-VN')} lượt xem</span>
        </div>
      </div>

      {/* 3. Excerpt / Lead Paragraph */}
      {page.excerpt && page.excerpt.trim().length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50/60 border-l-4 border-blue-600 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
          {page.excerpt}
        </div>
      )}

      {/* 4. Featured Image */}
      {page.featured_image && page.featured_image.trim().length > 0 && (
        <div className="relative aspect-[21/9] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
          <img
            src={page.featured_image}
            alt={page.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Hide image container gracefully if broken
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) parent.style.display = 'none';
            }}
          />
        </div>
      )}
    </header>
  );
};
