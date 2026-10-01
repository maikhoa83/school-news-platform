import React, { useState, useEffect } from 'react';
import { HomepageBlock, BlockConfig } from '../../types';
import { getBlockDefinition } from '../../config/blockRegistry';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Settings, Check } from 'lucide-react';

interface BlockConfigModalProps {
  block: HomepageBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedConfig: Partial<BlockConfig>) => void;
}

export function BlockConfigModal({
  block,
  isOpen,
  onClose,
  onSave,
}: BlockConfigModalProps) {
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState<number>(2);
  const [maxItems, setMaxItems] = useState<number>(4);
  const [showDate, setShowDate] = useState<boolean>(true);
  const [showExcerpt, setShowExcerpt] = useState<boolean>(true);
  const [showThumbnail, setShowThumbnail] = useState<boolean>(true);
  const [spacerHeight, setSpacerHeight] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  useEffect(() => {
    if (block) {
      setTitle(block.config.title || '');
      setColumns(block.config.presentation?.columns || 2);
      setMaxItems(block.config.presentation?.maxItems || 4);
      setShowDate(block.config.presentation?.showDate !== false);
      setShowExcerpt(block.config.presentation?.showExcerpt !== false);
      setShowThumbnail(block.config.presentation?.showThumbnail !== false);
      setSpacerHeight(block.config.height || 'md');
    }
  }, [block]);

  if (!block) return null;

  const definition = getBlockDefinition(block.blockType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(block.id, {
      title,
      height: block.blockType === 'spacer' ? spacerHeight : undefined,
      presentation: {
        ...block.config.presentation,
        columns: columns as 1 | 2 | 3 | 4,
        maxItems: Number(maxItems),
        showDate,
        showExcerpt,
        showThumbnail,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cấu hình khối: ${definition.label}`}
      description={definition.description}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input (not needed for spacer) */}
        {block.blockType !== 'spacer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề hiển thị của khối
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề khối..."
              className="w-full text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tiêu đề này sẽ được gắn vào thẻ tiêu đề H2 của khối trên trang chủ.
            </p>
          </div>
        )}

        {/* Spacer Height */}
        {block.blockType === 'spacer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Độ cao khoảng đệm
            </label>
            <Select
              value={spacerHeight}
              onChange={(e) => setSpacerHeight(e.target.value as 'sm' | 'md' | 'lg' | 'xl')}
              className="w-full text-sm"
              options={[
                { value: 'sm', label: 'Nhỏ (16px)' },
                { value: 'md', label: 'Trung bình (32px)' },
                { value: 'lg', label: 'Lớn (48px)' },
                { value: 'xl', label: 'Rất lớn (64px)' },
              ]}
            />
          </div>
        )}

        {/* News Grid Column Configuration */}
        {block.blockType === 'news-grid' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số cột hiển thị (Desktop)
            </label>
            <Select
              value={columns.toString()}
              onChange={(e) => setColumns(Number(e.target.value))}
              className="w-full text-sm"
              options={[
                { value: '1', label: '1 Cột' },
                { value: '2', label: '2 Cột (Mặc định cho Main 8)' },
                { value: '3', label: '3 Cột' },
              ]}
            />
          </div>
        )}

        {/* Max items limit */}
        {['news-grid', 'news-list', 'announcements', 'documents'].includes(
          block.blockType
        ) && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số lượng mục hiển thị tối đa
            </label>
            <Select
              value={maxItems.toString()}
              onChange={(e) => setMaxItems(Number(e.target.value))}
              className="w-full text-sm"
              options={[
                { value: '2', label: '2 mục' },
                { value: '3', label: '3 mục' },
                { value: '4', label: '4 mục' },
                { value: '5', label: '5 mục' },
                { value: '6', label: '6 mục' },
                { value: '8', label: '8 mục' },
              ]}
            />
          </div>
        )}

        {/* Display options checkmarks */}
        {['featured', 'news-grid', 'news-list'].includes(block.blockType) && (
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <span className="block text-xs font-semibold text-slate-700">
              Tùy chọn hiển thị chi tiết
            </span>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => setShowDate(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Hiển thị ngày phát hành</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={showExcerpt}
                onChange={(e) => setShowExcerpt(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Hiển thị đoạn trích dẫn ngắn</span>
            </label>

            {block.blockType === 'news-grid' && (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={showThumbnail}
                  onChange={(e) => setShowThumbnail(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Hiển thị ảnh thu nhỏ (Thumbnail)</span>
              </label>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" size="sm">
            <Check className="h-4 w-4 mr-1.5" />
            Lưu cấu hình
          </Button>
        </div>
      </form>
    </Modal>
  );
}
