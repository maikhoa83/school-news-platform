/**
 * Hook for Threaded Comments
 * School News Platform - Step 05 News Module
 */

import { useState, useEffect, useCallback } from 'react';
import { NewsComment } from '../types/news';
import { getCommentsByNewsId, createComment } from '../services/commentService';
import { useAuth } from './useAuth';

export function useComments(newsId?: string) {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadComments = useCallback(async () => {
    if (!newsId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommentsByNewsId(newsId);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải bình luận');
    } finally {
      setIsLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const postComment = async (
    content: string,
    parentId?: string | null
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newsId) return { success: false, error: 'Mã bài viết không hợp lệ' };
    if (!isAuthenticated) {
      return { success: false, error: 'Vui lòng đăng nhập để bình luận' };
    }

    setIsSubmitting(true);
    try {
      const res = await createComment(newsId, content, parentId);
      if (res.success && res.data) {
        // Refresh comment list to reflect new tree
        await loadComments();
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Không thể gửi bình luận' };
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Lỗi gửi bình luận',
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    refetch: loadComments,
    postComment,
  };
}
