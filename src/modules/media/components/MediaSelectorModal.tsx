/**
 * Reusable Media / Image Selector Modal Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Core Capabilities:
 * - Single-select mode (e.g. album cover selection)
 * - Multi-select mode (e.g. adding photos to album)
 * - Server-side bounded pagination & search via useMediaLibrary
 * - Folder filtering via useMediaFolders
 * - Media type filtering (image, video, all)
 * - Private media preview strictly via temporary signed URLs
 * - Selection badge & visual ring indicators
 * - Fully keyboard accessible (Enter, Space, Escape, Tab navigation)
 * - Zero direct Supabase access (consumes useMediaLibrary & useMediaFolders)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  Folder,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  FolderSearch,
} from 'lucide-react';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useMediaFolders } from '../hooks/useMediaFolders';
import { MediaPreviewItem } from './MediaPreviewItem';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { formatBytes } from '../utils/mediaFormatters';
import type { MediaFileType, MediaListParams, MediaWithFolder } from '../../../types/media';

export interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: MediaWithFolder[]) => void;
  mode?: 'single' | 'multiple';
  title?: string;
  confirmText?: string;
  selectedIds?: string[];
  disabledIds?: string[]; // IDs already in album / disabled from re-adding
  allowedFileTypes?: MediaFileType[];
}

export function MediaSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  mode = 'single',
  title = 'Chọn tệp từ Thư viện đa phương tiện',
  confirmText = 'Xác nhận chọn',
  selectedIds: initialSelectedIds = [],
  disabledIds = [],
  allowedFileTypes,
}: MediaSelectorModalProps) {
  const [selectedMap, setSelectedMap] = useState<Map<string, MediaWithFolder>>(new Map());
  const [search, setSearch] = useState('');
  const [folderId, setFolderId] = useState<string>('all');
  const [fileType, setFileType] = useState<MediaFileType | 'all'>(
    allowedFileTypes && allowedFileTypes.length === 1 ? allowedFileTypes[0] : 'all'
  );
  const [page, setPage] = useState(1);
  const pageSize = 18;

  const disabledIdSet = new Set(disabledIds);

  // Sync initial selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMap(new Map());
      setPage(1);
      setSearch('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch folders for filter
  const { folders } = useMediaFolders();

  // Query media with server-side pagination & filters
  const queryParams: MediaListParams = {
    page,
    pageSize,
    search: search.trim() || undefined,
    folderId: folderId === 'all' ? undefined : folderId === 'root' ? null : folderId,
    fileType: fileType === 'all' ? undefined : fileType,
    sortBy: 'created_at',
    sortOrder: 'desc',
  };

  const { items, total, totalPages, isLoading, isFetching, isError, error, refetch } =
    useMediaLibrary(queryParams);

  if (!isOpen) return null;

  const handleToggleSelect = (item: MediaWithFolder) => {
    if (disabledIdSet.has(item.id)) return;

    if (mode === 'single') {
      const nextMap = new Map<string, MediaWithFolder>();
      nextMap.set(item.id, item);
      setSelectedMap(nextMap);
    } else {
      const nextMap = new Map(selectedMap);
      if (nextMap.has(item.id)) {
        nextMap.delete(item.id);
      } else {
        nextMap.set(item.id, item);
      }
      setSelectedMap(nextMap);
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedMap.values()));
    onClose();
  };

  const selectedCount = selectedMap.size;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="flex flex-col w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 id="media-selector-title" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'single'
                ? 'Nhấp vào một hình ảnh để chọn làm ảnh bìa.'
                : 'Nhấp để chọn một hoặc nhiều hình ảnh thêm vào album.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ chọn tệp"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm tệp theo tiêu đề, tên tệp..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Folder filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Folder className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={folderId}
                onChange={(e) => {
                  setFolderId(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Tất cả thư mục</option>
                <option value="root">Thư mục gốc (chưa phân loại)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.media_count || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* File type filter */}
            {(!allowedFileTypes || allowedFileTypes.length > 1) && (
              <div className="relative sm:w-36">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={fileType}
                  onChange={(e) => {
                    setFileType(e.target.value as MediaFileType | 'all');
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">Tất cả định dạng</option>
                  <option value="image">Hình ảnh</option>
                  <option value="video">Video</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Media Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[360px]">
          {/* Error State */}
          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Lỗi khi tải tệp đa phương tiện</h4>
                  <p className="text-xs text-red-700">
                    {error instanceof Error ? error.message : 'Vui lòng thử lại sau.'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-red-300 text-red-700 hover:bg-red-100 shrink-0 h-8 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Thử lại
              </Button>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-2 space-y-2">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<FolderSearch className="h-8 w-8 text-slate-400" />}
              title="Không có tệp phù hợp"
              description="Không tìm thấy tệp tin nào phù hợp với bộ lọc hiện tại trong Thư viện đa phương tiện."
              className="my-10"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((item) => {
                const isSelected = selectedMap.has(item.id);
                const isDisabled = disabledIdSet.has(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => !isDisabled && handleToggleSelect(item)}
                    onKeyDown={(e) => {
                      if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleToggleSelect(item);
                      }
                    }}
                    role={mode === 'single' ? 'radio' : 'checkbox'}
                    aria-checked={isSelected}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                    className={`group relative flex flex-col rounded-xl border overflow-hidden transition-all text-left ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50'
                        : isSelected
                        ? 'border-blue-700 ring-2 ring-blue-700 shadow-md cursor-pointer bg-blue-50/20'
                        : 'border-slate-200 hover:border-blue-400 hover:shadow-xs cursor-pointer bg-white'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <MediaPreviewItem
                        filePath={item.file_path}
                        fileType={item.file_type}
                        fileName={item.file_name}
                        altText={item.alt_text}
                        className="h-full w-full object-cover"
                      />

                      {/* Selection Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-blue-800 text-white flex items-center justify-center shadow-md animate-in zoom-in-50 duration-150">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Disabled "Already in album" Badge */}
                      {isDisabled && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center p-2 text-center">
                          <span className="text-[10px] font-semibold text-white bg-slate-800/90 px-1.5 py-0.5 rounded">
                            Đã trong album
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata summary */}
                    <div className="p-2 space-y-0.5">
                      <p
                        className="text-xs font-medium text-slate-800 truncate"
                        title={item.title || item.file_name}
                      >
                        {item.title || item.file_name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{formatBytes(item.file_size)}</span>
                        {item.width && item.height && (
                          <span>
                            {item.width}×{item.height}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination & Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50/80">
          {/* Pagination Controls */}
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Trước
              </Button>
              <span className="text-xs text-slate-600">
                Trang <strong className="text-slate-900">{page}</strong> / {totalPages} (Tổng số {total} tệp)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 text-xs"
              >
                Sau
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Hiển thị <strong className="text-slate-900">{total}</strong> tệp trong thư viện
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs border-slate-200"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={selectedCount === 0}
              onClick={handleConfirm}
              className="h-8 text-xs bg-blue-800 hover:bg-blue-900 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {confirmText} {selectedCount > 0 ? `(${selectedCount})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
