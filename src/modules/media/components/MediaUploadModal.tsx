/**
 * Media Upload Modal Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.1)
 *
 * Implements:
 * - Drag-and-Drop + manual file picker
 * - Allowed MIME types (JPEG, PNG, WEBP, GIF, SVG, MP4, WEBM)
 * - File size boundary (max 50MB)
 * - Immediate client-side validation
 * - Instant image preview / video icon
 * - Metadata input (Title, Alt text, Caption, Target folder, Publication toggle)
 * - Canonical storage upload + database record creation with rollback safety
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileImage,
  FileVideo,
  FileText,
  X,
  AlertCircle,
  Loader2,
  HardDrive,
  Folder,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/Alert';
import { formatBytes } from '../utils/mediaFormatters';
import {
  MEDIA_MAX_FILE_SIZE,
  ALLOWED_MEDIA_MIME_TYPES,
} from '../schemas/mediaSchema';
import { useMediaFolders } from '../hooks/useMediaFolders';
import { useMediaMutations } from '../hooks/useMediaMutations';
import type { MediaItem } from '../../../types/media';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (item: MediaItem) => void;
  initialFolderId?: string | null;
}

export function MediaUploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialFolderId = null,
}: MediaUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { folders, isLoading: isFoldersLoading } = useMediaFolders();
  const { uploadMedia, isUploading, error: uploadError, clearError } = useMediaMutations();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [folderId, setFolderId] = useState<string>(initialFolderId || '');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [clientValidationError, setClientValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync initialFolderId when modal opens
  useEffect(() => {
    if (isOpen) {
      setFolderId(initialFolderId || '');
    }
  }, [isOpen, initialFolderId]);

  // Clean up preview object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setTitle('');
    setAltText('');
    setCaption('');
    setFolderId(initialFolderId || '');
    setIsPublished(true);
    setClientValidationError(null);
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    resetForm();
    onClose();
  };

  const processFile = (selectedFile: File) => {
    setClientValidationError(null);
    clearError();

    // 1. File size verification (50MB)
    if (selectedFile.size > MEDIA_MAX_FILE_SIZE) {
      setClientValidationError(
        `Tệp "${selectedFile.name}" dung lượng ${formatBytes(selectedFile.size)} vượt quá giới hạn cho phép (50MB).`
      );
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // 2. MIME type verification
    const mime = selectedFile.type?.toLowerCase();
    const isAllowed = (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mime);
    if (!isAllowed) {
      setClientValidationError(
        `Định dạng tệp "${mime || 'không xác định'}" không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WEBP, GIF, SVG) và video (MP4, WEBM).`
      );
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);

    // Auto-generate clean title from file name without extension
    const cleanName = selectedFile.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .trim();
    setTitle(cleanName || 'Tệp tải lên mới');

    // Create preview if it is an image
    if (mime.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFile(droppedFiles[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setClientValidationError('Vui lòng chọn một tệp tin trước khi tải lên.');
      return;
    }

    if (!title.trim()) {
      setClientValidationError('Vui lòng nhập tiêu đề tệp.');
      return;
    }

    try {
      const createdItem = await uploadMedia({
        file,
        title: title.trim(),
        alt_text: altText.trim() || null,
        caption: caption.trim() || null,
        folder_id: folderId || null,
        is_published: isPublished,
      });

      resetForm();
      onSuccess?.(createdItem);
      onClose();
    } catch (err) {
      // Error is caught and set in useMediaMutations hook
      console.error('[MediaUploadModal] Upload failed:', err);
    }
  };

  const isImage = file?.type.startsWith('image/');
  const isVideo = file?.type.startsWith('video/');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tải lên tệp đa phương tiện"
      description="Tải lên hình ảnh, video hoạt động nhà trường vào kho lưu trữ (tối đa 50MB/tệp)."
      maxWidth="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isUploading}
            className="text-xs"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isUploading || Boolean(clientValidationError)}
            className="bg-blue-800 text-white hover:bg-blue-900 text-xs px-4"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Đang tải lên & xử lý...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1.5" />
                Bắt đầu tải lên
              </>
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Validation or API error notice */}
        {(clientValidationError || uploadError) && (
          <Alert variant="danger" title="Lỗi tải lên">
            {clientValidationError || uploadError}
          </Alert>
        )}

        {/* Dropzone / File Picker Area */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-700 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800 mb-3">
              <Upload className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold text-slate-900 mb-1">
              Kéo thả tệp vào đây hoặc nhấp để chọn tệp
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              Hỗ trợ ảnh (JPG, PNG, WEBP, GIF, SVG) và video (MP4, WEBM). Dung lượng tối đa: 50MB.
            </p>
          </div>
        ) : (
          /* File Selected Preview Strip */
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : isVideo ? (
                  <FileVideo className="h-7 w-7 text-indigo-600" />
                ) : isImage ? (
                  <FileImage className="h-7 w-7 text-blue-600" />
                ) : (
                  <FileText className="h-7 w-7 text-slate-600" />
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatBytes(file.size)}
                  </span>
                  <span>•</span>
                  <span className="uppercase font-mono">{file.type.split('/')[1] || 'TỆP'}</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              disabled={isUploading}
              aria-label="Xóa tệp đã chọn"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Metadata Form Fields (Displayed once file is selected) */}
        {file && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Title (Required) */}
            <div>
              <Input
                label="Tiêu đề tệp"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề mô tả ngắn gọn..."
                disabled={isUploading}
                maxLength={255}
                className="text-xs"
              />
            </div>

            {/* Folder Selection */}
            <div>
              <Select
                label="Thư mục lưu trữ"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                disabled={isUploading || isFoldersLoading}
                className="text-xs"
              >
                <option value="">📁 Thư mục gốc (chưa phân loại)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name} ({f.media_count} tệp)
                  </option>
                ))}
              </Select>
            </div>

            {/* Alt Text (Recommended for images) */}
            {isImage && (
              <div>
                <Input
                  label="Văn bản thay thế (Alt Text)"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Mô tả hình ảnh cho người khiếm thị và SEO (tùy chọn)..."
                  disabled={isUploading}
                  maxLength={255}
                  className="text-xs"
                  helperText="Tối đa 255 ký tự."
                />
              </div>
            )}

            {/* Caption (Optional) */}
            <div>
              <Textarea
                label="Chú thích tệp"
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ghi chú thêm về bối cảnh, sự kiện, người chụp (tùy chọn)..."
                disabled={isUploading}
                maxLength={1000}
                className="text-xs"
              />
            </div>

            {/* Publication Status Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3">
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
                    ? 'Tệp sẽ hiển thị ngay trong kho media công khai và có thể chèn vào bài viết.'
                    : 'Chỉ quản trị viên và biên tập viên mới có thể xem tệp này.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={isUploading}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-700"></div>
              </label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
