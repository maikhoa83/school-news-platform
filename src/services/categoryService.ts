/**
 * Category Service
 * Handles hierarchical categories (parent-child), slugs, and sort orders
 * School News Platform - Step 05 News Module
 */

import { supabase } from '../lib/supabase';
import { NewsCategory } from '../types/news';
import { slugifyVietnamese } from '../lib/slugify';

/**
 * Fallback initial categories for preview when database is cold
 */
export const INITIAL_CATEGORIES: NewsCategory[] = [
  {
    id: 'cat-00000000-0000-0000-0000-000000000001',
    name: 'Tin tức nhà trường',
    slug: 'tin-tuc-nha-truong',
    description: 'Tin tức tổng hợp về các hoạt động giáo dục và phong trào của nhà trường.',
    parent_id: null,
    sort_order: 0,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    children: [
      {
        id: 'cat-00000000-0000-0000-0000-000000000002',
        name: 'Hoạt động học đường',
        slug: 'hoat-dong-hoc-duong',
        description: 'Các sự kiện ngoại khóa, đoàn đội, hội thao và văn nghệ học sinh.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000001',
        sort_order: 0,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-00000000-0000-0000-0000-000000000003',
        name: 'Thành tích & Khen thưởng',
        slug: 'thanh-tich-khen-thuong',
        description: 'Vinh danh giáo viên và học sinh đạt thành tích cao trong các kỳ thi.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000001',
        sort_order: 1,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'cat-00000000-0000-0000-0000-000000000004',
    name: 'Chuyên môn & Đào tạo',
    slug: 'chuyen-mon-dao-tao',
    description: 'Tin tức sinh hoạt chuyên môn, hội thảo khoa học và đổi mới phương pháp giảng dạy.',
    parent_id: null,
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-00000000-0000-0000-0000-000000000005',
    name: 'Thông báo điều hành',
    slug: 'thong-bao-dieu-hanh',
    description: 'Các văn bản chỉ đạo, lịch công tác và thông báo khẩn từ Ban Giám hiệu.',
    parent_id: null,
    sort_order: 2,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Fetch all categories and build a parent-child tree
 */
export async function getCategories(includeInactive = false): Promise<NewsCategory[]> {
  try {
    let query = supabase
      .from('news_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('[categoryService] Database error fetching categories:', error.message);
      }
      return includeInactive
        ? INITIAL_CATEGORIES
        : INITIAL_CATEGORIES.filter((c) => c.is_active);
    }

    // Build hierarchy tree
    const rawCategories: NewsCategory[] = data as NewsCategory[];
    const categoryMap = new Map<string, NewsCategory>();
    const rootCategories: NewsCategory[] = [];

    rawCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    rawCategories.forEach((cat) => {
      const current = categoryMap.get(cat.id)!;
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(current);
        current.parent = parent;
      } else {
        rootCategories.push(current);
      }
    });

    return rootCategories;
  } catch (err) {
    console.warn('[categoryService] Exception fetching categories:', err);
    return INITIAL_CATEGORIES;
  }
}

/**
 * Fetch category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<NewsCategory | null> {
  try {
    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      // Check fallback
      const findInTree = (cats: NewsCategory[]): NewsCategory | null => {
        for (const c of cats) {
          if (c.slug === slug) return c;
          if (c.children) {
            const found = findInTree(c.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInTree(INITIAL_CATEGORIES);
    }

    return data as NewsCategory;
  } catch (err) {
    console.warn('[categoryService] Exception getting category by slug:', err);
    return null;
  }
}

/**
 * Create a new category
 */
export async function createCategory(input: {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}): Promise<{ success: boolean; data?: NewsCategory; error?: string }> {
  try {
    const slug = input.slug || slugifyVietnamese(input.name);
    const { data, error } = await supabase
      .from('news_categories')
      .insert({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        parent_id: input.parent_id || null,
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as NewsCategory };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo chuyên mục',
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  input: {
    name?: string;
    slug?: string;
    description?: string;
    parent_id?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }
): Promise<{ success: boolean; data?: NewsCategory; error?: string }> {
  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updatePayload.name = input.name.trim();
    if (input.slug !== undefined) updatePayload.slug = input.slug.trim();
    if (input.description !== undefined) updatePayload.description = input.description.trim() || null;
    if (input.sort_order !== undefined) updatePayload.sort_order = input.sort_order;
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

    if (input.parent_id !== undefined) {
      const targetParentId = input.parent_id || null;

      // 1. Direct self-parent check
      if (targetParentId && targetParentId === id) {
        return {
          success: false,
          error: 'Không thể đặt chuyên mục làm chuyên mục cha của chính nó.',
        };
      }

      // 2. Recursive descendant cycle check
      if (targetParentId) {
        const { data: allCats } = await supabase
          .from('news_categories')
          .select('id, parent_id');

        if (allCats && allCats.length > 0) {
          const parentMap = new Map<string, string | null>();
          allCats.forEach((c) => parentMap.set(c.id, c.parent_id));

          let curr: string | null | undefined = targetParentId;
          const visited = new Set<string>();

          while (curr) {
            if (curr === id) {
              return {
                success: false,
                error: 'Không thể đặt chuyên mục con/hậu duệ làm chuyên mục cha (phát hiện chu kỳ danh mục).',
              };
            }
            if (visited.has(curr)) break;
            visited.add(curr);
            curr = parentMap.get(curr);
          }
        }
      }

      updatePayload.parent_id = targetParentId;
    }

    const { data, error } = await supabase
      .from('news_categories')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as NewsCategory };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi cập nhật chuyên mục',
    };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('news_categories').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xóa chuyên mục',
    };
  }
}
