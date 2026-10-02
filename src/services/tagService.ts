/**
 * Tag Service
 * Manages tags, many-to-many associations, and auto-suggestions
 * School News Platform - Step 05 News Module
 */

import { supabase } from '../lib/supabase';
import { NewsTag } from '../types/news';
import { slugifyVietnamese } from '../lib/slugify';

export const INITIAL_TAGS: NewsTag[] = [
  {
    id: 'tag-00000000-0000-0000-0000-000000000001',
    name: 'Hội khỏe Phù Đổng',
    slug: 'hoi-khoe-phu-dong',
    usage_count: 12,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-00000000-0000-0000-0000-000000000002',
    name: 'Học sinh Giỏi',
    slug: 'hoc-sinh-gioi',
    usage_count: 8,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-00000000-0000-0000-0000-000000000003',
    name: 'Chuyển đổi số',
    slug: 'chuyen-doi-so',
    usage_count: 5,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-00000000-0000-0000-0000-000000000004',
    name: 'Đoàn Thanh niên',
    slug: 'doan-thanh-nien',
    usage_count: 9,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-00000000-0000-0000-0000-000000000005',
    name: 'Kỳ thi Tốt nghiệp',
    slug: 'ky-thi-tot-nghiep',
    usage_count: 7,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Fetch list of tags with optional keyword query
 */
export async function getTags(query?: string, limit = 50): Promise<NewsTag[]> {
  try {
    let q = supabase
      .from('news_tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .order('name', { ascending: true })
      .limit(limit);

    if (query && query.trim()) {
      q = q.ilike('name', `%${query.trim()}%`);
    }

    const { data, error } = await q;

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('[tagService] Database error fetching tags:', error.message);
      }
      if (query && query.trim()) {
        const lowerQ = query.trim().toLowerCase();
        return INITIAL_TAGS.filter((t) => t.name.toLowerCase().includes(lowerQ));
      }
      return INITIAL_TAGS;
    }

    return data as NewsTag[];
  } catch (err) {
    console.warn('[tagService] Exception fetching tags:', err);
    return INITIAL_TAGS;
  }
}

/**
 * Fetch single tag by slug
 */
export async function getTagBySlug(slug: string): Promise<NewsTag | null> {
  try {
    const { data, error } = await supabase
      .from('news_tags')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return INITIAL_TAGS.find((t) => t.slug === slug) || null;
    }

    return data as NewsTag;
  } catch (err) {
    console.warn('[tagService] Exception fetching tag by slug:', err);
    return null;
  }
}

/**
 * Create or return existing tag by name
 */
export async function getOrCreateTag(name: string): Promise<{ success: boolean; data?: NewsTag; error?: string }> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: 'Tên thẻ tag không được để trống' };
  }

  const slug = slugifyVietnamese(trimmedName);

  try {
    // 1. Check if tag exists
    const { data: existing } = await supabase
      .from('news_tags')
      .select('*')
      .or(`name.ilike.${trimmedName},slug.eq.${slug}`)
      .maybeSingle();

    if (existing) {
      return { success: true, data: existing as NewsTag };
    }

    // 2. Insert new tag
    const { data: inserted, error: insertError } = await supabase
      .from('news_tags')
      .insert({
        name: trimmedName,
        slug,
        usage_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, data: inserted as NewsTag };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo thẻ tag',
    };
  }
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('news_tags').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xóa tag',
    };
  }
}

/**
 * Heuristic auto-tag suggestion based on article title and content
 */
export async function suggestTagsForContent(
  title: string,
  content: string,
  existingTags: NewsTag[] = []
): Promise<NewsTag[]> {
  const text = `${title} ${content}`.toLowerCase();
  const allTags = existingTags.length > 0 ? existingTags : await getTags('', 100);

  const matched: NewsTag[] = [];

  for (const tag of allTags) {
    const tagLower = tag.name.toLowerCase();
    if (text.includes(tagLower)) {
      matched.push(tag);
    }
  }

  return matched.slice(0, 6);
}
