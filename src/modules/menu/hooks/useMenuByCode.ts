/**
 * Menu By Code Query Hook
 * Connects Public/Navigation UI to getMenuByCode service via TanStack Query.
 * School News Platform - Step 09.4B
 */

import { useQuery } from '@tanstack/react-query';
import { getMenuByCode } from '../services/menuService';
import type { Menu } from '../types/menu';
import { MENU_CODE_REGEX } from '../schemas/menuSchema';

export function useMenuByCode(code?: string) {
  const isValidCode = Boolean(code && typeof code === 'string' && MENU_CODE_REGEX.test(code.trim()));

  const query = useQuery<Menu | null>({
    queryKey: ['menus', 'code', code],
    queryFn: async () => {
      if (!code) return null;
      return await getMenuByCode(code);
    },
    enabled: isValidCode,
    staleTime: 5 * 60 * 1000, // Menus cached for 5 minutes
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
