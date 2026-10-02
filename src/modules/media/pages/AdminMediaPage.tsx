/**
 * Admin Media & Albums CMS Page Foundation
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album
 *
 * Requirements:
 * - Fits within Admin Shell layout.
 * - Tabs navigation: Media Library vs Albums.
 * - Minimal Page logic (pure orchestration of views).
 * - Responsive header & contextual guidance.
 * - No hard-coded school identity.
 */

import React, { useState } from 'react';
import { Image, Library, ShieldCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { MediaLibraryView } from '../components/MediaLibraryView';
import { AlbumsListView } from '../components/AlbumsListView';
import { usePermissions } from '../../../hooks/usePermissions';

export function AdminMediaPage() {
  const [activeTab, setActiveTab] = useState('media-library');
  const { can, isAdmin } = usePermissions();

  const canUpload = can('media.upload');
  const canEdit = can('media.edit');
  const canDelete = can('media.delete');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
              Quản lý Đa phương tiện & Album
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Kho lưu trữ hình ảnh, video hoạt động nhà trường và các bộ sưu tập album chuyên đề.
          </p>
        </div>

        {/* Permission status indicator badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
            <span className="font-medium">
              {isAdmin ? 'Quản trị viên (Toàn quyền)' : canEdit ? 'Biên tập viên' : 'Xem tư liệu'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-slate-200 pb-3">
          <TabsList className="bg-slate-100/90 border border-slate-200">
            <TabsTrigger
              value="media-library"
              icon={<Image className="h-3.5 w-3.5" />}
              className="text-xs py-1.5 px-3"
            >
              Thư viện tệp tin
            </TabsTrigger>
            <TabsTrigger
              value="albums"
              icon={<Library className="h-3.5 w-3.5" />}
              className="text-xs py-1.5 px-3"
            >
              Bộ sưu tập Album
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Media Library Content */}
        <TabsContent value="media-library" className="mt-4">
          <MediaLibraryView />
        </TabsContent>

        {/* Tab 2: Albums Content */}
        <TabsContent value="albums" className="mt-4">
          <AlbumsListView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminMediaPage;
