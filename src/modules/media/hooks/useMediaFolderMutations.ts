/**
 * Media Folder Mutations Hook
 * Coordinates creation, updating, and deletion of media folders.
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album (G3.1)
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createMediaFolder,
  updateMediaFolder,
  deleteMediaFolder,
  MediaServiceError,
} from '../../../services/mediaService';
import type {
  MediaFolder,
  CreateMediaFolderInput,
  UpdateMediaFolderInput,
} from '../../../types/media';

export function useMediaFolderMutations() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFolder = async (data: CreateMediaFolderInput): Promise<MediaFolder> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createMediaFolder(data);
      await queryClient.invalidateQueries({ queryKey: ['media', 'folders'] });
      setIsSubmitting(false);
      return created;
    } catch (err) {
      const msg =
        err instanceof MediaServiceError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Không thể tạo thư mục.';
      setError(msg);
      setIsSubmitting(false);
      throw err;
    }
  };

  const updateFolder = async (
    id: string,
    data: UpdateMediaFolderInput
  ): Promise<MediaFolder> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await updateMediaFolder(id, data);
      await queryClient.invalidateQueries({ queryKey: ['media', 'folders'] });
      setIsSubmitting(false);
      return updated;
    } catch (err) {
      const msg =
        err instanceof MediaServiceError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Không thể cập nhật thư mục.';
      setError(msg);
      setIsSubmitting(false);
      throw err;
    }
  };

  const deleteFolder = async (id: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteMediaFolder(id);
      // Invalidate both folders and media library (since media items in this folder now have folder_id = null)
      await queryClient.invalidateQueries({ queryKey: ['media'] });
      setIsSubmitting(false);
    } catch (err) {
      const msg =
        err instanceof MediaServiceError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Không thể xóa thư mục.';
      setError(msg);
      setIsSubmitting(false);
      throw err;
    }
  };

  return {
    createFolder,
    updateFolder,
    deleteFolder,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}
