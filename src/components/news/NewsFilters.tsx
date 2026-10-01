/**
 * News Filters Component
 * School News Platform - Step 05 News Module
 */

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { NewsCategory } from '../../types/news';

interface NewsFiltersProps {
  categories: NewsCategory[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sort: 'latest' | 'views' | 'oldest';
  onSortChange: (sort: 'latest' | 'views' | 'oldest') => void;
}

export const NewsFilters: React.FC<NewsFiltersProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
}) => {
  return (
    <div id="news-filters" className="space-y-4 mb-8">
      {/* Top bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="news-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài viết, sự kiện, thông báo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
          <select
            id="news-sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as 'latest' | 'views' | 'oldest')}
            aria-label="Sắp xếp bài viết"
            className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="latest">Mới nhất</option>
            <option value="views">Xem nhiều nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Category Tabs / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Tất cả tin tức
        </button>

        {categories.map((cat) => (
          <React.Fragment key={cat.id}>
            <button
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {cat.name}
            </button>

            {/* Subcategories */}
            {cat.children &&
              cat.children.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectCategory(sub.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === sub.slug
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                      : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  ↳ {sub.name}
                </button>
              ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
