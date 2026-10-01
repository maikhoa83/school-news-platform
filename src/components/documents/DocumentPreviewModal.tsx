/**
 * Document Preview & Detail Modal
 * Accessible dialog displaying metadata, signer, dates, excerpt, and download action
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Calendar, CheckCircle2, User, Building, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { formatFileSize, getFileTypeInfo, getSecureDocumentDownloadUrl } from '../../lib/documentStorage';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
  isDownloading?: boolean;
}

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onDownload,
  isDownloading = false,
}: DocumentPreviewModalProps) {
  const [securePreviewUrl, setSecurePreviewUrl] = useState<string>('');
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (document && isOpen) {
      setIsResolvingUrl(true);
      setPreviewError(null);
      getSecureDocumentDownloadUrl(document.id, document.file_url, document.status, 600)
        .then((res) => {
          if (active) {
            if (res.url) {
              setSecurePreviewUrl(res.url);
            } else {
              setSecurePreviewUrl('');
              setPreviewError(res.error || 'Không thể tạo liên kết xem trước an toàn.');
            }
          }
        })
        .catch((err) => {
          if (active) {
            setSecurePreviewUrl('');
            setPreviewError(err instanceof Error ? err.message : 'Lỗi xem trước.');
          }
        })
        .finally(() => {
          if (active) setIsResolvingUrl(false);
        });
    } else {
      setSecurePreviewUrl('');
      setPreviewError(null);
    }
    return () => {
      active = false;
    };
  }, [document, isOpen]);

  if (!document) return null;

  const typeInfo = getFileTypeInfo(document.file_type);
  const isPdf = document.file_type.toLowerCase() === 'pdf';
  const effectiveUrl = securePreviewUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết văn bản & biểu mẫu"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="font-mono text-xs font-bold text-slate-800 bg-slate-50 border-slate-300 py-1 px-2.5"
            >
              Số: {document.document_number}
            </Badge>

            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded">
              {document.document_type}
            </span>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${typeInfo.color}`}
            >
              {typeInfo.label} • {formatFileSize(document.file_size)}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            {document.download_count} lượt tải
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {document.title}
        </h2>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-start gap-2">
            <Building className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500">Cơ quan ban hành:</span>
              <p className="font-semibold text-slate-800">{document.issuing_authority}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500">Người ký:</span>
              <p className="font-semibold text-slate-800">
                {document.signer || 'Đang cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500">Ngày ban hành:</span>
              <p className="font-semibold text-slate-800">{document.issue_date}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500">Ngày hiệu lực:</span>
              <p className="font-semibold text-slate-800">
                {document.effective_date || 'Ngay khi ký'}
              </p>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {document.excerpt && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Trích yếu nội dung
            </h4>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {document.excerpt}
            </div>
          </div>
        )}

        {/* Attached File Preview / Info */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Tệp đính kèm chính thức
          </h4>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-sm">
                  {document.file_name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {typeInfo.label} • {formatFileSize(document.file_size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {isPdf && effectiveUrl && (
                <a
                  href={effectiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-900 hover:text-blue-950 bg-white border border-blue-200 px-3 py-2 rounded-lg"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Mở tab mới</span>
                </a>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => onDownload(document)}
                disabled={isDownloading}
                className="bg-blue-900 hover:bg-blue-950 text-white"
              >
                <Download className="h-4 w-4 mr-1.5" />
                <span>Tải tệp về máy</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Inline PDF Preview frame if available */}
        {isPdf && effectiveUrl && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Xem trước tài liệu</span>
              {isResolvingUrl && (
                <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Đang tải bảo mật...
                </span>
              )}
            </h4>
            <div className="h-96 w-full rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
              <iframe
                src={`${effectiveUrl}#toolbar=0`}
                title={document.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {isPdf && !effectiveUrl && !isResolvingUrl && previewError && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            {previewError}
          </div>
        )}
      </div>
    </Modal>
  );
}
