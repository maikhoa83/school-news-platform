/**
 * Menu Items List Query Hook
 * Connects UI to listMenuItems service via TanStack Query.
 * School News Platform - Step 09.4B
 */

import { useQuery } from '@tanstack/react-query';
import { listMenuItems } from '../services/menuService';
import type { MenuItemWithRelations, MenuItemListParams } from '../types/menu';

export function useMenuItems(params: MenuItemListParams = {}) {
  const query = useQuery<MenuItemWithRelations[]>({
    queryKey: ['menu-items', params],
    queryFn: async () => {
      return await listMenuItems(params);
    },
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
