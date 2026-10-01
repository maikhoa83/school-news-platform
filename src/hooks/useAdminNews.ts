/**
 * Hook for Admin News Management
 * School News Platform - Step 05 News Module
 */

import { useState, useEffect, useCallback } from 'react';
import { NewsItem, NewsStatus, NewsPaginationResult } from '../types/news';
import {
  getAdminNewsList,
  submitNews,
  publishNews,
  archiveNews,
  deleteNews,
} from '../services/newsService';

export function useAdminNews() {
  const [statusFilter, setStatusFilter] = useState<NewsStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [data, setData] = useState<NewsPaginationResult<NewsItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminNewsList({
        status: statusFilter === 'all' ? undefined : statusFilter,
        searchQuery: searchQuery.trim() || undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, page, limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSubmit = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setActionLoadingId(id);
    try {
      const res = await submitNews(id);
      if (res.success) {
        await fetchNews();
      }
      return res;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublish = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setActionLoadingId(id);
    try {
      const res = await publishNews(id);
      if (res.success) {
        await fetchNews();
      }
      return res;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setActionLoadingId(id);
    try {
      const res = await archiveNews(id);
      if (res.success) {
        await fetchNews();
      }
      return res;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setActionLoadingId(id);
    try {
      const res = await deleteNews(id);
      if (res.success) {
        await fetchNews();
      }
      return res;
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    items: data.items,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
    statusFilter,
    setStatusFilter: (s: NewsStatus | 'all') => {
      setStatusFilter(s);
      setPage(1);
    },
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q);
      setPage(1);
    },
    setPage,
    isLoading,
    actionLoadingId,
    error,
    refetch: fetchNews,
    submitNews: handleSubmit,
    publishNews: handlePublish,
    archiveNews: handleArchive,
    deleteNews: handleDelete,
  };
}
