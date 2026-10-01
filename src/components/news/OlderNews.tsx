/**
 * Older News Component
 * Displays earlier published articles in the same category
 * School News Platform - Step 05 News Module
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronRight } from 'lucide-react';
import { NewsItem } from '../../types/news';

interface OlderNewsProps {
  items: NewsItem[];
}

export const OlderNews: React.FC<OlderNewsProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div id="older-news-section" className="my-8 pt-6 border-t border-neutral-200">
      <div className="flex items-center gap-2 mb-3 text-neutral-900 font-bold text-sm sm:text-base">
        <History className="w-4 h-4 text-neutral-500" />
        <span>Các tin đã đăng trước đó</span>
      </div>

      <ul className="divide-y divide-neutral-100 bg-white rounded-xl border border-neutral-200 p-2 sm:p-3 shadow-2xs">
        {items.map((item) => {
          const dateStr = item.published_at
            ? new Date(item.published_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '';

          return (
            <li key={item.id} className="py-2.5 px-2 hover:bg-neutral-50 rounded-lg transition-colors">
              <Link
                to={`/news/${item.slug}`}
                className="flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-neutral-700 hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-1">
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-600 shrink-0" />
                  <span className="line-clamp-1 font-medium text-neutral-800 group-hover:text-blue-600">
                    {item.title}
                  </span>
                </div>
                {dateStr && (
                  <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
                    ({dateStr})
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
