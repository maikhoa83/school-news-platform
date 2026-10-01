/**
 * Album Items Query & Mutations Hook
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Provides:
 * - Query items in an album ordered by sort_order ASC
 * - Add media item to album (addMediaToAlbum)
 * - Remove media item from album (removeMediaFromAlbum)
 * - Reorder album items (reorderAlbumItems)
 * - Targeted cache invalidation of ['album-items', albumId]
 * - Zero direct Supabase calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAlbumItems,
  addMediaToAlbum,
  removeMediaFromAlbum,
  reorderAlbumItems,
} from '../../../services/mediaService';
import type { AlbumMediaItem } from '../../../types/media';

export function useAlbumItems(albumId: string | null | undefined) {
  const queryClient = useQueryClient();
  const enabled = Boolean(albumId);

  const query = useQuery<AlbumMediaItem[]>({
    queryKey: ['album-items', albumId],
    queryFn: async () => {
      if (!albumId) return [];
      return await getAlbumItems(albumId);
    },
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const addMediaMutation = useMutation<
    AlbumMediaItem,
    Error,
    { mediaId: string; caption?: string | null }
  >({
    mutationFn: async ({ mediaId, caption }) => {
      if (!albumId) throw new Error('Mã album không hợp lệ.');
      return await addMediaToAlbum(albumId, mediaId, caption);
    },
    onSuccess: () => {
      if (albumId) {
        queryClient.invalidateQueries({ queryKey: ['album-items', albumId] });
        queryClient.invalidateQueries({ queryKey: ['albums', 'admin'] });
      }
    },
  });

  const removeMediaMutation = useMutation<void, Error, string>({
    mutationFn: async (mediaId: string) => {
      if (!albumId) throw new Error('Mã album không hợp lệ.');
      await removeMediaFromAlbum(albumId, mediaId);
    },
    onSuccess: () => {
      if (albumId) {
        queryClient.invalidateQueries({ queryKey: ['album-items', albumId] });
        queryClient.invalidateQueries({ queryKey: ['albums', 'admin'] });
      }
    },
  });

  const reorderMutation = useMutation<void, Error, string[]>({
    mutationFn: async (orderedItemIds: string[]) => {
      if (!albumId) throw new Error('Mã album không hợp lệ.');
      await reorderAlbumItems(albumId, orderedItemIds);
    },
    onSuccess: () => {
      if (albumId) {
        queryClient.invalidateQueries({ queryKey: ['album-items', albumId] });
      }
    },
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    addMedia: addMediaMutation.mutateAsync,
    isAdding: addMediaMutation.isPending,
    addError: addMediaMutation.error,

    removeMedia: removeMediaMutation.mutateAsync,
    isRemoving: removeMediaMutation.isPending,
    removeError: removeMediaMutation.error,

    reorderItems: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
    reorderError: reorderMutation.error,
  };
}
