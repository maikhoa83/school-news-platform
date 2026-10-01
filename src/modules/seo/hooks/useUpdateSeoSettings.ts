/**
 * SEO Settings Mutation Hook
 * School News Platform - Step 09.4C
 *
 * Connects UI to updateSeoSettings service via TanStack Query.
 * Invariant:
 * - Scoped cache invalidation on ['seo']
 * - Zero direct database/Supabase access
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSeoSettings } from '../services/seoService';
import { SEO_QUERY_KEYS } from '../config/seoConfig';
import type { SeoSettings, SeoSettingsUpdateInput } from '../types/seo';

export function useUpdateSeoSettings() {
  const queryClient = useQueryClient();

  return useMutation<SeoSettings, Error, SeoSettingsUpdateInput>({
    mutationFn: async (payload: SeoSettingsUpdateInput) => {
      return await updateSeoSettings(payload);
    },
    onSuccess: (updatedSettings) => {
      // Invalidate and update the cached SEO settings immediately
      queryClient.setQueryData(SEO_QUERY_KEYS.settings(), updatedSettings);
      queryClient.invalidateQueries({ queryKey: SEO_QUERY_KEYS.all });
    },
  });
}
