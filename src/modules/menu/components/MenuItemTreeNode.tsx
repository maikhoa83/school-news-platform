/**
 * Menu Item Tree Node Component
 * Recursive component that renders a single menu item and its nested children.
 * School News Platform - Step 09.5B
 *
 * Supports:
 * - HTML5 drag-and-drop reordering
 * - Accessible Move Up / Move Down buttons for sibling items
 * - Hierarchy depth indicators
 * - Quick toggle active/inactive
 * - Internal static page indicator vs external URL
 * - Recursive children rendering
 */

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { MenuStatusBadge } from './MenuStatusBadge';
import type { MenuItemTree } from '../types/menu';

interface MenuItemTreeNodeProps {
  node: MenuItemTree;
  siblings: MenuItemTree[];
  index: number;
  depth?: number;
  canEdit: boolean;
  onAddChild: (parentItem: MenuItemTree) => void;
  onEdit: (item: MenuItemTree) => void;
  onDelete: (item: MenuItemTree) => void;
  onToggleActive: (item: MenuItemTree) => void;
  onMoveUp: (index: number, siblings: MenuItemTree[]) => void;
  onMoveDown: (index: number, siblings: MenuItemTree[]) => void;
  onDragStart: (e: React.DragEvent, item: MenuItemTree) => void;
  onDragOver: (e: React.DragEvent, item: MenuItemTree) => void;
  onDrop: (e: React.DragEvent, targetItem: MenuItemTree, siblings: MenuItemTree[]) => void;
}

export const MenuItemTreeNode: React.FC<MenuItemTreeNodeProps> = ({
  node,
  siblings,
  index,
  depth = 0,
  canEdit,
  onAddChild,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  const isFirst = index === 0;
  const isLast = index === siblings.length - 1;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsDragOver(true);
    onDragOver(e, node);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!canEdit) return;
    onDrop(e, node, siblings);
  };

  return (
    <div className="space-y-1">
      <div
        draggable={canEdit}
        onDragStart={(e) => onDragStart(e, node)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-all ${
          isDragOver
            ? 'border-blue-700 bg-blue-50 ring-2 ring-blue-700'
            : node.is_active
            ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
            : 'border-slate-200 bg-slate-50/70 opacity-75'
        }`}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        {/* Left side: Expand toggle + Drag Handle + Depth mark + Title & Meta */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Sibling Drag Handle */}
          {canEdit ? (
            <div
              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-0.5"
              title="Kéo thả để sắp xếp thứ tự cùng cấp"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          ) : (
            <div className="w-2" />
          )}

          {/* Children Expand/Collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title={isExpanded ? 'Thu gọn mục con' : 'Mở rộng mục con'}
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
          )}

          {/* Title & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <span
              className={`text-xs sm:text-sm font-semibold truncate ${
                node.is_active ? 'text-slate-900' : 'text-slate-500 line-through'
              }`}
            >
              {node.title}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Internal page vs external badge */}
              {node.page_id ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                  <FileText className="h-3 w-3" />
                  <span className="truncate max-w-[130px]">
                    {node.page?.title || 'Trang tĩnh'}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <Globe className="h-3 w-3" />
                  <span className="truncate max-w-[140px] font-mono">{node.url}</span>
                </span>
              )}

              {/* Target badge */}
              {node.target === '_blank' && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  Tab mới
                </span>
              )}

              {/* Order number */}
              <span className="text-[10px] text-slate-400 font-mono" title="Thứ tự sort_order">
                #{node.sort_order}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Ordering Arrows & Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Move Up / Move Down buttons for accessible reordering */}
          {canEdit && (
            <div className="hidden sm:flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => onMoveUp(index, siblings)}
                className={`p-1 rounded transition-colors ${
                  isFirst
                    ? 'text-slate-200 cursor-not-allowed'
                    : 'text-slate-500 hover:text-blue-800 hover:bg-slate-100'
                }`}
                title="Di chuyển lên trên"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => onMoveDown(index, siblings)}
                className={`p-1 rounded transition-colors ${
                  isLast
                    ? 'text-slate-200 cursor-not-allowed'
                    : 'text-slate-500 hover:text-blue-800 hover:bg-slate-100'
                }`}
                title="Di chuyển xuống dưới"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Quick Active Toggle */}
          {canEdit && (
            <button
              type="button"
              onClick={() => onToggleActive(node)}
              className={`p-1 rounded transition-colors ${
                node.is_active
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title={node.is_active ? 'Nhấn để ẩn mục này' : 'Nhấn để kích hoạt mục này'}
            >
              {node.is_active ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Add Child button */}
          {canEdit && (
            <button
              type="button"
              onClick={() => onAddChild(node)}
              className="p-1 text-blue-700 hover:bg-blue-50 rounded transition-colors"
              title="Thêm mục con trực thuộc"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}

          {/* Edit button */}
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="p-1 text-slate-600 hover:text-blue-800 hover:bg-slate-100 rounded transition-colors"
              title="Chỉnh sửa mục menu"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Delete button */}
          {canEdit && (
            <button
              type="button"
              onClick={() => onDelete(node)}
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Xóa mục menu"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Recursive Children Rendering */}
      {hasChildren && isExpanded && (
        <div className="space-y-1 relative pl-2 border-l-2 border-slate-200 ml-4 my-1">
          {node.children.map((child, cIdx) => (
            <MenuItemTreeNode
              key={child.id}
              node={child}
              siblings={node.children}
              index={cIdx}
              depth={depth + 1}
              canEdit={canEdit}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};
