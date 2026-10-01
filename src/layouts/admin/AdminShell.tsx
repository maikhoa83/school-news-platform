import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminTopbar } from './AdminTopbar';
import { AdminSidebar } from './AdminSidebar';

export interface AdminShellProps {
  children?: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900 font-sans antialiased">
      {/* Admin Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Wrapper with Desktop Sidebar Offset */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Admin Topbar */}
        <AdminTopbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Admin Page Content */}
        <main
          id="admin-main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 outline-none"
        >
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
