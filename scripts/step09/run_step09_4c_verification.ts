/**
 * Step 09.4C SEO Settings In-Memory Verification Script
 *
 * Tests:
 * 1. Zod schemas (valid/invalid inputs, URL validations, length limits, transforms)
 * 2. Immutable fields / allow-list / mass assignment protection (.strict())
 * 3. Invariants & Config (single-row id = 'default', baseline defaults)
 * 4. Domain helper utilities:
 *    - formatMetaTitle (%s pattern, fallback, object overload)
 *    - generateRobotsTxt (custom content, dynamic sitemap URL, default rules)
 *    - buildMetaTags (og tags, relative path resolution, JSON-LD structured data)
 * 5. Error taxonomy (SeoServiceError codes)
 * 6. Service function exports & signature verification
 * 7. Hook function exports & signature verification
 * 8. Static code audit (zero direct Supabase in hooks, zero service_role, zero any, zero ts-ignore)
 */

import fs from 'fs';
import path from 'path';
import {
  seoSettingsUpdateSchema,
} from '../../src/modules/seo/schemas/seoSchema';
import {
  DEFAULT_SEO_SETTINGS,
  SEO_SINGLETON_ID,
  SEO_LIMITS,
  SEO_QUERY_KEYS,
} from '../../src/modules/seo/config/seoConfig';
import {
  SeoServiceError,
  formatMetaTitle,
  generateRobotsTxt,
  buildMetaTags,
} from '../../src/services/seoService';
import * as seoService from '../../src/services/seoService';
import * as seoHooks from '../../src/modules/seo/hooks';
import type { SeoSettings } from '../../src/types/seo';

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
console.log('RUNNING STEP 09.4C SEO SETTINGS VERIFICATION');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// 1. Zod Schemas & Validation
// -----------------------------------------------------------------------------
console.log('--- 1. SEO Settings Schemas & Validation ---');

const validUpdate = seoSettingsUpdateSchema.safeParse({
  meta_title_pattern: '%s | THPT Chuyên Hà Nội',
  meta_description_default: 'Cổng thông tin giáo dục chính thức của trường.',
  meta_keywords_default: 'trường học, giáo dục, thông báo',
  og_image_default: 'https://cdn.school.edu.vn/og-banner.png',
  canonical_base_url: 'https://school.edu.vn',
  robots_txt_content: 'User-agent: *\nAllow: /',
  sitemap_enabled: true,
  structured_data_enabled: true,
  google_site_verification: 'google-token-12345',
  bing_site_verification: 'bing-token-67890',
});
assert(validUpdate.success, 'TC-01: Valid full SEO update payload parses successfully');

// Trailing slash stripping in canonical_base_url
const canonicalTrailingSlash = seoSettingsUpdateSchema.safeParse({
  canonical_base_url: 'https://school.edu.vn///',
});
assert(
  canonicalTrailingSlash.success &&
    canonicalTrailingSlash.data.canonical_base_url === 'https://school.edu.vn',
  'TC-02: canonical_base_url strips trailing slashes'
);

// Relative path for og_image_default
const relativeOgImage = seoSettingsUpdateSchema.safeParse({
  og_image_default: '/images/og/default-share.jpg',
});
assert(
  relativeOgImage.success &&
    relativeOgImage.data.og_image_default === '/images/og/default-share.jpg',
  'TC-03: og_image_default accepts root-relative image paths'
);

// Empty strings transform to null
const emptyStringsTransform = seoSettingsUpdateSchema.safeParse({
  meta_description_default: '   ',
  canonical_base_url: '',
  google_site_verification: '',
});
assert(
  emptyStringsTransform.success &&
    emptyStringsTransform.data.meta_description_default === null &&
    emptyStringsTransform.data.canonical_base_url === null &&
    emptyStringsTransform.data.google_site_verification === null,
  'TC-04: Empty string values are cleanly transformed to null'
);

// Invalid canonical URL (not http/https)
const invalidUrl = seoSettingsUpdateSchema.safeParse({
  canonical_base_url: 'ftp://invalidscheme.com',
});
assert(!invalidUrl.success, 'TC-05: Non-HTTP(S) canonical_base_url is rejected');

// Invalid OG image URL
const invalidOg = seoSettingsUpdateSchema.safeParse({
  og_image_default: 'javascript:alert(1)',
});
assert(!invalidOg.success, 'TC-06: Malicious scheme in og_image_default is rejected');

// Exceeding maximum lengths
const tooLongTitle = seoSettingsUpdateSchema.safeParse({
  meta_title_pattern: 'A'.repeat(SEO_LIMITS.TITLE_PATTERN_MAX + 1),
});
assert(!tooLongTitle.success, 'TC-07: meta_title_pattern exceeding max length is rejected');

const tooLongDescription = seoSettingsUpdateSchema.safeParse({
  meta_description_default: 'B'.repeat(SEO_LIMITS.DESCRIPTION_MAX + 1),
});
assert(!tooLongDescription.success, 'TC-08: meta_description_default exceeding max length is rejected');

// Mass assignment / immutable fields protection (.strict())
const tamperingAttempt = seoSettingsUpdateSchema.safeParse({
  meta_title_pattern: '%s | New Title',
  id: 'hacked-id',
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2020-01-01T00:00:00Z',
});
assert(!tamperingAttempt.success, 'TC-09: Mass assignment attempts with id/created_at are strictly rejected');

// -----------------------------------------------------------------------------
// 2. Invariants & Configuration
// -----------------------------------------------------------------------------
console.log('\n--- 2. Invariants & Baseline Config ---');

assert(SEO_SINGLETON_ID === 'default', 'TC-10: SEO_SINGLETON_ID is strictly "default"');
assert(DEFAULT_SEO_SETTINGS.id === 'default', 'TC-11: DEFAULT_SEO_SETTINGS.id is "default"');
assert(DEFAULT_SEO_SETTINGS.sitemap_enabled === true, 'TC-12: Baseline sitemap is enabled by default');
assert(DEFAULT_SEO_SETTINGS.structured_data_enabled === true, 'TC-13: Baseline structured data enabled by default');
assert(
  Array.isArray(SEO_QUERY_KEYS.settings()) &&
    SEO_QUERY_KEYS.settings()[0] === 'seo' &&
    SEO_QUERY_KEYS.settings()[1] === 'settings',
  'TC-14: TanStack Query key is deterministically ["seo", "settings"]'
);

// -----------------------------------------------------------------------------
// 3. Domain Helper Utilities
// -----------------------------------------------------------------------------
console.log('\n--- 3. Domain Helper Utilities ---');

// formatMetaTitle
const titleWithPattern = formatMetaTitle('%s | THPT Chuyên Amsterdam', 'Lễ khai giảng năm học mới');
assert(
  titleWithPattern === 'Lễ khai giảng năm học mới | THPT Chuyên Amsterdam',
  'TC-15: formatMetaTitle replaces %s with page title'
);

const titleWithoutPattern = formatMetaTitle('THPT Chuyên Amsterdam', 'Thông báo tuyển sinh');
assert(
  titleWithoutPattern === 'Thông báo tuyển sinh | THPT Chuyên Amsterdam',
  'TC-16: formatMetaTitle handles patterns missing %s gracefully'
);

const homepageTitle = formatMetaTitle('%s | THPT Chuyên Amsterdam', undefined);
assert(
  homepageTitle === 'THPT Chuyên Amsterdam',
  'TC-17: formatMetaTitle strips "%s | " when no page title is provided'
);

const objectOverloadTitle = formatMetaTitle({
  pattern: '%s - Trường THPT',
  pageTitle: 'Giới thiệu',
});
assert(
  objectOverloadTitle === 'Giới thiệu - Trường THPT',
  'TC-18: formatMetaTitle supports FormatTitleOptions object overload'
);

// generateRobotsTxt
const defaultRobots = generateRobotsTxt({ sitemap_enabled: true });
assert(
  defaultRobots.includes('User-agent: *') &&
    defaultRobots.includes('Allow: /') &&
    defaultRobots.includes('Disallow: /admin/') &&
    defaultRobots.includes('Sitemap: /sitemap.xml'),
  'TC-19: generateRobotsTxt outputs standard crawler directives with /sitemap.xml'
);

const customCanonicalRobots = generateRobotsTxt({
  sitemap_enabled: true,
  canonical_base_url: 'https://thptamsterdam.edu.vn',
});
assert(
  customCanonicalRobots.includes('Sitemap: https://thptamsterdam.edu.vn/sitemap.xml'),
  'TC-20: generateRobotsTxt outputs absolute sitemap URL when canonical_base_url is configured'
);

const customOverrideRobots = generateRobotsTxt({
  robots_txt_content: 'User-agent: Googlebot\nAllow: /\nUser-agent: *\nDisallow: /',
});
assert(
  customOverrideRobots === 'User-agent: Googlebot\nAllow: /\nUser-agent: *\nDisallow: /',
  'TC-21: generateRobotsTxt respects custom robots_txt_content override'
);

// buildMetaTags
const sampleSettings: SeoSettings = {
  id: 'default',
  meta_title_pattern: '%s | Cổng thông tin trường',
  meta_description_default: 'Mô tả chung',
  meta_keywords_default: 'tin tức, bài viết',
  og_image_default: '/images/default-og.jpg',
  canonical_base_url: 'https://school.edu.vn',
  robots_txt_content: null,
  sitemap_enabled: true,
  structured_data_enabled: true,
  google_site_verification: 'google-code-xyz',
  bing_site_verification: 'bing-code-abc',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const metaTags = buildMetaTags(sampleSettings, {
  title: 'Bài viết số 1',
  description: 'Mô tả bài viết số 1',
  canonicalPath: 'tin-tuc/bai-viet-1',
  ogImage: '/images/bai-viet-1.jpg',
});

assert(metaTags.title === 'Bài viết số 1 | Cổng thông tin trường', 'TC-22: buildMetaTags computes formatted title');
assert(metaTags.ogTitle === metaTags.title, 'TC-23: buildMetaTags syncs ogTitle with title');
assert(metaTags.description === 'Mô tả bài viết số 1', 'TC-24: buildMetaTags overrides default description');
assert(
  metaTags.canonicalUrl === 'https://school.edu.vn/tin-tuc/bai-viet-1',
  'TC-25: buildMetaTags constructs absolute canonicalUrl'
);
assert(
  metaTags.ogImage === 'https://school.edu.vn/images/bai-viet-1.jpg',
  'TC-26: buildMetaTags resolves relative ogImage to absolute URL'
);
assert(
  metaTags.googleSiteVerification === 'google-code-xyz' &&
    metaTags.bingSiteVerification === 'bing-code-abc',
  'TC-27: buildMetaTags includes search engine verification tokens'
);
assert(
  typeof metaTags.structuredDataJsonLd === 'string' &&
    metaTags.structuredDataJsonLd.includes('"@type":"WebSite"'),
  'TC-28: buildMetaTags generates valid JSON-LD schema when enabled'
);

// -----------------------------------------------------------------------------
// 4. Error Taxonomy
// -----------------------------------------------------------------------------
console.log('\n--- 4. Error Taxonomy ---');

const testError = new SeoServiceError('Quyền truy cập bị từ chối', 'UNAUTHORIZED', { code: '42501' });
assert(testError instanceof Error, 'TC-29: SeoServiceError inherits from Error');
assert(testError.name === 'SeoServiceError', 'TC-30: SeoServiceError name is correct');
assert(testError.code === 'UNAUTHORIZED', 'TC-31: SeoServiceError code is stored');
assert(
  (testError.originalError as { code: string })?.code === '42501',
  'TC-32: SeoServiceError preserves original error context'
);

// -----------------------------------------------------------------------------
// 5. Service & Hook Exports
// -----------------------------------------------------------------------------
console.log('\n--- 5. Service & Hook Exports ---');

assert(typeof seoService.getSeoSettings === 'function', 'TC-33: getSeoSettings is exported');
assert(typeof seoService.updateSeoSettings === 'function', 'TC-34: updateSeoSettings is exported');
assert(typeof seoService.formatMetaTitle === 'function', 'TC-35: formatMetaTitle is exported');
assert(typeof seoService.generateRobotsTxt === 'function', 'TC-36: generateRobotsTxt is exported');
assert(typeof seoService.buildMetaTags === 'function', 'TC-37: buildMetaTags is exported');
assert(typeof seoHooks.useSeoSettings === 'function', 'TC-38: useSeoSettings hook is exported');
assert(typeof seoHooks.useUpdateSeoSettings === 'function', 'TC-39: useUpdateSeoSettings hook is exported');

// -----------------------------------------------------------------------------
// 6. Static Code Audit
// -----------------------------------------------------------------------------
console.log('\n--- 6. Static Code Security & Architecture Audit ---');

const hooksDir = path.resolve('src/modules/seo/hooks');
const hookFiles = fs.readdirSync(hooksDir).filter((f) => f.endsWith('.ts'));

let directSupabaseInHooks = false;
for (const file of hookFiles) {
  const content = fs.readFileSync(path.join(hooksDir, file), 'utf-8');
  if (content.includes("from '../lib/supabase'") || content.includes("from '../../lib/supabase'")) {
    directSupabaseInHooks = true;
    console.error(`[AUDIT FAIL] Direct Supabase import found in hook ${file}`);
  }
}
assert(!directSupabaseInHooks, 'TC-40: Static Audit - Zero direct Supabase imports in hooks');

const allSeoFiles = [
  'src/types/seo.ts',
  'src/services/seoService.ts',
  'src/modules/seo/config/seoConfig.ts',
  'src/modules/seo/schemas/seoSchema.ts',
  'src/modules/seo/services/seoService.ts',
  'src/modules/seo/hooks/useSeoSettings.ts',
  'src/modules/seo/hooks/useUpdateSeoSettings.ts',
  'src/modules/seo/hooks/index.ts',
  'src/modules/seo/index.ts',
];

let serviceRoleFound = false;
let anyTypeFound = false;
let tsIgnoreFound = false;

for (const relPath of allSeoFiles) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf-8');

  if (content.includes('service_role') || content.includes('SERVICE_ROLE')) {
    serviceRoleFound = true;
    console.error(`[AUDIT FAIL] service_role found in ${relPath}`);
  }

  // Check for bare ": any" or "<any>" (avoiding words like 'many', 'company')
  const anyRegex = /:\s*any\b|<any>/;
  if (anyRegex.test(content)) {
    anyTypeFound = true;
    console.error(`[AUDIT FAIL] 'any' type found in ${relPath}`);
  }

  if (content.includes('@ts-ignore') || content.includes('@ts-expect-error')) {
    tsIgnoreFound = true;
    console.error(`[AUDIT FAIL] ts-ignore/ts-expect-error found in ${relPath}`);
  }
}

assert(!serviceRoleFound, 'TC-41: Static Audit - Zero service_role occurrences in SEO files');
assert(!anyTypeFound, 'TC-42: Static Audit - Zero forbidden "any" type definitions');
assert(!tsIgnoreFound, 'TC-43: Static Audit - Zero ts-ignore or ts-expect-error suppressions');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`VERIFICATION RESULT: ${passedChecks} PASSED, ${failedChecks} FAILED`);
console.log('============================================================');

if (failedChecks > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
