/**
 * Hook for Admin Tag Management & Suggestions
 * School News Platform - Step 05 News Module
 */

import { useState, useEffect, useCallback } from 'react';
import { NewsTag } from '../types/news';
import {
  getTags,
  getOrCreateTag,
  deleteTag,
  suggestTagsForContent,
} from '../services/tagService';

export function useAdminTags() {
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async (query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTags(query, 100);
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách thẻ tag');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAddTag = async (name: string) => {
    setIsSubmitting(true);
    try {
      const res = await getOrCreateTag(name);
      if (res.success) {
        await fetchTags();
      }
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await deleteTag(id);
      if (res.success) {
        await fetchTags();
      }
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSuggestions = async (title: string, content: string): Promise<NewsTag[]> => {
    return suggestTagsForContent(title, content, tags);
  };

  return {
    tags,
    isLoading,
    isSubmitting,
    error,
    refetch: fetchTags,
    addTag: handleAddTag,
    deleteTag: handleDeleteTag,
    getSuggestions,
  };
}
