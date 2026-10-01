/**
 * Admin Tag Management Page
 * Tag CRUD, Search, Usage metrics
 * School News Platform - Step 05 News Module
 */

import React, { useState } from 'react';
import { Tag as TagIcon, Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { useAdminTags } from '../../hooks/useAdminTags';

export const AdminTagsPage: React.FC = () => {
  const { tags, isLoading, isSubmitting, error, addTag, deleteTag, refetch } = useAdminTags();
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const res = await addTag(newTagName.trim());
    if (res.success) {
      setNewTagName('');
      setFeedback('Thêm thẻ tag thành công');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback(res.error || 'Lỗi thêm thẻ tag');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thẻ "${name}" không?`)) return;
    const res = await deleteTag(id);
    if (res.success) {
      setFeedback('Đã xóa thẻ tag');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback(res.error || 'Lỗi khi xóa thẻ');
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-tags-page" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Quản trị Thẻ Tag Tin tức
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Quản lý từ khóa phân loại đa chiều, hỗ trợ tìm kiếm và liên kết bài viết
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs">
          {feedback}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Bar: Create & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
        {/* Create form */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tên thẻ tag mới..."
            className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newTagName.trim()}
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </form>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Lọc thẻ tag theo tên..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Tag Grid List */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Đang tải thẻ tag...</div>
        ) : filteredTags.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">Không tìm thấy thẻ tag nào.</div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-blue-50 border border-neutral-200 hover:border-blue-200 text-xs text-neutral-800 transition-colors"
              >
                <TagIcon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500" />
                <span className="font-semibold">{tag.name}</span>
                <span className="text-[10px] text-neutral-400 font-mono bg-neutral-200/60 px-1.5 py-0.5 rounded-md">
                  {tag.usage_count}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(tag.id, tag.name)}
                  className="p-1 rounded text-neutral-400 hover:text-red-600 transition-colors"
                  title="Xóa thẻ tag"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
