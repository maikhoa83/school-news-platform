# STEP 09.4A — PAGES SERVICE & HOOKS CONTRACT

## 1. Scope & Objective
This document formalizes the public interface, TypeScript signatures, validation rules, and error contracts for the Pages domain module data layer (`public.pages`).

---

## 2. Type Signatures

### 2.1 Primitive & Union Types
```typescript
export type PageStatus = 'draft' | 'published' | 'archived';

export type PageTemplate = 'default' | 'fullwidth' | 'sidebar' | 'contact';

export type PageSortField = 'sort_order' | 'published_at' | 'created_at' | 'title' | 'updated_at';

export type PageSortOrder = 'asc' | 'desc';
```

### 2.2 Core Row Entity
```typescript
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  parent_id: string | null;
  template: PageTemplate;
  status: PageStatus;
  sort_order: number;
  view_count: number;
  author_id: string;
  published_at: string | null;
  published_by: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  canonical_url: string | null;
  no_index: boolean;
  search_vector?: unknown;
  created_at: string;
  updated_at: string;
}
```

### 2.3 Resolved Relations
```typescript
export interface PageAuthorSummary {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string | null;
}

export interface PageParentSummary {
  id: string;
  title: string;
  slug: string;
}

export interface PageWithRelations extends Page {
  author?: PageAuthorSummary | null;
  parent?: PageParentSummary | null;
}
```

### 2.4 Mutation Input Types
```typescript
export interface PageCreateInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: string | null;
  parent_id?: string | null;
  template?: PageTemplate;
  status?: PageStatus;
  sort_order?: number;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean;
}

export interface PageUpdateInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  featured_image?: string | null;
  parent_id?: string | null;
  template?: PageTemplate;
  status?: PageStatus;
  sort_order?: number;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean;
}
```

---

## 3. Service Layer Contract (`pageService.ts`)

### 3.1 `listPages`
```typescript
export async function listPages(
  params?: PageListParams
): Promise<PagePaginationResult<PageWithRelations>>;
```
- **Params:** `search`, `status`, `template`, `parentId`, `page`, `limit`, `sortBy`, `sortOrder`.
- **Security:** RLS enforces visibility. Public sees published pages with `published_at <= NOW()`. Staff with `pages.view` sees all.

### 3.2 `getPageById`
```typescript
export async function getPageById(id: string): Promise<PageWithRelations | null>;
```
- **Validation:** Must be valid UUID v4.
- **Security:** Subject to RLS.

### 3.3 `getPublishedPageBySlug`
```typescript
export async function getPublishedPageBySlug(slug: string): Promise<PageWithRelations | null>;
```
- **Validation:** Slug format `SLUG_REGEX`.
- **Security:** RLS policy guarantees only published pages are returned to anonymous users.

### 3.4 `createPage`
```typescript
export async function createPage(input: PageCreateInput): Promise<Page>;
```
- **Validation:** Zod `pageCreateSchema`.
- **Author Assignment:** Automatically resolves `auth.uid()`, binding `author_id` to current user.
- **Security:** Requires `pages.create` permission.

### 3.5 `updatePage`
```typescript
export async function updatePage(id: string, input: PageUpdateInput): Promise<Page>;
```
- **Validation:** UUID format, Zod `pageUpdateSchema`, self-parent guard (`parent_id !== id`).
- **Security:** Requires `pages.edit` permission. Immutable fields excluded from payload.

### 3.6 `deletePage`
```typescript
export async function deletePage(id: string): Promise<void>;
```
- **Validation:** UUID format.
- **Integrity:** PostgreSQL `ON DELETE SET NULL` on `parent_id` safely clears references on child pages.
- **Security:** Requires `pages.delete` permission.

---

## 4. Hook Layer Contract

```typescript
// Query hooks
export function usePages(params?: PageListParams): {
  data?: PagePaginationResult<PageWithRelations>;
  items: PageWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

export function usePage(id?: string): {
  page: PageWithRelations | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

export function usePublishedPage(slug?: string): {
  page: PageWithRelations | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

// Mutation hooks
export function useCreatePage(): UseMutationResult<Page, Error, PageCreateInput>;
export function useUpdatePage(): UseMutationResult<Page, Error, { id: string; input: PageUpdateInput }>;
export function useDeletePage(): UseMutationResult<void, Error, string>;
export function usePageMutations(): {
  createPage: (payload: PageCreateInput) => Promise<Page>;
  isCreating: boolean;
  createError: Error | null;
  updatePage: (params: { id: string; input: PageUpdateInput }) => Promise<Page>;
  isUpdating: boolean;
  updateError: Error | null;
  deletePage: (id: string) => Promise<void>;
  isDeleting: boolean;
  deleteError: Error | null;
};
```
