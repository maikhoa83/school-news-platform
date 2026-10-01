/**
 * Album Mutations Hook
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Provides:
 * - createAlbumMutation: calls createAlbum(data)
 * - updateAlbumMutation: calls updateAlbum(id, data)
 * - deleteAlbumMutation: calls deleteAlbum(id)
 * - Targeted TanStack Query cache invalidation
 * - Friendly error handling
 * - Zero direct Supabase calls
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from '../../../services/mediaService';
import type {
  CreateAlbumInput,
  UpdateAlbumInput,
  Album,
} from '../../../types/media';

export function useAlbumMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation<Album, Error, CreateAlbumInput>({
    mutationFn: async (payload: CreateAlbumInput) => {
      return await createAlbum(payload);
    },
    onSuccess: () => {
      // Invalidate admin albums list queries
      queryClient.invalidateQueries({ queryKey: ['albums', 'admin'] });
      // Invalidate public albums queries
      queryClient.invalidateQueries({ queryKey: ['albums', 'public'] });
    },
  });

  const updateMutation = useMutation<Album, Error, { id: string; data: UpdateAlbumInput }>({
    mutationFn: async ({ id, data }) => {
      return await updateAlbum(id, data);
    },
    onSuccess: (updatedAlbum) => {
      // Invalidate admin albums list and specific album queries
      queryClient.invalidateQueries({ queryKey: ['albums', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['albums', 'admin', 'detail', updatedAlbum.id] });
      queryClient.invalidateQueries({ queryKey: ['albums', 'public'] });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await deleteAlbum(id);
    },
    onSuccess: () => {
      // Invalidate admin albums list queries
      queryClient.invalidateQueries({ queryKey: ['albums', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['albums', 'public'] });
    },
  });

  return {
    createAlbum: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateAlbum: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteAlbum: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
