/**
 * Page Detail Query Hook
 * Connects UI to getPageById service via TanStack Query.
 * School News Platform - Step 09.4A
 */

import { useQuery } from '@tanstack/react-query';
import { getPageById } from '../services/pageService';
import type { PageWithRelations } from '../types/page';
import { UUID_REGEX } from '../schemas/pageSchema';

export function usePage(id?: string) {
  const isValidId = Boolean(id && typeof id === 'string' && UUID_REGEX.test(id));

  const query = useQuery<PageWithRelations | null>({
    queryKey: ['pages', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      return await getPageById(id);
    },
    enabled: isValidId,
    staleTime: 60 * 1000,
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
