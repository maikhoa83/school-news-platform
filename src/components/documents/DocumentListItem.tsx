/**
 * Public Document List Item (Table / Row format)
 * High-density accessible representation for Document Directory
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React from 'react';
import { Download, Calendar, Eye, FileText } from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { formatFileSize, getFileTypeInfo } from '../../lib/documentStorage';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DocumentListItemProps {
  document: DocumentItem;
  onDownload: (doc: DocumentItem) => void;
  onPreview?: (doc: DocumentItem) => void;
  isDownloading?: boolean;
}

export function DocumentListItem({
  document,
  onDownload,
  onPreview,
  isDownloading = false,
}: DocumentListItemProps) {
  const typeInfo = getFileTypeInfo(document.file_type);

  return (
    <div
      id={`document-row-${document.id}`}
      className="p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Document Icon / Badge */}
        <div className="hidden xs:flex flex-col items-center shrink-0 mt-0.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            {formatFileSize(document.file_size)}
          </span>
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="font-mono text-[10px] font-bold text-slate-800 bg-slate-50 border-slate-300 py-0.2"
            >
              {document.document_number}
            </Badge>

            <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
              {document.document_type}
            </span>

            <span className="text-xs text-slate-500 font-medium">
              {document.issuing_authority}
            </span>
          </div>

          <h4
            onClick={() => onPreview?.(document)}
            className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors cursor-pointer line-clamp-2"
          >
            {document.title}
          </h4>

          {document.excerpt && (
            <p className="text-xs text-slate-500 line-clamp-1">
              {document.excerpt}
            </p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Ngày ban hành: {document.issue_date}</span>
            </span>
            <span>•</span>
            <span>{document.download_count} lượt tải</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(document)}
            className="h-8 px-2.5 text-xs text-slate-700 bg-white"
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
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          <span>Tải về</span>
        </Button>
      </div>
    </div>
  );
}
