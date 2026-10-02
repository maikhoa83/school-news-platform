/**
 * Media Detail & Edit Modal Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.1)
 *
 * Implements:
 * - High-resolution private preview with signed URL
 * - Technical metadata display (dimensions, size, MIME, canonical storage path, timestamp)
 * - Metadata editing (Title, Alt text, Caption, Folder assignment, Publication status)
 * - Quick copy to clipboard (Signed URL, Storage Path)
 * - Coordinated deletion workflow (Database + Physical storage) with strict confirmation
 * - RBAC permission enforcement (usePermissions: can('media.edit'), can('media.delete'))
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  HardDrive,
  Calendar,
  Folder,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  FileImage,
  FileVideo,
  FileText,
  Eye,
  EyeOff,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { useSignedUrl } from '../hooks/useSignedUrl';
import { useMediaFolders } from '../hooks/useMediaFolders';
import { useMediaMutations } from '../hooks/useMediaMutations';
import { usePermissions } from '../../../hooks/usePermissions';
import { formatBytes, formatMediaDate } from '../utils/mediaFormatters';
import type { MediaWithFolder, MediaItem } from '../../../types/media';

interface MediaDetailModalProps {
  item: MediaWithFolder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess?: (updatedItem: MediaItem) => void;
  onDeleteSuccess?: (deletedId: string) => void;
}

export function MediaDetailModal({
  item,
  isOpen,
  onClose,
  onUpdateSuccess,
  onDeleteSuccess,
}: MediaDetailModalProps) {
  const { can } = usePermissions();
  const canEdit = can('media.edit');
  const canDelete = can('media.delete');

  const { folders, isLoading: isFoldersLoading } = useMediaFolders();
  const {
    updateMedia,
    deleteMedia,
    isUpdating,
    isDeleting,
    error: mutationError,
    clearError,
  } = useMediaMutations();

  // Signed URL for secure private media preview
  const { data: signedUrl, isLoading: isUrlLoading, isError: isUrlError } = useSignedUrl(
    item?.file_path,
    Boolean(item?.file_path)
  );

  // Form State
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Confirmation & Feedback States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Populate form state when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title || item.file_name);
      setAltText(item.alt_text || '');
      setCaption(item.caption || '');
      setFolderId(item.folder_id || '');
      setIsPublished(item.is_published ?? true);
      setShowDeleteConfirm(false);
      setCopySuccess(null);
      setValidationError(null);
      setSaveSuccessMessage(null);
      clearError();
    }
  }, [item, clearError]);

  if (!item) return null;

  const isImage = item.file_type === 'image';
  const isVideo = item.file_type === 'video';

  const handleCopy = async (textToCopy: string, type: 'url' | 'path') => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2500);
    } catch {
      // Fallback if clipboard API restricted
      console.warn('Clipboard write failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!title.trim()) {
      setValidationError('Tiêu đề tệp không được để trống.');
      return;
    }

    setValidationError(null);
    setSaveSuccessMessage(null);

    try {
      const updated = await updateMedia(item.id, {
        title: title.trim(),
        alt_text: altText.trim() || null,
        caption: caption.trim() || null,
        folder_id: folderId || null,
        is_published: isPublished,
      });

      setSaveSuccessMessage('Cập nhật thông tin tệp thành công!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
      onUpdateSuccess?.(updated);
    } catch (err) {
      console.error('[MediaDetailModal] Update failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      await deleteMedia(item.id);
      onDeleteSuccess?.(item.id);
      onClose();
    } catch (err) {
      console.error('[MediaDetailModal] Delete failed:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết tệp đa phương tiện"
      description={`Tệp: ${item.file_name}`}
      maxWidth="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            {canDelete && !showDeleteConfirm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting || isUpdating}
                className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Xóa tệp tin
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUpdating || isDeleting}
              className="text-xs"
            >
              Đóng
            </Button>

            {canEdit && (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isUpdating || isDeleting}
                className="bg-blue-800 text-white hover:bg-blue-900 text-xs px-4"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-left">
        {/* Alerts & Notifications */}
        {mutationError && (
          <Alert variant="danger" title="Thao tác thất bại">
            {mutationError}
          </Alert>
        )}
        {validationError && (
          <Alert variant="warning" title="Dữ liệu chưa hợp lệ">
            {validationError}
          </Alert>
        )}
        {saveSuccessMessage && (
          <Alert variant="success" title="Thành công">
            {saveSuccessMessage}
          </Alert>
        )}

        {/* Delete Confirmation Warning Card */}
        {showDeleteConfirm && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-red-900">
                  Xác nhận xóa tệp tin vĩnh viễn?
                </h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  Hành động này sẽ xóa hoàn toàn tệp tin khỏi hệ thống lưu trữ Storage và cơ sở dữ liệu.
                  Nếu tệp đang được sử dụng trong các album hoặc bài viết, liên kết sẽ bị gỡ bỏ. Hành động này{' '}
                  <strong>không thể hoàn tác</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="h-8 text-xs border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Đồng ý xóa vĩnh viễn
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Media Preview & Technical Specs */}
          <div className="lg:col-span-5 space-y-4">
            {/* Media Preview Box */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950/5 flex items-center justify-center min-h-[220px] max-h-[340px]">
              {isUrlLoading ? (
                <div className="flex flex-col items-center gap-2 p-6 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
                  <span className="text-xs">Đang tải bản xem trước bảo mật...</span>
                </div>
              ) : isUrlError || !signedUrl ? (
                <div className="flex flex-col items-center gap-2 p-6 text-slate-400 text-center">
                  <AlertTriangle className="h-7 w-7 text-amber-500" />
                  <span className="text-xs">Không thể tạo liên kết xem trước tệp.</span>
                </div>
              ) : isImage ? (
                <img
                  src={signedUrl}
                  alt={item.alt_text || item.title || item.file_name}
                  className="max-h-[320px] w-full object-contain p-2"
                />
              ) : isVideo ? (
                <video
                  src={signedUrl}
                  controls
                  className="max-h-[320px] w-full rounded-lg bg-black"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 p-8 text-slate-500">
                  <FileText className="h-10 w-10 text-slate-400" />
                  <span className="text-xs font-mono">{item.mime_type}</span>
                </div>
              )}

              {/* Status & Type Badges */}
              <div className="absolute top-2 left-2 flex gap-1.5">
                <Badge variant="primary" className="text-[10px] uppercase font-semibold">
                  {item.file_type}
                </Badge>
                {item.is_published ? (
                  <Badge variant="success" className="text-[10px]">
                    <Eye className="h-3 w-3 mr-1" /> Công khai
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-white/90 text-slate-600">
                    <EyeOff className="h-3 w-3 mr-1" /> Bản nháp
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Copy Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => signedUrl && handleCopy(signedUrl, 'url')}
                disabled={!signedUrl}
                className="flex-1 text-xs h-8"
              >
                {copySuccess === 'url' ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    Đã sao chép Signed URL
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                    Sao chép URL xem trước
                  </>
                )}
              </Button>

              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Technical Specifications Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2 text-xs">
              <h5 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                Thông số kỹ thuật
              </h5>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-400">Dung lượng:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatBytes(item.file_size)}
                  </span>
                </div>
                {isImage && item.width && item.height && (
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-400">Độ phân giải:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {item.width} × {item.height} px
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-400">MIME Type:</span>
                  <span className="font-mono text-slate-800">{item.mime_type}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-400">Ngày tải lên:</span>
                  <span className="text-slate-800">{formatMediaDate(item.created_at)}</span>
                </div>
                <div className="py-0.5">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-slate-400">Đường dẫn tệp (Storage):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.file_path, 'path')}
                      className="text-[10px] text-blue-700 hover:underline flex items-center gap-0.5"
                    >
                      {copySuccess === 'path' ? (
                        <span className="text-emerald-600 font-medium">Đã chép</span>
                      ) : (
                        <span>Sao chép</span>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-slate-600 break-all bg-white p-1.5 rounded border border-slate-200">
                    {item.file_path}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Edit Form */}
          <div className="lg:col-span-7 space-y-3">
            {!canEdit && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                Bạn chỉ có quyền xem tệp này. Quyền chỉnh sửa thuộc về Quản trị viên và Biên tập viên.
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Title Field */}
              <Input
                label="Tiêu đề tệp"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canEdit || isUpdating}
                maxLength={255}
                className="text-xs"
                helperText="Tiêu đề hiển thị chính trong thư viện và chú thích ảnh."
              />

              {/* Folder Selector */}
              <Select
                label="Thư mục lưu trữ"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                disabled={!canEdit || isUpdating || isFoldersLoading}
                className="text-xs"
              >
                <option value="">📁 Thư mục gốc (chưa phân loại)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name} ({f.media_count} tệp)
                  </option>
                ))}
              </Select>

              {/* Alt Text (Image only) */}
              {isImage && (
                <Input
                  label="Văn bản thay thế (Alt text)"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={!canEdit || isUpdating}
                  maxLength={255}
                  placeholder="Mô tả nội dung hình ảnh..."
                  className="text-xs"
                  helperText="Cần thiết cho khả năng tiếp cận và chuẩn SEO."
                />
              )}

              {/* Caption */}
              <Textarea
                label="Chú thích chi tiết (Caption)"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={!canEdit || isUpdating}
                maxLength={1000}
                placeholder="Ghi chú mở rộng về tệp..."
                className="text-xs"
                helperText="Tối đa 1.000 ký tự."
              />

              {/* Publication Status Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="space-y-0.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">
                      Trạng thái xuất bản
                    </span>
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        <Eye className="h-3 w-3" /> Công khai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        <EyeOff className="h-3 w-3" /> Bản nháp
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isPublished
                      ? 'Tệp đang hiển thị công khai trên website và có thể truy cập qua URL ký.'
                      : 'Tệp bị ẩn khỏi các chế độ xem công khai và chỉ lưu hành nội bộ.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    disabled={!canEdit || isUpdating}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-700"></div>
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}
