import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { PublicMobileNav } from './PublicMobileNav';
import { MobileBottomBar } from './MobileBottomBar';
import { defaultSchoolIdentity } from '../../config/schoolIdentity';
import { SchoolIdentityConfig } from '../../types';
import { NavigationItem } from '../../navigation/types';
import { publicNavigationItems } from '../../navigation/publicNavigation';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { usePublicMenu } from '../../modules/menu/hooks/usePublicMenu';
import { filterNavItemsByModule } from '../../modules/menu/utils/publicMenuUtils';
import { PublicSeoProvider } from '../../modules/seo';

export interface PublicShellProps {
  children?: React.ReactNode;
  schoolIdentity?: SchoolIdentityConfig;
  navItems?: NavigationItem[];
  footerNavItems?: NavigationItem[];
}

export function PublicShell({
  children,
  schoolIdentity: propSchoolIdentity,
  navItems: propNavItems,
  footerNavItems: propFooterNavItems,
}: PublicShellProps) {
  const { schoolIdentity: contextSchoolIdentity, isModuleEnabled } = useConfig();
  const schoolIdentity = propSchoolIdentity || contextSchoolIdentity || defaultSchoolIdentity;

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch dynamic header and footer menus from authoritative service
  const { items: dynamicHeaderItems } = usePublicMenu('header');
  const { items: dynamicFooterItems, menu: footerMenu } = usePublicMenu('footer');

  // 2. Resolve active header items: custom prop > dynamic menu > default static navigation
  const isCustomPropNav = propNavItems !== undefined && propNavItems !== publicNavigationItems;
  const rawHeaderItems = isCustomPropNav
    ? propNavItems
    : dynamicHeaderItems.length > 0
    ? dynamicHeaderItems
    : (propNavItems || publicNavigationItems);

  const headerNavItems = filterNavItemsByModule(rawHeaderItems, isModuleEnabled);

  // 3. Resolve active footer items
  const effectiveFooterItems = propFooterNavItems !== undefined
    ? filterNavItemsByModule(propFooterNavItems, isModuleEnabled)
    : dynamicFooterItems.length > 0
    ? filterNavItemsByModule(dynamicFooterItems, isModuleEnabled)
    : undefined;

  const handleOpenSearch = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchModalOpen(false);
  };

  return (
    <PublicSeoProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        {/* Accessibility Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-800 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-semibold"
        >
          Chuyển thẳng đến nội dung chính
        </a>

        {/* Public Header */}
        <PublicHeader
          schoolIdentity={schoolIdentity}
          navItems={headerNavItems}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
          isMobileNavOpen={isMobileNavOpen}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 pb-16 md:pb-0 outline-none"
        >
          {children || <Outlet />}
        </main>

        {/* Public Footer */}
        <PublicFooter
          schoolIdentity={schoolIdentity}
          navItems={effectiveFooterItems}
          menuTitle={footerMenu?.name}
        />

        {/* Mobile Bottom Icon Bar (Only visible on mobile screens) */}
        <MobileBottomBar
          onOpenMenu={() => setIsMobileNavOpen(true)}
          onOpenSearch={handleOpenSearch}
        />

        {/* Mobile Drawer Navigation (Slide-over) */}
        <PublicMobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          schoolIdentity={schoolIdentity}
          items={headerNavItems}
        />

        {/* Mobile Quick Search Modal */}
        <Modal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          title="Tra cứu & Tìm kiếm thông tin"
          description="Nhập từ khóa về tin tức hoạt động, văn bản điều hành, thông báo của nhà trường."
          maxWidth="md"
        >
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <Input
              label="Từ khóa tìm kiếm"
              placeholder="Ví dụ: Lịch thi học kỳ, Danh sách lớp, Tuyển sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSearchModalOpen(false)}
              >
                Đóng
              </Button>
              <Button type="submit" variant="primary">
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PublicSeoProvider>
  );
}
