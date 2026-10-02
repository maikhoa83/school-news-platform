/**
 * Read-Only Audit Log Detail Modal Component
 * School News Platform - Step 10.3
 *
 * Security Invariants:
 * - Read-only inspection only (Zero edit, delete, or mutation controls)
 * - Safe presentation of sanitized metadata
 * - Displays actor attribution, target resource, and result taxonomy
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  User,
  Layers,
  FileCode,
  Copy,
  Check,
  Globe,
  Monitor,
  Info,
} from 'lucide-react';
import type { AuditLogRecord } from '../types/audit';
import { AuditResultBadge } from './AuditResultBadge';
import { AuditClassificationBadge } from './AuditClassificationBadge';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
} from '../config/auditConfig';

interface AuditDetailModalProps {
  log: AuditLogRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !log) return null;

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(log.created_at));

  const handleCopyMetadata = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log.metadata, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  const actionLabel = AUDIT_ACTION_LABELS[log.action] || log.action;
  const resourceLabel = AUDIT_RESOURCE_LABELS[log.resource] || log.resource;

  return (
    <div
      id="audit-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="audit-detail-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
        className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="audit-modal-title"
                className="text-lg font-semibold text-slate-900"
              >
                Chi tiết Nhật ký Kiểm toán
              </h2>
              <p className="text-xs text-slate-500 font-mono">ID: {log.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AuditResultBadge result={log.result} />
            <button
              id="audit-modal-close-btn"
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Action & Description */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span>Hành động được ghi nhận</span>
              <span>•</span>
              <AuditClassificationBadge classification={log.classification} />
            </div>
            <div className="text-base font-medium text-slate-900">
              {actionLabel}
            </div>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {log.description}
            </p>
          </div>

          {/* Grid Information: Actor & Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Actor Card */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <User className="h-4 w-4 text-slate-400" />
                <span>Người thực hiện (Actor)</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-medium text-slate-900">
                    {log.actor_name || 'Chưa định danh / Khách vãng lai'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-800 text-xs">
                    {log.actor_email || 'anonymous'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vai trò:</span>
                  <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                    {log.actor_role || 'PUBLIC_VISITOR'}
                  </span>
                </div>
                {log.actor_id && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Actor ID:</span>
                    <span className="font-mono text-slate-400 truncate max-w-[180px]">
                      {log.actor_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Target Resource Card */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Layers className="h-4 w-4 text-slate-400" />
                <span>Tài nguyên mục tiêu</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phân hệ:</span>
                  <span className="font-medium text-slate-900">
                    {resourceLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã phân hệ:</span>
                  <span className="font-mono text-xs text-slate-700">
                    {log.resource}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resource ID:</span>
                  <span className="font-mono text-xs text-slate-700 truncate max-w-[180px]">
                    {log.resource_id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian:</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Network & Device Context */}
          <div className="rounded-lg border border-slate-200 p-4 space-y-2 bg-slate-50/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Globe className="h-4 w-4 text-slate-400" />
              <span>Ngữ cảnh truy cập & Thiết bị</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Địa chỉ IP:</span>
                <span className="font-mono text-slate-800">
                  {log.ip_address || 'Không xác định'}
                </span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Monitor className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span
                  className="truncate font-mono text-slate-700"
                  title={log.user_agent || 'Unknown'}
                >
                  {log.user_agent || 'Không xác định'}
                </span>
              </div>
            </div>
          </div>

          {/* Sanitized Metadata Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <FileCode className="h-4 w-4 text-slate-400" />
                <span>Dữ liệu mở rộng (Sanitized Metadata)</span>
              </div>
              <button
                id="audit-copy-metadata-btn"
                type="button"
                onClick={handleCopyMetadata}
                className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>Sao chép JSON</span>
                  </>
                )}
              </button>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-48">
              <pre>
                {Object.keys(log.metadata || {}).length > 0
                  ? JSON.stringify(log.metadata, null, 2)
                  : '// Không có siêu dữ liệu bổ sung'}
              </pre>
            </div>
          </div>

          {/* Security Principle Read-Only Notice */}
          <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Nhật ký kiểm toán hệ thống tuân thủ nguyên tắc <strong>Read-Only Immutable Evidence</strong>.
              Dữ liệu được lưu trữ cố định để phục vụ tra soát bảo mật và thanh tra hệ thống; không thể bị xóa hay sửa đổi từ giao diện quản trị.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 px-6 py-3 bg-slate-50/50">
          <button
            id="audit-modal-close-footer-btn"
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
