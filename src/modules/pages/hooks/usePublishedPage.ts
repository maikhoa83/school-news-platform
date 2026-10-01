/**
 * Public Page Query Hook
 * Connects Public UI to getPublishedPageBySlug service via TanStack Query.
 * School News Platform - Step 09.4A
 */

import { useQuery } from '@tanstack/react-query';
import { getPublishedPageBySlug } from '../services/pageService';
import type { PageWithRelations } from '../types/page';
import { SLUG_REGEX } from '../schemas/pageSchema';

export function usePublishedPage(slug?: string) {
  const isValidSlug = Boolean(slug && typeof slug === 'string' && SLUG_REGEX.test(slug));

  const query = useQuery<PageWithRelations | null>({
    queryKey: ['pages', 'published', slug],
    queryFn: async () => {
      if (!slug) return null;
      return await getPublishedPageBySlug(slug);
    },
    enabled: isValidSlug,
    staleTime: 5 * 60 * 1000, // Cache public pages for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    page: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
