import React, { useState } from 'react';
import { Plus, Sparkles, Layout, RotateCcw, AlertTriangle } from 'lucide-react';
import { HomepageBlock, ZoneType, BlockType, BlockConfig } from '../../types';
import { BlockCard } from './BlockCard';
import { AddBlockModal } from './AddBlockModal';
import { BlockConfigModal } from './BlockConfigModal';
import { Button } from '../../../components/ui/Button';

interface HomepageEditorProps {
  mainBlocks: HomepageBlock[];
  rightBlocks: HomepageBlock[];
  onAddBlock: (type: BlockType, zone: ZoneType) => void;
  onRemoveBlock: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onUpdateBlockConfig: (blockId: string, config: Partial<BlockConfig>) => void;
  onResetToStarter: () => void;
  canEdit: boolean;
}

export function HomepageEditor({
  mainBlocks,
  rightBlocks,
  onAddBlock,
  onRemoveBlock,
  onToggleVisibility,
  onMoveBlock,
  onUpdateBlockConfig,
  onResetToStarter,
  canEdit,
}: HomepageEditorProps) {
  // Modal state
  const [addModalZone, setAddModalZone] = useState<ZoneType | null>(null);
  const [editingBlock, setEditingBlock] = useState<HomepageBlock | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<HomepageBlock | null>(null);

  return (
    <div className="space-y-6">
      {/* Editor Description & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
            <Layout className="h-4 w-4 text-blue-700" />
            <span>Mô hình Bố cục 12 Cột: MAIN (8 cột) + RIGHT (4 cột)</span>
          </h3>
          <p className="text-xs text-blue-800">
            Sắp xếp, thêm mới hoặc tùy biến các khối nội dung hiển thị trên trang chủ của nhà trường.
          </p>
        </div>

        {canEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetToStarter}
            className="text-xs border-blue-200 text-blue-800 hover:bg-blue-100"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Khôi phục bố cục gốc
          </Button>
        )}
      </div>

      {/* Zone Columns Grid: 2 columns in editor (Main 8 cols vs Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAIN ZONE COLUMN (8 Cols) */}
        <section
          aria-label="Cấu hình Khu vực Chính"
          className="lg:col-span-8 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-1 bg-blue-700 rounded-full" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Khu vực chính (MAIN)
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  8 Cột Desktop
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dành cho bài viết tiêu điểm, tin tức dạng lưới, danh sách tin hoạt động và phong trào.
              </p>
            </div>

            {canEdit && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setAddModalZone('main')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm khối
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {mainBlocks.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 space-y-2">
                <p className="text-xs font-medium">Chưa có khối nào trong khu vực chính.</p>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModalZone('main')}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Thêm khối đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              mainBlocks.map((block, index) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  isFirst={index === 0}
                  isLast={index === mainBlocks.length - 1}
                  onMoveUp={() => onMoveBlock(block.id, 'up')}
                  onMoveDown={() => onMoveBlock(block.id, 'down')}
                  onToggleVisibility={() => onToggleVisibility(block.id)}
                  onConfigure={() => setEditingBlock(block)}
                  onDelete={() => setBlockToDelete(block)}
                />
              ))
            )}
          </div>
        </section>

        {/* RIGHT ZONE COLUMN (4 Cols) */}
        <section
          aria-label="Cấu hình Khu vực Tiện ích"
          className="lg:col-span-4 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-1 bg-amber-500 rounded-full" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Khu vực tiện ích (RIGHT)
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  4 Cột Desktop
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dành cho thông báo điều hành, công văn, văn bản và biểu mẫu mới ban hành.
              </p>
            </div>

            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalZone('right')}
                className="text-amber-800 border-amber-300 hover:bg-amber-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm khối
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {rightBlocks.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 space-y-2">
                <p className="text-xs font-medium">Chưa có khối nào trong khu vực tiện ích.</p>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModalZone('right')}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Thêm khối đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              rightBlocks.map((block, index) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  isFirst={index === 0}
                  isLast={index === rightBlocks.length - 1}
                  onMoveUp={() => onMoveBlock(block.id, 'up')}
                  onMoveDown={() => onMoveBlock(block.id, 'down')}
                  onToggleVisibility={() => onToggleVisibility(block.id)}
                  onConfigure={() => setEditingBlock(block)}
                  onDelete={() => setBlockToDelete(block)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Add Block Modal */}
      {addModalZone && (
        <AddBlockModal
          isOpen={true}
          zone={addModalZone}
          onClose={() => setAddModalZone(null)}
          onSelectBlock={onAddBlock}
        />
      )}

      {/* Configure Block Modal */}
      {editingBlock && (
        <BlockConfigModal
          isOpen={true}
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSave={onUpdateBlockConfig}
        />
      )}

      {/* Delete Confirmation Modal */}
      {blockToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa khối?
              </h3>
            </div>

            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa khối{' '}
              <strong className="text-slate-900">
                {blockToDelete.config.title || blockToDelete.blockType}
              </strong>{' '}
              khỏi bố cục trang chủ không?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlockToDelete(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onRemoveBlock(blockToDelete.id);
                  setBlockToDelete(null);
                }}
              >
                Xác nhận xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
