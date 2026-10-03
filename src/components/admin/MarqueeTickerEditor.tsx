import React, { useState } from 'react';
import { Megaphone, Save, RotateCcw, Check, Sparkles, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import {
  getMarqueeConfig,
  saveMarqueeConfig,
  MarqueeConfig,
  DEFAULT_MARQUEE_CONFIG,
} from '../../services/marqueeService';

export function MarqueeTickerEditor() {
  const [config, setConfig] = useState<MarqueeConfig>(getMarqueeConfig);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = saveMarqueeConfig(config);
    if (ok) {
      setFeedback({
        type: 'success',
        message: 'Đã lưu cấu hình dòng chữ chạy chủ đề năm học / tháng thành công!',
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', message: 'Lỗi khi lưu cấu hình.' });
    }
  };

  const handleReset = () => {
    if (confirm('Khôi phục cấu hình chủ đề năm học về mẫu mặc định?')) {
      saveMarqueeConfig(DEFAULT_MARQUEE_CONFIG);
      setConfig({ ...DEFAULT_MARQUEE_CONFIG });
      setFeedback({ type: 'success', message: 'Đã khôi phục nội dung mặc định!' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600" />
            <span>Dòng chữ chạy ngang: Chủ đề Năm học / Chủ điểm Giáo dục</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị dòng chữ chuyển động chạy từ phải sang trái ngay dưới Menu chính và trên Slider trang chủ.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>Khôi phục mẫu chuẩn</span>
        </Button>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'info' : 'danger'}
          title={feedback.type === 'success' ? 'Thành công' : 'Lỗi'}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        {/* Toggle Active */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <label className="text-sm font-bold text-slate-900 block">
              Trạng thái hiển thị dòng chữ chạy
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Bật hoặc tạm ẩn dòng chữ chạy ngoài trang chủ
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.isEnabled}
              onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu đề nhãn (Badge bên trái)
            </label>
            <input
              type="text"
              value={config.badgeText}
              onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
              placeholder="VD: CHỦ ĐỀ NĂM HỌC 2025 – 2026 hoặc CHỦ ĐIỂM THÁNG 10"
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-amber-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tốc độ chuyển động chữ
            </label>
            <select
              value={config.speed}
              onChange={(e) =>
                setConfig({ ...config, speed: e.target.value as 'slow' | 'normal' | 'fast' })
              }
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="slow">Chậm (Đọc kỹ - 35s)</option>
              <option value="normal">Vừa phải (Khuyên dùng - 25s)</option>
              <option value="fast">Nhanh (16s)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nội dung thông điệp chạy ngang (Chủ đề, khẩu hiệu thi đua...)
          </label>
          <textarea
            rows={3}
            value={config.content}
            onChange={(e) => setConfig({ ...config, content: e.target.value })}
            placeholder="Nhập nội dung đầy đủ của chủ đề năm học, khẩu hiệu thi đua hoặc thông điệp giáo dục..."
            required
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Đường dẫn liên kết khi nhấp vào (URL tùy chọn)
          </label>
          <input
            type="text"
            value={config.linkUrl || ''}
            onChange={(e) => setConfig({ ...config, linkUrl: e.target.value })}
            placeholder="VD: /news hoặc để trống nếu không muốn chèn link"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Live Preview Box */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Xem trước trực quan ngoài trang chủ:</span>
          </label>
          <div className="p-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-blue-50 flex items-center gap-3 overflow-hidden">
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-linear-to-r from-red-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider">
              {config.badgeText || 'CHỦ ĐỀ NĂM HỌC'}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate">
              {config.content}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            className="bg-blue-800 hover:bg-blue-900 text-xs px-5 py-2.5"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Lưu cấu hình dòng chữ chạy</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
