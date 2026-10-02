/**
 * Menu List Sidebar / Master Column Component
 * School News Platform - Step 09.5B
 *
 * Displays all menus with filtering, sorting, selection, and CRUD triggers.
 */

import React from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MenuSquare,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { MenuLocationBadge } from './MenuLocationBadge';
import { MenuStatusBadge } from './MenuStatusBadge';
import { MENU_LOCATIONS, MENU_LOCATION_CONFIG, MENU_SORT_OPTIONS } from '../config/menuConfig';
import type { Menu, MenuLocation, MenuSortField, SortOrder } from '../types/menu';

interface MenuListProps {
  menus: Menu[];
  selectedMenuId: string | null;
  isLoading: boolean;
  canEdit: boolean;
  search: string;
  locationFilter: MenuLocation | 'all';
  statusFilter: 'all' | 'active' | 'inactive';
  sortBy: MenuSortField;
  sortOrder: SortOrder;
  onSearchChange: (val: string) => void;
  onLocationFilterChange: (val: MenuLocation | 'all') => void;
  onStatusFilterChange: (val: 'all' | 'active' | 'inactive') => void;
  onSortByChange: (val: MenuSortField) => void;
  onSortOrderToggle: () => void;
  onSelectMenu: (menu: Menu) => void;
  onCreateMenu: () => void;
  onEditMenu: (menu: Menu, e: React.MouseEvent) => void;
  onDeleteMenu: (menu: Menu, e: React.MouseEvent) => void;
}

export const MenuList: React.FC<MenuListProps> = ({
  menus,
  selectedMenuId,
  isLoading,
  canEdit,
  search,
  locationFilter,
  statusFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onLocationFilterChange,
  onStatusFilterChange,
  onSortByChange,
  onSortOrderToggle,
  onSelectMenu,
  onCreateMenu,
  onEditMenu,
  onDeleteMenu,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-full">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MenuSquare className="h-5 w-5 text-blue-800" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Danh sách Menu
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {menus.length}
          </span>
        </div>

        {canEdit && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onCreateMenu}
          >
            <Plus className="h-4 w-4 mr-1" />
            Tạo Menu
          </Button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="p-3 border-b border-slate-200 space-y-2.5 bg-white">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên hoặc mã menu..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Location filter */}
          <select
            value={locationFilter}
            onChange={(e) => onLocationFilterChange(e.target.value as MenuLocation | 'all')}
            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <option value="all">Tất cả vị trí</option>
            {MENU_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {MENU_LOCATION_CONFIG[loc]?.label || loc}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đang ẩn</option>
          </select>
        </div>

        {/* Sort row */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3 text-slate-400" />
            <span>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as MenuSortField)}
              className="bg-transparent font-medium text-slate-700 border-none p-0 focus:ring-0 cursor-pointer"
            >
              {MENU_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onSortOrderToggle}
            className="hover:text-blue-800 font-mono font-semibold uppercase px-1 rounded hover:bg-slate-100"
          >
            {sortOrder}
          </button>
        </div>
      </div>

      {/* Menu List Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <div className="h-14 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-14 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-14 bg-slate-100 animate-pulse rounded-lg" />
          </div>
        ) : menus.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Không tìm thấy menu phù hợp</p>
            <p className="text-[11px]">Thử điều chỉnh bộ lọc hoặc tạo menu mới.</p>
          </div>
        ) : (
          menus.map((menu) => {
            const isSelected = menu.id === selectedMenuId;
            return (
              <div
                key={menu.id}
                onClick={() => onSelectMenu(menu)}
                className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/60 ring-1 ring-blue-700 shadow-xs'
                    : 'border-transparent bg-white hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {menu.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <code className="text-[10px] font-mono px-1 py-0.2 bg-slate-100 text-slate-700 rounded">
                        {menu.code}
                      </code>
                      <MenuLocationBadge location={menu.location} className="text-[10px] py-0 px-1.5" />
                      <MenuStatusBadge isActive={menu.is_active} className="text-[10px] py-0 px-1.5" />
                    </div>
                  </div>

                  {/* Actions for this menu */}
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={(e) => onEditMenu(menu, e)}
                        className="p-1 text-slate-500 hover:text-blue-800 hover:bg-slate-200/60 rounded transition-colors"
                        title="Chỉnh sửa menu"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onDeleteMenu(menu, e)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa menu"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
