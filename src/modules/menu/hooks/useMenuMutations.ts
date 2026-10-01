/**
 * Menu & Menu Items Mutation Hooks
 * School News Platform - Step 09.4B
 *
 * Provides:
 * - useCreateMenu
 * - useUpdateMenu
 * - useDeleteMenu
 * - useCreateMenuItem
 * - useUpdateMenuItem
 * - useDeleteMenuItem
 * - useReorderMenuItems
 * - useMenuMutations (unified bundle)
 *
 * Enforces:
 * - Scoped TanStack Query cache invalidation
 * - Zero direct Supabase calls from hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMenu,
  updateMenu,
  deleteMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} from '../services/menuService';
import type {
  Menu,
  MenuItem,
  MenuCreateInput,
  MenuUpdateInput,
  MenuItemCreateInput,
  MenuItemUpdateInput,
} from '../types/menu';

/**
 * Hook for creating a Menu
 */
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation<Menu, Error, MenuCreateInput>({
    mutationFn: async (payload: MenuCreateInput) => {
      return await createMenu(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

/**
 * Hook for updating a Menu
 */
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation<Menu, Error, { id: string; input: MenuUpdateInput }>({
    mutationFn: async ({ id, input }) => {
      return await updateMenu(id, input);
    },
    onSuccess: (updatedMenu) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'detail', updatedMenu.id] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'code'] });
    },
  });
}

/**
 * Hook for deleting a Menu
 */
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await deleteMenu(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.removeQueries({ queryKey: ['menus', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'code'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
}

/**
 * Hook for creating a MenuItem
 */
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, MenuItemCreateInput>({
    mutationFn: async (payload: MenuItemCreateInput) => {
      return await createMenuItem(payload);
    },
    onSuccess: (createdItem) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({
        queryKey: ['menu-items', 'tree', createdItem.menu_id],
      });
    },
  });
}

/**
 * Hook for updating a MenuItem
 */
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<
    MenuItem,
    Error,
    { id: string; input: MenuItemUpdateInput; menuId?: string }
  >({
    mutationFn: async ({ id, input }) => {
      return await updateMenuItem(id, input);
    },
    onSuccess: (updatedItem, variables) => {
      const menuId = variables.menuId || updatedItem.menu_id;
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({
        queryKey: ['menu-items', 'detail', updatedItem.id],
      });
      if (menuId) {
        queryClient.invalidateQueries({
          queryKey: ['menu-items', 'tree', menuId],
        });
      }
    },
  });
}

/**
 * Hook for deleting a MenuItem
 */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; menuId?: string }>({
    mutationFn: async ({ id }) => {
      await deleteMenuItem(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.removeQueries({ queryKey: ['menu-items', 'detail', variables.id] });
      if (variables.menuId) {
        queryClient.invalidateQueries({
          queryKey: ['menu-items', 'tree', variables.menuId],
        });
      }
    },
  });
}

/**
 * Hook for reordering MenuItems
 */
export function useReorderMenuItems() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { menuId: string; orderedIds: string[] }>({
    mutationFn: async ({ menuId, orderedIds }) => {
      await reorderMenuItems(menuId, orderedIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({
        queryKey: ['menu-items', 'tree', variables.menuId],
      });
    },
  });
}

/**
 * Unified mutations bundle hook for menus and menu items management
 */
export function useMenuMutations() {
  const createMenuMut = useCreateMenu();
  const updateMenuMut = useUpdateMenu();
  const deleteMenuMut = useDeleteMenu();

  const createMenuItemMut = useCreateMenuItem();
  const updateMenuItemMut = useUpdateMenuItem();
  const deleteMenuItemMut = useDeleteMenuItem();
  const reorderMenuItemsMut = useReorderMenuItems();

  return {
    createMenu: createMenuMut.mutateAsync,
    isCreatingMenu: createMenuMut.isPending,
    createMenuError: createMenuMut.error,

    updateMenu: updateMenuMut.mutateAsync,
    isUpdatingMenu: updateMenuMut.isPending,
    updateMenuError: updateMenuMut.error,

    deleteMenu: deleteMenuMut.mutateAsync,
    isDeletingMenu: deleteMenuMut.isPending,
    deleteMenuError: deleteMenuMut.error,

    createMenuItem: createMenuItemMut.mutateAsync,
    isCreatingMenuItem: createMenuItemMut.isPending,
    createMenuItemError: createMenuItemMut.error,

    updateMenuItem: updateMenuItemMut.mutateAsync,
    isUpdatingMenuItem: updateMenuItemMut.isPending,
    updateMenuItemError: updateMenuItemMut.error,

    deleteMenuItem: deleteMenuItemMut.mutateAsync,
    isDeletingMenuItem: deleteMenuItemMut.isPending,
    deleteMenuItemError: deleteMenuItemMut.error,

    reorderMenuItems: reorderMenuItemsMut.mutateAsync,
    isReorderingMenuItems: reorderMenuItemsMut.isPending,
    reorderMenuItemsError: reorderMenuItemsMut.error,
  };
}
