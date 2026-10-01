/**
 * Homepage Announcements Block
 * School News Platform - Step 07 Thông báo điều hành
 * Integrates directly with Announcements Service with RLS-compliant public filtering.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, Calendar, ChevronRight, Pin, AlertCircle, RefreshCw } from 'lucide-react';
import { BlockRenderProps } from '../../types';
import { Badge } from '../../../components/ui/Badge';
import { AnnouncementItem } from '../../../types/announcement';
import { getPublicAnnouncements } from '../../../services/announcementService';
import { AnnouncementPriorityBadge } from '../../../modules/announcements/components/AnnouncementPriorityBadge';
import { AnnouncementDetailModal } from '../../../modules/announcements/components/AnnouncementDetailModal';

export function AnnouncementsBlock({ block, isPreview }: BlockRenderProps) {
  const { title = 'Thông báo điều hành', presentation } = block.config;
  const maxItems = presentation?.maxItems || 4;

  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnnouncementItem | null>(null);

  const fetchData = () => {
    setIsLoading(true);
    setHasError(false);

    getPublicAnnouncements({ limit: maxItems })
      .then((res) => {
        setItems(res.items.slice(0, maxItems));
      })
      .catch((err) => {
        console.warn('[AnnouncementsBlock] Error fetching announcements:', err);
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [maxItems]);

  return (
    <section aria-label={title} className="space-y-3">
      {/* Block Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 bg-amber-500 rounded-full" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <BellRing className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{title}</span>
          </h2>
        </div>
        <Link
          to="/thong-bao"
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-0.5 transition-colors"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Block Body */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-1.5">
                <div className="h-3 w-1/3 bg-slate-100 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="p-4 text-center space-y-2">
            <div className="text-xs text-rose-600 flex items-center justify-center gap-1.5 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Không thể tải thông báo điều hành.</span>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Thử lại</span>
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Hiện chưa có thông báo điều hành mới.
          </div>
        ) : (
          items.map((item) => {
            const formattedDate = item.published_at
              ? new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                }).format(new Date(item.published_at))
              : '';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 hover:bg-amber-50/40 transition-colors group cursor-pointer space-y-1.5 ${
                  item.is_pinned ? 'bg-amber-50/20' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.is_pinned && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        <Pin className="h-2.5 w-2.5 fill-amber-700 text-amber-700" />
                        GHIM
                      </span>
                    )}

                    {item.priority === 'urgent' && (
                      <Badge variant="danger" className="text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider">
                        Khẩn
                      </Badge>
                    )}

                    {item.priority === 'important' && (
                      <Badge variant="warning" className="text-[10px] px-1.5 py-0 font-bold">
                        Quan trọng
                      </Badge>
                    )}

                    {presentation?.showDate !== false && formattedDate && (
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                      </span>
                    )}
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>

                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </div>
            );
          })
        )}
      </div>

      {/* Reader Modal */}
      <AnnouncementDetailModal
        announcement={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}
