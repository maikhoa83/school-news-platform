/**
 * Role Details & Permissions Inspection Modal
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import React from 'react';
import { X, ShieldCheck, Check, Lock, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { BASELINE_ROLES, RESOURCE_LABELS } from '../config/userConfig';
import type { RoleWithPermissions, Permission } from '../types/user';

interface RoleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleWithPermissions | null;
  allPermissions: Permission[];
}

export const RoleDetailModal: React.FC<RoleDetailModalProps> = ({
  isOpen,
  onClose,
  role,
  allPermissions,
}) => {
  if (!isOpen || !role) return null;

  const meta = BASELINE_ROLES[role.code];

  // Group permissions by resource
  const permissionsByResource = allPermissions.reduce((acc, p) => {
    if (!acc[p.resource]) {
      acc[p.resource] = [];
    }
    acc[p.resource].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const isSuperAdmin = role.code === 'SUPER_ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{meta?.name || role.name}</h2>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {role.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{meta?.description || role.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto grow">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Cán bộ được gán
              </span>
              <span className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-700" />
                {role.user_count ?? 0}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Phạm vi quyền
              </span>
              <span className="text-sm font-semibold text-slate-900 mt-1 block">
                {isSuperAdmin ? 'Toàn quyền (*)' : `${role.permissions.length} quyền`}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Loại vai trò
              </span>
              <span className="text-sm font-semibold text-slate-900 mt-1 block">
                {role.is_system ? 'Hệ thống (Cố định)' : 'Tùy biến'}
              </span>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ma trận quyền hạn chi tiết (Resource & Action)
              </h3>
              {isSuperAdmin && (
                <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Wildcard (*) Tự động sở hữu mọi quyền
                </span>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(permissionsByResource).map(([resource, perms]) => {
                const resourceTitle = RESOURCE_LABELS[resource] || resource.toUpperCase();

                return (
                  <div
                    key={resource}
                    className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        {resourceTitle}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{resource}.*</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const hasThisPerm = isSuperAdmin || role.permission_codes.includes(p.code);

                        return (
                          <div
                            key={p.id}
                            className={`p-2 rounded-md border text-xs flex items-start justify-between gap-2 ${
                              hasThisPerm
                                ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                                : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                                    hasThisPerm
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-500'
                                  }`}
                                >
                                  {hasThisPerm ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <Lock className="h-2.5 w-2.5" />}
                                </span>
                                <span className="font-mono font-medium">{p.code}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
