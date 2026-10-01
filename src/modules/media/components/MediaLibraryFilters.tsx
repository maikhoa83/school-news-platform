/**
 * Media Library Filter & Toolbar Component
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện
 */

import React from 'react';
import { Search, LayoutGrid, List, RotateCcw, X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useMediaFolders } from '../hooks/useMediaFolders';
import type { MediaFileType } from '../../../types/media';

export type ViewMode = 'grid' | 'table';

export interface MediaFilterState {
  search: string;
  folderId: string | 'all' | 'root';
  fileType: MediaFileType | 'all';
  isPublished: 'all' | 'published' | 'draft';
  sortBy: 'created_at' | 'file_size' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface MediaLibraryFiltersProps {
  filters: MediaFilterState;
  onChange: (newFilters: MediaFilterState) => void;
  onReset: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  totalItems: number;
}

export function MediaLibraryFilters({
  filters,
  onChange,
  onReset,
  viewMode,
  onChangeViewMode,
  totalItems,
}: MediaLibraryFiltersProps) {
  const { folders, isLoading: isFoldersLoading } = useMediaFolders();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const clearSearch = () => {
    onChange({ ...filters, search: '' });
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, folderId: e.target.value as MediaFilterState['folderId'] });
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, fileType: e.target.value as MediaFilterState['fileType'] });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, isPublished: e.target.value as MediaFilterState['isPublished'] });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'newest') {
      onChange({ ...filters, sortBy: 'created_at', sortOrder: 'desc' });
    } else if (val === 'oldest') {
      onChange({ ...filters, sortBy: 'created_at', sortOrder: 'asc' });
    } else if (val === 'title_asc') {
      onChange({ ...filters, sortBy: 'title', sortOrder: 'asc' });
    } else if (val === 'size_desc') {
      onChange({ ...filters, sortBy: 'file_size', sortOrder: 'desc' });
    }
  };

  const isFiltered =
    Boolean(filters.search.trim()) ||
    filters.folderId !== 'all' ||
    filters.fileType !== 'all' ||
    filters.isPublished !== 'all';

  const currentSortValue =
    filters.sortBy === 'created_at' && filters.sortOrder === 'desc'
      ? 'newest'
      : filters.sortBy === 'created_at' && filters.sortOrder === 'asc'
      ? 'oldest'
      : filters.sortBy === 'title' && filters.sortOrder === 'asc'
      ? 'title_asc'
      : filters.sortBy === 'file_size' && filters.sortOrder === 'desc'
      ? 'size_desc'
      : 'newest';

  return (
    <div className="w-full space-y-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
      {/* Top row: Search input + View Mode toggles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-lg">
          <Input
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Tìm theo tên tệp, tiêu đề, mô tả..."
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              filters.search ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="p-1 hover:text-slate-700 pointer-events-auto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
            className="w-full text-xs h-9"
          />
        </div>

        {/* View mode toggle & total count */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <span className="text-xs font-medium text-slate-500">
            Tổng: <strong className="text-slate-900">{totalItems}</strong> tệp
          </span>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => onChangeViewMode('grid')}
              aria-label="Xem dạng lưới"
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('table')}
              aria-label="Xem dạng danh sách bảng"
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Dropdown filters */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
        {/* Folder filter */}
        <div>
          <Select
            value={filters.folderId}
            onChange={handleFolderChange}
            aria-label="Lọc theo thư mục"
            className="h-8 text-xs py-1"
          >
            <option value="all">Tất cả thư mục</option>
            <option value="root">Thư mục gốc (chưa phân loại)</option>
            {!isFoldersLoading &&
              folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name} ({f.media_count})
                </option>
              ))}
          </Select>
        </div>

        {/* File type filter */}
        <div>
          <Select
            value={filters.fileType}
            onChange={handleFileTypeChange}
            aria-label="Lọc theo loại tệp"
            className="h-8 text-xs py-1"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="image">🖼️ Hình ảnh</option>
            <option value="video">🎥 Video</option>
            <option value="document">📄 Tài liệu</option>
          </Select>
        </div>

        {/* Status filter */}
        <div>
          <Select
            value={filters.isPublished}
            onChange={handleStatusChange}
            aria-label="Lọc theo trạng thái xuất bản"
            className="h-8 text-xs py-1"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="published">Đã công khai</option>
            <option value="draft">Bản nháp</option>
          </Select>
        </div>

        {/* Sort order */}
        <div>
          <Select
            value={currentSortValue}
            onChange={handleSortChange}
            aria-label="Sắp xếp danh sách"
            className="h-8 text-xs py-1"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title_asc">Tiêu đề (A → Z)</option>
            <option value="size_desc">Dung lượng lớn nhất</option>
          </Select>
        </div>

        {/* Reset filters button */}
        {isFiltered && (
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 text-xs text-slate-500 hover:text-red-700 w-full lg:w-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Đặt lại lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
