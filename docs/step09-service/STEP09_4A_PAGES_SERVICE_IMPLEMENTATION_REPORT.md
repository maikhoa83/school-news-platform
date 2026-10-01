# STEP 09.4A — PAGES SERVICE + HOOKS IMPLEMENTATION REPORT

## A. Executive Result
- **Status:** **PASS** (100% compliant with Master Documents v1.2, Step 09.1-09.3B baselines, and Strict Single-School Architecture).
- **Domain Module:** Pages (Trang tĩnh) Application Data Layer.
- **Scope Discipline:** Strictly limited to `PAGES SERVICE + HOOKS`. Zero premature implementations of Menus, Menu Items, SEO Settings, UI components, or public/admin routing.

---

## B. Scope Implemented
- **Domain Types:** Strongly typed definitions for `Page`, `PageWithRelations`, `PageCreateInput`, `PageUpdateInput`, `PageListParams`, `PageStatus`, and `PageTemplate`.
- **Zod Validation:** Comprehensive schema validation for page creation, partial updates, and listing parameters.
- **Service Layer (`src/services/pageService.ts`):** Complete application data-access boundary with safe PostgREST sanitization, author spoofing prevention, immutable fields guard, and typed error handling.
- **Hook Layer (`src/modules/pages/hooks/`):** TanStack Query hooks for deterministic query caching, pagination, single item query, public page lookup, and mutation invalidation.
- **Module Encapsulation (`src/modules/pages/`):** Reusable modular layout matching `media` and `announcements` modules.

---

## C. Files Created
1. `src/types/page.ts` — Core domain types, input contracts, and pagination interfaces.
2. `src/modules/pages/types/page.ts` — Module-level type re-export.
3. `src/modules/pages/config/pagesConfig.ts` — Status labels, template configs, sort options, and pagination defaults.
4. `src/modules/pages/schemas/pageSchema.ts` — Zod validation schemas for inputs, slugs, and pagination.
5. `src/services/pageService.ts` — Core database access and domain logic service.
6. `src/modules/pages/services/pageService.ts` — Module-level service re-export.
7. `src/modules/pages/hooks/usePages.ts` — TanStack Query hook for page list with filters and pagination.
8. `src/modules/pages/hooks/usePage.ts` — TanStack Query hook for single page detail by UUID.
9. `src/modules/pages/hooks/usePublishedPage.ts` — TanStack Query hook for public page lookup by slug.
10. `src/modules/pages/hooks/usePageMutations.ts` — Mutation hooks (`useCreatePage`, `useUpdatePage`, `useDeletePage`, `usePageMutations`).
11. `src/modules/pages/hooks/index.ts` — Hooks barrel export.
12. `src/modules/pages/index.ts` — Module root barrel export.

---

## D. Files Modified
1. `src/types/index.ts` — Added `export * from './page';` to register page domain types in the core types index.

---

## E. Files Deleted
- None (0 files deleted).

---

## F. Existing Patterns Reused
- **Modular Directory Architecture:** Followed the exact folder structure established in `src/modules/announcements` and `src/modules/media` (`types/`, `schemas/`, `services/`, `hooks/`, `config/`).
- **Data Access Boundary:** Service acts as the pure boundary between application UI and Supabase; hooks and UI never access Supabase directly.
- **TanStack Query Integration:** Reused deterministic query keys, query options, and scoped invalidation patterns from `useAlbumMutations.ts` and `useAdminAlbumsList.ts`.
- **Database Error Taxonomy:** Reused the error handling and PostgreSQL code mapping strategy (`42501` -> UNAUTHORIZED, `23505` -> DUPLICATE_SLUG, `PGRST116` -> NOT_FOUND, `23503/23514` -> VALIDATION_ERROR) from `mediaService.ts`.
- **PostgREST Query Sanitization:** Reused sanitization pattern removing characters that break PostgREST expressions: `/[(),"\\%:]/g`.

---

## G. Architecture
```
[ Component / UI ] (Next Phase)
       ↓
[ TanStack Query Hooks ] (usePages, usePage, usePublishedPage, usePageMutations)
       ↓
[ Pages Service Boundary ] (pageService.ts)
       ↓
[ Supabase Client ] (Client-safe anon key only)
       ↓
[ PostgreSQL / RLS Policies ] (Public published check, Staff RBAC check)
```
- **Invariant:** Components and hooks NEVER import or call `supabase` directly.
- **Authorization:** RLS remains the ultimate, authoritative security boundary.

---

## H. Pages Service Contract
- `listPages(params?: PageListParams): Promise<PagePaginationResult<PageWithRelations>>`
- `getPageById(id: string): Promise<PageWithRelations | null>`
- `getPublishedPageBySlug(slug: string): Promise<PageWithRelations | null>`
- `createPage(input: PageCreateInput): Promise<Page>`
- `updatePage(id: string, input: PageUpdateInput): Promise<Page>`
- `deletePage(id: string): Promise<void>`

---

## I. Pages Hook Contract
- `usePages(params?: PageListParams)`: Queries list of pages with `queryKey: ['pages', params]`.
- `usePage(id?: string)`: Queries page by UUID with `queryKey: ['pages', 'detail', id]`.
- `usePublishedPage(slug?: string)`: Queries published page by slug with `queryKey: ['pages', 'published', slug]`.
- `useCreatePage()`: Mutation for page creation, invalidates `['pages']`.
- `useUpdatePage()`: Mutation for page update, invalidates `['pages']`, `['pages', 'detail', id]`, `['pages', 'published']`.
- `useDeletePage()`: Mutation for page deletion, invalidates `['pages']`, removes `['pages', 'detail', id]`, invalidates `['pages', 'published']`.
- `usePageMutations()`: Unified mutation bundle.

---

## J. Validation
- **Zod Schemas:**
  - `pageCreateSchema`: Mandatory title and slug, length limits, template, status, ISO datetime for `published_at`.
  - `pageUpdateSchema`: Partial schema strictly restricted to mutable fields.
  - `pageListParamsSchema`: Sanitized search string, valid status/template union, valid pagination ranges.
- **Slug Validation:** `SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` — lowercase alphanumeric with hyphens, no trailing or leading hyphens.
- **UUID Validation:** RFC 4122 UUID v4 regex checked on all ID parameters.
- **Self-Parent Guard:** Prevents `parent_id === id` before dispatching database requests.

---

## K. Security
1. **Zero Privileged Client:** Browser client uses only standard anon key; no `service_role` key anywhere.
2. **Anti-Author Spoofing (IDOR Prevention):**
   - In `createPage`, `author_id` is NOT accepted from the client payload.
   - It is fetched directly from `await supabase.auth.getUser()` and assigned to `user.id`.
3. **Immutable Fields Protection:**
   - Client cannot overwrite `id`, `created_at`, `updated_at`, `search_vector`, or `view_count`.
   - `author_id` is excluded from `PageUpdateInput`.
4. **No Raw SQL:** Queries use Supabase SDK query builder with parameter binding.

---

## L. RLS Integration
- RLS Policy 1 (`Public can view published pages`): Respected by `getPublishedPageBySlug` and public calls.
- RLS Policy 2 (`Staff can view all pages`): Respected by `listPages` and `getPageById`.
- RLS Policy 3 (`Staff can insert pages`): Enforced by passing authentic `author_id = auth.uid()`.
- RLS Policy 4 (`Staff can update pages`): Enforced with immutability of `author_id`.
- RLS Policy 5 (`Staff can delete pages`): Enforced on `deletePage`.

---

## M. RBAC
- Reuses existing permissions:
  - `pages.view`: Required to view draft/archived pages.
  - `pages.create`: Required to create new pages.
  - `pages.edit`: Required to update pages.
  - `pages.delete`: Required to delete pages.
- Zero invented permissions (`pages.manage`, `pages.publish`, `pages.admin` are strictly absent).
- AUTHOR boundary preserved: Authors cannot manage pages.

---

## N. Error Handling
- `PageServiceError` taxonomy:
  - `VALIDATION_ERROR`: Malformed inputs, check constraint violations, foreign key errors.
  - `UNAUTHORIZED`: Insufficient permission, RLS violation (`42501`), unauthenticated session.
  - `NOT_FOUND`: PostgREST `PGRST116` or null entity query.
  - `DUPLICATE_SLUG`: PostgreSQL unique constraint violation (`23505`).
  - `DATABASE_ERROR`: Unexpected connectivity or database failures.
- No silent swallowing of errors (`catch { return null; }` is forbidden).
- No secrets, tokens, or private credentials in error messages.

---

## O. Query / Cache
- Deterministic TanStack Query cache keys:
  - List: `['pages', params]`
  - Detail: `['pages', 'detail', id]`
  - Public: `['pages', 'published', slug]`
- Granular cache invalidation on mutation success without global cache wiping.

---

## P. Type Safety
- Strict TypeScript (`tsc --noEmit` exits with 0 errors).
- Zero `@ts-ignore` or `@ts-expect-error`.
- Zero `any` types in all newly created files.

---

## Q. Verification Commands
- `npm run lint` (`tsc --noEmit`): **PASS** (0 errors).
- `npm run build` (`vite build`): **PASS** (Clean build, applet compiled).
- Unit verification via TSX script: **PASS** (Schemas, service exports, hook exports, error taxonomy).

---

## R. Functional Verification
- Schema parsing: PASS.
- Slug validation: PASS.
- UUID validation: PASS.
- Self-parent rejection: PASS.
- In-memory service & hook contract exports: PASS.

---

## S. Regression
- Step 01-03 Foundation: Intact.
- Step 04 Homepage: Intact.
- Step 05 News: Intact.
- Step 06 Documents: Intact.
- Step 07 Announcements: Intact.
- Step 08 Media & Albums: Intact.
- Previous Step 09 migrations (`20260113000000`, `20260114000000`): Intact.

---

## T. Findings
- None. All architectural and security constraints were verified and fully satisfied.

---

## U. Out of Scope
- Menus and Menu Items service/hooks (Scheduled for Step 09.4B).
- SEO Settings service/hooks (Scheduled for Step 09.4C).
- Public Page routing (`/page/:slug`) and Page UI (Scheduled for Step 09.5).
- Admin CMS Pages manager UI (Scheduled for Step 09.5).

---

## V. Final Gate
### **STEP 09.4A FINAL GATE: PASS**

---

## W. Next Phase Status
- Ready for **STEP 09.4B — MENUS & MENU ITEMS SERVICE + HOOKS** upon user instruction.
