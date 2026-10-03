/**
 * User Creation Modal Dialog
 * School News Platform - Step 10.1 Users + RBAC Foundation
 */

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Shield, Mail, Lock, User, Phone, Building } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { createUserRecord } from '../services/userService';
import type { RoleCode, UserRecord } from '../types/user';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: UserRecord) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('VinhPhong@2025');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Tổ Chuyên môn');
  const [roleCode, setRoleCode] = useState<RoleCode>('AUTHOR');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu khởi tạo phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await createUserRecord({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        department: department.trim() || null,
        role_code: roleCode,
        is_active: isActive,
      });

      onSuccess(newUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tạo người dùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-create-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="user-create-title" className="text-base font-bold">
                Thêm Cán bộ / Người dùng mới
              </h3>
              <p className="text-xs text-slate-500">
                Tạo tài khoản cán bộ giáo viên và phân quyền hệ thống
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Họ và tên cán bộ/giáo viên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email đăng nhập <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="an.nguyen@c3vinhphong.edu.vn"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mật khẩu khởi tạo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tổ chuyên môn / Phòng ban</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Ban Giám hiệu">Ban Giám hiệu</option>
                  <option value="Tổ Toán - Tin">Tổ Toán - Tin</option>
                  <option value="Tổ Ngữ văn">Tổ Ngữ văn</option>
                  <option value="Tổ Khoa học Tự nhiên">Tổ Khoa học Tự nhiên</option>
                  <option value="Tổ Lịch sử - Địa lý">Tổ Lịch sử - Địa lý</option>
                  <option value="Tổ Tiếng Anh">Tổ Tiếng Anh</option>
                  <option value="Đoàn Thanh niên - Đội TNTP">Đoàn Thanh niên - Đội TNTP</option>
                  <option value="Văn phòng - Kế toán">Văn phòng - Kế toán</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Phân quyền vai trò hệ thống <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value as RoleCode)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="AUTHOR">Tác giả / Giáo viên (Được tạo bài viết bản nháp)</option>
                <option value="EDITOR">Biên tập viên (Được duyệt và xuất bản tin bài)</option>
                <option value="ADMIN">Quản trị viên (Toàn quyền quản trị nội dung &amp; danh mục)</option>
                <option value="SUPER_ADMIN">Quản trị viên tối cao (Quản trị hệ thống &amp; tài khoản)</option>
                <option value="PUBLIC_VISITOR">Thành viên / Phụ huynh (Chỉ đọc &amp; bình luận)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Kích hoạt tài khoản ngay sau khi tạo</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo...' : 'Tạo người dùng'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
