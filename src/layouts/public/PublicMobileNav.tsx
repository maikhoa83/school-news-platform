import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Search,
  LogIn,
  Shield,
} from 'lucide-react';
import { NavigationItem } from '../../navigation/types';
import { publicNavigationItems } from '../../navigation/publicNavigation';
import { SchoolIdentityConfig } from '../../types';
import { Button } from '../../components/ui/Button';
import { PublicMobileMenu } from '../../modules/menu/components/PublicMobileMenu';
import { SchoolLogo } from '../../components/common/SchoolLogo';

export interface PublicMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  schoolIdentity: SchoolIdentityConfig;
  items?: NavigationItem[];
}

export function PublicMobileNav({
  isOpen,
  onClose,
  schoolIdentity,
  items = publicNavigationItems,
}: PublicMobileNavProps) {
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle Escape key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thực đơn điều hướng di động"
      className="fixed inset-0 z-50 flex md:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative flex flex-col w-full max-w-xs bg-white text-slate-900 shadow-2xl h-full animate-in slide-in-from-left duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <SchoolLogo size={36} className="h-9 w-9 shrink-0" />
            <div className="leading-tight">
              <h2 className="font-bold text-xs sm:text-sm text-[#003B8E] uppercase tracking-tight">
                {schoolIdentity.short_name || 'THCS & THPT Vĩnh Phong'}
              </h2>
              <p className="text-[10px] text-slate-500">Cổng thông tin điện tử</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thực đơn"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar inside Drawer */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="relative"
          >
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Tìm kiếm tin bài, văn bản..."
              aria-label="Tìm kiếm trên trang"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
            />
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3">
          <PublicMobileMenu items={items} onItemClick={onClose} />
        </div>

        {/* Quick Portal Access in Drawer Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link to="/login" className="block">
              <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                <LogIn className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
                Đăng nhập
              </Button>
            </Link>
            <Link to="/admin" className="block">
              <Button variant="primary" size="sm" className="w-full justify-center text-xs bg-[#003B8E]">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Quản trị
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
