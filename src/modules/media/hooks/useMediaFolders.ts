/**
 * Media Folders Query Hook
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 */

import { useQuery } from '@tanstack/react-query';
import { getMediaFolders } from '../../../services/mediaService';
import type { MediaFolderWithCount } from '../../../types/media';

export function useMediaFolders() {
  const query = useQuery<MediaFolderWithCount[]>({
    queryKey: ['media', 'folders'],
    queryFn: async () => {
      const res = await getMediaFolders();
      return res || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    folders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
