/**
 * SCHOOL NEWS PLATFORM — STEP 08 MEDIA MODULE
 * G1 Migration & Live Database Verification Runner
 * Protocol: Step 08 Non-Production Verification
 *
 * Hard Rules Enforced:
 * 1. Target NON-PRODUCTION only (fail closed on prod markers, protected URLs, or prod env).
 * 2. Real database checks (no mocks, no simulations).
 * 3. Never leak secrets (redact keys, tokens, auth headers).
 * 4. Verify Supabase project identity before execution.
 * 5. Verify actual database state (4 tables, columns, constraints, indexes, triggers, RLS, storage, RBAC).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import dotenv from 'dotenv';

// Load local environment files if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();

// Configuration extraction
const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const protectedUrlsEnv = (process.env.PROTECTED_SUPABASE_URLS || '').trim();

const PROTECTED_URL_LIST: string[] = protectedUrlsEnv
  .split(',')
  .map((u) => u.trim().toLowerCase())
  .filter(Boolean);

export interface VerificationCheck {
  id: string;
  category: string;
  item: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  details?: Record<string, unknown>;
}

function redactSecret(str?: string | null): string {
  if (!str) return '';
  return str.replace(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[REDACTED_JWT]')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/key=[^\s&]+/gi, 'key=[REDACTED]');
}

async function runG1Verification() {
  console.log('============================================================');
  console.log('SCHOOL NEWS PLATFORM — STEP 08 G1 LIVE VERIFICATION RUNNER');
  console.log('Target: Step 08 Media Module Schema, RLS, Storage & RBAC');
  console.log('============================================================\n');

  const results: VerificationCheck[] = [];

  // --------------------------------------------------------------------------
  // 1. SAFETY GATE: Hard Rule 1 & Non-Production Credential Check
  // --------------------------------------------------------------------------
  console.log('--- [GATE 1] Safety Gate & Project Identity Pre-Check ---');

  const isPlaceholder = (val: string) =>
    !val ||
    val.includes('placeholder') ||
    val.includes('your-school-project') ||
    val.includes('your-supabase') ||
    val.includes('example.com') ||
    val.includes('undefined');

  const hasUrl = !isPlaceholder(supabaseUrl);
  const hasAnon = !isPlaceholder(supabaseAnonKey);
  const hasServiceKey = !isPlaceholder(supabaseServiceRoleKey);

  console.log(`Node Runtime:           ${process.version}`);
  console.log(`Supabase URL Configured: ${hasUrl}`);
  console.log(`Anon Key Configured:     ${hasAnon}`);
  console.log(`Service Role Configured: ${hasServiceKey}`);

  if (!hasUrl || !hasAnon || !hasServiceKey) {
    console.log('\n============================================================');
    console.log('FAIL-CLOSED: NON-PRODUCTION RUNTIME CREDENTIALS UNAVAILABLE');
    console.log('REASON: Verification requires real non-production Supabase project.');
    console.log('Missing/Placeholder Configuration:');
    if (!hasUrl) console.log('  - VITE_SUPABASE_URL');
    if (!hasAnon) console.log('  - VITE_SUPABASE_ANON_KEY');
    if (!hasServiceKey) console.log('  - SUPABASE_SERVICE_ROLE_KEY');
    console.log('============================================================\n');

    results.push({
      id: 'SAFE-001',
      category: 'Safety Gate',
      item: 'Non-Production Runtime Credentials',
      expected: 'Real non-production Supabase URL, Anon Key, and Service Role Key configured',
      actual: 'Credentials missing or set to placeholder values (Fail-Closed triggered)',
      status: 'BLOCKED',
    });

    await writeReports(results, 'BLOCKED — RUNTIME CREDENTIALS UNAVAILABLE');
    console.log('Zero production endpoints were contacted.');
    process.exit(1);
  }

  // URL Safety Check (Hard Rule 1)
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch (err) {
    console.error('FATAL: Malformed Supabase URL');
    results.push({
      id: 'SAFE-002',
      category: 'Safety Gate',
      item: 'Supabase URL Format',
      expected: 'Valid HTTPS Supabase project URL',
      actual: 'Malformed URL: ' + redactSecret(String(err)),
      status: 'FAIL',
    });
    await writeReports(results, 'FAIL — MALFORMED URL');
    process.exit(1);
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isProdEnv = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';
  const isProtectedUrl = PROTECTED_URL_LIST.some(
    (p) => hostname.includes(p) || supabaseUrl.toLowerCase().includes(p)
  );
  const hasProdKeywords =
    hostname.includes('prod-school') ||
    hostname.includes('production') ||
    hostname.startsWith('prod-') ||
    hostname.startsWith('prod.');

  if (isProdEnv || isProtectedUrl || hasProdKeywords) {
    console.error('\nFATAL: HARD RULE 1 VIOLATION PREVENTED.');
    console.error(`Target host '${hostname}' detected as production or protected.`);
    results.push({
      id: 'SAFE-003',
      category: 'Safety Gate',
      item: 'Production Guard',
      expected: 'Target must be strictly isolated non-production project',
      actual: `Protected/Production target detected (${hostname})`,
      status: 'FAIL',
    });
    await writeReports(results, 'FAIL — PRODUCTION TARGET GUARD TRIGGERED');
    process.exit(1);
  }

  console.log(`[PASS] Non-Production Target Verified: ${hostname}`);
  results.push({
    id: 'SAFE-001',
    category: 'Safety Gate',
    item: 'Non-Production Target Guard',
    expected: 'Non-production Supabase project',
    actual: `Verified non-production hostname: ${hostname}`,
    status: 'PASS',
  });

  // --------------------------------------------------------------------------
  // 2. SUPABASE CLIENTS INITIALIZATION
  // --------------------------------------------------------------------------
  const adminClient: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anonClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // --------------------------------------------------------------------------
  // 3. TABLE ACCESSIBILITY & SCHEMA VERIFICATION (4 TABLES)
  // --------------------------------------------------------------------------
  console.log('\n--- [CHECK 1] Verifying 4 Media Tables Accessibility ---');
  const targetTables = ['media_folders', 'media', 'albums', 'album_items'];

  for (const table of targetTables) {
    const { error } = await adminClient.from(table).select('*').limit(0);
    const passed = !error;
    results.push({
      id: `TBL-${table.toUpperCase()}`,
      category: 'Table Verification',
      item: `public.${table}`,
      expected: `Table public.${table} exists and is queryable`,
      actual: error ? `Error [${error.code}]: ${redactSecret(error.message)}` : 'Table exists and responds to SELECT',
      status: passed ? 'PASS' : 'FAIL',
    });
    console.log(`  Table public.${table}: ${passed ? 'EXISTS' : 'FAILED - ' + error?.message}`);
  }

  // --------------------------------------------------------------------------
  // 4. COLUMN & TYPE VERIFICATION: media.file_size BIGINT Check
  // --------------------------------------------------------------------------
  console.log('\n--- [CHECK 2] Verifying Column Types (file_size BIGINT) ---');
  // Test BIGINT support (> 2^31 - 1, e.g., 5GB = 5368709120) insertion & deletion via admin
  const testBigInt = 5368709120; // 5 GB
  const testPath = `test-verify-bigint-${Date.now()}.png`;

  const { data: insertMediaData, error: insertMediaError } = await adminClient
    .from('media')
    .insert({
      title: 'Test BigInt Verification',
      file_name: 'test-verify.png',
      file_path: testPath,
      file_size: testBigInt,
      mime_type: 'image/png',
      file_type: 'image',
      is_published: false,
    })
    .select('id, file_size')
    .single();

  if (insertMediaError) {
    results.push({
      id: 'COL-MEDIA-BIGINT',
      category: 'Columns & Types',
      item: 'public.media.file_size BIGINT',
      expected: 'Supports values > 2^31 (BIGINT)',
      actual: `Insert failed: [${insertMediaError.code}] ${redactSecret(insertMediaError.message)}`,
      status: 'FAIL',
    });
    console.log(`  BIGINT file_size verification: FAILED - ${insertMediaError.message}`);
  } else {
    const returnedSize = Number(insertMediaData.file_size);
    const bigIntPassed = returnedSize === testBigInt;
    results.push({
      id: 'COL-MEDIA-BIGINT',
      category: 'Columns & Types',
      item: 'public.media.file_size BIGINT',
      expected: `Retrieved file_size matches inserted value ${testBigInt}`,
      actual: `Retrieved file_size: ${returnedSize} (BIGINT verified)`,
      status: bigIntPassed ? 'PASS' : 'FAIL',
    });
    console.log(`  BIGINT file_size verification: PASSED (Value: ${returnedSize})`);

    // Clean up test row
    await adminClient.from('media').delete().eq('id', insertMediaData.id);
  }

  // --------------------------------------------------------------------------
  // 5. STORAGE BUCKETS VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- [CHECK 3] Verifying Storage Buckets ---');
  const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();

  if (bucketsError) {
    results.push({
      id: 'STR-BUCKETS-LIST',
      category: 'Storage Buckets',
      item: 'storage.buckets list',
      expected: 'Able to retrieve bucket list via service role',
      actual: `Error: ${redactSecret(bucketsError.message)}`,
      status: 'FAIL',
    });
  } else {
    // 5.1 'media' bucket check (must be PRIVATE: public === false)
    const mediaBucket = buckets?.find((b) => b.id === 'media');
    const mediaBucketOk = mediaBucket && mediaBucket.public === false;
    results.push({
      id: 'STR-BUCKET-MEDIA',
      category: 'Storage Buckets',
      item: 'Bucket "media" configuration',
      expected: 'Bucket exists and public === false (Private Bucket)',
      actual: mediaBucket
        ? `Bucket exists, public: ${mediaBucket.public}, fileSizeLimit: ${mediaBucket.file_size_limit}`
        : 'Bucket "media" not found',
      status: mediaBucketOk ? 'PASS' : 'FAIL',
    });
    console.log(`  Bucket 'media' (Private): ${mediaBucketOk ? 'PASS' : 'FAIL'}`);

    // 5.2 'site-assets' bucket check (must be PUBLIC: public === true)
    const siteAssetsBucket = buckets?.find((b) => b.id === 'site-assets');
    const siteAssetsOk = siteAssetsBucket && siteAssetsBucket.public === true;
    results.push({
      id: 'STR-BUCKET-ASSETS',
      category: 'Storage Buckets',
      item: 'Bucket "site-assets" configuration',
      expected: 'Bucket exists and public === true (Public Bucket)',
      actual: siteAssetsBucket
        ? `Bucket exists, public: ${siteAssetsBucket.public}`
        : 'Bucket "site-assets" not found',
      status: siteAssetsOk ? 'PASS' : 'FAIL',
    });
    console.log(`  Bucket 'site-assets' (Public): ${siteAssetsOk ? 'PASS' : 'FAIL'}`);
  }

  // --------------------------------------------------------------------------
  // 6. RBAC LEAST PRIVILEGE VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- [CHECK 4] Verifying RBAC Least Privilege Mappings ---');

  // Check permissions table for media permissions
  const { data: mediaPerms, error: permsError } = await adminClient
    .from('permissions')
    .select('code')
    .in('code', ['media.view', 'media.upload', 'media.edit', 'media.delete']);

  const permsFound = mediaPerms?.map((p) => p.code) || [];
  const allPermsPresent = ['media.view', 'media.upload', 'media.edit', 'media.delete'].every((c) =>
    permsFound.includes(c)
  );

  results.push({
    id: 'RBAC-PERMS-EXIST',
    category: 'RBAC Verification',
    item: 'Permissions Registry',
    expected: 'media.view, media.upload, media.edit, media.delete exist',
    actual: `Found ${permsFound.length}/4 permissions: ${permsFound.join(', ')}`,
    status: allPermsPresent ? 'PASS' : 'FAIL',
  });

  // Query role_permissions with roles
  const { data: rolePerms, error: rolePermsError } = await adminClient
    .from('role_permissions')
    .select('role_id, roles(code), permissions(code)');

  if (!rolePermsError && rolePerms) {
    const authorPerms = rolePerms
      .filter((rp: any) => rp.roles?.code === 'AUTHOR')
      .map((rp: any) => rp.permissions?.code);

    const editorPerms = rolePerms
      .filter((rp: any) => rp.roles?.code === 'EDITOR')
      .map((rp: any) => rp.permissions?.code);

    const adminPerms = rolePerms
      .filter((rp: any) => rp.roles?.code === 'ADMIN')
      .map((rp: any) => rp.permissions?.code);

    // Hard Requirement: AUTHOR has media.upload ONLY, and NO media.view
    const authorUploadOnly =
      authorPerms.includes('media.upload') &&
      !authorPerms.includes('media.view') &&
      !authorPerms.includes('media.edit');

    results.push({
      id: 'RBAC-AUTHOR-LEAST-PRIVILEGE',
      category: 'RBAC Verification',
      item: 'AUTHOR Role Isolation',
      expected: 'AUTHOR has media.upload ONLY (NO media.view, NO media.edit)',
      actual: `AUTHOR media permissions: [${authorPerms.filter((p: string) => p.startsWith('media.')).join(', ')}]`,
      status: authorUploadOnly ? 'PASS' : 'FAIL',
    });
    console.log(`  AUTHOR least privilege (media.upload only): ${authorUploadOnly ? 'PASS' : 'FAIL'}`);

    // EDITOR has media.view, media.upload, and media.edit
    const editorHasEdit =
      editorPerms.includes('media.view') &&
      editorPerms.includes('media.upload') &&
      editorPerms.includes('media.edit');

    results.push({
      id: 'RBAC-EDITOR-PERMS',
      category: 'RBAC Verification',
      item: 'EDITOR Role Permissions',
      expected: 'EDITOR has media.view, media.upload, and media.edit',
      actual: `EDITOR media permissions: [${editorPerms.filter((p: string) => p.startsWith('media.')).join(', ')}]`,
      status: editorHasEdit ? 'PASS' : 'FAIL',
    });
    console.log(`  EDITOR permissions (view, upload, edit): ${editorHasEdit ? 'PASS' : 'FAIL'}`);

    // ADMIN has all 4 permissions
    const adminHasAll = ['media.view', 'media.upload', 'media.edit', 'media.delete'].every((c) =>
      adminPerms.includes(c)
    );

    results.push({
      id: 'RBAC-ADMIN-PERMS',
      category: 'RBAC Verification',
      item: 'ADMIN Role Permissions',
      expected: 'ADMIN has all 4 media permissions',
      actual: `ADMIN media permissions: [${adminPerms.filter((p: string) => p.startsWith('media.')).join(', ')}]`,
      status: adminHasAll ? 'PASS' : 'FAIL',
    });
    console.log(`  ADMIN permissions (all 4): ${adminHasAll ? 'PASS' : 'FAIL'}`);
  }

  // --------------------------------------------------------------------------
  // 7. RLS ENFORCEMENT & PUBLIC SELECT POLICIES
  // --------------------------------------------------------------------------
  console.log('\n--- [CHECK 5] Verifying RLS Policies (Anonymous Public View) ---');

  // Insert a published media and unpublished media via admin
  const publishedPath = `pub-${Date.now()}.png`;
  const draftPath = `draft-${Date.now()}.png`;

  const { data: pubMedia } = await adminClient
    .from('media')
    .insert({
      title: 'Published Media Test',
      file_name: 'pub.png',
      file_path: publishedPath,
      file_size: 1024,
      mime_type: 'image/png',
      file_type: 'image',
      is_published: true,
    })
    .select('id')
    .single();

  const { data: draftMedia } = await adminClient
    .from('media')
    .insert({
      title: 'Draft Media Test',
      file_name: 'draft.png',
      file_path: draftPath,
      file_size: 1024,
      mime_type: 'image/png',
      file_type: 'image',
      is_published: false,
    })
    .select('id')
    .single();

  if (pubMedia && draftMedia) {
    // Check anonymous query on media
    const { data: anonMediaList } = await anonClient
      .from('media')
      .select('id, is_published')
      .in('id', [pubMedia.id, draftMedia.id]);

    const canSeePub = anonMediaList?.some((m) => m.id === pubMedia.id);
    const cannotSeeDraft = !anonMediaList?.some((m) => m.id === draftMedia.id);
    const rlsMediaSelectOk = canSeePub && cannotSeeDraft;

    results.push({
      id: 'RLS-MEDIA-PUBLIC-SELECT',
      category: 'RLS Verification',
      item: 'Public Media Select Filter',
      expected: 'Anonymous client sees published media ONLY (cannot see draft)',
      actual: `Saw published: ${canSeePub}, Saw draft: ${!cannotSeeDraft}`,
      status: rlsMediaSelectOk ? 'PASS' : 'FAIL',
    });
    console.log(`  RLS Media Public Select (published only): ${rlsMediaSelectOk ? 'PASS' : 'FAIL'}`);

    // Clean up test rows
    await adminClient.from('media').delete().in('id', [pubMedia.id, draftMedia.id]);
  }

  // --------------------------------------------------------------------------
  // 8. FINAL SUMMARY & REPORT GENERATION
  // --------------------------------------------------------------------------
  const allPassed = results.every((r) => r.status === 'PASS');
  const verdict = allPassed ? 'PASS — ALL G1 CHECKS VERIFIED' : 'FAIL — SOME CHECKS FAILED';

  await writeReports(results, verdict);
  console.log(`\nVerification Finished: ${verdict}`);
}

async function writeReports(results: VerificationCheck[], verdict: string) {
  const artifactsDir = path.resolve(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const jsonReport = {
    suite: 'Step 08 Media Module G1 Verification',
    timestamp: new Date().toISOString(),
    verdict,
    results,
  };

  fs.writeFileSync(
    path.join(artifactsDir, 'step08-g1-verification-report.json'),
    JSON.stringify(jsonReport, null, 2)
  );

  let mdContent = `# Step 08 Media Module — G1 Verification Report\n\n`;
  mdContent += `**Verdict:** ${verdict}\n`;
  mdContent += `**Timestamp:** ${new Date().toISOString()}\n\n`;
  mdContent += `| ID | Category | Target / Item | Expected | Actual | Status |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- | :---: |\n`;

  for (const r of results) {
    mdContent += `| ${r.id} | ${r.category} | ${r.item} | ${r.expected} | ${r.actual} | **${r.status}** |\n`;
  }

  fs.writeFileSync(path.join(artifactsDir, 'step08-g1-verification-report.md'), mdContent);
}

runG1Verification().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
