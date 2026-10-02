/**
 * Public Page Skeleton Component
 * Loading state with layout-preserving placeholders
 * School News Platform - Step 09.6A
 */

import React from 'react';

export const PublicPageSkeleton: React.FC = () => {
  return (
    <div
      id="page-skeleton-loading"
      role="status"
      aria-live="polite"
      className="min-h-[60vh] py-8 sm:py-12"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-3 w-3 bg-slate-200 rounded-full" />
            <div className="h-4 bg-slate-200 rounded w-36" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-3 pt-2">
            <div className="h-8 sm:h-10 bg-slate-200 rounded w-4/5" />
            <div className="h-8 sm:h-10 bg-slate-200 rounded w-2/5" />
          </div>

          {/* Metadata bar skeleton */}
          <div className="flex items-center gap-4 pt-1 pb-4 border-b border-slate-100">
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-20" />
          </div>

          {/* Excerpt skeleton */}
          <div className="h-20 bg-slate-100 rounded-xl w-full" />

          {/* Featured Image skeleton */}
          <div className="aspect-[21/9] sm:aspect-[2/1] bg-slate-200 rounded-xl w-full" />

          {/* Body paragraphs skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-11/12" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
      <span className="sr-only">Đang tải nội dung trang...</span>
    </div>
  );
};
