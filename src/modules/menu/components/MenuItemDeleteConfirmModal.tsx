/**
 * Menu Item Delete Confirmation Modal
 * Confirms deletion of a MenuItem and explicitly warns if it has child items.
 * School News Platform - Step 09.5B
 */

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { MenuItemTree } from '../types/menu';

interface MenuItemDeleteConfirmModalProps {
  item: MenuItemTree | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (itemId: string) => Promise<void>;
}

export const MenuItemDeleteConfirmModal: React.FC<MenuItemDeleteConfirmModalProps> = ({
  item,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!item) return null;

  // Recursively count total children
  const countAllDescendants = (node: MenuItemTree): number => {
    if (!node.children || node.children.length === 0) return 0;
    return (
      node.children.length +
      node.children.reduce((acc, child) => acc + countAllDescendants(child), 0)
    );
  };

  const totalDescendants = countAllDescendants(item);

  const handleConfirm = async () => {
    await onConfirm(item.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa Mục menu"
      description="Hành động này sẽ xóa mục menu khỏi cấu trúc điều hướng."
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
            Xóa mục menu
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-sm text-slate-700">
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-950">
              Bạn có chắc chắn muốn xóa mục menu &ldquo;{item.title}&rdquo;?
            </p>
            <p className="text-xs text-red-800">
              Đường dẫn: <code className="bg-red-100 px-1 py-0.5 rounded text-red-900 font-mono">{item.url}</code>
            </p>
          </div>
        </div>

        {totalDescendants > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs leading-relaxed space-y-1">
            <p className="font-bold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              CẢNH BÁO LAN TRUYỀN (CASCADE DELETE) CHO MỤC CON:
            </p>
            <p>
              Mục menu này hiện có <strong>{totalDescendants} mục con</strong> trực thuộc. Do cơ chế khóa ngoại tự tham chiếu trong cơ sở dữ liệu (<code>parent_id ON DELETE CASCADE</code>), <strong>toàn bộ {totalDescendants} mục con này cũng sẽ bị xóa vĩnh viễn</strong> cùng lúc!
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
