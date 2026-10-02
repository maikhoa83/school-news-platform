/**
 * Public Page Breadcrumb Component
 * Semantic breadcrumb navigation for static pages: Home -> Parent (if exists) -> Current Page
 * School News Platform - Step 09.6A
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, BookOpen } from 'lucide-react';
import type { PageWithRelations } from '../types/page';

interface PublicPageBreadcrumbProps {
  page: PageWithRelations;
}

export const PublicPageBreadcrumb: React.FC<PublicPageBreadcrumbProps> = ({ page }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 hover:text-blue-700 transition-colors py-1"
        title="Trang chủ"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

      {/* Optional Parent Page Context */}
      {page.parent && (
        <>
          <Link
            to={`/page/${page.parent.slug}`}
            className="hover:text-blue-700 transition-colors py-1 max-w-[200px] truncate"
            title={page.parent.title}
          >
            {page.parent.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </>
      )}

      {/* Current Page Title */}
      <span
        className="text-slate-800 font-medium max-w-[280px] sm:max-w-md truncate py-1"
        aria-current="page"
        title={page.title}
      >
        {page.title}
      </span>
    </nav>
  );
};
