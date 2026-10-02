/**
 * User Profile Edit Modal Dialog
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import React, { useState, useEffect } from 'react';
import { X, UserCog, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useUserMutations } from '../hooks/useUserMutations';
import type { UserRecord } from '../types/user';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
  onSuccess: (updatedUser: UserRecord) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user: targetUser,
  onSuccess,
}) => {
  const { updateProfile, isUpdating, error: mutationError, clearError } = useUserMutations();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (targetUser) {
      setFullName(targetUser.full_name || '');
      setPhone(targetUser.phone || '');
      setAvatarUrl(targetUser.avatar_url || '');
      setIsActive(targetUser.is_active);
      setLocalError(null);
      clearError();
    }
  }, [targetUser, clearError]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (fullName.trim().length < 2) {
      setLocalError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }

    try {
      const updated = await updateProfile(targetUser.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        is_active: isActive,
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Lỗi khi cập nhật hồ sơ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <UserCog className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Chỉnh Sửa Hồ Sơ Cán Bộ</h2>
              <p className="text-xs text-slate-500">Cập nhật thông tin định danh & trạng thái</p>
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
            {/* Error Message */}
            {(localError || mutationError) && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{localError || mutationError}</span>
              </div>
            )}

            {/* Email (Read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email công vụ</label>
              <input
                type="text"
                value={targetUser.email}
                disabled
                className="w-full px-3 py-2 text-xs font-mono bg-slate-100 text-slate-500 rounded-lg border border-slate-200 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400">Email liên kết cố định với tài khoản Supabase Auth.</span>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Thầy Nguyễn Văn An"
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Số điện thoại liên hệ</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Đường dẫn ảnh đại diện (URL)</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Ví dụ: /avatars/thay-an.jpg hoặc https://..."
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Active Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Trạng thái tài khoản</span>
                  <span className="text-xs text-slate-500">
                    {isActive ? 'Tài khoản đang được kích hoạt sử dụng' : 'Khóa tài khoản khỏi hệ thống'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-blue-600 border-slate-300 focus:ring-blue-500"
                />
              </label>
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
              disabled={isUpdating}
              isLoading={isUpdating}
            >
              Lưu Thông Tin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
