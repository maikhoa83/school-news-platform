/**
 * Hook for Admin Category Hierarchy Management
 * School News Platform - Step 05 News Module
 */

import { useState, useEffect, useCallback } from 'react';
import { NewsCategory } from '../types/news';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

export function useAdminCategories() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories(true); // include inactive
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải chuyên mục');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (input: {
    name: string;
    slug?: string;
    description?: string;
    parent_id?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await createCategory(input);
      if (res.success) {
        await fetchCategories();
      }
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string;
      parent_id?: string | null;
      sort_order?: number;
      is_active?: boolean;
    }
  ) => {
    setIsSubmitting(true);
    try {
      const res = await updateCategory(id, input);
      if (res.success) {
        await fetchCategories();
      }
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        await fetchCategories();
      }
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    categories,
    isLoading,
    isSubmitting,
    error,
    refetch: fetchCategories,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
  };
}
