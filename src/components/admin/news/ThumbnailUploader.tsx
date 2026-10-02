/**
 * Thumbnail Uploader Component
 * Drag-and-drop or manual upload with validation, preview, and URL entry fallback
 * School News Platform - Step 05 News Module
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { uploadNewsThumbnail } from '../../../lib/storage';

interface ThumbnailUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsUploading(true);
    try {
      const res = await uploadNewsThumbnail(file);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setErrorMessage(res.error || 'Tải ảnh thất bại');
      }
    } catch {
      setErrorMessage('Lỗi bất ngờ khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    setIsUrlMode(false);
  };

  return (
    <div id="thumbnail-uploader" className="space-y-3">
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {value ? (
        // Preview State
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-[16/9] max-w-md group">
          <img src={value} alt="Thumbnail preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Gỡ ảnh</span>
            </button>
          </div>
        </div>
      ) : (
        // Empty / Upload State
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUrlMode && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors max-w-md ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-neutral-300 hover:border-blue-400 bg-neutral-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <p className="text-xs font-semibold text-neutral-800">
              {isUploading
                ? 'Đang xử lý tải ảnh lên...'
                : 'Kéo thả ảnh vào đây hoặc nhấp để chọn tệp'}
            </p>
            <p className="text-[11px] text-neutral-400">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</p>
          </div>
        </div>
      )}

      {/* Manual URL input fallback toggle */}
      {!value && (
        <div className="flex items-center gap-2 pt-1">
          {isUrlMode ? (
            <div className="flex items-center gap-2 w-full max-w-md">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Dán đường dẫn URL ảnh (https://...)"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setIsUrlMode(false)}
                className="px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-800"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsUrlMode(true)}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-blue-600 transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              <span>Hoặc nhập liên kết ảnh trực tiếp</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
