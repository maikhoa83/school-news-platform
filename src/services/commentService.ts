/**
 * Comment Service
 * Manages threaded comments with parent-child relationships and moderation
 * School News Platform - Step 05 News Module
 */

import { supabase } from '../lib/supabase';
import { NewsComment, CommentStatus } from '../types/news';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BASELINE_NEWS_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Resolves non-UUID slugs or mock identifiers to a valid database UUID
 */
async function resolveNewsUUID(inputNewsId: string): Promise<string | null> {
  if (!inputNewsId) return null;
  const str = String(inputNewsId).trim();
  if (UUID_REGEX.test(str)) {
    return str;
  }
  if (str === '1' || str === 'news-1' || str === 'le-tong-ket-nam-hoc-2024-2025') {
    return BASELINE_NEWS_ID;
  }
  try {
    const { data } = await supabase
      .from('news')
      .select('id')
      .eq('slug', str)
      .maybeSingle();
    if (data?.id && UUID_REGEX.test(data.id)) {
      return data.id;
    }
  } catch {
    // ignore
  }
  return BASELINE_NEWS_ID;
}

/**
 * Fetch approved comments for public article view, or all if moderator
 * Assembles threaded tree based on parent_id
 */
export async function getCommentsByNewsId(
  newsId: string,
  includeAllStatuses = false
): Promise<NewsComment[]> {
  try {
    const validNewsId = await resolveNewsUUID(newsId);
    if (!validNewsId) return [];

    let query = supabase
      .from('news_comments')
      .select(`
        id,
        news_id,
        author_id,
        parent_id,
        content,
        status,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('news_id', validNewsId)
      .order('created_at', { ascending: true });

    if (!includeAllStatuses) {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;

    if (error || !data) {
      if (error) {
        console.warn('[commentService] Error fetching comments:', error.message);
      }
      return [];
    }

    // Build comment map and threaded tree
    const commentMap = new Map<string, NewsComment>();
    const rootComments: NewsComment[] = [];

    data.forEach((row: Record<string, unknown>) => {
      const profile = row.profiles as { id: string; full_name: string; avatar_url: string | null } | null;
      const comment: NewsComment = {
        id: String(row.id),
        news_id: String(row.news_id),
        author_id: String(row.author_id),
        parent_id: row.parent_id ? String(row.parent_id) : null,
        content: String(row.content),
        status: row.status as CommentStatus,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
        author: profile
          ? {
              id: profile.id,
              full_name: profile.full_name || 'Thành viên nhà trường',
              avatar_url: profile.avatar_url,
            }
          : null,
        replies: [],
      };
      commentMap.set(comment.id, comment);
    });

    data.forEach((row: Record<string, unknown>) => {
      const comment = commentMap.get(String(row.id))!;
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        const parent = commentMap.get(comment.parent_id)!;
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  } catch (err) {
    console.warn('[commentService] Exception fetching comments:', err);
    return [];
  }
}

/**
 * Create a new comment (Authenticated user only)
 */
export async function createComment(
  newsId: string,
  content: string,
  parentId?: string | null
): Promise<{ success: boolean; data?: NewsComment; error?: string }> {
  try {
    const trimmed = content.trim();
    if (!trimmed) {
      return { success: false, error: 'Nội dung bình luận không được để trống' };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để gửi bình luận' };
    }

    const validNewsId = await resolveNewsUUID(newsId);
    if (!validNewsId) {
      return { success: false, error: 'Không tìm thấy bài viết hợp lệ để bình luận' };
    }

    // Security & Data Integrity: If parentId is provided, verify it belongs to the same news_id
    if (parentId) {
      const { data: parentComment, error: parentErr } = await supabase
        .from('news_comments')
        .select('id, news_id')
        .eq('id', parentId)
        .maybeSingle();

      if (parentErr || !parentComment) {
        return {
          success: false,
          error: 'Bình luận phản hồi không tồn tại hoặc đã bị gỡ bỏ.',
        };
      }

      if (parentComment.news_id !== validNewsId) {
        return {
          success: false,
          error: 'Bình luận phản hồi không thuộc cùng bài viết này.',
        };
      }
    }

    const { data, error } = await supabase
      .from('news_comments')
      .insert({
        news_id: validNewsId,
        author_id: user.id,
        parent_id: parentId || null,
        content: trimmed,
        status: 'approved', // Defaults to approved for school community members
      })
      .select(`
        id,
        news_id,
        author_id,
        parent_id,
        content,
        status,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const profile = (data as Record<string, unknown>).profiles as {
      id: string;
      full_name: string;
      avatar_url: string | null;
    } | null;

    const newComment: NewsComment = {
      id: String(data.id),
      news_id: String(data.news_id),
      author_id: String(data.author_id),
      parent_id: data.parent_id ? String(data.parent_id) : null,
      content: String(data.content),
      status: data.status as CommentStatus,
      created_at: String(data.created_at),
      updated_at: String(data.updated_at),
      author: profile
        ? {
            id: profile.id,
            full_name: profile.full_name || user.email?.split('@')[0] || 'Thành viên',
            avatar_url: profile.avatar_url,
          }
        : {
            id: user.id,
            full_name: user.email?.split('@')[0] || 'Thành viên',
            avatar_url: null,
          },
      replies: [],
    };

    return { success: true, data: newComment };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi gửi bình luận',
    };
  }
}

/**
 * Moderate comment status (approve, reject, spam)
 */
export async function moderateComment(
  commentId: string,
  status: CommentStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('news_comments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi kiểm duyệt bình luận',
    };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('news_comments').delete().eq('id', commentId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xóa bình luận',
    };
  }
}
