/**
 * Public Album Detail Query Hook
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Requirements:
 * - Fetches a single published album and its items using approved mediaService.getPublicAlbumBySlug API.
 * - TanStack Query cached with scoped queryKey ['media', 'public', 'album', slug].
 * - Enforces published-only visibility via service layer.
 * - Never calls Supabase directly.
 * - Never calls admin APIs.
 */

import { useQuery } from '@tanstack/react-query';
import { getPublicAlbumBySlug } from '../../../services/mediaService';
import type { AlbumWithItems } from '../../../types/media';

export function usePublicAlbumDetail(slug: string | null | undefined) {
  const cleanSlug = typeof slug === 'string' ? slug.trim() : '';
  const enabled = Boolean(cleanSlug);

  const query = useQuery<AlbumWithItems | null, Error>({
    queryKey: ['media', 'public', 'album', cleanSlug],
    queryFn: async () => {
      if (!cleanSlug) return null;
      return await getPublicAlbumBySlug(cleanSlug);
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    album: query.data ?? null,
    items: query.data?.items ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
