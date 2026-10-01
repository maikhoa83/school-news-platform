/**
 * Page Detail Preview Modal
 * Allows staff to preview static page content, template, SEO metadata, and relations.
 * School News Platform - Step 09.5A
 */

import React from 'react';
import { ExternalLink, Calendar, User, Layout, Eye, Search, Layers } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { PageStatusBadge } from './PageStatusBadge';
import { PageTemplateBadge } from './PageTemplateBadge';
import { sanitizeHtml } from '../../../lib/sanitize';
import type { PageWithRelations } from '../types/page';

interface PageDetailPreviewModalProps {
  page: PageWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (pageId: string) => void;
}

export const PageDetailPreviewModal: React.FC<PageDetailPreviewModalProps> = ({
  page,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!page) return null;

  const sanitizedContent = sanitizeHtml(page.content || '<p className="text-slate-400 italic">Trang chưa có nội dung văn bản.</p>');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={page.title}
      description={`Đường dẫn định danh: /${page.slug}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {page.published_at
                ? `Xuất bản: ${new Date(page.published_at).toLocaleDateString('vi-VN')}`
                : `Tạo ngày: ${new Date(page.created_at).toLocaleDateString('vi-VN')}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {onEdit && (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onClose();
                  onEdit(page.id);
                }}
              >
                Chỉnh sửa trang
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-1">
        {/* Metadata Header Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <PageStatusBadge status={page.status} />
          <PageTemplateBadge template={page.template} />
          {page.parent && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Layers className="h-3 w-3 text-slate-500" />
              <span>Thuộc trang: {page.parent.title}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <Eye className="h-3 w-3 text-slate-400" />
            <span>{page.view_count || 0} lượt xem</span>
          </span>
          {page.author && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
              <User className="h-3 w-3 text-slate-400" />
              <span>Tác giả: {page.author.full_name}</span>
            </span>
          )}
        </div>

        {/* Featured Image if present */}
        {page.featured_image && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-64 flex items-center justify-center">
            <img
              src={page.featured_image}
              alt={page.title}
              className="w-full h-full object-cover max-h-64"
              loading="lazy"
            />
          </div>
        )}

        {/* Excerpt */}
        {page.excerpt && (
          <div className="p-3 bg-slate-50 border-l-4 border-blue-800 text-sm text-slate-700 font-medium italic rounded-r-md">
            {page.excerpt}
          </div>
        )}

        {/* Content Body */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Nội dung bài viết
          </h4>
          <div
            className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* SEO Meta Information if configured */}
        {(page.meta_title || page.meta_description || page.meta_keywords || page.no_index) && (
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Search className="h-3.5 w-3.5 text-blue-700" />
              <span>Cấu hình SEO đã thiết lập</span>
            </div>
            {page.meta_title && (
              <p>
                <strong>Tiêu đề SEO:</strong> {page.meta_title}
              </p>
            )}
            {page.meta_description && (
              <p>
                <strong>Mô tả SEO:</strong> {page.meta_description}
              </p>
            )}
            {page.meta_keywords && (
              <p>
                <strong>Từ khóa:</strong> {page.meta_keywords}
              </p>
            )}
            {page.no_index && (
              <p className="text-amber-700 font-medium">
                * Trang được thiết lập noindex (chặn bọ tìm kiếm).
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
