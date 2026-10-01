/**
 * Block Registry
 * Central management of all supported blocks for the Homepage Builder.
 * Maps block type to metadata, zone constraints, and default configurations.
 */

import { BlockDefinition, BlockType, ZoneType } from '../types';

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  featured: {
    type: 'featured',
    label: 'Tiêu điểm nổi bật',
    description: 'Khối thông tin sự kiện hoặc bài viết nổi bật với hình ảnh lớn và tóm tắt ấn tượng.',
    iconName: 'Sparkles',
    supportedZones: ['main'],
    defaultZone: 'main',
    defaultConfig: {
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

  'news-grid': {
    type: 'news-grid',
    label: 'Tin tức dạng lưới (Grid)',
    description: 'Hiển thị danh sách tin bài theo dạng lưới đa cột có ảnh đại diện, tiêu đề và ngày đăng.',
    iconName: 'Grid',
    supportedZones: ['main'],
    defaultZone: 'main',
    defaultConfig: {
      title: 'Tin tức & Hoạt động nhà trường',
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

  'news-list': {
    type: 'news-list',
    label: 'Tin tức dạng danh sách (List)',
    description: 'Hiển thị bài viết theo hàng dọc súc tích kèm biểu tượng chuyên mục, phù hợp tổng hợp tin ngắn.',
    iconName: 'List',
    supportedZones: ['main', 'right'],
    defaultZone: 'main',
    defaultConfig: {
      title: 'Tin ngành & Thi đua',
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

  announcements: {
    type: 'announcements',
    label: 'Thông báo điều hành',
    description: 'Danh sách thông báo khẩn, lịch công tác và thông báo chính thức từ Ban Giám hiệu.',
    iconName: 'BellRing',
    supportedZones: ['main', 'right'],
    defaultZone: 'right',
    defaultConfig: {
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

  documents: {
    type: 'documents',
    label: 'Văn bản & Biểu mẫu',
    description: 'Danh sách công văn, quyết định, hướng dẫn chuyên môn và biểu mẫu hành chính mới ban hành.',
    iconName: 'FileText',
    supportedZones: ['main', 'right'],
    defaultZone: 'right',
    defaultConfig: {
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

  spacer: {
    type: 'spacer',
    label: 'Khoảng đệm (Spacer)',
    description: 'Khoảng cách trực quan tùy biến giữa các khối để tạo nhịp điệu thị giác thông thoáng.',
    iconName: 'MoveVertical',
    supportedZones: ['main', 'right'],
    defaultZone: 'main',
    defaultConfig: {
      height: 'md',
    },
  },
};

/**
 * Get definition for a given block type
 */
export function getBlockDefinition(type: BlockType): BlockDefinition {
  return BLOCK_REGISTRY[type] || BLOCK_REGISTRY['news-grid'];
}

/**
 * Get all available block definitions compatible with a specific zone
 */
export function getBlocksForZone(zone: ZoneType): BlockDefinition[] {
  return Object.values(BLOCK_REGISTRY).filter((def) =>
    def.supportedZones.includes(zone)
  );
}
