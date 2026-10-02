import { LucideIcon } from 'lucide-react';
import type { AppPermission } from '../lib/authorization/types';

/**
 * Reusable navigation item contract for School News Platform
 * Clean, decoupled from JSX, supports future dynamic configuration.
 */
export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  external?: boolean;
  target?: '_self' | '_blank';
  description?: string;
  children?: NavigationItem[];
  moduleKey?: string;
  requiredPermission?: AppPermission | AppPermission[] | string | string[];
}

export interface NavigationGroup {
  key: string;
  title: string;
  items: NavigationItem[];
}

export interface MobileNavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isAction?: boolean; // e.g. Open full drawer or search modal
}
