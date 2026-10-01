/**
 * Media Library View Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.1)
 *
 * Coordinates:
 * - Filter & Search state (typed)
 * - Pagination state
 * - TanStack Query via useMediaLibrary()
 * - View mode switching (Grid / Table)
 * - Upload Workflow (MediaUploadModal)
 * - Detail & Edit Actions (MediaDetailModal)
 * - Folder Management (MediaFolderManageModal)
 * - Skeleton loading & Empty states
 * - Friendly error handling (no raw SQL/DB leakage)
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  FolderSearch,
  Upload,
  FolderPlus,
  CheckCircle2,
} from 'lucide-react';
import { MediaLibraryFilters, type MediaFilterState, type ViewMode } from './MediaLibraryFilters';
import { MediaLibraryCard } from './MediaLibraryCard';
import { MediaLibraryTable } from './MediaLibraryTable';
import { MediaUploadModal } from './MediaUploadModal';
import { MediaDetailModal } from './MediaDetailModal';
import { MediaFolderManageModal } from './MediaFolderManageModal';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePermissions } from '../../../hooks/usePermissions';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import type { MediaListParams, MediaWithFolder, MediaItem } from '../../../types/media';

const DEFAULT_FILTERS: MediaFilterState = {
  search: '',
  folderId: 'all',
  fileType: 'all',
  isPublished: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

interface MediaLibraryViewProps {
  onSelectItem?: (item: MediaWithFolder) => void;
}

export function MediaLibraryView({ onSelectItem }: MediaLibraryViewProps) {
  const { can } = usePermissions();
  const canUpload = can('media.upload');
  const canEdit = can('media.edit');

  const [filters, setFilters] = useState<MediaFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(24);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal Dialog States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderManageOpen, setIsFolderManageOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaWithFolder | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Convert UI filter state to strongly typed MediaListParams for mediaService
  const queryParams: MediaListParams = {
    page,
    pageSize,
    search: filters.search.trim() || undefined,
    folderId:
      filters.folderId === 'all'
        ? undefined
        : filters.folderId === 'root'
        ? null
        : filters.folderId,
    fileType: filters.fileType === 'all' ? undefined : filters.fileType,
    isPublished:
      filters.isPublished === 'all'
        ? undefined
        : filters.isPublished === 'published'
        ? true
        : false,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  const { items, total, totalPages, isLoading, isFetching, isError, error, refetch } =
    useMediaLibrary(queryParams);

  const handleFilterChange = (newFilters: MediaFilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleItemClick = (item: MediaWithFolder) => {
    if (onSelectItem) {
      onSelectItem(item);
    } else {
      setSelectedItem(item);
    }
  };

  const handleUploadSuccess = (createdItem: MediaItem) => {
    setActionSuccessMessage(`Đã tải lên tệp "${createdItem.title}" thành công.`);
    refetch();
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleUpdateSuccess = (updatedItem: MediaItem) => {
    setActionSuccessMessage(`Đã cập nhật tệp "${updatedItem.title}" thành công.`);
    refetch();
    // Update currently selected item if still open
    setSelectedItem((prev) => (prev ? { ...prev, ...updatedItem } : null));
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleDeleteSuccess = () => {
    setActionSuccessMessage('Đã xóa tệp tin thành công khỏi hệ thống.');
    setSelectedItem(null);
    refetch();
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const isFilterActive =
    Boolean(filters.search.trim()) ||
    filters.folderId !== 'all' ||
    filters.fileType !== 'all' ||
    filters.isPublished !== 'all';

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Thao tác thư viện:</span>
          {canUpload && (
            <Button
              type="button"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="h-8 text-xs bg-blue-800 text-white hover:bg-blue-900 shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Tải lên tệp tin
            </Button>
          )}
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFolderManageOpen(true)}
              className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <FolderPlus className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
              Quản lý thư mục
            </Button>
          )}
        </div>

        <div className="text-xs text-slate-500 self-end sm:self-center">
          Nhấp vào tệp tin để xem chi tiết, sao chép URL hoặc cập nhật thông tin.
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccessMessage && (
        <Alert
          variant="success"
          title="Thông báo"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />}
        >
          {actionSuccessMessage}
        </Alert>
      )}

      {/* Filters Toolbar */}
      <MediaLibraryFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        totalItems={total}
      />

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Không thể tải danh sách tệp đa phương tiện</h4>
              <p className="text-xs text-red-700">
                {error instanceof Error
                  ? error.message
                  : 'Đã xảy ra lỗi khi kết nối tới máy chủ. Vui lòng thử lại.'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-red-300 text-red-700 hover:bg-red-100 shrink-0 h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Thử lại
          </Button>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        // Loading State: Skeleton Grid
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-2">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-2.5 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          // Loading State: Skeleton Table
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        )
      ) : items.length === 0 ? (
        // Empty States
        isFilterActive ? (
          <EmptyState
            icon={<FolderSearch className="h-8 w-8 text-slate-400" />}
            title="Không tìm thấy tệp phù hợp"
            description="Không có tệp đa phương tiện nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại của bạn."
            actionText="Đặt lại bộ lọc"
            onAction={handleResetFilters}
            className="my-8"
          />
        ) : (
          <EmptyState
            title="Thư viện tệp chưa có dữ liệu"
            description="Kho lưu trữ đa phương tiện của nhà trường hiện chưa có hình ảnh hoặc video nào."
            actionText={canUpload ? 'Tải lên tệp đầu tiên' : undefined}
            onAction={canUpload ? () => setIsUploadOpen(true) : undefined}
            className="my-8"
          />
        )
      ) : (
        // Data Presentation
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((item) => (
                <MediaLibraryCard key={item.id} item={item} onSelect={handleItemClick} />
              ))}
            </div>
          ) : (
            <MediaLibraryTable items={items} onSelect={handleItemClick} />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                Hiển thị trang <span className="font-semibold text-slate-900">{page}</span> /{' '}
                <span className="font-semibold text-slate-900">{totalPages}</span> (Tổng số{' '}
                <span className="font-semibold text-slate-900">{total}</span> tệp)
                {isFetching && <span className="ml-2 text-blue-600 animate-pulse">Đang làm mới...</span>}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Trang trước"
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNumber = idx + 1;
                    if (totalPages > 5) {
                      if (page > 3) {
                        pageNumber = page - 3 + idx;
                        if (pageNumber > totalPages) {
                          pageNumber = totalPages - 4 + idx;
                        }
                      }
                    }

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        aria-label={`Trang ${pageNumber}`}
                        className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                          page === pageNumber
                            ? 'bg-blue-800 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Trang tiếp theo"
                  className="h-8 text-xs"
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Media Modal Dialog */}
      <MediaUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        initialFolderId={
          filters.folderId !== 'all' && filters.folderId !== 'root'
            ? filters.folderId
            : null
        }
      />

      {/* Media Detail & Edit Modal Dialog */}
      <MediaDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onUpdateSuccess={handleUpdateSuccess}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {/* Folder Management Modal Dialog */}
      <MediaFolderManageModal
        isOpen={isFolderManageOpen}
        onClose={() => setIsFolderManageOpen(false)}
        onSelectFolder={(folderId) => {
          setFilters((prev) => ({ ...prev, folderId }));
          setPage(1);
        }}
      />
    </div>
  );
}
