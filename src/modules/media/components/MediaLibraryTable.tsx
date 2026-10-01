/**
 * Media Library Table / List View Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 */

import React from 'react';
import { Folder, HardDrive, CheckCircle2, EyeOff } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { MediaPreviewItem } from './MediaPreviewItem';
import { formatBytes, formatMediaDate } from '../utils/mediaFormatters';
import type { MediaWithFolder } from '../../../types/media';

interface MediaLibraryTableProps {
  items: MediaWithFolder[];
  onSelect?: (item: MediaWithFolder) => void;
}

export function MediaLibraryTable({ items, onSelect }: MediaLibraryTableProps) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[340px]">Tệp tin</TableHead>
            <TableHead>Thư mục</TableHead>
            <TableHead>Định dạng</TableHead>
            <TableHead>Dung lượng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Ngày tải lên</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const displayTitle = item.title?.trim() || item.file_name;
            return (
              <TableRow
                key={item.id}
                onClick={() => onSelect?.(item)}
                className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect?.(item);
                  }
                }}
              >
                {/* Media preview + Title & Filename */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <MediaPreviewItem
                        filePath={item.file_path}
                        fileType={item.file_type}
                        fileName={item.file_name}
                        altText={item.alt_text}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-semibold text-slate-900 truncate" title={displayTitle}>
                        {displayTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate" title={item.file_name}>
                        {item.file_name}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Folder */}
                <TableCell>
                  {item.folder ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 px-2 py-1 rounded-md border border-blue-100 max-w-[160px] truncate">
                      <Folder className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.folder.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Thư mục gốc</span>
                  )}
                </TableCell>

                {/* File Type */}
                <TableCell>
                  <Badge
                    variant={
                      item.file_type === 'image'
                        ? 'primary'
                        : item.file_type === 'video'
                        ? 'accent'
                        : 'default'
                    }
                    className="text-[10px] font-semibold uppercase"
                  >
                    {item.file_type}
                  </Badge>
                </TableCell>

                {/* File Size */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatBytes(item.file_size)}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {item.is_published ? (
                    <Badge variant="success" className="text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                      Công khai
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-500">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Bản nháp
                    </Badge>
                  )}
                </TableCell>

                {/* Created Date */}
                <TableCell className="text-right text-xs text-slate-500">
                  {formatMediaDate(item.created_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
