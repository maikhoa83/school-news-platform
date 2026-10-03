import { Home, Newspaper, Search, Shield, Menu } from 'lucide-react';
import { MobileNavItem } from './types';

/**
 * Configurable Mobile Bottom Navigation Bar Items
 * Meets requirements for clean accessible bottom navigation with actionable triggers.
 */
export const defaultMobileBottomNavItems: MobileNavItem[] = [
  {
    key: 'mobile-home',
    label: 'Trang chủ',
    href: '/',
    icon: Home,
  },
  {
    key: 'mobile-news',
    label: 'Tin tức',
    href: '/news',
    icon: Newspaper,
  },
  {
    key: 'mobile-search',
    label: 'Tìm kiếm',
    href: '#search',
    icon: Search,
    isAction: true,
  },
  {
    key: 'mobile-admin',
    label: 'Quản trị',
    href: '/admin',
    icon: Shield,
  },
  {
    key: 'mobile-menu',
    label: 'Danh mục',
    href: '#menu',
    icon: Menu,
    isAction: true,
  },
];
