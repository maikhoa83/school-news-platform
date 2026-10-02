/**
 * Default Starter Layout Configuration
 * Baseline 12-column layout (MAIN 8 cols + RIGHT 4 cols)
 */

import { HomepageBlock, HomepageLayout } from '../types';

export const defaultStarterBlocks: HomepageBlock[] = [
  // MAIN Zone (8 columns)
  {
    id: '10000000-0000-4000-8000-000000000001',
    layoutId: '00000000-0000-4000-8000-000000000001',
    blockType: 'featured',
    zone: 'main',
    sortOrder: 0,
    isVisible: true,
    config: {
      title: 'Tiêu điểm hoạt động',
      variant: 'banner',
      dataSource: {
        module: 'news',
        query: { limit: 1, isFeatured: true },
      },
      presentation: {
        showDate: true,
        showExcerpt: true,
      },
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    layoutId: '00000000-0000-4000-8000-000000000001',
    blockType: 'news-grid',
    zone: 'main',
    sortOrder: 1,
    isVisible: true,
    config: {
      title: 'Tin tức & Hoạt động nổi bật',
      variant: 'standard',
      dataSource: {
        module: 'news',
        query: { limit: 4 },
      },
      presentation: {
        columns: 2,
        maxItems: 4,
        showDate: true,
        showExcerpt: true,
        showThumbnail: true,
      },
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    layoutId: '00000000-0000-4000-8000-000000000001',
    blockType: 'spacer',
    zone: 'main',
    sortOrder: 2,
    isVisible: true,
    config: {
      height: 'md',
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    layoutId: '00000000-0000-4000-8000-000000000001',
    blockType: 'news-list',
    zone: 'main',
    sortOrder: 3,
    isVisible: true,
    config: {
      title: 'Tin giáo dục & phong trào thi đua',
      variant: 'compact',
      dataSource: {
        module: 'news',
        query: { limit: 5 },
      },
      presentation: {
        maxItems: 5,
        showDate: true,
        showExcerpt: false,
      },
    },
  },

  // RIGHT Zone (4 columns)
  {
    id: '10000000-0000-4000-8000-000000000005',
    layoutId: '00000000-0000-4000-8000-000000000001',
    blockType: 'announcements',
    zone: 'right',
    sortOrder: 0,
    isVisible: true,
    config: {
      title: 'Thông báo điều hành',
      variant: 'standard',
      dataSource: {
        module: 'announcements',
        query: { limit: 4 },
      },
      presentation: {
        maxItems: 4,
        showDate: true,
        showBadge: true,
      },
    },
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    layoutId: '00000000-0000-4000-8000-000000000001',
    blockType: 'documents',
    zone: 'right',
    sortOrder: 1,
    isVisible: true,
    config: {
      title: 'Văn bản & Biểu mẫu mới',
      variant: 'standard',
      dataSource: {
        module: 'documents',
        query: { limit: 4 },
      },
      presentation: {
        maxItems: 4,
        showDate: true,
      },
    },
  },
];

export const defaultStarterLayout: HomepageLayout = {
  id: '00000000-0000-4000-8000-000000000001',
  title: 'Bố cục trang chủ chuẩn (12 cột: Main 8 + Right 4)',
  status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: '2026-01-01T00:00:00.000Z',
  blocks: defaultStarterBlocks,
};
