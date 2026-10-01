import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlockRenderProps } from '../../types';
import { DEMO_NEWS_ITEMS } from '../../services/starterDemoData';
import { Badge } from '../../../components/ui/Badge';
import { getPublishedNews } from '../../../services/newsService';
import { NewsItem } from '../../../types/news';

export function NewsGridBlock({ block, isPreview }: BlockRenderProps) {
  const { title = 'Tin tức & Hoạt động nổi bật', presentation } = block.config;
  const columns = presentation?.columns || 2;
  const maxItems = presentation?.maxItems || 4;

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

  // Use real items if available, else DEMO_NEWS_ITEMS
  const items = realItems.length > 0
    ? realItems.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        category: item.category?.name || 'Tin tức',
        publishedAt: item.published_at ? new Date(item.published_at).toLocaleDateString('vi-VN') : '',
        excerpt: item.excerpt || '',
        imageUrl: item.thumbnail || undefined,
      }))
    : DEMO_NEWS_ITEMS.slice(1, 1 + maxItems).map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.id,
        category: d.category,
        publishedAt: d.publishedAt,
        excerpt: d.excerpt,
        imageUrl: d.imageUrl,
      }));

  const gridColsClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2';

  return (
    <section aria-label={title} className="space-y-4">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-800 rounded-full" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            to="/news"
            onClick={(e) => isPreview && e.preventDefault()}
            className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1 group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
          Chưa có bài viết nào trong chuyên mục này.
        </div>
      ) : (
        <div className={`grid ${gridColsClass} gap-4 sm:gap-5`}>
          {items.map((item) => (
            <article
              key={item.id}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              {presentation?.showThumbnail !== false && item.imageUrl && (
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="primary" className="text-[10px] shadow-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div className="space-y-2">
                  {presentation?.showDate !== false && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <time>{item.publishedAt}</time>
                    </div>
                  )}

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                    <Link to={isPreview ? '#' : `/news/${item.slug}`}>{item.title}</Link>
                  </h3>

                  {presentation?.showExcerpt !== false && item.excerpt && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-2 text-xs font-semibold text-blue-800 flex items-center gap-1">
                  <Link
                    to={isPreview ? '#' : `/news/${item.slug}`}
                    className="inline-flex items-center gap-1 hover:text-blue-950"
                  >
                    <span>Chi tiết</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
