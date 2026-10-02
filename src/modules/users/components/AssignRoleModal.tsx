/**
 * Assign Roles Modal Dialog
 * School News Platform - Step 10.1 Users + RBAC Foundation
 *
 * Security UX Guardrails:
 * - Checks targetUser vs currentActor: self-assignment is disabled with explanation banner
 * - Non-SUPER_ADMIN actors cannot select or assign SUPER_ADMIN role
 * - Validates input and provides clear feedback
 */

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, ShieldCheck, Check, AlertCircle, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { BASELINE_ROLES } from '../config/userConfig';
import { useUserMutations } from '../hooks/useUserMutations';
import { useAuth } from '../../../hooks/useAuth';
import type { UserRecord, RoleWithPermissions, RoleCode } from '../types/user';

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
  availableRoles: RoleWithPermissions[];
  onSuccess: (updatedUser: UserRecord) => void;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  onClose,
  user: targetUser,
  availableRoles,
  onSuccess,
}) => {
  const { user: currentActor, roles: currentActorRoles } = useAuth();
  const { assignRoles, isAssigning, error: mutationError, clearError } = useUserMutations();

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const isSelf = currentActor?.id === targetUser?.id;
  const actorIsSuperAdmin = currentActorRoles?.includes('SUPER_ADMIN');

  useEffect(() => {
    if (targetUser) {
      const existingIds = targetUser.roles.map((r) => r.id);
      setSelectedRoleIds(existingIds);
      setLocalError(null);
      clearError();
    }
  }, [targetUser, clearError]);

  if (!isOpen || !targetUser) return null;

  const handleToggleRole = (roleId: string, roleCode: RoleCode) => {
    if (isSelf) return;

    // Guardrail: Non-SUPER_ADMIN cannot touch SUPER_ADMIN
    if (roleCode === 'SUPER_ADMIN' && !actorIsSuperAdmin) {
      setLocalError('Chỉ Quản trị viên tối cao mới có quyền gán hoặc bỏ vai trò SUPER_ADMIN.');
      return;
    }

    setLocalError(null);
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) {
        // Must keep at least 1 role
        if (prev.length <= 1) {
          setLocalError('Người dùng phải có ít nhất một vai trò.');
          return prev;
        }
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelf) return;

    if (selectedRoleIds.length === 0) {
      setLocalError('Vui lòng chọn ít nhất một vai trò cho người dùng.');
      return;
    }

    try {
      const updated = await assignRoles({
        userId: targetUser.id,
        roleIds: selectedRoleIds,
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Lỗi khi phân quyền người dùng');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Phân Quyền Vai Trò (RBAC)</h2>
              <p className="text-xs text-slate-500">Cập nhật vai trò quản trị cho cán bộ</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Target User Info */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{targetUser.full_name}</p>
                <p className="text-xs font-mono text-slate-500">{targetUser.email}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">ID: {targetUser.id.substring(0, 8)}...</span>
            </div>

            {/* Self-Escalation Warning Banner */}
            {isSelf && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                <Lock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Quy tắc an ninh nghiêm ngặt:</strong>
                  Bạn không được phép tự phân quyền hoặc thay đổi vai trò của chính mình để đảm bảo tính toàn vẹn hệ thống và chống leo thang quyền hạn (Self-Role Escalation Prevention).
                </div>
              </div>
            )}

            {/* Error Message */}
            {(localError || mutationError) && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{localError || mutationError}</span>
              </div>
            )}

            {/* Role List Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Chọn vai trò gán cho người dùng:
              </label>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {availableRoles.map((r) => {
                  const isSelected = selectedRoleIds.includes(r.id);
                  const meta = BASELINE_ROLES[r.code];
                  const isSuperAdminRole = r.code === 'SUPER_ADMIN';
                  const disabled = isSelf || (isSuperAdminRole && !actorIsSuperAdmin);

                  return (
                    <div
                      key={r.id}
                      onClick={() => !disabled && handleToggleRole(r.id, r.code)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        disabled
                          ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 cursor-pointer'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`h-4 w-4 rounded-sm mt-0.5 flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {meta?.name || r.name}
                              </span>
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                                {r.code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {meta?.description || r.description}
                            </p>
                            {isSuperAdminRole && !actorIsSuperAdmin && (
                              <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                                <Lock className="h-3 w-3" /> Chỉ SUPER_ADMIN mới có thể gán quyền này.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSelf || isAssigning}
              isLoading={isAssigning}
            >
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
