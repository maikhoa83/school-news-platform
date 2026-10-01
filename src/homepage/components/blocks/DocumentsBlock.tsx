/**
 * Documents Block for Homepage Builder
 * Supports:
 * 1. Default List / Table View (Right sidebar or Main content)
 * 2. Grid View (Columns 2 or 3 for Main 8 zone)
 * 3. Category Tree View ("Cây Văn bản - Tài liệu")
 * Real-time data from documentService with download tracking
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Calendar,
  ArrowRight,
  FolderTree,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { BlockRenderProps } from '../../types';
import { DocumentItem, DocumentTypeStat } from '../../../types/document';
import {
  getPublishedDocuments,
  getDocumentTypes,
  requestDocumentDownload,
} from '../../../services/documentService';
import { formatFileSize, getFileTypeInfo } from '../../../lib/documentStorage';
import { Badge } from '../../../components/ui/Badge';

export function DocumentsBlock({ block, isPreview }: BlockRenderProps) {
  const { title = 'Văn bản & Biểu mẫu mới', presentation } = block.config;
  const maxItems = presentation?.maxItems || 5;
  const columns = presentation?.columns || 1;
  const isTreeVariant = (block.config as any)?.variant === 'tree' || (block.config as any)?.variant === 'category-tree';

  const [items, setItems] = useState<DocumentItem[]>([]);
  const [types, setTypes] = useState<DocumentTypeStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (isTreeVariant) {
      getDocumentTypes().then((res) => {
        if (mounted) {
          setTypes(res);
          setIsLoading(false);
        }
      });
    } else {
      getPublishedDocuments({
        limit: maxItems,
        sort: 'latest',
      }).then((res) => {
        if (mounted) {
          setItems(res.items);
          setIsLoading(false);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [maxItems, isTreeVariant]);

  const handleDownload = async (e: React.MouseEvent, doc: DocumentItem) => {
    if (isPreview) {
      e.preventDefault();
      return;
    }

    e.stopPropagation();
    setDownloadingId(doc.id);

    try {
      const result = await requestDocumentDownload(doc.id);
      if (!result.success || !result.url) {
        console.warn('[DocumentsBlock] Download rejected or failed:', result.error);
        return;
      }

      setItems((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, download_count: d.download_count + 1 } : d))
      );

      const link = window.document.createElement('a');
      link.href = result.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = result.fileName || doc.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('[DocumentsBlock] Secure download exception:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section aria-label={title} className="space-y-3">
      {title && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-900 rounded-full" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              {isTreeVariant ? (
                <FolderTree className="h-4 w-4 text-blue-900 shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-blue-900 shrink-0" />
              )}
              <span>{title}</span>
            </h2>
          </div>
          <Link
            to="/tai-lieu"
            onClick={(e) => isPreview && e.preventDefault()}
            className="text-[11px] font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1 transition-colors"
          >
            <span>Tất cả</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-900" />
        </div>
      ) : isTreeVariant ? (
        /* Cây Văn bản - Tài liệu (Category Tree Variant) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {types.length === 0 ? (
            <p className="p-4 text-xs text-slate-500 text-center">Chưa có danh mục văn bản</p>
          ) : (
            types.map((t) => (
              <Link
                key={t.type}
                to={`/tai-lieu?type=${encodeURIComponent(t.type)}`}
                onClick={(e) => isPreview && e.preventDefault()}
                className="flex items-center justify-between p-3 hover:bg-blue-50/50 transition-colors text-xs group"
              >
                <div className="flex items-center gap-2 text-slate-700 group-hover:text-blue-900 font-medium">
                  <FileText className="h-3.5 w-3.5 text-blue-900/70" />
                  <span>{t.type}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-900 font-semibold">
                    {t.count}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-blue-900 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))
          )}
        </div>
      ) : columns > 1 ? (
        /* Grid Variant for Main Zone */
        <div
          className={`grid grid-cols-1 ${
            columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
          } gap-3 sm:gap-4`}
        >
          {items.map((item) => {
            const typeInfo = getFileTypeInfo(item.file_type);
            const isDownloading = downloadingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono font-bold text-slate-800 bg-slate-50 border-slate-300"
                    >
                      {item.document_number}
                    </Badge>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${typeInfo.color}`}
                    >
                      {typeInfo.label}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-500">
                    Cơ quan ban hành: <span className="font-semibold text-slate-700">{item.issuing_authority}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-3">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {item.issue_date}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, item)}
                    disabled={isPreview || isDownloading}
                    className="inline-flex items-center gap-1 text-blue-900 font-semibold hover:underline text-[11px] cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải về</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense List Variant */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {items.map((item) => {
            const typeInfo = getFileTypeInfo(item.file_type);
            const isDownloading = downloadingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3.5 hover:bg-slate-50 transition-colors group space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono font-bold text-slate-800 bg-slate-50 border-slate-300"
                  >
                    {item.document_number}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${typeInfo.color}`}
                    >
                      {typeInfo.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatFileSize(item.file_size)}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {item.issue_date}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, item)}
                    disabled={isPreview || isDownloading}
                    className="inline-flex items-center gap-1 text-blue-900 font-semibold hover:underline text-[11px] cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>Tải về</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
