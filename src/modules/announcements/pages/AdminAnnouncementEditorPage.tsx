/**
 * Admin Announcement Create & Edit Editor Page
 * School News Platform - Step 07 Thông báo điều hành
 * Supports: Plain-text content (strictly no rich text), Priority, Pin,
 * Lifecycle: Draft, Publish Now, Schedule, Auto-Expiry date validation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  BellRing,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Clock,
  Pin,
  CheckCircle2,
  Lock,
  Eye,
  Plus,
  Trash2,
  Upload,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../hooks/useAuth';
import {
  AnnouncementPriority,
  AnnouncementFormData,
} from '../types/announcement';
import {
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
} from '../services/announcementService';
import { Button } from '../../../components/ui/Button';
import { AnnouncementDetailModal } from '../components/AnnouncementDetailModal';

export const AdminAnnouncementEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { can, isAuthenticated } = usePermissions();
  const canPublish = can('announcements.publish');
  const canEdit = can('announcements.edit');
  const [hasEditRight, setHasEditRight] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'text' | 'schedule'>('text');
  const [scheduleIntro, setScheduleIntro] = useState('Kế hoạch hoạt động giáo dục và lịch công tác trọng tâm trong tuần của nhà trường:');
  const [scheduleOutro, setScheduleOutro] = useState('Đề nghị các bộ phận, tổ chuyên môn và cá nhân chủ động sắp xếp thời gian thực hiện nghiêm túc.');
  const [scheduleRows, setScheduleRows] = useState([
    { id: '1', time: 'Thứ Hai (07h00)', task: 'Chào cờ đầu tuần, sinh hoạt chính trị dưới cờ theo chủ điểm', department: 'BGH, Đoàn trường, GVCN', note: 'Sân trường' },
    { id: '2', time: 'Thứ Ba (14h00)', task: 'Họp Hội đồng sư phạm triển khai nhiệm vụ trọng tâm', department: 'Toàn thể CB - GV - NV', note: 'Phòng Hội đồng' },
    { id: '3', time: 'Thứ Tư (08h00)', task: 'Thao giảng chuyên đề đổi mới phương pháp dạy học GDPT 2018', department: 'Tổ Toán - Tin, KHTN', note: 'Phòng thực hành' },
    { id: '4', time: 'Thứ Năm (07h30)', task: 'Kiểm tra hồ sơ sổ sách và giáo án định kỳ đợt 1', department: 'Ban Kiểm tra chuyên môn', note: 'Văn phòng' },
    { id: '5', time: 'Thứ Sáu (15h30)', task: 'Sinh hoạt chuyên môn tổ bộ môn và họp Chi đoàn', department: 'Các tổ chuyên môn', note: 'Phòng bộ môn' },
    { id: '6', time: 'Thứ Bảy (07h30)', task: 'Tổng kết thi đua tuần, lao động vệ sinh khuôn viên trường', department: 'Đoàn trường, Liên đội', note: 'Khuôn viên trường' },
  ]);

  const buildScheduleContent = (intro: string, rows: typeof scheduleRows, outro: string) => {
    let md = '';
    if (intro.trim()) md += `${intro.trim()}\n\n`;
    md += '[BẢNG KẾ HOẠCH CÔNG TÁC]\n';
    md += '| Thời gian | Nội dung công việc | Bộ phận thực hiện | Ghi chú / Địa điểm |\n';
    md += '| --- | --- | --- | --- |\n';
    rows.forEach((r) => {
      md += `| ${r.time.replace(/\|/g, '-')} | ${r.task.replace(/\|/g, '-')} | ${r.department.replace(/\|/g, '-')} | ${r.note.replace(/\|/g, '-')} |\n`;
    });
    if (outro.trim()) md += `\n${outro.trim()}`;
    return md;
  };

  const handleDocxImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const newRows: typeof scheduleRows = [];
      lines.forEach((line, index) => {
        const parts = line.split(/[:\-\t|]/);
        if (parts.length >= 2) {
          newRows.push({
            id: String(Date.now() + index),
            time: parts[0]?.trim() || `Mục ${index + 1}`,
            task: parts[1]?.trim() || line.trim(),
            department: parts[2]?.trim() || 'Các bộ phận',
            note: parts[3]?.trim() || '',
          });
        }
      });
      if (newRows.length > 0) {
        setScheduleRows(newRows);
        setContentType('schedule');
      }
    };
    reader.readAsText(file);
  };

  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [publishMode, setPublishMode] = useState<'draft' | 'publish_now' | 'schedule'>('publish_now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // If user does not have publish permission, default to draft mode
  useEffect(() => {
    if (!canPublish && publishMode !== 'draft') {
      setPublishMode('draft');
    }
  }, [canPublish, publishMode]);

  // Load existing announcement if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      getAnnouncementById(id)
        .then((item) => {
          if (item) {
            // Check author vs editor permission:
            // Editor / SuperAdmin has canEdit.
            // Author can only edit if item.created_by === user.id AND item.status === 'draft'.
            const isOwnDraft = Boolean(user?.id && item.created_by === user.id && item.status === 'draft');
            const allowed = canEdit || isOwnDraft;

            if (!allowed) {
              setHasEditRight(false);
              setGeneralError(
                item.status === 'published'
                  ? 'Thông báo này đã được xuất bản. Bạn không có quyền chỉnh sửa thông báo đã xuất bản.'
                  : 'Bạn không có quyền chỉnh sửa bản nháp của người khác.'
              );
              return;
            }

            setHasEditRight(true);
            setTitle(item.title);
            setContent(item.content);
            setPriority(item.priority);
            setIsPinned(item.is_pinned);

            if (item.status === 'draft') {
              setPublishMode('draft');
            } else if (item.published_at) {
              const pubTime = new Date(item.published_at).getTime();
              if (pubTime > Date.now()) {
                setPublishMode('schedule');
                setScheduledDate(formatToInputDatetime(item.published_at));
              } else {
                setPublishMode('publish_now');
              }
            } else {
              setPublishMode('publish_now');
            }

            if (item.expires_at) {
              setHasExpiry(true);
              setExpiryDate(formatToInputDatetime(item.expires_at));
            }
          } else {
            setGeneralError('Không tìm thấy thông báo cần chỉnh sửa.');
            setHasEditRight(false);
          }
        })
        .catch((err) => {
          console.warn('[AdminAnnouncementEditorPage] Load notice:', err);
          setGeneralError('Lỗi khi tải thông tin thông báo.');
          setHasEditRight(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEditMode, id, canEdit, user]);

  // Format ISO string to datetime-local input value (YYYY-MM-DDTHH:mm)
  function formatToInputDatetime(isoString: string): string {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Validate form client-side
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề thông báo';
    } else if (title.trim().length < 3) {
      errors.title = 'Tiêu đề thông báo phải có ít nhất 3 ký tự';
    } else if (title.trim().length > 255) {
      errors.title = 'Tiêu đề thông báo không được vượt quá 255 ký tự';
    }

    if (!content.trim()) {
      errors.content = 'Vui lòng nhập nội dung thông báo';
    } else if (content.trim().length < 5) {
      errors.content = 'Nội dung thông báo phải có ít nhất 5 ký tự';
    }

    if (publishMode === 'schedule') {
      if (!scheduledDate) {
        errors.scheduledDate = 'Vui lòng chọn ngày và giờ lên lịch xuất bản';
      }
    }

    if (hasExpiry) {
      if (!expiryDate) {
        errors.expiryDate = 'Vui lòng chọn ngày và giờ hết hạn';
      } else {
        const expTime = new Date(expiryDate).getTime();
        let pubTime: number;

        if (publishMode === 'schedule' && scheduledDate) {
          pubTime = new Date(scheduledDate).getTime();
        } else {
          pubTime = Date.now();
        }

        if (!isNaN(expTime) && !isNaN(pubTime) && expTime <= pubTime) {
          errors.expiryDate = 'Thời điểm hết hạn phải diễn ra sau thời điểm xuất bản';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (isEditMode && !hasEditRight) {
      setGeneralError('Bạn không có quyền cập nhật thông báo này.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    const formData: AnnouncementFormData = {
      title: title.trim(),
      content: content.trim(),
      priority,
      is_pinned: isPinned,
      publish_mode: publishMode,
      published_at: publishMode === 'schedule' && scheduledDate ? new Date(scheduledDate).toISOString() : null,
      has_expiry: hasExpiry,
      expires_at: hasExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
    };

    try {
      if (isEditMode && id) {
        const res = await updateAnnouncement(id, formData);
        if (res.success) {
          navigate('/admin/announcements');
        } else {
          setGeneralError(res.error || 'Không thể cập nhật thông báo.');
        }
      } else {
        const res = await createAnnouncement(formData);
        if (res.success) {
          navigate('/admin/announcements');
        } else {
          setGeneralError(res.error || 'Không thể tạo mới thông báo.');
        }
      }
    } catch (err) {
      console.warn('[AdminAnnouncementEditorPage] Submit notice:', err);
      setGeneralError('Đã xảy ra lỗi trong quá trình lưu thông báo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="h-8 w-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Đang tải biểu mẫu thông báo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/announcements"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BellRing className="h-6 w-6 text-amber-600" />
              <span>{isEditMode ? 'Chỉnh sửa thông báo điều hành' : 'Tạo mới thông báo điều hành'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Nội dung văn bản thuần (plain-text) bảo mật cao, tự động quản lý vòng đời và thời hạn hiển thị.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            <span>Xem trước</span>
          </Button>
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Content & Title */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Nội dung thông báo
          </h2>

          {/* Title Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900">
                Tiêu đề thông báo <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{title.length}/255</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="VD: Thông báo khẩn: Điều chỉnh thời gian vào học mùa đông năm học 2025 - 2026"
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                formErrors.title ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {formErrors.title && (
              <p className="text-xs text-rose-600 font-medium">{formErrors.title}</p>
            )}
          </div>

          {/* Plain Text Content Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900">
                Nội dung chi tiết (Văn bản thuần) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{content.length}/10.000</span>
            </div>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              placeholder="Nhập nội dung thông báo đầy đủ tại đây. Các ngắt dòng và gạch đầu dòng sẽ được giữ nguyên hiển thị chính xác cho người đọc..."
              className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed transition-all ${
                formErrors.content ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {formErrors.content ? (
              <p className="text-xs text-rose-600 font-medium">{formErrors.content}</p>
            ) : (
              <p className="text-xs text-slate-400">
                Hệ thống chỉ hỗ trợ định dạng văn bản thuần (plain text) nhằm đảm bảo tốc độ tải trang và tính bảo mật tuyệt đối.
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Priority & Pin Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Mức độ ưu tiên & Vị trí hiển thị
          </h2>

          {/* Priority Radios */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              Mức độ ưu tiên <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Normal */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  priority === 'normal'
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="normal"
                  checked={priority === 'normal'}
                  onChange={() => setPriority('normal')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Bình thường</span>
                  <span className="text-xs text-slate-500">Thông báo sinh hoạt, kế hoạch tuần định kỳ</span>
                </div>
              </label>

              {/* Important */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  priority === 'important'
                    ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="important"
                  checked={priority === 'important'}
                  onChange={() => setPriority('important')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-sm font-bold text-amber-900 block flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    Quan trọng
                  </span>
                  <span className="text-xs text-slate-500">Lịch thi, họp phụ huynh, thông báo học vụ</span>
                </div>
              </label>

              {/* Urgent */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  priority === 'urgent'
                    ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="urgent"
                  checked={priority === 'urgent'}
                  onChange={() => setPriority('urgent')}
                  className="mt-1 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="text-sm font-bold text-red-900 block flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    Khẩn cấp
                  </span>
                  <span className="text-xs text-slate-500">Nghỉ học đột xuất, phòng chống bão, dịch bệnh</span>
                </div>
              </label>
            </div>
          </div>

          {/* Pin Switch */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Pin className={`h-4 w-4 ${isPinned ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                <span>Ghim thông báo lên đầu trang</span>
              </label>
              <p className="text-xs text-slate-500">
                Thông báo được ghim sẽ luôn hiển thị ở vị trí ưu tiên đầu danh sách và khối thông báo Trang chủ.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-5 w-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 3: Publishing & Expiry Lifecycle */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Vòng đời xuất bản & Thời hạn
          </h2>

          {/* Publish Mode Radios */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900">
              Chế độ xuất bản <span className="text-rose-500">*</span>
            </label>

            {!canPublish && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Tài khoản của bạn chỉ có quyền lưu bản nháp. Để xuất bản hoặc lên lịch, bạn cần quyền <strong>announcements.publish</strong>.
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Draft Option */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="publishMode"
                  value="draft"
                  checked={publishMode === 'draft'}
                  onChange={() => setPublishMode('draft')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Lưu bản nháp</span>
                  <span className="text-xs text-slate-500">Chỉ lưu trữ nội bộ trong CMS, chưa hiển thị công khai trên website.</span>
                </div>
              </label>

              {/* Publish Now Option */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  canPublish
                    ? 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                    : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <input
                  type="radio"
                  name="publishMode"
                  value="publish_now"
                  disabled={!canPublish}
                  checked={publishMode === 'publish_now'}
                  onChange={() => setPublishMode('publish_now')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Xuất bản ngay</span>
                  <span className="text-xs text-slate-500">Công khai thông báo ngay lập tức trên website.</span>
                </div>
              </label>

              {/* Schedule Option */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  canPublish
                    ? 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                    : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <input
                  type="radio"
                  name="publishMode"
                  value="schedule"
                  disabled={!canPublish}
                  checked={publishMode === 'schedule'}
                  onChange={() => setPublishMode('schedule')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Lên lịch xuất bản</span>
                  <span className="text-xs text-slate-500">Thông báo sẽ tự động hiển thị công khai khi đến thời gian quy định mà không cần thao tác thêm.</span>
                </div>
              </label>
            </div>

            {/* Schedule Datetime input */}
            {publishMode === 'schedule' && (
              <div className="ml-7 pt-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Thời gian bắt đầu công khai:</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={`px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    formErrors.scheduledDate ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {formErrors.scheduledDate && (
                  <p className="text-xs text-rose-600 font-medium">{formErrors.scheduledDate}</p>
                )}
              </div>
            )}
          </div>

          {/* Expiry Settings */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>Thiết lập thời hạn hiển thị (Tự động hết hạn)</span>
                </label>
                <p className="text-xs text-slate-500">
                  Khi đến thời điểm hết hạn, thông báo sẽ tự động ẩn khỏi website công khai.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="h-5 w-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            {hasExpiry && (
              <div className="pt-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Thời gian kết thúc hiển thị:
                </label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    formErrors.expiryDate ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {formErrors.expiryDate && (
                  <p className="text-xs text-rose-600 font-medium">{formErrors.expiryDate}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Link to="/admin/announcements">
            <Button variant="outline" type="button">
              Hủy bỏ
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              disabled={isSaving || (isEditMode && !hasEditRight)}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-xs px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-1.5" />
              <span>{isEditMode ? 'Cập nhật thông báo' : 'Lưu thông báo'}</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Live Preview Modal */}
      <AnnouncementDetailModal
        announcement={{
          id: id || 'preview-temp-id',
          title: title || 'Tiêu đề thông báo mẫu',
          content: content || 'Nội dung thông báo mẫu...',
          priority,
          is_pinned: isPinned,
          status: publishMode === 'draft' ? 'draft' : 'published',
          published_at: publishMode === 'schedule' && scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
          expires_at: hasExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          creator: {
            id: 'current-user',
            full_name: 'Quản trị viên',
          },
        }}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />
    </div>
  );
};
