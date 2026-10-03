import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { NewsItem } from '../../types/news';
import { getPublishedNews } from '../../services/newsService';
import { INITIAL_PUBLISHED_NEWS } from '../../data/seedNewsData';

export function NewsImageSlider() {
  const [newsSlides, setNewsSlides] = useState<NewsItem[]>(() => {
    return INITIAL_PUBLISHED_NEWS.filter((n) => n.is_featured || n.is_highlight).slice(0, 5);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getPublishedNews({ limit: 10 })
      .then((res) => {
        if (isMounted && res.items && res.items.length > 0) {
          const featured = res.items.filter((n) => n.is_featured || n.is_highlight);
          if (featured.length > 0) {
            setNewsSlides(featured.slice(0, 5));
          } else {
            setNewsSlides(res.items.slice(0, 5));
          }
        }
      })
      .catch((err) => {
        console.warn('[NewsImageSlider] Falling back to initial news:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-play every 5 seconds unless hovered
  useEffect(() => {
    if (newsSlides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [newsSlides.length, isPaused]);

  if (!newsSlides || newsSlides.length === 0) return null;

  const currentItem = newsSlides[currentIndex % newsSlides.length];
  const categoryName = currentItem.category?.name || 'Tin tức nhà trường';
  const formattedDate = currentItem.published_at
    ? new Date(currentItem.published_at).toLocaleDateString('vi-VN')
    : '28/05/2025';

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200 group h-[280px] sm:h-[360px] md:h-[420px] lg:h-[450px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background News Image with Zoom Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          key={currentItem.id}
          src={currentItem.thumbnail || '/campus_facade.jpg'}
          alt={currentItem.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/campus_facade.jpg';
          }}
          className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Layered Gradient Overlays for readable text & visual contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent hidden sm:block" />
      </div>

      {/* Slide Content Box */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-10 max-w-3xl z-10 space-y-2 sm:space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0052CC] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{categoryName}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs text-slate-200 text-[11px] sm:text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* Title */}
        <Link to={`/news/${currentItem.slug}`} className="block group/link">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-tight line-clamp-2 drop-shadow-md group-hover/link:text-amber-300 transition-colors">
            {currentItem.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {currentItem.excerpt && (
          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow-sm hidden sm:block">
            {currentItem.excerpt}
          </p>
        )}

        {/* Action Button */}
        <div className="pt-1">
          <Link
            to={`/news/${currentItem.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-blue-700 to-[#003B8E] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <span>Xem chi tiết bài viết</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {newsSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? newsSlides.length - 1 : prev - 1))
            }
            aria-label="Tin trước"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-xs z-20 cursor-pointer shadow-md opacity-80 hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % newsSlides.length)}
            aria-label="Tin kế tiếp"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-xs z-20 cursor-pointer shadow-md opacity-80 hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dotted Indicators with Slide Count */}
          <div className="absolute bottom-3 right-4 sm:bottom-6 sm:right-8 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {newsSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Chuyển đến slide tin ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
