/**
 * React Hook for Fetching Public Announcements
 * School News Platform - Step 07 Thông báo điều hành
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AnnouncementItem,
  AnnouncementFilterParams,
  AnnouncementPaginationResult,
} from '../types/announcement';
import { getPublicAnnouncements } from '../services/announcementService';

export function usePublicAnnouncements(initialParams: AnnouncementFilterParams = {}) {
  const [params, setParams] = useState<AnnouncementFilterParams>(initialParams);
  const [data, setData] = useState<AnnouncementPaginationResult<AnnouncementItem>>({
    items: [],
    total: 0,
    page: 1,
    limit: initialParams.limit || 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPublicAnnouncements(params);
      setData(res);
    } catch (err) {
      console.warn('[usePublicAnnouncements] Notice fetching:', err);
      setError('Không thể tải danh sách thông báo');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    ...data,
    isLoading,
    error,
    params,
    setParams,
    refetch: fetchAnnouncements,
  };
}
