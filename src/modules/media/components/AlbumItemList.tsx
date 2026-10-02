/**
 * Album Items Manager Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Provides:
 * - List of media items in album
 * - Add media button (launches MediaSelectorModal in multiple mode)
 * - Move Up / Move Down accessible reordering (no heavy drag-drop library)
 * - Complete ordered item ID list submission to reorderAlbumItems
 * - "Gỡ khỏi album" action with clear notice that underlying media is not deleted
 * - Signed preview thumbnail rendering
 * - Zero direct Supabase access (consumes useAlbumItems hook)
 */

import React, { useState } from 'react';
import {
  Images,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  AlertCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useAlbumItems } from '../hooks/useAlbumItems';
import { MediaSelectorModal } from './MediaSelectorModal';
import { MediaPreviewItem } from './MediaPreviewItem';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { formatBytes } from '../utils/mediaFormatters';
import type { MediaWithFolder } from '../../../types/media';

export interface AlbumItemListProps {
  albumId: string;
  disabled?: boolean;
}

export function AlbumItemList({ albumId, disabled = false }: AlbumItemListProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [reorderErrorMsg, setReorderErrorMsg] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const {
    items,
    isLoading,
    isError,
    error,
    refetch,
    addMedia,
    isAdding,
    removeMedia,
    isRemoving,
    reorderItems,
    isReordering,
  } = useAlbumItems(albumId);

  // List of existing media IDs in this album
  const existingMediaIds = items.map((item) => item.media_id);

  const handleAddMediaConfirm = async (selectedList: MediaWithFolder[]) => {
    setActionNotice(null);
    setReorderErrorMsg(null);
    try {
      for (const item of selectedList) {
        if (!existingMediaIds.includes(item.id)) {
          await addMedia({ mediaId: item.id });
        }
      }
      setActionNotice(`Đã thêm ${selectedList.length} ảnh vào album thành công.`);
    } catch (err) {
      setReorderErrorMsg(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi khi thêm ảnh vào album.'
      );
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    setReorderErrorMsg(null);
    setActionNotice(null);

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Create new array with swapped item IDs (maintaining full list of item IDs)
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orderedItemIds = newItems.map((item) => item.id);

    try {
      await reorderItems(orderedItemIds);
    } catch (err) {
      setReorderErrorMsg(
        err instanceof Error
          ? err.message
          : 'Không thể sắp xếp lại vị trí ảnh. Hệ thống sẽ tải lại thứ tự gốc.'
      );
      refetch();
    }
  };

  const handleRemoveItem = async (mediaId: string, title?: string) => {
    setActionNotice(null);
    setReorderErrorMsg(null);
    try {
      await removeMedia(mediaId);
      setActionNotice(`Đã gỡ tệp "${title || 'ảnh'}" khỏi album (tệp gốc trong thư viện vẫn an toàn).`);
    } catch (err) {
      setReorderErrorMsg(
        err instanceof Error ? err.message : 'Không thể gỡ ảnh khỏi album.'
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Images className="h-4 w-4 text-blue-800" />
            Danh sách ảnh trong album ({items.length})
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Thêm, sắp xếp thứ tự và quản lý các ảnh xuất hiện trong bộ sưu tập.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={disabled || isAdding || isReordering}
          onClick={() => setIsSelectorOpen(true)}
          className="text-xs h-8 bg-blue-800 hover:bg-blue-900 text-white self-start sm:self-auto shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Thêm ảnh từ thư viện
        </Button>
      </div>

      {/* Notice / Feedback Banner */}
      {actionNotice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Reorder / Mutation Error */}
      {reorderErrorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{reorderErrorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setReorderErrorMsg(null)}
            className="text-red-700 hover:text-red-900 text-xs font-semibold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Query Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Lỗi tải danh sách ảnh album</h4>
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

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white"
            >
              <Skeleton className="h-12 w-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Images className="h-8 w-8 text-slate-400" />}
          title="Chưa có ảnh nào trong album"
          description="Nhấp vào nút 'Thêm ảnh từ thư viện' ở trên để đưa các tệp hình ảnh vào bộ sưu tập này."
          className="my-6 border border-dashed border-slate-200 rounded-xl p-8"
        />
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const media = item.media;
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-colors"
              >
                {/* Left section: Order badge, Thumbnail & Media metadata */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Sort Order Index */}
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold shrink-0">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <MediaPreviewItem
                      filePath={media.file_path}
                      fileType={media.file_type}
                      fileName={media.file_name}
                      altText={media.alt_text || media.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Media Info */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h5
                      className="text-xs font-semibold text-slate-900 truncate"
                      title={media.title || media.file_name}
                    >
                      {media.title || media.file_name}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatBytes(media.file_size)}</span>
                      {media.width && media.height && (
                        <span>
                          • {media.width}×{media.height}
                        </span>
                      )}
                    </div>
                    {item.caption && (
                      <p className="text-[11px] text-slate-600 italic line-clamp-1" title={item.caption}>
                        "{item.caption}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right section: Accessible Reorder buttons & Remove action */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  {/* Move Up */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isFirst || disabled || isReordering}
                    onClick={() => handleMove(index, 'up')}
                    aria-label={`Di chuyển ảnh ${index + 1} lên trên`}
                    className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 border-slate-200"
                    title="Di chuyển lên"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>

                  {/* Move Down */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLast || disabled || isReordering}
                    onClick={() => handleMove(index, 'down')}
                    aria-label={`Di chuyển ảnh ${index + 1} xuống dưới`}
                    className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 border-slate-200"
                    title="Di chuyển xuống"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  {/* Remove from Album Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || isRemoving}
                    onClick={() => handleRemoveItem(item.media_id, media.title || media.file_name)}
                    className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    title="Gỡ ảnh này khỏi album (tệp gốc không bị xóa)"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Gỡ khỏi album
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Selector Modal for adding photos */}
      <MediaSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onConfirm={handleAddMediaConfirm}
        mode="multiple"
        title="Thêm ảnh vào album"
        confirmText="Thêm vào album"
        allowedFileTypes={['image']}
        disabledIds={existingMediaIds}
      />
    </div>
  );
}
