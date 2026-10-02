import React from 'react';
import { Menu, Bell, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface AdminTopbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export function AdminTopbar({ onToggleSidebar, isSidebarOpen = false }: AdminTopbarProps) {
  const { user, profile } = useAuth();

  const displayName = profile?.full_name || 'Admin';
  const roleTitle = 'Quản trị viên';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 shadow-2xs">
      {/* Left side: Hamburger toggle button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Mở menu quản trị"
          aria-expanded={isSidebarOpen}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side matching mockup: Info icon + Bell (badge 5) + User avatar & Admin label */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Info button */}
        <button
          type="button"
          aria-label="Thông tin hệ thống"
          className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Info className="h-4 w-4" />
        </button>

        {/* Notification bell with red badge 5 */}
        <button
          type="button"
          aria-label="Thông báo"
          className="relative p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
            5
          </span>
        </button>

        {/* User Profile matching Mau quan tri và login.png */}
        <div className="flex items-center gap-3 pl-2">
          {/* Circular avatar */}
          <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                AD
              </div>
            )}
          </div>

          <div className="text-left leading-tight hidden sm:block">
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              {displayName}
            </div>
            <div className="text-[11px] text-slate-500 font-normal">
              {roleTitle}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
