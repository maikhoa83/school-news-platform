/**
 * Admin Pages List Management Page
 * School News Platform - Step 09.5A
 *
 * Provides:
 * - Search by title and content
 * - Filter by status (all, published, draft, archived)
 * - Filter by template (all, default, fullwidth, sidebar, contact)
 * - Filter by parent hierarchy (all vs root only)
 * - Sorting by sort_order, published_at, created_at, updated_at, title
 * - Table view with hierarchical indicators, badges, view count, author
 * - Actions: Preview, Edit, Quick status toggle, Delete with modal confirmation
 * - Proper RBAC permission checks: pages.view, pages.create, pages.edit, pages.delete
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Layers,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Filter,
  Calendar,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../hooks/useAuth';
import { usePages, usePageMutations } from '../hooks';
import { PageStatusBadge } from '../components/PageStatusBadge';
import { PageTemplateBadge } from '../components/PageTemplateBadge';
import { PageDeleteConfirmModal } from '../components/PageDeleteConfirmModal';
import { PageDetailPreviewModal } from '../components/PageDetailPreviewModal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PAGE_STATUS_CONFIG, PAGE_TEMPLATE_CONFIG, PAGE_SORT_OPTIONS } from '../config/pagesConfig';
import type {
  PageWithRelations,
  PageStatus,
  PageTemplate,
  PageSortField,
  PageSortOrder,
} from '../types/page';

export const AdminPagesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();

  const canCreate = can('pages.create');
  const canEdit = can('pages.edit');
  const canDelete = can('pages.delete');

  // Filter & Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<PageTemplate | 'all'>('all');
  const [parentFilter, setParentFilter] = useState<'all' | 'root'>('all');
  const [sortBy, setSortBy] = useState<PageSortField>('sort_order');
  const [sortOrder, setSortOrder] = useState<PageSortOrder>('asc');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query Hook
  const {
    items,
    total,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePages({
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    template: templateFilter === 'all' ? undefined : templateFilter,
    parentId: parentFilter === 'root' ? 'root' : undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  // Mutations
  const { updatePage, deletePage, isUpdating, isDeleting } = usePageMutations();

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modals
  const [previewPage, setPreviewPage] = useState<PageWithRelations | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PageWithRelations | null>(null);

  // Handle Quick Status Toggle (Publish / Unpublish)
  const handleToggleStatus = async (item: PageWithRelations) => {
    if (!canEdit) return;
    try {
      const nextStatus: PageStatus = item.status === 'published' ? 'draft' : 'published';
      await updatePage({
        id: item.id,
        input: {
          status: nextStatus,
          published_at: nextStatus === 'published' ? new Date().toISOString() : undefined,
        },
      });
      setNotification({
        type: 'success',
        message:
          nextStatus === 'published'
            ? `Đã xuất bản trang "${item.title}".`
            : `Đã chuyển trang "${item.title}" về bản nháp.`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Không thể cập nhật trạng thái trang.',
      });
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async (pageId: string) => {
    try {
      await deletePage(pageId);
      setDeleteTarget(null);
      setNotification({
        type: 'success',
        message: 'Đã xóa trang tĩnh thành công.',
      });
      refetch();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Không thể xóa trang. Vui lòng thử lại.',
      });
    }
  };

  // Status Tab List
  const statusTabs: Array<{ key: PageStatus | 'all'; label: string }> = [
    { key: 'all', label: 'Tất cả' },
    { key: 'published', label: PAGE_STATUS_CONFIG.published.label },
    { key: 'draft', label: PAGE_STATUS_CONFIG.draft.label },
    { key: 'archived', label: PAGE_STATUS_CONFIG.archived.label },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Quản trị Nội dung</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Trang thông tin tĩnh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Quản lý các trang giới thiệu trường, cơ cấu tổ chức, truyền thống, quy chế và các trang tĩnh chuyên biệt.
          </p>
        </div>

        {canCreate && (
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/admin/pages/new')}
            className="self-start sm:self-auto shrink-0 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Tạo trang mới</span>
          </Button>
        )}
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg border text-sm flex items-start justify-between gap-3 animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-semibold underline hover:opacity-75"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-800 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
            />
          </div>

          {/* Template Filter */}
          <div className="lg:col-span-3">
            <select
              value={templateFilter}
              onChange={(e) => {
                setTemplateFilter(e.target.value as PageTemplate | 'all');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="all">Tất cả giao diện</option>
              <option value="default">{PAGE_TEMPLATE_CONFIG.default.label}</option>
              <option value="fullwidth">{PAGE_TEMPLATE_CONFIG.fullwidth.label}</option>
              <option value="sidebar">{PAGE_TEMPLATE_CONFIG.sidebar.label}</option>
              <option value="contact">{PAGE_TEMPLATE_CONFIG.contact.label}</option>
            </select>
          </div>

          {/* Hierarchy Filter */}
          <div className="lg:col-span-2">
            <select
              value={parentFilter}
              onChange={(e) => {
                setParentFilter(e.target.value as 'all' | 'root');
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="all">Tất cả cấp bậc</option>
              <option value="root">Chỉ trang gốc (Cấp 1)</option>
            </select>
          </div>

          {/* Sort Option */}
          <div className="lg:col-span-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [PageSortField, PageSortOrder];
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="sort_order-asc">Thứ tự (Nhỏ - Lớn)</option>
              <option value="sort_order-desc">Thứ tự (Lớn - Nhỏ)</option>
              <option value="published_at-desc">Ngày xuất bản (Mới nhất)</option>
              <option value="updated_at-desc">Cập nhật (Gần nhất)</option>
              <option value="title-asc">Tiêu đề (A - Z)</option>
            </select>
          </div>

          {/* Refresh Action */}
          <div className="lg:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Tải lại danh sách"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-blue-700' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-800 border-t-transparent" />
            <p className="text-xs text-slate-500 font-medium">Đang tải danh sách trang tĩnh...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3 bg-red-50/50">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-950">Không thể tải danh sách trang tĩnh</p>
            <p className="text-xs text-red-800 max-w-md mx-auto">
              {error instanceof Error ? error.message : 'Lỗi kết nối cơ sở dữ liệu.'}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Chưa có trang thông tin tĩnh nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {debouncedSearch || statusFilter !== 'all' || templateFilter !== 'all' || parentFilter !== 'all'
                ? 'Không tìm thấy trang nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại.'
                : 'Bắt đầu bằng việc tạo trang giới thiệu trường hoặc cơ cấu tổ chức đầu tiên.'}
            </p>
            {canCreate && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/pages/new')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Tạo trang mới</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[240px]">Trang & Đường dẫn</th>
                  <th className="py-3 px-4">Giao diện</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thứ tự</th>
                  <th className="py-3 px-4 text-center">Lượt xem</th>
                  <th className="py-3 px-4">Tác giả / Ngày</th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item, index) => {
                  const itemNumber = (page - 1) * limit + index + 1;
                  const isAuthor = user?.id === item.author_id;
                  const userCanEdit = canEdit || isAuthor;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                        {itemNumber}
                      </td>

                      {/* Title & Slug & Hierarchy */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {item.parent && (
                              <span
                                title={`Thuộc trang cha: ${item.parent.title}`}
                                className="inline-flex items-center gap-1 text-[11px] font-normal text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0"
                              >
                                <Layers className="h-3 w-3" />
                                <span className="max-w-[100px] truncate">{item.parent.title}</span>
                                <span>/</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setPreviewPage(item)}
                              className="font-semibold text-slate-900 hover:text-blue-700 text-left line-clamp-1 transition-colors"
                            >
                              {item.title}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span className="truncate">/{item.slug}</span>
                            {item.no_index && (
                              <span className="text-amber-600 bg-amber-50 px-1 py-0.2 rounded font-sans text-[10px]">
                                noindex
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Template */}
                      <td className="py-3.5 px-4">
                        <PageTemplateBadge template={item.template} />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <PageStatusBadge status={item.status} />
                      </td>

                      {/* Sort Order */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs">
                          {item.sort_order}
                        </span>
                      </td>

                      {/* View Count */}
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                        {item.view_count || 0}
                      </td>

                      {/* Author & Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-700 truncate max-w-[120px]">
                            {item.author?.full_name || 'Hệ thống'}
                          </p>
                          <p className="text-slate-400">
                            {item.published_at
                              ? new Date(item.published_at).toLocaleDateString('vi-VN')
                              : new Date(item.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewPage(item)}
                            title="Xem nhanh trang"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Quick Publish / Unpublish Toggle */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              disabled={isUpdating}
                              title={
                                item.status === 'published'
                                  ? 'Thu hồi về bản nháp'
                                  : 'Xuất bản công khai'
                              }
                              className={`p-1.5 rounded transition-colors ${
                                item.status === 'published'
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                            </button>
                          )}

                          {/* Edit Page */}
                          {userCanEdit && (
                            <Link
                              to={`/admin/pages/${item.id}/edit`}
                              title="Chỉnh sửa trang"
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}

                          {/* Delete Page */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              disabled={isDeleting}
                              title="Xóa trang"
                              className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && total > 0 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
            <div>
              Hiển thị{' '}
              <span className="font-semibold text-slate-700">
                {(page - 1) * limit + 1} - {Math.min(page * limit, total)}
              </span>{' '}
              trên tổng số <span className="font-semibold text-slate-700">{total}</span> trang tĩnh
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Trước</span>
              </Button>

              <div className="px-2 py-1 text-slate-700 font-medium">
                Trang {page} / {totalPages}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2.5"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <PageDeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        page={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Page Quick Preview Modal */}
      <PageDetailPreviewModal
        isOpen={Boolean(previewPage)}
        page={previewPage}
        onClose={() => setPreviewPage(null)}
        onEdit={(id) => navigate(`/admin/pages/${id}/edit`)}
      />
    </div>
  );
};
