/**
 * Media Mutations Hook
 * Coordinates upload, update, delete, and publish actions for media items.
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.1)
 *
 * Enforces:
 * - Client-side validation before any network request
 * - Canonical storage path invariant (storage.objects.name === media.file_path)
 * - Automatic storage cleanup rollback if database record insertion fails
 * - TanStack Query cache invalidation for consistent UI state
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  uploadMediaFile,
  deleteMediaFile,
  validateMediaFile,
  MediaStorageError,
} from '../../../lib/mediaStorage';
import {
  createMediaRecord,
  updateMediaRecord,
  deleteMediaRecord,
  MediaServiceError,
} from '../../../services/mediaService';
import type {
  MediaItem,
  CreateMediaInput,
  UpdateMediaInput,
} from '../../../types/media';

export interface UploadMediaParams {
  file: File;
  title: string;
  alt_text?: string | null;
  caption?: string | null;
  folder_id?: string | null;
  is_published?: boolean;
}

/**
 * Extracts natural width and height from image files in browser memory.
 */
async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return null;
  }
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });
}

export function useMediaMutations() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Uploads file to Supabase Storage, calculates dimensions, and creates database record.
   * If database insertion fails, executes rollback deletion of uploaded storage file.
   */
  const uploadMedia = async (params: UploadMediaParams): Promise<MediaItem> => {
    setIsUploading(true);
    setError(null);

    // 1. Client-side defense-in-depth file validation
    try {
      validateMediaFile(params.file);
    } catch (err) {
      const message =
        err instanceof MediaStorageError
          ? err.message
          : 'Tệp không hợp lệ theo tiêu chuẩn bảo mật.';
      setError(message);
      setIsUploading(false);
      throw err;
    }

    if (!params.title || params.title.trim().length === 0) {
      const msg = 'Tiêu đề tệp không được để trống.';
      setError(msg);
      setIsUploading(false);
      throw new Error(msg);
    }

    // 2. Extract image dimensions if applicable
    let dimensions: { width: number; height: number } | null = null;
    try {
      dimensions = await getImageDimensions(params.file);
    } catch {
      // Non-blocking fallback for dimensions
      dimensions = null;
    }

    // 3. Upload physical file to Storage
    let uploadResult;
    try {
      uploadResult = await uploadMediaFile(params.file);
    } catch (err) {
      const msg =
        err instanceof MediaStorageError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Không thể tải tệp lên máy chủ lưu trữ.';
      setError(msg);
      setIsUploading(false);
      throw err;
    }

    // 4. Create database record
    try {
      const createPayload: CreateMediaInput = {
        title: params.title.trim(),
        file_name: uploadResult.file_name,
        file_path: uploadResult.file_path,
        file_size: uploadResult.file_size,
        mime_type: uploadResult.mime_type,
        file_type: uploadResult.file_type,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        alt_text: params.alt_text?.trim() || null,
        caption: params.caption?.trim() || null,
        folder_id: params.folder_id || null,
        is_published: params.is_published ?? true,
      };

      const record = await createMediaRecord(createPayload);

      // Invalidate relevant queries so UI immediately reflects new media
      await queryClient.invalidateQueries({ queryKey: ['media'] });

      setIsUploading(false);
      return record;
    } catch (dbErr) {
      // 5. Automatic rollback: Delete uploaded file if DB insertion failed
      console.warn(
        '[useMediaMutations] DB insert failed. Executing cleanup rollback for storage file:',
        uploadResult.file_path
      );
      try {
        await deleteMediaFile(uploadResult.file_path);
      } catch (cleanupErr) {
        console.error(
          '[useMediaMutations] Cleanup rollback failed for storage path:',
          uploadResult.file_path,
          cleanupErr
        );
      }

      const msg =
        dbErr instanceof MediaServiceError
          ? dbErr.message
          : dbErr instanceof Error
          ? dbErr.message
          : 'Không thể lưu bản ghi tệp vào cơ sở dữ liệu.';
      setError(msg);
      setIsUploading(false);
      throw dbErr;
    }
  };

  /**
   * Updates metadata for an existing media item.
   */
  const updateMedia = async (
    id: string,
    data: UpdateMediaInput
  ): Promise<MediaItem> => {
    setIsUpdating(true);
    setError(null);

    try {
      const updated = await updateMediaRecord(id, data);
      await queryClient.invalidateQueries({ queryKey: ['media'] });
      setIsUpdating(false);
      return updated;
    } catch (err) {
      const msg =
        err instanceof MediaServiceError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Không thể cập nhật thông tin tệp.';
      setError(msg);
      setIsUpdating(false);
      throw err;
    }
  };

  /**
   * Toggles the published status of an item.
   */
  const togglePublish = async (
    id: string,
    currentStatus: boolean
  ): Promise<MediaItem> => {
    return updateMedia(id, { is_published: !currentStatus });
  };

  /**
   * Deletes a media record from database and physical storage.
   */
  const deleteMedia = async (id: string): Promise<void> => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteMediaRecord(id);
      await queryClient.invalidateQueries({ queryKey: ['media'] });
      setIsDeleting(false);
    } catch (err) {
      const msg =
        err instanceof MediaServiceError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Không thể xóa tệp đa phương tiện.';
      setError(msg);
      setIsDeleting(false);
      throw err;
    }
  };

  return {
    uploadMedia,
    updateMedia,
    togglePublish,
    deleteMedia,
    isUploading,
    isUpdating,
    isDeleting,
    error,
    clearError: () => setError(null),
  };
}
