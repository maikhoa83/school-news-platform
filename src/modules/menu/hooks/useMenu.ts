/**
 * Menu Detail Query Hook
 * Connects UI to getMenuById service via TanStack Query.
 * School News Platform - Step 09.4B
 */

import { useQuery } from '@tanstack/react-query';
import { getMenuById } from '../services/menuService';
import type { Menu } from '../types/menu';
import { UUID_REGEX } from '../schemas/menuSchema';

export function useMenu(id?: string) {
  const isValidId = Boolean(id && typeof id === 'string' && UUID_REGEX.test(id));

  const query = useQuery<Menu | null>({
    queryKey: ['menus', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      return await getMenuById(id);
    },
    enabled: isValidId,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    menu: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
