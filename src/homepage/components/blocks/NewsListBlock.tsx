import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlockRenderProps } from '../../types';
import { DEMO_NEWS_ITEMS } from '../../services/starterDemoData';
import { getPublishedNews } from '../../../services/newsService';
import { NewsItem } from '../../../types/news';

export function NewsListBlock({ block, isPreview }: BlockRenderProps) {
  const { title = 'Tin tức & Phong trào thi đua', presentation } = block.config;
  const maxItems = presentation?.maxItems || 5;

  const [realItems, setRealItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    getPublishedNews({ limit: maxItems })
      .then((res) => {
        if (isMounted && res.items && res.items.length > 0) {
          setRealItems(res.items);
        }
      })
      .catch(() => {
        // Silent fallback
      });
    return () => {
      isMounted = false;
    };
  }, [maxItems]);

  const items = realItems.length > 0
    ? realItems.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        category: item.category?.name || 'Tin tức',
        publishedAt: item.published_at ? new Date(item.published_at).toLocaleDateString('vi-VN') : '',
        excerpt: item.excerpt || '',
      }))
    : DEMO_NEWS_ITEMS.slice(0, maxItems).map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.id,
        category: d.category,
        publishedAt: d.publishedAt,
        excerpt: d.excerpt,
      }));

  return (
    <section aria-label={title} className="space-y-3">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-800 rounded-full" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
              {title}
            </h2>
          </div>
          <span className="text-xs text-slate-400">Mới cập nhật</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {items.map((item) => (
          <Link
            key={item.id}
            to={isPreview ? '#' : `/news/${item.slug}`}
            className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 group cursor-pointer block"
          >
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-700 shrink-0 group-hover:scale-125 transition-transform" />

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors">
                {item.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                  <Tag className="h-3 w-3" />
                  {item.category}
                </span>

                {presentation?.showDate !== false && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <time>{item.publishedAt}</time>
                  </span>
                )}
              </div>

              {presentation?.showExcerpt && (
                <p className="text-xs text-slate-500 line-clamp-1 pt-0.5">
                  {item.excerpt}
                </p>
              )}
            </div>

            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-800 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
