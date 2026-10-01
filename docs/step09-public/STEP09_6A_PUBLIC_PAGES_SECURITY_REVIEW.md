# STEP 09.6A — PUBLIC STATIC PAGES SECURITY REVIEW

**School News Platform**  
**Role:** Security Engineer Reviewer  
**Audit Target:** Public Static Pages & Dynamic Routing (`/page/:slug`)  

---

## 1. Threat Modeling & Mitigation Analysis

### A. Information Leakage (Drafts / Archived Pages)
- **Threat:** Anonymous public visitor attempts to probe draft, archived, or scheduled static pages via guessing or traversing URLs.
- **Defense-in-Depth:**
  1. *Service Layer Filtering:* `getPublishedPageBySlug(slug)` explicitly adds `.eq('status', 'published')`.
  2. *Database RLS Policy:* Row Level Security on `public.pages` permits SELECT for `anon` role strictly when `status = 'published'`.
  3. *UI Reaction:* When no record is returned, the UI renders the standard generic `NotFoundState` (404), providing zero hint whether a draft page exists with that slug.

### B. Cross-Site Scripting (XSS via Rich Text)
- **Threat:** An attacker stores malicious HTML (e.g. `<script>`, `<img src=x onerror=...>`, `<iframe src=...>`, `<a href="javascript:...">`) in the CMS rich-text content field.
- **Defense-in-Depth:**
  1. *DOMPurify Sanitizer:* `src/lib/sanitize.ts` is called on all content prior to DOM rendering.
  2. *Whitelist Enforcement:* Tags are limited strictly to semantic markup (`h1-h6`, `p`, `table`, `ul`, `ol`, `img`, `a`, `blockquote`). All script tags, onload/onerror handlers, and `javascript:` protocols are eradicated.
  3. *Image Referrer Policy:* Images include `referrerPolicy="no-referrer"` to protect user privacy.

### C. Client-Side Privilege Isolation
- **Audit Result:**
  - Zero direct `supabase.from()` calls exist in any of the new UI components.
  - Zero `service_role` keys or elevated privileges are accessed or exposed to client code.
  - Slug parameters are strictly validated against `SLUG_REGEX` before queries are fired.

---

## 2. Security Sign-off

| Check | Status | Verification Detail |
|---|---|---|
| Anonymous access to drafts prevented | **PASSED** | RLS + Service query filtering `.eq('status', 'published')`. |
| XSS vectors stripped | **PASSED** | Verified via test suite with 5 hostile payloads. |
| Zero direct DB access in UI | **PASSED** | Verified via AST/static inspection in verification script. |
| Clean error masking | **PASSED** | Raw PostgreSQL error codes and stack traces never leak to visitors. |
