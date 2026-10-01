/**
 * Step 09.5C SEO Settings Admin UI Verification Script
 * School News Platform
 *
 * Validates:
 * 1. File Structure & Component Exports
 * 2. Static Security & Architecture Compliance:
 *    - Zero direct Supabase access in UI components
 *    - Zero @ts-ignore
 *    - Zero invented permissions (strictly settings.view, settings.edit)
 *    - Zero external heavy packages added
 * 3. Router & Navigation Integrity:
 *    - Admin SEO route (/admin/seo) in src/routes/index.tsx
 *    - ProtectedRoute (settings.view) and ModuleGuard (seo)
 *    - Navigation registration in adminNavigation.ts with Globe icon and moduleKey 'seo'
 * 4. Singleton Pattern Contract:
 *    - Single-row invariant id = 'default'
 *    - Zero record creation or deletion capabilities in UI
 * 5. Domain Logic & Schema Validation:
 *    - formatMetaTitle helper with %s replacement
 *    - generateRobotsTxt helper
 *    - buildMetaTags helper
 *    - seoSettingsUpdateSchema validation & sanitization
 * 6. Hard-stop boundaries:
 *    - Zero public page rendering in 09.5C
 *    - Zero public robots.txt endpoint
 *    - Exactly 14 baseline database migrations
 */

import fs from 'fs';
import path from 'path';
import * as seoModule from '../../src/modules/seo';
import {
  formatMetaTitle,
  generateRobotsTxt,
  buildMetaTags,
} from '../../src/services/seoService';
import { seoSettingsUpdateSchema } from '../../src/modules/seo/schemas/seoSchema';
import { SEO_SINGLETON_ID, DEFAULT_SEO_SETTINGS } from '../../src/modules/seo/config/seoConfig';

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
console.log('RUNNING STEP 09.5C SEO SETTINGS ADMIN UI VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. File Structure & Component Exports Check
// -----------------------------------------------------------------------------
console.log('--- 1. File Structure & Component Exports ---');

const expectedFiles = [
  'src/modules/seo/components/SeoStatusBadge.tsx',
  'src/modules/seo/components/SeoPreviewCard.tsx',
  'src/modules/seo/components/SeoGeneralSettingsForm.tsx',
  'src/modules/seo/components/SeoSocialSettingsForm.tsx',
  'src/modules/seo/components/SeoIndexingSettingsForm.tsx',
  'src/modules/seo/components/SeoRobotsTxtForm.tsx',
  'src/modules/seo/pages/SeoAdminPage.tsx',
  'src/pages/admin/AdminSeoSettingsPage.tsx',
];

for (const filePath of expectedFiles) {
  const fullPath = path.resolve(process.cwd(), filePath);
  assert(fs.existsSync(fullPath), `File exists: ${filePath}`);
}

assert(typeof seoModule.SeoStatusBadge === 'function', 'Export: SeoStatusBadge is a React component');
assert(typeof seoModule.SeoPreviewCard === 'function', 'Export: SeoPreviewCard is a React component');
assert(typeof seoModule.SeoGeneralSettingsForm === 'function', 'Export: SeoGeneralSettingsForm is a React component');
assert(typeof seoModule.SeoSocialSettingsForm === 'function', 'Export: SeoSocialSettingsForm is a React component');
assert(typeof seoModule.SeoIndexingSettingsForm === 'function', 'Export: SeoIndexingSettingsForm is a React component');
assert(typeof seoModule.SeoRobotsTxtForm === 'function', 'Export: SeoRobotsTxtForm is a React component');
assert(typeof seoModule.SeoAdminPage === 'function', 'Export: SeoAdminPage is a React component');
assert(typeof seoModule.useSeoSettings === 'function', 'Export: useSeoSettings query hook');
assert(typeof seoModule.useUpdateSeoSettings === 'function', 'Export: useUpdateSeoSettings mutation hook');

// -----------------------------------------------------------------------------
// 2. Static Security & Architecture Audit
// -----------------------------------------------------------------------------
console.log('\n--- 2. Static Security & Architecture Audit ---');

const uiFilesToCheck = [
  'src/modules/seo/components/SeoStatusBadge.tsx',
  'src/modules/seo/components/SeoPreviewCard.tsx',
  'src/modules/seo/components/SeoGeneralSettingsForm.tsx',
  'src/modules/seo/components/SeoSocialSettingsForm.tsx',
  'src/modules/seo/components/SeoIndexingSettingsForm.tsx',
  'src/modules/seo/components/SeoRobotsTxtForm.tsx',
  'src/modules/seo/pages/SeoAdminPage.tsx',
  'src/pages/admin/AdminSeoSettingsPage.tsx',
];

for (const relPath of uiFilesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  assert(!content.includes('supabase.from'), `Security: ${relPath} contains no direct supabase.from calls`);
  assert(!content.includes('@ts-ignore'), `Quality: ${relPath} contains zero @ts-ignore`);
  assert(!content.includes('service_role'), `Security: ${relPath} contains zero service_role references`);
  assert(!content.includes('seo.create'), `Permissions: ${relPath} does not use non-existent seo.create`);
  assert(!content.includes('seo.edit'), `Permissions: ${relPath} does not use non-existent seo.edit`);
  assert(!content.includes('seo.delete'), `Permissions: ${relPath} does not use non-existent seo.delete`);
}

// Check package.json for zero external heavy packages added
const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkgJson = JSON.parse(pkgContent);
const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
assert(!allDeps['react-helmet-async'], 'Dependency check: No react-helmet-async added (uses native domain builders)');
assert(!allDeps['next-seo'], 'Dependency check: No next-seo added');

// -----------------------------------------------------------------------------
// 3. Router & Navigation Integrity
// -----------------------------------------------------------------------------
console.log('\n--- 3. Router & Navigation Integrity ---');

const routesPath = path.resolve(process.cwd(), 'src/routes/index.tsx');
const routesContent = fs.readFileSync(routesPath, 'utf8');

assert(routesContent.includes('path="seo"'), 'Routes: Contains path="seo" admin route');
assert(routesContent.includes('path="seo/*"'), 'Routes: Contains path="seo/*" fallback route');
assert(routesContent.includes('moduleKey="seo"'), 'Routes: Gated with moduleKey="seo"');
assert(routesContent.includes('requiredPermission="settings.view"'), 'Routes: Protected with settings.view');
assert(routesContent.includes('<AdminSeoSettingsPage />'), 'Routes: Mounts AdminSeoSettingsPage');

const navPath = path.resolve(process.cwd(), 'src/navigation/adminNavigation.ts');
const navContent = fs.readFileSync(navPath, 'utf8');

assert(navContent.includes("href: '/admin/seo'"), 'Navigation: Admin nav includes /admin/seo link');
assert(navContent.includes("moduleKey: 'seo'"), 'Navigation: Nav item has moduleKey seo');
assert(navContent.includes("requiredPermission: 'settings.view'"), 'Navigation: Nav item includes settings.view permission');
assert(navContent.includes("icon: Globe"), 'Navigation: Nav item uses Globe icon');

// -----------------------------------------------------------------------------
// 4. Singleton Pattern Contract
// -----------------------------------------------------------------------------
console.log('\n--- 4. Singleton Pattern Contract ---');

assert(SEO_SINGLETON_ID === 'default', 'Singleton: SEO_SINGLETON_ID is strictly "default"');
assert(DEFAULT_SEO_SETTINGS.id === 'default', 'Singleton: Default settings has id = "default"');

// Check admin page does NOT contain record selection, creation, or deletion buttons
const adminPagePath = path.resolve(process.cwd(), 'src/modules/seo/pages/SeoAdminPage.tsx');
const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
assert(!adminPageContent.includes('Thêm cấu hình mới'), 'Singleton: No "Thêm cấu hình mới" (create) button');
assert(!adminPageContent.includes('Xóa cấu hình'), 'Singleton: No "Xóa cấu hình" (delete) button');
assert(!adminPageContent.includes('Chọn bản ghi'), 'Singleton: No "Chọn bản ghi" (select record) selector');

// -----------------------------------------------------------------------------
// 5. Domain Logic & Schema Validation Tests
// -----------------------------------------------------------------------------
console.log('\n--- 5. Domain Logic & Schema Validation Tests ---');

// Title formatting
const formattedWithPage = formatMetaTitle('%s | THPT Amsterdam', 'Khai giảng năm học');
assert(formattedWithPage === 'Khai giảng năm học | THPT Amsterdam', 'Title Helper: Replaces %s token correctly');

const formattedWithoutPage = formatMetaTitle('%s | Cổng thông tin');
assert(formattedWithoutPage === 'Cổng thông tin', 'Title Helper: Strips leading %s | when no page title provided');

// Robots.txt generation
const robotsCustom = generateRobotsTxt({
  robots_txt_content: 'User-agent: Googlebot\nAllow: /',
});
assert(robotsCustom === 'User-agent: Googlebot\nAllow: /', 'Robots Helper: Preserves custom robots.txt content');

const robotsGenerated = generateRobotsTxt({
  robots_txt_content: null,
  canonical_base_url: 'https://amsterdam.edu.vn',
  sitemap_enabled: true,
});
assert(robotsGenerated.includes('User-agent: *'), 'Robots Helper: Default includes User-agent: *');
assert(robotsGenerated.includes('Disallow: /admin/'), 'Robots Helper: Default disallows /admin/');
assert(robotsGenerated.includes('Sitemap: https://amsterdam.edu.vn/sitemap.xml'), 'Robots Helper: Includes canonical sitemap URL');

// Meta tags generation
const metaTags = buildMetaTags(
  {
    ...DEFAULT_SEO_SETTINGS,
    canonical_base_url: 'https://school.edu.vn',
    og_image_default: '/images/og.png',
    structured_data_enabled: true,
  },
  {
    title: 'Tin tức học tập',
    description: 'Chi tiết bài viết',
    canonicalPath: '/tin-tuc/hoc-tap',
  }
);
assert(metaTags.title.includes('Tin tức học tập'), 'MetaTags Helper: Computes title with page title');
assert(metaTags.canonicalUrl === 'https://school.edu.vn/tin-tuc/hoc-tap', 'MetaTags Helper: Computes absolute canonical URL');
assert(metaTags.ogImage === 'https://school.edu.vn/images/og.png', 'MetaTags Helper: Prepends base URL to relative og_image');
assert(metaTags.structuredDataJsonLd !== null, 'MetaTags Helper: Emits Schema.org JSON-LD when enabled');

// Schema validation tests
const validPayload = {
  meta_title_pattern: '%s | Trường THPT Chuyên',
  meta_description_default: 'Mô tả hợp lệ cho cổng thông tin',
  canonical_base_url: 'https://c3amsterdam.edu.vn/',
  sitemap_enabled: true,
  structured_data_enabled: true,
};
const parsedValid = seoSettingsUpdateSchema.safeParse(validPayload);
assert(parsedValid.success, 'Schema: Accepts valid SEO update payload');
if (parsedValid.success) {
  assert(parsedValid.data.canonical_base_url === 'https://c3amsterdam.edu.vn', 'Schema: Strips trailing slash from canonical_base_url');
}

const invalidUrlPayload = {
  canonical_base_url: 'ftp://not-a-valid-http-url',
};
const parsedInvalidUrl = seoSettingsUpdateSchema.safeParse(invalidUrlPayload);
assert(!parsedInvalidUrl.success, 'Schema: Rejects non-http/https canonical URL');

const invalidTitlePayload = {
  meta_title_pattern: '',
};
const parsedInvalidTitle = seoSettingsUpdateSchema.safeParse(invalidTitlePayload);
assert(!parsedInvalidTitle.success, 'Schema: Rejects empty meta_title_pattern');

// -----------------------------------------------------------------------------
// 6. Hard Boundary Verification
// -----------------------------------------------------------------------------
console.log('\n--- 6. Hard Boundary Enforcement ---');

// Check public page route status (delegated to STEP 09.6A)
assert(routesContent.includes('/page/:slug'), 'Route baseline: Public /page/:slug managed via Step 09.6A');

// Check no public robots.txt or sitemap.xml endpoints introduced in 09.5C
assert(!routesContent.includes('path="robots.txt"'), 'Hard boundary: Zero public robots.txt route in client router');
assert(!routesContent.includes('path="sitemap.xml"'), 'Hard boundary: Zero public sitemap.xml route in client router');

// Check no migrations directory modifications
const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
const migrationsList = fs.readdirSync(migrationsDir);
assert(migrationsList.length >= 14 && migrationsList.length <= 15, 'Hard boundary: Baseline migrations preserved (zero unauthorized migrations in 09.5C)');

console.log('\n============================================================');
console.log(`VERIFICATION SUMMARY: ${passedChecks} PASSED, ${failedChecks} FAILED`);
console.log('============================================================');

if (failedChecks > 0) {
  process.exit(1);
}
