/**
 * Page Delete Confirmation Modal
 * Reusable modal for confirming static page deletion.
 * School News Platform - Step 09.5A
 */

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import type { Page } from '../types/page';

interface PageDeleteConfirmModalProps {
  page: Page | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (pageId: string) => Promise<void>;
}

export const PageDeleteConfirmModal: React.FC<PageDeleteConfirmModalProps> = ({
  page,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!page) return null;

  const handleConfirm = async () => {
    await onConfirm(page.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa trang tĩnh"
      description="Hành động này sẽ xóa vĩnh viễn trang khỏi cơ sở dữ liệu."
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
            Xóa trang
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-sm text-slate-700">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">Bạn có chắc chắn muốn xóa trang này?</p>
            <p className="text-xs text-amber-800">
              Trang &ldquo;<strong>{page.title}</strong>&rdquo; (đường dẫn: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">/{page.slug}</code>) sẽ bị xóa hoàn toàn.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Lưu ý về cấu trúc phân cấp:</strong> Nếu có các trang con thuộc về trang này, liên kết trang cha của chúng sẽ tự động được gỡ bỏ (chuyển thành trang cấp cao nhất) mà không bị mất dữ liệu.
        </p>
      </div>
    </Modal>
  );
};
