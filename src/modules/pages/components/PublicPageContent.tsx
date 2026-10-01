/**
 * Public Page Content Component
 * Sanitized rich-text body presentation adhering to strict XSS prevention
 * School News Platform - Step 09.6A
 */

import React, { useMemo } from 'react';
import { sanitizeHtml } from '../../../lib/sanitize';

interface PublicPageContentProps {
  content: string;
}

export const PublicPageContent: React.FC<PublicPageContentProps> = ({ content }) => {
  const sanitizedContent = useMemo(() => {
    return sanitizeHtml(content);
  }, [content]);

  if (!sanitizedContent || sanitizedContent.trim().length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm italic">
        Nội dung trang đang được cập nhật...
      </div>
    );
  }

  return (
    <article
      id="public-page-body"
      className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed break-words prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight prose-a:text-blue-700 prose-a:underline hover:prose-a:text-blue-900 prose-img:rounded-xl prose-img:shadow-2xs prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-slate-100"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
