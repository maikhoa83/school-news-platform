/**
 * Announcement Detail Reader Modal
 * Secure plain-text display with accessibility and print options
 * School News Platform - Step 07 Thông báo điều hành
 */

import React from 'react';
import { Calendar, User, Pin, Printer, Share2, Check, Clock } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AnnouncementItem } from '../types/announcement';
import { AnnouncementPriorityBadge } from './AnnouncementPriorityBadge';

interface AnnouncementDetailModalProps {
  announcement: AnnouncementItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  announcement,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!announcement) return null;

  const formattedDate = announcement.published_at
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(announcement.published_at))
    : new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(announcement.created_at));

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/thong-bao?id=${announcement.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết thông báo điều hành"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Header Badges & Dates */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <AnnouncementPriorityBadge priority={announcement.priority} />
            {announcement.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Pin className="h-3 w-3 fill-amber-700 text-amber-700" />
                Đã ghim
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formattedDate}
            </span>
            {announcement.creator?.full_name && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {announcement.creator.full_name}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {announcement.title}
        </h2>

        {/* Expiry Warning if exists */}
        {announcement.expires_at && (
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50/70 border border-amber-200 rounded-lg p-2.5">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Thông báo có thời hạn hiển thị đến:{' '}
              <strong>
                {new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(announcement.expires_at))}
              </strong>
            </span>
          </div>
        )}

        {/* Plain-text content - strictly secured against XSS by avoiding dangerouslySetInnerHTML */}
        <div className="bg-slate-50/60 rounded-xl p-4 sm:p-6 border border-slate-100">
          <div className="whitespace-pre-wrap font-sans text-sm sm:text-base text-slate-800 leading-relaxed select-text">
            {announcement.content}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Đã sao chép link</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Sao chép link</span>
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <span className="flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>In thông báo</span>
              </span>
            </Button>
          </div>

          <Button variant="primary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
