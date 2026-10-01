/**
 * SEO Settings Query Hook
 * School News Platform - Step 09.4C
 *
 * Connects UI to getSeoSettings service via TanStack Query.
 * Invariant:
 * - Query key: ['seo', 'settings']
 * - Single-row singleton (id = 'default')
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSeoSettings } from '../services/seoService';
import { SEO_QUERY_KEYS } from '../config/seoConfig';
import type { SeoSettings } from '../types/seo';

export interface UseSeoSettingsOptions {
  enabled?: boolean;
}

export function useSeoSettings(options: UseSeoSettingsOptions = {}) {
  const { enabled = true } = options;

  const query = useQuery<SeoSettings>({
    queryKey: SEO_QUERY_KEYS.settings(),
    queryFn: async () => {
      return await getSeoSettings();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    seoSettings: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
