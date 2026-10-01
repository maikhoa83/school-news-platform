/**
 * Public Album Detail Page
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Route: /albums/:slug or /gallery/:slug
 * Displays a single published album with its gallery of media items and full lightbox viewing.
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Images,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { usePublicAlbumDetail } from '../hooks/usePublicAlbumDetail';
import { PublicAlbumGallery } from '../components/PublicAlbumGallery';
import { PublicMediaViewer } from '../components/PublicMediaViewer';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';

export const PublicAlbumDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { album, items, isLoading, isError, error } = usePublicAlbumDetail(slug);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Format published date
  const formattedDate = React.useMemo(() => {
    if (!album) return null;
    const rawDate = album.published_at || album.created_at;
    if (!rawDate) return null;
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(rawDate));
    } catch {
      return null;
    }
  }, [album]);

  const handleOpenViewer = (index: number) => {
    if (index >= 0 && index < items.length) {
      setViewerIndex(index);
      setIsViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Skeleton Breadcrumb */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Skeleton Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          {/* Skeleton Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={`detail-skeleton-${i}`} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !album) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-16 flex items-center justify-center">
        <div
          id="public-album-not-found"
          className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 text-center max-w-md mx-auto shadow-xs space-y-4"
          role="alert"
        >
          <div className="inline-flex p-3.5 rounded-full bg-amber-50 text-amber-600">
            <HelpCircle className="h-10 w-10" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900">Không tìm thấy album</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {error?.message || 'Album ảnh này không tồn tại, chưa được xuất bản hoặc đã được chuyển sang địa chỉ khác.'}
            </p>
          </div>
          <div className="pt-2">
            <Link to="/albums">
              <Button variant="primary" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Quay về Thư viện ảnh</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-blue-900 flex items-center gap-1 transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/albums" className="hover:text-blue-900 transition-colors">
            <span>Thư viện ảnh</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
            {album.title}
          </span>
        </nav>

        {/* Album Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/albums"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-800 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Tất cả album</span>
            </Link>

            {items.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                <Images className="h-3.5 w-3.5" />
                <span>{items.length} tệp đa phương tiện</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {album.title}
            </h1>

            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Ngày xuất bản: </span>
                <time dateTime={album.published_at || album.created_at} className="font-medium text-slate-700">
                  {formattedDate}
                </time>
              </div>
            )}
          </div>

          {album.description && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {album.description}
            </p>
          )}
        </div>

        {/* Media Gallery Grid */}
        <section aria-label="Danh sách hình ảnh và video trong album" className="pt-2">
          <PublicAlbumGallery
            items={items}
            onOpenViewer={handleOpenViewer}
          />
        </section>
      </div>

      {/* Accessible Fullscreen Lightbox Viewer */}
      <PublicMediaViewer
        isOpen={isViewerOpen}
        items={items}
        currentIndex={viewerIndex}
        onClose={handleCloseViewer}
        onIndexChange={(newIdx) => setViewerIndex(newIdx)}
      />
    </div>
  );
};
