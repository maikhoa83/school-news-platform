/**
 * Public Album Card Component
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Displays a single published album card in the public gallery list.
 * - Secure temporary signed URL for cover image.
 * - Accessible link to album detail view.
 * - Publication date and item count indicators.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Images, ArrowRight, Film } from 'lucide-react';
import { useSignedUrl } from '../hooks/useSignedUrl';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { AlbumWithItems } from '../../../types/media';

export interface PublicAlbumCardProps {
  album: AlbumWithItems;
  basePath?: string; // default '/albums'
}

export const PublicAlbumCard: React.FC<PublicAlbumCardProps> = ({
  album,
  basePath = '/albums',
}) => {
  const coverFilePath = album.cover_media?.file_path;
  const isImage = album.cover_media?.file_type === 'image' || !album.cover_media?.file_type;
  const { data: coverUrl, isLoading: isCoverLoading } = useSignedUrl(coverFilePath, isImage);

  // Format published date
  const formattedDate = React.useMemo(() => {
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
  }, [album.published_at, album.created_at]);

  const detailUrl = `${basePath}/${album.slug}`;

  return (
    <article
      id={`public-album-card-${album.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden"
    >
      {/* Cover Image Container */}
      <Link
        to={detailUrl}
        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        aria-label={`Xem album: ${album.title}`}
      >
        {isCoverLoading ? (
          <Skeleton className="h-full w-full" />
        ) : coverUrl ? (
          <img
            src={coverUrl}
            alt={album.cover_media?.alt_text || album.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50/50 text-slate-400">
            <Images className="h-10 w-10 text-slate-300 mb-1" />
            <span className="text-xs font-medium text-slate-400">Bộ sưu tập ảnh</span>
          </div>
        )}

        {/* Video / Photo Count Badge */}
        {typeof album.items_count === 'number' && album.items_count > 0 && (
          <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
            <Images className="h-3 w-3" />
            <span>{album.items_count} ảnh</span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <time dateTime={album.published_at || album.created_at}>{formattedDate}</time>
            </div>
          )}

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-800 transition-colors line-clamp-2">
            <Link
              to={detailUrl}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
            >
              {album.title}
            </Link>
          </h3>

          {album.description && (
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {album.description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-800 group-hover:text-blue-900 inline-flex items-center gap-1">
            <span>Xem chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
};
