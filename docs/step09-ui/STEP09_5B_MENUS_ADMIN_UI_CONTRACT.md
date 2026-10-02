# STEP 09.5B — MENUS & MENU ITEMS ADMIN UI CONTRACT

**Dự án:** School News Platform  
**Phase:** STEP 09.5B — Menus & Menu Items Admin UI  
**Mục tiêu:** Định nghĩa hợp đồng giao diện, luồng dữ liệu, schema, props và hành vi tương tác của module Menu CMS.

---

## 1. Route & Navigation Contract

### 1.1. URL Routes
| Đường dẫn | Quyền yêu cầu | Module Guard | Component phụ trách | Mục đích |
|---|---|---|---|---|
| `/admin/menus` | `settings.view` | `menu` | `AdminMenusPage` | Danh sách menu & Cây mục menu (Master-Detail) |
| `/admin/menus/*` | `settings.view` | `menu` | `AdminMenusPage` | Fallback xử lý routing con an toàn |

### 1.2. URL Query Parameters
- `?menuId=<uuid>`: Xác định Menu đang được chọn hiển thị cây chi tiết ở cột phải.
- Khi người dùng chọn menu ở cột trái, `menuId` được cập nhật đồng bộ lên URL search parameters để hỗ trợ bookmark và reload trình duyệt.

### 1.3. Sidebar Navigation Item
- **Key:** `admin-menus`
- **Label:** `Menu & Điều hướng`
- **Href:** `/admin/menus`
- **ModuleKey:** `menu`
- **RequiredPermission:** `['settings.view', 'settings.edit']` (cho phép người dùng có quyền xem hoặc sửa đều nhìn thấy mục này trên sidebar).

---

## 2. Component Contracts & Props

### 2.1. `MenuLocationBadge`
```typescript
interface MenuLocationBadgeProps {
  location: MenuLocation; // 'header' | 'footer' | 'sidebar'
  className?: string;
}
```

### 2.2. `MenuStatusBadge`
```typescript
interface MenuStatusBadgeProps {
  isActive: boolean;
  className?: string;
  labels?: { active: string; inactive: string };
}
```

### 2.3. `MenuFormModal`
```typescript
interface MenuFormModalProps {
  isOpen: boolean;
  menuToEdit?: Menu | null; // null nếu là tạo mới
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: MenuCreateInput | MenuUpdateInput) => Promise<void>;
}
```

### 2.4. `MenuDeleteConfirmModal`
```typescript
interface MenuDeleteConfirmModalProps {
  menu: Menu | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (menuId: string) => Promise<void>;
}
```

### 2.5. `MenuItemFormModal`
```typescript
interface MenuItemFormModalProps {
  isOpen: boolean;
  menuId: string;
  parentPresetId?: string | null; // ID mục cha được gán sẵn khi nhấn "+ Mục con"
  itemToEdit?: MenuItemTree | null;
  existingTree: MenuItemTree[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: MenuItemCreateInput | MenuItemUpdateInput) => Promise<void>;
}
```

### 2.6. `MenuItemDeleteConfirmModal`
```typescript
interface MenuItemDeleteConfirmModalProps {
  item: MenuItemTree | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (itemId: string) => Promise<void>;
}
```

### 2.7. `MenuItemTreeNode`
```typescript
interface MenuItemTreeNodeProps {
  node: MenuItemTree;
  siblings: MenuItemTree[];
  index: number;
  depth?: number;
  canEdit: boolean;
  onAddChild: (parentItem: MenuItemTree) => void;
  onEdit: (item: MenuItemTree) => void;
  onDelete: (item: MenuItemTree) => void;
  onToggleActive: (item: MenuItemTree) => void;
  onMoveUp: (index: number, siblings: MenuItemTree[]) => void;
  onMoveDown: (index: number, siblings: MenuItemTree[]) => void;
  onDragStart: (e: React.DragEvent, item: MenuItemTree) => void;
  onDragOver: (e: React.DragEvent, item: MenuItemTree) => void;
  onDrop: (e: React.DragEvent, targetItem: MenuItemTree, siblings: MenuItemTree[]) => void;
}
```

### 2.8. `MenuItemTree`
```typescript
interface MenuItemTreeProps {
  menu: Menu | null;
  tree: MenuItemTreeType[];
  isLoading: boolean;
  canEdit: boolean;
  onAddItem: () => void;
  onAddChild: (parentItem: MenuItemTreeType) => void;
  onEditItem: (item: MenuItemTreeType) => void;
  onDeleteItem: (item: MenuItemTreeType) => void;
  onToggleActive: (item: MenuItemTreeType) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  onRefetch?: () => void;
}
```

---

## 3. Data Integrity & Validation Contracts

### 3.1. Menu Code Validation
- **Regex:** `^[a-zA-Z0-9_-]+$`
- **Min:** 1 ký tự, **Max:** 100 ký tự.
- Xử lý lỗi trùng mã: Khi bắt gặp lỗi `DUPLICATE_CODE` từ service, modal hiển thị thông báo trực quan ngay bên dưới trường mã.

### 3.2. Hierarchy & Anti-Cycle Rules
1. **Self-Parent Rejection:** Một mục menu không thể chọn chính mình làm mục cha.
2. **Descendant Rejection:** Khi chỉnh sửa một mục menu, dropdown chọn mục cha tự động lọc và vô hiệu hóa tất cả các node là con, cháu, hoặc hậu duệ của mục đó.
3. **Cross-Menu Parent Rejection:** Chỉ cho phép chọn mục cha trong cùng một `menu_id`.

### 3.3. Reordering Contract
- Sắp xếp thứ tự các mục cùng cấp nhận vào mảng `orderedIds: string[]`.
- Gọi hàm `reorderMenuItems(menuId, orderedIds)` gán lại trường `sort_order` tuần tự từ 0 đến N-1.
- Invalidate cache TanStack Query theo `['menu-items', 'tree', menuId]` để cập nhật cây ngay lập tức.
