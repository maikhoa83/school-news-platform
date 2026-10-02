/**
 * Menu Create & Edit Form Modal
 * School News Platform - Step 09.5B
 *
 * Validates input against menuCreateSchema / menuUpdateSchema.
 * Restricts UI from altering immutable fields (id, created_at, updated_at).
 */

import React, { useState, useEffect } from 'react';
import { MenuSquare, AlertCircle, Save } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { MENU_LOCATIONS, MENU_LOCATION_CONFIG } from '../config/menuConfig';
import { menuCreateSchema, menuUpdateSchema, MENU_CODE_REGEX } from '../schemas/menuSchema';
import type { Menu, MenuLocation, MenuCreateInput, MenuUpdateInput } from '../types/menu';

interface MenuFormModalProps {
  isOpen: boolean;
  menuToEdit?: Menu | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: MenuCreateInput | MenuUpdateInput) => Promise<void>;
}

export const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  menuToEdit,
  isSaving,
  onClose,
  onSubmit,
}) => {
  const isEditMode = Boolean(menuToEdit);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<MenuLocation>('header');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize or reset form when modal opens or menuToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (menuToEdit) {
        setCode(menuToEdit.code);
        setName(menuToEdit.name);
        setDescription(menuToEdit.description || '');
        setLocation(menuToEdit.location);
        setIsActive(menuToEdit.is_active);
      } else {
        setCode('');
        setName('');
        setDescription('');
        setLocation('header');
        setIsActive(true);
      }
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, menuToEdit]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const codeTrim = code.trim();
    if (!codeTrim) {
      errs.code = 'Mã menu không được để trống.';
    } else if (codeTrim.length > 100) {
      errs.code = 'Mã menu tối đa 100 ký tự.';
    } else if (!MENU_CODE_REGEX.test(codeTrim)) {
      errs.code = 'Mã menu chỉ được chứa chữ cái, số, gạch ngang (-) hoặc gạch dưới (_).';
    }

    const nameTrim = name.trim();
    if (!nameTrim) {
      errs.name = 'Tên menu không được để trống.';
    } else if (nameTrim.length > 255) {
      errs.name = 'Tên menu tối đa 255 ký tự.';
    }

    if (description.length > 500) {
      errs.description = 'Mô tả không được vượt quá 500 ký tự.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      const payload: MenuCreateInput | MenuUpdateInput = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || null,
        location,
        is_active: isActive,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu menu.';
      if (msg.includes('DUPLICATE_CODE') || msg.toLowerCase().includes('mã menu') || msg.toLowerCase().includes('đã tồn tại')) {
        setErrors((prev) => ({
          ...prev,
          code: 'Mã menu này đã tồn tại trong hệ thống. Vui lòng chọn mã khác.',
        }));
      }
      setServerError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa Menu điều hướng' : 'Tạo Menu điều hướng mới'}
      description={
        isEditMode
          ? 'Cập nhật tên, mã định danh, vị trí hiển thị và trạng thái của menu.'
          : 'Thiết lập menu điều hướng mới cho website nhà trường.'
      }
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo menu'}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs sm:text-sm">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="menu-name" className="block font-semibold text-slate-900 text-xs">
            Tên menu <span className="text-red-500">*</span>
          </label>
          <input
            id="menu-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Menu chính đầu trang, Menu liên kết chân trang..."
            className={`w-full px-3 py-2 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
            }`}
          />
          {errors.name && <p className="text-xs text-red-600 font-medium">{errors.name}</p>}
        </div>

        {/* Code Field */}
        <div className="space-y-1.5">
          <label htmlFor="menu-code" className="block font-semibold text-slate-900 text-xs">
            Mã định danh (Code) <span className="text-red-500">*</span>
          </label>
          <input
            id="menu-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="main-header"
            className={`w-full px-3 py-2 bg-slate-50 font-mono text-xs sm:text-sm text-slate-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              errors.code ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
            }`}
          />
          {errors.code ? (
            <p className="text-xs text-red-600 font-medium">{errors.code}</p>
          ) : (
            <p className="text-[11px] text-slate-500">
              Dùng để truy vấn cấu trúc menu qua code. Chỉ chữ cái, số, gạch ngang (-) hoặc gạch dưới (_).
            </p>
          )}
        </div>

        {/* Location Selector */}
        <div className="space-y-1.5">
          <label htmlFor="menu-location" className="block font-semibold text-slate-900 text-xs">
            Vị trí hiển thị (Location) <span className="text-red-500">*</span>
          </label>
          <select
            id="menu-location"
            value={location}
            onChange={(e) => setLocation(e.target.value as MenuLocation)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            {MENU_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {MENU_LOCATION_CONFIG[loc]?.label || loc}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            {MENU_LOCATION_CONFIG[location]?.description}
          </p>
        </div>

        {/* Description Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="menu-description" className="font-semibold text-slate-700">
              Mô tả ghi chú
            </label>
            <span className="text-slate-400 text-[11px]">{description.length}/500 ký tự</span>
          </div>
          <textarea
            id="menu-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ghi chú thêm về mục đích hoặc vị trí sử dụng của menu này..."
            className={`w-full px-3 py-2 border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              errors.description ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-600 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Is Active Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label htmlFor="menu-is-active" className="text-xs font-semibold text-slate-900 cursor-pointer block">
              Kích hoạt menu (Active)
            </label>
            <p className="text-[11px] text-slate-500">
              Khi tắt, menu sẽ bị ẩn và không xuất hiện trên giao diện công khai.
            </p>
          </div>
          <input
            id="menu-is-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-800 rounded border-slate-300 focus:ring-blue-700 cursor-pointer"
          />
        </div>
      </form>
    </Modal>
  );
};
