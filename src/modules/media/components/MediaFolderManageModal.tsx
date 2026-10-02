/**
 * Media Folder Management Modal Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.1)
 *
 * Implements:
 * - Create new folder (Name, optional Slug, Description, optional Parent folder)
 * - View existing folders with media count
 * - Edit / Rename existing folder
 * - Delete folder with safety warning (media items become unassigned/root)
 * - RBAC permission check (can('media.edit'), can('media.delete'))
 */

import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/Alert';
import { useMediaFolders } from '../hooks/useMediaFolders';
import { useMediaFolderMutations } from '../hooks/useMediaFolderMutations';
import { usePermissions } from '../../../hooks/usePermissions';
import type { MediaFolderWithCount } from '../../../types/media';

interface MediaFolderManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder?: (folderId: string) => void;
}

export function MediaFolderManageModal({
  isOpen,
  onClose,
  onSelectFolder,
}: MediaFolderManageModalProps) {
  const { can } = usePermissions();
  const canEdit = can('media.edit');
  const canDelete = can('media.delete');

  const { folders, isLoading, refetch } = useMediaFolders();
  const {
    createFolder,
    updateFolder,
    deleteFolder,
    isSubmitting,
    error: mutationError,
    clearError,
  } = useMediaFolderMutations();

  // Create Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State (for editing an existing folder)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete Confirmation State
  const [deletingFolder, setDeletingFolder] = useState<MediaFolderWithCount | null>(null);

  const resetCreateForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setFormError(null);
    setIsCreating(false);
    clearError();
  };

  const startEdit = (folder: MediaFolderWithCount) => {
    setEditingFolderId(folder.id);
    setEditName(folder.name);
    setEditSlug(folder.slug);
    setEditDescription(folder.description || '');
    setFormError(null);
    clearError();
  };

  const cancelEdit = () => {
    setEditingFolderId(null);
    setEditName('');
    setEditSlug('');
    setEditDescription('');
    setFormError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!name.trim()) {
      setFormError('Tên thư mục không được để trống.');
      return;
    }

    setFormError(null);
    try {
      await createFolder({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || null,
        parent_id: parentId || null,
      });

      resetCreateForm();
      refetch();
    } catch (err) {
      console.error('[MediaFolderManageModal] Create failed:', err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent, folderId: string) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!editName.trim()) {
      setFormError('Tên thư mục không được để trống.');
      return;
    }

    setFormError(null);
    try {
      await updateFolder(folderId, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
        description: editDescription.trim() || null,
      });

      cancelEdit();
      refetch();
    } catch (err) {
      console.error('[MediaFolderManageModal] Update failed:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFolder || !canDelete) return;

    try {
      await deleteFolder(deletingFolder.id);
      setDeletingFolder(null);
      refetch();
    } catch (err) {
      console.error('[MediaFolderManageModal] Delete failed:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý thư mục đa phương tiện"
      description="Tạo cấu trúc phân mục lưu trữ hình ảnh và video theo sự kiện, khối lớp hoặc chuyên đề."
      maxWidth="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-slate-500">
            Tổng cộng: <strong>{folders.length}</strong> thư mục
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-left">
        {/* Error notification */}
        {(formError || mutationError) && (
          <Alert variant="danger" title="Lỗi">
            {formError || mutationError}
          </Alert>
        )}

        {/* Delete Confirmation Alert */}
        {deletingFolder && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-red-900">
                  Xác nhận xóa thư mục "{deletingFolder.name}"?
                </h5>
                <p className="text-xs text-red-700 leading-relaxed">
                  {deletingFolder.media_count > 0 ? (
                    <>
                      Thư mục này hiện chứa <strong>{deletingFolder.media_count}</strong> tệp tin. Các tệp tin
                      sẽ được chuyển về <strong>Thư mục gốc (chưa phân loại)</strong> và không bị xóa khỏi hệ thống.
                    </>
                  ) : (
                    'Thư mục này hiện không chứa tệp tin nào. Thư mục sẽ bị xóa hoàn toàn.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingFolder(null)}
                disabled={isSubmitting}
                className="h-7 text-xs border-slate-300"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Đồng ý xóa
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Action Bar / New Folder Toggle */}
        {canEdit && !isCreating && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Nhấp vào thư mục để lọc nhanh hoặc quản lý tên phân loại.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsCreating(true);
                setDeletingFolder(null);
                cancelEdit();
              }}
              className="h-8 text-xs bg-blue-800 text-white hover:bg-blue-900"
            >
              <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
              Thêm thư mục mới
            </Button>
          </div>
        )}

        {/* Create Folder Form Panel */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between pb-1 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-blue-700" />
                Tạo thư mục mới
              </span>
              <button
                type="button"
                onClick={resetCreateForm}
                className="text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                label="Tên thư mục"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Khai giảng 2025, Thể thao..."
                maxLength={255}
                className="text-xs"
              />

              <Input
                label="Đường dẫn định danh (Slug)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Tự động tạo nếu để trống..."
                maxLength={255}
                className="text-xs font-mono"
                helperText="Chữ thường, số và dấu gạch ngang."
              />
            </div>

            <Textarea
              label="Mô tả thư mục (Tùy chọn)"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú nội dung của thư mục..."
              maxLength={1000}
              className="text-xs"
            />

            {folders.length > 0 && (
              <Select
                label="Thư mục cha (Tùy chọn)"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="text-xs"
              >
                <option value="">Không có (Thư mục cấp cao nhất)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </Select>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetCreateForm}
                disabled={isSubmitting}
                className="h-8 text-xs bg-white"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !name.trim()}
                className="h-8 text-xs bg-blue-800 text-white hover:bg-blue-900"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Xác nhận tạo thư mục
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Existing Folders List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">
            Danh sách thư mục hiện có:
          </span>

          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-700" />
              Đang tải danh sách thư mục...
            </div>
          ) : folders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              Chưa có thư mục nào được tạo. Toàn bộ tệp hiện đang ở Thư mục gốc.
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {folders.map((folder) => {
                const isEditingThis = editingFolderId === folder.id;

                if (isEditingThis) {
                  return (
                    <form
                      key={folder.id}
                      onSubmit={(e) => handleUpdateSubmit(e, folder.id)}
                      className="p-3 bg-blue-50/30 space-y-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          label="Tên thư mục"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength={255}
                          className="text-xs"
                        />
                        <Input
                          label="Slug"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          maxLength={255}
                          className="text-xs font-mono"
                        />
                      </div>
                      <Textarea
                        label="Mô tả"
                        rows={1}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        maxLength={1000}
                        className="text-xs"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={isSubmitting}
                          className="h-7 text-xs"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmitting || !editName.trim()}
                          className="h-7 text-xs bg-blue-800 text-white hover:bg-blue-900"
                        >
                          {isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                        </Button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                      onClick={() => {
                        onSelectFolder?.(folder.id);
                        onClose();
                      }}
                      title="Nhấp để lọc tệp theo thư mục này"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <Folder className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {folder.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {folder.media_count} tệp tin • slug:{' '}
                          <span className="font-mono">{folder.slug}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => startEdit(folder)}
                          aria-label={`Chỉnh sửa thư mục ${folder.name}`}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeletingFolder(folder)}
                            aria-label={`Xóa thư mục ${folder.name}`}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
