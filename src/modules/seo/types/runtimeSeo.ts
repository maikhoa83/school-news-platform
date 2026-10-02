/**
 * Public SEO Runtime Type Definitions
 * School News Platform - Step 09.6C
 *
 * Architecture:
 * Public UI / Page -> PublicSeoContext -> seoRuntimeUtils -> DOM Head
 *
 * Invariants:
 * - Single code-path for HTML Head tag lifecycle
 * - Authoritative single-installation school identity & SEO configuration
 * - Strict XSS sanitization and URL safety
 */

import type { SeoSettings } from '../../../types/seo';
import type { SchoolIdentityConfig } from '../../../types/config';
import type { Page, PageWithRelations } from '../../../types/page';

/**
 * Context payload provided by route-level page views (e.g. /page/:slug, /news/:slug)
 */
export interface PageSeoPayload {
  page?: Page | PageWithRelations | null;
  customTitle?: string | null;
  customDescription?: string | null;
  customKeywords?: string | null;
  customOgImage?: string | null;
  canonicalPath?: string | null;
  isNotFound?: boolean;
  isError?: boolean;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
}

/**
 * Aggregate input parameters for the pure SEO resolver function
 */
export interface PublicSeoContextInput {
  seoSettings?: SeoSettings | null;
  schoolIdentity?: SchoolIdentityConfig | null;
  pathname: string;
  origin?: string;
  pagePayload?: PageSeoPayload | null;
}

/**
 * Resolved, sanitized, and fully prepared metadata ready for DOM injection
 */
export interface ResolvedPublicSeoMetadata {
  title: string;
  description: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  robots: string;
  ogTitle: string;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: 'website' | 'article';
  ogSiteName: string | null;
  twitterCard: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string | null;
  twitterImage: string | null;
  googleSiteVerification: string | null;
  bingSiteVerification: string | null;
  structuredDataJsonLd: string | null;
}
