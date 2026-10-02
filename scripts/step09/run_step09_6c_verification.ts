/**
 * Step 09.6C Public SEO Runtime Integration Verification Script
 * School News Platform
 *
 * Validates:
 * 1. File Structure & Component/Hook Exports:
 *    - runtimeSeo.ts types
 *    - seoRuntimeUtils.ts (resolvePublicSeo, applyPublicSeoMetadata, isSafeUrl, resolveAbsoluteUrl, serializeJsonLd)
 *    - PublicSeoContext.tsx (PublicSeoProvider, usePublicSeo, useSetPublicSeo)
 *    - PublicSeoRuntime.tsx
 * 2. Pure Resolution Logic & Precedence Hierarchy (resolvePublicSeo):
 *    - Title: page.meta_title -> page.title -> pattern formatting -> fallback site name
 *    - Homepage (%s stripped/cleaned) vs Standard Page vs 404 vs Error states
 *    - Description: page.meta_description -> page.excerpt -> default_description -> slogan -> null
 *    - Keywords: page.meta_keywords -> default_keywords -> null
 *    - Canonical URL: page.canonical_url -> base + path -> normalization
 *    - Robots directive: no_index, 404, error -> 'noindex, nofollow' vs default 'index, follow'
 *    - Open Graph & Twitter Cards: image resolution, card type, og:site_name, og:type
 *    - Structured Data: WebSite, EducationalOrganization, WebPage schemas
 * 3. Security, XSS Prevention & Protocol Safety:
 *    - Dangerous protocols rejected (javascript:, data:, vbscript:, file:)
 *    - JSON-LD script breakout prevention (neutralizes </script>)
 * 4. Architecture & Static Code Audit:
 *    - PublicShell integrates PublicSeoProvider
 *    - PublicPage consumes useSetPublicSeo hook (zero manual document.head manipulation)
 *    - Zero direct supabase.from calls in public SEO components
 *    - Zero @ts-ignore annotations
 *    - Zero service_role key references
 * 5. Hard Boundary Invariants:
 *    - Exactly 14 database migrations (zero new migrations in 09.6C)
 *    - Zero unwanted third-party dependencies added
 */

import fs from 'fs';
import path from 'path';
import {
  resolvePublicSeo,
  isSafeUrl,
  resolveAbsoluteUrl,
  serializeJsonLd,
} from '../../src/modules/seo/utils/seoRuntimeUtils';
import * as seoModule from '../../src/modules/seo';
import type { SeoSettings } from '../../src/types/seo';
import type { SchoolIdentityConfig } from '../../src/types/config';
import type { PageWithRelations } from '../../src/types/page';

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
console.log('RUNNING STEP 09.6C PUBLIC SEO RUNTIME INTEGRATION VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. File Structure & Component/Hook Exports Check
// -----------------------------------------------------------------------------
console.log('--- 1. File Structure & Module Exports ---');

const expectedFiles = [
  'src/modules/seo/types/runtimeSeo.ts',
  'src/modules/seo/utils/seoRuntimeUtils.ts',
  'src/modules/seo/context/PublicSeoContext.tsx',
  'src/modules/seo/components/PublicSeoRuntime.tsx',
];

for (const filePath of expectedFiles) {
  const fullPath = path.resolve(process.cwd(), filePath);
  assert(fs.existsSync(fullPath), `File exists: ${filePath}`);
}

assert(typeof seoModule.resolvePublicSeo === 'function', 'Export: resolvePublicSeo is a pure utility function');
assert(typeof seoModule.applyPublicSeoMetadata === 'function', 'Export: applyPublicSeoMetadata is a DOM synchronizer');
assert(typeof seoModule.isSafeUrl === 'function', 'Export: isSafeUrl is a security validator');
assert(typeof seoModule.resolveAbsoluteUrl === 'function', 'Export: resolveAbsoluteUrl is a URL resolver');
assert(typeof seoModule.serializeJsonLd === 'function', 'Export: serializeJsonLd is an XSS-safe serializer');
assert(typeof seoModule.PublicSeoProvider === 'function', 'Export: PublicSeoProvider is a React component');
assert(typeof seoModule.PublicSeoRuntime === 'function', 'Export: PublicSeoRuntime is a React component');
assert(typeof seoModule.usePublicSeo === 'function', 'Export: usePublicSeo is a hook');
assert(typeof seoModule.useSetPublicSeo === 'function', 'Export: useSetPublicSeo is a hook');

// -----------------------------------------------------------------------------
// 2. Precedence & Pure Resolution Logic (resolvePublicSeo)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Precedence & Metadata Fallback Hierarchy ---');

const mockSeoSettings: SeoSettings = {
  id: 'default',
  meta_title_pattern: '%s | THPT Chuyên Hà Nội - Amsterdam',
  meta_description_default: 'Cổng thông tin điện tử chính thức của nhà trường.',
  meta_keywords_default: 'giáo dục, trường chuyên, hà nội',
  og_image_default: '/images/default-og.jpg',
  canonical_base_url: 'https://hn-ams.edu.vn',
  robots_txt_content: null,
  sitemap_enabled: true,
  structured_data_enabled: true,
  google_site_verification: 'google-token-xyz',
  bing_site_verification: 'bing-token-abc',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockSchoolIdentity: SchoolIdentityConfig = {
  school_name: 'Trường THPT Chuyên Hà Nội - Amsterdam',
  short_name: 'HN-Ams',
  slogan: 'Nâng tầm tri thức, vươn tới tương lai',
  logo_url: '/logo.png',
  favicon_url: '/favicon.ico',
  primary_color: '#1e3a8a',
  secondary_color: '#d97706',
  phone: '024 3846 1234',
  email: 'c3amsterdam@hanoiedu.vn',
  address: 'Số 1 Hoàng Minh Giám, Cầu Giấy, Hà Nội',
  website: 'https://hn-ams.edu.vn',
  social_links: {
    facebook: 'https://facebook.com/hnamsterdam',
  },
};

const mockPage: PageWithRelations = {
  id: 'page-101',
  title: 'Giới thiệu lịch sử nhà trường',
  slug: 'lich-su-nha-truong',
  content: '<p>Trường được thành lập năm 1985...</p>',
  excerpt: 'Tóm tắt lịch sử 40 năm xây dựng và phát triển.',
  featured_image: '/images/history-banner.jpg',
  parent_id: null,
  template: 'default',
  status: 'published',
  sort_order: 1,
  view_count: 500,
  author_id: 'user-1',
  published_at: '2026-01-01T08:00:00.000Z',
  published_by: 'user-1',
  meta_title: 'Lịch sử 40 năm HN-Ams',
  meta_description: 'Tìm hiểu chặng đường 40 năm thành lập và phát triển của trường Amsterdam.',
  meta_keywords: 'lịch sử, amsterdam, 40 năm',
  og_image: '/images/og/lich-su-og.jpg',
  canonical_url: null,
  no_index: false,
  created_at: '2026-01-01T07:00:00.000Z',
  updated_at: '2026-01-02T10:00:00.000Z',
};

// Test A: Full Static Page resolution
const pageResult = resolvePublicSeo({
  seoSettings: mockSeoSettings,
  schoolIdentity: mockSchoolIdentity,
  pathname: '/page/lich-su-nha-truong',
  pagePayload: {
    page: mockPage,
  },
});

assert(
  pageResult.title === 'Lịch sử 40 năm HN-Ams | THPT Chuyên Hà Nội - Amsterdam',
  'Title Precedence: page.meta_title takes priority over page.title in pattern formatting'
);
assert(
  pageResult.description === 'Tìm hiểu chặng đường 40 năm thành lập và phát triển của trường Amsterdam.',
  'Description Precedence: page.meta_description takes priority over page.excerpt'
);
assert(
  pageResult.keywords === 'lịch sử, amsterdam, 40 năm',
  'Keywords Precedence: page.meta_keywords takes priority over default_keywords'
);
assert(
  pageResult.canonicalUrl === 'https://hn-ams.edu.vn/page/lich-su-nha-truong',
  'Canonical URL: Combines base URL with page path'
);
assert(
  pageResult.ogImage === 'https://hn-ams.edu.vn/images/og/lich-su-og.jpg',
  'OG Image Resolution: Prepend canonical base URL to relative page.og_image'
);
assert(pageResult.robots === 'index, follow', 'Robots: Regular published page is index, follow');
assert(pageResult.ogType === 'article', 'OG Type: Static page resolves to article');
assert(pageResult.twitterCard === 'summary_large_image', 'Twitter Card: summary_large_image when image is present');
assert(pageResult.googleSiteVerification === 'google-token-xyz', 'Verification: Google site verification present');
assert(pageResult.bingSiteVerification === 'bing-token-abc', 'Verification: Bing site verification present');

// Test B: Page Title Fallback (meta_title is null)
const pageNoMetaTitle: PageWithRelations = {
  ...mockPage,
  meta_title: null,
  meta_description: null,
  meta_keywords: null,
  og_image: null,
};
const pageFallbackResult = resolvePublicSeo({
  seoSettings: mockSeoSettings,
  schoolIdentity: mockSchoolIdentity,
  pathname: '/page/lich-su-nha-truong',
  pagePayload: { page: pageNoMetaTitle },
});

assert(
  pageFallbackResult.title === 'Giới thiệu lịch sử nhà trường | THPT Chuyên Hà Nội - Amsterdam',
  'Title Fallback: page.title used when meta_title is null'
);
assert(
  pageFallbackResult.description === 'Tóm tắt lịch sử 40 năm xây dựng và phát triển.',
  'Description Fallback: page.excerpt used when meta_description is null'
);
assert(
  pageFallbackResult.keywords === 'giáo dục, trường chuyên, hà nội',
  'Keywords Fallback: seoSettings.meta_keywords_default used when page.meta_keywords is null'
);
assert(
  pageFallbackResult.ogImage === 'https://hn-ams.edu.vn/images/history-banner.jpg',
  'OG Image Fallback: page.featured_image used when page.og_image is null'
);

// Test C: Homepage Resolution
const homepageResult = resolvePublicSeo({
  seoSettings: mockSeoSettings,
  schoolIdentity: mockSchoolIdentity,
  pathname: '/',
});

assert(
  homepageResult.title === 'THPT Chuyên Hà Nội - Amsterdam',
  'Homepage Title: %s token stripped cleanly from meta_title_pattern'
);
assert(
  homepageResult.description === 'Cổng thông tin điện tử chính thức của nhà trường.',
  'Homepage Description: Uses meta_description_default'
);
assert(
  homepageResult.canonicalUrl === 'https://hn-ams.edu.vn',
  'Homepage Canonical: Clean base URL without trailing slash'
);
assert(homepageResult.ogType === 'website', 'Homepage OG Type: Resolves to website');

// Test D: 404 Not Found Page Resolution
const notFoundResult = resolvePublicSeo({
  seoSettings: mockSeoSettings,
  schoolIdentity: mockSchoolIdentity,
  pathname: '/page/non-existent-slug',
  pagePayload: {
    isNotFound: true,
  },
});

assert(
  notFoundResult.title === '404 - Không tìm thấy trang | THPT Chuyên Hà Nội - Amsterdam',
  '404 Title: Pattern formatted with 404 message'
);
assert(notFoundResult.robots === 'noindex, nofollow', '404 Robots: Enforces noindex, nofollow');
assert(notFoundResult.structuredDataJsonLd === null, '404 Schema: Structured data omitted on 404');

// Test E: no_index Page Setting
const noIndexPage: PageWithRelations = {
  ...mockPage,
  no_index: true,
};
const noIndexResult = resolvePublicSeo({
  seoSettings: mockSeoSettings,
  schoolIdentity: mockSchoolIdentity,
  pathname: '/page/lich-su-nha-truong',
  pagePayload: { page: noIndexPage },
});
assert(noIndexResult.robots === 'noindex, nofollow', 'Page no_index: Respects page.no_index = true');

// Test F: Custom Canonical URL on Page
const customCanonicalPage: PageWithRelations = {
  ...mockPage,
  canonical_url: 'https://external-archive.org/original-post',
};
const customCanonicalResult = resolvePublicSeo({
  seoSettings: mockSeoSettings,
  schoolIdentity: mockSchoolIdentity,
  pathname: '/page/lich-su-nha-truong',
  pagePayload: { page: customCanonicalPage },
});
assert(
  customCanonicalResult.canonicalUrl === 'https://external-archive.org/original-post',
  'Custom Canonical: Preserves explicit page.canonical_url'
);

// -----------------------------------------------------------------------------
// 3. Security, XSS Prevention & Protocol Safety
// -----------------------------------------------------------------------------
console.log('\n--- 3. Security, Protocol Safety & XSS Neutralization ---');

assert(!isSafeUrl('javascript:alert(document.cookie)'), 'Security: Rejects javascript: protocol');
assert(!isSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), 'Security: Rejects data: URI protocol');
assert(!isSafeUrl('vbscript:msgbox("XSS")'), 'Security: Rejects vbscript: protocol');
assert(!isSafeUrl('file:///etc/passwd'), 'Security: Rejects file: protocol');
assert(isSafeUrl('https://hn-ams.edu.vn/page/gioi-thieu'), 'Security: Accepts safe https URL');
assert(isSafeUrl('/images/logo.png'), 'Security: Accepts safe relative path');

// Test malicious canonical URL injection in pagePayload
const maliciousPage: PageWithRelations = {
  ...mockPage,
  canonical_url: 'javascript:alert(1)',
  og_image: 'javascript:alert(2)',
};
const maliciousResult = resolvePublicSeo({
  seoSettings: mockSeoSettings,
  schoolIdentity: mockSchoolIdentity,
  pathname: '/page/malicious',
  pagePayload: { page: maliciousPage },
});
assert(
  maliciousResult.canonicalUrl !== 'javascript:alert(1)' &&
    maliciousResult.canonicalUrl === 'https://hn-ams.edu.vn/page/malicious',
  'Security: Malicious javascript: canonical_url sanitized and replaced with safe fallback'
);

// Test JSON-LD XSS neutralization
const hostileSchemaData = {
  name: '</script><script>alert("XSS")</script>',
  description: 'Attack vector',
};
const serialized = serializeJsonLd(hostileSchemaData);
assert(!serialized.includes('</script>'), 'XSS: serializeJsonLd neutralizes </script> into \\u003c/script\\u003e');
assert(serialized.includes('\\u003c/script\\u003e'), 'XSS: Replaced with safe unicode escape \\u003c');

// Check structured data graph content in valid page
assert(pageResult.structuredDataJsonLd !== null, 'Schema.org: Structured data JSON-LD generated');
const parsedGraph = JSON.parse(pageResult.structuredDataJsonLd || '{}');
assert(parsedGraph['@context'] === 'https://schema.org', 'Schema.org: @context is https://schema.org');
assert(Array.isArray(parsedGraph['@graph']), 'Schema.org: Contains @graph array');

const typesInGraph = parsedGraph['@graph'].map((item: { '@type': string }) => item['@type']);
assert(typesInGraph.includes('WebSite'), 'Schema.org: Graph contains WebSite type');
assert(typesInGraph.includes('EducationalOrganization'), 'Schema.org: Graph contains EducationalOrganization type');
assert(typesInGraph.includes('WebPage'), 'Schema.org: Graph contains WebPage type');

// -----------------------------------------------------------------------------
// 4. Architecture & Static Code Audit
// -----------------------------------------------------------------------------
console.log('\n--- 4. Architecture & Static Code Audit ---');

const filesToAudit = [
  'src/modules/seo/types/runtimeSeo.ts',
  'src/modules/seo/utils/seoRuntimeUtils.ts',
  'src/modules/seo/context/PublicSeoContext.tsx',
  'src/modules/seo/components/PublicSeoRuntime.tsx',
];

for (const relPath of filesToAudit) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  assert(!content.includes('supabase.from'), `Security: ${relPath} contains no direct supabase.from calls`);
  assert(!content.includes('@ts-ignore'), `Quality: ${relPath} contains zero @ts-ignore`);
  assert(!content.includes('service_role'), `Security: ${relPath} contains zero service_role references`);
}

// Audit PublicShell integration
const shellPath = path.resolve(process.cwd(), 'src/layouts/public/PublicShell.tsx');
const shellContent = fs.readFileSync(shellPath, 'utf8');
assert(shellContent.includes('PublicSeoProvider'), 'Architecture: PublicShell wraps content with PublicSeoProvider');

// Audit PublicPage integration
const publicPagePath = path.resolve(process.cwd(), 'src/modules/pages/pages/PublicPage.tsx');
const publicPageContent = fs.readFileSync(publicPagePath, 'utf8');
assert(publicPageContent.includes('useSetPublicSeo'), 'Architecture: PublicPage delegates SEO to useSetPublicSeo hook');
assert(
  !publicPageContent.includes('document.head.appendChild'),
  'Architecture: PublicPage contains zero direct document.head manipulation'
);

// -----------------------------------------------------------------------------
// 5. Hard Boundary Enforcement
// -----------------------------------------------------------------------------
console.log('\n--- 5. Hard Boundary Enforcement ---');

// Check database migrations count (baseline 14 or 15 with Step 10.3B)
const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
assert(
  migrationFiles.length >= 14 && migrationFiles.length <= 15,
  `Database Invariant: Migration baseline preserved (found ${migrationFiles.length}, zero unauthorized added in 09.6C)`
);

// Check zero unwanted packages
const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
assert(!pkgJson.dependencies['react-helmet'], 'Scope Invariant: No react-helmet added');
assert(!pkgJson.dependencies['react-helmet-async'], 'Scope Invariant: No react-helmet-async added');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`STEP 09.6C VERIFICATION SUMMARY: ${passedChecks} PASSED, ${failedChecks} FAILED`);
console.log('============================================================');

if (failedChecks > 0) {
  console.error(`\nFAILED: ${failedChecks} checks did not pass.`);
  process.exit(1);
} else {
  console.log('\nSUCCESS: All Step 09.6C verification assertions passed cleanly!');
  process.exit(0);
}
