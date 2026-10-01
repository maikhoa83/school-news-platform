/**
 * Admin Albums Query Hook
 * Connects Albums CMS foundation UI to getAdminAlbums service via TanStack Query.
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album
 */

import { useQuery } from '@tanstack/react-query';
import { getAdminAlbums } from '../../../services/mediaService';
import type { AlbumListParams, AlbumWithItems, MediaPaginationResult } from '../../../types/media';

export function useAdminAlbumsList(params: AlbumListParams = {}) {
  const query = useQuery<MediaPaginationResult<AlbumWithItems>>({
    queryKey: ['albums', 'admin', params],
    queryFn: async () => {
      const res = await getAdminAlbums(params);
      return res;
    },
    staleTime: 60 * 1000,
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
