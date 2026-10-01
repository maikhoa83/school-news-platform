/**
 * Admin Albums List View Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Implements:
 * - Search by title and description
 * - Publication status filter (All, Published, Draft)
 * - Bounded server-side pagination with controls
 * - Deterministic ordering
 * - Album creation action (links to /admin/albums/new)
 * - Album edit action (links to /admin/albums/:id/edit)
 * - Album delete confirmation dialog with cascade reassurance
 * - Private cover preview via temporary signed URLs
 * - Photos count & publication status badges
 * - Full empty, loading, and error states
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Library,
  Images,
  AlertCircle,
  RefreshCw,
  Calendar,
  CheckCircle2,
  EyeOff,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { MediaPreviewItem } from './MediaPreviewItem';
import { AlbumDeleteDialog } from './AlbumDeleteDialog';
import { useAdminAlbumsList } from '../hooks/useAdminAlbumsList';
import { usePermissions } from '../../../hooks/usePermissions';
import { formatMediaDate } from '../utils/mediaFormatters';
import type { AlbumListParams, AlbumWithItems } from '../../../types/media';

export function AlbumsListView() {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const canCreate = can('media.edit');
  const canEdit = can('media.edit');
  const canDelete = can('media.delete');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Delete dialog state
  const [albumToDelete, setAlbumToDelete] = useState<AlbumWithItems | null>(null);

  const queryParams: AlbumListParams = {
    page,
    pageSize,
    search: search.trim() || undefined,
    isPublished:
      statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  };

  const { items, total, totalPages, isLoading, isFetching, isError, error, refetch } =
    useAdminAlbumsList(queryParams);

  return (
    <div className="space-y-4">
      {/* Top action toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative w-full sm:w-72">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm album..."
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              className="w-full text-xs h-9"
            />
          </div>

          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'published' | 'draft');
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-9"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Create Album Action */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-xs font-medium text-slate-500">
            Tổng số: <strong className="text-slate-900">{total}</strong> album
          </div>

          {canCreate && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/albums/new')}
              className="text-xs h-9 bg-blue-800 hover:bg-blue-900 text-white shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Tạo album mới
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Không thể tải danh sách album</h4>
              <p className="text-xs text-red-700">
                {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu album.'}
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

      {/* Album Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Library className="h-8 w-8 text-slate-400" />}
          title="Chưa có album nào"
          description={
            search.trim() || statusFilter !== 'all'
              ? 'Không tìm thấy bộ sưu tập album nào khớp với điều kiện tìm kiếm hoặc bộ lọc.'
              : 'Hệ thống chưa tạo bộ sưu tập album ảnh nào cho các hoạt động của trường.'
          }
          actionText={canCreate ? 'Tạo album đầu tiên' : undefined}
          onAction={canCreate ? () => navigate('/admin/albums/new') : undefined}
          className="my-8"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((album) => {
            const hasCover = Boolean(album.cover_media?.file_path);
            return (
              <div
                key={album.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:border-blue-400 hover:shadow-md"
              >
                {/* Album Cover Thumbnail */}
                <div
                  onClick={() => canEdit && navigate(`/admin/albums/${album.id}/edit`, { state: { album } })}
                  className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100 cursor-pointer"
                >
                  {hasCover && album.cover_media ? (
                    <MediaPreviewItem
                      filePath={album.cover_media.file_path}
                      fileType={album.cover_media.file_type}
                      fileName={album.cover_media.file_name}
                      altText={album.cover_media.alt_text || album.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <Images className="h-8 w-8 mb-1 text-slate-300" />
                      <span className="text-xs">Chưa đặt ảnh bìa</span>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {album.is_published ? (
                      <Badge variant="success" className="text-[10px] bg-emerald-50/95 backdrop-blur-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        Công khai
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-white/95 text-slate-500">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Bản nháp
                      </Badge>
                    )}
                  </div>

                  {/* Items count badge */}
                  <div className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs flex items-center gap-1">
                    <Images className="h-3 w-3" />
                    <span>{album.items_count || 0} ảnh</span>
                  </div>
                </div>

                {/* Album Info */}
                <div className="flex flex-1 flex-col p-4 space-y-2 text-left">
                  <div className="space-y-1">
                    <h4
                      onClick={() => canEdit && navigate(`/admin/albums/${album.id}/edit`, { state: { album } })}
                      className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-800 transition-colors cursor-pointer"
                      title={album.title}
                    >
                      {album.title}
                    </h4>
                    {album.description && (
                      <p className="text-xs text-slate-500 line-clamp-2" title={album.description}>
                        {album.description}
                      </p>
                    )}
                  </div>

                  {/* Footer metadata & action buttons */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatMediaDate(album.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/albums/${album.id}/edit`, { state: { album } })
                          }
                          className="h-7 px-2 text-xs text-slate-700 hover:text-blue-800 border-slate-200"
                          title="Chỉnh sửa album & ảnh"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Sửa
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAlbumToDelete(album)}
                          className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 border-red-200"
                          title="Xóa album"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-xs">
          <div className="text-slate-500">
            Hiển thị trang <strong className="text-slate-900">{page}</strong> trên tổng số{' '}
            <strong className="text-slate-900">{totalPages}</strong> trang
          </div>

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
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlbumDeleteDialog
        isOpen={Boolean(albumToDelete)}
        album={albumToDelete}
        onClose={() => setAlbumToDelete(null)}
        onDeleted={() => {
          setAlbumToDelete(null);
          refetch();
        }}
      />
    </div>
  );
}
