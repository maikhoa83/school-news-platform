/**
 * Public SEO Runtime Pure Utilities & DOM Synchronizer
 * School News Platform - Step 09.6C
 *
 * Responsibilities:
 * 1. URL Protocol Validation & Safe Absolute URL Resolution (XSS & Open-Redirect Prevention)
 * 2. Safe JSON-LD Serialization (Script Tag Breakout Prevention)
 * 3. Pure Precedence & Fallback Metadata Resolution (resolvePublicSeo)
 * 4. Authoritative HTML Head DOM Application & Cleanup (applyPublicSeoMetadata)
 */

import { formatMetaTitle } from '../../../services/seoService';
import { DEFAULT_SEO_SETTINGS } from '../config/seoConfig';
import type {
  PublicSeoContextInput,
  ResolvedPublicSeoMetadata,
} from '../types/runtimeSeo';

// ==============================================================================
// 1. SECURITY & URL VALIDATION
// ==============================================================================

const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Checks if a URL string is safe to render in href/src/content attributes.
 * Prevents javascript: and dangerous pseudo-protocols.
 */
export function isSafeUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(protocol)) return false;
  }
  return true;
}

/**
 * Resolves a potentially relative path against an absolute base URL.
 * Normalizes double slashes without breaking the protocol (https://).
 */
export function resolveAbsoluteUrl(
  url?: string | null,
  baseUrl?: string | null
): string | null {
  if (!url || typeof url !== 'string' || !isSafeUrl(url)) return null;

  const trimmed = url.trim();

  // Already absolute http/https URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const cleanBase = baseUrl?.trim().replace(/\/+$/, '') || '';
  if (!cleanBase) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  const cleanPath = trimmed.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Serializes an object to JSON-LD string while neutralizing any closing </script> tags.
 * Critical XSS prevention for JSON-LD script blocks.
 */
export function serializeJsonLd(data: unknown): string {
  try {
    return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
  } catch {
    return '';
  }
}

// ==============================================================================
// 2. PURE SEO METADATA RESOLVER
// ==============================================================================

/**
 * Known public route title mapping for standard Vietnamese school platform paths
 */
const ROUTE_TITLE_MAP: Record<string, string> = {
  '/news': 'Tin tức & Bài viết',
  '/news/search': 'Tìm kiếm tin tức',
  '/documents': 'Văn bản - Tài liệu',
  '/tai-lieu': 'Văn bản - Tài liệu',
  '/announcements': 'Thông báo điều hành',
  '/thong-bao': 'Thông báo điều hành',
  '/albums': 'Thư viện ảnh',
  '/gallery': 'Thư viện ảnh',
  '/about': 'Giới thiệu',
  '/contact': 'Liên hệ',
  '/activities': 'Hoạt động phong trào',
  '/admissions': 'Thông tin tuyển sinh',
};

/**
 * Pure function resolving all SEO metadata with complete fallback chains.
 * Does not depend on the browser DOM, making it directly testable in node/SSR.
 */
export function resolvePublicSeo(context: PublicSeoContextInput): ResolvedPublicSeoMetadata {
  const {
    seoSettings,
    schoolIdentity,
    pathname = '/',
    origin = '',
    pagePayload,
  } = context;

  const pattern = seoSettings?.meta_title_pattern || DEFAULT_SEO_SETTINGS.meta_title_pattern;
  const schoolName = schoolIdentity?.school_name?.trim() || 'Cổng thông tin điện tử trường học';
  const effectiveBaseUrl = (seoSettings?.canonical_base_url?.trim().replace(/\/+$/, '') || origin || '').replace(/\/+$/, '');

  // 1. Resolve Raw Page Title & State Flags
  let rawTitle: string | undefined = undefined;
  let isNoIndex = Boolean(pagePayload?.noIndex);

  if (pagePayload?.isNotFound) {
    rawTitle = '404 - Không tìm thấy trang';
    isNoIndex = true;
  } else if (pagePayload?.isError) {
    rawTitle = 'Lỗi kết nối trang';
    isNoIndex = true;
  } else if (pagePayload?.page) {
    const page = pagePayload.page;
    rawTitle = page.meta_title?.trim() || page.title.trim();
    if (page.no_index) {
      isNoIndex = true;
    }
  } else if (pagePayload?.customTitle) {
    rawTitle = pagePayload.customTitle.trim();
  } else {
    // Route matching
    const cleanPath = pathname.replace(/\/+$/, '') || '/';
    if (cleanPath === '/' || cleanPath === '') {
      rawTitle = undefined; // Homepage: formatMetaTitle will extract site title
    } else if (ROUTE_TITLE_MAP[cleanPath]) {
      rawTitle = ROUTE_TITLE_MAP[cleanPath];
    }
  }

  // 2. Format Document Title via Authoritative Helper
  const formattedTitle = formatMetaTitle(pattern, rawTitle, schoolName);

  // 3. Resolve Description
  let description: string | null = null;
  if (pagePayload?.isNotFound) {
    description = 'Trang thông tin bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.';
  } else if (pagePayload?.isError) {
    description = 'Đã có lỗi xảy ra trong quá trình tải dữ liệu trang.';
  } else if (pagePayload?.page) {
    description =
      pagePayload.page.meta_description?.trim() ||
      pagePayload.page.excerpt?.trim() ||
      seoSettings?.meta_description_default?.trim() ||
      schoolIdentity?.slogan?.trim() ||
      null;
  } else if (pagePayload?.customDescription) {
    description = pagePayload.customDescription.trim();
  } else {
    description =
      seoSettings?.meta_description_default?.trim() ||
      schoolIdentity?.slogan?.trim() ||
      null;
  }

  // 4. Resolve Keywords
  let keywords: string | null = null;
  if (pagePayload?.page?.meta_keywords?.trim()) {
    keywords = pagePayload.page.meta_keywords.trim();
  } else if (pagePayload?.customKeywords?.trim()) {
    keywords = pagePayload.customKeywords.trim();
  } else if (seoSettings?.meta_keywords_default?.trim()) {
    keywords = seoSettings.meta_keywords_default.trim();
  }

  // 5. Resolve Canonical URL
  let canonicalUrl: string | null = null;
  if (pagePayload?.page?.canonical_url && isSafeUrl(pagePayload.page.canonical_url)) {
    canonicalUrl = resolveAbsoluteUrl(pagePayload.page.canonical_url, effectiveBaseUrl);
  } else if (pagePayload?.canonicalPath && isSafeUrl(pagePayload.canonicalPath)) {
    canonicalUrl = resolveAbsoluteUrl(pagePayload.canonicalPath, effectiveBaseUrl);
  } else if (effectiveBaseUrl) {
    const normalizedPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
    canonicalUrl = `${effectiveBaseUrl}${normalizedPath}`;
  }

  // 6. Resolve Open Graph / Social Image
  let rawOgImage: string | null = null;
  if (pagePayload?.page) {
    rawOgImage =
      pagePayload.page.og_image?.trim() ||
      pagePayload.page.featured_image?.trim() ||
      seoSettings?.og_image_default?.trim() ||
      schoolIdentity?.logo_url?.trim() ||
      null;
  } else if (pagePayload?.customOgImage) {
    rawOgImage = pagePayload.customOgImage.trim();
  } else {
    rawOgImage =
      seoSettings?.og_image_default?.trim() ||
      schoolIdentity?.logo_url?.trim() ||
      null;
  }

  const ogImage = resolveAbsoluteUrl(rawOgImage, effectiveBaseUrl);

  // 7. Robots directive
  const robots = isNoIndex ? 'noindex, nofollow' : 'index, follow';

  // 8. Open Graph & Twitter Cards
  const ogTitle = formattedTitle;
  const ogDescription = description;
  const ogUrl = canonicalUrl;
  const ogType = pagePayload?.ogType || (pagePayload?.page ? 'article' : 'website');
  const ogSiteName = schoolName;

  const twitterCard = ogImage ? 'summary_large_image' : 'summary';
  const twitterTitle = formattedTitle;
  const twitterDescription = description;
  const twitterImage = ogImage;

  // 9. Site Verification Tokens
  const googleSiteVerification = seoSettings?.google_site_verification?.trim() || null;
  const bingSiteVerification = seoSettings?.bing_site_verification?.trim() || null;

  // 10. Structured Data (JSON-LD)
  let structuredDataJsonLd: string | null = null;
  if (seoSettings?.structured_data_enabled !== false && !isNoIndex) {
    const siteUrl = effectiveBaseUrl || canonicalUrl || '/';
    const schemas: Array<Record<string, unknown>> = [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: schoolName,
        description: description || undefined,
        inLanguage: 'vi-VN',
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${siteUrl}/#organization`,
        name: schoolName,
        url: schoolIdentity?.website || siteUrl,
        logo: resolveAbsoluteUrl(schoolIdentity?.logo_url, effectiveBaseUrl) || undefined,
        telephone: schoolIdentity?.phone || undefined,
        email: schoolIdentity?.email || undefined,
        address: schoolIdentity?.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: schoolIdentity.address,
              addressCountry: 'VN',
            }
          : undefined,
      },
    ];

    if (pagePayload?.page) {
      schemas.push({
        '@type': 'WebPage',
        '@id': `${canonicalUrl || siteUrl}/#webpage`,
        url: canonicalUrl || undefined,
        name: formattedTitle,
        description: description || undefined,
        isPartOf: { '@id': `${siteUrl}/#website` },
        datePublished: pagePayload.page.published_at || undefined,
        dateModified: pagePayload.page.updated_at || undefined,
        inLanguage: 'vi-VN',
      });
    }

    structuredDataJsonLd = serializeJsonLd({
      '@context': 'https://schema.org',
      '@graph': schemas,
    });
  }

  return {
    title: formattedTitle,
    description,
    keywords,
    canonicalUrl,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    ogSiteName,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    googleSiteVerification,
    bingSiteVerification,
    structuredDataJsonLd,
  };
}

// ==============================================================================
// 3. AUTHORITATIVE HTML HEAD DOM SYNCHRONIZER
// ==============================================================================

interface MetaTagSpec {
  selector: string;
  tagName: 'meta' | 'link' | 'script';
  attributes: Record<string, string>;
  valueAttr: 'content' | 'href' | 'textContent';
}

const HEAD_TAG_SPECS: Record<string, MetaTagSpec> = {
  description: {
    selector: 'meta[name="description"]',
    tagName: 'meta',
    attributes: { name: 'description' },
    valueAttr: 'content',
  },
  keywords: {
    selector: 'meta[name="keywords"]',
    tagName: 'meta',
    attributes: { name: 'keywords' },
    valueAttr: 'content',
  },
  robots: {
    selector: 'meta[name="robots"]',
    tagName: 'meta',
    attributes: { name: 'robots' },
    valueAttr: 'content',
  },
  canonicalUrl: {
    selector: 'link[rel="canonical"]',
    tagName: 'link',
    attributes: { rel: 'canonical' },
    valueAttr: 'href',
  },
  ogTitle: {
    selector: 'meta[property="og:title"]',
    tagName: 'meta',
    attributes: { property: 'og:title' },
    valueAttr: 'content',
  },
  ogDescription: {
    selector: 'meta[property="og:description"]',
    tagName: 'meta',
    attributes: { property: 'og:description' },
    valueAttr: 'content',
  },
  ogUrl: {
    selector: 'meta[property="og:url"]',
    tagName: 'meta',
    attributes: { property: 'og:url' },
    valueAttr: 'content',
  },
  ogImage: {
    selector: 'meta[property="og:image"]',
    tagName: 'meta',
    attributes: { property: 'og:image' },
    valueAttr: 'content',
  },
  ogType: {
    selector: 'meta[property="og:type"]',
    tagName: 'meta',
    attributes: { property: 'og:type' },
    valueAttr: 'content',
  },
  ogSiteName: {
    selector: 'meta[property="og:site_name"]',
    tagName: 'meta',
    attributes: { property: 'og:site_name' },
    valueAttr: 'content',
  },
  twitterCard: {
    selector: 'meta[name="twitter:card"]',
    tagName: 'meta',
    attributes: { name: 'twitter:card' },
    valueAttr: 'content',
  },
  twitterTitle: {
    selector: 'meta[name="twitter:title"]',
    tagName: 'meta',
    attributes: { name: 'twitter:title' },
    valueAttr: 'content',
  },
  twitterDescription: {
    selector: 'meta[name="twitter:description"]',
    tagName: 'meta',
    attributes: { name: 'twitter:description' },
    valueAttr: 'content',
  },
  twitterImage: {
    selector: 'meta[name="twitter:image"]',
    tagName: 'meta',
    attributes: { name: 'twitter:image' },
    valueAttr: 'content',
  },
  googleSiteVerification: {
    selector: 'meta[name="google-site-verification"]',
    tagName: 'meta',
    attributes: { name: 'google-site-verification' },
    valueAttr: 'content',
  },
  bingSiteVerification: {
    selector: 'meta[name="msvalidate.01"]',
    tagName: 'meta',
    attributes: { name: 'msvalidate.01' },
    valueAttr: 'content',
  },
  structuredDataJsonLd: {
    selector: 'script#seo-structured-data',
    tagName: 'script',
    attributes: { id: 'seo-structured-data', type: 'application/ld+json' },
    valueAttr: 'textContent',
  },
};

/**
 * Injects or updates SEO metadata into the document <head>.
 * Safely removes tags when values are null to prevent stale leakage between routes.
 * Returns a cleanup function.
 */
export function applyPublicSeoMetadata(metadata: ResolvedPublicSeoMetadata): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  // 1. Synchronize Document Title
  const previousTitle = document.title;
  if (metadata.title) {
    document.title = metadata.title;
  }

  // 2. Synchronize Head Tags
  const managedTags: HTMLElement[] = [];

  for (const [key, spec] of Object.entries(HEAD_TAG_SPECS)) {
    const rawVal = (metadata as unknown as Record<string, unknown>)[key];
    const value = typeof rawVal === 'string' && rawVal.trim().length > 0 ? rawVal.trim() : null;

    let el = document.head.querySelector(spec.selector) as HTMLElement | null;

    if (value !== null) {
      if (!el) {
        el = document.createElement(spec.tagName);
        for (const [attrName, attrVal] of Object.entries(spec.attributes)) {
          el.setAttribute(attrName, attrVal);
        }
        document.head.appendChild(el);
      }

      if (spec.valueAttr === 'textContent') {
        el.textContent = value;
      } else {
        el.setAttribute(spec.valueAttr, value);
      }
      managedTags.push(el);
    } else {
      // Clean up tag if value is null/empty
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  }

  // 3. Return Cleanup Callback
  return () => {
    // Revert title if needed
    if (previousTitle) {
      document.title = previousTitle;
    }
  };
}
