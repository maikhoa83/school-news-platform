/**
 * Admin Users & Staff Management Page
 * School News Platform - Step 10.1 Users + RBAC Foundation
 *
 * Provides:
 * - Search by name and email
 * - Filter by role (SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, PUBLIC_VISITOR, ALL)
 * - Filter by status (Active, Inactive, ALL)
 * - Real-time statistics cards (Total, Active, Inactive, Admins)
 * - User Role Assignment with critical Self-Role Escalation Prevention
 * - User Profile & Status editing
 * - Pagination controls and refresh
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Lock,
  ChevronLeft,
  ChevronRight,
  Edit2,
  KeyRound,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  UserPlus,
} from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useRoles } from '../hooks/useRoles';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { UserRoleBadge } from '../components/UserRoleBadge';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { AssignRoleModal } from '../components/AssignRoleModal';
import { UserEditModal } from '../components/UserEditModal';
import { UserCreateModal } from '../components/UserCreateModal';
import { Button } from '../../../components/ui/Button';
import { BASELINE_ROLES } from '../config/userConfig';
import type { UserRecord, RoleCode } from '../types/user';

export const AdminUsersPage: React.FC = () => {
  const { user: currentActor } = useAuth();
  const { can } = usePermissions();

  const canEditUsers = can('users.edit');

  const {
    users,
    total,
    page,
    pageSize,
    totalPages,
    stats,
    isLoading,
    isStatsLoading,
    error,
    params,
    updateFilters,
    refetch,
  } = useUsers();

  const { roles: availableRoles, isLoading: isRolesLoading } = useRoles();

  // Search input state
  const [searchInput, setSearchInput] = useState(params.search || '');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserRecord | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserRecord | null>(null);

  // Success message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    updateFilters({ search: '', role: 'ALL', is_active: 'ALL', page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <UserCheck className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản Lý Người Dùng & Cán Bộ</h1>
              <p className="text-xs text-slate-500">
                Danh sách tài khoản công vụ, trạng thái hoạt động và vai trò phân quyền (RBAC)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEditUsers && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Thêm người dùng mới</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng người dùng</span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {isStatsLoading ? '...' : stats?.totalUsers ?? total}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tài khoản ghi nhận trên hệ thống</span>
        </div>

        {/* Active Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang hoạt động</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {isStatsLoading ? '...' : stats?.activeUsers ?? 0}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Có quyền đăng nhập CMS</span>
        </div>

        {/* Inactive Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã khóa / Tạm dừng</span>
            <span className="p-1.5 bg-rose-50 text-rose-700 rounded-md">
              <UserX className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">
            {isStatsLoading ? '...' : stats?.inactiveUsers ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Bị chặn đăng nhập</span>
        </div>

        {/* Admin Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cán bộ Quản trị</span>
            <span className="p-1.5 bg-purple-50 text-purple-700 rounded-md">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700">
            {isStatsLoading
              ? '...'
              : (stats?.rolesDistribution.SUPER_ADMIN || 0) + (stats?.rolesDistribution.ADMIN || 0)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Quản trị viên & Tối cao</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative grow">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo họ tên hoặc email..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:w-52">
            <select
              value={params.role || 'ALL'}
              onChange={(e) => updateFilters({ role: e.target.value as RoleCode | 'ALL' })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="SUPER_ADMIN">Quản trị viên tối cao</option>
              <option value="ADMIN">Quản trị viên trường</option>
              <option value="EDITOR">Biên tập viên</option>
              <option value="AUTHOR">Cộng tác viên / Tác giả</option>
              <option value="PUBLIC_VISITOR">Khách vãng lai</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-44">
            <select
              value={
                params.is_active === true
                  ? 'true'
                  : params.is_active === false
                  ? 'false'
                  : 'ALL'
              }
              onChange={(e) => {
                const val = e.target.value;
                updateFilters({
                  is_active: val === 'true' ? true : val === 'false' ? false : 'ALL',
                });
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã khóa</option>
            </select>
          </div>

          {/* Search Button */}
          <Button type="submit" variant="primary" size="sm">
            Tìm kiếm
          </Button>

          {/* Reset Filters */}
          {(searchInput || params.role !== 'ALL' || params.is_active !== 'ALL') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-slate-600"
            >
              Xóa bộ lọc
            </Button>
          )}
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <strong className="font-semibold">Lỗi tải dữ liệu:</strong> {error}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Cán bộ / Người dùng</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4">Vai trò phân quyền (RBAC)</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Đang tải danh sách người dùng...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-600">Không tìm thấy người dùng phù hợp</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc phân quyền.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = currentActor?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelf ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-slate-300">
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt={u.full_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              u.full_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{u.full_name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-sm border border-blue-200">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa cập nhật</span>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(u.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* RBAC Roles */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <UserRoleBadge key={r.id} role={r.code} />
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Chưa gán vai trò</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <UserStatusBadge isActive={u.is_active} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Role Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canEditUsers}
                            onClick={() => setSelectedUserForRole(u)}
                            className="h-8 px-2.5 text-xs flex items-center gap-1"
                            title={
                              isSelf
                                ? 'Bạn không thể tự thay đổi vai trò của mình'
                                : 'Phân quyền vai trò'
                            }
                          >
                            {isSelf ? (
                              <Lock className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                            )}
                            <span className="hidden sm:inline">Phân quyền</span>
                          </Button>

                          {/* Edit Profile Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canEditUsers}
                            onClick={() => setSelectedUserForEdit(u)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Hiển thị <strong>{users.length}</strong> / <strong>{total}</strong> tài khoản
            {totalPages > 1 && ` (Trang ${page}/${totalPages})`}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => updateFilters({ page: page - 1 })}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => updateFilters({ page: page + 1 })}
              className="h-7 px-2 text-xs"
            >
              Sau
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Role Assignment Modal */}
      <AssignRoleModal
        isOpen={!!selectedUserForRole}
        onClose={() => setSelectedUserForRole(null)}
        user={selectedUserForRole}
        availableRoles={availableRoles}
        onSuccess={(updated) => {
          showToast(`Đã cập nhật vai trò phân quyền cho ${updated.full_name}`);
          refetch();
        }}
      />

      {/* User Profile Edit Modal */}
      <UserEditModal
        isOpen={!!selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        user={selectedUserForEdit}
        onSuccess={(updated) => {
          showToast(`Đã cập nhật hồ sơ của ${updated.full_name}`);
          refetch();
        }}
      />

      {/* User Create Modal */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newUser) => {
          showToast(`Đã thêm thành công người dùng: ${newUser.full_name}`);
          refetch();
        }}
      />
    </div>
  );
};
