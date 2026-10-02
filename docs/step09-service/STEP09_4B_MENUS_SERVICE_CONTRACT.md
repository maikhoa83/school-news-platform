# STEP 09.4B — MENUS & MENU ITEMS SERVICE & HOOK CONTRACT

## 1. Domain Entities & Database Schema Mapping

### `public.menus`
| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | UUID | NO | `uuid_generate_v4()` | Primary Key |
| `code` | TEXT | NO | - | Unique menu code (e.g. `header-main`) |
| `name` | TEXT | NO | - | Display name of the menu |
| `description` | TEXT | YES | `NULL` | Optional description |
| `location` | TEXT | NO | `'header'` | Enum: `'header'`, `'footer'`, `'sidebar'` |
| `is_active` | BOOLEAN | NO | `TRUE` | Whether the menu is active |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated timestamp via trigger |

### `public.menu_items`
| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | UUID | NO | `uuid_generate_v4()` | Primary Key |
| `menu_id` | UUID | NO | - | Foreign Key to `public.menus(id)` ON DELETE CASCADE |
| `parent_id` | UUID | YES | `NULL` | Self FK to `public.menu_items(id)` ON DELETE CASCADE |
| `title` | TEXT | NO | - | Menu item label |
| `url` | TEXT | NO | - | Destination URL |
| `target` | TEXT | NO | `'_self'` | Enum: `'_self'`, `'_blank'` |
| `sort_order` | INT | NO | `0` | Sequential sort order |
| `icon` | TEXT | YES | `NULL` | Optional icon identifier |
| `is_active` | BOOLEAN | NO | `TRUE` | Whether the item is active |
| `page_id` | UUID | YES | `NULL` | FK to `public.pages(id)` ON DELETE SET NULL |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Auto-updated timestamp via trigger |

---

## 2. Service Layer Signatures (`src/services/menuService.ts`)

```typescript
export async function listMenus(params?: MenuListParams): Promise<Menu[]>;
export async function getMenuById(id: string): Promise<Menu | null>;
export async function getMenuByCode(code: string): Promise<Menu | null>;
export async function createMenu(input: MenuCreateInput): Promise<Menu>;
export async function updateMenu(id: string, input: MenuUpdateInput): Promise<Menu>;
export async function deleteMenu(id: string): Promise<void>;

export async function listMenuItems(params?: MenuItemListParams): Promise<MenuItemWithRelations[]>;
export async function getMenuItemById(id: string): Promise<MenuItemWithRelations | null>;
export async function createMenuItem(input: MenuItemCreateInput): Promise<MenuItem>;
export async function updateMenuItem(id: string, input: MenuItemUpdateInput): Promise<MenuItem>;
export async function deleteMenuItem(id: string): Promise<void>;
export async function reorderMenuItems(menuId: string, orderedIds: string[]): Promise<void>;
export async function getMenuTree(menuId: string): Promise<MenuItemTree[]>;
```

---

## 3. Hook Layer Signatures (`src/modules/menu/hooks/`)

```typescript
export function useMenus(params?: MenuListParams): {
  menus: Menu[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
};

export function useMenu(id?: string): {
  menu: Menu | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
};

export function useMenuByCode(code?: string): {
  menu: Menu | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
};

export function useMenuItems(params?: MenuItemListParams): {
  items: MenuItemWithRelations[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
};

export function useMenuTree(menuId?: string): {
  tree: MenuItemTree[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
};

export function useCreateMenu(): UseMutationResult<Menu, Error, MenuCreateInput>;
export function useUpdateMenu(): UseMutationResult<Menu, Error, { id: string; input: MenuUpdateInput }>;
export function useDeleteMenu(): UseMutationResult<void, Error, string>;

export function useCreateMenuItem(): UseMutationResult<MenuItem, Error, MenuItemCreateInput>;
export function useUpdateMenuItem(): UseMutationResult<MenuItem, Error, { id: string; input: MenuItemUpdateInput; menuId?: string }>;
export function useDeleteMenuItem(): UseMutationResult<void, Error, { id: string; menuId?: string }>;
export function useReorderMenuItems(): UseMutationResult<void, Error, { menuId: string; orderedIds: string[] }>;

export function useMenuMutations(): { ...allMutationHandlers };
```

---

## 4. Hierarchy Constraints
1. **Self-Parent Rejection:** `parent_id !== id` is strictly checked both on client Zod schema and inside `menuService.updateMenuItem()`.
2. **Cross-Menu Parent Rejection:** `parent.menu_id === item.menu_id` is enforced by database RLS and verified in `menuService`.
3. **Cycle Rejection:** An ancestor traversal algorithm checks for cycles when updating `parent_id`.
4. **Tree Assembly:** Assembled in O(n) memory complexity with deterministic ordering (`sort_order ASC`, `created_at ASC`, `id ASC`).
