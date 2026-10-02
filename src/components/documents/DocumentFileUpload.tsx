/**
 * Admin Document File Upload Component
 * Drag-and-drop & Manual click file uploader with 20MB constraint and mime/ext validation
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import {
  uploadDocumentFile,
  formatFileSize,
  getFileTypeInfo,
  MAX_DOCUMENT_SIZE_BYTES,
  ALLOWED_DOC_EXTENSIONS,
} from '../../lib/documentStorage';
import { Button } from '../ui/Button';

interface DocumentFileUploadProps {
  documentId: string;
  currentFileUrl?: string;
  currentFileName?: string;
  currentFileSize?: number;
  currentFileType?: string;
  onFileUploaded: (fileData: {
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    mimeType?: string;
  }) => void;
  onFileRemoved: () => void;
}

export function DocumentFileUpload({
  documentId,
  currentFileUrl,
  currentFileName,
  currentFileSize,
  currentFileType,
  onFileUploaded,
  onFileRemoved,
}: DocumentFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFile = Boolean(currentFileUrl && currentFileName);

  const handleProcessFile = async (file: File) => {
    setUploadError(null);

    // Size validation
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setUploadError(
        `Tệp "${file.name}" dung lượng ${formatFileSize(file.size)} vượt quá giới hạn 20MB.`
      );
      return;
    }

    // Extension validation (strict whitelist: no zip/rar)
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
      setUploadError(
        `Định dạng tệp .${ext} không được hỗ trợ. Vui lòng chọn tệp PDF, Word, Excel hoặc PowerPoint.`
      );
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDocumentFile(file, documentId);
      if (result.success && result.url && result.fileName && result.fileSize !== undefined) {
        onFileUploaded({
          url: result.url,
          fileName: result.fileName,
          fileSize: result.fileSize,
          fileType: result.fileType || ext,
          mimeType: result.mimeType,
        });
      } else {
        setUploadError(result.error || 'Tải tệp lên thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Lỗi hệ thống khi tải tệp.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const typeInfo = currentFileType ? getFileTypeInfo(currentFileType) : null;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        id="document-file-input"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileChange}
      />

      {/* If file is already uploaded, show detailed card with change / remove options */}
      {hasFile ? (
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã tải tệp lên
                </span>
                {typeInfo && (
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${typeInfo.color}`}
                  >
                    {typeInfo.label}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-md">
                {currentFileName}
              </p>
              {currentFileSize !== undefined && (
                <p className="text-[11px] font-mono text-slate-500">
                  Dung lượng: {formatFileSize(currentFileSize)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 text-xs bg-white text-slate-700 hover:text-slate-900"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              <span>Thay tệp</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFileRemoved}
              disabled={isUploading}
              className="h-8 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              <span>Gỡ bỏ</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-900 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-900/60 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center mx-auto">
              {isUploading ? (
                <RefreshCw className="h-6 w-6 animate-spin text-blue-900" />
              ) : (
                <UploadCloud className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {isUploading
                  ? 'Đang tải tệp lên máy chủ...'
                  : 'Kéo thả tệp văn bản vào đây, hoặc bấm để chọn tệp'}
              </p>
              <p className="text-xs text-slate-500">
                Hỗ trợ PDF, DOCX, DOC, XLSX, XLS, PPTX, ZIP, RAR (Tối đa 20MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">{uploadError}</div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
