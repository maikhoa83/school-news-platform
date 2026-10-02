/**
 * Media Signed URL Hook
 * Fetches and caches temporary signed URLs for private media bucket.
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 *
 * Security:
 * - Bucket 'media' is PRIVATE.
 * - All previews require valid Signed URLs.
 * - URLs are cached in-memory via TanStack Query (50 minutes).
 * - Never logged to console, never stored in localStorage.
 */

import { useQuery } from '@tanstack/react-query';
import { createMediaSignedUrl } from '../../../lib/mediaStorage';

export function useSignedUrl(filePath: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['media', 'signed-url', filePath],
    queryFn: async () => {
      if (!filePath) return null;
      const res = await createMediaSignedUrl(filePath, 3600);
      return res.signedUrl;
    },
    enabled: Boolean(enabled && filePath),
    staleTime: 50 * 60 * 1000, // 50 minutes (signed URL valid for 60 mins)
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
