/**
 * SEO Settings Configuration & Defaults
 * School News Platform - Step 09.4C
 *
 * Invariant:
 * Single-row ID is always 'default'.
 */

import type { SeoSettings } from '../types/seo';

/**
 * Single-row ID constant matching PostgreSQL CHECK (id = 'default')
 */
export const SEO_SINGLETON_ID = 'default' as const;

/**
 * Field length and constraint limits
 */
export const SEO_LIMITS = {
  TITLE_PATTERN_MAX: 255,
  DESCRIPTION_MAX: 500,
  KEYWORDS_MAX: 500,
  URL_MAX: 2048,
  ROBOTS_TXT_MAX: 5000,
  VERIFICATION_TOKEN_MAX: 255,
} as const;

/**
 * Fallback baseline SEO settings when offline or initial seed
 */
export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  id: SEO_SINGLETON_ID,
  meta_title_pattern: '%s | Cổng thông tin điện tử trường học',
  meta_description_default:
    'Cổng thông tin điện tử chính thức của nhà trường, cung cấp tin tức, thông báo, văn bản điều hành và các hoạt động giáo dục.',
  meta_keywords_default: 'trường học, giáo dục, tin tức, thông báo, cổng thông tin',
  og_image_default: null,
  canonical_base_url: null,
  robots_txt_content: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: /sitemap.xml',
  sitemap_enabled: true,
  structured_data_enabled: true,
  google_site_verification: null,
  bing_site_verification: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

/**
 * TanStack Query Cache Keys
 */
export const SEO_QUERY_KEYS = {
  all: ['seo'] as const,
  settings: () => [...SEO_QUERY_KEYS.all, 'settings'] as const,
};
