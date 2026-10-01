/**
 * Public News Card Component
 * School News Platform - Step 05 News Module
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, User } from 'lucide-react';
import { NewsItem } from '../../types/news';

interface NewsCardProps {
  news: NewsItem;
  featured?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, featured = false }) => {
  const formattedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  const fallbackImage =
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80';

  if (featured) {
    return (
      <article
        id={`news-card-${news.id}`}
        className="group relative grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden bg-neutral-100">
          <img
            src={news.thumbnail || fallbackImage}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {news.category && (
            <Link
              to={`/news?category=${news.category.slug}`}
              className="absolute top-4 left-4 z-10 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm hover:bg-blue-700 transition-colors"
            >
              {news.category.name}
            </Link>
          )}
        </div>

        <div className="lg:col-span-5 p-6 lg:py-8 lg:pr-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {formattedDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                {news.view_count.toLocaleString('vi-VN')} lượt xem
              </span>
            </div>

            <h3 className="text-xl lg:text-2xl font-bold text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3 mb-3">
              <Link to={`/news/${news.slug}`}>{news.title}</Link>
            </h3>

            {news.excerpt && (
              <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-4">
                {news.excerpt}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
              <User className="w-4 h-4 text-neutral-400" />
              <span>{news.author?.full_name || 'Ban Biên tập'}</span>
            </div>
            <Link
              to={`/news/${news.slug}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Đọc chi tiết →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={`news-card-${news.id}`}
      className="group flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        <img
          src={news.thumbnail || fallbackImage}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {news.category && (
          <Link
            to={`/news?category=${news.category.slug}`}
            className="absolute top-3 left-3 z-10 px-2.5 py-0.5 bg-blue-600 text-white text-[11px] font-semibold rounded-full shadow-sm hover:bg-blue-700 transition-colors"
          >
            {news.category.name}
          </Link>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-500 mb-2">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              {news.view_count.toLocaleString('vi-VN')}
            </span>
          </div>

          <h3 className="text-base font-bold text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            <Link to={`/news/${news.slug}`}>{news.title}</Link>
          </h3>

          {news.excerpt && (
            <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-4">
              {news.excerpt}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate max-w-[150px]">
            {news.author?.full_name || 'Ban Biên tập'}
          </span>
          <Link
            to={`/news/${news.slug}`}
            className="font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            Xem thêm →
          </Link>
        </div>
      </div>
    </article>
  );
};
