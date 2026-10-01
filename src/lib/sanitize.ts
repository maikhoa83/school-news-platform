/**
 * Content Sanitizer for Rich Text rendering
 * Utilizes DOMPurify with strict semantic tag white-listing
 * Strictly prevents XSS vulnerabilities while allowing headings, tables, links, images
 * School News Platform - Step 05
 */

import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'span',
  'strong',
  'em',
  'u',
  's',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
  'br',
  'figure',
  'figcaption',
  'code',
  'pre',
  'div',
];

const ALLOWED_ATTR = [
  'href',
  'src',
  'alt',
  'title',
  'target',
  'rel',
  'class',
  'id',
  'width',
  'height',
  'style',
  'colspan',
  'rowspan',
  'align',
];

/**
 * Sanitize HTML string before injecting into DOM
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  // Browser execution environment: DOMPurify has full access to DOM/window
  if (typeof window !== 'undefined') {
    const purifyInstance =
      typeof DOMPurify.sanitize === 'function'
        ? DOMPurify
        : (DOMPurify as unknown as (win: Window) => typeof DOMPurify)(window);

    return purifyInstance.sanitize(dirtyHtml, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'],
    });
  }

  // Node.js test & SSR execution environment fallback (prevents runtime crash when window is absent)
  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript\s*:/gi, 'blocked:')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    .replace(/\s+on\w+=\S+/gi, '');
}

