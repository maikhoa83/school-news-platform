/**
 * Feature Hook: useHomepageLayout
 * Manages homepage layout state, block operations, saving draft, and publishing.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { HomepageBlock, HomepageLayout, ZoneType, BlockType, BlockConfig, generateBlockId } from '../types';
import {
  getDraftHomepageLayout,
  getPublishedHomepageLayout,
  saveDraftHomepageLayout,
  publishHomepageLayout,
} from '../services/homepageService';
import { getBlockDefinition } from '../config/blockRegistry';
import { defaultStarterBlocks } from '../config/starterLayout';

interface UseHomepageLayoutOptions {
  mode?: 'draft' | 'published';
  autoFetch?: boolean;
}

export function useHomepageLayout({
  mode = 'draft',
  autoFetch = true,
}: UseHomepageLayoutOptions = {}) {
  const [layout, setLayout] = useState<HomepageLayout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load layout from service
  const fetchLayout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data =
        mode === 'published'
          ? await getPublishedHomepageLayout()
          : await getDraftHomepageLayout();
      setLayout(data);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bố cục trang chủ');
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (autoFetch) {
      fetchLayout();
    }
  }, [autoFetch, fetchLayout]);

  // Derived zone blocks
  const mainBlocks = useMemo(() => {
    if (!layout) return [];
    return layout.blocks
      .filter((b) => b.zone === 'main')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [layout]);

  const rightBlocks = useMemo(() => {
    if (!layout) return [];
    return layout.blocks
      .filter((b) => b.zone === 'right')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [layout]);

  // ADD BLOCK
  const addBlock = useCallback(
    (blockType: BlockType, targetZone: ZoneType, customConfig?: BlockConfig) => {
      setLayout((prev) => {
        if (!prev) return prev;
        const definition = getBlockDefinition(blockType);
        const zoneBlocks = prev.blocks.filter((b) => b.zone === targetZone);
        const newSortOrder = zoneBlocks.length;

        const newBlock: HomepageBlock = {
          id: generateBlockId(),
          layoutId: prev.id,
          blockType,
          zone: targetZone,
          sortOrder: newSortOrder,
          isVisible: true,
          config: {
            ...definition.defaultConfig,
            ...(customConfig || {}),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setIsDirty(true);
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
        };
      });
    },
    []
  );

  // REMOVE BLOCK
  const removeBlock = useCallback((blockId: string) => {
    setLayout((prev) => {
      if (!prev) return prev;
      const target = prev.blocks.find((b) => b.id === blockId);
      if (!target) return prev;

      const remaining = prev.blocks.filter((b) => b.id !== blockId);
      // Re-index sortOrder for blocks in that zone
      const reindexed = remaining.map((b) => {
        if (b.zone === target.zone && b.sortOrder > target.sortOrder) {
          return { ...b, sortOrder: b.sortOrder - 1 };
        }
        return b;
      });

      setIsDirty(true);
      return {
        ...prev,
        blocks: reindexed,
      };
    });
  }, []);

  // TOGGLE VISIBILITY
  const toggleVisibility = useCallback((blockId: string) => {
    setLayout((prev) => {
      if (!prev) return prev;
      const updated = prev.blocks.map((b) =>
        b.id === blockId ? { ...b, isVisible: !b.isVisible } : b
      );
      setIsDirty(true);
      return {
        ...prev,
        blocks: updated,
      };
    });
  }, []);

  // MOVE BLOCK UP OR DOWN IN ZONE
  const moveBlock = useCallback(
    (blockId: string, direction: 'up' | 'down') => {
      setLayout((prev) => {
        if (!prev) return prev;
        const currentBlock = prev.blocks.find((b) => b.id === blockId);
        if (!currentBlock) return prev;

        const zone = currentBlock.zone;
        const zoneBlocks = prev.blocks
          .filter((b) => b.zone === zone)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const currentIndex = zoneBlocks.findIndex((b) => b.id === blockId);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= zoneBlocks.length) {
          return prev; // cannot move past boundary
        }

        const otherBlock = zoneBlocks[targetIndex];

        // Swap sort orders
        const updatedBlocks = prev.blocks.map((b) => {
          if (b.id === currentBlock.id) {
            return { ...b, sortOrder: otherBlock.sortOrder };
          }
          if (b.id === otherBlock.id) {
            return { ...b, sortOrder: currentBlock.sortOrder };
          }
          return b;
        });

        setIsDirty(true);
        return {
          ...prev,
          blocks: updatedBlocks,
        };
      });
    },
    []
  );

  // UPDATE BLOCK CONFIG
  const updateBlockConfig = useCallback(
    (blockId: string, newConfig: Partial<BlockConfig>) => {
      setLayout((prev) => {
        if (!prev) return prev;
        const updated = prev.blocks.map((b) => {
          if (b.id === blockId) {
            return {
              ...b,
              config: {
                ...b.config,
                ...newConfig,
              },
              updatedAt: new Date().toISOString(),
            };
          }
          return b;
        });
        setIsDirty(true);
        return {
          ...prev,
          blocks: updated,
        };
      });
    },
    []
  );

  // SAVE DRAFT
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!layout) return false;
    setIsSaving(true);
    setError(null);
    try {
      const res = await saveDraftHomepageLayout(
        layout.id,
        layout.title,
        layout.blocks
      );
      if (res.success) {
        setIsDirty(false);
        setLastSaved(new Date());
        if (res.layout) {
          setLayout(res.layout);
        }
        return true;
      } else {
        setError(res.error || 'Lỗi khi lưu bản nháp');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu bản nháp');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [layout]);

  // PUBLISH
  const publish = useCallback(
    async (publishedBy?: string): Promise<boolean> => {
      if (!layout) return false;
      setIsPublishing(true);
      setError(null);
      try {
        const res = await publishHomepageLayout(
          layout.id,
          layout.title,
          layout.blocks,
          publishedBy
        );
        if (res.success) {
          setIsDirty(false);
          setLastSaved(new Date());
          if (res.newDraft) {
            setLayout(res.newDraft);
          } else if (res.layout) {
            setLayout(res.layout);
          }
          return true;
        } else {
          setError(res.error || 'Lỗi khi xuất bản bố cục');
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể xuất bản bố cục');
        return false;
      } finally {
        setIsPublishing(false);
      }
    },
    [layout]
  );

  // RESET TO DEFAULT STARTER
  const resetToStarter = useCallback(() => {
    setLayout((prev) => {
      if (!prev) return prev;
      setIsDirty(true);
      const freshBlocks: HomepageBlock[] = defaultStarterBlocks.map((b) => ({
        ...b,
        id: generateBlockId(),
        layoutId: prev.id,
      }));
      return {
        ...prev,
        blocks: freshBlocks,
      };
    });
  }, []);

  return {
    layout,
    mainBlocks,
    rightBlocks,
    isLoading,
    isSaving,
    isPublishing,
    error,
    isDirty,
    lastSaved,
    refetch: fetchLayout,
    addBlock,
    removeBlock,
    toggleVisibility,
    moveBlock,
    updateBlockConfig,
    saveDraft,
    publish,
    resetToStarter,
  };
}
