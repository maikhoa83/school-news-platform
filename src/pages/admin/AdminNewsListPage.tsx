/**
 * Admin News List Management Page
 * Tabs: Tất cả, Bản nháp, Chờ duyệt, Đã xuất bản, Đã lưu trữ
 * Action triggers: Edit, Submit, Publish, Archive, Delete
 * School News Platform - Step 05 News Module
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  Archive,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAdminNews } from '../../hooks/useAdminNews';
import { usePermissions } from '../../hooks/usePermissions';
import { NewsStatusBadge } from '../../components/admin/news/NewsStatusBadge';
import { NewsPagination } from '../../components/news/NewsPagination';
import { NewsStatus } from '../../types/news';

export const AdminNewsListPage: React.FC = () => {
  const {
    items,
    page,
    totalPages,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    setPage,
    isLoading,
    actionLoadingId,
    error,
    submitNews,
    publishNews,
    archiveNews,
    deleteNews,
  } = useAdminNews();

  const { can } = usePermissions();
  const canCreate = can('news.create');
  const canPublish = can('news.publish');
  const canDelete = can('news.delete');

  const tabs: { label: string; value: NewsStatus | 'all' }[] = [
    { label: 'Tất cả bài viết', value: 'all' },
    { label: 'Đã xuất bản', value: 'published' },
    { label: 'Chờ kiểm duyệt', value: 'pending' },
    { label: 'Bản nháp', value: 'draft' },
    { label: 'Đã lưu trữ', value: 'archived' },
  ];

  const handleAction = async (action: 'submit' | 'publish' | 'archive' | 'delete', id: string) => {
    if (action === 'delete' && !window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      return;
    }

    if (action === 'submit') await submitNews(id);
    if (action === 'publish') await publishNews(id);
    if (action === 'archive') await archiveNews(id);
    if (action === 'delete') await deleteNews(id);
  };

  return (
    <div id="admin-news-list-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Quản trị Tin tức
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Quản lý bài viết, quy trình gửi duyệt, xuất bản tin tức và thông báo của trường
          </p>
        </div>

        {canCreate && (
          <Link
            to="/admin/news/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Viết bài mới</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-neutral-100">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề bài viết..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Đang tải danh sách bài viết...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs">
            Không tìm thấy bài viết nào trong danh mục này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-bold">
                  <th className="py-3 px-4">Bài viết</th>
                  <th className="py-3 px-4">Chuyên mục</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Tác giả</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item) => {
                  const isActionLoading = actionLoadingId === item.id;
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString('vi-VN')
                    : '';

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-start gap-3">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt=""
                              className="w-12 h-10 object-cover rounded-lg shrink-0 bg-neutral-100 border border-neutral-200"
                            />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 shrink-0">
                              <Eye className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/admin/news/${item.id}/edit`}
                              className="font-bold text-neutral-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                            >
                              {item.title}
                            </Link>
                            {item.is_featured && (
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-600">
                                ★ Nổi bật
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700 whitespace-nowrap">
                        {item.category?.name || 'Chưa phân loại'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <NewsStatusBadge status={item.status} />
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">
                        {item.author?.full_name || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          {dateStr}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Public View link if published */}
                          {item.status === 'published' && (
                            <Link
                              to={`/news/${item.slug}`}
                              target="_blank"
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Xem trên trang công khai"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Edit button */}
                          <Link
                            to={`/admin/news/${item.id}/edit`}
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Submit button (if draft) */}
                          {item.status === 'draft' && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleAction('submit', item.id)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-50 transition-colors"
                              title="Gửi duyệt bài viết"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Publish button (requires news.publish) */}
                          {canPublish && item.status !== 'published' && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleAction('publish', item.id)}
                              className="p-1.5 text-green-600 hover:text-green-800 rounded-lg hover:bg-green-50 transition-colors"
                              title="Xuất bản ngay"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive button */}
                          {item.status === 'published' && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleAction('archive', item.id)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Lưu trữ bài viết"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete button */}
                          {canDelete && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleAction('delete', item.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                              title="Xóa bài viết"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Pagination */}
      <NewsPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};
