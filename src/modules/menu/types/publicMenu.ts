/**
 * Public Menu Presentation Types
 * School News Platform - Step 09.6B
 *
 * Defines pure presentation models for public navigation,
 * decoupled from database-specific schema and raw Supabase models.
 */

import type { Menu, MenuItemTarget } from '../../../types/menu';
import type { NavigationItem } from '../../../navigation/types';

export interface PublicMenuNode {
  id: string;
  title: string;
  href: string;
  target: MenuItemTarget;
  isExternal: boolean;
  icon?: string | null;
  sortOrder: number;
  children: PublicMenuNode[];
  hasChildren: boolean;
  pageSlug?: string | null;
}

export interface PublicNavigationResult {
  menu: Menu | null;
  items: NavigationItem[];
  nodes: PublicMenuNode[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}
