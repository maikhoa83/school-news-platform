/**
 * Threaded Comment Section Component
 * Handles member authentication requirement, nested replies, and submit actions
 * School News Platform - Step 05 News Module
 */

import React, { useState } from 'react';
import { MessageSquare, Send, CornerDownRight, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComments';
import { NewsComment } from '../../types/news';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  newsId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ newsId }) => {
  const { user, isAuthenticated } = useAuth();
  const { comments, isLoading, isSubmitting, postComment } = useComments(newsId);

  const [topLevelContent, setTopLevelContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const handlePostTopLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topLevelContent.trim()) return;

    setFeedback(null);
    const res = await postComment(topLevelContent.trim());
    if (res.success) {
      setTopLevelContent('');
      setFeedback({ text: 'Gửi bình luận thành công.', isError: false });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ text: res.error || 'Lỗi gửi bình luận', isError: true });
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setFeedback(null);
    const res = await postComment(replyContent.trim(), parentId);
    if (res.success) {
      setReplyContent('');
      setReplyingToId(null);
      setFeedback({ text: 'Gửi phản hồi thành công.', isError: false });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ text: res.error || 'Lỗi gửi phản hồi', isError: true });
    }
  };

  const renderComment = (c: NewsComment, isChild = false) => {
    const formattedDate = new Date(c.created_at).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        key={c.id}
        id={`comment-${c.id}`}
        className={`relative ${isChild ? 'pl-6 sm:pl-10 mt-3 pt-3 border-t border-neutral-100' : 'pt-4 border-t border-neutral-200'}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0">
            {c.author?.avatar_url ? (
              <img
                src={c.author.avatar_url}
                alt={c.author.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              c.author?.full_name?.charAt(0) || <User className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                {c.author?.full_name || 'Thành viên nhà trường'}
              </span>
              <span className="text-[11px] text-neutral-400">• {formattedDate}</span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {c.content}
            </p>

            {/* Reply action button */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setReplyingToId(replyingToId === c.id ? null : c.id);
                  setReplyContent('');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 mt-2"
              >
                <CornerDownRight className="w-3 h-3" />
                <span>Phản hồi</span>
              </button>
            )}

            {/* Reply input box */}
            {replyingToId === c.id && (
              <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Phản hồi ${c.author?.full_name || 'bình luận'}...`}
                  rows={2}
                  className="w-full p-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingToId(null)}
                    className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !replyContent.trim()}
                    onClick={() => handlePostReply(c.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi trả lời'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render child replies */}
        {c.replies && c.replies.length > 0 && (
          <div className="space-y-2 mt-2">
            {c.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="news-comments-section" className="my-10 pt-8 border-t-2 border-neutral-100">
      <div className="flex items-center gap-2 mb-6 text-neutral-900 font-bold text-lg">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <span>Bình luận & Thảo luận ({comments.length})</span>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
            feedback.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {feedback.isError && <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Comment Form for Authenticated Members */}
      {isAuthenticated ? (
        <form onSubmit={handlePostTopLevel} className="mb-8">
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                Đang bình luận dưới tên: <strong>{user?.email?.split('@')[0] || 'Thành viên'}</strong>
              </span>
            </div>

            <textarea
              value={topLevelContent}
              onChange={(e) => setTopLevelContent(e.target.value)}
              placeholder="Chia sẻ ý kiến, đóng góp hoặc câu hỏi của bạn về bài viết này..."
              rows={3}
              className="w-full p-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !topLevelContent.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-neutral-700">
            Chức năng bình luận dành riêng cho cán bộ giáo viên, phụ huynh và học sinh nhà trường đã đăng nhập.
          </p>
          <Link
            to="/auth"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            Đăng nhập để bình luận
          </Link>
        </div>
      )}

      {/* Comment List */}
      {isLoading ? (
        <div className="text-center py-6 text-xs text-neutral-400">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-xs text-neutral-500">
          Chưa có bình luận nào cho bài viết này. Hãy là người đầu tiên để lại ý kiến!
        </div>
      ) : (
        <div className="space-y-4">{comments.map((c) => renderComment(c))}</div>
      )}
    </section>
  );
};
