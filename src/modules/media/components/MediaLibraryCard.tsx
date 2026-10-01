/**
 * Media Library Grid Card Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 */

import React from 'react';
import { Folder, Calendar, HardDrive, CheckCircle2, EyeOff } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { MediaPreviewItem } from './MediaPreviewItem';
import { formatBytes, formatMediaDate } from '../utils/mediaFormatters';
import type { MediaWithFolder } from '../../../types/media';

interface MediaLibraryCardProps {
  item: MediaWithFolder;
  onSelect?: (item: MediaWithFolder) => void;
}

export function MediaLibraryCard({ item, onSelect }: MediaLibraryCardProps) {
  const displayTitle = item.title?.trim() || item.file_name;
  const isImage = item.file_type === 'image';

  return (
    <div
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(item);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết tệp ${displayTitle}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white transition-all hover:border-blue-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 cursor-pointer text-left"
    >
      {/* Media Thumbnail / Preview Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
        <MediaPreviewItem
          filePath={item.file_path}
          fileType={item.file_type}
          fileName={item.file_name}
          altText={item.alt_text}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 pointer-events-none">
          <Badge
            variant={item.file_type === 'image' ? 'primary' : item.file_type === 'video' ? 'accent' : 'default'}
            className="text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md bg-white/90"
          >
            {item.file_type}
          </Badge>
          {item.is_published ? (
            <Badge variant="success" className="text-[10px] backdrop-blur-md bg-emerald-50/95">
              <CheckCircle2 className="h-3 w-3 mr-0.5 text-emerald-600" />
              Công khai
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] backdrop-blur-md bg-white/95 text-slate-500">
              <EyeOff className="h-3 w-3 mr-0.5" />
              Bản nháp
            </Badge>
          )}
        </div>

        {/* Image Dimensions Overlay (if available) */}
        {isImage && item.width && item.height && (
          <div className="absolute bottom-1.5 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
            {item.width} × {item.height}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-3.5 space-y-2">
        <div className="space-y-0.5">
          <h4
            className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-800 transition-colors"
            title={displayTitle}
          >
            {displayTitle}
          </h4>
          <p className="text-[11px] text-slate-400 font-mono line-clamp-1" title={item.file_name}>
            {item.file_name}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3 text-slate-400" />
            <span>{formatBytes(item.file_size)}</span>
          </div>

          {item.folder ? (
            <div className="flex items-center gap-1 text-blue-700 max-w-[110px] truncate" title={item.folder.name}>
              <Folder className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.folder.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>{formatMediaDate(item.created_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
