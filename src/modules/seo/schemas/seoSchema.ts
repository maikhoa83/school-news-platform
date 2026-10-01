/**
 * SEO Settings Zod Validation Schemas
 * School News Platform - Step 09.4C
 */

import { z } from 'zod';
import { SEO_LIMITS } from '../config/seoConfig';

/**
 * URL validation helper: accepts absolute http/https URLs or null
 */
const absoluteUrlSchema = z
  .string()
  .trim()
  .max(SEO_LIMITS.URL_MAX, `URL không được vượt quá ${SEO_LIMITS.URL_MAX} ký tự.`)
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL phải bắt đầu bằng http:// hoặc https:// và có định dạng hợp lệ.' }
  )
  .transform((val) => {
    if (!val) return null;
    // Strip trailing slashes from base url for clean canonical construction
    return val.replace(/\/+$/, '');
  })
  .nullable()
  .optional();

/**
 * Image URL helper: accepts absolute http/https URLs or root-relative paths (/images/...) or null
 */
const imageUrlOrPathSchema = z
  .string()
  .trim()
  .max(SEO_LIMITS.URL_MAX, `Đường dẫn ảnh không được vượt quá ${SEO_LIMITS.URL_MAX} ký tự.`)
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith('/')) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Ảnh đại diện OG phải là đường dẫn tương đối (bắt đầu bằng /) hoặc URL hợp lệ (http/https).' }
  )
  .transform((val) => (val && val.length > 0 ? val : null))
  .nullable()
  .optional();

/**
 * Optional nullable trimmed text helper with max length
 */
const optionalNullableText = (maxLen: number, fieldName: string) =>
  z
    .string()
    .trim()
    .max(maxLen, `${fieldName} không được vượt quá ${maxLen} ký tự.`)
    .transform((val) => (val && val.length > 0 ? val : null))
    .nullable()
    .optional();

/**
 * Zod schema for updating SEO settings
 * Enforces field length constraints, sanitization, and typing.
 * Immutable fields (id, created_at, updated_at) are rejected or stripped.
 */
export const seoSettingsUpdateSchema = z
  .object({
    meta_title_pattern: z
      .string()
      .trim()
      .min(1, 'Mẫu tiêu đề trang không được để trống.')
      .max(
        SEO_LIMITS.TITLE_PATTERN_MAX,
        `Mẫu tiêu đề không được vượt quá ${SEO_LIMITS.TITLE_PATTERN_MAX} ký tự.`
      )
      .optional(),
    meta_description_default: optionalNullableText(
      SEO_LIMITS.DESCRIPTION_MAX,
      'Mô tả mặc định'
    ),
    meta_keywords_default: optionalNullableText(
      SEO_LIMITS.KEYWORDS_MAX,
      'Từ khóa mặc định'
    ),
    og_image_default: imageUrlOrPathSchema,
    canonical_base_url: absoluteUrlSchema,
    robots_txt_content: optionalNullableText(
      SEO_LIMITS.ROBOTS_TXT_MAX,
      'Nội dung robots.txt'
    ),
    sitemap_enabled: z.boolean().optional(),
    structured_data_enabled: z.boolean().optional(),
    google_site_verification: optionalNullableText(
      SEO_LIMITS.VERIFICATION_TOKEN_MAX,
      'Mã xác minh Google'
    ),
    bing_site_verification: optionalNullableText(
      SEO_LIMITS.VERIFICATION_TOKEN_MAX,
      'Mã xác minh Bing'
    ),
  })
  .strict();

export type SeoSettingsUpdateSchemaType = z.infer<typeof seoSettingsUpdateSchema>;
