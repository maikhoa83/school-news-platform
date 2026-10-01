/**
 * Admin Document Create & Edit Page
 * Full validation, file attachment via Supabase Storage, metadata inputs
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Building,
  User,
  Star,
  RefreshCw,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import {
  DocumentFormData,
  DocumentStatus,
  STANDARD_DOCUMENT_TYPES,
  STANDARD_ISSUING_AUTHORITIES,
} from '../../types/document';
import {
  getDocumentById,
  createDocument,
  updateDocument,
} from '../../services/documentService';
import { DocumentFileUpload } from '../../components/documents/DocumentFileUpload';
import { Button } from '../../components/ui/Button';

export const AdminDocumentEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Stable documentId: In edit mode it is the existing id, in create mode a single generated UUID (Locked Decision A1)
  const [documentId] = useState<string>(() => {
    if (id) return id;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });

  const { can } = usePermissions();
  const canPublish = can('documents.publish');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState<string>(STANDARD_DOCUMENT_TYPES[0]);
  const [customDocumentType, setCustomDocumentType] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState<string>(STANDARD_ISSUING_AUTHORITIES[0]);
  const [customAuthority, setCustomAuthority] = useState('');
  const [signer, setSigner] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('published');
  const [isFeatured, setIsFeatured] = useState(false);

  // Uploaded file metadata
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState('');
  const [mimeType, setMimeType] = useState<string | undefined>(undefined);

  // Status indicators
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch document if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      getDocumentById(id)
        .then((doc) => {
          if (doc) {
            setTitle(doc.title);
            setDocumentNumber(doc.document_number);
            if (STANDARD_DOCUMENT_TYPES.includes(doc.document_type as any)) {
              setDocumentType(doc.document_type);
            } else {
              setDocumentType('Khác');
              setCustomDocumentType(doc.document_type);
            }

            if (STANDARD_ISSUING_AUTHORITIES.includes(doc.issuing_authority as any)) {
              setIssuingAuthority(doc.issuing_authority);
            } else {
              setIssuingAuthority('Khác');
              setCustomAuthority(doc.issuing_authority);
            }

            setSigner(doc.signer || '');
            setIssueDate(doc.issue_date);
            setEffectiveDate(doc.effective_date || '');
            setExcerpt(doc.excerpt || '');
            setStatus(doc.status);
            setIsFeatured(doc.is_featured);

            setFileUrl(doc.file_url);
            setFileName(doc.file_name);
            setFileSize(doc.file_size);
            setFileType(doc.file_type);
            setMimeType(doc.mime_type || undefined);
          } else {
            setErrorMessage('Không tìm thấy văn bản.');
          }
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage('Lỗi khi tải thông tin văn bản.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditMode]);

  const handleSave = async (targetStatus?: DocumentStatus) => {
    setErrorMessage(null);

    const effectiveType =
      documentType === 'Khác' ? customDocumentType.trim() : documentType.trim();
    const effectiveAuth =
      issuingAuthority === 'Khác' ? customAuthority.trim() : issuingAuthority.trim();

    // Validation
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập trích yếu / tên văn bản.');
      return;
    }
    if (!documentNumber.trim()) {
      setErrorMessage('Vui lòng nhập số ký hiệu văn bản.');
      return;
    }
    if (!effectiveType) {
      setErrorMessage('Vui lòng chọn hoặc nhập loại văn bản.');
      return;
    }
    if (!effectiveAuth) {
      setErrorMessage('Vui lòng chọn hoặc nhập cơ quan ban hành.');
      return;
    }
    if (!issueDate) {
      setErrorMessage('Vui lòng chọn ngày ban hành văn bản.');
      return;
    }
    if (!fileUrl || !fileName) {
      setErrorMessage('Vui lòng tải lên tệp văn bản đính kèm trước khi lưu.');
      return;
    }

    const nextStatus = targetStatus || status;

    setIsSaving(true);
    try {
      const formData: DocumentFormData = {
        title: title.trim(),
        document_number: documentNumber.trim(),
        document_type: effectiveType,
        issuing_authority: effectiveAuth,
        signer: signer.trim() || null,
        issue_date: issueDate,
        effective_date: effectiveDate || null,
        excerpt: excerpt.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType || fileName.split('.').pop() || 'pdf',
        mime_type: mimeType || null,
        status: nextStatus,
        is_featured: isFeatured,
      };

      if (isEditMode && id) {
        const result = await updateDocument(id, formData);
        if (!result.success) {
          throw new Error(result.error || 'Cập nhật văn bản thất bại.');
        }
      } else {
        // Locked Decision A1: Ensure the database record uses the exact same documentId used in storage path
        const result = await createDocument({
          ...formData,
          id: documentId,
        });
        if (!result.success) {
          // createDocument cleans up the uploaded orphan storage object on failure
          setFileUrl('');
          setFileName('');
          setFileSize(0);
          setFileType('');
          setMimeType(undefined);
          throw new Error(result.error || 'Tạo văn bản thất bại. Tệp tạm đã được dọn dẹp.');
        }
      }

      navigate('/admin/documents');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Có lỗi xảy ra trong quá trình lưu văn bản.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-900" />
        <p className="text-sm">Đang tải dữ liệu văn bản...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/documents"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? 'Chỉnh sửa văn bản' : 'Thêm văn bản mới'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhập thông tin số hiệu, cơ quan ban hành và tải lên tệp đính kèm chính thức.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="text-xs sm:text-sm bg-white"
          >
            Lưu bản nháp
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSave(canPublish ? 'published' : 'draft')}
            disabled={isSaving}
            className="text-xs sm:text-sm bg-blue-900 hover:bg-blue-950 text-white"
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>
              {isSaving
                ? 'Đang lưu...'
                : canPublish
                ? 'Lưu & Công khai'
                : 'Lưu thay đổi'}
            </span>
          </Button>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-xs">
        {/* Section 1: Classification & Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Document Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="document_number"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Số ký hiệu văn bản <span className="text-rose-500">*</span>
            </label>
            <input
              id="document_number"
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="VD: 88/KH-THPT hoặc 105/QĐ-THPT"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white"
              required
            />
          </div>

          {/* Document Type */}
          <div className="space-y-1.5">
            <label
              htmlFor="document_type"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Loại văn bản <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                id="document_type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              >
                {STANDARD_DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Khác">-- Loại khác (Tùy chỉnh) --</option>
              </select>
            </div>
            {documentType === 'Khác' && (
              <input
                type="text"
                value={customDocumentType}
                onChange={(e) => setCustomDocumentType(e.target.value)}
                placeholder="Nhập tên loại văn bản tùy chỉnh..."
                className="w-full mt-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            )}
          </div>
        </div>

        {/* Title / Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="title"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Trích yếu / Tên văn bản <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Kế hoạch giáo dục nhà trường năm học 2025 - 2026..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white"
            required
          />
        </div>

        {/* Section 2: Authority & Signer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Issuing Authority */}
          <div className="space-y-1.5">
            <label
              htmlFor="issuing_authority"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Cơ quan ban hành <span className="text-rose-500">*</span>
            </label>
            <select
              id="issuing_authority"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            >
              {STANDARD_ISSUING_AUTHORITIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value="Khác">-- Cơ quan khác (Tùy chỉnh) --</option>
            </select>
            {issuingAuthority === 'Khác' && (
              <input
                type="text"
                value={customAuthority}
                onChange={(e) => setCustomAuthority(e.target.value)}
                placeholder="Nhập tên cơ quan ban hành..."
                className="w-full mt-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            )}
          </div>

          {/* Signer */}
          <div className="space-y-1.5">
            <label
              htmlFor="signer"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Người ký
            </label>
            <input
              id="signer"
              type="text"
              value={signer}
              onChange={(e) => setSigner(e.target.value)}
              placeholder="VD: TS. Nguyễn Văn A - Hiệu trưởng"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Section 3: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="issue_date"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Ngày ban hành <span className="text-rose-500">*</span>
            </label>
            <input
              id="issue_date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="effective_date"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Ngày có hiệu lực
            </label>
            <input
              id="effective_date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            />
          </div>
        </div>

        {/* Excerpt / Summary */}
        <div className="space-y-1.5">
          <label
            htmlFor="excerpt"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Tóm tắt trích yếu nội dung
          </label>
          <textarea
            id="excerpt"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Tóm tắt ngắn gọn nội dung chỉ đạo, quy định hoặc mục đích ban hành..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white leading-relaxed"
          />
        </div>

        {/* Section 4: File Upload Attachment */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Tệp đính kèm chính thức <span className="text-rose-500">*</span>
          </label>

          <DocumentFileUpload
            documentId={documentId}
            currentFileUrl={fileUrl}
            currentFileName={fileName}
            currentFileSize={fileSize}
            currentFileType={fileType}
            onFileUploaded={(uploaded) => {
              setFileUrl(uploaded.url);
              setFileName(uploaded.fileName);
              setFileSize(uploaded.fileSize);
              setFileType(uploaded.fileType);
              setMimeType(uploaded.mimeType);
            }}
            onFileRemoved={() => {
              setFileUrl('');
              setFileName('');
              setFileSize(0);
              setFileType('');
              setMimeType(undefined);
            }}
          />
        </div>

        {/* Section 5: Settings (Featured & Status) */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Featured toggle */}
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                Văn bản nổi bật
              </span>
              <p className="text-slate-500">Ưu tiên hiển thị trên trang chủ và khối văn bản chính.</p>
            </div>
          </label>

          {/* Status select */}
          <div className="space-y-1.5">
            <label
              htmlFor="status"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Trạng thái
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as DocumentStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            >
              <option value="published">Đã công khai (Hiển thị cho công chúng)</option>
              <option value="draft">Bản nháp (Nội bộ)</option>
              <option value="archived">Lưu trữ (Ẩn khỏi trang công khai)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
