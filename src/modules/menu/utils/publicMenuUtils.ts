/**
 * Public Menu Transformation and Resolution Utilities
 * School News Platform - Step 09.6B
 *
 * Provides pure, deterministic, unit-testable functions for:
 * 1. Safe URL resolution (internal /page/:slug vs external URLs vs static routes)
 * 2. Strict status validation (rejects draft/archived/missing pages)
 * 3. Icon name to LucideIcon mapping
 * 4. Recursive MenuItemTree -> NavigationItem transformation
 * 5. Recursive MenuItemTree -> PublicMenuNode transformation
 * 6. Module enablement filtering
 */

import {
  Home,
  Info,
  Newspaper,
  FileText,
  Calendar,
  GraduationCap,
  PhoneCall,
  Mail,
  Image,
  Award,
  Book,
  Bell,
  Layers,
  Shield,
  ExternalLink,
  Globe,
  Compass,
  Bookmark,
  Folder,
  Users,
  Star,
  Search,
  LucideIcon,
} from 'lucide-react';
import type { MenuItemTree, MenuItemPageSummary } from '../../../types/menu';
import type { NavigationItem } from '../../../navigation/types';
import type { PublicMenuNode } from '../types/publicMenu';

/**
 * Known Lucide icon mapping for string-based database icon identifiers.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  info: Info,
  newspaper: Newspaper,
  news: Newspaper,
  'file-text': FileText,
  filetext: FileText,
  document: FileText,
  documents: FileText,
  calendar: Calendar,
  activities: Calendar,
  'graduation-cap': GraduationCap,
  graduationcap: GraduationCap,
  school: GraduationCap,
  admissions: GraduationCap,
  phone: PhoneCall,
  phonecall: PhoneCall,
  contact: PhoneCall,
  mail: Mail,
  image: Image,
  gallery: Image,
  award: Award,
  achievements: Award,
  book: Book,
  bell: Bell,
  announcement: Bell,
  layers: Layers,
  shield: Shield,
  admin: Shield,
  link: ExternalLink,
  external: ExternalLink,
  'external-link': ExternalLink,
  globe: Globe,
  compass: Compass,
  bookmark: Bookmark,
  folder: Folder,
  users: Users,
  star: Star,
  search: Search,
};

/**
 * Resolves a text icon name into a LucideIcon component.
 */
export function resolveMenuIcon(iconName?: string | null): LucideIcon | undefined {
  if (!iconName || typeof iconName !== 'string') return undefined;
  const normalized = iconName.trim().toLowerCase().replace(/_/g, '-');
  return ICON_MAP[normalized];
}

export interface ResolvedUrlResult {
  href: string;
  isExternal: boolean;
  isValid: boolean;
  pageSlug?: string | null;
}

/**
 * Resolves the destination URL for a menu item.
 *
 * Rules:
 * 1. If page_id is present:
 *    - The linked page MUST exist and be 'published'.
 *    - If page is missing or unpublished (draft, archived): marked INVALID (hidden from public).
 *    - Destination is strictly `/page/:slug`.
 * 2. If page_id is not present:
 *    - External URLs (http://, https://, //): kept as-is, flagged as external.
 *    - Normalized internal paths: `/pages/:slug` is auto-corrected to `/page/:slug`.
 *    - Internal routes (e.g. `/`, `/news`, `/about`): kept as SPA internal paths.
 */
export function resolvePublicItemUrl(item: {
  url: string;
  page_id?: string | null;
  page?: MenuItemPageSummary | null;
}): ResolvedUrlResult {
  // Case 1: Linked to an internal static page
  if (item.page_id) {
    if (!item.page || item.page.status !== 'published' || !item.page.slug) {
      return {
        href: '',
        isExternal: false,
        isValid: false,
        pageSlug: null,
      };
    }
    const cleanSlug = item.page.slug.trim().toLowerCase();
    return {
      href: `/page/${cleanSlug}`,
      isExternal: false,
      isValid: true,
      pageSlug: cleanSlug,
    };
  }

  // Case 2: Direct URL string provided
  const rawUrl = (item.url || '').trim();
  if (!rawUrl) {
    return {
      href: '/',
      isExternal: false,
      isValid: true,
      pageSlug: null,
    };
  }

  // External URL detection
  if (/^(https?:|\/\/)/i.test(rawUrl)) {
    return {
      href: rawUrl,
      isExternal: true,
      isValid: true,
      pageSlug: null,
    };
  }

  // Normalize legacy or mis-typed `/pages/:slug` to canonical `/page/:slug`
  if (rawUrl.startsWith('/pages/')) {
    const slug = rawUrl.substring('/pages/'.length).trim();
    return {
      href: `/page/${slug}`,
      isExternal: false,
      isValid: true,
      pageSlug: slug,
    };
  }

  // Internal standard path
  return {
    href: rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`,
    isExternal: false,
    isValid: true,
    pageSlug: null,
  };
}

/**
 * Pure recursive transformation: converts MenuItemTree[] from the database/service
 * into standard NavigationItem[] compatible with PublicHeader, PublicMobileNav, and PublicFooter.
 *
 * Guarantees:
 * - Omits inactive items (is_active = false)
 * - If a parent item is omitted, all its descendants are omitted
 * - Omits items linked to unpublished/draft pages
 * - Maps external links with target="_blank" and rel="noopener noreferrer"
 * - Maps icon names to Lucide icons
 * - Preserves deterministic sort order
 */
export function transformMenuItemTreeToNavItems(tree: MenuItemTree[]): NavigationItem[] {
  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }

  const result: NavigationItem[] = [];

  for (const node of tree) {
    // 1. Strict active filter
    if (!node.is_active) {
      continue;
    }

    // 2. Resolve destination URL & check page validity
    const urlResult = resolvePublicItemUrl(node);
    if (!urlResult.isValid) {
      continue;
    }

    // 3. Recursively process children
    const validChildren = node.children && node.children.length > 0
      ? transformMenuItemTreeToNavItems(node.children)
      : undefined;

    const navItem: NavigationItem = {
      key: node.id,
      label: node.title,
      href: urlResult.href,
      icon: resolveMenuIcon(node.icon),
      external: urlResult.isExternal || node.target === '_blank',
      target: node.target,
      children: validChildren && validChildren.length > 0 ? validChildren : undefined,
    };

    result.push(navItem);
  }

  return result;
}

/**
 * Pure recursive transformation: converts MenuItemTree[] into clean PublicMenuNode[].
 */
export function transformMenuItemTreeToPublicMenuNodes(tree: MenuItemTree[]): PublicMenuNode[] {
  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }

  const result: PublicMenuNode[] = [];

  for (const node of tree) {
    if (!node.is_active) {
      continue;
    }

    const urlResult = resolvePublicItemUrl(node);
    if (!urlResult.isValid) {
      continue;
    }

    const children = node.children && node.children.length > 0
      ? transformMenuItemTreeToPublicMenuNodes(node.children)
      : [];

    result.push({
      id: node.id,
      title: node.title,
      href: urlResult.href,
      target: node.target,
      isExternal: urlResult.isExternal || node.target === '_blank',
      icon: node.icon,
      sortOrder: node.sort_order,
      children,
      hasChildren: children.length > 0,
      pageSlug: urlResult.pageSlug,
    });
  }

  return result;
}

/**
 * Filters a list of NavigationItems based on the platform's module registry enablement state.
 */
export function filterNavItemsByModule(
  items: NavigationItem[],
  isModuleEnabled: (moduleKey: string) => boolean
): NavigationItem[] {
  return items
    .filter((item) => {
      if (item.moduleKey && !isModuleEnabled(item.moduleKey)) {
        return false;
      }
      return true;
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterNavItemsByModule(item.children, isModuleEnabled),
        };
      }
      return item;
    });
}
