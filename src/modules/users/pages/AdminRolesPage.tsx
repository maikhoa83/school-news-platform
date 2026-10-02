/**
 * Admin Roles & Permissions Matrix Page
 * School News Platform - Step 10.2: Role × Permission Matrix & Authorization Hardening
 *
 * Provides:
 * - 2D Matrix (Resources / Permissions as Rows × Roles as Columns)
 * - Filtering by Resource, Action Group (READ, WRITE, PUBLISH, DELETE, MANAGE), and Role
 * - Search by permission code or description
 * - SUPER_ADMIN wildcard (*) visual notice
 * - System Role Immutability banner and badge
 * - Read-only inspection (Zero mutation capability for system roles)
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  RefreshCw,
  Eye,
  Users,
  Lock,
  Search,
  CheckCircle2,
  Minus,
  Star,
  Layers,
  Sparkles,
  Info,
  Filter,
} from 'lucide-react';
import { useRoles } from '../hooks/useRoles';
import { RoleDetailModal } from '../components/RoleDetailModal';
import { UserRoleBadge } from '../components/UserRoleBadge';
import { Button } from '../../../components/ui/Button';
import { BASELINE_ROLES, RESOURCE_LABELS } from '../config/userConfig';
import {
  APP_PERMISSIONS,
  APP_ROLES,
  ROLE_PERMISSIONS_MATRIX,
} from '../../../lib/authorization/matrix';
import type {
  AppPermission,
  AppRole,
  PermissionActionGroup,
} from '../../../lib/authorization/types';
import type { RoleWithPermissions } from '../types/user';

const ACTION_GROUP_BADGES: Record<
  PermissionActionGroup,
  { label: string; bg: string; text: string; border: string }
> = {
  READ: {
    label: 'Xem / Đọc (READ)',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  WRITE: {
    label: 'Tạo / Sửa (WRITE)',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  PUBLISH: {
    label: 'Xuất bản (PUBLISH)',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  DELETE: {
    label: 'Xóa (DELETE)',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
  MANAGE: {
    label: 'Quản trị (MANAGE)',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
};

export const AdminRolesPage: React.FC = () => {
  const { roles, permissions, isLoading, error, refetch } = useRoles();
  const [activeTab, setActiveTab] = useState<'matrix' | 'cards'>('matrix');
  const [selectedRoleForDetail, setSelectedRoleForDetail] =
    useState<RoleWithPermissions | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [actionGroupFilter, setActionGroupFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Roles map from database for runtime permission check
  const dbRoleMap = useMemo(() => {
    const map = new Map<string, RoleWithPermissions>();
    roles.forEach((r) => map.set(r.code, r));
    return map;
  }, [roles]);

  // Unique resources from authoritative catalog
  const uniqueResources = useMemo(() => {
    const set = new Set<string>();
    APP_PERMISSIONS.forEach((p) => set.add(p.resource));
    return Array.from(set);
  }, []);

  // Filtered permission definitions
  const filteredPermissions = useMemo(() => {
    return APP_PERMISSIONS.filter((p) => {
      // Resource filter
      if (resourceFilter !== 'all' && p.resource !== resourceFilter) {
        return false;
      }

      // Action group filter
      if (actionGroupFilter !== 'all' && p.actionGroup !== actionGroupFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesResource = p.resource.toLowerCase().includes(q);
        if (!matchesCode && !matchesDesc && !matchesResource) {
          return false;
        }
      }

      // Role filter: if a specific role is selected, only show permissions that this role holds
      if (roleFilter !== 'all') {
        const rCode = roleFilter as AppRole;
        if (rCode === 'SUPER_ADMIN') {
          // SUPER_ADMIN has wildcard, holds everything
          return true;
        }
        const dbRole = dbRoleMap.get(rCode);
        const hasPerm = dbRole
          ? dbRole.permission_codes.includes(p.code)
          : ROLE_PERMISSIONS_MATRIX[rCode]?.permissions.includes(p.code);
        if (!hasPerm) return false;
      }

      return true;
    });
  }, [resourceFilter, actionGroupFilter, searchQuery, roleFilter, dbRoleMap]);

  // Group filtered permissions by resource for matrix grouping
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, typeof filteredPermissions>();
    filteredPermissions.forEach((p) => {
      if (!map.has(p.resource)) {
        map.set(p.resource, []);
      }
      map.get(p.resource)!.push(p);
    });
    return map;
  }, [filteredPermissions]);

  // Helper to determine if role has permission
  const checkRolePermission = (roleCode: AppRole, permCode: AppPermission): boolean => {
    if (roleCode === 'SUPER_ADMIN') return true;
    const dbRole = dbRoleMap.get(roleCode);
    if (dbRole) {
      return dbRole.permission_codes.includes(permCode);
    }
    // Fallback to reference matrix
    return ROLE_PERMISSIONS_MATRIX[roleCode]?.permissions.includes(permCode) ?? false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Ma Trận Vai Trò & Phân Quyền (RBAC)
            </h1>
            <p className="text-xs text-slate-500">
              Hệ thống kiểm soát truy cập phân tầng theo chuẩn 5 vai trò cố định & 40 quyền hạn hệ thống
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab switchers */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Ma trận 2D
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Thẻ vai trò
            </button>
          </div>

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

      {/* System Roles Immutability Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
        <Lock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900 uppercase tracking-wide">
              Bảo vệ vai trò hệ thống (Immutable System Roles)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
              CHỈ ĐỌC (READ-ONLY)
            </span>
          </div>
          <p className="text-amber-900 leading-relaxed">
            Hệ thống quản lý chính xác <strong>5 vai trò hệ thống</strong> (
            <code className="font-mono font-bold">SUPER_ADMIN</code>,{' '}
            <code className="font-mono font-bold">ADMIN</code>,{' '}
            <code className="font-mono font-bold">EDITOR</code>,{' '}
            <code className="font-mono font-bold">AUTHOR</code>,{' '}
            <code className="font-mono font-bold">PUBLIC_VISITOR</code>) và{' '}
            <strong>40 quyền hạn bảo mật</strong>. Nhằm ngăn chặn nguy cơ leo thang đặc quyền, định
            nghĩa vai trò và phân quyền được cố định tại tầng cơ sở dữ liệu và bảo vệ bởi Row Level
            Security (RLS).
          </p>
        </div>
      </div>

      {/* Super Admin Wildcard Behavior Notice */}
      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-700" />
          <span>
            <strong>SUPER_ADMIN Wildcard (*):</strong> Vai trò Quản trị viên tối cao tự động sở hữu toàn bộ 40 quyền trong hệ thống và bypass các kiểm tra giới hạn.
          </span>
        </div>
        <span className="text-[11px] font-mono text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
          Authorization: "*"
        </span>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
          <Info className="h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <strong className="font-semibold">Lỗi nạp dữ liệu:</strong> {error}
          </div>
        </div>
      )}

      {/* TAB 1: ROLE × PERMISSION 2D MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Matrix Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mã quyền (vd: news.publish) hoặc mô tả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Resource count indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Hiển thị <strong>{filteredPermissions.length}</strong> / {APP_PERMISSIONS.length} quyền
                </span>
                {(resourceFilter !== 'all' || actionGroupFilter !== 'all' || roleFilter !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setResourceFilter('all');
                      setActionGroupFilter('all');
                      setRoleFilter('all');
                    }}
                    className="text-blue-600 hover:underline font-medium ml-1"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              {/* Resource Filter */}
              <div className="flex items-center gap-1.5 mr-3">
                <span className="text-slate-400 font-medium text-[11px]">Tài nguyên:</span>
                <select
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tất cả ({uniqueResources.length} tài nguyên)</option>
                  {uniqueResources.map((res) => (
                    <option key={res} value={res}>
                      {RESOURCE_LABELS[res] || res} ({res})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Group Filter */}
              <div className="flex items-center gap-1.5 mr-3">
                <span className="text-slate-400 font-medium text-[11px]">Nhóm hành động:</span>
                <select
                  value={actionGroupFilter}
                  onChange={(e) => setActionGroupFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tất cả nhóm hành động</option>
                  <option value="READ">Xem / Đọc (READ)</option>
                  <option value="WRITE">Tạo / Sửa (WRITE)</option>
                  <option value="PUBLISH">Xuất bản (PUBLISH)</option>
                  <option value="DELETE">Xóa (DELETE)</option>
                  <option value="MANAGE">Quản trị (MANAGE)</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium text-[11px]">Lọc theo vai trò:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Tất cả vai trò</option>
                  {APP_ROLES.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2D Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold min-w-[280px]">
                      Quyền hạn & Mã định danh ({filteredPermissions.length})
                    </th>
                    {APP_ROLES.map((role) => (
                      <th
                        key={role.code}
                        className={`py-3 px-3 text-center font-semibold min-w-[130px] border-l border-slate-800 ${
                          roleFilter === role.code ? 'bg-blue-900/60' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold">{role.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">
                            {role.code}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-xs">
                  {groupedPermissions.size === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Không tìm thấy quyền nào phù hợp với điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    Array.from(groupedPermissions.entries()).map(([resource, perms]) => {
                      const resLabel = RESOURCE_LABELS[resource] || resource.toUpperCase();

                      return (
                        <React.Fragment key={resource}>
                          {/* Resource Group Divider Header */}
                          <tr className="bg-slate-100/80 border-t-2 border-slate-300">
                            <td
                              colSpan={6}
                              className="py-2.5 px-4 font-bold text-slate-800 text-xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-600" />
                                <span>{resLabel}</span>
                                <span className="text-[11px] font-mono text-slate-500 font-normal">
                                  ({resource})
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {perms.length} quyền
                              </span>
                            </td>
                          </tr>

                          {/* Permission Rows */}
                          {perms.map((p) => {
                            const actionBadge = ACTION_GROUP_BADGES[p.actionGroup];

                            return (
                              <tr
                                key={p.code}
                                className="hover:bg-blue-50/30 transition-colors"
                              >
                                {/* Permission Details */}
                                <td className="py-2.5 px-4">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-semibold text-slate-900">
                                        {p.code}
                                      </span>
                                      <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${actionBadge.bg} ${actionBadge.text} ${actionBadge.border}`}
                                      >
                                        {p.actionGroup}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-1">
                                      {p.description}
                                    </p>
                                  </div>
                                </td>

                                {/* Role Columns */}
                                {APP_ROLES.map((role) => {
                                  const isSuperAdmin = role.code === 'SUPER_ADMIN';
                                  const hasPerm = checkRolePermission(role.code, p.code);

                                  return (
                                    <td
                                      key={role.code}
                                      className={`py-2.5 px-3 text-center border-l border-slate-100 ${
                                        roleFilter === role.code ? 'bg-blue-50/40' : ''
                                      }`}
                                    >
                                      {isSuperAdmin ? (
                                        <div
                                          className="inline-flex items-center justify-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200"
                                          title="SUPER_ADMIN có quyền wildcard (*)"
                                        >
                                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                                          <span className="text-[10px] font-bold font-mono">*</span>
                                        </div>
                                      ) : hasPerm ? (
                                        <div
                                          className="inline-flex items-center justify-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                                          title={`Được cấp quyền ${p.code}`}
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                      ) : (
                                        <div
                                          className="inline-flex items-center justify-center text-slate-300"
                                          title="Không có quyền"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE CARDS (Visual Overview) */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
              <span>Đang tải danh sách vai trò...</span>
            </div>
          ) : (
            roles.map((r) => {
              const meta = BASELINE_ROLES[r.code];
              const isSuperAdmin = r.code === 'SUPER_ADMIN';

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2">
                      <UserRoleBadge role={r.code} />
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        {r.code}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-slate-900 mt-3">
                      {meta?.name || r.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {meta?.description || r.description}
                    </p>

                    {/* Stats & Scope */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Người dùng gán:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Users className="h-3.5 w-3.5 text-blue-600" />
                          {r.user_count ?? 0} tài khoản
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Quyền kích hoạt:</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          {isSuperAdmin ? 'Toàn bộ (*)' : `${r.permissions.length} quyền`}
                        </span>
                      </div>
                    </div>

                    {/* Permissions Snippet */}
                    <div className="mt-3.5">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                        Quyền hạn tiêu biểu:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {isSuperAdmin ? (
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            * (Bypass mọi giới hạn)
                          </span>
                        ) : r.permission_codes.length > 0 ? (
                          r.permission_codes.slice(0, 4).map((pCode) => (
                            <span
                              key={pCode}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {pCode}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Quyền công khai cơ bản
                          </span>
                        )}
                        {!isSuperAdmin && r.permission_codes.length > 4 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500">
                            +{r.permission_codes.length - 4} khác
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRoleForDetail(r)}
                      className="w-full text-xs flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem chi tiết ma trận vai trò
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Role Detail Modal */}
      <RoleDetailModal
        isOpen={!!selectedRoleForDetail}
        onClose={() => setSelectedRoleForDetail(null)}
        role={selectedRoleForDetail}
        allPermissions={
          permissions.length > 0
            ? permissions
            : APP_PERMISSIONS.map((p) => ({
                id: p.code,
                code: p.code,
                resource: p.resource,
                action: p.action,
                description: p.description,
                created_at: '',
              }))
        }
      />
    </div>
  );
};
