/**
 * Public Announcements Page
 * School News Platform - Step 07 Thông báo điều hành
 * Route: /thong-bao (and alias /announcements)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BellRing,
  Search,
  Pin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Home,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  AnnouncementItem,
  AnnouncementPriority,
} from '../types/announcement';
import { getPublicAnnouncements } from '../services/announcementService';
import { AnnouncementPriorityBadge } from '../components/AnnouncementPriorityBadge';
import { AnnouncementDetailModal } from '../components/AnnouncementDetailModal';
import { Button } from '../../../components/ui/Button';

export const AnnouncementsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state sync
  const queryParam = searchParams.get('q') || '';
  const priorityParam = (searchParams.get('priority') as AnnouncementPriority | 'all') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const selectedIdParam = searchParams.get('id');

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [debouncedSearch, setDebouncedSearch] = useState(queryParam);
  const [selectedPriority, setSelectedPriority] = useState<AnnouncementPriority | 'all'>(priorityParam);
  const [page, setPage] = useState(pageParam || 1);

  // Data state
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (selectedPriority !== 'all') params.priority = selectedPriority;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedPriority, page, setSearchParams]);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPublicAnnouncements({
        searchQuery: debouncedSearch || undefined,
        priority: selectedPriority === 'all' ? undefined : selectedPriority,
        page,
        limit: 10,
      });

      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);

      // If URL contains specific announcement id, open modal
      if (selectedIdParam) {
        const found = res.items.find((item) => item.id === selectedIdParam);
        if (found) {
          setSelectedAnnouncement(found);
          setIsModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('[AnnouncementsPage] Notice fetching:', err);
      const msg = err instanceof Error ? err.message : 'Không thể kết nối máy chủ để tải thông báo điều hành.';
      setError(msg);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // Scroll smoothly to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [debouncedSearch, selectedPriority, page]);

  // Handle accordion toggle
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openDetail = (item: AnnouncementItem) => {
    setSelectedAnnouncement(item);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedPriority('all');
    setPage(1);
  };

  const priorityOptions: { value: AnnouncementPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'urgent', label: 'Khẩn cấp' },
    { value: 'important', label: 'Quan trọng' },
    { value: 'normal', label: 'Bình thường' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-700 transition-colors">
              <Home className="h-4 w-4" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">Thông báo điều hành</span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <BellRing className="h-3.5 w-3.5 text-amber-600" />
                Văn phòng Ban Giám hiệu
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Thông báo điều hành
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Cập nhật các thông báo chỉ đạo, kế hoạch học tập, thời khóa biểu và thông báo khẩn cấp chính thức từ nhà trường.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnnouncements}
              className="self-start md:self-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Priority Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Mức độ:
              </span>
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedPriority(opt.value);
                    setPage(1);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    selectedPriority === opt.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Listing */}
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton Loading State
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                    <div className="h-4 w-28 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center space-y-4 shadow-xs">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Không thể tải danh sách thông báo
                </h3>
                <p className="text-sm text-rose-600 max-w-md mx-auto">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnnouncements}
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                <span>Thử lại</span>
              </Button>
            </div>
          ) : items.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <BellRing className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Không tìm thấy thông báo phù hợp
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {debouncedSearch || selectedPriority !== 'all'
                    ? 'Không có thông báo nào khớp với tiêu chí tìm kiếm hiện tại. Bạn có thể thử xóa bộ lọc.'
                    : 'Hiện chưa có thông báo điều hành nào được công bố trên website.'}
                </p>
              </div>
              {(debouncedSearch || selectedPriority !== 'all') && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            // Populated List
            items.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              const formattedDate = item.published_at
                ? new Intl.DateTimeFormat('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(item.published_at))
                : new Intl.DateTimeFormat('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).format(new Date(item.created_at));

              return (
                <article
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    item.is_pinned
                      ? 'border-amber-300 ring-1 ring-amber-200/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-3">
                    {/* Top Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Pin className="h-3 w-3 fill-amber-700 text-amber-700" />
                            ĐÃ GHIM
                          </span>
                        )}
                        <AnnouncementPriorityBadge priority={item.priority} />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Announcement Title */}
                    <h2
                      onClick={() => openDetail(item)}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-700 cursor-pointer transition-colors leading-snug"
                    >
                      {item.title}
                    </h2>

                    {/* Plain-text content: Accordion or Teaser */}
                    <div className="text-sm text-slate-700 leading-relaxed">
                      {isExpanded ? (
                        <div className="whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-100 mt-2 select-text">
                          {item.content}
                        </div>
                      ) : (
                        <p className="line-clamp-2 text-slate-600 font-normal">
                          {item.content}
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors py-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>Thu gọn nội dung</span>
                            <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Xem nhanh nội dung</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openDetail(item)}
                        className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors py-1"
                      >
                        <span>Xem chi tiết</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">
              Hiển thị trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng số <strong>{total}</strong> thông báo)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Trước</span>
              </Button>
              <div className="text-xs font-semibold text-slate-700 px-2">
                Trang {page}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Sau</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reader Modal */}
      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
