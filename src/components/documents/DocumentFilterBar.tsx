/**
 * Public Document Filter Bar Component
 * Search, Category/Type tabs, Issuing Authority, Year filter, Sort, and Grid/List switcher
 * School News Platform - Step 06 Văn bản - Tài liệu
 */

import React from 'react';
import { Search, X, Filter, RotateCcw, LayoutGrid, List } from 'lucide-react';
import { DocumentTypeStat } from '../../types/document';
import { Button } from '../ui/Button';

interface DocumentFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  documentTypes: DocumentTypeStat[];
  selectedAuthority: string;
  onAuthorityChange: (auth: string) => void;
  authorities: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: string[];
  selectedSort: 'latest' | 'downloads' | 'oldest';
  onSortChange: (sort: 'latest' | 'downloads' | 'oldest') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onResetFilters: () => void;
  totalResults: number;
}

export function DocumentFilterBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  documentTypes,
  selectedAuthority,
  onAuthorityChange,
  authorities,
  selectedYear,
  onYearChange,
  years,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResults,
}: DocumentFilterBarProps) {
  const hasActiveFilters = Boolean(
    searchQuery || selectedType || selectedAuthority || selectedYear || selectedSort !== 'latest'
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top row: Search input + View Mode switcher + Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="document-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo số hiệu, tên văn bản, trích yếu, người ký..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Controls: Authority, Year, Sort & View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Authority dropdown */}
          <select
            id="document-authority-select"
            value={selectedAuthority}
            onChange={(e) => onAuthorityChange(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
          >
            <option value="">Cơ quan ban hành (Tất cả)</option>
            {authorities.map((auth) => (
              <option key={auth} value={auth}>
                {auth}
              </option>
            ))}
          </select>

          {/* Year dropdown */}
          <select
            id="document-year-select"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
          >
            <option value="">Năm (Tất cả)</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                Năm {yr}
              </option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            id="document-sort-select"
            value={selectedSort}
            onChange={(e) =>
              onSortChange(e.target.value as 'latest' | 'downloads' | 'oldest')
            }
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
          >
            <option value="latest">Mới ban hành</option>
            <option value="downloads">Tải nhiều nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-950 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Dạng lưới thẻ"
              aria-label="Xem dạng lưới"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-950 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Dạng danh sách bảng"
              aria-label="Xem dạng danh sách"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => onTypeChange('')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
            !selectedType
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Tất cả loại văn bản
        </button>

        {documentTypes.map((dt) => {
          const isSelected = selectedType === dt.type;
          return (
            <button
              key={dt.type}
              type="button"
              onClick={() => onTypeChange(dt.type)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{dt.type}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-blue-800 text-blue-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {dt.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status feedback & Reset Filters */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div>
          Tìm thấy <strong className="text-slate-900 font-bold">{totalResults}</strong> văn bản phù hợp
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs text-blue-900 hover:text-blue-950 font-medium hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
}
