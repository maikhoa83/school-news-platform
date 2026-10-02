/**
 * Menu Tree Query Hook
 * Connects UI to getMenuTree service via TanStack Query.
 * School News Platform - Step 09.4B
 */

import { useQuery } from '@tanstack/react-query';
import { getMenuTree } from '../services/menuService';
import type { MenuItemTree } from '../types/menu';
import { UUID_REGEX } from '../schemas/menuSchema';

export function useMenuTree(menuId?: string) {
  const isValidMenuId = Boolean(menuId && typeof menuId === 'string' && UUID_REGEX.test(menuId));

  const query = useQuery<MenuItemTree[]>({
    queryKey: ['menu-items', 'tree', menuId],
    queryFn: async () => {
      if (!menuId) return [];
      return await getMenuTree(menuId);
    },
    enabled: isValidMenuId,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    tree: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
