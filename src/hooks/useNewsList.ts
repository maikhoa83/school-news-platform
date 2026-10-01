/**
 * Hook for Public News Listing & Filtering
 * School News Platform - Step 05 News Module
 */

import { useState, useEffect, useCallback } from 'react';
import { NewsItem, NewsCategory, NewsFilterParams, NewsPaginationResult } from '../types/news';
import { getPublishedNews } from '../services/newsService';
import { getCategories } from '../services/categoryService';

export function useNewsList(initialParams: NewsFilterParams = {}) {
  const [params, setParams] = useState<NewsFilterParams>({
    page: 1,
    limit: 9,
    categorySlug: 'all',
    sort: 'latest',
    ...initialParams,
  });

  const [data, setData] = useState<NewsPaginationResult<NewsItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });

  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load active categories
  useEffect(() => {
    let mounted = true;
    getCategories().then((cats) => {
      if (mounted) setCategories(cats);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch news based on params
  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPublishedNews(params);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const setCategory = (categorySlug: string) => {
    setParams((prev) => ({ ...prev, categorySlug, page: 1 }));
  };

  const setSearchQuery = (searchQuery: string) => {
    setParams((prev) => ({ ...prev, searchQuery, page: 1 }));
  };

  const setSort = (sort: 'latest' | 'views' | 'oldest') => {
    setParams((prev) => ({ ...prev, sort, page: 1 }));
  };

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    items: data.items,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
    categories,
    params,
    isLoading,
    error,
    refetch: fetchNews,
    setCategory,
    setSearchQuery,
    setSort,
    setPage,
  };
}
