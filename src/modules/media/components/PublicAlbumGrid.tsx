/**
 * Public Album Grid Component
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Renders the responsive grid of public albums with loading, empty, and pagination states.
 */

import React from 'react';
import { Images, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { PublicAlbumCard } from './PublicAlbumCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { Button } from '../../../components/ui/Button';
import type { AlbumWithItems } from '../../../types/media';

export interface PublicAlbumGridProps {
  albums: AlbumWithItems[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
}

export const PublicAlbumGrid: React.FC<PublicAlbumGridProps> = ({
  albums,
  isLoading,
  isError,
  error,
  onRetry,
  page = 1,
  totalPages = 1,
  onPageChange,
  basePath = '/albums',
}) => {
  if (isLoading) {
    return (
      <div
        id="public-albums-loading-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        aria-busy="true"
        aria-label="Đang tải danh sách album ảnh"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`album-skeleton-${index}`}
            className="flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-3 p-4"
          >
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        id="public-albums-error-state"
        className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs"
        role="alert"
      >
        <div className="inline-flex p-3 rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Không thể tải danh sách album ảnh</h3>
          <p className="text-sm text-slate-600">
            {error?.message || 'Đã xảy ra sự cố kết nối mạng hoặc máy chủ. Vui lòng thử lại.'}
          </p>
        </div>
        {onRetry && (
          <Button
            id="retry-public-albums-btn"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Thử lại</span>
          </Button>
        )}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div id="public-albums-empty-state" className="my-8">
        <EmptyState
          icon={<Images className="h-10 w-10 text-slate-400" />}
          title="Chưa có album ảnh nào được xuất bản"
          description="Hiện tại nhà trường chưa xuất bản album ảnh hoặc các hoạt động mới. Quý phụ huynh và học sinh vui lòng quay lại sau."
        />
      </div>
    );
  }

  return (
    <div id="public-albums-container" className="space-y-8">
      {/* Grid of Albums */}
      <div
        id="public-albums-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {albums.map((album) => (
          <PublicAlbumCard key={album.id} album={album} basePath={basePath} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <nav
          id="public-albums-pagination"
          aria-label="Phân trang album ảnh"
          className="flex items-center justify-center gap-2 pt-4"
        >
          <Button
            id="pagination-prev-btn"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Trang trước"
            className="h-10 px-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Trước</span>
          </Button>

          <span className="text-xs sm:text-sm font-medium text-slate-700 px-3 py-1.5 bg-slate-100 rounded-lg">
            Trang {page} / {totalPages}
          </span>

          <Button
            id="pagination-next-btn"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Trang sau"
            className="h-10 px-3"
          >
            <span>Sau</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </nav>
      )}
    </div>
  );
};
