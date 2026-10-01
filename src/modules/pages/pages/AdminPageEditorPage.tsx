/**
 * Admin Page Create & Edit Editor
 * School News Platform - Step 09.5A
 *
 * Full CMS authoring interface:
 * - Title & Auto-slug generator (with manual edit override & SLUG_REGEX validation)
 * - RichTextEditor with XSS sanitization, live preview & raw HTML editing
 * - Hierarchical Parent Page selector (with self-parent loop prevention)
 * - Template selector (default, fullwidth, sidebar, contact)
 * - Excerpt & Featured image (upload & direct URL)
 * - Status workflow (draft, published, archived) with publication date scheduling
 * - Collapsible SEO metadata panel (meta title, description, keywords, og_image, canonical, noindex)
 * - Delete page modal in Edit mode
 * - Strict RBAC permission enforcement
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Search,
  Sparkles,
  Layers,
  Layout,
  Calendar,
  Image as ImageIcon,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { usePage, usePages, usePageMutations } from '../hooks';
import { RichTextEditor } from '../../../components/admin/news/RichTextEditor';
import { ThumbnailUploader } from '../../../components/admin/news/ThumbnailUploader';
import { PageStatusBadge } from '../components/PageStatusBadge';
import { PageDeleteConfirmModal } from '../components/PageDeleteConfirmModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { slugifyVietnamese } from '../../../lib/slugify';
import {
  PAGE_STATUS_CONFIG,
  PAGE_TEMPLATE_CONFIG,
} from '../config/pagesConfig';
import {
  pageCreateSchema,
  pageUpdateSchema,
  SLUG_REGEX,
} from '../schemas/pageSchema';
import type {
  PageStatus,
  PageTemplate,
  PageCreateInput,
  PageUpdateInput,
} from '../types/page';

export const AdminPageEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { can } = usePermissions();

  const canCreate = can('pages.create');
  const canEdit = can('pages.edit');
  const canDelete = can('pages.delete');

  // Load target page when in edit mode
  const { page: existingPage, isLoading: isFetchingPage, isError: isPageLoadError, error: pageLoadError } = usePage(id);

  // Load parent candidate pages (excluding self)
  const { items: allPages } = usePages({ limit: 100 });
  const availableParents = allPages.filter((p) => !isEditMode || p.id !== id);

  // Mutations
  const { createPage, updatePage, deletePage, isCreating, isUpdating, isDeleting } = usePageMutations();
  const isSaving = isCreating || isUpdating;

  // Form Field States
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [template, setTemplate] = useState<PageTemplate>('default');
  const [status, setStatus] = useState<PageStatus>('draft');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [publishedAt, setPublishedAt] = useState<string>('');

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [noIndex, setNoIndex] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  // UI Feedback States
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Populate form fields when existingPage arrives
  useEffect(() => {
    if (isEditMode && existingPage) {
      setTitle(existingPage.title || '');
      setSlug(existingPage.slug || '');
      setIsSlugManual(true);
      setContent(existingPage.content || '');
      setExcerpt(existingPage.excerpt || '');
      setFeaturedImage(existingPage.featured_image || null);
      setParentId(existingPage.parent_id || null);
      setTemplate(existingPage.template || 'default');
      setStatus(existingPage.status || 'draft');
      setSortOrder(existingPage.sort_order ?? 0);

      if (existingPage.published_at) {
        // Format ISO date to YYYY-MM-DDTHH:mm for datetime-local input
        const d = new Date(existingPage.published_at);
        const pad = (n: number) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setPublishedAt(formatted);
      } else {
        setPublishedAt('');
      }

      setMetaTitle(existingPage.meta_title || '');
      setMetaDescription(existingPage.meta_description || '');
      setMetaKeywords(existingPage.meta_keywords || '');
      setOgImage(existingPage.og_image || '');
      setCanonicalUrl(existingPage.canonical_url || '');
      setNoIndex(Boolean(existingPage.no_index));
    }
  }, [isEditMode, existingPage]);

  // Check editing authorization
  const isAuthor = Boolean(user?.id && existingPage?.author_id === user.id);
  const hasEditPermission = isEditMode ? canEdit || isAuthor : canCreate;

  // Title change with auto-slug calculation
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManual) {
      setSlug(slugifyVietnamese(newTitle));
    }
  };

  // Slug manual edit
  const handleSlugChange = (newSlug: string) => {
    setIsSlugManual(true);
    setSlug(newSlug.toLowerCase());
  };

  // Form validation using Zod
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Tiêu đề trang không được để trống.';
    } else if (title.trim().length > 255) {
      errors.title = 'Tiêu đề trang không được vượt quá 255 ký tự.';
    }

    if (!slug.trim()) {
      errors.slug = 'Đường dẫn định danh (slug) không được để trống.';
    } else if (slug.trim().length > 100) {
      errors.slug = 'Đường dẫn định danh không được vượt quá 100 ký tự.';
    } else if (!SLUG_REGEX.test(slug.trim())) {
      errors.slug =
        'Slug chỉ chứa chữ cái thường (a-z), chữ số (0-9) và dấu gạch ngang (-), không có dấu gạch ở đầu hoặc cuối.';
    }

    if (excerpt.length > 500) {
      errors.excerpt = 'Tóm tắt không được vượt quá 500 ký tự.';
    }

    if (metaTitle.length > 255) {
      errors.metaTitle = 'Meta title không được vượt quá 255 ký tự.';
    }

    if (metaDescription.length > 500) {
      errors.metaDescription = 'Meta description không được vượt quá 500 ký tự.';
    }

    if (metaKeywords.length > 500) {
      errors.metaKeywords = 'Meta keywords không được vượt quá 500 ký tự.';
    }

    if (isEditMode && id && parentId === id) {
      errors.parentId = 'Trang không thể tự chọn chính mình làm trang cha.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleSave = async (overrideStatus?: PageStatus) => {
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      setGeneralError('Vui lòng kiểm tra lại các trường thông tin có lỗi màu đỏ.');
      return;
    }

    const targetStatus = overrideStatus || status;
    const finalPublishedAt =
      targetStatus === 'published'
        ? publishedAt
          ? new Date(publishedAt).toISOString()
          : new Date().toISOString()
        : null;

    try {
      if (isEditMode && id) {
        // Update existing page
        const updatePayload: PageUpdateInput = {
          title: title.trim(),
          slug: slug.trim(),
          content,
          excerpt: excerpt.trim() || null,
          featured_image: featuredImage || null,
          parent_id: parentId || null,
          template,
          status: targetStatus,
          sort_order: Number(sortOrder) || 0,
          published_at: finalPublishedAt,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          meta_keywords: metaKeywords.trim() || null,
          og_image: ogImage.trim() || null,
          canonical_url: canonicalUrl.trim() || null,
          no_index: noIndex,
        };

        await updatePage({ id, input: updatePayload });
        setSuccessMessage('Đã cập nhật thông tin trang thành công.');
        setTimeout(() => navigate('/admin/pages'), 1200);
      } else {
        // Create new page
        const createPayload: PageCreateInput = {
          title: title.trim(),
          slug: slug.trim(),
          content,
          excerpt: excerpt.trim() || null,
          featured_image: featuredImage || null,
          parent_id: parentId || null,
          template,
          status: targetStatus,
          sort_order: Number(sortOrder) || 0,
          published_at: finalPublishedAt,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          meta_keywords: metaKeywords.trim() || null,
          og_image: ogImage.trim() || null,
          canonical_url: canonicalUrl.trim() || null,
          no_index: noIndex,
        };

        await createPage(createPayload);
        setSuccessMessage('Đã tạo trang tĩnh mới thành công.');
        setTimeout(() => navigate('/admin/pages'), 1200);
      }
    } catch (err) {
      console.error('[AdminPageEditorPage] Save failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Lỗi khi lưu trang tĩnh.';
      if (errMsg.includes('DUPLICATE_SLUG') || errMsg.toLowerCase().includes('slug')) {
        setFormErrors((prev) => ({
          ...prev,
          slug: 'Đường dẫn định danh (slug) này đã được sử dụng. Vui lòng chọn slug khác.',
        }));
      }
      setGeneralError(errMsg);
    }
  };

  // Handle Page Deletion
  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(pageId);
      setIsDeleteModalOpen(false);
      navigate('/admin/pages');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Không thể xóa trang tĩnh.');
    }
  };

  // Loading indicator for Edit Mode
  if (isEditMode && isFetchingPage) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-800 border-t-transparent" />
        <p className="text-xs text-slate-500 font-medium">Đang tải thông tin trang tĩnh...</p>
      </div>
    );
  }

  // Error loading page
  if (isEditMode && (isPageLoadError || !existingPage)) {
    return (
      <div className="p-8 text-center space-y-4 bg-red-50/50 rounded-xl border border-red-200">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
        <h2 className="text-base font-bold text-red-950">Không tìm thấy trang yêu cầu</h2>
        <p className="text-xs text-red-700 max-w-md mx-auto">
          {pageLoadError instanceof Error ? pageLoadError.message : 'Trang không tồn tại hoặc bạn không có quyền truy cập.'}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => navigate('/admin/pages')}>
          Quay lại danh sách trang
        </Button>
      </div>
    );
  }

  // Unauthorized guard
  if (!hasEditPermission) {
    return (
      <div className="p-8 text-center space-y-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
        <Lock className="h-8 w-8 text-amber-600 mx-auto" />
        <h2 className="text-base font-bold">Không có quyền thao tác</h2>
        <p className="text-xs text-amber-800 max-w-md mx-auto">
          Bạn không có quyền {isEditMode ? 'chỉnh sửa' : 'tạo mới'} trang thông tin tĩnh. Vui lòng liên hệ quản trị viên.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => navigate('/admin/pages')}>
          Quay lại danh sách trang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/admin" className="hover:text-blue-800">
              Quản trị
            </Link>
            <span>/</span>
            <Link to="/admin/pages" className="hover:text-blue-800">
              Trang tĩnh
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">
              {isEditMode ? 'Chỉnh sửa trang' : 'Tạo trang mới'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-800" />
            <span>{isEditMode ? `Chỉnh sửa: ${existingPage?.title}` : 'Tạo trang tĩnh mới'}</span>
          </h1>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/pages')}
            disabled={isSaving}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Quay lại</span>
          </Button>

          {/* Quick Draft Save */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            isLoading={isSaving && status === 'draft'}
          >
            Lưu bản nháp
          </Button>

          {/* Primary Save */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving}
            isLoading={isSaving && status !== 'draft'}
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>{isEditMode ? 'Cập nhật' : 'Xuất bản / Lưu'}</span>
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {generalError && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-950">Không thể lưu trang</p>
            <p className="text-red-800">{generalError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label htmlFor="page-title" className="block text-sm font-semibold text-slate-900">
                Tiêu đề trang <span className="text-red-500">*</span>
              </label>
              <input
                id="page-title"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Giới thiệu trường, Lịch sử hình thành, Cơ cấu tổ chức..."
                className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all ${
                  formErrors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                }`}
              />
              {formErrors.title && (
                <p className="text-xs text-red-600 font-medium">{formErrors.title}</p>
              )}
            </div>

            {/* Slug Input with Auto/Manual toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="page-slug" className="font-semibold text-slate-700">
                  Đường dẫn định danh (Slug) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugManual(!isSlugManual);
                    if (isSlugManual) {
                      setSlug(slugifyVietnamese(title));
                    }
                  }}
                  className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium"
                >
                  {isSlugManual ? (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>Đặt tự động theo tiêu đề</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3" />
                      <span>Tự chỉnh sửa đường dẫn</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-mono text-slate-400 select-none">
                  /page/
                </span>
                <input
                  id="page-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="gioi-thieu-truong"
                  disabled={!isSlugManual && !isEditMode}
                  className={`w-full pl-16 pr-3.5 py-2 bg-slate-50 border rounded-lg text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                    formErrors.slug ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {formErrors.slug ? (
                <p className="text-xs text-red-600 font-medium">{formErrors.slug}</p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Đường dẫn công khai hiển thị trên trình duyệt. Chỉ dùng chữ thường không dấu, số và gạch ngang.
                </p>
              )}
            </div>

            {/* Excerpt Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="page-excerpt" className="font-semibold text-slate-700">
                  Tóm tắt ngắn (Excerpt)
                </label>
                <span className={`text-[11px] ${excerpt.length > 500 ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                  {excerpt.length}/500 ký tự
                </span>
              </div>
              <textarea
                id="page-excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Đoạn văn ngắn tóm lược nội dung trang, dùng để giới thiệu hoặc hiển thị khi chia sẻ..."
                className={`w-full px-3.5 py-2 border rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all ${
                  formErrors.excerpt ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {formErrors.excerpt && (
                <p className="text-xs text-red-600 font-medium">{formErrors.excerpt}</p>
              )}
            </div>

            {/* Content Rich Text Editor */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-900">
                  Nội dung chi tiết trang tĩnh
                </label>
                <span className="text-[11px] text-slate-400">
                  Hỗ trợ định dạng tiêu đề H2-H4, bảng, ảnh, liên kết, danh sách
                </span>
              </div>

              <RichTextEditor
                value={content}
                onChange={(newContent) => setContent(newContent)}
                placeholder="Bắt đầu soạn thảo nội dung trang tại đây..."
              />
            </div>
          </div>

          {/* SEO Collapsible Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSeoOpen(!isSeoOpen)}
              className="w-full p-4 flex items-center justify-between bg-slate-50/75 hover:bg-slate-100/75 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-800" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cấu hình SEO & Siêu dữ liệu (Meta Tags)</h3>
                  <p className="text-xs text-slate-500">
                    Tùy chỉnh tiêu đề hiển thị Google, mô tả tóm tắt, ảnh OpenGraph mạng xã hội và chỉ mục tìm kiếm
                  </p>
                </div>
              </div>
              {isSeoOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {isSeoOpen && (
              <div className="p-5 border-t border-slate-200 space-y-4 bg-white animate-fadeIn">
                {/* Meta Title */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="meta-title" className="font-semibold text-slate-700">
                      Tiêu đề SEO (Meta Title)
                    </label>
                    <span className="text-slate-400">{metaTitle.length}/255 ký tự (khuyên dùng 50-60)</span>
                  </div>
                  <input
                    id="meta-title"
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Tiêu đề trang hiển thị trên Google'}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="meta-description" className="font-semibold text-slate-700">
                      Mô tả SEO (Meta Description)
                    </label>
                    <span className="text-slate-400">{metaDescription.length}/500 ký tự (khuyên dùng 150-160)</span>
                  </div>
                  <textarea
                    id="meta-description"
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt || 'Đoạn mô tả ngắn xuất hiện dưới tiêu đề khi tìm kiếm trên Google...'}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="space-y-1">
                  <label htmlFor="meta-keywords" className="block text-xs font-semibold text-slate-700">
                    Từ khóa SEO (Meta Keywords)
                  </label>
                  <input
                    id="meta-keywords"
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="giới thiệu, trường học, ban giám hiệu, quy chế..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-700"
                  />
                  <p className="text-[11px] text-slate-400">Các từ khóa cách nhau bằng dấu phẩy</p>
                </div>

                {/* OpenGraph Image */}
                <div className="space-y-1">
                  <label htmlFor="meta-og-image" className="block text-xs font-semibold text-slate-700">
                    Đường dẫn ảnh chia sẻ mạng xã hội (og:image)
                  </label>
                  <input
                    id="meta-og-image"
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://... hoặc dùng ảnh đại diện trang"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                {/* Canonical URL */}
                <div className="space-y-1">
                  <label htmlFor="meta-canonical" className="block text-xs font-semibold text-slate-700">
                    Đường dẫn chuẩn (Canonical URL)
                  </label>
                  <input
                    id="meta-canonical"
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="Để trống nếu sử dụng đường dẫn mặc định của trang"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                {/* NoIndex Toggle */}
                <div className="pt-2 border-t border-slate-100 flex items-start gap-2.5">
                  <input
                    id="meta-no-index"
                    type="checkbox"
                    checked={noIndex}
                    onChange={(e) => setNoIndex(e.target.checked)}
                    className="h-4 w-4 text-blue-700 rounded border-slate-300 focus:ring-blue-700 mt-0.5"
                  />
                  <div>
                    <label htmlFor="meta-no-index" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Chặn công cụ tìm kiếm lập chỉ mục trang này (noindex)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Bật tùy chọn này nếu trang chỉ phục vụ nội bộ, biểu mẫu tạm thời hoặc không muốn hiển thị trên kết quả tìm kiếm Google.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Status & Publishing Workflow */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Calendar className="h-4 w-4 text-blue-800" />
              <span>Trạng thái & Xuất bản</span>
            </h3>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label htmlFor="page-status" className="block text-xs font-semibold text-slate-700">
                Trạng thái lưu trữ
              </label>
              <select
                id="page-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PageStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-700"
              >
                <option value="draft">Bản nháp (Draft)</option>
                <option value="published">Đã xuất bản (Published)</option>
                <option value="archived">Đã lưu trữ (Archived)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                {PAGE_STATUS_CONFIG[status]?.description}
              </p>
            </div>

            {/* Publication Date (if published) */}
            {status === 'published' && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label htmlFor="page-published-at" className="block text-xs font-semibold text-slate-700">
                  Thời gian xuất bản
                </label>
                <input
                  id="page-published-at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-700"
                />
                <p className="text-[11px] text-slate-400">
                  Để trống để tự động lấy thời điểm hiện tại khi lưu.
                </p>
              </div>
            )}

            {/* Sort Order */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="page-sort-order" className="font-semibold text-slate-700">
                  Thứ tự sắp xếp (Sort Order)
                </label>
                <span className="text-[11px] text-slate-400">Số nhỏ xếp trước</span>
              </div>
              <input
                id="page-sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          {/* Card 2: Page Hierarchy (Parent Page) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Layers className="h-4 w-4 text-blue-800" />
              <span>Cấp bậc phân trang</span>
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="page-parent-id" className="block text-xs font-semibold text-slate-700">
                Trang cha (Parent Page)
              </label>
              <select
                id="page-parent-id"
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-700"
              >
                <option value="">(Không có trang cha - Trang cấp 1)</option>
                {availableParents.map((parentCandidate) => (
                  <option key={parentCandidate.id} value={parentCandidate.id}>
                    {parentCandidate.title} (/{parentCandidate.slug})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Tạo cấu trúc phân cấp (ví dụ: &ldquo;Cơ cấu tổ chức&rdquo; thuộc trang &ldquo;Giới thiệu chung&rdquo;).
              </p>
            </div>
          </div>

          {/* Card 3: Layout Template Selection */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Layout className="h-4 w-4 text-blue-800" />
              <span>Giao diện bố cục</span>
            </h3>

            <div className="space-y-2">
              {(Object.keys(PAGE_TEMPLATE_CONFIG) as PageTemplate[]).map((tmplKey) => {
                const isSelected = template === tmplKey;
                const tmplInfo = PAGE_TEMPLATE_CONFIG[tmplKey];
                return (
                  <label
                    key={tmplKey}
                    className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/50 ring-1 ring-blue-700'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="page-template-radio"
                        value={tmplKey}
                        checked={isSelected}
                        onChange={() => setTemplate(tmplKey)}
                        className="text-blue-700 focus:ring-blue-700"
                      />
                      <span className="text-xs font-semibold text-slate-900">{tmplInfo.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-5">
                      {tmplInfo.description}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 4: Featured Image */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ImageIcon className="h-4 w-4 text-blue-800" />
              <span>Ảnh đại diện trang</span>
            </h3>

            <ThumbnailUploader
              value={featuredImage}
              onChange={(url) => setFeaturedImage(url)}
            />
          </div>

          {/* Card 5: Danger Zone (Edit Mode Only) */}
          {isEditMode && existingPage && canDelete && (
            <div className="bg-red-50/40 rounded-xl border border-red-200 p-5 space-y-3">
              <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span>Khu vực nguy hiểm</span>
              </h3>
              <p className="text-xs text-red-700">
                Xóa trang tĩnh này khỏi hệ thống. Nếu có các trang con, chúng sẽ tự động được gỡ liên kết cha.
              </p>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                <span>Xóa trang này</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isEditMode && existingPage && (
        <PageDeleteConfirmModal
          isOpen={isDeleteModalOpen}
          page={existingPage}
          isDeleting={isDeleting}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeletePage}
        />
      )}
    </div>
  );
};
