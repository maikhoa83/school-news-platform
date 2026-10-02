/**
 * Admin Category Management Page
 * Hierarchical Category CRUD (Parent-Child, Sort order, Slugs)
 * School News Platform - Step 05 News Module
 */

import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { NewsCategory } from '../../types/news';
import { slugifyVietnamese } from '../../lib/slugify';

export const AdminCategoriesPage: React.FC = () => {
  const {
    categories,
    isLoading,
    isSubmitting,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategories();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setParentId(null);
    setSortOrder(0);
    setIsActive(true);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartAdd = (parentCatId: string | null = null) => {
    resetForm();
    setParentId(parentCatId);
    setIsAdding(true);
  };

  const handleStartEdit = (cat: NewsCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentId(cat.parent_id || null);
    setSortOrder(cat.sort_order);
    setIsActive(cat.is_active);
    setIsAdding(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(slugifyVietnamese(val));
    }
  };

  // Helper to collect all descendant IDs of a category to prevent cycle selection in UI
  const getDescendantIds = (catId: string | null): Set<string> => {
    const invalidIds = new Set<string>();
    if (!catId) return invalidIds;
    invalidIds.add(catId);

    const findChildren = (list: NewsCategory[]) => {
      let added = false;
      for (const item of list) {
        if (item.parent_id && invalidIds.has(item.parent_id) && !invalidIds.has(item.id)) {
          invalidIds.add(item.id);
          added = true;
        }
        if (item.children && item.children.length > 0) {
          findChildren(item.children);
        }
      }
      if (added) {
        findChildren(list);
      }
    };

    findChildren(categories);
    return invalidIds;
  };

  const invalidParentIds = editingId ? getDescendantIds(editingId) : new Set<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setFeedback(null);

    if (editingId) {
      const res = await updateCategory(editingId, {
        name: name.trim(),
        slug: slug.trim() || slugifyVietnamese(name),
        description: description.trim() || undefined,
        parent_id: parentId,
        sort_order: sortOrder,
        is_active: isActive,
      });

      if (res.success) {
        setFeedback({ text: 'Cập nhật chuyên mục thành công.', isError: false });
        resetForm();
      } else {
        setFeedback({ text: res.error || 'Lỗi cập nhật', isError: true });
      }
    } else {
      const res = await createCategory({
        name: name.trim(),
        slug: slug.trim() || slugifyVietnamese(name),
        description: description.trim() || undefined,
        parent_id: parentId,
        sort_order: sortOrder,
        is_active: isActive,
      });

      if (res.success) {
        setFeedback({ text: 'Tạo chuyên mục thành công.', isError: false });
        resetForm();
      } else {
        setFeedback({ text: res.error || 'Lỗi tạo chuyên mục', isError: true });
      }
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chuyên mục "${catName}" không?`)) {
      return;
    }
    const res = await deleteCategory(id);
    if (!res.success) {
      setFeedback({ text: res.error || 'Lỗi khi xóa', isError: true });
    } else {
      setFeedback({ text: 'Đã xóa chuyên mục thành công.', isError: false });
    }
  };

  const renderCategoryRow = (cat: NewsCategory, isChild = false) => {
    return (
      <React.Fragment key={cat.id}>
        <tr className={`hover:bg-neutral-50/70 transition-colors ${isChild ? 'bg-neutral-50/30' : ''}`}>
          <td className="py-3 px-4">
            <div className={`flex items-center gap-2 ${isChild ? 'pl-6' : ''}`}>
              {isChild ? (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <FolderTree className="w-4 h-4 text-blue-600" />
              )}
              <span className={`text-xs font-semibold text-neutral-900 ${isChild ? 'font-medium' : ''}`}>
                {cat.name}
              </span>
            </div>
          </td>

          <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
            {cat.slug}
          </td>

          <td className="py-3 px-4 text-xs text-neutral-500">
            {cat.sort_order}
          </td>

          <td className="py-3 px-4">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                cat.is_active
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {cat.is_active ? 'Hoạt động' : 'Tạm ẩn'}
            </span>
          </td>

          <td className="py-3 px-4 text-right">
            <div className="inline-flex items-center gap-1 justify-end">
              {!isChild && (
                <button
                  type="button"
                  onClick={() => handleStartAdd(cat.id)}
                  className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 text-xs font-medium"
                  title="Thêm chuyên mục con"
                >
                  + Con
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStartEdit(cat)}
                className="p-1 text-neutral-600 hover:text-neutral-900 rounded hover:bg-neutral-100"
                title="Sửa"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>

        {/* Nested children */}
        {cat.children &&
          cat.children.map((sub) => renderCategoryRow(sub, true))}
      </React.Fragment>
    );
  };

  return (
    <div id="admin-categories-page" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Quản trị Chuyên mục Tin tức
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Thiết lập danh mục phân cấp (Cha - Con), đường dẫn tĩnh và thứ tự hiển thị
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => handleStartAdd(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm chuyên mục gốc</span>
          </button>
        )}
      </div>

      {/* Notification */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Add / Edit Form Panel */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">
              {editingId ? 'Chỉnh sửa chuyên mục' : 'Thêm mới chuyên mục'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Tên chuyên mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ví dụ: Hoạt động học đường"
                required
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Slug (Đường dẫn tĩnh)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="hoat-dong-hoc-duong"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Chuyên mục cha (Hierarchy)
              </label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chuyên mục gốc (Không có cha) --</option>
                {categories.map((c) => {
                  const isInvalid = invalidParentIds.has(c.id);
                  return (
                    <option key={c.id} value={c.id} disabled={isInvalid}>
                      {c.name} {isInvalid ? '(Không khả dụng - gây chu kỳ)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Kích hoạt chuyên mục</span>
              </label>

              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span>Thứ tự:</span>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu chuyên mục'}
            </button>
          </div>
        </form>
      )}

      {/* Categories Tree Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Đang tải chuyên mục...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">Chưa có chuyên mục nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-bold">
                  <th className="py-3 px-4">Tên chuyên mục</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Thứ tự</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.map((c) => renderCategoryRow(c))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
