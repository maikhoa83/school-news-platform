/**
 * SEO Settings Database & Domain Service Layer
 * School News Platform - Step 09.4C
 *
 * Architecture:
 * Component / Page -> Hook -> seoService.ts -> Supabase Client -> PostgreSQL / RLS
 *
 * Coordinates domain logic for:
 * - public.seo_settings (Single-row invariant enforced: id = 'default')
 *
 * Enforces:
 * - Pure client-safe Supabase connection (Zero Service Role Key)
 * - Authoritative database RLS enforcement (settings.view, settings.edit)
 * - Anti-tampering: immutable fields (id, created_at, updated_at) protected against client tampering
 * - Fail-closed error handling and explicit error taxonomy
 * - Helper utilities for title formatting, meta tags construction, and robots.txt generation
 */

import { supabase } from '../lib/supabase';
import { envConfig } from '../lib/env';
import type {
  SeoSettings,
  SeoSettingsUpdateInput,
  SeoMetaTags,
  FormatTitleOptions,
} from '../types/seo';
import {
  DEFAULT_SEO_SETTINGS,
  SEO_SINGLETON_ID,
} from '../modules/seo/config/seoConfig';
import { seoSettingsUpdateSchema } from '../modules/seo/schemas/seoSchema';

// ==============================================================================
// 1. ERROR TAXONOMY
// ==============================================================================

export type SeoServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR';

export class SeoServiceError extends Error {
  readonly code: SeoServiceErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: SeoServiceErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'SeoServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// ==============================================================================
// 2. INTERNAL DATABASE ERROR HANDLER
// ==============================================================================

/**
 * Maps PostgreSQL and Supabase errors to domain SeoServiceError.
 */
function handleDatabaseError(error: unknown, defaultMessage: string): never {
  if (error instanceof SeoServiceError) {
    throw error;
  }

  const pgError = error as { code?: string; message?: string; details?: string };
  const message = pgError?.message || defaultMessage;
  const code = pgError?.code;

  // 42501: Insufficient privilege or RLS violation
  if (
    code === '42501' ||
    message.includes('permission denied') ||
    message.includes('violates row-level security')
  ) {
    throw new SeoServiceError(
      'Bạn không có quyền thực hiện thao tác cấu hình SEO (yêu cầu quyền settings.edit).',
      'UNAUTHORIZED',
      error
    );
  }

  // 23514: Check constraint violation (e.g. single_seo_settings_row violation)
  if (code === '23514' || message.includes('single_seo_settings_row')) {
    throw new SeoServiceError(
      'Vi phạm ràng buộc định danh cấu hình SEO (chỉ cho phép bản ghi duy nhất với id = "default").',
      'VALIDATION_ERROR',
      error
    );
  }

  // PGRST116: PostgREST error: No rows found
  if (code === 'PGRST116') {
    throw new SeoServiceError('Không tìm thấy cấu hình SEO trong hệ thống.', 'NOT_FOUND', error);
  }

  throw new SeoServiceError(message, 'DATABASE_ERROR', error);
}

// ==============================================================================
// 3. CORE SERVICE METHODS
// ==============================================================================

/**
 * Retrieve the singleton SEO settings row (id = 'default').
 * Guarded by RLS:
 * - Public and authenticated users have SELECT permission.
 * - Falls back to DEFAULT_SEO_SETTINGS if database is unconfigured or record is missing.
 */
export async function getSeoSettings(): Promise<SeoSettings> {
  if (!envConfig.isConfigured) {
    return DEFAULT_SEO_SETTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('id', SEO_SINGLETON_ID)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Không thể tải cấu hình SEO.');
    }

    if (!data) {
      // If table row hasn't been seeded yet, attempt to insert default row
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('seo_settings')
          .insert({
            id: SEO_SINGLETON_ID,
            meta_title_pattern: DEFAULT_SEO_SETTINGS.meta_title_pattern,
            meta_description_default: DEFAULT_SEO_SETTINGS.meta_description_default,
            meta_keywords_default: DEFAULT_SEO_SETTINGS.meta_keywords_default,
            sitemap_enabled: DEFAULT_SEO_SETTINGS.sitemap_enabled,
            structured_data_enabled: DEFAULT_SEO_SETTINGS.structured_data_enabled,
          })
          .select('*')
          .single();

        if (!insertError && inserted) {
          return inserted as SeoSettings;
        }
      } catch {
        // Fallback silently to in-memory defaults if insertion fails (e.g. read-only visitor)
      }

      return DEFAULT_SEO_SETTINGS;
    }

    return data as SeoSettings;
  } catch (err) {
    if (err instanceof SeoServiceError) {
      throw err;
    }
    return DEFAULT_SEO_SETTINGS;
  }
}

/**
 * Update the singleton SEO settings row.
 * Guarded by RLS:
 * - Requires staff with 'settings.edit' permission.
 * - Enforces immutable singleton ID 'default'.
 * - Rejects any unknown or prohibited fields (id, created_at).
 */
export async function updateSeoSettings(input: SeoSettingsUpdateInput): Promise<SeoSettings> {
  if (!envConfig.isConfigured) {
    throw new SeoServiceError(
      'Hệ thống chưa cấu hình kết nối CSDL Supabase.',
      'DATABASE_ERROR'
    );
  }

  // 1. Validate input with Zod schema
  const parsed = seoSettingsUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || 'Dữ liệu cấu hình SEO không hợp lệ.';
    throw new SeoServiceError(firstIssue, 'VALIDATION_ERROR', parsed.error);
  }

  const validData = parsed.data;

  // 2. Build sanitized payload with strict allow-list
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (validData.meta_title_pattern !== undefined) {
    payload.meta_title_pattern = validData.meta_title_pattern;
  }
  if (validData.meta_description_default !== undefined) {
    payload.meta_description_default = validData.meta_description_default;
  }
  if (validData.meta_keywords_default !== undefined) {
    payload.meta_keywords_default = validData.meta_keywords_default;
  }
  if (validData.og_image_default !== undefined) {
    payload.og_image_default = validData.og_image_default;
  }
  if (validData.canonical_base_url !== undefined) {
    payload.canonical_base_url = validData.canonical_base_url;
  }
  if (validData.robots_txt_content !== undefined) {
    payload.robots_txt_content = validData.robots_txt_content;
  }
  if (validData.sitemap_enabled !== undefined) {
    payload.sitemap_enabled = validData.sitemap_enabled;
  }
  if (validData.structured_data_enabled !== undefined) {
    payload.structured_data_enabled = validData.structured_data_enabled;
  }
  if (validData.google_site_verification !== undefined) {
    payload.google_site_verification = validData.google_site_verification;
  }
  if (validData.bing_site_verification !== undefined) {
    payload.bing_site_verification = validData.bing_site_verification;
  }

  try {
    const { data, error } = await supabase
      .from('seo_settings')
      .update(payload)
      .eq('id', SEO_SINGLETON_ID)
      .select('*')
      .single();

    if (error) {
      handleDatabaseError(error, 'Không thể cập nhật cấu hình SEO.');
    }

    if (!data) {
      throw new SeoServiceError('Không tìm thấy bản ghi cấu hình SEO để cập nhật.', 'NOT_FOUND');
    }

    return data as SeoSettings;
  } catch (err) {
    if (err instanceof SeoServiceError) {
      throw err;
    }
    handleDatabaseError(err, 'Lỗi không xác định khi cập nhật cấu hình SEO.');
  }
}

// ==============================================================================
// 4. DOMAIN HELPER UTILITIES
// ==============================================================================

/**
 * Formats a document / page title based on the meta_title_pattern.
 * Example:
 * pattern: "%s | Cổng thông tin điện tử THPT Amsterdam"
 * pageTitle: "Lịch thi học kỳ II"
 * Output: "Lịch thi học kỳ II | Cổng thông tin điện tử THPT Amsterdam"
 */
export function formatMetaTitle(
  patternOrOptions: string | FormatTitleOptions,
  optionalPageTitle?: string,
  optionalFallbackName: string = 'Cổng thông tin điện tử trường học'
): string {
  let pattern: string;
  let pageTitle: string | undefined;
  let fallbackSiteName: string;

  if (typeof patternOrOptions === 'object') {
    pattern = patternOrOptions.pattern || DEFAULT_SEO_SETTINGS.meta_title_pattern;
    pageTitle = patternOrOptions.pageTitle;
    fallbackSiteName = patternOrOptions.fallbackSiteName || optionalFallbackName;
  } else {
    pattern = patternOrOptions;
    pageTitle = optionalPageTitle;
    fallbackSiteName = optionalFallbackName;
  }

  const cleanTitle = pageTitle?.trim();

  if (cleanTitle && cleanTitle.length > 0) {
    if (pattern.includes('%s')) {
      return pattern.replace('%s', cleanTitle);
    }
    return `${cleanTitle} | ${pattern}`;
  }

  // If no specific page title provided (e.g. homepage)
  if (pattern.includes('%s')) {
    // Strip leading "%s | " or "%s - "
    const stripped = pattern.replace(/^%s\s*([|\-:]\s*)?/i, '').trim();
    if (stripped.length > 0) {
      return stripped;
    }
  }

  return pattern || fallbackSiteName;
}

/**
 * Generates the robots.txt file content based on SEO settings.
 */
export function generateRobotsTxt(settings: Partial<SeoSettings>): string {
  if (settings.robots_txt_content && settings.robots_txt_content.trim().length > 0) {
    return settings.robots_txt_content.trim();
  }

  const lines: string[] = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
  ];

  if (settings.sitemap_enabled !== false) {
    const baseUrl = settings.canonical_base_url?.trim().replace(/\/+$/, '');
    if (baseUrl) {
      lines.push(`Sitemap: ${baseUrl}/sitemap.xml`);
    } else {
      lines.push('Sitemap: /sitemap.xml');
    }
  }

  return lines.join('\n');
}

/**
 * Computes complete SEO meta tags for page header rendering.
 */
export function buildMetaTags(
  settings: SeoSettings,
  pageMeta?: {
    title?: string;
    description?: string;
    ogImage?: string;
    canonicalPath?: string;
    publishedTime?: string;
    modifiedTime?: string;
    authorName?: string;
  }
): SeoMetaTags {
  const formattedTitle = formatMetaTitle(settings.meta_title_pattern, pageMeta?.title);
  const description = pageMeta?.description?.trim() || settings.meta_description_default || null;
  const keywords = settings.meta_keywords_default || null;

  const baseUrl = settings.canonical_base_url?.trim().replace(/\/+$/, '') || null;
  const path = pageMeta?.canonicalPath?.trim().replace(/^\/+/, '') || '';
  const canonicalUrl = baseUrl ? `${baseUrl}/${path}`.replace(/\/+$/, '') : null;

  let ogImage = pageMeta?.ogImage?.trim() || settings.og_image_default || null;
  if (ogImage && ogImage.startsWith('/') && baseUrl) {
    ogImage = `${baseUrl}${ogImage}`;
  }

  let structuredDataJsonLd: string | null = null;
  if (settings.structured_data_enabled) {
    const jsonLdObj = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: formattedTitle,
      description: description ?? undefined,
      url: canonicalUrl ?? baseUrl ?? undefined,
    };
    structuredDataJsonLd = JSON.stringify(jsonLdObj);
  }

  return {
    title: formattedTitle,
    description,
    keywords,
    canonicalUrl,
    ogTitle: formattedTitle,
    ogDescription: description,
    ogImage,
    ogUrl: canonicalUrl,
    robots: 'index, follow',
    googleSiteVerification: settings.google_site_verification || null,
    bingSiteVerification: settings.bing_site_verification || null,
    structuredDataJsonLd,
  };
}
