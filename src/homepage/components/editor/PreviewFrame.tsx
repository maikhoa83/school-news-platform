import React, { useState } from 'react';
import { Laptop, Tablet, Smartphone, Info, RefreshCw } from 'lucide-react';
import { HomepageBlock } from '../../types';
import { HomepageZoneLayout } from '../HomepageZoneLayout';
import { Button } from '../../../components/ui/Button';

interface PreviewFrameProps {
  blocks: HomepageBlock[];
  onRefresh?: () => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export function PreviewFrame({ blocks, onRefresh }: PreviewFrameProps) {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  const viewportContainerClass =
    viewport === 'desktop'
      ? 'w-full'
      : viewport === 'tablet'
      ? 'max-w-[768px] mx-auto'
      : 'max-w-[390px] mx-auto';

  return (
    <div className="space-y-4">
      {/* Viewport Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chế độ giả lập:
          </span>
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              aria-label="Xem trước giao diện Máy tính bàn (12 cột)"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewport === 'desktop'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>Máy tính (12 Cột)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('tablet')}
              aria-label="Xem trước giao diện Máy tính bảng"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewport === 'tablet'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>Tablet (768px)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('mobile')}
              aria-label="Xem trước giao diện Điện thoại di động"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewport === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile (390px)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">
            Khung preview tự động đồng bộ theo thời gian thực từ bản nháp
          </span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Làm mới xem trước"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Simulated Viewport Stage */}
      <div className="rounded-2xl border border-slate-300 bg-slate-100 p-3 sm:p-6 min-h-[600px] overflow-x-auto">
        <div
          className={`bg-white rounded-xl shadow-md border border-slate-200 transition-all duration-300 p-4 sm:p-6 lg:p-8 ${viewportContainerClass}`}
        >
          {/* Header banner indicating preview status */}
          <div className="mb-6 pb-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium text-blue-900">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Chế độ Xem trước Bố cục Trang chủ</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {viewport === 'desktop'
                ? 'Desktop: MAIN 8 cols + RIGHT 4 cols'
                : viewport === 'tablet'
                ? 'Tablet: Bố cục thích ứng'
                : 'Mobile: Đơn cột'}
            </span>
          </div>

          {/* Actual 12-column layout render */}
          <HomepageZoneLayout blocks={blocks} isPreview={true} />
        </div>
      </div>
    </div>
  );
}
