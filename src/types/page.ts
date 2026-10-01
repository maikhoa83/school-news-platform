/**
 * Pages Module Domain Types
 * School News Platform - Step 09 Quản lý Trang tĩnh (Pages), Menu & Cấu hình SEO
 *
 * Architecture:
 * Component / Page -> Hook -> pageService.ts -> Supabase Client -> PostgreSQL / RLS
 *
 * Enforcing:
 * - Pure client-safe Supabase connection (Zero Service Role Key)
 * - Strict single-school installation architecture (Zero multi-tenancy)
 * - Status contract strictly limited to: 'draft' | 'published' | 'archived' (No 'pending' or invent)
 * - Immutable/system fields protection: id, author_id, created_at, updated_at, search_vector
 * - Anti-author spoofing: author_id is authoritatively assigned by auth.uid()
 * - Relational parent-child hierarchy (parent_id ON DELETE SET NULL)
 */

// ==============================================================================
// 1. PRIMITIVE / LITERAL UNION TYPES
// ==============================================================================

export type PageStatus = 'draft' | 'published' | 'archived';

export type PageTemplate = 'default' | 'fullwidth' | 'sidebar' | 'contact';

// ==============================================================================
// 2. CORE DATABASE ROW ENTITY (MAPPED TO public.pages SCHEMA)
// ==============================================================================

/**
 * Direct representation of a record in public.pages
 */
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
  search_vector?: unknown; // Managed strictly by PostgreSQL database trigger
  created_at: string;
  updated_at: string;
}

// ==============================================================================
// 3. JOIN / RELATION TYPES
// ==============================================================================

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

/**
 * Page with author and parent relationships resolved
 */
export interface PageWithRelations extends Page {
  author?: PageAuthorSummary | null;
  parent?: PageParentSummary | null;
}

export type PageDetail = PageWithRelations;

export type PageListItem = PageWithRelations;

// ==============================================================================
// 4. MUTATION INPUT CONTRACTS (SECURITY ALLOW-LIST)
// ==============================================================================

/**
 * Input for creating a new static page.
 * NOTE:
 * - Caller CANNOT specify id, search_vector, created_at, updated_at, view_count.
 * - author_id is automatically assigned to auth.uid() by pageService, preventing author spoofing.
 */
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

/**
 * Input for updating an existing static page.
 * Strictly allow-listed mutable fields.
 * NOTE:
 * - id, search_vector, created_at, updated_at are completely excluded.
 * - author_id is excluded from standard updates (immutable, enforced by RLS policy 4).
 */
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

// ==============================================================================
// 5. QUERY / FILTER PARAMS & PAGINATION
// ==============================================================================

export type PageSortField = 'sort_order' | 'published_at' | 'created_at' | 'title' | 'updated_at';

export type PageSortOrder = 'asc' | 'desc';

export interface PageListParams {
  search?: string;
  status?: PageStatus | 'all';
  template?: PageTemplate | 'all';
  parentId?: string | null | 'root' | 'all';
  page?: number;
  limit?: number;
  sortBy?: PageSortField;
  sortOrder?: PageSortOrder;
}

export interface PagePaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
