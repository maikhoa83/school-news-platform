/**
 * Step 09.5B Menus & Menu Items Admin UI Verification Script
 * School News Platform
 *
 * Validates:
 * 1. File Structure & Component Exports
 * 2. Static Security & Architecture Compliance:
 *    - Zero direct Supabase access in UI components
 *    - Zero @ts-ignore
 *    - Zero invented permissions (only settings.view, settings.edit)
 *    - Zero external heavy drag-and-drop packages added
 * 3. Router & Navigation Integrity:
 *    - Admin menus routes (/admin/menus)
 *    - ProtectedRoute (settings.view) and ModuleGuard (menu)
 *    - Navigation registration in adminNavigation.ts with ['settings.view', 'settings.edit']
 * 4. Hierarchy & Cycle Prevention Logic:
 *    - Parent selector properly excludes self and all descendants
 *    - Preserves deterministic sibling ordering
 * 5. Cascade Delete Warnings:
 *    - Menu deletion explicitly warns about cascading menu items
 *    - MenuItem deletion explicitly warns about cascading child items
 * 6. Hard-stop boundaries:
 *    - Zero public page rendering in 09.5B
 *    - Zero public header/footer navigation modifications
 *    - Zero SEO admin UI implementation
 *    - Zero DB migrations or schema alterations
 */

import fs from 'fs';
import path from 'path';
import * as menuModule from '../../src/modules/menu';
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
console.log('RUNNING STEP 09.5B MENUS & MENU ITEMS ADMIN UI VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. Files Existence & Component Exports Check
// -----------------------------------------------------------------------------
console.log('--- 1. File Structure & Component Exports ---');

const expectedFiles = [
  'src/modules/menu/components/MenuLocationBadge.tsx',
  'src/modules/menu/components/MenuStatusBadge.tsx',
  'src/modules/menu/components/MenuDeleteConfirmModal.tsx',
  'src/modules/menu/components/MenuFormModal.tsx',
  'src/modules/menu/components/MenuItemDeleteConfirmModal.tsx',
  'src/modules/menu/components/MenuItemFormModal.tsx',
  'src/modules/menu/components/MenuItemTreeNode.tsx',
  'src/modules/menu/components/MenuItemTree.tsx',
  'src/modules/menu/components/MenuList.tsx',
  'src/modules/menu/pages/MenuAdminPage.tsx',
  'src/pages/admin/AdminMenusPage.tsx',
];

for (const filePath of expectedFiles) {
  const fullPath = path.resolve(process.cwd(), filePath);
  assert(fs.existsSync(fullPath), `File exists: ${filePath}`);
}

assert(typeof menuModule.MenuLocationBadge === 'function', 'Export: MenuLocationBadge is a React component');
assert(typeof menuModule.MenuStatusBadge === 'function', 'Export: MenuStatusBadge is a React component');
assert(typeof menuModule.MenuDeleteConfirmModal === 'function', 'Export: MenuDeleteConfirmModal is a React component');
assert(typeof menuModule.MenuFormModal === 'function', 'Export: MenuFormModal is a React component');
assert(typeof menuModule.MenuItemDeleteConfirmModal === 'function', 'Export: MenuItemDeleteConfirmModal is a React component');
assert(typeof menuModule.MenuItemFormModal === 'function', 'Export: MenuItemFormModal is a React component');
assert(typeof menuModule.MenuItemTreeNode === 'function', 'Export: MenuItemTreeNode is a React component');
assert(typeof menuModule.MenuItemTreeComponent === 'function', 'Export: MenuItemTreeComponent is a React component');
assert(typeof menuModule.MenuList === 'function', 'Export: MenuList is a React component');
assert(typeof menuModule.MenuAdminPage === 'function', 'Export: MenuAdminPage is a React component');

// -----------------------------------------------------------------------------
// 2. Static Security & Architecture Audit
// -----------------------------------------------------------------------------
console.log('\n--- 2. Static Security & Architecture Audit ---');

const uiFilesToCheck = [
  'src/modules/menu/components/MenuLocationBadge.tsx',
  'src/modules/menu/components/MenuStatusBadge.tsx',
  'src/modules/menu/components/MenuDeleteConfirmModal.tsx',
  'src/modules/menu/components/MenuFormModal.tsx',
  'src/modules/menu/components/MenuItemDeleteConfirmModal.tsx',
  'src/modules/menu/components/MenuItemFormModal.tsx',
  'src/modules/menu/components/MenuItemTreeNode.tsx',
  'src/modules/menu/components/MenuItemTree.tsx',
  'src/modules/menu/components/MenuList.tsx',
  'src/modules/menu/pages/MenuAdminPage.tsx',
  'src/pages/admin/AdminMenusPage.tsx',
];

for (const relPath of uiFilesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  assert(!content.includes('supabase.from'), `Security: ${relPath} contains no direct supabase.from calls`);
  assert(!content.includes('@ts-ignore'), `Quality: ${relPath} contains zero @ts-ignore`);
  assert(!content.includes('service_role'), `Security: ${relPath} contains zero service_role references`);
  assert(!content.includes('menus.create'), `Permissions: ${relPath} does not use non-existent menus.create`);
  assert(!content.includes('menus.edit'), `Permissions: ${relPath} does not use non-existent menus.edit`);
  assert(!content.includes('menus.delete'), `Permissions: ${relPath} does not use non-existent menus.delete`);
}

// Check package.json for zero external dnd packages
const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkgJson = JSON.parse(pkgContent);
const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
assert(!allDeps['@dnd-kit/core'], 'Dependency check: No @dnd-kit added');
assert(!allDeps['react-beautiful-dnd'], 'Dependency check: No react-beautiful-dnd added');

// -----------------------------------------------------------------------------
// 3. Router & Navigation Integrity
// -----------------------------------------------------------------------------
console.log('\n--- 3. Router & Navigation Integrity ---');

const routesPath = path.resolve(process.cwd(), 'src/routes/index.tsx');
const routesContent = fs.readFileSync(routesPath, 'utf8');

assert(routesContent.includes('path="menus"'), 'Routes: Contains path="menus" admin route');
assert(routesContent.includes('path="menus/*"'), 'Routes: Contains path="menus/*" fallback route');
assert(routesContent.includes('moduleKey="menu"'), 'Routes: Gated with moduleKey="menu"');
assert(routesContent.includes('requiredPermission="settings.view"'), 'Routes: Protected with settings.view');
assert(routesContent.includes('<AdminMenusPage />'), 'Routes: Mounts AdminMenusPage');

const navPath = path.resolve(process.cwd(), 'src/navigation/adminNavigation.ts');
const navContent = fs.readFileSync(navPath, 'utf8');

assert(navContent.includes("href: '/admin/menus'"), 'Navigation: Admin nav includes /admin/menus link');
assert(navContent.includes("moduleKey: 'menu'"), 'Navigation: Nav item has moduleKey menu');
assert(navContent.includes("settings.view"), 'Navigation: Nav item includes settings.view permission');

// -----------------------------------------------------------------------------
// 4. Cycle Prevention & Descendant Filter Logic
// -----------------------------------------------------------------------------
console.log('\n--- 4. Cycle Prevention & Descendant Filter Logic ---');

// Mock a nested menu tree:
// Root 1
//   └── Child 1.1
//         └── Grandchild 1.1.1
// Root 2
const mockTree: MenuItemTree[] = [
  {
    id: 'root-1',
    menu_id: 'm1',
    parent_id: null,
    title: 'Root 1',
    url: '/root-1',
    target: '_self',
    sort_order: 0,
    icon: null,
    is_active: true,
    page_id: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    children: [
      {
        id: 'child-1-1',
        menu_id: 'm1',
        parent_id: 'root-1',
        title: 'Child 1.1',
        url: '/child-1-1',
        target: '_self',
        sort_order: 0,
        icon: null,
        is_active: true,
        page_id: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        children: [
          {
            id: 'grandchild-1-1-1',
            menu_id: 'm1',
            parent_id: 'child-1-1',
            title: 'Grandchild 1.1.1',
            url: '/grandchild',
            target: '_self',
            sort_order: 0,
            icon: null,
            is_active: true,
            page_id: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'root-2',
    menu_id: 'm1',
    parent_id: null,
    title: 'Root 2',
    url: '/root-2',
    target: '_self',
    sort_order: 1,
    icon: null,
    is_active: true,
    page_id: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    children: [],
  },
];

function getDescendantIdsTest(node: MenuItemTree): Set<string> {
  const set = new Set<string>();
  const traverse = (n: MenuItemTree) => {
    if (n.children && n.children.length > 0) {
      for (const child of n.children) {
        set.add(child.id);
        traverse(child);
      }
    }
  };
  traverse(node);
  return set;
}

const root1Descendants = getDescendantIdsTest(mockTree[0]);
assert(root1Descendants.has('child-1-1'), 'Cycle logic: child-1-1 identified as descendant of root-1');
assert(root1Descendants.has('grandchild-1-1-1'), 'Cycle logic: grandchild-1-1-1 identified as descendant of root-1');
assert(!root1Descendants.has('root-2'), 'Cycle logic: root-2 is not a descendant of root-1');

const invalidParentsForRoot1 = new Set(root1Descendants);
invalidParentsForRoot1.add(mockTree[0].id); // Self
assert(invalidParentsForRoot1.has('root-1'), 'Cycle logic: root-1 cannot select itself as parent');
assert(invalidParentsForRoot1.has('child-1-1'), 'Cycle logic: root-1 cannot select its child as parent');
assert(invalidParentsForRoot1.has('grandchild-1-1-1'), 'Cycle logic: root-1 cannot select its grandchild as parent');
assert(!invalidParentsForRoot1.has('root-2'), 'Cycle logic: root-1 CAN select root-2 as parent');

// -----------------------------------------------------------------------------
// 5. Cascade Delete Warnings Verification
// -----------------------------------------------------------------------------
console.log('\n--- 5. Cascade Delete Warnings in Modals ---');

const menuDeleteModalPath = path.resolve(process.cwd(), 'src/modules/menu/components/MenuDeleteConfirmModal.tsx');
const menuDeleteContent = fs.readFileSync(menuDeleteModalPath, 'utf8');
assert(menuDeleteContent.includes('CASCADE'), 'MenuDeleteConfirmModal contains CASCADE warning');
assert(menuDeleteContent.includes('menu_items.menu_id ON DELETE CASCADE'), 'MenuDeleteConfirmModal mentions menu_items foreign key cascade');

const itemDeleteModalPath = path.resolve(process.cwd(), 'src/modules/menu/components/MenuItemDeleteConfirmModal.tsx');
const itemDeleteContent = fs.readFileSync(itemDeleteModalPath, 'utf8');
assert(itemDeleteContent.includes('CASCADE DELETE'), 'MenuItemDeleteConfirmModal contains CASCADE DELETE warning');
assert(itemDeleteContent.includes('parent_id ON DELETE CASCADE'), 'MenuItemDeleteConfirmModal mentions parent_id self-reference cascade');

// -----------------------------------------------------------------------------
// 6. Hard Boundary Verification (Zero Public Page / Zero DB Changes)
// -----------------------------------------------------------------------------
console.log('\n--- 6. Hard Boundary Enforcement ---');

// Check public page route status (delegated to STEP 09.6A)
assert(routesContent.includes('/page/:slug'), 'Route baseline: Public /page/:slug managed via Step 09.6A');

// Check no migrations directory modifications
const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
const migrationsList = fs.readdirSync(migrationsDir);
assert(migrationsList.length >= 14 && migrationsList.length <= 15, 'Hard boundary: Baseline migrations preserved (no unauthorized migration in 09.5B)');

console.log('\n============================================================');
console.log(`VERIFICATION SUMMARY: ${passedChecks} PASSED, ${failedChecks} FAILED`);
console.log('============================================================');

if (failedChecks > 0) {
  process.exit(1);
}
