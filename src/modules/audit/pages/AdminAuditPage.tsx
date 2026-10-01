/**
 * Admin Audit Log Page Component
 * School News Platform - Step 10.3
 *
 * Security Invariants:
 * - Read-only investigation console for security-significant events
 * - Zero client-side mutation, edit, delete, or truncate actions
 * - Type-safe classification, result, and action rendering
 * - Multi-dimensional filtering, searching, and server-side pagination
 */

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  RefreshCw,
  Filter,
  Eye,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
} from 'lucide-react';
import { useAuditLogs, useAuditStats } from '../hooks';
import type {
  AuditFilterParams,
  AuditClassification,
  AuditResult,
  AuditLogRecord,
  AuditDateRange,
} from '../types/audit';
import {
  AuditResultBadge,
  AuditClassificationBadge,
  AuditDetailModal,
} from '../components';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  AUDIT_LIMITS,
} from '../config/auditConfig';

export const AdminAuditPage: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<AuditFilterParams>({
    search: '',
    classification: 'ALL',
    result: 'ALL',
    resource: 'ALL',
    dateRange: 'all',
    page: 1,
    pageSize: AUDIT_LIMITS.DEFAULT_PAGE_SIZE,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Inspection modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const {
    logs,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAuditLogs(filters);

  const { stats, refetch: refetchStats } = useAuditStats();

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleClassificationChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      classification: e.target.value as AuditClassification | 'ALL',
      page: 1,
    }));
  };

  const handleResultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      result: e.target.value as AuditResult | 'ALL',
      page: 1,
    }));
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      resource: e.target.value,
      page: 1,
    }));
  };

  const handleDateRangeChange = (range: AuditDateRange) => {
    setFilters((prev) => ({ ...prev, dateRange: range, page: 1 }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      pageSize: Number(e.target.value),
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      classification: 'ALL',
      result: 'ALL',
      resource: 'ALL',
      dateRange: 'all',
      page: 1,
      pageSize: AUDIT_LIMITS.DEFAULT_PAGE_SIZE,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const openLogDetail = (log: AuditLogRecord) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeLogDetail = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.classification && filters.classification !== 'ALL') count++;
    if (filters.result && filters.result !== 'ALL') count++;
    if (filters.resource && filters.resource !== 'ALL') count++;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <div id="admin-audit-page" className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Nhật ký Hoạt động & Kiểm toán Bảo mật
              </h1>
              <p className="text-sm text-slate-500">
                Theo dõi toàn diện lịch sử thao tác quản trị, quyết định phân quyền và các sự kiện bảo mật.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="audit-refresh-btn"
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? 'animate-spin text-blue-600' : 'text-slate-500'}`}
            />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng sự kiện</span>
            <History className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.totalLogs.toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Thành công</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {stats.successCount.toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Bị từ chối (Denied)</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {stats.deniedCount.toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-700">Thất bại (Failure)</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-700">
            {stats.failureCount.toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700">Cảnh báo bảo mật</span>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {stats.securityAlertCount.toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="audit-search-input"
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Tìm theo hành động, người thực hiện, tài nguyên..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Classification Filter */}
          <div className="md:col-span-2">
            <select
              id="audit-filter-classification"
              value={filters.classification || 'ALL'}
              onChange={handleClassificationChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả phân loại</option>
              <option value="AUTH">Xác thực (AUTH)</option>
              <option value="AUTHORIZATION">Ủy quyền (AUTHORIZATION)</option>
              <option value="USER">Người dùng (USER)</option>
              <option value="ROLE">Vai trò & Quyền (ROLE)</option>
              <option value="CONTENT">Nội dung (CONTENT)</option>
              <option value="SETTINGS">Cài đặt (SETTINGS)</option>
              <option value="SECURITY">Bảo mật (SECURITY)</option>
            </select>
          </div>

          {/* Result Filter */}
          <div className="md:col-span-2">
            <select
              id="audit-filter-result"
              value={filters.result || 'ALL'}
              onChange={handleResultChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả kết quả</option>
              <option value="SUCCESS">Thành công (SUCCESS)</option>
              <option value="DENIED">Bị từ chối (DENIED)</option>
              <option value="FAILURE">Thất bại (FAILURE)</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div className="md:col-span-2">
            <select
              id="audit-filter-resource"
              value={filters.resource || 'ALL'}
              onChange={handleResourceChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả tài nguyên</option>
              {Object.entries(AUDIT_RESOURCE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label} ({code})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
            {activeFilterCount > 0 && (
              <button
                id="audit-reset-filters-btn"
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Đặt lại ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Range Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Khung thời gian:
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { key: '24h', label: '24 giờ qua' },
                { key: '7d', label: '7 ngày qua' },
                { key: '30d', label: '30 ngày qua' },
                { key: 'all', label: 'Tất cả' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleDateRangeChange(tab.key)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filters.dateRange === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span>{error || 'Đã xảy ra lỗi khi truy vấn dữ liệu kiểm toán.'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded bg-rose-100 px-3 py-1 font-medium text-rose-700 hover:bg-rose-200"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table
            id="audit-logs-table"
            className="w-full text-left text-sm text-slate-600"
          >
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5">Người thực hiện</th>
                <th className="px-4 py-3.5">Phân loại</th>
                <th className="px-4 py-3.5">Hành động</th>
                <th className="px-4 py-3.5">Tài nguyên</th>
                <th className="px-4 py-3.5">Kết quả</th>
                <th className="px-4 py-3.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-36 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-20 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-44 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-20 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <History className="h-6 w-6" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900">
                      Không có bản ghi nhật ký phù hợp
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem các bản ghi khác.
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Đặt lại bộ lọc
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                // Data Rows
                logs.map((log) => {
                  const actionLabel =
                    AUDIT_ACTION_LABELS[log.action] || log.action;
                  const resourceLabel =
                    AUDIT_RESOURCE_LABELS[log.resource] || log.resource;
                  const formattedTime = new Intl.DateTimeFormat('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(log.created_at));

                  return (
                    <tr
                      key={log.id}
                      id={`audit-row-${log.id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{formattedTime}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
                            {(log.actor_name || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-900">
                              {log.actor_name || 'Khách vãng lai'}
                            </p>
                            <p className="truncate text-[11px] text-slate-400 font-mono">
                              {log.actor_email || 'anonymous'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Classification */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <AuditClassificationBadge
                          classification={log.classification}
                        />
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-medium text-xs text-slate-900 truncate">
                          {actionLabel}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {log.action}
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-slate-700">
                          <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{resourceLabel}</span>
                        </div>
                        {log.resource_id && (
                          <span className="font-mono text-[10px] text-slate-400 truncate block max-w-[120px]">
                            {log.resource_id}
                          </span>
                        )}
                      </td>

                      {/* Result */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <AuditResultBadge result={log.result} size="sm" />
                      </td>

                      {/* Detail Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          id={`audit-view-btn-${log.id}`}
                          type="button"
                          onClick={() => openLogDetail(log)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 px-4 py-3 gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Hiển thị</span>
            <select
              id="audit-pagesize-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>trên tổng số {total.toLocaleString('vi-VN')} bản ghi</span>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <span className="text-xs text-slate-500 mr-2">
              Trang {page} / {totalPages}
            </span>
            <button
              id="audit-first-page-btn"
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(1)}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
              aria-label="Trang đầu"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              id="audit-prev-page-btn"
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              id="audit-next-page-btn"
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              id="audit-last-page-btn"
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-40"
              aria-label="Trang cuối"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Read-Only Detail Modal */}
      <AuditDetailModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={closeLogDetail}
      />
    </div>
  );
};
