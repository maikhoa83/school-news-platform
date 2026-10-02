/**
 * Public Document Card Component
 * High-contrast, institutional card for Document Grid display
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React from 'react';
import { Download, Calendar, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { formatFileSize, getFileTypeInfo } from '../../lib/documentStorage';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DocumentCardProps {
  document: DocumentItem;
  onDownload: (doc: DocumentItem) => void;
  onPreview?: (doc: DocumentItem) => void;
  isDownloading?: boolean;
}

export function DocumentCard({
  document,
  onDownload,
  onPreview,
  isDownloading = false,
}: DocumentCardProps) {
  const typeInfo = getFileTypeInfo(document.file_type);

  return (
    <article
      id={`document-card-${document.id}`}
      className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Header badges: Doc Number + File Type & Size */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[11px] font-bold text-slate-800 bg-slate-50 border-slate-300 py-0.5"
          >
            {document.document_number}
          </Badge>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeInfo.color}`}
            >
              {typeInfo.label}
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              {formatFileSize(document.file_size)}
            </span>
          </div>
        </div>

        {/* Category / Type & Authority */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
            {document.document_type}
          </span>
          <span className="text-slate-300">•</span>
          <span className="truncate font-medium text-slate-600">
            {document.issuing_authority}
          </span>
        </div>

        {/* Document Title */}
        <h3
          onClick={() => onPreview?.(document)}
          className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2 cursor-pointer"
          title={document.title}
        >
          {document.title}
        </h3>

        {/* Excerpt if available */}
        {document.excerpt && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {document.excerpt}
          </p>
        )}
      </div>

      {/* Footer info & CTA */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{document.issue_date}</span>
          </span>
          <span className="text-[10px] text-slate-400 pt-0.5">
            {document.download_count} lượt tải
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(document)}
              className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 bg-white"
              title="Xem thông tin chi tiết"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              <span>Xem</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => onDownload(document)}
            disabled={isDownloading}
            className="h-8 px-3 text-xs bg-blue-900 hover:bg-blue-950 font-medium"
            title="Tải tệp văn bản"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Tải về</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
