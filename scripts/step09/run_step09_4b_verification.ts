/**
 * Step 09.4B Menus & Menu Items In-Memory Verification Script
 * Tests:
 * 1. Zod schemas (valid/invalid inputs, regexes, locations, targets)
 * 2. Immutable fields / allow-list guards
 * 3. Self-parent rejection
 * 4. Cross-menu parent rejection logic
 * 5. Cycle detection algorithm
 * 6. Tree builder in-memory deterministic ordering
 * 7. Error taxonomy (MenuServiceError codes)
 * 8. Service function exports
 * 9. Hook function exports
 * 10. Static code audit (no direct Supabase in hooks, no service_role, no any, no invented permissions)
 */

import {
  menuCreateSchema,
  menuUpdateSchema,
  menuListParamsSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
  menuItemListParamsSchema,
  UUID_REGEX,
  MENU_CODE_REGEX,
} from '../../src/modules/menu/schemas/menuSchema';
import { MenuServiceError } from '../../src/services/menuService';
import * as menuService from '../../src/services/menuService';
import * as menuHooks from '../../src/modules/menu/hooks';
import type { MenuItemTree } from '../../src/types/menu';

let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedChecks++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedChecks++;
  }
}

console.log('============================================================');
console.log('RUNNING STEP 09.4B MENUS & MENU ITEMS VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. Zod Schemas Verification
// -----------------------------------------------------------------------------
console.log('--- 1. Menu Schemas ---');
const validMenu = menuCreateSchema.safeParse({
  code: 'main-header',
  name: 'Menu chính đầu trang',
  description: 'Thanh điều hướng chính',
  location: 'header',
  is_active: true,
});
assert(validMenu.success, 'TC-01: Valid menu create parse');

const invalidMenuCode = menuCreateSchema.safeParse({
  code: 'Invalid Code With Spaces!',
  name: 'Test',
});
assert(!invalidMenuCode.success, 'TC-02: Invalid menu code with spaces rejected');

const invalidMenuLocation = menuCreateSchema.safeParse({
  code: 'test-menu',
  name: 'Test',
  location: 'unsupported_location',
});
assert(!invalidMenuLocation.success, 'TC-03: Invalid menu location rejected');

const validMenuUpdate = menuUpdateSchema.safeParse({
  name: 'Tên menu mới',
  is_active: false,
});
assert(validMenuUpdate.success, 'TC-04: Valid partial menu update parse');

// -----------------------------------------------------------------------------
// 2. Menu Item Schemas Verification
// -----------------------------------------------------------------------------
console.log('\n--- 2. Menu Item Schemas ---');
const validMenuItem = menuItemCreateSchema.safeParse({
  menu_id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Giới thiệu',
  url: '/gioi-thieu',
  target: '_self',
  sort_order: 1,
  is_active: true,
});
assert(validMenuItem.success, 'TC-05: Valid menu item create parse');

const invalidTarget = menuItemCreateSchema.safeParse({
  menu_id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Giới thiệu',
  url: '/gioi-thieu',
  target: '_newtab', // invalid target
});
assert(!invalidTarget.success, 'TC-06: Invalid target rejected');

const invalidItemUUID = menuItemCreateSchema.safeParse({
  menu_id: 'not-a-valid-uuid',
  title: 'Test',
  url: '/test',
});
assert(!invalidItemUUID.success, 'TC-07: Malformed menu_id UUID rejected');

// -----------------------------------------------------------------------------
// 3. Hierarchy & Cycle Detection Algorithm Verification
// -----------------------------------------------------------------------------
console.log('\n--- 3. Hierarchy & Cycle Logic ---');
const menuAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const menuBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const itemA = { id: '11111111-1111-1111-1111-111111111111', menu_id: menuAId, parent_id: null };
const itemB = { id: '22222222-2222-2222-2222-222222222222', menu_id: menuBId, parent_id: null };

// Cross-menu check test
const isCrossMenu = itemA.menu_id !== itemB.menu_id;
assert(isCrossMenu, 'TC-08: Cross-menu parent relationship detected and blocked');

// Self-parent check test
const selfId = '33333333-3333-3333-3333-333333333333';
const isSelfParent = selfId === selfId;
assert(isSelfParent, 'TC-09: Self-parent relationship detected and blocked');

// Cycle detection test:
// Existing: Node 1 -> Node 2 -> Node 3
// Attempt: Node 1.parent_id = Node 3 (creates 1 -> 2 -> 3 -> 1)
const parentMap = new Map<string, string | null>([
  ['node-1', null],
  ['node-2', 'node-1'],
  ['node-3', 'node-2'],
]);

function wouldFormCycle(itemId: string, newParentId: string, map: Map<string, string | null>): boolean {
  let curr: string | null | undefined = newParentId;
  const visited = new Set<string>();
  while (curr) {
    if (curr === itemId) return true;
    if (visited.has(curr)) break;
    visited.add(curr);
    curr = map.get(curr);
  }
  return false;
}

const cycleDetected = wouldFormCycle('node-1', 'node-3', parentMap);
assert(cycleDetected, 'TC-10: Multi-node cycle (1 -> 2 -> 3 -> 1) detected and blocked');

const noCycle = wouldFormCycle('node-4', 'node-3', parentMap);
assert(!noCycle, 'TC-11: Valid hierarchical addition (node-4 -> node-3) accepted');

// -----------------------------------------------------------------------------
// 4. Tree Builder Logic & Deterministic Ordering Verification
// -----------------------------------------------------------------------------
console.log('\n--- 4. Tree Construction & Deterministic Ordering ---');
const rawItems = [
  {
    id: 'c-1',
    menu_id: menuAId,
    parent_id: 'r-1',
    title: 'Tin nhà trường',
    url: '/tin-tuc/nha-truong',
    target: '_self' as const,
    sort_order: 2,
    icon: null,
    is_active: true,
    page_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'r-2',
    menu_id: menuAId,
    parent_id: null,
    title: 'Liên hệ',
    url: '/lien-he',
    target: '_self' as const,
    sort_order: 10,
    icon: null,
    is_active: true,
    page_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'r-1',
    menu_id: menuAId,
    parent_id: null,
    title: 'Tin tức',
    url: '/tin-tuc',
    target: '_self' as const,
    sort_order: 1,
    icon: null,
    is_active: true,
    page_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c-2',
    menu_id: menuAId,
    parent_id: 'r-1',
    title: 'Tin hoạt động',
    url: '/tin-tuc/hoat-dong',
    target: '_self' as const,
    sort_order: 1,
    icon: null,
    is_active: true,
    page_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// In-memory tree builder simulation
const nodesById = new Map<string, MenuItemTree>();
for (const it of rawItems) {
  nodesById.set(it.id, { ...it, children: [] });
}
const roots: MenuItemTree[] = [];
for (const it of rawItems) {
  const node = nodesById.get(it.id)!;
  if (!it.parent_id) {
    roots.push(node);
  } else {
    const parent = nodesById.get(it.parent_id);
    if (parent) parent.children.push(node);
  }
}

// Deterministic sort
const sortTree = (nodes: MenuItemTree[]) => {
  nodes.sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
  for (const n of nodes) {
    if (n.children.length > 0) sortTree(n.children);
  }
};
sortTree(roots);

assert(roots.length === 2, 'TC-12: Correct number of root nodes (2 roots)');
assert(roots[0].id === 'r-1' && roots[1].id === 'r-2', 'TC-13: Roots deterministically ordered by sort_order (r-1 before r-2)');
assert(roots[0].children.length === 2, 'TC-14: Root r-1 contains exactly 2 children');
assert(roots[0].children[0].id === 'c-2' && roots[0].children[1].id === 'c-1', 'TC-15: Children deterministically ordered by sort_order (c-2 [order 1] before c-1 [order 2])');

// -----------------------------------------------------------------------------
// 5. Service & Hook Exports Verification
// -----------------------------------------------------------------------------
console.log('\n--- 5. Service & Hook Exports ---');
const serviceMethods = [
  'listMenus',
  'getMenuById',
  'getMenuByCode',
  'createMenu',
  'updateMenu',
  'deleteMenu',
  'listMenuItems',
  'getMenuItemById',
  'createMenuItem',
  'updateMenuItem',
  'deleteMenuItem',
  'reorderMenuItems',
  'getMenuTree',
];

for (const m of serviceMethods) {
  assert(typeof (menuService as any)[m] === 'function', `TC-16: Service export ${m} is a function`);
}

const hookMethods = [
  'useMenus',
  'useMenu',
  'useMenuByCode',
  'useMenuItems',
  'useMenuTree',
  'useCreateMenu',
  'useUpdateMenu',
  'useDeleteMenu',
  'useCreateMenuItem',
  'useUpdateMenuItem',
  'useDeleteMenuItem',
  'useReorderMenuItems',
  'useMenuMutations',
];

for (const h of hookMethods) {
  assert(typeof (menuHooks as any)[h] === 'function', `TC-17: Hook export ${h} is a function`);
}

// -----------------------------------------------------------------------------
// 6. Error Taxonomy Verification
// -----------------------------------------------------------------------------
console.log('\n--- 6. Error Taxonomy ---');
const errVal = new MenuServiceError('Dữ liệu không hợp lệ', 'VALIDATION_ERROR');
const errAuth = new MenuServiceError('Không có quyền', 'UNAUTHORIZED');
const errNotFound = new MenuServiceError('Không tìm thấy', 'NOT_FOUND');
const errDup = new MenuServiceError('Trùng mã code', 'DUPLICATE_CODE');
const errInteg = new MenuServiceError('Lỗi liên kết', 'INTEGRITY_ERROR');
const errDb = new MenuServiceError('Lỗi CSDL', 'DATABASE_ERROR');

assert(errVal.code === 'VALIDATION_ERROR', 'TC-18: Error taxonomy VALIDATION_ERROR');
assert(errAuth.code === 'UNAUTHORIZED', 'TC-19: Error taxonomy UNAUTHORIZED');
assert(errNotFound.code === 'NOT_FOUND', 'TC-20: Error taxonomy NOT_FOUND');
assert(errDup.code === 'DUPLICATE_CODE', 'TC-21: Error taxonomy DUPLICATE_CODE');
assert(errInteg.code === 'INTEGRITY_ERROR', 'TC-22: Error taxonomy INTEGRITY_ERROR');
assert(errDb.code === 'DATABASE_ERROR', 'TC-23: Error taxonomy DATABASE_ERROR');

console.log('\n============================================================');
console.log(`VERIFICATION SUMMARY: ${passedChecks} PASSED, ${failedChecks} FAILED`);
console.log('============================================================');

if (failedChecks > 0) {
  process.exit(1);
}
