/**
 * SEO Settings Domain Types
 * School News Platform - Step 09.4C
 *
 * Enforces single-row invariant (`id = 'default'`) and strict field typing
 * matching PostgreSQL public.seo_settings schema.
 */

export interface SeoSettings {
  id: 'default' | string;
  meta_title_pattern: string;
  meta_description_default: string | null;
  meta_keywords_default: string | null;
  og_image_default: string | null;
  canonical_base_url: string | null;
  robots_txt_content: string | null;
  sitemap_enabled: boolean;
  structured_data_enabled: boolean;
  google_site_verification: string | null;
  bing_site_verification: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Allow-list for updating SEO settings.
 * Immutable fields (id, created_at, updated_at) are explicitly omitted to prevent mass assignment.
 */
export interface SeoSettingsUpdateInput {
  meta_title_pattern?: string;
  meta_description_default?: string | null;
  meta_keywords_default?: string | null;
  og_image_default?: string | null;
  canonical_base_url?: string | null;
  robots_txt_content?: string | null;
  sitemap_enabled?: boolean;
  structured_data_enabled?: boolean;
  google_site_verification?: string | null;
  bing_site_verification?: string | null;
}

/**
 * Computed meta tags for HTML head injection
 */
export interface SeoMetaTags {
  title: string;
  description: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  robots: string;
  googleSiteVerification: string | null;
  bingSiteVerification: string | null;
  structuredDataJsonLd: string | null;
}

/**
 * Options for title formatting
 */
export interface FormatTitleOptions {
  pattern?: string;
  pageTitle?: string;
  fallbackSiteName?: string;
}
