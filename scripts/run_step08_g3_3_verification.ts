/**
 * SCHOOL NEWS PLATFORM — STEP 08 MEDIA MODULE
 * PHASE G3.3 — PUBLIC MEDIA GALLERY & ALBUM VIEWING
 * Verification Gate & Compliance Runner
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

interface CheckResult {
  id: string;
  category: string;
  item: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: CheckResult[] = [];

function recordCheck(check: CheckResult) {
  results.push(check);
  const mark = check.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
  console.log(`[${mark}] ${check.id} - ${check.item}`);
  if (check.status === 'FAIL' && check.details) {
    console.log(`       Details: ${check.details}`);
  }
}

async function runG33Verification() {
  console.log('============================================================');
  console.log('SCHOOL NEWS PLATFORM — STEP 08 G3.3 VERIFICATION RUNNER');
  console.log('Target: Public Media Gallery, Album Detail & Accessible Viewer');
  console.log('============================================================\n');

  const root = process.cwd();

  // --------------------------------------------------------------------------
  // 1. FILE & COMPONENT EXISTENCE
  // --------------------------------------------------------------------------
  console.log('--- [GATE 1] Component & File Verification ---');

  const requiredFiles = [
    'src/modules/media/hooks/usePublicAlbums.ts',
    'src/modules/media/hooks/usePublicAlbumDetail.ts',
    'src/modules/media/components/PublicAlbumCard.tsx',
    'src/modules/media/components/PublicAlbumGrid.tsx',
    'src/modules/media/components/PublicAlbumGallery.tsx',
    'src/modules/media/components/PublicMediaViewer.tsx',
    'src/modules/media/pages/PublicAlbumsListPage.tsx',
    'src/modules/media/pages/PublicAlbumDetailPage.tsx',
    'src/pages/public/PublicAlbumsListPage.tsx',
    'src/pages/public/PublicAlbumDetailPage.tsx',
  ];

  for (const relPath of requiredFiles) {
    const fullPath = path.resolve(root, relPath);
    const exists = fs.existsSync(fullPath);
    recordCheck({
      id: `FILE-${path.basename(relPath, path.extname(relPath))}`,
      category: 'File Verification',
      item: `File existence: ${relPath}`,
      expected: 'File exists on disk',
      actual: exists ? 'File exists' : 'File missing',
      status: exists ? 'PASS' : 'FAIL',
    });
  }

  // --------------------------------------------------------------------------
  // 2. ROUTE REGISTRATION & MODULE GUARD
  // --------------------------------------------------------------------------
  console.log('\n--- [GATE 2] Route Registration & Module Guard ---');
  const routesPath = path.resolve(root, 'src/routes/index.tsx');
  const routesContent = fs.existsSync(routesPath) ? fs.readFileSync(routesPath, 'utf8') : '';

  const hasAlbumsRoute = routesContent.includes('path="/albums"') && routesContent.includes('<PublicAlbumsListPage');
  const hasAlbumDetailRoute = routesContent.includes('path="/albums/:slug"') && routesContent.includes('<PublicAlbumDetailPage');
  const hasGalleryRoute = routesContent.includes('path="/gallery"') && routesContent.includes('<PublicAlbumsListPage');
  const hasGalleryDetailRoute = routesContent.includes('path="/gallery/:slug"') && routesContent.includes('<PublicAlbumDetailPage');
  const hasModuleGuard = routesContent.includes('moduleKey="albums"');

  recordCheck({
    id: 'ROUTE-ALBUMS-LIST',
    category: 'Routing',
    item: 'Public /albums route registration',
    expected: '/albums routes to PublicAlbumsListPage with ModuleGuard',
    actual: hasAlbumsRoute && hasModuleGuard ? 'Properly configured' : 'Missing or incomplete',
    status: hasAlbumsRoute && hasModuleGuard ? 'PASS' : 'FAIL',
  });

  recordCheck({
    id: 'ROUTE-ALBUM-DETAIL',
    category: 'Routing',
    item: 'Public /albums/:slug route registration',
    expected: '/albums/:slug routes to PublicAlbumDetailPage with ModuleGuard',
    actual: hasAlbumDetailRoute && hasModuleGuard ? 'Properly configured' : 'Missing or incomplete',
    status: hasAlbumDetailRoute && hasModuleGuard ? 'PASS' : 'FAIL',
  });

  recordCheck({
    id: 'ROUTE-GALLERY-ALIAS',
    category: 'Routing',
    item: 'Public /gallery and /gallery/:slug route aliases',
    expected: '/gallery & /gallery/:slug registered and guarded',
    actual: hasGalleryRoute && hasGalleryDetailRoute ? 'Properly configured' : 'Missing or incomplete',
    status: hasGalleryRoute && hasGalleryDetailRoute ? 'PASS' : 'FAIL',
  });

  // --------------------------------------------------------------------------
  // 3. ARCHITECTURAL & SECURITY ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- [GATE 3] Architecture & Security Isolation ---');

  for (const relPath of requiredFiles) {
    const fullPath = path.resolve(root, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');

    // No direct supabase access
    const hasDirectSupabase =
      content.includes('@supabase/supabase-js') ||
      content.includes("from '../../lib/supabase'") ||
      content.includes("from '../../../lib/supabase'");

    recordCheck({
      id: `SEC-NO-SUPABASE-${path.basename(relPath, path.extname(relPath))}`,
      category: 'Security Isolation',
      item: `No direct Supabase imports in ${path.basename(relPath)}`,
      expected: 'No direct Supabase client access from UI layer',
      actual: hasDirectSupabase ? 'Found direct Supabase import' : 'Zero direct Supabase imports',
      status: !hasDirectSupabase ? 'PASS' : 'FAIL',
    });

    // No dangerous HTML injection
    const hasDangerousHtml = /dangerouslySetInnerHTML\s*=/.test(content);
    recordCheck({
      id: `SEC-NO-DANGEROUS-HTML-${path.basename(relPath, path.extname(relPath))}`,
      category: 'XSS Prevention',
      item: `No dangerouslySetInnerHTML in ${path.basename(relPath)}`,
      expected: 'Zero dangerouslySetInnerHTML',
      actual: hasDangerousHtml ? 'Found dangerouslySetInnerHTML' : 'Safe text rendering',
      status: !hasDangerousHtml ? 'PASS' : 'FAIL',
    });

    // No persistent storage of signed URLs or tokens
    const hasStorageLeak = content.includes('localStorage') || content.includes('sessionStorage');
    recordCheck({
      id: `SEC-NO-STORAGE-LEAK-${path.basename(relPath, path.extname(relPath))}`,
      category: 'Credential Hygiene',
      item: `No localStorage/sessionStorage usage in ${path.basename(relPath)}`,
      expected: 'Zero client storage usage',
      actual: hasStorageLeak ? 'Storage detected' : 'Clean memory handling',
      status: !hasStorageLeak ? 'PASS' : 'FAIL',
    });
  }

  // --------------------------------------------------------------------------
  // 4. ACCESSIBILITY & LIGHTBOX VIEWER CONTRACTS
  // --------------------------------------------------------------------------
  console.log('\n--- [GATE 4] Lightbox Viewer & Accessibility Contracts ---');

  const viewerPath = path.resolve(root, 'src/modules/media/components/PublicMediaViewer.tsx');
  const viewerContent = fs.existsSync(viewerPath) ? fs.readFileSync(viewerPath, 'utf8') : '';

  const hasDialogRole = viewerContent.includes('role="dialog"') && viewerContent.includes('aria-modal="true"');
  recordCheck({
    id: 'A11Y-VIEWER-DIALOG-ROLE',
    category: 'Accessibility',
    item: 'PublicMediaViewer dialog semantics',
    expected: 'role="dialog" and aria-modal="true" present',
    actual: hasDialogRole ? 'Dialog semantics present' : 'Missing dialog semantics',
    status: hasDialogRole ? 'PASS' : 'FAIL',
  });

  const hasEscapeKey = viewerContent.includes("e.key === 'Escape'");
  const hasArrowKeys = viewerContent.includes("e.key === 'ArrowLeft'") && viewerContent.includes("e.key === 'ArrowRight'");
  recordCheck({
    id: 'A11Y-VIEWER-KEYBOARD-NAV',
    category: 'Accessibility',
    item: 'PublicMediaViewer keyboard navigation (Escape, Left, Right)',
    expected: 'Escape closes; ArrowLeft/Right changes item',
    actual: hasEscapeKey && hasArrowKeys ? 'All keyboard shortcuts handled' : 'Missing keyboard handlers',
    status: hasEscapeKey && hasArrowKeys ? 'PASS' : 'FAIL',
  });

  const hasFocusTrap = viewerContent.includes('previousActiveElementRef') && viewerContent.includes('closeButtonRef');
  recordCheck({
    id: 'A11Y-VIEWER-FOCUS-MGMT',
    category: 'Accessibility',
    item: 'PublicMediaViewer focus restoration and focus management',
    expected: 'Focus restored to active element and trapped within modal',
    actual: hasFocusTrap ? 'Focus management implemented' : 'Missing focus restoration',
    status: hasFocusTrap ? 'PASS' : 'FAIL',
  });

  const hasNativeVideo = viewerContent.includes('<video') && viewerContent.includes('controls') && viewerContent.includes('playsInline');
  recordCheck({
    id: 'MEDIA-VIDEO-HTML5',
    category: 'Media Playback',
    item: 'PublicMediaViewer native HTML5 video with controls',
    expected: '<video> element with controls and playsInline (no autoplay audio)',
    actual: hasNativeVideo ? 'Native video properly configured' : 'Missing video element or controls',
    status: hasNativeVideo ? 'PASS' : 'FAIL',
  });

  // --------------------------------------------------------------------------
  // 5. SIGNED URL INTEGRATION & SERVICE DATA FLOW
  // --------------------------------------------------------------------------
  console.log('\n--- [GATE 5] Service Reuse & Signed URL Infrastructure ---');

  const usePublicAlbumsHook = path.resolve(root, 'src/modules/media/hooks/usePublicAlbums.ts');
  const usePublicAlbumsContent = fs.existsSync(usePublicAlbumsHook) ? fs.readFileSync(usePublicAlbumsHook, 'utf8') : '';
  const reusesGetPublicAlbums = usePublicAlbumsContent.includes('getPublicAlbums');

  recordCheck({
    id: 'SVC-REUSE-GET-PUBLIC-ALBUMS',
    category: 'Data Layer Reuse',
    item: 'usePublicAlbums calls mediaService.getPublicAlbums',
    expected: 'getPublicAlbums service function reused',
    actual: reusesGetPublicAlbums ? 'Service reused cleanly' : 'Service missing',
    status: reusesGetPublicAlbums ? 'PASS' : 'FAIL',
  });

  const usePublicAlbumDetailHook = path.resolve(root, 'src/modules/media/hooks/usePublicAlbumDetail.ts');
  const usePublicAlbumDetailContent = fs.existsSync(usePublicAlbumDetailHook) ? fs.readFileSync(usePublicAlbumDetailHook, 'utf8') : '';
  const reusesGetPublicAlbumBySlug = usePublicAlbumDetailContent.includes('getPublicAlbumBySlug');

  recordCheck({
    id: 'SVC-REUSE-GET-PUBLIC-ALBUM-BY-SLUG',
    category: 'Data Layer Reuse',
    item: 'usePublicAlbumDetail calls mediaService.getPublicAlbumBySlug',
    expected: 'getPublicAlbumBySlug service function reused',
    actual: reusesGetPublicAlbumBySlug ? 'Service reused cleanly' : 'Service missing',
    status: reusesGetPublicAlbumBySlug ? 'PASS' : 'FAIL',
  });

  const cardContent = fs.readFileSync(path.resolve(root, 'src/modules/media/components/PublicAlbumCard.tsx'), 'utf8');
  const galleryContent = fs.readFileSync(path.resolve(root, 'src/modules/media/components/PublicAlbumGallery.tsx'), 'utf8');
  const usesSignedUrlHook = cardContent.includes('useSignedUrl') && galleryContent.includes('useSignedUrl') && viewerContent.includes('useSignedUrl');

  recordCheck({
    id: 'SEC-SIGNED-URL-INTEGRATION',
    category: 'Private Media Storage',
    item: 'Signed URL hook integration across Card, Gallery, and Viewer',
    expected: 'Private media accessed strictly via temporary signed URLs',
    actual: usesSignedUrlHook ? 'All components use signed URLs' : 'Missing signed URL usage',
    status: usesSignedUrlHook ? 'PASS' : 'FAIL',
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n============================================================');
  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL CHECKS: ${results.length}`);
  console.log(`PASSED:       ${passCount}`);
  console.log(`FAILED:       ${failCount}`);
  console.log(`VERDICT:      ${failCount === 0 ? 'ALL CHECKS PASSED (100%)' : 'SOME CHECKS FAILED'}`);
  console.log('============================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runG33Verification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
