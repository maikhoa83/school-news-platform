/**
 * Menu Item Create & Edit Form Modal
 * School News Platform - Step 09.5B
 *
 * Provides:
 * - Internal Static Page selector (auto fills url and page_id)
 * - Custom / External URL input
 * - Target option (_self vs _blank)
 * - Cycle-prevented parent item selector (excludes self and all descendants)
 * - Sort order, icon, active toggle
 * - Zod schema validation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link2, FileText, Globe, AlertCircle, Save, Layers } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { MENU_ITEM_TARGETS, MENU_ITEM_TARGET_CONFIG } from '../config/menuConfig';
import { usePages } from '../../pages/hooks/usePages';
import type {
  MenuItemTree,
  MenuItemTarget,
  MenuItemCreateInput,
  MenuItemUpdateInput,
} from '../types/menu';

interface MenuItemFormModalProps {
  isOpen: boolean;
  menuId: string;
  parentPresetId?: string | null;
  itemToEdit?: MenuItemTree | null;
  existingTree: MenuItemTree[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: MenuItemCreateInput | MenuItemUpdateInput) => Promise<void>;
}

interface FlatOption {
  id: string;
  title: string;
  depth: number;
}

function flattenTreeOptions(nodes: MenuItemTree[], depth = 0): FlatOption[] {
  const result: FlatOption[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, title: node.title, depth });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTreeOptions(node.children, depth + 1));
    }
  }
  return result;
}

function getDescendantIds(node: MenuItemTree): Set<string> {
  const set = new Set<string>();
  const traverse = (n: MenuItemTree) => {
    if (n.children && n.children.length > 0) {
      for (const child of n.children) {
        set.add(child.id);
        traverse(child);
      }
    }
  };
  traverse(node);
  return set;
}

export const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  isOpen,
  menuId,
  parentPresetId,
  itemToEdit,
  existingTree,
  isSaving,
  onClose,
  onSubmit,
}) => {
  const isEditMode = Boolean(itemToEdit);

  // Link Type: 'page' (static page from database) vs 'custom' (manual link)
  const [linkType, setLinkType] = useState<'page' | 'custom'>('custom');

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [pageId, setPageId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string>('');
  const [target, setTarget] = useState<MenuItemTarget>('_self');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [icon, setIcon] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Load available static pages for the page selector
  const { items: pages, isLoading: isLoadingPages } = usePages({ limit: 100 });

  // Calculate disabled parent IDs to prevent circular hierarchy
  const invalidParentIds = useMemo(() => {
    if (!itemToEdit) return new Set<string>();
    const descendants = getDescendantIds(itemToEdit);
    descendants.add(itemToEdit.id); // Cannot be parent of oneself
    return descendants;
  }, [itemToEdit]);

  // Flattened tree options for parent selector
  const flatParentOptions = useMemo(() => {
    return flattenTreeOptions(existingTree);
  }, [existingTree]);

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setTitle(itemToEdit.title);
        setUrl(itemToEdit.url);
        setPageId(itemToEdit.page_id || null);
        setParentId(itemToEdit.parent_id || '');
        setTarget(itemToEdit.target);
        setSortOrder(itemToEdit.sort_order);
        setIcon(itemToEdit.icon || '');
        setIsActive(itemToEdit.is_active);
        setLinkType(itemToEdit.page_id ? 'page' : 'custom');
      } else {
        setTitle('');
        setUrl('');
        setPageId(null);
        setParentId(parentPresetId || '');
        setTarget('_self');
        setSortOrder(0);
        setIcon('');
        setIsActive(true);
        setLinkType('page');
      }
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, itemToEdit, parentPresetId]);

  // Handle page selection change
  const handlePageSelect = (selectedId: string) => {
    if (!selectedId) {
      setPageId(null);
      setUrl('');
      return;
    }
    const found = pages.find((p) => p.id === selectedId);
    if (found) {
      setPageId(found.id);
      const generatedUrl = `/page/${found.slug}`;
      setUrl(generatedUrl);
      if (!title.trim()) {
        setTitle(found.title);
      }
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const titleTrim = title.trim();
    if (!titleTrim) {
      errs.title = 'Tiêu đề mục menu không được để trống.';
    } else if (titleTrim.length > 255) {
      errs.title = 'Tiêu đề không được vượt quá 255 ký tự.';
    }

    const urlTrim = url.trim();
    if (!urlTrim) {
      errs.url = 'Đường dẫn liên kết không được để trống.';
    } else if (urlTrim.length > 500) {
      errs.url = 'Đường dẫn không được vượt quá 500 ký tự.';
    }

    if (linkType === 'page' && !pageId) {
      errs.pageId = 'Vui lòng chọn một trang tĩnh từ danh sách.';
    }

    if (icon.trim().length > 100) {
      errs.icon = 'Mã icon không được vượt quá 100 ký tự.';
    }

    // Circular check prevention verification
    if (isEditMode && itemToEdit && parentId) {
      if (parentId === itemToEdit.id) {
        errs.parentId = 'Một mục menu không thể tự làm mục cha của chính mình.';
      } else if (invalidParentIds.has(parentId)) {
        errs.parentId = 'Không thể chọn mục con hoặc hậu duệ làm mục cha (sẽ gây vòng lặp dữ liệu).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      if (isEditMode) {
        const payload: MenuItemUpdateInput = {
          parent_id: parentId.trim() ? parentId.trim() : null,
          title: title.trim(),
          url: url.trim(),
          target,
          sort_order: Number(sortOrder) || 0,
          icon: icon.trim() || null,
          is_active: isActive,
          page_id: linkType === 'page' ? pageId : null,
        };
        await onSubmit(payload);
      } else {
        const payload: MenuItemCreateInput = {
          menu_id: menuId,
          parent_id: parentId.trim() ? parentId.trim() : null,
          title: title.trim(),
          url: url.trim(),
          target,
          sort_order: Number(sortOrder) || 0,
          icon: icon.trim() || null,
          is_active: isActive,
          page_id: linkType === 'page' ? pageId : null,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Lỗi khi lưu mục menu.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa Mục menu' : 'Thêm Mục menu mới'}
      description={
        isEditMode
          ? 'Cập nhật thông tin, liên kết và vị trí phân cấp của mục menu.'
          : 'Thêm liên kết điều hướng mới vào cây phân cấp của menu.'
      }
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>{isEditMode ? 'Lưu thay đổi' : 'Thêm vào menu'}</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs sm:text-sm">
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Parent Selector */}
        <div className="space-y-1.5">
          <label htmlFor="item-parent" className="block font-semibold text-slate-900 text-xs">
            Mục cha trực thuộc (Cấp bậc menu)
          </label>
          <select
            id="item-parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className={`w-full px-3 py-2 bg-white border rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              errors.parentId ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
            }`}
          >
            <option value="">(Mục gốc cấp cao nhất - Không có mục cha)</option>
            {flatParentOptions.map((opt) => {
              const isDisabled = invalidParentIds.has(opt.id);
              const indent = '— '.repeat(opt.depth);
              return (
                <option
                  key={opt.id}
                  value={opt.id}
                  disabled={isDisabled}
                >
                  {indent} {opt.title} {isDisabled ? '(Không thể chọn - tránh vòng lặp)' : ''}
                </option>
              );
            })}
          </select>
          {errors.parentId && <p className="text-xs text-red-600 font-medium">{errors.parentId}</p>}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="item-title" className="block font-semibold text-slate-900 text-xs">
            Tiêu đề hiển thị <span className="text-red-500">*</span>
          </label>
          <input
            id="item-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Giới thiệu, Cơ cấu tổ chức, Tin tức..."
            className={`w-full px-3 py-2 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
            }`}
          />
          {errors.title && <p className="text-xs text-red-600 font-medium">{errors.title}</p>}
        </div>

        {/* Link Type Switcher */}
        <div className="space-y-2">
          <span className="block font-semibold text-slate-900 text-xs">
            Loại liên kết đích <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setLinkType('page');
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                linkType === 'page'
                  ? 'border-blue-700 bg-blue-50 text-blue-900 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4 text-blue-700" />
              <span>Trang tĩnh nội bộ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkType('custom');
                setPageId(null);
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                linkType === 'custom'
                  ? 'border-blue-700 bg-blue-50 text-blue-900 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Globe className="h-4 w-4 text-blue-700" />
              <span>Liên kết ngoài / Tùy biến</span>
            </button>
          </div>
        </div>

        {/* Conditional Link Config */}
        {linkType === 'page' ? (
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="item-page-select" className="block font-semibold text-slate-800 text-xs">
                Chọn trang tĩnh <span className="text-red-500">*</span>
              </label>
              <select
                id="item-page-select"
                value={pageId || ''}
                onChange={(e) => handlePageSelect(e.target.value)}
                disabled={isLoadingPages}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                  errors.pageId ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">-- Chọn một trang tĩnh đã tạo --</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (/page/{p.slug}) [{p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}]
                  </option>
                ))}
              </select>
              {errors.pageId && <p className="text-xs text-red-600 font-medium">{errors.pageId}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="item-page-url" className="block text-[11px] font-semibold text-slate-600">
                Đường dẫn liên kết được tạo tự động:
              </label>
              <input
                id="item-page-url"
                type="text"
                value={url}
                readOnly
                className="w-full px-3 py-1.5 bg-slate-100 font-mono text-xs text-slate-700 border border-slate-200 rounded-md cursor-not-allowed"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="space-y-1.5">
              <label htmlFor="item-custom-url" className="block font-semibold text-slate-900 text-xs">
                Đường dẫn liên kết URL <span className="text-red-500">*</span>
              </label>
              <input
                id="item-custom-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://... hoặc /tin-tuc, /thong-bao"
                className={`w-full px-3 py-2 bg-white border rounded-lg text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                  errors.url ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                }`}
              />
              {errors.url ? (
                <p className="text-xs text-red-600 font-medium">{errors.url}</p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ cả đường dẫn tương đối (ví dụ: <code>/tin-tuc</code>) hoặc tuyệt đối (ví dụ: <code>https://moet.gov.vn</code>).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Row: Target & Sort Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="item-target" className="block font-semibold text-slate-900 text-xs">
              Cách mở liên kết (Target)
            </label>
            <select
              id="item-target"
              value={target}
              onChange={(e) => setTarget(e.target.value as MenuItemTarget)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              {MENU_ITEM_TARGETS.map((tgt) => (
                <option key={tgt} value={tgt}>
                  {MENU_ITEM_TARGET_CONFIG[tgt]?.label || tgt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="item-sort-order" className="block font-semibold text-slate-900 text-xs">
              Thứ tự ưu tiên (sort_order)
            </label>
            <input
              id="item-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <p className="text-[11px] text-slate-500">Số nhỏ hơn sẽ hiển thị trước.</p>
          </div>
        </div>

        {/* Icon (Optional) */}
        <div className="space-y-1.5">
          <label htmlFor="item-icon" className="block font-semibold text-slate-700 text-xs">
            Mã biểu tượng icon (tùy chọn)
          </label>
          <input
            id="item-icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Ví dụ: home, book, bell, info..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
          {errors.icon && <p className="text-xs text-red-600 font-medium">{errors.icon}</p>}
        </div>

        {/* Is Active Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label htmlFor="item-is-active" className="text-xs font-semibold text-slate-900 cursor-pointer block">
              Kích hoạt mục menu này
            </label>
            <p className="text-[11px] text-slate-500">
              Mục menu chỉ hiển thị trên giao diện người dùng khi được kích hoạt.
            </p>
          </div>
          <input
            id="item-is-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-800 rounded border-slate-300 focus:ring-blue-700 cursor-pointer"
          />
        </div>
      </form>
    </Modal>
  );
};
