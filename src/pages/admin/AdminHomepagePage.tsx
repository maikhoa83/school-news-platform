import React, { useState } from 'react';
import {
  Sliders,
  Eye,
  Save,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useHomepageLayout } from '../../homepage/hooks/useHomepageLayout';
import { HomepageEditor } from '../../homepage/components/editor/HomepageEditor';
import { PreviewFrame } from '../../homepage/components/editor/PreviewFrame';
import { EducationalSlidesEditor } from '../../components/admin/EducationalSlidesEditor';
import { MarqueeTickerEditor } from '../../components/admin/MarqueeTickerEditor';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminHomepagePage() {
  const { hasPermission } = usePermissions();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'slides' | 'marquee'>('editor');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canEdit = hasPermission('homepage.edit');
  const canPublish = hasPermission('homepage.publish');

  const {
    layout,
    mainBlocks,
    rightBlocks,
    isLoading,
    isSaving,
    isPublishing,
    error,
    isDirty,
    lastSaved,
    refetch,
    addBlock,
    removeBlock,
    toggleVisibility,
    moveBlock,
    updateBlockConfig,
    saveDraft,
    publish,
    resetToStarter,
  } = useHomepageLayout({ mode: 'draft', autoFetch: true });

  const handleSaveDraft = async () => {
    setFeedback(null);
    const success = await saveDraft();
    if (success) {
      setFeedback({
        type: 'success',
        message: 'Bản nháp bố cục trang chủ đã được lưu thành công vào hệ thống!',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handlePublish = async () => {
    setFeedback(null);
    const success = await publish(profile?.id);
    if (success) {
      setFeedback({
        type: 'success',
        message: 'Bố cục trang chủ đã được XUẤT BẢN thành công ra giao diện người dùng!',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">
          Đang tải cấu hình bố cục trang chủ...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Workflow Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="h-6 w-6 text-blue-800" />
              <span>Trình xây dựng Trang chủ (Homepage Builder)</span>
            </h1>
            <Badge
              variant={layout?.status === 'published' ? 'accent' : 'default'}
              className="text-xs uppercase font-semibold"
            >
              {layout?.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Mô hình 12 cột khối nội dung (MAIN 8 cột + RIGHT 4 cột). Tự do sắp xếp và xem trước theo chuẩn hiển thị học đường.
          </p>
        </div>

        {/* Action Buttons: Save Draft & Publish */}
        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Xem trang chủ ngoài</span>
          </a>

          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving || isPublishing}
              className="relative"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" className="mr-1.5" />
              ) : (
                <Save className="h-4 w-4 mr-1.5 text-slate-600" />
              )}
              <span>Lưu bản nháp</span>
              {isDirty && (
                <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </Button>
          )}

          {canPublish && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
            >
              {isPublishing ? (
                <LoadingSpinner size="sm" className="mr-1.5 text-white" />
              ) : (
                <UploadCloud className="h-4 w-4 mr-1.5" />
              )}
              <span>Xuất bản ngay</span>
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Alerts */}
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'info' : 'danger'}
          title={feedback.type === 'success' ? 'Thành công' : 'Lỗi'}
        >
          {feedback.message}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Lỗi tải dữ liệu">
          {error}
        </Alert>
      )}

      {/* Workflow & Status Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          {isDirty ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Có thay đổi chưa lưu
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle className="h-3 w-3 text-emerald-600" />
              Đã đồng bộ
            </span>
          )}

          {lastSaved && (
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Lưu lần cuối: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            aria-label="Chuyển sang chế độ Chỉnh sửa bố cục"
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chỉnh sửa Bố cục
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('slides')}
            aria-label="Quản lý Slider thông điệp giáo dục"
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
              activeTab === 'slides'
                ? 'bg-white text-blue-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thông điệp &amp; Phương châm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('marquee')}
            aria-label="Quản lý dòng chữ chạy chủ đề năm học"
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
              activeTab === 'marquee'
                ? 'bg-white text-amber-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chủ đề Năm học (Chữ chạy)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            aria-label="Chuyển sang chế độ Xem trước trực quan"
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Xem trước (Preview)
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'editor' && (
        <HomepageEditor
          mainBlocks={mainBlocks}
          rightBlocks={rightBlocks}
          onAddBlock={addBlock}
          onRemoveBlock={removeBlock}
          onToggleVisibility={toggleVisibility}
          onMoveBlock={moveBlock}
          onUpdateBlockConfig={updateBlockConfig}
          onResetToStarter={resetToStarter}
          canEdit={canEdit}
        />
      )}

      {activeTab === 'slides' && (
        <EducationalSlidesEditor />
      )}

      {activeTab === 'marquee' && (
        <MarqueeTickerEditor />
      )}

      {activeTab === 'preview' && (
        <PreviewFrame
          blocks={layout?.blocks || []}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}
