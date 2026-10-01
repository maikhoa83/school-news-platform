/**
 * Menu Delete Confirmation Modal
 * Reusable modal for confirming Menu deletion with explicit CASCADE warning.
 * School News Platform - Step 09.5B
 */

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { Menu } from '../types/menu';

interface MenuDeleteConfirmModalProps {
  menu: Menu | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (menuId: string) => Promise<void>;
}

export const MenuDeleteConfirmModal: React.FC<MenuDeleteConfirmModalProps> = ({
  menu,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!menu) return null;

  const handleConfirm = async () => {
    await onConfirm(menu.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa Menu điều hướng"
      description="Hành động này sẽ xóa vĩnh viễn menu khỏi hệ thống."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Xóa menu
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-sm text-slate-700">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-950">
              Bạn có chắc chắn muốn xóa menu &ldquo;{menu.name}&rdquo;?
            </p>
            <p className="text-xs text-red-800">
              Mã menu: <code className="bg-red-100 px-1 py-0.5 rounded text-red-900 font-mono">{menu.code}</code> | Vị trí: <strong>{menu.location}</strong>
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs leading-relaxed space-y-1">
          <p className="font-semibold text-amber-950 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            Cảnh báo lan truyền (CASCADE DELETE):
          </p>
          <p>
            Theo ràng buộc khóa ngoại cơ sở dữ liệu (<code>menu_items.menu_id ON DELETE CASCADE</code>), <strong>toàn bộ các mục menu (menu items) con</strong> thuộc menu này sẽ bị xóa đồng thời. Thao tác này không thể hoàn tác.
          </p>
        </div>
      </div>
    </Modal>
  );
};
