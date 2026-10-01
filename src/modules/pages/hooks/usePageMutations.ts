/**
 * Pages Mutations Hook
 * School News Platform - Step 09.4A
 *
 * Provides:
 * - createPageMutation: calls createPage(input)
 * - updatePageMutation: calls updatePage(id, input)
 * - deletePageMutation: calls deletePage(id)
 * - Targeted TanStack Query cache invalidation
 * - Zero direct Supabase access
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPage, updatePage, deletePage } from '../services/pageService';
import type { Page, PageCreateInput, PageUpdateInput } from '../types/page';

/**
 * Hook for creating a page
 */
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation<Page, Error, PageCreateInput>({
    mutationFn: async (payload: PageCreateInput) => {
      return await createPage(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

/**
 * Hook for updating an existing page
 */
export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation<Page, Error, { id: string; input: PageUpdateInput }>({
    mutationFn: async ({ id, input }) => {
      return await updatePage(id, input);
    },
    onSuccess: (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['pages', 'detail', updatedPage.id] });
      queryClient.invalidateQueries({ queryKey: ['pages', 'published'] });
    },
  });
}

/**
 * Hook for deleting a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await deletePage(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.removeQueries({ queryKey: ['pages', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['pages', 'published'] });
    },
  });
}

/**
 * Unified mutations bundle hook for pages management
 */
export function usePageMutations() {
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();
  const deleteMutation = useDeletePage();

  return {
    createPage: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updatePage: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deletePage: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
