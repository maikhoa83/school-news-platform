import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  Sparkles,
  Grid,
  List,
  BellRing,
  FileText,
  MoveVertical,
  Layers,
} from 'lucide-react';
import { HomepageBlock } from '../../types';
import { getBlockDefinition } from '../../config/blockRegistry';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface BlockCardProps {
  block: HomepageBlock;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onConfigure: () => void;
  onDelete: () => void;
}

// Icon mapper helper
function renderBlockIcon(iconName: string) {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className="h-4 w-4 text-amber-600" />;
    case 'Grid':
      return <Grid className="h-4 w-4 text-blue-700" />;
    case 'List':
      return <List className="h-4 w-4 text-blue-800" />;
    case 'BellRing':
      return <BellRing className="h-4 w-4 text-amber-600" />;
    case 'FileText':
      return <FileText className="h-4 w-4 text-emerald-600" />;
    case 'MoveVertical':
      return <MoveVertical className="h-4 w-4 text-slate-500" />;
    default:
      return <Layers className="h-4 w-4 text-slate-600" />;
  }
}

export function BlockCard({
  block,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onConfigure,
  onDelete,
}: BlockCardProps) {
  const definition = getBlockDefinition(block.blockType);
  const displayTitle = block.config.title || definition.label;

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-150 ${
        block.isVisible
          ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          : 'bg-slate-50/80 border-dashed border-slate-300 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 p-2 rounded-lg bg-slate-100 shrink-0">
            {renderBlockIcon(definition.iconName)}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {definition.label}
              </span>
              {!block.isVisible && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-slate-200 text-slate-600">
                  Đang ẩn
                </Badge>
              )}
              {block.blockType === 'spacer' && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {block.config.height || 'md'}
                </Badge>
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-900 truncate">
              {displayTitle}
            </h4>

            <p className="text-xs text-slate-500 line-clamp-1">
              {definition.description}
            </p>
          </div>
        </div>

        {/* Right: Actions toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Move Up */}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Di chuyển khối ${displayTitle} lên trên`}
            title="Di chuyển lên"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Di chuyển khối ${displayTitle} xuống dưới`}
            title="Di chuyển xuống"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </button>

          {/* Toggle Visibility */}
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={
              block.isVisible
                ? `Ẩn khối ${displayTitle} trên trang chủ`
                : `Hiện khối ${displayTitle} trên trang chủ`
            }
            title={block.isVisible ? 'Ẩn khối' : 'Hiện khối'}
            className={`p-1.5 rounded-lg transition-colors ${
              block.isVisible
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            {block.isVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>

          {/* Configure */}
          <button
            type="button"
            onClick={onConfigure}
            aria-label={`Cấu hình khối ${displayTitle}`}
            title="Chỉnh sửa cấu hình khối"
            className="p-1.5 rounded-lg text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Xóa khối ${displayTitle}`}
            title="Xóa khối khỏi bố cục"
            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
