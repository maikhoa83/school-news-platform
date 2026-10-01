import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Bell,
  Image,
  FolderTree,
  Menu as MenuIcon,
  Users,
  Settings,
  BarChart3,
  Database,
  History,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { signOut, user } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Accordion state for submenus
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    news: location.pathname.startsWith('/admin/news') || location.pathname.startsWith('/admin/categories'),
    documents: location.pathname.startsWith('/admin/documents'),
    settings: location.pathname.startsWith('/admin/settings') || location.pathname.startsWith('/admin/seo'),
    reports: location.pathname.startsWith('/admin/reports') || location.pathname.startsWith('/admin/audit'),
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    {
      key: 'dashboard',
      label: 'Tổng quan',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      key: 'news',
      label: 'Tin tức',
      icon: Newspaper,
      href: '/admin/news',
      hasSubmenu: true,
      children: [
        { label: 'Tất cả bài viết', href: '/admin/news' },
        { label: 'Viết bài mới', href: '/admin/news/new' },
        { label: 'Chuyên mục tin', href: '/admin/categories' },
        { label: 'Thẻ tag', href: '/admin/tags' },
      ],
    },
    {
      key: 'documents',
      label: 'Văn bản',
      icon: FileText,
      href: '/admin/documents',
      hasSubmenu: true,
      children: [
        { label: 'Tất cả văn bản', href: '/admin/documents' },
        { label: 'Thêm văn bản mới', href: '/admin/documents/new' },
      ],
    },
    {
      key: 'announcements',
      label: 'Thông báo',
      icon: Bell,
      href: '/admin/announcements',
    },
    {
      key: 'media',
      label: 'Thư viện media',
      icon: Image,
      href: '/admin/media',
    },
    {
      key: 'categories',
      label: 'Danh mục',
      icon: FolderTree,
      href: '/admin/categories',
    },
    {
      key: 'menus',
      label: 'Menu',
      icon: MenuIcon,
      href: '/admin/menus',
    },
    {
      key: 'users',
      label: 'Người dùng',
      icon: Users,
      href: '/admin/users',
    },
    {
      key: 'settings',
      label: 'Cấu hình',
      icon: Settings,
      href: '/admin/settings',
      hasSubmenu: true,
      children: [
        { label: 'Cấu hình chung', href: '/admin/settings' },
        { label: 'Trang chủ (Builder)', href: '/admin/homepage' },
        { label: 'Cấu hình SEO', href: '/admin/seo' },
        { label: 'Vai trò & Phân quyền', href: '/admin/roles' },
      ],
    },
    {
      key: 'reports',
      label: 'Báo cáo',
      icon: BarChart3,
      href: '/admin/health',
      hasSubmenu: true,
      children: [
        { label: 'Sức khỏe hệ thống', href: '/admin/health' },
        { label: 'Thống kê truy cập', href: '/admin' },
      ],
    },
    {
      key: 'backup',
      label: 'Sao lưu',
      icon: Database,
      href: '/admin/settings',
    },
    {
      key: 'logs',
      label: 'Nhật ký hệ thống',
      icon: History,
      href: '/admin/audit',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111c2e] text-slate-200 select-none border-r border-slate-800/80">
      {/* Sidebar Header / Brand matching Mau quan tri và login.png */}
      <div className="flex items-center justify-between h-16 px-4 bg-[#0d1624] border-b border-slate-800">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white p-0.5 shadow-sm shrink-0 flex items-center justify-center">
            <SchoolLogo size={32} className="h-8 w-8" />
          </div>
          <div className="leading-tight truncate">
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
              THCS &amp; THPT Vĩnh Phong
            </h2>
            <p className="text-[11px] text-slate-400">Quản trị hệ thống</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thanh điều hướng"
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav aria-label="Thanh điều hướng quản trị" className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = item.exact
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);

          if (item.hasSubmenu && item.children) {
            const isExpanded = openSubmenus[item.key];
            return (
              <div key={item.key} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.key)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    isItemActive
                      ? 'text-white bg-slate-800/60'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-0.5 border-l border-slate-700/50 ml-5">
                    {item.children.map((sub) => {
                      const isSubActive = location.pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={cn(
                            'block px-2.5 py-1.5 rounded-md text-[11px] transition-colors',
                            isSubActive
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                          )}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isItemActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isItemActive ? 'text-white' : 'text-slate-400'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800 bg-[#0d1624] text-xs">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-slate-800/60 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate">
            Đăng xuất ({user?.email ? user.email.split('@')[0] : 'Admin'})
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 lg:fixed lg:inset-y-0 lg:z-40">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 flex"
        >
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onClose}
          />
          <div
            ref={sidebarRef}
            className="relative flex flex-col w-full max-w-xs shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
