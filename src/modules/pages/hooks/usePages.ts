/**
 * Pages List Query Hook
 * Connects UI to listPages service via TanStack Query.
 * School News Platform - Step 09.4A
 */

import { useQuery } from '@tanstack/react-query';
import { listPages } from '../services/pageService';
import type { PageListParams, PagePaginationResult, PageWithRelations } from '../types/page';

export function usePages(params: PageListParams = {}) {
  const query = useQuery<PagePaginationResult<PageWithRelations>>({
    queryKey: ['pages', params],
    queryFn: async () => {
      const res = await listPages(params);
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
    limit: query.data?.limit || 20,
    totalPages: query.data?.totalPages || 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
