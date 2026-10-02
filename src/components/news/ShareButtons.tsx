/**
 * Social Sharing Buttons Component
 * Supports Facebook, Zalo, and Copy Link
 * School News Platform - Step 05 News Module
 */

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const [popupNotice, setPopupNotice] = useState<string | null>(null);

  const currentUrl =
    url || (typeof window !== 'undefined' ? window.location.href : 'https://truongthpt.edu.vn');

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement('input');
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const safeOpenWindow = (targetUrl: string, platformName: string) => {
    setPopupNotice(null);
    try {
      const popup = window.open(targetUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup was blocked or nullified in restricted iframe
        handleCopyLink();
        setPopupNotice(
          `Cửa sổ chia sẻ ${platformName} bị trình duyệt chặn mở popup. Đường dẫn bài viết đã được tự động sao chép để bạn dán và chia sẻ!`
        );
        setTimeout(() => setPopupNotice(null), 5000);
      }
    } catch {
      handleCopyLink();
      setPopupNotice(
        `Không thể mở cửa sổ popup. Đường dẫn bài viết đã được tự động sao chép vào khay nhớ tạm.`
      );
      setTimeout(() => setPopupNotice(null), 5000);
    }
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    safeOpenWindow(fbUrl, 'Facebook');
  };

  const handleShareZalo = () => {
    const zaloUrl = `https://sp.zalo.me/share_inline?link=${encodeURIComponent(currentUrl)}`;
    safeOpenWindow(zaloUrl, 'Zalo');
  };

  return (
    <div
      id="article-share-buttons"
      className="flex flex-wrap items-center gap-2 py-4 my-6 border-y border-neutral-200"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 mr-2">
        <Share2 className="w-4 h-4 text-neutral-400" />
        <span>Chia sẻ bài viết:</span>
      </div>

      {/* Facebook Share */}
      <button
        type="button"
        onClick={handleShareFacebook}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] text-white text-xs font-medium hover:bg-[#0c63d4] transition-colors shadow-sm"
        title="Chia sẻ lên Facebook"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>Facebook</span>
      </button>

      {/* Zalo Share */}
      <button
        type="button"
        onClick={handleShareZalo}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0068FF] text-white text-xs font-medium hover:bg-[#0052cc] transition-colors shadow-sm"
        title="Chia sẻ qua Zalo"
      >
        <span className="font-bold tracking-tight text-[11px]">Zalo</span>
        <span>Chia sẻ</span>
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
          copied
            ? 'bg-green-50 border-green-300 text-green-700'
            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span>Đã sao chép liên kết</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-neutral-400" />
            <span>Sao chép link</span>
          </>
        )}
      </button>

      {popupNotice && (
        <div className="w-full text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 mt-1 animate-fadeIn">
          {popupNotice}
        </div>
      )}
    </div>
  );
};
