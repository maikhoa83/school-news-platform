/**
 * Admin Album Editor Page Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Capabilities:
 * - Create mode (/admin/albums/new)
 * - Edit mode (/admin/albums/:id/edit)
 * - Album metadata form (title, slug, description, cover_media_id, is_published)
 * - Album items management (add photos, move up/down, remove from album)
 * - Direct delete action with confirmation dialog
 * - Zero direct Supabase access
 */

import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Library,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Images,
} from 'lucide-react';
import { AlbumForm } from '../components/AlbumForm';
import { AlbumItemList } from '../components/AlbumItemList';
import { AlbumDeleteDialog } from '../components/AlbumDeleteDialog';
import { useAlbumDetail } from '../hooks/useAlbumDetail';
import { useAlbumMutations } from '../hooks/useAlbumMutations';
import { usePermissions } from '../../../hooks/usePermissions';
import { Button } from '../../../components/ui/Button';
import type { AlbumFormValues } from '../schemas/mediaSchema';
import type { AlbumWithItems } from '../../../types/media';

export function AdminAlbumEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const initialAlbumState = (location.state as { album?: AlbumWithItems } | undefined)?.album;

  const { can } = usePermissions();
  const canDelete = can('media.delete');

  const { album, isLoading: isLoadingAlbum, isError, error } = useAlbumDetail(id, initialAlbumState);
  const { createAlbum, updateAlbum, isCreating, isUpdating } = useAlbumMutations();

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSubmit = async (values: AlbumFormValues) => {
    setFeedback(null);
    try {
      if (isEditMode && id) {
        await updateAlbum({ id, data: values });
        setFeedback({
          type: 'success',
          message: 'Đã cập nhật thông tin album thành công.',
        });
      } else {
        const created = await createAlbum(values);
        // After creating, redirect directly to edit mode so user can add photos to the album
        navigate(`/admin/albums/${created.id}/edit`, {
          state: { album: created },
          replace: true,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu album.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link
              to="/admin/albums"
              className="flex items-center gap-1 text-slate-500 hover:text-blue-800 transition-colors"
            >
              <Library className="h-3.5 w-3.5" />
              Bộ sưu tập Album
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">
              {isEditMode ? 'Chỉnh sửa album' : 'Tạo album mới'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {isEditMode ? (
              <>
                <Images className="h-6 w-6 text-blue-800 shrink-0" />
                <span className="truncate max-w-lg">{album?.title || 'Chỉnh sửa album'}</span>
              </>
            ) : (
              'Tạo album ảnh mới'
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/albums')}
            className="text-xs h-9 border-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Quay lại danh sách
          </Button>

          {isEditMode && canDelete && album && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-xs h-9 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Xóa album
            </Button>
          )}
        </div>
      </div>

      {/* Feedback alerts */}
      {feedback && (
        <div
          className={`rounded-xl p-4 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading state in edit mode */}
      {isEditMode && isLoadingAlbum ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
          <p className="text-xs text-slate-500">Đang tải thông tin album...</p>
        </div>
      ) : isEditMode && isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <h3 className="text-sm font-semibold text-red-900">Không thể tải thông tin album</h3>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            {error instanceof Error ? error.message : 'Album có thể đã bị xóa hoặc bạn không có quyền truy cập.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/albums')}
            className="text-xs border-red-300 text-red-700 hover:bg-red-100"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Trở về danh sách album
          </Button>
        </div>
      ) : (
        /* Layout: Create mode is a centered single-card, Edit mode is a 2-column layout */
        <div
          className={
            isEditMode
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
              : 'max-w-2xl mx-auto'
          }
        >
          {/* Album Information Form Card */}
          <div
            className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs ${
              isEditMode ? 'lg:col-span-5' : 'w-full'
            }`}
          >
            <div className="border-b border-slate-200 pb-3 mb-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Thông tin cơ bản của album
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tiêu đề, đường dẫn slug và ảnh đại diện cho bộ sưu tập.
              </p>
            </div>

            <AlbumForm
              initialData={album}
              onSubmit={handleSubmit}
              isLoading={isCreating || isUpdating}
              submitButtonText={isEditMode ? 'Lưu thay đổi' : 'Tạo album & tiếp tục'}
            />
          </div>

          {/* Album Items Manager (Visible only in Edit Mode) */}
          {isEditMode && id && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-7">
              <AlbumItemList albumId={id} />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {album && (
        <AlbumDeleteDialog
          isOpen={isDeleteDialogOpen}
          album={album}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDeleted={() => {
            navigate('/admin/albums', { replace: true });
          }}
        />
      )}
    </div>
  );
}
