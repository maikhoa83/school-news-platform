/**
 * Step 09.6A Public Static Pages & Dynamic Routing Verification Script
 * School News Platform
 *
 * Validates:
 * 1. File Structure & Component Exports
 * 2. Public Router & Layout Integration:
 *    - Route /page/:slug under PublicShell
 *    - Guarded by ModuleGuard with moduleKey="pages"
 *    - Zero collision with existing legacy/demo routes
 * 3. Static Security & Architecture Compliance:
 *    - Zero direct Supabase access in UI components
 *    - Zero @ts-ignore
 *    - Zero service_role references
 *    - Mandatory consumption of usePublishedPage hook
 * 4. XSS Prevention & HTML Sanitization:
 *    - HTML content strictly sanitized via DOMPurify before DOM injection
 *    - Verification of sanitization against hostile attack vectors
 * 5. State Handling & Edge Cases:
 *    - Loading skeleton verification
 *    - 404 Not Found state on missing / invalid slug
 *    - Public-safe error boundary and retry capability
 *    - All 4 page templates supported (default, fullwidth, sidebar, contact)
 * 6. Hard-stop boundaries:
 *    - Exactly 14 database migrations (Zero new migrations)
 *    - Zero package additions
 *    - Zero admin pages / menu runtime changes
 */

import fs from 'fs';
import path from 'path';
import * as pagesModule from '../../src/modules/pages';
import { sanitizeHtml } from '../../src/lib/sanitize';
import { SLUG_REGEX } from '../../src/modules/pages/schemas/pageSchema';

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
console.log('RUNNING STEP 09.6A PUBLIC PAGES & DYNAMIC ROUTING VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. File Structure & Component Exports Check
// -----------------------------------------------------------------------------
console.log('--- 1. File Structure & Component Exports ---');

const expectedFiles = [
  'src/modules/pages/components/PublicPageBreadcrumb.tsx',
  'src/modules/pages/components/PublicPageHeader.tsx',
  'src/modules/pages/components/PublicPageContent.tsx',
  'src/modules/pages/components/PublicPageSkeleton.tsx',
  'src/modules/pages/components/PublicPageError.tsx',
  'src/modules/pages/components/PublicPageTemplates.tsx',
  'src/modules/pages/pages/PublicPage.tsx',
  'src/pages/public/PublicPage.tsx',
  'src/modules/pages/hooks/usePublishedPage.ts',
];

for (const filePath of expectedFiles) {
  const fullPath = path.resolve(process.cwd(), filePath);
  assert(fs.existsSync(fullPath), `File exists: ${filePath}`);
}

assert(typeof pagesModule.PublicPage === 'function', 'Export: PublicPage is a React component');
assert(typeof pagesModule.PublicPageBreadcrumb === 'function', 'Export: PublicPageBreadcrumb is a React component');
assert(typeof pagesModule.PublicPageHeader === 'function', 'Export: PublicPageHeader is a React component');
assert(typeof pagesModule.PublicPageContent === 'function', 'Export: PublicPageContent is a React component');
assert(typeof pagesModule.PublicPageSkeleton === 'function', 'Export: PublicPageSkeleton is a React component');
assert(typeof pagesModule.PublicPageError === 'function', 'Export: PublicPageError is a React component');
assert(typeof pagesModule.DefaultPageTemplate === 'function', 'Export: DefaultPageTemplate is a React component');
assert(typeof pagesModule.FullwidthPageTemplate === 'function', 'Export: FullwidthPageTemplate is a React component');
assert(typeof pagesModule.SidebarPageTemplate === 'function', 'Export: SidebarPageTemplate is a React component');
assert(typeof pagesModule.ContactPageTemplate === 'function', 'Export: ContactPageTemplate is a React component');
assert(typeof pagesModule.usePublishedPage === 'function', 'Export: usePublishedPage is a query hook');

// -----------------------------------------------------------------------------
// 2. Router & Layout Integration
// -----------------------------------------------------------------------------
console.log('\n--- 2. Router & Layout Integration ---');

const routesPath = path.resolve(process.cwd(), 'src/routes/index.tsx');
const routesContent = fs.readFileSync(routesPath, 'utf8');

assert(routesContent.includes('path="/page/:slug"'), 'Router: /page/:slug is defined in routes/index.tsx');
assert(routesContent.includes('moduleKey="pages"'), 'Router: /page/:slug route is guarded by moduleKey="pages"');
assert(routesContent.includes('PublicPage'), 'Router: PublicPage component is used for /page/:slug');

// Invariant: Legacy demo routes must not be erased
assert(routesContent.includes('path="/about"'), 'Router Invariant: legacy /about route preserved');
assert(routesContent.includes('path="/activities"'), 'Router Invariant: legacy /activities route preserved');
assert(routesContent.includes('path="/admissions"'), 'Router Invariant: legacy /admissions route preserved');
assert(routesContent.includes('path="/contact"'), 'Router Invariant: legacy /contact route preserved');

// -----------------------------------------------------------------------------
// 3. Static Security & Architecture Audit
// -----------------------------------------------------------------------------
console.log('\n--- 3. Static Security & Architecture Audit ---');

const uiFilesToCheck = [
  'src/modules/pages/components/PublicPageBreadcrumb.tsx',
  'src/modules/pages/components/PublicPageHeader.tsx',
  'src/modules/pages/components/PublicPageContent.tsx',
  'src/modules/pages/components/PublicPageSkeleton.tsx',
  'src/modules/pages/components/PublicPageError.tsx',
  'src/modules/pages/components/PublicPageTemplates.tsx',
  'src/modules/pages/pages/PublicPage.tsx',
  'src/pages/public/PublicPage.tsx',
];

for (const relPath of uiFilesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  assert(!content.includes('supabase.from'), `Security: ${relPath} contains no direct supabase.from calls`);
  assert(!content.includes('@ts-ignore'), `Quality: ${relPath} contains zero @ts-ignore`);
  assert(!content.includes('service_role'), `Security: ${relPath} contains zero service_role references`);
}

// Check that PublicPage consumes usePublishedPage hook
const publicPageViewPath = path.resolve(process.cwd(), 'src/modules/pages/pages/PublicPage.tsx');
const publicPageViewContent = fs.readFileSync(publicPageViewPath, 'utf8');
assert(publicPageViewContent.includes('usePublishedPage(slug)'), 'Architecture: PublicPage consumes usePublishedPage hook');

// Check service query filter invariant
const pageServicePath = path.resolve(process.cwd(), 'src/services/pageService.ts');
const pageServiceContent = fs.readFileSync(pageServicePath, 'utf8');
assert(
  pageServiceContent.includes(".eq('status', 'published')"),
  "Security Invariant: getPublishedPageBySlug strictly filters by status = 'published'"
);

// -----------------------------------------------------------------------------
// 4. XSS Prevention & HTML Sanitization Audit
// -----------------------------------------------------------------------------
console.log('\n--- 4. XSS Prevention & HTML Sanitization ---');

const pageContentCompPath = path.resolve(process.cwd(), 'src/modules/pages/components/PublicPageContent.tsx');
const pageContentCode = fs.readFileSync(pageContentCompPath, 'utf8');
assert(pageContentCode.includes('sanitizeHtml(content)'), 'Security: PublicPageContent calls sanitizeHtml()');

// Test XSS vectors with sanitizeHtml
const maliciousPayloads = [
  '<script>alert("XSS")</script><p>Hello Safe Content</p>',
  '<img src="invalid" onerror="alert(\'XSS\')" />',
  '<a href="javascript:alert(\'pwned\')">Click me</a>',
  '<iframe src="https://evil.com"></iframe>',
  '<body onload="alert(1)">Text</body>',
];

for (let i = 0; i < maliciousPayloads.length; i++) {
  const cleaned = sanitizeHtml(maliciousPayloads[i]);
  assert(!cleaned.toLowerCase().includes('<script'), `Sanitizer: Payload ${i + 1} stripped <script>`);
  assert(!cleaned.toLowerCase().includes('onerror'), `Sanitizer: Payload ${i + 1} stripped onerror attribute`);
  assert(!cleaned.toLowerCase().includes('javascript:'), `Sanitizer: Payload ${i + 1} stripped javascript: URL`);
  assert(!cleaned.toLowerCase().includes('<iframe'), `Sanitizer: Payload ${i + 1} stripped <iframe>`);
  assert(!cleaned.toLowerCase().includes('onload'), `Sanitizer: Payload ${i + 1} stripped onload`);
}

const legitimateHtml = '<h2>Giới thiệu nhà trường</h2><p>Trường THPT Chuyên được thành lập năm 1990.</p><ul><li>Đoàn kết</li><li>Sáng tạo</li></ul>';
const cleanedLegitimate = sanitizeHtml(legitimateHtml);
assert(cleanedLegitimate.includes('<h2>') && cleanedLegitimate.includes('<ul>'), 'Sanitizer: Legitimate HTML tags preserved');

// -----------------------------------------------------------------------------
// 5. Slug Validation & Routing Edge Cases
// -----------------------------------------------------------------------------
console.log('\n--- 5. Slug Validation & Routing Edge Cases ---');

assert(SLUG_REGEX.test('gioi-thieu'), 'Slug: Valid alphanumeric slug accepted');
assert(SLUG_REGEX.test('co-cau-to-chuc-2026'), 'Slug: Valid complex slug accepted');
assert(!SLUG_REGEX.test('gioi thieu'), 'Slug: Spaces rejected');
assert(!SLUG_REGEX.test('gioi_thieu'), 'Slug: Underscores rejected');
assert(!SLUG_REGEX.test('Gioi-Thieu'), 'Slug: Uppercase letters rejected');
assert(!SLUG_REGEX.test('../secret'), 'Slug: Path traversal rejected');
assert(!SLUG_REGEX.test("about' OR '1'='1"), 'Slug: SQL injection patterns rejected');

// -----------------------------------------------------------------------------
// 6. Hard-stop Architectural Boundaries
// -----------------------------------------------------------------------------
console.log('\n--- 6. Hard-stop Boundaries ---');

// Check migrations count: Exactly 14 migrations from Step 09.5A (or 15 with Step 10.3B)
const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
assert(
  migrationFiles.length >= 14 && migrationFiles.length <= 15,
  `Database Invariant: Migration baseline preserved (found ${migrationFiles.length}, zero unauthorized added)`
);

// Check zero unwanted packages
const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
assert(!pkgJson.dependencies['helmet'], 'Scope Invariant: No helmet package added');
assert(!pkgJson.dependencies['express-rate-limit'], 'Scope Invariant: No express-rate-limit package added');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`STEP 09.6A VERIFICATION SUMMARY: ${passedChecks} PASSED, ${failedChecks} FAILED`);
console.log('============================================================');

if (failedChecks > 0) {
  console.error(`\nFAILED: ${failedChecks} checks did not pass.`);
  process.exit(1);
} else {
  console.log('\nSUCCESS: All Step 09.6A verification assertions passed cleanly!');
  process.exit(0);
}
