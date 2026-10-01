/**
 * Menu & Menu Items Domain Types
 * School News Platform - Step 09.4B
 *
 * Defines core domain models, relations, mutation inputs, and query parameters
 * for public.menus and public.menu_items.
 */

export type MenuLocation = 'header' | 'footer' | 'sidebar';

export type MenuItemTarget = '_self' | '_blank';

export type MenuSortField = 'code' | 'name' | 'location' | 'created_at' | 'updated_at';

export type MenuItemSortField = 'sort_order' | 'created_at' | 'title';

export type SortOrder = 'asc' | 'desc';

/**
 * Core Menu entity representing public.menus row.
 */
export interface Menu {
  id: string;
  code: string;
  name: string;
  description: string | null;
  location: MenuLocation;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Core MenuItem entity representing public.menu_items row.
 */
export interface MenuItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  title: string;
  url: string;
  target: MenuItemTarget;
  sort_order: number;
  icon: string | null;
  is_active: boolean;
  page_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Resolved summary of an associated static page.
 */
export interface MenuItemPageSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
}

/**
 * MenuItem with joined relations (e.g. linked page).
 */
export interface MenuItemWithRelations extends MenuItem {
  page?: MenuItemPageSummary | null;
}

/**
 * Hierarchical Menu Tree item with nested children.
 */
export interface MenuItemTree extends MenuItem {
  children: MenuItemTree[];
  page?: MenuItemPageSummary | null;
}

/**
 * Input contract for creating a new Menu.
 */
export interface MenuCreateInput {
  code: string;
  name: string;
  description?: string | null;
  location?: MenuLocation;
  is_active?: boolean;
}

/**
 * Input contract for updating an existing Menu.
 */
export interface MenuUpdateInput {
  code?: string;
  name?: string;
  description?: string | null;
  location?: MenuLocation;
  is_active?: boolean;
}

/**
 * Query filter parameters for listing Menus.
 */
export interface MenuListParams {
  location?: MenuLocation | 'all';
  isActive?: boolean | 'all';
  search?: string;
  sortBy?: MenuSortField;
  sortOrder?: SortOrder;
}

/**
 * Input contract for creating a new MenuItem.
 */
export interface MenuItemCreateInput {
  menu_id: string;
  parent_id?: string | null;
  title: string;
  url: string;
  target?: MenuItemTarget;
  sort_order?: number;
  icon?: string | null;
  is_active?: boolean;
  page_id?: string | null;
}

/**
 * Input contract for updating an existing MenuItem.
 */
export interface MenuItemUpdateInput {
  parent_id?: string | null;
  title?: string;
  url?: string;
  target?: MenuItemTarget;
  sort_order?: number;
  icon?: string | null;
  is_active?: boolean;
  page_id?: string | null;
}

/**
 * Query filter parameters for listing MenuItems.
 */
export interface MenuItemListParams {
  menuId?: string;
  parentId?: string | 'root' | 'all' | null;
  isActive?: boolean | 'all';
  sortBy?: MenuItemSortField;
  sortOrder?: SortOrder;
}
