/**
 * Public Album Gallery Grid Component
 * School News Platform - Step 08 Media Module (G3.3 Public Gallery)
 *
 * Renders the responsive grid of photos and videos inside a published album.
 * Clicking or pressing Enter on any item opens the accessible lightbox viewer.
 */

import React from 'react';
import { Film, Images, AlertCircle } from 'lucide-react';
import { useSignedUrl } from '../hooks/useSignedUrl';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import type { AlbumMediaItem } from '../../../types/media';

export interface PublicAlbumGalleryProps {
  items: AlbumMediaItem[];
  onOpenViewer: (index: number) => void;
  isLoading?: boolean;
}

interface GalleryThumbnailProps {
  item: AlbumMediaItem;
  index: number;
  onClick: () => void;
}

const GalleryThumbnail: React.FC<GalleryThumbnailProps> = ({ item, index, onClick }) => {
  const media = item.media;
  const isVideo = media?.file_type === 'video';
  const isImage = media?.file_type === 'image' || !media?.file_type;

  const { data: signedUrl, isLoading, isError } = useSignedUrl(media?.file_path, isImage);

  const labelText = item.caption || media?.title || media?.file_name || `Mục đa phương tiện số ${index + 1}`;
  const altText = media?.alt_text || labelText;

  return (
    <button
      type="button"
      id={`gallery-item-btn-${item.id}`}
      onClick={onClick}
      className="group relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 transition-all text-left block"
      aria-label={`Xem chi tiết: ${labelText}`}
    >
      {isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : isError || !signedUrl ? (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
          {isVideo ? (
            <Film className="h-8 w-8 text-slate-400 mb-1" />
          ) : (
            <AlertCircle className="h-6 w-6 text-slate-400 mb-1" />
          )}
          <span className="text-[11px] text-slate-500 line-clamp-1">{media?.file_name || 'Lỗi tải'}</span>
        </div>
      ) : (
        <img
          src={signedUrl}
          alt={altText}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}

      {/* Video Indicator Overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 group-hover:bg-slate-950/30 transition-colors">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-900/80 text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
            <Film className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
          </div>
        </div>
      )}

      {/* Caption Overlay on Hover */}
      {item.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-2 sm:p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[11px] sm:text-xs text-white font-medium line-clamp-1">
            {item.caption}
          </p>
        </div>
      )}
    </button>
  );
};

export const PublicAlbumGallery: React.FC<PublicAlbumGalleryProps> = ({
  items,
  onOpenViewer,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        id="public-gallery-skeleton-grid"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        aria-busy="true"
        aria-label="Đang tải danh sách ảnh trong album"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={`gallery-skeleton-${i}`} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div id="public-gallery-empty-state" className="my-8">
        <EmptyState
          icon={<Images className="h-10 w-10 text-slate-400" />}
          title="Album chưa có hình ảnh hoặc video"
          description="Nội dung đa phương tiện của album này đang được Ban Biên tập cập nhật."
        />
      </div>
    );
  }

  return (
    <div
      id="public-album-gallery-grid"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      {items.map((item, index) => (
        <GalleryThumbnail
          key={item.id}
          item={item}
          index={index}
          onClick={() => onOpenViewer(index)}
        />
      ))}
    </div>
  );
};
