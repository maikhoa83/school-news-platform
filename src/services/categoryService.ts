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
    name: 'Hoạt động nhà trường',
    slug: 'hoat-dong-nha-truong',
    description: 'Tin tức và hình ảnh các hoạt động giáo dục, thi đua và phong trào của nhà trường.',
    parent_id: null,
    sort_order: 1,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    children: [
      {
        id: 'cat-00000000-0000-0000-0000-000000000011',
        name: 'Hoạt động chuyên môn',
        slug: 'hoat-dong-chuyen-mon',
        description: 'Sinh hoạt chuyên môn, hội giảng, thao giảng, đổi mới phương pháp giảng dạy GDPT 2018.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000001',
        sort_order: 1,
        is_active: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-00000000-0000-0000-0000-000000000012',
        name: 'Hoạt động đoàn thể',
        slug: 'hoat-dong-doan-the',
        description: 'Hoạt động Chi bộ, Công đoàn, Đoàn Thanh niên, Đội TNTP và phong trào tình nguyện học đường.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000001',
        sort_order: 2,
        is_active: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'cat-00000000-0000-0000-0000-000000000002',
    name: 'Truyền thông',
    slug: 'truyen-thong',
    description: 'Chuyên mục truyền thông, lan tỏa gương sáng giáo dục và bản tin học đường.',
    parent_id: null,
    sort_order: 2,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    children: [
      {
        id: 'cat-00000000-0000-0000-0000-000000000021',
        name: 'Điểm tin giáo dục',
        slug: 'diem-tin-giao-duc',
        description: 'Điểm tin các sự kiện giáo dục nổi bật trong tỉnh và toàn quốc.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000002',
        sort_order: 1,
        is_active: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-00000000-0000-0000-0000-000000000022',
        name: 'Gương sáng GD',
        slug: 'guong-sang-gd',
        description: 'Tuyên dương các tấm gương nhà giáo tiêu biểu và học sinh vượt khó học giỏi.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000002',
        sort_order: 2,
        is_active: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-00000000-0000-0000-0000-000000000023',
        name: 'Phổ biến pháp luật',
        slug: 'pho-bien-phap-luat',
        description: 'Tuyên truyền, phổ biến giáo dục pháp luật, an toàn giao thông và kỹ năng sống cho học sinh.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000002',
        sort_order: 3,
        is_active: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'cat-00000000-0000-0000-0000-000000000003',
    name: 'Thông tin',
    slug: 'thong-tin',
    description: 'Thông tin hướng dẫn tuyển sinh đầu cấp và các kỳ thi quan trọng.',
    parent_id: null,
    sort_order: 3,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    children: [
      {
        id: 'cat-00000000-0000-0000-0000-000000000031',
        name: 'Tuyển sinh đầu cấp',
        slug: 'tuyen-sinh-dau-cap',
        description: 'Kế hoạch, chỉ tiêu và hướng dẫn nộp hồ sơ tuyển sinh vào lớp 6 và lớp 10.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000003',
        sort_order: 1,
        is_active: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-00000000-0000-0000-0000-000000000032',
        name: 'Thi TN THPT',
        slug: 'thi-tn-thpt',
        description: 'Quy chế thi, lịch ôn tập, thi thử và thông tin kỳ thi tốt nghiệp THPT Quốc gia.',
        parent_id: 'cat-00000000-0000-0000-0000-000000000003',
        sort_order: 2,
        is_active: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    ],
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

/**
 * Synchronize and restore 7 standard school categories to database
 */
export async function syncDefaultSchoolCategories(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    const toUpsert: any[] = [];
    for (const parent of INITIAL_CATEGORIES) {
      toUpsert.push({
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        parent_id: null,
        sort_order: parent.sort_order,
        is_active: parent.is_active,
      });
      if (parent.children) {
        for (const child of parent.children) {
          toUpsert.push({
            id: child.id,
            name: child.name,
            slug: child.slug,
            description: child.description,
            parent_id: parent.id,
            sort_order: child.sort_order,
            is_active: child.is_active,
          });
        }
      }
    }

    const { error } = await supabase.from('news_categories').upsert(toUpsert, { onConflict: 'id' });
    if (error) {
      console.warn('[categoryService] Database upsert warning:', error.message);
    }
    return { success: true, count: toUpsert.length };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Lỗi đồng bộ chuyên mục',
    };
  }
}

