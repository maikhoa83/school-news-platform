import React from 'react';
import { HomepageBlock } from '../types';
import { FeaturedBlock } from './blocks/FeaturedBlock';
import { NewsGridBlock } from './blocks/NewsGridBlock';
import { NewsListBlock } from './blocks/NewsListBlock';
import { AnnouncementsBlock } from './blocks/AnnouncementsBlock';
import { DocumentsBlock } from './blocks/DocumentsBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { AlertCircle } from 'lucide-react';

interface BlockRendererProps {
  block: HomepageBlock;
  isPreview?: boolean;
}

export function BlockRenderer({ block, isPreview = false }: BlockRendererProps) {
  // If block is set to invisible and we are not in preview/editor mode, do not render
  if (!block.isVisible && !isPreview) {
    return null;
  }

  // Registry dispatcher
  switch (block.blockType) {
    case 'featured':
      return <FeaturedBlock block={block} isPreview={isPreview} />;

    case 'news-grid':
      return <NewsGridBlock block={block} isPreview={isPreview} />;

    case 'news-list':
      return <NewsListBlock block={block} isPreview={isPreview} />;

    case 'announcements':
      return <AnnouncementsBlock block={block} isPreview={isPreview} />;

    case 'documents':
      return <DocumentsBlock block={block} isPreview={isPreview} />;

    case 'spacer':
      return <SpacerBlock block={block} isPreview={isPreview} />;

    default:
      return (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Khối không xác định: <code>{block.blockType}</code>
          </span>
        </div>
      );
  }
}
