/**
 * Public News Listing Page
 * School News Platform - Step 05 News Module
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { useNewsList } from '../../hooks/useNewsList';
import { NewsCard } from '../../components/news/NewsCard';
import { NewsFilters } from '../../components/news/NewsFilters';
import { NewsPagination } from '../../components/news/NewsPagination';

export const NewsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const {
    items,
    total,
    page,
    totalPages,
    categories,
    params,
    isLoading,
    error,
    setCategory,
    setSearchQuery,
    setSort,
    setPage,
  } = useNewsList({
    categorySlug: categoryParam,
    limit: 9,
  });

  // Sync category param from URL
  useEffect(() => {
    if (categoryParam !== params.categorySlug) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleSelectCategory = (slug: string) => {
    setCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const featuredArticle = page === 1 && params.categorySlug === 'all' && !params.searchQuery && items.length > 0
    ? items[0]
    : null;

  const remainingArticles = featuredArticle ? items.slice(1) : items;

  return (
    <div id="news-list-page" className="min-h-screen bg-neutral-50/50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Bản tin trường học</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Tin tức & Sự kiện
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-3xl">
            Cập nhật thường xuyên các hoạt động giáo dục, phong trào thi đua, thành tích và thông báo chính thức của nhà trường.
          </p>
        </div>

        {/* Filters */}
        <NewsFilters
          categories={categories}
          activeCategory={params.categorySlug || 'all'}
          onSelectCategory={handleSelectCategory}
          searchQuery={params.searchQuery || ''}
          onSearchChange={setSearchQuery}
          sort={params.sort || 'latest'}
          onSortChange={setSort}
        />

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="aspect-[16/10] bg-neutral-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-5 bg-neutral-200 rounded w-full" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-neutral-300">
            <Newspaper className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-neutral-800">Không tìm thấy bài viết nào</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Hero Article */}
            {featuredArticle && <NewsCard news={featuredArticle} featured />}

            {/* Standard Grid */}
            {remainingArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingArticles.map((article) => (
                  <NewsCard key={article.id} news={article} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <NewsPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
