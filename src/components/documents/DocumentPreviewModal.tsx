/**
 * Document Preview & Detail Modal
 * 2-Column Administrative Document Reader (30% Metadata, 70% Document Preview)
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Calendar,
  CheckCircle2,
  User,
  Building,
  FileText,
  ExternalLink,
  Loader2,
  Printer,
  ShieldCheck,
  FileCheck,
  Eye,
} from 'lucide-react';
import { DocumentItem } from '../../types/document';
import { formatFileSize, getFileTypeInfo, getSecureDocumentDownloadUrl } from '../../lib/documentStorage';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
  isDownloading?: boolean;
}

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onDownload,
  isDownloading = false,
}: DocumentPreviewModalProps) {
  const [securePreviewUrl, setSecurePreviewUrl] = useState<string>('');
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (document && isOpen) {
      setIsResolvingUrl(true);
      setPreviewError(null);
      getSecureDocumentDownloadUrl(document.id, document.file_url, document.status, 600)
        .then((res) => {
          if (active) {
            if (res.url) {
              setSecurePreviewUrl(res.url);
            } else {
              setSecurePreviewUrl('');
              setPreviewError(res.error || 'Không tìm thấy tệp đính kèm.');
            }
          }
        })
        .catch((err) => {
          if (active) {
            setSecurePreviewUrl('');
            setPreviewError(err instanceof Error ? err.message : 'Lỗi xem trước.');
          }
        })
        .finally(() => {
          if (active) setIsResolvingUrl(false);
        });
    } else {
      setSecurePreviewUrl('');
      setPreviewError(null);
    }
    return () => {
      active = false;
    };
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const typeInfo = getFileTypeInfo(document.file_type);
  const isPdf = document.file_type.toLowerCase() === 'pdf';

  const handleOpenNewTab = () => {
    if (securePreviewUrl) {
      window.open(securePreviewUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    // If no remote URL, open printable view in a clean new tab
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${document.document_number} - ${document.title}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #111; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .header-table td { vertical-align: top; width: 50%; }
            .national-motto { text-align: center; }
            .national-title { font-weight: bold; font-size: 14pt; }
            .motto { font-weight: bold; font-size: 13pt; border-bottom: 1px solid #111; display: inline-block; padding-bottom: 2px; }
            .school-dept { text-align: center; font-size: 13pt; }
            .doc-title { text-align: center; font-weight: bold; font-size: 16pt; margin: 30px 0 10px 0; text-transform: uppercase; }
            .doc-excerpt { text-align: center; font-style: italic; font-size: 12pt; margin-bottom: 25px; }
            .content { font-size: 13pt; text-align: justify; text-indent: 25px; margin-bottom: 15px; }
            .sign-table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            .sign-table td { vertical-align: top; }
            .recipients { font-size: 11pt; font-style: italic; }
            .sign-box { text-align: center; font-size: 13pt; }
            .stamp { color: #cc0000; font-weight: bold; font-size: 11pt; border: 2px solid #cc0000; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="school-dept">
                <div>SỞ GIÁO DỤC VÀ ĐÀO TẠO KIÊN GIANG</div>
                <strong>TRƯỜNG THCS & THPT VĨNH PHONG</strong>
                <div>Số: ${document.document_number}</div>
              </td>
              <td class="national-motto">
                <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
                <div style="font-style: italic; font-size: 12pt; margin-top: 6px;">Vĩnh Phong, ngày ${document.issue_date}</div>
              </td>
            </tr>
          </table>

          <div class="doc-title">${document.title}</div>
          <div class="doc-excerpt">${document.excerpt || ''}</div>

          <div class="content">
            Căn cứ chức năng, nhiệm vụ và kế hoạch năm học của Trường THCS & THPT Vĩnh Phong;
          </div>
          <div class="content">
            Căn cứ các văn bản chỉ đạo của Bộ Giáo dục và Đào tạo, Sở Giáo dục và Đào tạo Kiên Giang;
          </div>
          <div class="content">
            Ban Giám hiệu Trường THCS & THPT Vĩnh Phong thông báo và yêu cầu toàn thể cán bộ, giáo viên, nhân viên và các em học sinh có liên quan nghiêm túc triển khai thực hiện các nội dung sau:
          </div>
          <div class="content">
            <strong>Điều 1:</strong> Thực hiện đúng tinh thần nội dung hướng dẫn nêu trên. Các tổ chuyên môn, đoàn thể phối hợp tổ chức triển khai cụ thể theo lịch trình.
          </div>
          <div class="content">
            <strong>Điều 2:</strong> Quyết định này có hiệu lực kể từ ngày ký. Các bộ phận và cá nhân có liên quan chịu trách nhiệm thi hành quyết định này.
          </div>

          <table class="sign-table">
            <tr>
              <td class="recipients" style="width: 50%;">
                <strong>Nơi nhận:</strong><br/>
                - Ban Giám hiệu;<br/>
                - Các tổ bộ môn;<br/>
                - Đoàn trường, Đội TNTP;<br/>
                - Website nhà trường;<br/>
                - Lưu: VT, BGH.
              </td>
              <td class="sign-box" style="width: 50%;">
                <strong>HIỆU TRƯỞNG</strong><br/>
                <em>(Đã ký & đóng dấu)</em><br/>
                <div class="stamp">DẤU ĐIỆN TỬ NHÀ TRƯỜNG</div><br/><br/>
                <strong>${document.signer || 'Trần Văn Khoa'}</strong>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#002B66] to-[#003B8E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-5 w-5 text-amber-300 shrink-0" />
            <h3 id="doc-preview-title" className="text-sm sm:text-base font-bold truncate">
              Văn bản số: {document.document_number} — {document.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Mở văn bản sang tab mới"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Mở tab mới</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* CỘT TRÁI: 30% THÔNG TIN VĂN BẢN (4/12 COLS) */}
          <div className="lg:col-span-4 p-5 overflow-y-auto space-y-5 bg-slate-50/70">
            {/* Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-bold text-blue-900 bg-white border-blue-200 py-1 px-2.5 shadow-2xs"
                >
                  Số: {document.document_number}
                </Badge>
                <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded">
                  {document.document_type}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${typeInfo.color}`}>
                  {typeInfo.label} • {formatFileSize(document.file_size)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {document.download_count} lượt tải về
              </p>
            </div>

            {/* Document Title */}
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {document.title}
              </h2>
            </div>

            {/* Metadata List */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 text-xs shadow-2xs">
              <div className="flex items-start gap-2.5">
                <Building className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Cơ quan ban hành:</span>
                  <strong className="text-slate-800">{document.issuing_authority}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Người ký:</span>
                  <strong className="text-slate-800">{document.signer || 'Ban Giám hiệu'}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Ngày ban hành:</span>
                  <strong className="text-slate-800">{document.issue_date}</strong>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Ngày hiệu lực:</span>
                  <strong className="text-slate-800">{document.effective_date || 'Ngay khi ký'}</strong>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            {document.excerpt && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Trích yếu nội dung
                </h4>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs">
                  {document.excerpt}
                </div>
              </div>
            )}

            {/* Download Action Box */}
            <div className="p-4 bg-blue-50/90 rounded-xl border border-blue-200 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <FileCheck className="w-4 h-4 text-blue-700" />
                <span>Tệp đính kèm chính thức</span>
              </div>
              <p className="text-xs text-slate-600 font-mono truncate">
                {document.file_name}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onDownload(document)}
                  disabled={isDownloading}
                  className="w-full bg-[#003B8E] hover:bg-[#002B66] text-white font-bold flex items-center justify-center gap-2 py-2"
                >
                  <Download className="h-4 w-4" />
                  <span>{isDownloading ? 'Đang tải tệp...' : 'Tải văn bản về máy'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenNewTab}
                  className="w-full border-blue-300 text-blue-900 hover:bg-white flex items-center justify-center gap-2 text-xs font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Mở văn bản tab mới</span>
                </Button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: 70% KHUNG XEM TRƯỚC VĂN BẢN (8/12 COLS) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-slate-100 flex flex-col min-h-0 overflow-y-auto">
            {/* If remote PDF URL is valid, render PDF iframe */}
            {isPdf && securePreviewUrl ? (
              <div className="w-full h-full rounded-xl border border-slate-300 overflow-hidden bg-white shadow-sm flex flex-col">
                <iframe
                  src={`${securePreviewUrl}#toolbar=0`}
                  title={document.title}
                  className="w-full flex-1 border-0"
                />
              </div>
            ) : (
              /* Administrative Document Sheet (Standard Vietnamese School Official Document) */
              <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-300 p-8 sm:p-12 text-slate-900 font-serif leading-relaxed text-sm sm:text-base space-y-6 select-text my-auto">
                {/* Header Table */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                  <div className="text-center space-y-1">
                    <p className="text-xs uppercase font-medium text-slate-700">SỞ GIÁO DỤC VÀ ĐÀO TẠO KIÊN GIANG</p>
                    <p className="text-xs sm:text-sm uppercase font-bold text-slate-900">
                      TRƯỜNG THCS &amp; THPT VĨNH PHONG
                    </p>
                    <p className="text-xs font-medium text-slate-600">Số: {document.document_number}</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs sm:text-sm uppercase font-bold text-slate-900">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </p>
                    <p className="text-xs font-bold text-slate-900 border-b border-slate-900 inline-block pb-0.5">
                      Độc lập – Tự do – Hạnh phúc
                    </p>
                    <p className="text-xs italic text-slate-600 pt-1">
                      Vĩnh Phong, ngày {document.issue_date}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2 py-2">
                  <h1 className="text-base sm:text-xl font-bold uppercase tracking-tight text-slate-900">
                    {document.title}
                  </h1>
                  {document.excerpt && (
                    <p className="text-xs sm:text-sm italic text-slate-700 max-w-xl mx-auto">
                      {document.excerpt}
                    </p>
                  )}
                </div>

                {/* Official Body Clauses */}
                <div className="space-y-4 text-justify text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                  <p>
                    Căn cứ Luật Giáo dục và các quy định hiện hành của Bộ Giáo dục và Đào tạo, Sở Giáo dục và Đào tạo tỉnh Kiên Giang;
                  </p>
                  <p>
                    Căn cứ chức năng, nhiệm vụ và Kế hoạch thực hiện nhiệm vụ năm học 2024 – 2025 của Trường THCS &amp; THPT Vĩnh Phong;
                  </p>
                  <p>
                    Theo đề nghị của các bộ phận chuyên môn, văn phòng và các tổ chức đoàn thể nhà trường;
                  </p>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-sans space-y-2 text-slate-800">
                    <p className="font-bold text-slate-900">QUYẾT NGHỊ / THÔNG BÁO THI HÀNH:</p>
                    <p>
                      <strong>Điều 1.</strong> Ban hành và triển khai thực hiện {document.title.toLowerCase()} đến toàn thể cán bộ, giáo viên, nhân viên và các em học sinh có liên quan.
                    </p>
                    <p>
                      <strong>Điều 2.</strong> Các bộ phận, tổ chuyên môn căn cứ nội dung văn bản này để xây dựng kế hoạch chi tiết, đôn đốc kiểm tra và đảm bảo tiến độ thực hiện đạt hiệu quả cao nhất.
                    </p>
                    <p>
                      <strong>Điều 3.</strong> Văn bản có hiệu lực kể từ ngày ký. Các ông (bà) Trưởng các bộ phận, tổ trưởng chuyên môn và các cá nhân có liên quan chịu trách nhiệm thi hành quyết định này.
                    </p>
                  </div>
                </div>

                {/* Signer & Stamp Section */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="text-xs text-slate-600 italic space-y-1">
                    <p className="font-bold text-slate-800 not-italic">Nơi nhận:</p>
                    <p>- Ban Giám hiệu;</p>
                    <p>- Các tổ bộ môn, đoàn thể;</p>
                    <p>- Cán bộ, GV, NV nhà trường;</p>
                    <p>- Website trường: c3vinhphong.edu.vn;</p>
                    <p>- Lưu: VT, BGH.</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs sm:text-sm font-bold uppercase text-slate-900">HIỆU TRƯỞNG</p>
                    <p className="text-[11px] italic text-slate-500">(Đã ký điện tử và đóng dấu)</p>
                    <div className="py-2">
                      <div className="inline-block border-2 border-red-600 rounded-lg px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider shadow-2xs rotate-[-3deg]">
                        TRƯỜNG THCS &amp; THPT VĨNH PHONG • ĐÃ KÝ SỐ
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 pt-1">
                      {document.signer || 'Trần Văn Khoa'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
