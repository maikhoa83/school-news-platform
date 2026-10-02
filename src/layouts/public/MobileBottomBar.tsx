import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MobileNavItem } from '../../navigation/types';
import { defaultMobileBottomNavItems } from '../../navigation/mobileNavigation';
import { cn } from '../../lib/utils';

export interface MobileBottomBarProps {
  items?: MobileNavItem[];
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
}

export function MobileBottomBar({
  items = defaultMobileBottomNavItems,
  onOpenMenu,
  onOpenSearch,
}: MobileBottomBarProps) {
  const location = useLocation();

  return (
    <nav
      aria-label="Điều hướng nhanh trên điện thoại"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : !item.isAction && location.pathname.startsWith(item.href);

          if (item.isAction) {
            const handleClick = (e: React.MouseEvent) => {
              e.preventDefault();
              if (item.key === 'mobile-menu' && onOpenMenu) {
                onOpenMenu();
              } else if (item.key === 'mobile-search' && onOpenSearch) {
                onOpenSearch();
              }
            };

            return (
              <button
                key={item.key}
                type="button"
                onClick={handleClick}
                aria-label={item.label}
                className="flex flex-col items-center justify-center w-full h-full py-1 text-slate-600 hover:text-blue-800 transition-colors active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 px-1 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium mt-1 truncate max-w-[56px] text-center">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full py-1 transition-colors active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700',
                isActive
                  ? 'text-blue-800 font-semibold'
                  : 'text-slate-600 hover:text-blue-700'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 truncate max-w-[56px] text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
