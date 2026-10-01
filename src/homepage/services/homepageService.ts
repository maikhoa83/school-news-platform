/**
 * Homepage Service
 * Data access and state persistence for Homepage Layout and Blocks
 * Supports Supabase with graceful fallback to localStorage and Starter defaults
 */

import { supabase } from '../../lib/supabase';
import {
  HomepageBlock,
  HomepageLayout,
  LayoutStatus,
  ZoneType,
  BlockType,
  BlockConfig,
  generateBlockId,
} from '../types';
import { defaultStarterLayout, defaultStarterBlocks } from '../config/starterLayout';

const LOCAL_STORAGE_KEY_DRAFT = 'school_homepage_layout_draft';
const LOCAL_STORAGE_KEY_PUBLISHED = 'school_homepage_layout_published';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureUuid(id: string | undefined): string {
  if (id && UUID_REGEX.test(id)) {
    return id;
  }
  return generateBlockId();
}

/**
 * Helper to map raw DB block row to HomepageBlock interface
 */
function mapDbBlock(raw: Record<string, unknown>): HomepageBlock {
  return {
    id: String(raw.id),
    layoutId: typeof raw.layout_id === 'string' ? raw.layout_id : undefined,
    blockType: raw.block_type as BlockType,
    zone: raw.zone as ZoneType,
    sortOrder: typeof raw.sort_order === 'number' ? raw.sort_order : 0,
    isVisible: typeof raw.is_visible === 'boolean' ? raw.is_visible : true,
    config: (raw.config || {}) as BlockConfig,
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
}

/**
 * Fetch the currently active Published Homepage Layout
 */
export async function getPublishedHomepageLayout(): Promise<HomepageLayout> {
  try {
    const { data: layoutData, error: layoutError } = await supabase
      .from('homepage_layouts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (layoutError) {
      console.warn('[homepageService] Supabase error fetching published layout:', layoutError.message);
      return getFallbackPublishedLayout();
    }

    if (!layoutData) {
      return getFallbackPublishedLayout();
    }

    // Fetch blocks for this layout
    const { data: blocksData, error: blocksError } = await supabase
      .from('homepage_blocks')
      .select('*')
      .eq('layout_id', layoutData.id)
      .order('sort_order', { ascending: true });

    if (blocksError) {
      console.warn('[homepageService] Error fetching blocks for published layout:', blocksError.message);
      return getFallbackPublishedLayout();
    }

    const blocks = (blocksData || []).map(mapDbBlock);

    return {
      id: layoutData.id,
      title: layoutData.title,
      status: 'published',
      createdAt: layoutData.created_at,
      updatedAt: layoutData.updated_at,
      publishedAt: layoutData.published_at,
      publishedBy: layoutData.published_by,
      blocks: blocks.length > 0 ? blocks : defaultStarterBlocks,
    };
  } catch (err) {
    console.warn('[homepageService] Exception in getPublishedHomepageLayout:', err);
    return getFallbackPublishedLayout();
  }
}

/**
 * Fetch the current Draft Homepage Layout (for Editor)
 */
export async function getDraftHomepageLayout(): Promise<HomepageLayout> {
  try {
    const { data: layoutData, error: layoutError } = await supabase
      .from('homepage_layouts')
      .select('*')
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (layoutError) {
      console.warn('[homepageService] Supabase error fetching draft layout:', layoutError.message);
      return getFallbackDraftLayout();
    }

    if (!layoutData) {
      // If no draft exists yet in DB, check published or fallback
      const published = await getPublishedHomepageLayout();
      return {
        ...published,
        id: 'draft-' + Date.now(),
        status: 'draft',
        title: 'Bản nháp trang chủ',
      };
    }

    // Fetch blocks for draft layout
    const { data: blocksData, error: blocksError } = await supabase
      .from('homepage_blocks')
      .select('*')
      .eq('layout_id', layoutData.id)
      .order('sort_order', { ascending: true });

    if (blocksError) {
      console.warn('[homepageService] Error fetching blocks for draft:', blocksError.message);
      return getFallbackDraftLayout();
    }

    const blocks = (blocksData || []).map(mapDbBlock);

    return {
      id: layoutData.id,
      title: layoutData.title,
      status: 'draft',
      createdAt: layoutData.created_at,
      updatedAt: layoutData.updated_at,
      blocks: blocks.length > 0 ? blocks : defaultStarterBlocks,
    };
  } catch (err) {
    console.warn('[homepageService] Exception in getDraftHomepageLayout:', err);
    return getFallbackDraftLayout();
  }
}

/**
 * Save draft layout and its blocks
 * Enforces sequential sort order per zone and valid UUIDs for all blocks
 */
export async function saveDraftHomepageLayout(
  layoutId: string,
  title: string,
  blocks: HomepageBlock[]
): Promise<{ success: boolean; layout?: HomepageLayout; error?: string }> {
  const now = new Date().toISOString();
  const validLayoutId = ensureUuid(layoutId);

  // Group and normalize sequential sort order per zone
  const mainBlocks = blocks.filter((b) => b.zone === 'main').sort((a, b) => a.sortOrder - b.sortOrder);
  const rightBlocks = blocks.filter((b) => b.zone === 'right').sort((a, b) => a.sortOrder - b.sortOrder);

  const normalizedBlocks: HomepageBlock[] = [
    ...mainBlocks.map((b, idx) => ({
      ...b,
      id: ensureUuid(b.id),
      layoutId: validLayoutId,
      sortOrder: idx,
    })),
    ...rightBlocks.map((b, idx) => ({
      ...b,
      id: ensureUuid(b.id),
      layoutId: validLayoutId,
      sortOrder: idx,
    })),
  ];

  const currentLayout: HomepageLayout = {
    id: validLayoutId,
    title: title || 'Bố cục trang chủ (Bản nháp)',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    blocks: normalizedBlocks,
  };

  // 1. Sync to localStorage for immediate offline persistence
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(currentLayout));
  } catch (e) {
    // ignore
  }

  // 2. Persist to Supabase with draft check
  try {
    const { error: layoutError } = await supabase
      .from('homepage_layouts')
      .upsert({
        id: currentLayout.id,
        title: currentLayout.title,
        status: 'draft',
        updated_at: now,
      });

    if (layoutError) {
      console.warn('[homepageService] DB error upserting draft layout:', layoutError.message);
      return { success: false, error: layoutError.message };
    }

    // Delete existing blocks and re-insert current block state
    const { error: deleteError } = await supabase
      .from('homepage_blocks')
      .delete()
      .eq('layout_id', currentLayout.id);

    if (deleteError) {
      console.warn('[homepageService] DB error deleting old draft blocks:', deleteError.message);
      return { success: false, error: deleteError.message };
    }

    if (normalizedBlocks.length > 0) {
      const dbBlocks = normalizedBlocks.map((b) => ({
        id: b.id,
        layout_id: currentLayout.id,
        block_type: b.blockType,
        zone: b.zone,
        sort_order: b.sortOrder,
        is_visible: b.isVisible,
        config: b.config,
        updated_at: now,
      }));

      const { error: blocksError } = await supabase
        .from('homepage_blocks')
        .insert(dbBlocks);

      if (blocksError) {
        console.warn('[homepageService] DB error inserting blocks:', blocksError.message);
        return { success: false, error: blocksError.message };
      }
    }

    return { success: true, layout: currentLayout };
  } catch (err) {
    console.warn('[homepageService] Exception in saveDraftHomepageLayout:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi không xác định' };
  }
}

/**
 * Publish the homepage layout using the atomic database RPC publish_homepage_layout.
 * Replaces client-side multi-mutations with single atomic transition.
 */
export async function publishHomepageLayout(
  layoutId: string,
  title: string,
  blocks: HomepageBlock[],
  publishedBy?: string
): Promise<{ success: boolean; layout?: HomepageLayout; newDraft?: HomepageLayout; error?: string }> {
  // 1. Ensure draft is up-to-date in database before invoking publish RPC
  const saveResult = await saveDraftHomepageLayout(layoutId, title, blocks);
  if (!saveResult.success) {
    return {
      success: false,
      error: saveResult.error || 'Không thể lưu bản nháp trước khi xuất bản',
    };
  }

  const targetDraftId = saveResult.layout?.id || layoutId;

  // 2. Invoke server-side atomic RPC
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('publish_homepage_layout', {
      p_draft_id: targetDraftId,
    });

    if (rpcError) {
      console.warn('[homepageService] RPC error publishing layout:', rpcError.message);
      return { success: false, error: rpcError.message };
    }

    // 3. Fetch newly published layout from DB to ensure complete sync
    const publishedLayout = await getPublishedHomepageLayout();

    // 4. Update localStorage cache for instant offline fallback
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PUBLISHED, JSON.stringify(publishedLayout));
    } catch (e) {
      // ignore
    }

    // 5. Fetch newly created working draft if provided by RPC
    let newDraftLayout: HomepageLayout | undefined;
    if (rpcData && typeof rpcData === 'object' && 'new_draft_id' in rpcData) {
      const { data: draftData } = await supabase
        .from('homepage_layouts')
        .select('*')
        .eq('id', (rpcData as { new_draft_id: string }).new_draft_id)
        .maybeSingle();

      if (draftData) {
        const { data: draftBlocks } = await supabase
          .from('homepage_blocks')
          .select('*')
          .eq('layout_id', draftData.id)
          .order('sort_order', { ascending: true });

        newDraftLayout = {
          id: draftData.id,
          title: draftData.title,
          status: 'draft',
          createdAt: draftData.created_at,
          updatedAt: draftData.updated_at,
          blocks: (draftBlocks || []).map(mapDbBlock),
        };

        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(newDraftLayout));
        } catch (e) {
          // ignore
        }
      }
    }

    return {
      success: true,
      layout: publishedLayout,
      newDraft: newDraftLayout,
    };
  } catch (err) {
    console.warn('[homepageService] Exception in publishHomepageLayout:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xuất bản bố cục',
    };
  }
}

/**
 * Local fallback helpers
 */
function getFallbackPublishedLayout(): HomepageLayout {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY_PUBLISHED);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // ignore
  }
  return defaultStarterLayout;
}

function getFallbackDraftLayout(): HomepageLayout {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // ignore
  }
  return {
    ...defaultStarterLayout,
    id: '00000000-0000-0000-0000-000000000002',
    title: 'Bố cục trang chủ (Bản nháp)',
    status: 'draft',
  };
}
