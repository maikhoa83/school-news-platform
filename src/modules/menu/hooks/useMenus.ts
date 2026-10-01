/**
 * Menus List Query Hook
 * Connects UI to listMenus service via TanStack Query.
 * School News Platform - Step 09.4B
 */

import { useQuery } from '@tanstack/react-query';
import { listMenus } from '../services/menuService';
import type { Menu, MenuListParams } from '../types/menu';

export function useMenus(params: MenuListParams = {}) {
  const query = useQuery<Menu[]>({
    queryKey: ['menus', params],
    queryFn: async () => {
      return await listMenus(params);
    },
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    menus: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
