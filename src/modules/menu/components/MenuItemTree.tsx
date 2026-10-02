/**
 * Menu Item Tree Container Component
 * Renders hierarchical tree of menu items for a selected menu.
 * School News Platform - Step 09.5B
 *
 * Coordinates:
 * - Root-level and child-level item rendering
 * - Sibling reordering (both accessible Move Up/Down and drag-and-drop)
 * - Empty, Loading, and Action states
 */

import React, { useState } from 'react';
import { Plus, Layers, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { MenuLocationBadge } from './MenuLocationBadge';
import { MenuStatusBadge } from './MenuStatusBadge';
import { MenuItemTreeNode } from './MenuItemTreeNode';
import type { Menu, MenuItemTree as MenuItemTreeType } from '../types/menu';

interface MenuItemTreeProps {
  menu: Menu | null;
  tree: MenuItemTreeType[];
  isLoading: boolean;
  canEdit: boolean;
  onAddItem: () => void;
  onAddChild: (parentItem: MenuItemTreeType) => void;
  onEditItem: (item: MenuItemTreeType) => void;
  onDeleteItem: (item: MenuItemTreeType) => void;
  onToggleActive: (item: MenuItemTreeType) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  onRefetch?: () => void;
}

export const MenuItemTree: React.FC<MenuItemTreeProps> = ({
  menu,
  tree,
  isLoading,
  canEdit,
  onAddItem,
  onAddChild,
  onEditItem,
  onDeleteItem,
  onToggleActive,
  onReorder,
  onRefetch,
}) => {
  const [draggedItem, setDraggedItem] = useState<MenuItemTreeType | null>(null);

  if (!menu) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Layers className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            Chưa chọn Menu để quản lý
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vui lòng chọn một menu từ danh sách bên trái để xem và cấu trúc các liên kết điều hướng.
          </p>
        </div>
      </div>
    );
  }

  // Count total nodes in the tree
  const countNodes = (nodes: MenuItemTreeType[]): number => {
    return nodes.reduce(
      (acc, node) => acc + 1 + (node.children ? countNodes(node.children) : 0),
      0
    );
  };

  const totalItems = countNodes(tree);

  // Sibling Move Up
  const handleMoveUp = async (index: number, siblings: MenuItemTreeType[]) => {
    if (index <= 0) return;
    const newSiblings = [...siblings];
    const temp = newSiblings[index];
    newSiblings[index] = newSiblings[index - 1];
    newSiblings[index - 1] = temp;

    const orderedIds = newSiblings.map((s) => s.id);
    await onReorder(orderedIds);
  };

  // Sibling Move Down
  const handleMoveDown = async (index: number, siblings: MenuItemTreeType[]) => {
    if (index >= siblings.length - 1) return;
    const newSiblings = [...siblings];
    const temp = newSiblings[index];
    newSiblings[index] = newSiblings[index + 1];
    newSiblings[index + 1] = temp;

    const orderedIds = newSiblings.map((s) => s.id);
    await onReorder(orderedIds);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, item: MenuItemTreeType) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, _targetItem: MenuItemTreeType) => {
    e.preventDefault();
  };

  const handleDrop = async (
    _e: React.DragEvent,
    targetItem: MenuItemTreeType,
    siblings: MenuItemTreeType[]
  ) => {
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    // Only allow reordering among the same sibling level
    const isDraggedInSiblings = siblings.some((s) => s.id === draggedItem.id);
    const isTargetInSiblings = siblings.some((s) => s.id === targetItem.id);

    if (isDraggedInSiblings && isTargetInSiblings) {
      const fromIndex = siblings.findIndex((s) => s.id === draggedItem.id);
      const toIndex = siblings.findIndex((s) => s.id === targetItem.id);

      const newSiblings = [...siblings];
      const [moved] = newSiblings.splice(fromIndex, 1);
      newSiblings.splice(toIndex, 0, moved);

      const orderedIds = newSiblings.map((s) => s.id);
      await onReorder(orderedIds);
    }

    setDraggedItem(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {menu.name}
            </h2>
            <MenuLocationBadge location={menu.location} />
            <MenuStatusBadge isActive={menu.is_active} />
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Mã: <code className="font-mono bg-slate-200/70 px-1 py-0.5 rounded text-slate-800">{menu.code}</code>
            </span>
            <span>•</span>
            <span>Tổng số: <strong>{totalItems}</strong> mục liên kết</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onRefetch && (
            <button
              type="button"
              onClick={onRefetch}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Tải lại cây menu"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          {canEdit && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onAddItem}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm mục menu
            </Button>
          )}
        </div>
      </div>

      {/* Notice bar for instructions */}
      <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>
            Kéo thả hoặc dùng nút mũi tên (↑ / ↓) để sắp xếp thứ tự các mục cùng cấp. Nhấn dấu (+) để thêm mục con.
          </span>
        </div>
      </div>

      {/* Body: Loading, Empty, or Tree content */}
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3 py-6">
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg ml-6" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg ml-6" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
          </div>
        ) : tree.length === 0 ? (
          <div className="py-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Menu này chưa có mục liên kết nào
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bắt đầu xây dựng cấu trúc thanh điều hướng bằng cách thêm mục menu đầu tiên.
              </p>
            </div>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddItem}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm mục menu đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {tree.map((rootNode, idx) => (
              <MenuItemTreeNode
                key={rootNode.id}
                node={rootNode}
                siblings={tree}
                index={idx}
                depth={0}
                canEdit={canEdit}
                onAddChild={onAddChild}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                onToggleActive={onToggleActive}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
