/**
 * Media Library Admin Query Hook
 * Connects Media Library UI to getAdminMediaList service via TanStack Query.
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 */

import { useQuery } from '@tanstack/react-query';
import { getAdminMediaList } from '../../../services/mediaService';
import type { MediaListParams, MediaPaginationResult, MediaWithFolder } from '../../../types/media';

export function useMediaLibrary(params: MediaListParams = {}) {
  const query = useQuery<MediaPaginationResult<MediaWithFolder>>({
    queryKey: ['media', 'admin', params],
    queryFn: async () => {
      const res = await getAdminMediaList(params);
      return res;
    },
    staleTime: 30 * 1000, // 30 seconds fresh window for active CMS management
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    items: query.data?.items || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    pageSize: query.data?.pageSize || 20,
    totalPages: query.data?.totalPages || 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
