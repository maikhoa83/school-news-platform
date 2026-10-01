/**
 * Admin News Editor Page
 * Full CMS authoring: Title, Slug, Hierarchical Category, Excerpt, RichTextEditor,
 * ThumbnailUploader, TagInput with recommendations, Workflow actions (Draft, Submit, Publish)
 * School News Platform - Step 05 News Module
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { getNewsById, createNews, updateNews, publishNews, submitNews } from '../../services/newsService';
import { CategorySelect } from '../../components/admin/news/CategorySelect';
import { RichTextEditor } from '../../components/admin/news/RichTextEditor';
import { ThumbnailUploader } from '../../components/admin/news/ThumbnailUploader';
import { TagInput } from '../../components/admin/news/TagInput';
import { slugifyVietnamese } from '../../lib/slugify';
import { NewsStatus } from '../../types/news';

export const AdminNewsEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();

  const { categories, isLoading: isCatsLoading } = useAdminCategories();

  const canPublish = can('news.publish');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState<NewsStatus>('draft');

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing article if editing
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      getNewsById(id)
        .then((item) => {
          if (item) {
            setTitle(item.title);
            setSlug(item.slug);
            setIsSlugManual(true);
            setCategoryId(item.category_id);
            setExcerpt(item.excerpt || '');
            setContent(item.content);
            setThumbnail(item.thumbnail || null);
            setIsFeatured(item.is_featured);
            setStatus(item.status);
            setAuthorName(item.author_name || '');
            setSource(item.source || '');
            setSourceUrl(item.source_url || '');
            if (item.tags) {
              setSelectedTagIds(item.tags.map((t) => t.id));
            }
          } else {
            setErrorMessage('Không tìm thấy bài viết');
          }
        })
        .catch((err) => {
          setErrorMessage(err instanceof Error ? err.message : 'Lỗi tải bài viết');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditMode]);

  // Auto-generate slug from title if not manually customized
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManual) {
      setSlug(slugifyVietnamese(newTitle));
    }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setErrorMessage('Tiêu đề bài viết không được để trống.');
      return false;
    }
    if (!categoryId) {
      setErrorMessage('Vui lòng chọn một chuyên mục cho bài viết.');
      return false;
    }
    if (!content.trim() || content === '<p><br></p>') {
      setErrorMessage('Nội dung bài viết không được để trống.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSave = async (targetStatus: 'draft' | 'pending' | 'published') => {
    if (!validate()) return;
    if (!user) {
      setErrorMessage('Bạn chưa đăng nhập.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (isEditMode && id) {
        // Update
        const res = await updateNews(id, {
          title: title.trim(),
          slug: slug.trim() || slugifyVietnamese(title),
          category_id: categoryId,
          excerpt: excerpt.trim() || undefined,
          content,
          thumbnail: thumbnail || undefined,
          author_name: authorName.trim() || undefined,
          source: source.trim() || undefined,
          source_url: sourceUrl.trim() || undefined,
          is_featured: isFeatured,
          status: targetStatus === 'published' ? undefined : targetStatus,
          tag_ids: selectedTagIds,
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Cập nhật thất bại');
          return;
        }

        // If target is published, trigger publish RPC
        if (targetStatus === 'published') {
          const pubRes = await publishNews(id);
          if (!pubRes.success) {
            setErrorMessage(pubRes.error || 'Lỗi khi xuất bản');
            return;
          }
        } else if (targetStatus === 'pending') {
          await submitNews(id);
        }

        navigate('/admin/news');
      } else {
        // Create new
        const res = await createNews(
          {
            title: title.trim(),
            slug: slug.trim() || `${slugifyVietnamese(title)}-${Date.now().toString(36)}`,
            category_id: categoryId,
            excerpt: excerpt.trim() || undefined,
            content,
            thumbnail: thumbnail || undefined,
            author_name: authorName.trim() || undefined,
            source: source.trim() || undefined,
            source_url: sourceUrl.trim() || undefined,
            is_featured: isFeatured,
            status: targetStatus === 'published' ? 'draft' : targetStatus,
            tag_ids: selectedTagIds,
          },
          user.id
        );

        if (!res.success || !res.data) {
          setErrorMessage(res.error || 'Tạo bài viết thất bại');
          return;
        }

        // If publishing directly
        if (targetStatus === 'published') {
          const pubRes = await publishNews(res.data.id);
          if (!pubRes.success) {
            setErrorMessage(pubRes.error || 'Lỗi khi xuất bản');
            return;
          }
        }

        navigate('/admin/news');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi hệ thống');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-400">
        Đang tải thông tin bài viết...
      </div>
    );
  }

  return (
    <div id="admin-news-editor-page" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Bar with Back & Action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/news"
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              {isEditMode ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới'}
            </h1>
            <p className="text-xs text-neutral-500">
              {isEditMode
                ? `Trạng thái hiện tại: ${status}`
                : 'Nhập thông tin và nội dung bài viết'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Save Draft */}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu nháp</span>
          </button>

          {/* Submit for Review (if not published) */}
          {status !== 'published' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('pending')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi duyệt</span>
            </button>
          )}

          {/* Publish Directly (if has news.publish) */}
          {canPublish && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('published')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Đang lưu...' : 'Xuất bản'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Column (Content) + Right Column (Meta & Settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Title, Excerpt, RichTextEditor (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <label htmlFor="article-title" className="block text-xs font-bold text-neutral-700">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề tin tức, sự kiện..."
              className="w-full px-3.5 py-2.5 text-sm sm:text-base font-semibold bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />

            {/* Slug row */}
            <div className="pt-2 flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-mono text-neutral-400">Đường dẫn: /news/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManual(true);
                }}
                className="flex-1 font-mono text-xs px-2 py-1 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <label htmlFor="article-excerpt" className="block text-xs font-bold text-neutral-700">
              Tóm tắt bài viết (Excerpt / Lead)
            </label>
            <textarea
              id="article-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Đoạn tóm tắt ngắn gọn hiển thị ở danh sách bài viết và đầu trang chi tiết..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-neutral-700">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Soạn thảo nội dung bài viết, chèn các tiêu đề H2, H3 để hệ thống tự động sinh mục lục..."
            />
          </div>
        </div>

        {/* Right Column: Category, Thumbnail, Tags, Settings (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Category Selector */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <label htmlFor="category-select" className="block text-xs font-bold text-neutral-700">
              Chuyên mục bài viết <span className="text-red-500">*</span>
            </label>
            {isCatsLoading ? (
              <div className="text-xs text-neutral-400">Đang tải chuyên mục...</div>
            ) : (
              <CategorySelect
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
                required
              />
            )}
          </div>

          {/* Thumbnail Uploader */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-neutral-700">
              Ảnh đại diện (Thumbnail)
            </label>
            <ThumbnailUploader value={thumbnail} onChange={setThumbnail} />
          </div>

          {/* Author and Source Attribution */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-neutral-700">
              Tác giả &amp; Nguồn bài viết
            </label>

            {/* Author Name */}
            <div className="space-y-1">
              <label htmlFor="article-author" className="block text-[11px] font-medium text-neutral-600">
                Tác giả bài viết
              </label>
              <input
                id="article-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="VD: Thầy Nguyễn Văn A, Ban Truyền thông..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Source */}
            <div className="space-y-1">
              <label htmlFor="article-source" className="block text-[11px] font-medium text-neutral-600">
                Nguồn bài viết (nếu sưu tầm / trích dẫn)
              </label>
              <input
                id="article-source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="VD: Cổng TTĐT Bộ GD&ĐT, Báo Giáo dục..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Source URL */}
            <div className="space-y-1">
              <label htmlFor="article-source-url" className="block text-[11px] font-medium text-neutral-600">
                Đường dẫn liên kết nguồn (URL)
              </label>
              <input
                id="article-source-url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Tags Selector & Auto-suggestion */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-neutral-700">
              Thẻ tag phân loại
            </label>
            <TagInput
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
              articleTitle={title}
              articleContent={content}
            />
          </div>

          {/* Extra Options */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-neutral-700">
              Cài đặt hiển thị
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
              />
              <span>Đánh dấu là bài viết Nổi bật (Featured)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
