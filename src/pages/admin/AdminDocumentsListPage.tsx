/**
 * Admin Documents List Management Page
 * Tabs: Tất cả, Đã xuất bản, Bản nháp, Đã lưu trữ
 * Table, Search, Actions: Create, Edit, Publish/Unpublish, Delete with confirmation
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  Calendar,
  AlertCircle,
  FileText,
  Star,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import {
  DocumentItem,
  DocumentStatus,
  STANDARD_DOCUMENT_TYPES,
} from '../../types/document';
import {
  getAdminDocuments,
  deleteDocument,
  publishDocument,
  unpublishDocument,
  requestDocumentDownload,
} from '../../services/documentService';
import { formatFileSize, getFileTypeInfo } from '../../lib/documentStorage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';

export const AdminDocumentsListPage: React.FC = () => {
  const { can } = usePermissions();
  const canCreate = can('documents.create');
  const canPublish = can('documents.publish');
  const canDelete = can('documents.delete');

  const [items, setItems] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [deleteTargetDoc, setDeleteTargetDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminDocuments({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        documentType: selectedType || undefined,
        searchQuery: searchQuery || undefined,
      });

      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('[AdminDocumentsListPage] Fetch error:', err);
      setNotification({
        type: 'error',
        message: 'Không thể tải danh sách văn bản. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, selectedType, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Status tabs definition
  const tabs: { label: string; value: DocumentStatus | 'all' }[] = [
    { label: 'Tất cả văn bản', value: 'all' },
    { label: 'Đã xuất bản', value: 'published' },
    { label: 'Bản nháp', value: 'draft' },
    { label: 'Đã lưu trữ', value: 'archived' },
  ];

  // Action handlers
  const handleTogglePublish = async (doc: DocumentItem) => {
    setActionLoadingId(doc.id);
    try {
      if (doc.status === 'published') {
        await unpublishDocument(doc.id, 'draft');
        setNotification({
          type: 'success',
          message: `Đã thu hồi văn bản "${doc.document_number}" về bản nháp.`,
        });
      } else {
        await publishDocument(doc.id);
        setNotification({
          type: 'success',
          message: `Đã công khai văn bản "${doc.document_number}" thành công.`,
        });
      }
      await fetchDocuments();
    } catch {
      setNotification({
        type: 'error',
        message: 'Thao tác không thành công. Vui lòng thử lại.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetDoc) return;
    setIsDeleting(true);
    try {
      await deleteDocument(deleteTargetDoc.id);
      setNotification({
        type: 'success',
        message: `Đã xóa văn bản "${deleteTargetDoc.document_number}" thành công.`,
      });
      setDeleteTargetDoc(null);
      await fetchDocuments();
    } catch {
      setNotification({
        type: 'error',
        message: 'Không thể xóa văn bản. Vui lòng thử lại.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-blue-900" />
            <span>Văn bản - Tài liệu</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý và công khai các văn bản chỉ đạo, thông báo, hướng dẫn và biểu mẫu hành chính của nhà trường.
          </p>
        </div>

        {canCreate && (
          <Link to="/admin/documents/new">
            <Button variant="primary" className="bg-blue-900 hover:bg-blue-950 text-white shadow-xs">
              <Plus className="h-4 w-4 mr-2" />
              <span>Thêm văn bản mới</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Toast Notification Alert */}
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
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs & Search Filter Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo số ký hiệu, trích yếu, người ký..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            >
              <option value="">Tất cả loại văn bản</option>
              {STANDARD_DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(searchQuery || selectedType) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('');
                  setPage(1);
                }}
                className="h-9 px-2.5 text-xs text-slate-600"
                title="Xóa bộ lọc tìm kiếm"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                <span>Đặt lại</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-900" />
            <p className="text-sm">Đang tải danh sách văn bản...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-base font-semibold text-slate-700">Chưa có văn bản nào</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không tìm thấy văn bản phù hợp với điều kiện tìm kiếm hoặc bộ lọc hiện tại.
            </p>
            {canCreate && (
              <Link to="/admin/documents/new" className="inline-block mt-2">
                <Button variant="outline" size="sm">
                  Thêm văn bản mới ngay
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Số ký hiệu</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Trích yếu / Tên văn bản</th>
                  <th className="py-3.5 px-4">Cơ quan ban hành</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Ngày ban hành</th>
                  <th className="py-3.5 px-4">Tệp đính kèm</th>
                  <th className="py-3.5 px-4 text-center">Lượt tải</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((doc) => {
                  const typeInfo = getFileTypeInfo(doc.file_type);
                  const isActionLoading = actionLoadingId === doc.id;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Document Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {doc.document_number}
                        </span>
                        {doc.is_featured && (
                          <span
                            className="ml-1.5 inline-flex text-amber-500"
                            title="Văn bản nổi bật"
                          >
                            <Star className="h-3.5 w-3.5 fill-current" />
                          </span>
                        )}
                      </td>

                      {/* Title & Metadata */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="font-semibold text-slate-900 hover:text-blue-900 text-left line-clamp-2 transition-colors cursor-pointer"
                          >
                            {doc.title}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                              {doc.document_type}
                            </span>
                            {doc.signer && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[200px]">
                                  Ký bởi: {doc.signer}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Authority */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {doc.issuing_authority}
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {doc.issue_date}
                      </td>

                      {/* File badge & size */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {formatFileSize(doc.file_size)}
                          </span>
                        </div>
                      </td>

                      {/* Download Count */}
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600">
                        {doc.download_count}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.status === 'published' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đã công khai
                          </span>
                        )}
                        {doc.status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Bản nháp
                          </span>
                        )}
                        {doc.status === 'archived' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            Đã lưu trữ
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Preview button */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Publish / Unpublish button */}
                          {canPublish && (
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(doc)}
                              disabled={isActionLoading}
                              className={`p-1.5 rounded-lg transition-colors ${
                                doc.status === 'published'
                                  ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={
                                doc.status === 'published'
                                  ? 'Thu hồi về bản nháp'
                                  : 'Xuất bản công khai'
                              }
                            >
                              {doc.status === 'published' ? (
                                <Archive className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {/* Edit button */}
                          <Link
                            to={`/admin/documents/${doc.id}/edit`}
                            className="p-1.5 text-blue-900 hover:text-blue-950 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa văn bản"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          {/* Delete button */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTargetDoc(doc)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Xóa văn bản"
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

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <div>
              Trang <strong className="text-slate-900 font-bold">{page}</strong> / {totalPages} (Tổng {total} văn bản)
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Trước</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2"
              >
                <span>Sau</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Document Detail Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        onDownload={async (d) => {
          const res = await requestDocumentDownload(d.id);
          if (res.success && res.url) {
            window.open(res.url, '_blank');
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetDoc)}
        onClose={() => !isDeleting && setDeleteTargetDoc(null)}
        title="Xác nhận xóa văn bản"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa văn bản có số ký hiệu{' '}
            <strong className="text-slate-900 font-bold">
              {deleteTargetDoc?.document_number}
            </strong>{' '}
            - "{deleteTargetDoc?.title}"?
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Lưu ý: Thao tác này sẽ xóa vĩnh viễn dữ liệu văn bản khỏi hệ thống và không thể khôi phục.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTargetDoc(null)}
              disabled={isDeleting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
