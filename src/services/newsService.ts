/**
 * News Service
 * Core business logic for News Module (Public & Admin operations)
 * School News Platform - Step 05 News Module
 */

import { supabase } from '../lib/supabase';
import {
  NewsItem,
  NewsFilterParams,
  NewsPaginationResult,
  NewsStatus,
  NewsCategory,
  NewsTag,
} from '../types/news';
import { slugifyVietnamese } from '../lib/slugify';
import { INITIAL_CATEGORIES } from './categoryService';
import { INITIAL_TAGS } from './tagService';

/**
 * Rich fallback published news items for initial verification & cold database preview
 */
import { INITIAL_PUBLISHED_NEWS } from '../data/seedNewsData';
export { INITIAL_PUBLISHED_NEWS };

/**
 * Format raw database row to NewsItem
 */
function mapDbNews(row: Record<string, unknown>): NewsItem {
  const authorProfile = row.profiles as { id: string; full_name: string; avatar_url: string | null } | null;
  const categoryObj = row.news_categories as NewsCategory | null;

  // Resolve tags
  const tagsList: NewsTag[] = [];
  if (Array.isArray(row.news_tag_relations)) {
    for (const rel of row.news_tag_relations) {
      if (rel.news_tags) {
        tagsList.push(rel.news_tags as NewsTag);
      }
    }
  }

  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    content: String(row.content),
    thumbnail: row.thumbnail ? String(row.thumbnail) : null,
    category_id: String(row.category_id),
    author_id: String(row.author_id),
    status: row.status as NewsStatus,
    is_featured: Boolean(row.is_featured),
    is_highlight: Boolean(row.is_highlight ?? row.is_featured),
    view_count: typeof row.view_count === 'number' ? row.view_count : 0,
    published_at: row.published_at ? String(row.published_at) : null,
    published_by: row.published_by ? String(row.published_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    author: authorProfile
      ? {
          id: authorProfile.id,
          full_name: authorProfile.full_name,
          avatar_url: authorProfile.avatar_url,
        }
      : null,
    category: categoryObj || null,
    tags: tagsList,
  };
}

/**
 * Fetch published news with pagination, category filter, tag filter, and sorting
 */
export async function getPublishedNews(
  params: NewsFilterParams = {}
): Promise<NewsPaginationResult<NewsItem>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(params.limit || 9, 50));
  const offset = (page - 1) * limit;

  try {
    // 1. If searching, route to server-side full-text search function
    if (params.searchQuery && params.searchQuery.trim()) {
      return searchNews(params.searchQuery.trim(), params.categorySlug, params.tagSlug, page, limit);
    }

    let query = supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug,
          description
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug,
            usage_count
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'published');

    if (params.isFeatured !== undefined) {
      query = query.eq('is_featured', params.isFeatured);
    }

    // Category filter by slug: resolve category id first or filter directly if id provided
    if (params.categorySlug && params.categorySlug !== 'all') {
      const { data: catData } = await supabase
        .from('news_categories')
        .select('id')
        .eq('slug', params.categorySlug)
        .maybeSingle();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    // Sorting
    if (params.sort === 'views') {
      query = query.order('view_count', { ascending: false });
    } else if (params.sort === 'oldest') {
      query = query.order('published_at', { ascending: true });
    } else {
      query = query.order('published_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('[newsService] DB error fetching news:', error.message);
      }
      // Return fallback demo items with client filtering for cold DB
      let filtered = [...INITIAL_PUBLISHED_NEWS];
      if (params.categorySlug && params.categorySlug !== 'all') {
        filtered = filtered.filter((n) => n.category?.slug === params.categorySlug);
      }
      if (params.isFeatured !== undefined) {
        filtered = filtered.filter((n) => n.is_featured === params.isFeatured);
      }
      if (params.isHighlight !== undefined) {
        filtered = filtered.filter((n) => Boolean(n.is_highlight) === params.isHighlight);
      }
      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);
      return {
        items: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    const items = data.map((row: Record<string, unknown>) => mapDbNews(row));
    const total = count || items.length;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[newsService] Exception fetching published news:', err);
    return {
      items: INITIAL_PUBLISHED_NEWS.slice(offset, offset + limit),
      total: INITIAL_PUBLISHED_NEWS.length,
      page,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Fetch news detail by slug
 * Automatically calls increment_news_views RPC in background
 */
export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug,
          description
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug,
            usage_count
          )
        )
      `
      )
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      // Fallback
      return INITIAL_PUBLISHED_NEWS.find((n) => n.slug === slug || n.id === slug) || INITIAL_PUBLISHED_NEWS[0] || null;
    }

    const newsItem = mapDbNews(data as Record<string, unknown>);

    // Fire view count increment asynchronously
    supabase.rpc('increment_news_views', { p_news_id: newsItem.id }).then(({ error: viewErr }) => {
      if (viewErr) {
        console.warn('[newsService] Could not increment view count:', viewErr.message);
      }
    });

    return newsItem;
  } catch (err) {
    console.warn('[newsService] Exception fetching news by slug:', err);
    return INITIAL_PUBLISHED_NEWS.find((n) => n.slug === slug || n.id === slug) || INITIAL_PUBLISHED_NEWS[0] || null;
  }
}

/**
 * Fetch 1–4 Related News articles
 * Prioritizes same category, can consider tags, strictly excludes current article!
 */
export async function getRelatedNews(
  currentNewsId: string,
  categoryId: string,
  limit = 4
): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug
        )
      `
      )
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', currentNewsId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      // Fallback from demo news
      return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
    }

    return data.map((r: Record<string, unknown>) => mapDbNews(r));
  } catch (err) {
    console.warn('[newsService] Exception fetching related news:', err);
    return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
  }
}

/**
 * Fetch Older News
 * Prioritizes articles published before the current article's published_at date in the same category
 */
export async function getOlderNews(
  currentNewsId: string,
  categoryId: string,
  publishedAt?: string | null,
  limit = 5
): Promise<NewsItem[]> {
  try {
    let query = supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        created_at,
        updated_at,
        news_categories (
          id,
          name,
          slug
        )
      `
      )
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', currentNewsId);

    if (publishedAt) {
      query = query.lt('published_at', publishedAt);
    }

    query = query.order('published_at', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Return older news from demo
      return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
    }

    return data.map((r: Record<string, unknown>) => mapDbNews(r));
  } catch (err) {
    console.warn('[newsService] Exception fetching older news:', err);
    return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
  }
}

/**
 * Server-side Full-Text Search for News using PostgreSQL search_news_fts RPC
 */
export async function searchNews(
  queryText: string,
  categorySlug?: string,
  tagSlug?: string,
  page = 1,
  limit = 12
): Promise<NewsPaginationResult<NewsItem>> {
  const offset = (page - 1) * limit;

  try {
    // Resolve category id if categorySlug provided
    let categoryId: string | null = null;
    if (categorySlug && categorySlug !== 'all') {
      const { data: catData } = await supabase
        .from('news_categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();
      if (catData) categoryId = catData.id;
    }

    // Resolve tag id if tagSlug provided
    let tagId: string | null = null;
    if (tagSlug) {
      const { data: tData } = await supabase
        .from('news_tags')
        .select('id')
        .eq('slug', tagSlug)
        .maybeSingle();
      if (tData) tagId = tData.id;
    }

    const { data, error } = await supabase.rpc('search_news_fts', {
      p_query: queryText.trim(),
      p_category_id: categoryId,
      p_tag_id: tagId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error || !data || data.length === 0) {
      // Fallback search over demo data
      const q = queryText.toLowerCase();
      const filtered = INITIAL_PUBLISHED_NEWS.filter(
        (n) => n.title.toLowerCase().includes(q) || (n.excerpt && n.excerpt.toLowerCase().includes(q))
      );
      return {
        items: filtered.slice(offset, offset + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }

    const total = data.length > 0 && data[0].total_count ? Number(data[0].total_count) : data.length;
    const items: NewsItem[] = data.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      excerpt: r.excerpt ? String(r.excerpt) : null,
      content: '',
      thumbnail: r.thumbnail ? String(r.thumbnail) : null,
      category_id: String(r.category_id),
      author_id: String(r.author_id),
      status: 'published',
      is_featured: false,
      view_count: typeof r.view_count === 'number' ? r.view_count : 0,
      published_at: r.published_at ? String(r.published_at) : null,
      created_at: '',
      updated_at: '',
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[newsService] Exception in searchNews:', err);
    return {
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Fetch news for Admin Management view with status filters
 */
export async function getAdminNewsList(params: {
  status?: NewsStatus;
  searchQuery?: string;
  categorySlug?: string;
  page?: number;
  limit?: number;
}): Promise<NewsPaginationResult<NewsItem>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(params.limit || 15, 50));
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug
          )
        )
      `,
        { count: 'exact' }
      );

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      query = query.ilike('title', `%${params.searchQuery.trim()}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error || !data) {
      console.warn('[newsService] Admin news fetch error:', error?.message);
      // Fallback
      let list = [...INITIAL_PUBLISHED_NEWS];
      if (params.status) {
        list = list.filter((n) => n.status === params.status);
      }
      return {
        items: list.slice(offset, offset + limit),
        total: list.length,
        page,
        limit,
        totalPages: Math.ceil(list.length / limit) || 1,
      };
    }

    const items = data.map((r: Record<string, unknown>) => mapDbNews(r));
    const total = count || items.length;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[newsService] Exception in getAdminNewsList:', err);
    return {
      items: INITIAL_PUBLISHED_NEWS,
      total: INITIAL_PUBLISHED_NEWS.length,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single news item by ID for editing
 */
export async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug
          )
        )
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return INITIAL_PUBLISHED_NEWS.find((n) => n.id === id) || null;
    }

    return mapDbNews(data as Record<string, unknown>);
  } catch (err) {
    console.warn('[newsService] Exception fetching news by id:', err);
    return null;
  }
}

/**
 * Create a new article with tag relations
 */
export async function createNews(
  input: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    thumbnail?: string;
    category_id: string;
    author_name?: string;
    source?: string;
    source_url?: string;
    is_featured?: boolean;
    is_highlight?: boolean;
    status?: NewsStatus;
    tag_ids?: string[];
  },
  authorId: string
): Promise<{ success: boolean; data?: NewsItem; error?: string }> {
  try {
    const title = input.title.trim();
    if (!title) return { success: false, error: 'Tiêu đề bài viết không được để trống' };
    if (!input.content || !input.content.trim()) {
      return { success: false, error: 'Nội dung bài viết không được để trống' };
    }
    if (!input.category_id) {
      return { success: false, error: 'Vui lòng chọn chuyên mục cho bài viết' };
    }

    if (input.thumbnail && input.thumbnail.startsWith('blob:')) {
      return {
        success: false,
        error: 'Không thể lưu ảnh đại diện dạng blob tạm thời. Vui lòng tải lại ảnh hợp lệ lên hệ thống lưu trữ.',
      };
    }

    const slug = input.slug?.trim() || `${slugifyVietnamese(title)}-${Date.now().toString(36)}`;
    const status: NewsStatus = input.status || 'draft';

    const insertPayload: Record<string, unknown> = {
      title,
      slug,
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      thumbnail: input.thumbnail || null,
      category_id: input.category_id,
      author_id: authorId,
      author_name: input.author_name?.trim() || null,
      source: input.source?.trim() || null,
      source_url: input.source_url?.trim() || null,
      status,
      is_featured: input.is_featured ?? false,
    };
    if (input.is_highlight !== undefined) {
      insertPayload.is_highlight = input.is_highlight;
    }

    // 1. Insert article
    let { data: newsRow, error: newsErr } = await supabase
      .from('news')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if is_highlight column does not exist in remote schema
    if (newsErr && insertPayload.is_highlight !== undefined) {
      delete insertPayload.is_highlight;
      const retry = await supabase
        .from('news')
        .insert(insertPayload)
        .select()
        .single();
      newsRow = retry.data;
      newsErr = retry.error;
    }

    if (newsErr || !newsRow) {
      return { success: false, error: newsErr?.message || 'Lỗi khi lưu bài viết' };
    }

    // 2. Link tags if provided
    if (input.tag_ids && input.tag_ids.length > 0) {
      const relations = input.tag_ids.map((tagId) => ({
        news_id: newsRow.id,
        tag_id: tagId,
      }));
      await supabase.from('news_tag_relations').insert(relations);
    }

    return { success: true, data: newsRow as NewsItem };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo bài viết',
    };
  }
}

/**
 * Update an existing article and its tags
 */
export async function updateNews(
  id: string,
  input: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    category_id?: string;
    author_name?: string;
    source?: string;
    source_url?: string;
    is_featured?: boolean;
    is_highlight?: boolean;
    status?: NewsStatus;
    tag_ids?: string[];
  }
): Promise<{ success: boolean; data?: NewsItem; error?: string }> {
  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updatePayload.title = input.title.trim();
    if (input.slug !== undefined) updatePayload.slug = input.slug.trim();
    if (input.excerpt !== undefined) updatePayload.excerpt = input.excerpt?.trim() || null;
    if (input.content !== undefined) updatePayload.content = input.content;
    if (input.author_name !== undefined) updatePayload.author_name = input.author_name?.trim() || null;
    if (input.source !== undefined) updatePayload.source = input.source?.trim() || null;
    if (input.source_url !== undefined) updatePayload.source_url = input.source_url?.trim() || null;

    if (input.thumbnail !== undefined) {
      if (input.thumbnail && input.thumbnail.startsWith('blob:')) {
        return {
          success: false,
          error: 'Không thể lưu ảnh đại diện dạng blob tạm thời. Vui lòng tải lại ảnh hợp lệ lên hệ thống lưu trữ.',
        };
      }
      updatePayload.thumbnail = input.thumbnail || null;
    }

    if (input.category_id !== undefined) updatePayload.category_id = input.category_id;
    if (input.is_featured !== undefined) updatePayload.is_featured = input.is_featured;
    if (input.is_highlight !== undefined) updatePayload.is_highlight = input.is_highlight;
    if (input.status !== undefined) updatePayload.status = input.status;

    // 1. Update article
    let { data: newsRow, error: newsErr } = await supabase
      .from('news')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    // Fallback if is_highlight column does not exist in remote schema
    if (newsErr && updatePayload.is_highlight !== undefined) {
      delete updatePayload.is_highlight;
      const retry = await supabase
        .from('news')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      newsRow = retry.data;
      newsErr = retry.error;
    }

    if (newsErr || !newsRow) {
      return { success: false, error: newsErr?.message || 'Lỗi khi cập nhật bài viết' };
    }

    // 2. Sync tags if provided
    if (input.tag_ids !== undefined) {
      await supabase.from('news_tag_relations').delete().eq('news_id', id);
      if (input.tag_ids.length > 0) {
        const relations = input.tag_ids.map((tagId) => ({
          news_id: id,
          tag_id: tagId,
        }));
        await supabase.from('news_tag_relations').insert(relations);
      }
    }

    return { success: true, data: newsRow as NewsItem };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi cập nhật bài viết',
    };
  }
}

/**
 * Submit article for review (draft -> pending)
 */
export async function submitNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('news')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi gửi duyệt bài viết',
    };
  }
}

/**
 * Publish article (calls atomic server-side RPC publish_news_item)
 */
export async function publishNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('publish_news_item', { p_news_id: id });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xuất bản bài viết',
    };
  }
}

/**
 * Archive article
 */
export async function archiveNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('news')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi lưu trữ bài viết',
    };
  }
}

/**
 * Delete article
 */
export async function deleteNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xóa bài viết',
    };
  }
}
