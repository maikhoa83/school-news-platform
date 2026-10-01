/**
 * Album Delete Confirmation Dialog Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Invariants:
 * - Explicit confirmation required
 * - Clearly displays album title
 * - Clarifies album_items cascade deletion
 * - Explicitly reassures that underlying Media files are NOT deleted
 * - Consumes useAlbumMutations hook (no direct Supabase calls)
 */

import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAlbumMutations } from '../hooks/useAlbumMutations';
import type { Album } from '../../../types/media';

export interface AlbumDeleteDialogProps {
  isOpen: boolean;
  album: Album | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function AlbumDeleteDialog({
  isOpen,
  album,
  onClose,
  onDeleted,
}: AlbumDeleteDialogProps) {
  const { deleteAlbum, isDeleting, deleteError } = useAlbumMutations();

  if (!isOpen || !album) return null;

  const handleConfirmDelete = async () => {
    try {
      await deleteAlbum(album.id);
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error('Delete album error:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-album-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="delete-album-title" className="text-base font-semibold text-slate-900">
                Xác nhận xóa album
              </h3>
              <p className="text-xs text-slate-500">Thao tác này không thể hoàn tác</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Đóng hộp thoại"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description & Invariant Reassurance */}
        <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <p>
            Bạn có chắc chắn muốn xóa album:{' '}
            <strong className="text-slate-900 font-semibold break-all">"{album.title}"</strong>?
          </p>
          <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-amber-900 space-y-1">
            <p className="font-medium text-[11px]">Lưu ý quan trọng về dữ liệu:</p>
            <p className="text-[11px] leading-relaxed">
              Toàn bộ liên kết ảnh thuộc album này sẽ bị hủy. Tuy nhiên, <strong>các tệp hình ảnh gốc trong Thư viện đa phương tiện vẫn được giữ nguyên</strong> và hoàn toàn KHÔNG bị xóa khỏi hệ thống.
            </p>
          </div>
        </div>

        {/* Error message if any */}
        {deleteError && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {deleteError instanceof Error ? deleteError.message : 'Không thể xóa album. Vui lòng thử lại sau.'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs border-slate-200"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Xác nhận xóa album
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
