/**
 * Public Menu Navigation Hook
 * School News Platform - Step 09.6B
 *
 * Connects Public Shell UI to the authoritative Menu Service.
 * Implements:
 * - Module enablement guard (returns empty/fallback if module 'menu' is disabled)
 * - Safe resolution of active header/footer menus by location and standard code conventions
 * - Deterministic transformation into NavigationItem[] and PublicMenuNode[]
 * - 5-minute client-side caching via TanStack Query
 * - Fail-closed, crash-proof error handling
 */

import { useQuery } from '@tanstack/react-query';
import { useConfig } from '../../../hooks/useConfig';
import { listMenus, getMenuTree } from '../services/menuService';
import type { Menu, MenuLocation } from '../types/menu';
import type { NavigationItem } from '../../../navigation/types';
import type { PublicMenuNode, PublicNavigationResult } from '../types/publicMenu';
import {
  PUBLIC_HEADER_MENU_CODE,
  PUBLIC_FOOTER_MENU_CODE,
} from '../config/menuConfig';
import {
  transformMenuItemTreeToNavItems,
  transformMenuItemTreeToPublicMenuNodes,
} from '../utils/publicMenuUtils';

export interface UsePublicMenuOptions {
  customCode?: string;
  enabled?: boolean;
}

export function usePublicMenu(
  location: MenuLocation = 'header',
  options: UsePublicMenuOptions = {}
): PublicNavigationResult {
  const { isModuleEnabled } = useConfig();
  const isMenuModuleEnabled = isModuleEnabled('menu');
  const isQueryEnabled = (options.enabled ?? true) && isMenuModuleEnabled;

  const defaultCode =
    location === 'header'
      ? PUBLIC_HEADER_MENU_CODE
      : location === 'footer'
      ? PUBLIC_FOOTER_MENU_CODE
      : undefined;

  const targetCode = options.customCode || defaultCode;

  const query = useQuery<{
    menu: Menu | null;
    items: NavigationItem[];
    nodes: PublicMenuNode[];
  } | null>({
    queryKey: ['public-menu', location, targetCode],
    queryFn: async () => {
      try {
        // 1. Fetch active menus for the specified location
        const menus = await listMenus({
          location,
          isActive: true,
        });

        if (!menus || menus.length === 0) {
          return null;
        }

        // 2. Identify the target menu: prefer targetCode if present, otherwise first active menu
        let activeMenu: Menu | undefined;
        if (targetCode) {
          activeMenu = menus.find((m) => m.code === targetCode);
        }
        if (!activeMenu) {
          activeMenu = menus[0];
        }

        if (!activeMenu) {
          return null;
        }

        // 3. Fetch hierarchical tree for this menu
        const rawTree = await getMenuTree(activeMenu.id);

        // 4. Pure transformations
        const items = transformMenuItemTreeToNavItems(rawTree);
        const nodes = transformMenuItemTreeToPublicMenuNodes(rawTree);

        return {
          menu: activeMenu,
          items,
          nodes,
        };
      } catch (err) {
        console.warn(`[usePublicMenu] Exception fetching menu for ${location}:`, err);
        return null;
      }
    },
    enabled: isQueryEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes caching for public visitor experience
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    menu: query.data?.menu ?? null,
    items: query.data?.items ?? [],
    nodes: query.data?.nodes ?? [],
    isLoading: isQueryEnabled ? query.isLoading : false,
    isError: query.isError,
    error: query.error,
  };
}
