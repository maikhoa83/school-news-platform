import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import {
  EducationalSlide,
  getEducationalSlides,
  saveEducationalSlides,
  resetToDefaultEducationalSlides,
} from '../../services/educationalSliderService';

export function EducationalSlidesEditor() {
  const [slides, setSlides] = useState<EducationalSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<EducationalSlide | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setSlides(getEducationalSlides());
  }, []);

  const handleSaveList = (updated: EducationalSlide[], successMsg?: string) => {
    const ok = saveEducationalSlides(updated);
    if (ok) {
      setSlides(updated);
      setEditingSlide(null);
      if (successMsg) {
        setFeedback({ type: 'success', message: successMsg });
        setTimeout(() => setFeedback(null), 3000);
      }
    } else {
      setFeedback({ type: 'error', message: 'Không thể lưu danh sách thông điệp.' });
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    handleSaveList(updated, 'Đã cập nhật trạng thái hiển thị của thông điệp!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const copy = [...slides];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    handleSaveList(reordered, 'Đã thay đổi thứ tự slide!');
  };

  const handleDelete = (id: string) => {
    if (slides.length <= 1) {
      alert('Hệ thống cần tối thiểu 1 slide thông điệp giáo dục.');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa slide thông điệp này không?')) {
      const updated = slides.filter((s) => s.id !== id);
      handleSaveList(updated, 'Đã xóa thông điệp thành công!');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Khôi phục về 4 thông điệp giáo dục gốc của Trường THCS & THPT Vĩnh Phong?')) {
      const defaults = resetToDefaultEducationalSlides();
      setSlides(defaults);
      setEditingSlide(null);
      setFeedback({ type: 'success', message: 'Đã khôi phục các thông điệp mẫu gốc thành công!' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleStartAdd = () => {
    const newSlide: EducationalSlide = {
      id: 'slide-' + Date.now(),
      tag: 'PHƯƠNG CHÂM SƯ PHẠM',
      title: 'TIÊU ĐỀ THÔNG ĐIỆP MỚI',
      highlight: 'ĐOẠN NỔI BẬT VÀNG',
      subtitle: 'Mô tả chi tiết phương châm giáo dục, định hướng học tập và rèn luyện của nhà trường.',
      image: '/education_slide_study.jpg',
      isActive: true,
      order: slides.length + 1,
    };
    setEditingSlide(newSlide);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (!editingSlide.title.trim()) {
      alert('Vui lòng nhập tiêu đề thông điệp.');
      return;
    }

    const exists = slides.some((s) => s.id === editingSlide.id);
    let nextList: EducationalSlide[];
    if (exists) {
      nextList = slides.map((s) => (s.id === editingSlide.id ? editingSlide : s));
    } else {
      nextList = [...slides, editingSlide];
    }
    handleSaveList(nextList, 'Đã lưu thông điệp giáo dục thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Quản lý Slider Phương châm &amp; Thông điệp Giáo dục</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tùy biến các slide xuất hiện ở đầu trang chủ (ngay dưới banner chính). Thay đổi nội dung, màu nổi bật và hình ảnh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Khôi phục mẫu gốc</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleStartAdd}
            className="text-xs bg-blue-800 hover:bg-blue-900"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Thêm thông điệp mới</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'info' : 'danger'}
          title={feedback.type === 'success' ? 'Thành công' : 'Lỗi'}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Editing Form Modal / Inline Panel */}
      {editingSlide && (
        <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-700" />
              <span>{slides.some((s) => s.id === editingSlide.id) ? 'Chỉnh sửa thông điệp' : 'Thêm thông điệp mới'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingSlide(null)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhãn phân loại (Tag nhỏ phía trên)
                </label>
                <input
                  type="text"
                  value={editingSlide.tag}
                  onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                  placeholder="VD: PHƯƠNG CHÂM SƯ PHẠM, THÔNG ĐIỆP GIÁO DỤC..."
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đoạn nhấn mạnh màu vàng (Highlight)
                </label>
                <input
                  type="text"
                  value={editingSlide.highlight}
                  onChange={(e) => setEditingSlide({ ...editingSlide, highlight: e.target.value })}
                  placeholder="VD: RÈN ĐỨC - LUYỆN TÀI, THẮP SÁNG TƯƠNG LAI..."
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-amber-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu đề chính (Chữ hoa màu trắng)
              </label>
              <input
                type="text"
                value={editingSlide.title}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                placeholder="VD: DẠY TỐT - HỌC TỐT, MỖI HỌC SINH LÀ MỘT NGỌN LỬA..."
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung diễn giải (Phụ đề)
              </label>
              <textarea
                rows={2}
                value={editingSlide.subtitle}
                onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                placeholder="VD: Đổi mới phương pháp giảng dạy, khơi dậy đam mê sáng tạo và tự học suốt đời..."
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hình ảnh minh họa slide (Đường dẫn URL ảnh)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingSlide.image}
                  onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                  placeholder="VD: /education_slide_study.jpg hoặc link ảnh https://..."
                  required
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              {/* Presets */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span>Ảnh có sẵn:</span>
                <button
                  type="button"
                  onClick={() => setEditingSlide({ ...editingSlide, image: '/education_slide_study.jpg' })}
                  className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                >
                  Học tập (/education_slide_study.jpg)
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlide({ ...editingSlide, image: '/education_slide_growth.jpg' })}
                  className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                >
                  Phát triển (/education_slide_growth.jpg)
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlide({ ...editingSlide, image: '/vinh_phong_logo.jpg' })}
                  className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                >
                  Logo Vĩnh Phong (/vinh_phong_logo.jpg)
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlide({ ...editingSlide, image: '/school_header_pattern.jpg' })}
                  className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                >
                  Hoa văn trường học
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingSlide(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-800 hover:bg-blue-900"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>Lưu thông điệp</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List of Slides */}
      <div className="space-y-3">
        {slides.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              item.isActive !== false
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
            }`}
          >
            {/* Left Info & Thumbnail */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                <img
                  src={item.image || '/campus_facade.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                    {item.tag}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Vị trí: #{index + 1}
                  </span>
                  {item.isActive === false && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                      Đang ẩn
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {item.title}{' '}
                  <span className="text-amber-600 font-extrabold">{item.highlight}</span>
                </h4>

                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                title="Di chuyển lên trên"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <MoveUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleMove(index, 'down')}
                disabled={index === slides.length - 1}
                title="Di chuyển xuống dưới"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <MoveDown className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleToggleActive(item.id)}
                title={item.isActive !== false ? 'Ẩn khỏi trang chủ' : 'Hiển thị ra trang chủ'}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                {item.isActive !== false ? (
                  <Eye className="w-4 h-4 text-emerald-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setEditingSlide(item)}
                title="Chỉnh sửa thông điệp"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-blue-700 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                title="Xóa thông điệp"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
