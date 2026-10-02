/**
 * Admin Albums List Page
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Dedicated page for browsing and managing school photo collections.
 */

import React from 'react';
import { Library, FolderPlus } from 'lucide-react';
import { AlbumsListView } from '../components/AlbumsListView';

export function AdminAlbumsListPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs uppercase tracking-wider">
          <Library className="h-4 w-4" />
          <span>Quản trị Đa phương tiện</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Bộ sưu tập Album ảnh
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Quản lý các bộ sưu tập hình ảnh sự kiện, hoạt động giáo dục, phong trào thi đua của nhà trường.
        </p>
      </div>

      {/* Albums List View Component */}
      <AlbumsListView />
    </div>
  );
}
