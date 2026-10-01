/**
 * Related News Component (1–4 Articles)
 * School News Platform - Step 05 News Module
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Layers } from 'lucide-react';
import { NewsItem } from '../../types/news';

interface RelatedNewsProps {
  items: NewsItem[];
}

export const RelatedNews: React.FC<RelatedNewsProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Display between 1 and 4 items
  const displayItems = items.slice(0, 4);

  return (
    <div id="related-news-section" className="my-8 pt-6 border-t border-neutral-200">
      <div className="flex items-center gap-2 mb-4 text-neutral-900 font-bold text-base sm:text-lg">
        <Layers className="w-5 h-5 text-blue-600" />
        <span>Tin tức liên quan</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayItems.map((item) => {
          const dateStr = item.published_at
            ? new Date(item.published_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '';

          return (
            <article
              key={item.id}
              className="group flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-sm hover:border-neutral-300 transition-all"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <img
                  src={
                    item.thumbnail ||
                    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  {dateStr && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-1.5">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span>{dateStr}</span>
                    </div>
                  )}

                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    <Link to={`/news/${item.slug}`}>{item.title}</Link>
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-neutral-100 text-right">
                  <Link
                    to={`/news/${item.slug}`}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Xem →
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
