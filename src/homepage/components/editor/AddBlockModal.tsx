import React from 'react';
import { ZoneType, BlockType } from '../../types';
import { getBlocksForZone } from '../../config/blockRegistry';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  Sparkles,
  Grid,
  List,
  BellRing,
  FileText,
  MoveVertical,
  Plus,
  Layers,
} from 'lucide-react';

interface AddBlockModalProps {
  isOpen: boolean;
  zone: ZoneType;
  onClose: () => void;
  onSelectBlock: (type: BlockType, zone: ZoneType) => void;
}

function renderBlockIcon(iconName: string) {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className="h-5 w-5 text-amber-600" />;
    case 'Grid':
      return <Grid className="h-5 w-5 text-blue-700" />;
    case 'List':
      return <List className="h-5 w-5 text-blue-800" />;
    case 'BellRing':
      return <BellRing className="h-5 w-5 text-amber-600" />;
    case 'FileText':
      return <FileText className="h-5 w-5 text-emerald-600" />;
    case 'MoveVertical':
      return <MoveVertical className="h-5 w-5 text-slate-500" />;
    default:
      return <Layers className="h-5 w-5 text-slate-600" />;
  }
}

export function AddBlockModal({
  isOpen,
  zone,
  onClose,
  onSelectBlock,
}: AddBlockModalProps) {
  const compatibleBlocks = getBlocksForZone(zone);
  const zoneTitle =
    zone === 'main'
      ? 'Khu vực chính (MAIN — 8 cột)'
      : 'Khu vực tiện ích (RIGHT — 4 cột)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thêm khối vào ${zoneTitle}`}
      description="Chọn một khối chức năng có sẵn từ thư viện khối để đưa vào bố cục trang chủ."
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {compatibleBlocks.map((def) => (
          <div
            key={def.type}
            className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-150 group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors shrink-0">
                {renderBlockIcon(def.iconName)}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  {def.label}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {def.description}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onSelectBlock(def.type, zone);
                onClose();
              }}
              className="shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Thêm
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
}
