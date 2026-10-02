/**
 * Admin Menu Management Page
 * School News Platform - Step 09.5B
 *
 * Primary CMS interface for:
 * - Listing and filtering Menus (Header, Footer, Sidebar)
 * - Creating, updating, deleting Menus
 * - Inspecting hierarchical MenuItems Tree for any selected Menu
 * - Creating, editing, deleting, toggling MenuItems
 * - Reordering MenuItems with sibling drag-and-drop and accessible buttons
 * - Enforcing RBAC: Read (settings.view) vs Write (settings.edit)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MenuSquare, AlertCircle, ShieldAlert, CheckCircle2, ChevronLeft } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { useMenus } from '../hooks/useMenus';
import { useMenuTree } from '../hooks/useMenuTree';
import { useMenuMutations } from '../hooks/useMenuMutations';
import { MenuList } from '../components/MenuList';
import { MenuItemTree } from '../components/MenuItemTree';
import { MenuFormModal } from '../components/MenuFormModal';
import { MenuDeleteConfirmModal } from '../components/MenuDeleteConfirmModal';
import { MenuItemFormModal } from '../components/MenuItemFormModal';
import { MenuItemDeleteConfirmModal } from '../components/MenuItemDeleteConfirmModal';
import type {
  Menu,
  MenuItemTree as MenuItemTreeType,
  MenuLocation,
  MenuSortField,
  SortOrder,
  MenuCreateInput,
  MenuUpdateInput,
  MenuItemCreateInput,
  MenuItemUpdateInput,
} from '../types/menu';

export const MenuAdminPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermissions();

  // Permission evaluation: Read = settings.view, Write = settings.edit
  const canView = hasPermission('settings.view');
  const canEdit = hasPermission('settings.edit');

  // Filters and sorting state for Menus
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<MenuLocation | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<MenuSortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Active selected Menu
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // Mobile navigation view: 'list' | 'detail'
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Queries
  const {
    menus,
    isLoading: isLoadingMenus,
    refetch: refetchMenus,
  } = useMenus({
    search: search.trim() || undefined,
    location: locationFilter === 'all' ? undefined : locationFilter,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    sortBy,
    sortOrder,
  });

  const {
    tree: menuTree,
    isLoading: isLoadingTree,
    refetch: refetchTree,
  } = useMenuTree(selectedMenu?.id);

  // Mutations
  const {
    createMenu,
    isCreatingMenu,
    updateMenu,
    isUpdatingMenu,
    deleteMenu,
    isDeletingMenu,
    createMenuItem,
    isCreatingMenuItem,
    updateMenuItem,
    isUpdatingMenuItem,
    deleteMenuItem,
    isDeletingMenuItem,
    reorderMenuItems,
    isReorderingMenuItems,
  } = useMenuMutations();

  // Modal States
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null);

  const [isMenuDeleteOpen, setIsMenuDeleteOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [itemParentPresetId, setItemParentPresetId] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<MenuItemTreeType | null>(null);

  const [isItemDeleteOpen, setIsItemDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItemTreeType | null>(null);

  // Sync selectedMenu with URL search param `menuId` or default to first menu
  useEffect(() => {
    const paramMenuId = searchParams.get('menuId');
    if (paramMenuId && menus.length > 0) {
      const found = menus.find((m) => m.id === paramMenuId);
      if (found) {
        setSelectedMenu(found);
        return;
      }
    }

    // Default select first menu if none selected
    if (!selectedMenu && menus.length > 0) {
      setSelectedMenu(menus[0]);
    } else if (selectedMenu && menus.length > 0) {
      // Re-sync updated menu record if present
      const refreshed = menus.find((m) => m.id === selectedMenu.id);
      if (refreshed) {
        setSelectedMenu(refreshed);
      }
    }
  }, [menus, searchParams, selectedMenu]);

  // Handle Menu Selection
  const handleSelectMenu = (menu: Menu) => {
    setSelectedMenu(menu);
    setSearchParams((prev) => {
      prev.set('menuId', menu.id);
      return prev;
    });
    setMobileView('detail');
  };

  // Menu CRUD handlers
  const handleOpenCreateMenu = () => {
    if (!canEdit) return;
    setMenuToEdit(null);
    setIsMenuFormOpen(true);
  };

  const handleOpenEditMenu = (menu: Menu, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    setMenuToEdit(menu);
    setIsMenuFormOpen(true);
  };

  const handleOpenDeleteMenu = (menu: Menu, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    setMenuToDelete(menu);
    setIsMenuDeleteOpen(true);
  };

  const handleMenuFormSubmit = async (payload: MenuCreateInput | MenuUpdateInput) => {
    if (menuToEdit) {
      await updateMenu({ id: menuToEdit.id, input: payload });
      showToast('success', `Đã cập nhật menu "${payload.name || menuToEdit.name}".`);
    } else {
      const created = await createMenu(payload as MenuCreateInput);
      setSelectedMenu(created);
      setSearchParams((prev) => {
        prev.set('menuId', created.id);
        return prev;
      });
      showToast('success', `Đã tạo mới menu "${created.name}".`);
    }
    await refetchMenus();
  };

  const handleConfirmDeleteMenu = async (menuId: string) => {
    const deletedName = menuToDelete?.name || 'Menu';
    await deleteMenu(menuId);
    setIsMenuDeleteOpen(false);
    setMenuToDelete(null);

    // Reset selected menu if the deleted one was selected
    if (selectedMenu?.id === menuId) {
      setSelectedMenu(null);
      setSearchParams((prev) => {
        prev.delete('menuId');
        return prev;
      });
      setMobileView('list');
    }
    await refetchMenus();
    showToast('success', `Đã xóa menu "${deletedName}".`);
  };

  // MenuItem CRUD handlers
  const handleOpenCreateItem = () => {
    if (!canEdit || !selectedMenu) return;
    setItemParentPresetId(null);
    setItemToEdit(null);
    setIsItemFormOpen(true);
  };

  const handleOpenAddChild = (parentItem: MenuItemTreeType) => {
    if (!canEdit || !selectedMenu) return;
    setItemParentPresetId(parentItem.id);
    setItemToEdit(null);
    setIsItemFormOpen(true);
  };

  const handleOpenEditItem = (item: MenuItemTreeType) => {
    if (!canEdit || !selectedMenu) return;
    setItemParentPresetId(item.parent_id);
    setItemToEdit(item);
    setIsItemFormOpen(true);
  };

  const handleOpenDeleteItem = (item: MenuItemTreeType) => {
    if (!canEdit || !selectedMenu) return;
    setItemToDelete(item);
    setIsItemDeleteOpen(true);
  };

  const handleItemFormSubmit = async (payload: MenuItemCreateInput | MenuItemUpdateInput) => {
    if (!selectedMenu) return;

    if (itemToEdit) {
      await updateMenuItem({
        id: itemToEdit.id,
        input: payload,
        menuId: selectedMenu.id,
      });
      showToast('success', `Đã cập nhật mục "${payload.title || itemToEdit.title}".`);
    } else {
      await createMenuItem(payload as MenuItemCreateInput);
      showToast('success', `Đã thêm mục "${payload.title}" vào menu.`);
    }
    await refetchTree();
  };

  const handleConfirmDeleteItem = async (itemId: string) => {
    if (!selectedMenu) return;
    const title = itemToDelete?.title || 'Mục menu';
    await deleteMenuItem({ id: itemId, menuId: selectedMenu.id });
    setIsItemDeleteOpen(false);
    setItemToDelete(null);
    await refetchTree();
    showToast('success', `Đã xóa mục "${title}".`);
  };

  const handleToggleItemActive = async (item: MenuItemTreeType) => {
    if (!canEdit || !selectedMenu) return;
    const nextState = !item.is_active;
    await updateMenuItem({
      id: item.id,
      input: { is_active: nextState },
      menuId: selectedMenu.id,
    });
    await refetchTree();
    showToast(
      'success',
      nextState
        ? `Đã kích hoạt hiển thị mục "${item.title}".`
        : `Đã tạm ẩn mục "${item.title}".`
    );
  };

  const handleReorderItems = async (orderedIds: string[]) => {
    if (!canEdit || !selectedMenu) return;
    try {
      await reorderMenuItems({
        menuId: selectedMenu.id,
        orderedIds,
      });
      await refetchTree();
      showToast('success', 'Đã cập nhật thứ tự các mục menu.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Không thể cập nhật thứ tự.');
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg border text-xs sm:text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-800'
              : 'bg-red-900 text-white border-red-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-300" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MenuSquare className="h-6 w-6 text-blue-800" />
            <span>Quản lý Menu & Điều hướng</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản trị cấu trúc thanh điều hướng đa cấp (Header, Footer, Sidebar) cho cổng thông tin nhà trường.
          </p>
        </div>

        {/* Read-only Alert if user has settings.view but not settings.edit */}
        {!canEdit && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Chế độ chỉ xem (Cần quyền settings.edit để sửa đổi)</span>
          </div>
        )}
      </div>

      {/* Mobile view switch header */}
      <div className="lg:hidden flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setMobileView('list')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            mobileView === 'list'
              ? 'bg-blue-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Danh sách Menu ({menus.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView('detail')}
          disabled={!selectedMenu}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            mobileView === 'detail'
              ? 'bg-blue-800 text-white'
              : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          Cây mục menu {selectedMenu ? `(${selectedMenu.name})` : ''}
        </button>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Menu List (Master) */}
        <div
          className={`lg:col-span-4 h-[calc(100vh-230px)] min-h-[500px] ${
            mobileView === 'list' ? 'block' : 'hidden lg:block'
          }`}
        >
          <MenuList
            menus={menus}
            selectedMenuId={selectedMenu?.id || null}
            isLoading={isLoadingMenus}
            canEdit={canEdit}
            search={search}
            locationFilter={locationFilter}
            statusFilter={statusFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSearchChange={setSearch}
            onLocationFilterChange={setLocationFilter}
            onStatusFilterChange={setStatusFilter}
            onSortByChange={setSortBy}
            onSortOrderToggle={() =>
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            }
            onSelectMenu={handleSelectMenu}
            onCreateMenu={handleOpenCreateMenu}
            onEditMenu={handleOpenEditMenu}
            onDeleteMenu={handleOpenDeleteMenu}
          />
        </div>

        {/* Right Column: Menu Items Tree (Detail) */}
        <div
          className={`lg:col-span-8 ${
            mobileView === 'detail' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Back button on mobile */}
          <div className="lg:hidden mb-2">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Quay lại danh sách menu</span>
            </button>
          </div>

          <MenuItemTree
            menu={selectedMenu}
            tree={menuTree}
            isLoading={isLoadingTree || isReorderingMenuItems}
            canEdit={canEdit}
            onAddItem={handleOpenCreateItem}
            onAddChild={handleOpenAddChild}
            onEditItem={handleOpenEditItem}
            onDeleteItem={handleOpenDeleteItem}
            onToggleActive={handleToggleItemActive}
            onReorder={handleReorderItems}
            onRefetch={refetchTree}
          />
        </div>
      </div>

      {/* Modals */}
      {/* 1. Menu Create / Edit Modal */}
      <MenuFormModal
        isOpen={isMenuFormOpen}
        menuToEdit={menuToEdit}
        isSaving={isCreatingMenu || isUpdatingMenu}
        onClose={() => {
          setIsMenuFormOpen(false);
          setMenuToEdit(null);
        }}
        onSubmit={handleMenuFormSubmit}
      />

      {/* 2. Menu Delete Confirmation Modal */}
      <MenuDeleteConfirmModal
        isOpen={isMenuDeleteOpen}
        menu={menuToDelete}
        isDeleting={isDeletingMenu}
        onClose={() => {
          setIsMenuDeleteOpen(false);
          setMenuToDelete(null);
        }}
        onConfirm={handleConfirmDeleteMenu}
      />

      {/* 3. MenuItem Create / Edit Modal */}
      {selectedMenu && (
        <MenuItemFormModal
          isOpen={isItemFormOpen}
          menuId={selectedMenu.id}
          parentPresetId={itemParentPresetId}
          itemToEdit={itemToEdit}
          existingTree={menuTree}
          isSaving={isCreatingMenuItem || isUpdatingMenuItem}
          onClose={() => {
            setIsItemFormOpen(false);
            setItemToEdit(null);
            setItemParentPresetId(null);
          }}
          onSubmit={handleItemFormSubmit}
        />
      )}

      {/* 4. MenuItem Delete Confirmation Modal */}
      <MenuItemDeleteConfirmModal
        isOpen={isItemDeleteOpen}
        item={itemToDelete}
        isDeleting={isDeletingMenuItem}
        onClose={() => {
          setIsItemDeleteOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDeleteItem}
      />
    </div>
  );
};
