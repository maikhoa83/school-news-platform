/**
 * Homepage Builder Types & Schemas
 * School News Platform - Step 04 Foundation
 */

import React from 'react';

export type ZoneType = 'main' | 'right';

export type BlockType =
  | 'featured'
  | 'news-grid'
  | 'news-list'
  | 'announcements'
  | 'documents'
  | 'spacer';

export type LayoutStatus = 'draft' | 'published' | 'archived';

export interface HomepageBlockRow {
  id: string;
  layout_id: string;
  block_type: BlockType;
  zone: ZoneType;
  sort_order: number;
  is_visible: boolean;
  config: BlockConfig;
  created_at?: string;
  updated_at?: string;
}

export function generateBlockId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface BlockDataSource {
  module: string;
  query?: Record<string, unknown>;
}

export interface BlockPresentation {
  columns?: 1 | 2 | 3 | 4;
  maxItems?: number;
  showDate?: boolean;
  showExcerpt?: boolean;
  showThumbnail?: boolean;
  showBadge?: boolean;
}

export interface BlockConfig {
  title?: string;
  subtitle?: string;
  dataSource?: BlockDataSource;
  presentation?: BlockPresentation;
  variant?: 'banner' | 'card' | 'compact' | 'standard';
  height?: 'sm' | 'md' | 'lg' | 'xl';
  customLink?: string;
  customLinkText?: string;
  [key: string]: unknown;
}

export interface HomepageBlock {
  id: string;
  layoutId?: string;
  blockType: BlockType;
  zone: ZoneType;
  sortOrder: number;
  isVisible: boolean;
  config: BlockConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageLayout {
  id: string;
  title: string;
  status: LayoutStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  publishedBy?: string | null;
  blocks: HomepageBlock[];
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  iconName: string;
  supportedZones: ZoneType[];
  defaultZone: ZoneType;
  defaultConfig: BlockConfig;
}

export interface BlockRenderProps {
  block: HomepageBlock;
  isPreview?: boolean;
  className?: string;
}
