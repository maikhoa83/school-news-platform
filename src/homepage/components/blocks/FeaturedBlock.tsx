import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlockRenderProps } from '../../types';
import { DEMO_NEWS_ITEMS } from '../../services/starterDemoData';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { getPublishedNews } from '../../../services/newsService';
import { NewsItem } from '../../../types/news';

export function FeaturedBlock({ block, isPreview }: BlockRenderProps) {
  const { title = 'Tiêu điểm hoạt động', presentation } = block.config;
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    getPublishedNews({ limit: 1, isFeatured: true })
      .then((res) => {
        if (isMounted && res.items && res.items.length > 0) {
          setNewsItem(res.items[0]);
        }
      })
      .catch(() => {
        // Handled silently, fallback will be used
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const demoItem = DEMO_NEWS_ITEMS.find((n) => n.isFeatured) || DEMO_NEWS_ITEMS[0];

  const displayTitle = newsItem ? newsItem.title : demoItem.title;
  const displayImage = newsItem ? newsItem.thumbnail : demoItem.imageUrl;
  const displayCategory = newsItem?.category?.name || demoItem.category;
  const displayDate = newsItem?.published_at
    ? new Date(newsItem.published_at).toLocaleDateString('vi-VN')
    : demoItem.publishedAt;
  const displayExcerpt = newsItem?.excerpt || demoItem.excerpt;
  const detailLink = newsItem ? `/news/${newsItem.slug}` : '/news';

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
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Nổi bật
          </span>
        </div>
      )}

      <div className="group relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Cover Photo */}
        <div className="md:col-span-7 relative h-56 sm:h-72 md:h-full min-h-[220px] overflow-hidden bg-slate-100">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-sm">
              Chưa có hình ảnh
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="accent" className="font-semibold shadow-sm">
              {displayCategory}
            </Badge>
          </div>
        </div>

        {/* Text Content */}
        <div className="md:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {presentation?.showDate !== false && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <time>{displayDate}</time>
              </div>
            )}

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
              <Link to={isPreview ? '#' : detailLink}>{displayTitle}</Link>
            </h3>

            {presentation?.showExcerpt !== false && (
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {displayExcerpt}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Link to={isPreview ? '#' : detailLink}>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-blue-900 hover:text-blue-950 font-medium"
                disabled={isPreview}
              >
                <span>Đọc toàn bộ bài viết</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
