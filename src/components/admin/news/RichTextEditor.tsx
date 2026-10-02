/**
 * Rich Text CMS Editor Component
 * Provides a rich formatting toolbar with H2-H4 headings, bold, italic, underline,
 * lists, blockquote, links, images, tables, and real-time sanitized preview
 * School News Platform - Step 05 News Module
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Code,
} from 'lucide-react';
import { sanitizeHtml } from '../../../lib/sanitize';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung bài viết...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'html'>('edit');
  const [rawHtml, setRawHtml] = useState(value || '');

  // Synchronize incoming value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value || '');
  }, [value]);

  const executeCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      const updated = editorRef.current.innerHTML;
      onChange(updated);
      setRawHtml(updated);
    }
  };

  const handleHeading = (tag: 'H2' | 'H3' | 'H4' | 'P') => {
    executeCommand('formatBlock', tag);
  };

  const handleLink = () => {
    const url = prompt('Nhập địa chỉ URL liên kết (https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleImage = () => {
    const url = prompt('Nhập địa chỉ URL hình ảnh (https://...):');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const updated = editorRef.current.innerHTML;
      onChange(updated);
      setRawHtml(updated);
    }
  };

  const handleRawHtmlChange = (newHtml: string) => {
    setRawHtml(newHtml);
    onChange(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
  };

  return (
    <div id="cms-rich-text-editor" className="border border-neutral-300 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Top Toolbar */}
      <div className="bg-neutral-50 border-b border-neutral-200 p-2 flex flex-wrap items-center justify-between gap-1">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => handleHeading('H2')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Tiêu đề H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading('H3')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Tiêu đề H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading('H4')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Tiêu đề H4"
          >
            <Heading4 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-neutral-300 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-neutral-300 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Danh sách không thứ tự"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Danh sách có thứ tự"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleHeading('P')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Đoạn văn thường (P)"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-neutral-300 mx-1" />

          {/* Media & Links */}
          <button
            type="button"
            onClick={handleLink}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Chèn liên kết"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleImage}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Chèn hình ảnh từ URL"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 transition-colors"
            title="Xóa định dạng"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-neutral-200/70 p-0.5 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeTab === 'edit'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Soạn thảo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              activeTab === 'preview'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              activeTab === 'html'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Content Body */}
      {activeTab === 'edit' && (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          className="p-4 min-h-[320px] max-h-[600px] overflow-y-auto focus:outline-none prose prose-neutral max-w-none text-sm leading-relaxed"
          style={{ minHeight: '320px' }}
        />
      )}

      {/* Preview Tab (Sanitized) */}
      {activeTab === 'preview' && (
        <div className="p-6 min-h-[320px] max-h-[600px] overflow-y-auto bg-neutral-50/50">
          <div
            className="prose prose-neutral max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
          />
        </div>
      )}

      {/* Raw HTML Code Tab */}
      {activeTab === 'html' && (
        <textarea
          value={rawHtml}
          onChange={(e) => handleRawHtmlChange(e.target.value)}
          rows={14}
          className="w-full p-4 font-mono text-xs bg-neutral-900 text-neutral-100 focus:outline-none resize-y"
          placeholder="Mã nguồn HTML..."
        />
      )}
    </div>
  );
};
