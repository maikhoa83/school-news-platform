/**
 * News Module TypeScript Domain Interfaces & Types
 * School News Platform - Step 05 News Module
 */

export type NewsStatus = 'draft' | 'pending' | 'published' | 'archived';

export interface NewsAuthor {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  email?: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Resolved hierarchy
  children?: NewsCategory[];
  parent?: NewsCategory | null;
}

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  thumbnail?: string | null;
  category_id: string;
  author_id: string;
  author_name?: string | null;
  source?: string | null;
  source_url?: string | null;
  status: NewsStatus;
  is_featured: boolean;
  view_count: number;
  published_at?: string | null;
  published_by?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  category?: NewsCategory | null;
  author?: NewsAuthor | null;
  tags?: NewsTag[];
}

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface NewsComment {
  id: string;
  news_id: string;
  author_id: string;
  parent_id?: string | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;

  // Joined profile & threaded children
  author?: NewsAuthor | null;
  replies?: NewsComment[];
}

export interface TableOfContentItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export interface NewsFilterParams {
  categorySlug?: string;
  tagSlug?: string;
  searchQuery?: string;
  status?: NewsStatus;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'views' | 'oldest';
  isFeatured?: boolean;
}

export interface NewsPaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
