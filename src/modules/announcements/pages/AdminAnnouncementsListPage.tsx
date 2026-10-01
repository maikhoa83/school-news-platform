/**
 * Admin Announcements List Management Page
 * Tabs: Tất cả, Đang hiển thị, Lên lịch, Bản nháp, Đã hết hạn
 * Table, Search, Quick Pin Toggle, View Detail Modal, Delete confirmation
 * School News Platform - Step 07 Thông báo điều hành
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  Plus,
  Search,
  Pin,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../hooks/useAuth';
import {
  AnnouncementItem,
  AnnouncementPriority,
  AnnouncementDerivedStatus,
} from '../types/announcement';
import {
  getAdminAnnouncements,
  deleteAnnouncement,
  togglePinAnnouncement,
} from '../services/announcementService';
import { AnnouncementPriorityBadge } from '../components/AnnouncementPriorityBadge';
import { AnnouncementStatusBadge } from '../components/AnnouncementStatusBadge';
import { AnnouncementDetailModal } from '../components/AnnouncementDetailModal';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export const AdminAnnouncementsListPage: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const canCreate = can('announcements.create');
  const canEdit = can('announcements.edit');
  const canDelete = can('announcements.delete');

  // List State
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [statusTab, setStatusTab] = useState<AnnouncementDerivedStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<AnnouncementPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Loading & Notifications
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [previewItem, setPreviewItem] = useState<AnnouncementItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch admin announcements
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await getAdminAnnouncements({
        page,
        limit: 10,
        derivedStatus: statusTab === 'all' ? undefined : statusTab,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        searchQuery: debouncedSearch || undefined,
      });

      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.warn('[AdminAnnouncementsListPage] Fetch notice:', err);
      const errMsg =
        err instanceof Error ? err.message : 'Không thể tải danh sách thông báo điều hành. Vui lòng thử lại.';
      setFetchError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusTab, priorityFilter, debouncedSearch]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Quick toggle pin handler
  const handleTogglePin = async (item: AnnouncementItem) => {
    if (!canEdit) return;
    setActionLoadingId(item.id);
    const newPin = !item.is_pinned;
    try {
      const res = await togglePinAnnouncement(item.id, newPin);
      if (res.success) {
        setNotification({
          type: 'success',
          message: newPin
            ? `Đã ghim thông báo "${item.title}" lên đầu trang.`
            : `Đã bỏ ghim thông báo "${item.title}".`,
        });
        await fetchAnnouncements();
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Không thể cập nhật trạng thái ghim.',
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Lỗi khi cập nhật trạng thái ghim.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete announcement
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteAnnouncement(deleteTarget.id);
      if (res.success) {
        setNotification({
          type: 'success',
          message: `Đã xóa thông báo "${deleteTarget.title}" thành công.`,
        });
        setDeleteTarget(null);
        await fetchAnnouncements();
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Không thể xóa thông báo.',
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Lỗi khi xóa thông báo.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs: { label: string; value: AnnouncementDerivedStatus | 'all' }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang hiển thị', value: 'published' },
    { label: 'Lên lịch', value: 'scheduled' },
    { label: 'Bản nháp', value: 'draft' },
    { label: 'Đã hết hạn', value: 'expired' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BellRing className="h-7 w-7 text-amber-600" />
            <span>Thông báo điều hành</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị các thông báo chỉ đạo của Ban Giám hiệu, thông báo học vụ, lịch thi và thông báo khẩn cấp.
          </p>
        </div>

        {canCreate && (
          <Link to="/admin/announcements/new">
            <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs">
              <Plus className="h-4 w-4 mr-2" />
              <span>Tạo thông báo mới</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusTab(tab.value);
                setPage(1);
              }}
              className={`py-2.5 px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                statusTab === tab.value
                  ? 'border-amber-600 text-amber-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as AnnouncementPriority | 'all');
                setPage(1);
              }}
              className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="important">Quan trọng</option>
              <option value="normal">Bình thường</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnnouncements}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                  Ghim
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tiêu đề thông báo
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                  Mức độ
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">
                  Trạng thái
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">
                  Thời gian xuất bản
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">
                  Thời hạn
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Đang tải danh sách thông báo...</span>
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center bg-rose-50/40">
                    <AlertCircle className="h-7 w-7 text-rose-500 mx-auto mb-2" />
                    <p className="font-semibold text-rose-800 text-sm">Không thể tải dữ liệu từ máy chủ</p>
                    <p className="text-xs text-rose-600 mt-1 mb-3">{fetchError}</p>
                    <Button variant="outline" size="sm" onClick={fetchAnnouncements} className="border-rose-200 text-rose-700 hover:bg-rose-100">
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      <span>Thử lại</span>
                    </Button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <BellRing className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Không tìm thấy thông báo nào</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử điều chỉnh bộ lọc hoặc tạo thông báo mới.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isOwnDraft = Boolean(user?.id && item.created_by === user.id && item.status === 'draft');
                  const canEditThisItem = canEdit || isOwnDraft;
                  const canDeleteThisItem = canDelete || isOwnDraft;

                  const formattedPubDate = item.published_at
                    ? new Intl.DateTimeFormat('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(item.published_at))
                    : '—';

                  const formattedExpDate = item.expires_at
                    ? new Intl.DateTimeFormat('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(item.expires_at))
                    : 'Vô thời hạn';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.is_pinned ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Pin Toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          disabled={!canEdit || actionLoadingId === item.id}
                          onClick={() => handleTogglePin(item)}
                          title={item.is_pinned ? 'Bỏ ghim thông báo' : 'Ghim thông báo lên đầu'}
                          className={`p-1 rounded-lg transition-colors ${
                            item.is_pinned
                              ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                          } ${!canEdit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          <Pin className={`h-4 w-4 ${item.is_pinned ? 'fill-amber-600' : ''}`} />
                        </button>
                      </td>

                      {/* Title and Excerpt */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="font-semibold text-slate-900 hover:text-blue-700 text-left line-clamp-1 transition-colors"
                          >
                            {item.title}
                          </button>
                          <p className="text-xs text-slate-500 line-clamp-1 font-normal">
                            {item.content}
                          </p>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <AnnouncementPriorityBadge priority={item.priority} />
                      </td>

                      {/* Derived Status */}
                      <td className="px-4 py-3.5">
                        <AnnouncementStatusBadge announcement={item} />
                      </td>

                      {/* Published At */}
                      <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {formattedPubDate}
                        </span>
                      </td>

                      {/* Expires At */}
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {formattedExpDate}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Xem trước"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canEditThisItem && (
                            <Link
                              to={`/admin/announcements/${item.id}/edit`}
                              className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}

                          {canDeleteThisItem && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Xóa thông báo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Tổng số <strong>{total}</strong> thông báo (Trang {page} / {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Trước</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Sau</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xóa thông báo điều hành"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa thông báo{' '}
            <strong className="text-slate-900">"{deleteTarget?.title}"</strong>?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
            Hành động này sẽ gỡ bỏ hoàn toàn thông báo khỏi trang web và cơ sở dữ liệu.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Reader Modal */}
      <AnnouncementDetailModal
        announcement={previewItem}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
};
