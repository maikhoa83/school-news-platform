/**
 * Album Cover Selector Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.2)
 *
 * Provides:
 * - Cover preview for selected media UUID
 * - Media Selector trigger to select image from Media Library
 * - Replace cover action
 * - Remove / clear cover action
 * - Zero arbitrary file path entry (only valid media UUID from Media Library)
 */

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, X, RefreshCw } from 'lucide-react';
import { MediaSelectorModal } from './MediaSelectorModal';
import { MediaPreviewItem } from './MediaPreviewItem';
import { Button } from '../../../components/ui/Button';
import { getMediaById } from '../../../services/mediaService';
import type { MediaWithFolder } from '../../../types/media';

export interface AlbumCoverSelectorProps {
  coverMediaId: string | null | undefined;
  onChange: (coverMediaId: string | null) => void;
  disabled?: boolean;
}

export function AlbumCoverSelector({
  coverMediaId,
  onChange,
  disabled = false,
}: AlbumCoverSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverMedia, setCoverMedia] = useState<MediaWithFolder | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Load cover media details when coverMediaId changes
  useEffect(() => {
    let isCancelled = false;
    if (!coverMediaId) {
      setCoverMedia(null);
      return;
    }

    // If current coverMedia matches ID, skip re-fetch
    if (coverMedia?.id === coverMediaId) return;

    setIsLoadingMedia(true);
    getMediaById(coverMediaId)
      .then((media) => {
        if (!isCancelled) {
          setCoverMedia(media);
        }
      })
      .catch((err) => {
        console.warn('Failed to load cover media details:', err);
        if (!isCancelled) {
          setCoverMedia(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingMedia(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [coverMediaId, coverMedia?.id]);

  const handleSelectMedia = (selected: MediaWithFolder[]) => {
    if (selected.length > 0) {
      const chosen = selected[0];
      setCoverMedia(chosen);
      onChange(chosen.id);
    }
  };

  const handleClearCover = () => {
    setCoverMedia(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        Ảnh bìa album
      </label>

      {coverMediaId && coverMedia ? (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 w-full aspect-video max-w-md">
          <MediaPreviewItem
            filePath={coverMedia.file_path}
            fileType={coverMedia.file_type}
            fileName={coverMedia.file_name}
            altText={coverMedia.alt_text || coverMedia.title}
            className="w-full h-full object-cover"
          />

          {/* Action overlay */}
          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => setIsModalOpen(true)}
              className="bg-white/95 text-slate-800 hover:bg-white text-xs h-8 shadow-md"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Đổi ảnh bìa
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={handleClearCover}
              className="bg-red-50/95 border-red-200 text-red-700 hover:bg-red-100 text-xs h-8 shadow-md"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Gỡ ảnh bìa
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 max-w-md text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <ImageIcon className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-600 font-medium">Chưa có ảnh bìa</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
            Chọn một hình ảnh từ Thư viện đa phương tiện để làm ảnh đại diện cho album.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isLoadingMedia}
            onClick={() => setIsModalOpen(true)}
            className="text-xs h-8 border-slate-300 hover:bg-white text-slate-700"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-800" />
            Chọn ảnh từ Thư viện
          </Button>
        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSelectMedia}
        mode="single"
        title="Chọn ảnh bìa cho album"
        confirmText="Đặt làm ảnh bìa"
        allowedFileTypes={['image']}
        selectedIds={coverMediaId ? [coverMediaId] : []}
      />
    </div>
  );
}
