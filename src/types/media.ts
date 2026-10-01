/**
 * Media Module Domain Types
 * School News Platform - Step 08 Quản lý Tệp Đa phương tiện & Album
 */

// ==============================================================================
// 1. PRIMITIVE / LITERAL UNION TYPES
// ==============================================================================

export type MediaFileType = 'image' | 'video' | 'document';

export type AllowedMediaMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'image/svg+xml'
  | 'video/mp4'
  | 'video/webm';

// ==============================================================================
// 2. CORE DATABASE ROW ENTITIES (MAPPED DIRECTLY TO G1 POSTGRES SCHEMA)
// ==============================================================================

/**
 * Represents a record from public.media_folders
 */
export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a record from public.media
 */
export interface MediaItem {
  id: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number; // Mapped from BIGINT NOT NULL (Safe integer for 50MB max limit)
  mime_type: string;
  file_type: MediaFileType;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  folder_id: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a record from public.albums
 */
export interface Album {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_media_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a record from public.album_items
 */
export interface AlbumItem {
  id: string;
  album_id: string;
  media_id: string;
  sort_order: number;
  caption: string | null;
  created_at: string;
}

// Alias for domain entity naming consistency
export type AlbumItemEntity = AlbumItem;

// ==============================================================================
// 3. RELATED / VIEW / JOINED ENTITY TYPES
// ==============================================================================

export interface MediaFolderWithCount extends MediaFolder {
  media_count?: number;
}

export interface MediaWithFolder extends MediaItem {
  folder?: MediaFolder | null;
  uploader?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
}

export interface AlbumMediaItem extends AlbumItem {
  media?: MediaItem | null;
}

export interface AlbumWithItems extends Album {
  cover_media?: MediaItem | null;
  items?: AlbumMediaItem[];
  items_count?: number;
  author?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
}

// ==============================================================================
// 4. FILTER & QUERY PARAMETERS
// ==============================================================================

export interface MediaListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  folderId?: string | null; // null represents unassigned/root, undefined means all
  fileType?: MediaFileType | 'all';
  isPublished?: boolean;
  sortBy?: 'created_at' | 'file_size' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PublicMediaFilterParams {
  folderId?: string | null;
  fileType?: MediaFileType | 'all';
  page?: number;
  pageSize?: number;
}

export interface AlbumListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isPublished?: boolean;
  sortBy?: 'created_at' | 'published_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// ==============================================================================
// 5. PAGINATION RESULT TYPE
// ==============================================================================

export interface MediaPaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==============================================================================
// 6. CREATE / UPDATE INPUT PAYLOADS
// ==============================================================================

export interface CreateMediaFolderInput {
  name: string;
  slug?: string;
  description?: string | null;
  parent_id?: string | null;
}

export interface UpdateMediaFolderInput {
  name?: string;
  slug?: string;
  description?: string | null;
  parent_id?: string | null;
}

export interface CreateMediaInput {
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: MediaFileType;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  folder_id?: string | null;
  is_published?: boolean;
}

export interface UpdateMediaInput {
  title?: string;
  alt_text?: string | null;
  caption?: string | null;
  folder_id?: string | null;
  is_published?: boolean;
}

export interface CreateAlbumInput {
  title: string;
  slug?: string;
  description?: string | null;
  cover_media_id?: string | null;
  is_published?: boolean;
  published_at?: string | null;
}

export interface UpdateAlbumInput {
  title?: string;
  slug?: string;
  description?: string | null;
  cover_media_id?: string | null;
  is_published?: boolean;
  published_at?: string | null;
}

export interface CreateAlbumItemInput {
  album_id: string;
  media_id: string;
  sort_order?: number;
  caption?: string | null;
}

export interface UpdateAlbumItemInput {
  sort_order?: number;
  caption?: string | null;
}

// ==============================================================================
// 7. STORAGE & UPLOAD RELATED TYPES
// ==============================================================================

export interface MediaUploadPayload {
  file: File;
  title?: string;
  alt_text?: string | null;
  caption?: string | null;
  folder_id?: string | null;
  is_published?: boolean;
}

export interface MediaUploadResult {
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_type: MediaFileType;
  width?: number | null;
  height?: number | null;
}

export interface SignedUrlResult {
  signedUrl: string;
  expiresIn: number;
}
