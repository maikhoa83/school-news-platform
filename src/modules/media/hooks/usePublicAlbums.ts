/**
 * Public Albums List Query Hook
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Requirements:
 * - Fetches published albums using approved mediaService.getPublicAlbums API.
 * - TanStack Query cached with scoped queryKey ['media', 'public', 'albums', page, pageSize].
 * - Never calls Supabase directly.
 * - Never calls admin APIs.
 */

import { useQuery } from '@tanstack/react-query';
import { getPublicAlbums } from '../../../services/mediaService';
import type { AlbumWithItems, MediaPaginationResult } from '../../../types/media';

export interface UsePublicAlbumsParams {
  page?: number;
  pageSize?: number;
}

export function usePublicAlbums(params: UsePublicAlbumsParams = {}) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 12));

  const query = useQuery<MediaPaginationResult<AlbumWithItems>, Error>({
    queryKey: ['media', 'public', 'albums', { page, pageSize }],
    queryFn: async () => {
      return await getPublicAlbums({ page, pageSize });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes stale time for public listing
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    albums: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
