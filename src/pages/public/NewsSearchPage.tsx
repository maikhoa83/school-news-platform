/**
 * Public News Search Page
 * Dedicated Server-Side Full-Text Search
 * School News Platform - Step 05 News Module
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ChevronRight, Newspaper, Calendar, Eye } from 'lucide-react';
import { searchNews } from '../../services/newsService';
import { NewsItem } from '../../types/news';
import { NewsPagination } from '../../components/news/NewsPagination';

export const NewsSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function executeSearch() {
      if (!initialQuery.trim() && !initialTag) {
        setResults([]);
        setTotal(0);
        return;
      }

      setIsLoading(true);
      try {
        const res = await searchNews(
          initialQuery,
          undefined,
          initialTag || undefined,
          page,
          12
        );
        setResults(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } finally {
        setIsLoading(false);
      }
    }

    executeSearch();
  }, [initialQuery, initialTag, page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchParams.set('q', query.trim());
      searchParams.delete('tag');
      setSearchParams(searchParams);
      setPage(1);
    }
  };

  return (
    <div id="news-search-page" className="min-h-screen bg-neutral-50/50 py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-neutral-800">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link to="/news" className="hover:text-neutral-800">
            Tin tức
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-800 font-medium">Tìm kiếm</span>
        </nav>

        {/* Search header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Tìm kiếm bài viết
          </h1>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm (tiêu đề, nội dung, sự kiện...)"
                className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
            >
              Tìm kiếm
            </button>
          </form>

          {initialTag && (
            <p className="mt-3 text-xs text-neutral-600">
              Đang lọc theo thẻ tag: <strong className="text-blue-600">#{initialTag}</strong>
            </p>
          )}

          {(initialQuery || initialTag) && !isLoading && (
            <p className="mt-3 text-xs text-neutral-500">
              Tìm thấy <strong>{total}</strong> kết quả phù hợp
            </p>
          )}
        </div>

        {/* Search results list */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-neutral-200 h-24" />
            ))}
          </div>
        ) : results.length === 0 ? (
          (initialQuery || initialTag) && (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-neutral-300">
              <Newspaper className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-neutral-800">
                Không tìm thấy bài viết nào phù hợp
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Hãy thử kiểm tra lại chính tả hoặc sử dụng các từ khóa rộng hơn.
              </p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {results.map((item) => {
              const formattedDate = item.published_at
                ? new Date(item.published_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '';

              return (
                <article
                  key={item.id}
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row gap-4"
                >
                  {item.thumbnail && (
                    <div className="sm:w-44 aspect-[16/10] sm:aspect-square rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 mb-1.5">
                        {formattedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {item.view_count} lượt xem
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        <Link to={`/news/${item.slug}`}>{item.title}</Link>
                      </h3>

                      {item.excerpt && (
                        <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 text-right">
                      <Link
                        to={`/news/${item.slug}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Đọc chi tiết →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}

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
