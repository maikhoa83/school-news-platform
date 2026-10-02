# STEP 09.6A — PUBLIC STATIC PAGES & DYNAMIC ROUTING CONTRACT

**School News Platform**  
**Architecture Baseline:** One Codebase → One School Installation → One Database → One Storage → One Auth → One Domain  
**Step:** 09.6A — Public Static Pages + Dynamic Page Routing  

---

## 1. Executive Summary

Step 09.6A enables public visitors to access static pages (e.g. Giới thiệu nhà trường, Cơ cấu tổ chức, Liên hệ, Sứ mệnh - Tầm nhìn) dynamically via `/page/:slug`.

It strictly binds to the approved single-school architectural flow:
```
Public Route (/page/:slug)
       ↓
PublicShell Layout
       ↓
ModuleGuard (moduleKey="pages")
       ↓
PublicPage Component
       ↓
usePublishedPage(slug) Hook
       ↓
pageService.getPublishedPageBySlug(slug)
       ↓
Supabase Client (anon key)
       ↓
PostgreSQL public.pages table (RLS Policy: published only)
```

---

## 2. Routing Specification

- **Canonical Public Route:** `/page/:slug`
- **Dynamic Parameter:** `:slug` extracted directly from URL via `useParams<{ slug: string }>()`.
- **Validation:** Enforces `SLUG_REGEX` (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`).
  - Invalid slugs, uppercase characters, path traversals, or injections immediately fail validation and render a semantic `404 Not Found` state.
- **Legacy / Demo Routes:** Existing routes (`/about`, `/activities`, `/admissions`, `/contact`) remain intact for backwards compatibility and zero disruption.

---

## 3. Data Fetching & Security Invariants

1. **Client-Side Security:**
   - Zero direct `supabase.from()` calls in UI components.
   - All public reads use the `usePublishedPage(slug)` hook.
2. **Access Control / RLS Boundary:**
   - Public query filters `.eq('slug', slug)` and `.eq('status', 'published')`.
   - PostgreSQL RLS Policy 1 strictly prevents anonymous users from reading drafts, archived pages, or scheduled future pages.
   - Attempting to load an unpublished page returns `null`, seamlessly triggering the public `404 Not Found` state with zero technical information leakage.
3. **Rich Text & XSS Prevention:**
   - All rich-text HTML is processed through `sanitizeHtml(content)` (powered by DOMPurify with strict semantic tag/attribute whitelisting) prior to injection via `dangerouslySetInnerHTML`.
   - Script tags, event handlers (`onload`, `onerror`), `javascript:` URIs, and iframes are stripped.

---

## 4. Templates & Responsive Presentations

Static pages support 4 templates configured via `page.template`:
1. **`default`**: Balanced centered container (`max-w-5xl`) with breadcrumbs, header, and sanitized article body.
2. **`fullwidth`**: Expansive layout (`max-w-7xl`) suited for complex diagrams, data tables, or wide imagery.
3. **`sidebar`**: 8 + 4 column layout:
   - 8 columns: Main page content.
   - 4 columns: Contextual sidebar containing Parent page navigation, official School Identity Card, and quick info.
4. **`contact`**: Dedicated contact directory layout:
   - Page content paired with structured School Contact Directory (Official address, hotline, email, website link, and office working hours from `SchoolIdentityConfig`).

---

## 5. Metadata & Accessibility

- **Page Title & Document Title:** Dynamically synchronizes `document.title = `${page.meta_title || page.title} | ${school_name}``. Restores previous title on component unmount.
- **Meta Description:** Dynamically updates `<meta name="description">` with `page.meta_description` or `page.excerpt`.
- **Search Engine Indexing:** If `page.no_index` is true, injects `<meta name="robots" content="noindex, nofollow">`.
- **Accessibility:**
  - Semantic HTML5 landmark structure (`<nav aria-label="Breadcrumb">`, `<header>`, `<article id="public-page-body">`, `<aside>`).
  - Status announcements (`role="status"` on loading skeleton, `role="alert"` on error state).
