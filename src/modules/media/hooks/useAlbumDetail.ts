/**
 * Album Detail Query Hook
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Retrieves an album's detail by ID using existing mediaService.getAdminAlbums.
 * Supports initialData if passed via route state for instant rendering.
 * Zero direct Supabase calls.
 */

import { useQuery } from '@tanstack/react-query';
import { getAdminAlbums } from '../../../services/mediaService';
import type { AlbumWithItems } from '../../../types/media';

export function useAlbumDetail(
  albumId: string | null | undefined,
  initialData?: AlbumWithItems | null
) {
  const enabled = Boolean(albumId);

  const query = useQuery<AlbumWithItems | null>({
    queryKey: ['albums', 'admin', 'detail', albumId],
    queryFn: async () => {
      if (!albumId) return null;
      // Use existing getAdminAlbums API to locate the album record
      const result = await getAdminAlbums({ pageSize: 100 });
      const found = result.items.find((item) => item.id === albumId);
      if (!found) {
        throw new Error('Không tìm thấy album được yêu cầu.');
      }
      return found;
    },
    enabled,
    initialData: initialData ?? undefined,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    album: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
