/**
 * Media Item Presentation Component
 * Handles secure thumbnail and type-specific presentation for Media items.
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 *
 * Requirements:
 * - Image: Loads via temporary signed URL from private bucket, shows skeleton while loading.
 * - Video: Shows video indicator badge & icon.
 * - Document/Other: Shows document indicator badge & icon.
 * - Accessible: alt attribute with fallback to file_name.
 */

import React from 'react';
import { FileText, Film, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useSignedUrl } from '../hooks/useSignedUrl';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { MediaFileType } from '../../../types/media';

interface MediaPreviewItemProps {
  filePath: string;
  fileType: MediaFileType;
  fileName: string;
  altText?: string | null;
  className?: string;
}

export function MediaPreviewItem({
  filePath,
  fileType,
  fileName,
  altText,
  className = 'h-full w-full',
}: MediaPreviewItemProps) {
  const isImage = fileType === 'image';
  const { data: signedUrl, isLoading, isError } = useSignedUrl(filePath, isImage);

  if (isImage) {
    if (isLoading) {
      return (
        <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    if (isError || !signedUrl) {
      return (
        <div
          className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center ${className}`}
          title="Không thể tải ảnh xem trước"
        >
          <AlertCircle className="h-6 w-6 mb-1 text-slate-400" />
          <span className="text-[10px] text-slate-500">Lỗi xem trước</span>
        </div>
      );
    }

    return (
      <img
        src={signedUrl}
        alt={altText || fileName}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }

  if (fileType === 'video') {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-900 text-slate-200 p-3 text-center ${className}`}
      >
        <div className="h-10 w-10 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 mb-1.5">
          <Film className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-slate-300">Video</span>
      </div>
    );
  }

  // Document or other
  return (
    <div
      className={`flex flex-col items-center justify-center bg-slate-50 text-slate-600 p-3 text-center border border-slate-200/50 ${className}`}
    >
      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 mb-1.5">
        <FileText className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-slate-700">Tài liệu</span>
    </div>
  );
}
