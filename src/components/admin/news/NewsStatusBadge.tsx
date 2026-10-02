/**
 * News Status Badge Component
 * School News Platform - Step 05 News Module
 */

import React from 'react';
import { NewsStatus } from '../../../types/news';

interface NewsStatusBadgeProps {
  status: NewsStatus;
}

export const NewsStatusBadge: React.FC<NewsStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          ● Đã xuất bản
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          ● Chờ duyệt
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
          ● Bản nháp
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          ● Đã lưu trữ
        </span>
      );
    default:
      return null;
  }
};
