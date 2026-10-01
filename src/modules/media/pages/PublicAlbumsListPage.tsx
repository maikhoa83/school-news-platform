/**
 * Public Albums List Page
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Route: /albums or /gallery
 * Displays all published albums in a modern, responsive grid layout.
 */

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Home, ChevronRight, Images } from 'lucide-react';
import { usePublicAlbums } from '../hooks/usePublicAlbums';
import { PublicAlbumGrid } from '../components/PublicAlbumGrid';

export const PublicAlbumsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const {
    albums,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
  } = usePublicAlbums({ page, pageSize: 12 });

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage > 1) {
        next.set('page', String(newPage));
      } else {
        next.delete('page');
      }
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 gap-1.5">
          <Link to="/" className="hover:text-blue-900 flex items-center gap-1 transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-900">Thư viện ảnh & Album</span>
        </nav>

        {/* Page Hero Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
              <Images className="h-3.5 w-3.5 text-blue-300" />
              <span>Khoảnh khắc & Hoạt động Giáo dục</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Thư viện Hình ảnh & Hoạt động
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Tổng hợp hình ảnh các sự kiện, phong trào thi đua, hoạt động ngoại khóa, lễ hội truyền thống và sinh hoạt học đường của thầy và trò nhà trường.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
            <Images className="h-64 w-64 text-white" />
          </div>
        </div>

        {/* Albums Content Grid */}
        <div className="pt-2">
          <PublicAlbumGrid
            albums={albums}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            basePath="/albums"
          />
        </div>
      </div>
    </div>
  );
};
