/**
 * Tag Input Component with Auto-Suggestions
 * Supports manual tags and automatic tag recommendations based on article content
 * School News Platform - Step 05 News Module
 */

import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, X, Sparkles, Plus } from 'lucide-react';
import { NewsTag } from '../../../types/news';
import { useAdminTags } from '../../../hooks/useAdminTags';

interface TagInputProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  articleTitle?: string;
  articleContent?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  selectedTagIds,
  onChange,
  articleTitle = '',
  articleContent = '',
}) => {
  const { tags, addTag, getSuggestions } = useAdminTags();
  const [inputValue, setInputValue] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<NewsTag[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Map selected IDs to Tag objects
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  // Filter available tags for dropdown
  const availableTags = tags.filter(
    (t) =>
      !selectedTagIds.includes(t.id) &&
      (inputValue.trim() === '' || t.name.toLowerCase().includes(inputValue.trim().toLowerCase()))
  );

  const handleSelectTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      onChange([...selectedTagIds, tagId]);
    }
    setInputValue('');
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreateAndSelect = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const res = await addTag(trimmed);
    if (res.success && res.data) {
      handleSelectTag(res.data.id);
    }
  };

  const handleAutoSuggest = async () => {
    setIsSuggesting(true);
    try {
      const suggestions = await getSuggestions(articleTitle, articleContent);
      setSuggestedTags(suggestions);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div id="news-tag-input-container" className="space-y-3">
      {/* Selected Tags Chips */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
          >
            <TagIcon className="w-3 h-3 text-blue-500" />
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.id)}
              className="p-0.5 rounded hover:bg-blue-200/60 text-blue-600 transition-colors"
              aria-label={`Xóa thẻ ${tag.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input and Create */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateAndSelect();
              }
            }}
            placeholder="Nhập tên thẻ tag rồi nhấn Enter..."
            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {inputValue.trim() && (
          <button
            type="button"
            onClick={handleCreateAndSelect}
            className="inline-flex items-center gap-1 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        )}

        {/* AI/Heuristic Suggestion Button */}
        <button
          type="button"
          disabled={isSuggesting}
          onClick={handleAutoSuggest}
          className="inline-flex items-center gap-1 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          title="Gợi ý thẻ tag tự động từ nội dung bài viết"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>{isSuggesting ? 'Đang phân tích...' : 'Gợi ý tag'}</span>
        </button>
      </div>

      {/* Suggested Tags List if available */}
      {suggestedTags.length > 0 && (
        <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1.5">
          <span className="text-[11px] font-semibold text-purple-800 block">
            Gợi ý phù hợp với bài viết:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSelectTag(tag.id)}
                className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100'
                }`}
              >
                + {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available tags dropdown / list preview */}
      {inputValue.trim() && availableTags.length > 0 && (
        <div className="max-h-36 overflow-y-auto p-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg space-y-1">
          {availableTags.slice(0, 8).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTag(t.id)}
              className="w-full text-left px-2.5 py-1 rounded-lg text-xs text-neutral-700 hover:bg-neutral-100 flex items-center justify-between"
            >
              <span>{t.name}</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {t.usage_count} bài viết
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
