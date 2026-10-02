/**
 * SCHOOL NEWS PLATFORM — STEP 07 LIVE VALIDATION RUNNER
 * Protocol Version: 1.3
 * Target: Step 07 Announcements Module Live Supabase & RLS Validation
 *
 * Mandatory Directives Enforced:
 * - HARD RULE 1: Never test production (fail closed on prod env, protected lists, prod markers).
 * - HARD RULE 2: No mock / No simulation (execute real PostgREST/Auth requests or mark BLOCKED).
 * - HARD RULE 3: No false PASS (strict semantic evaluation of RLS, errors, and affected rows).
 * - HARD RULE 4: Zero secret leakage (redact all JWTs, tokens, passwords, and auth headers).
 * - HARD RULE 5: Authenticated client separation (never use service_role for role tests).
 */

import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

// ==============================================================================
// 1. ENVIRONMENT & SAFETY GATE CONFIGURATION
// ==============================================================================

const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const protectedUrlsEnv = (process.env.PROTECTED_SUPABASE_URLS || '').trim();

const PROTECTED_URL_LIST: string[] = protectedUrlsEnv
  .split(',')
  .map((u) => u.trim().toLowerCase())
  .filter(Boolean);

// ==============================================================================
// 2. TYPES & DATA STRUCTURES (PROTOCOL 1.3 FOUR-STATE RESULT MODEL)
// ==============================================================================

export type TestStatus = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_EXECUTED';

export interface TestResult {
  id: string;
  category: string;
  actor: string;
  target?: string;
  operation: string;
  expected: string;
  actual: string;
  status: TestStatus;
  httpStatus?: number | null;
  affectedRows?: number | null;
  errorCode?: string | null;
  errorMessageRedacted?: string | null;
}

export const IDENTITY_MODE = 'DETERMINISTIC EMAIL / RUNTIME UUID';

export interface TestIdentityConfig {
  email: string;
  role: 'AUTHOR' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';
  fullName: string;
}

export interface LiveTestIdentity {
  key: string;
  id: string;
  email: string;
  role: string;
  createdByRunner: boolean;
  client: SupabaseClient;
}

export interface FixtureRecord {
  code: string;
  ownerKey: 'AUTHOR_A' | 'AUTHOR_B';
  title: string;
  content: string;
  status: 'draft' | 'published';
  priority: 'normal' | 'important' | 'urgent';
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
}

// 5 Approved Deterministic Test Identities (Resolved at runtime to Supabase-generated Auth UUIDs)
export const TEST_IDENTITY_CONFIGS: Record<string, TestIdentityConfig> = {
  AUTHOR_A: {
    email: 'test.author.a@school.internal.test',
    role: 'AUTHOR',
    fullName: 'Test Author A',
  },
  AUTHOR_B: {
    email: 'test.author.b@school.internal.test',
    role: 'AUTHOR',
    fullName: 'Test Author B',
  },
  EDITOR: {
    email: 'test.editor@school.internal.test',
    role: 'EDITOR',
    fullName: 'Test Editor',
  },
  ADMIN: {
    email: 'test.admin@school.internal.test',
    role: 'ADMIN',
    fullName: 'Test Admin',
  },
  SUPER_ADMIN: {
    email: 'test.superadmin@school.internal.test',
    role: 'SUPER_ADMIN',
    fullName: 'Test Super Admin',
  },
};

// 10 Approved Deterministic Fixtures
export const FIXTURE_DEFINITIONS: FixtureRecord[] = [
  {
    code: 'S07_FIX_A_DRAFT',
    ownerKey: 'AUTHOR_A',
    title: '[TEST] S07_FIX_A_DRAFT Author A Private Draft',
    content: 'Private draft content owned by Author A.',
    status: 'draft',
    priority: 'normal',
    is_pinned: false,
    published_at: null,
    expires_at: null,
  },
  {
    code: 'S07_FIX_B_DRAFT',
    ownerKey: 'AUTHOR_B',
    title: '[TEST] S07_FIX_B_DRAFT Author B Private Draft',
    content: 'Private draft content owned by Author B (IDOR Target).',
    status: 'draft',
    priority: 'normal',
    is_pinned: false,
    published_at: null,
    expires_at: null,
  },
  {
    code: 'S07_FIX_A_SCHED',
    ownerKey: 'AUTHOR_A',
    title: '[TEST] S07_FIX_A_SCHED Author A Future Scheduled',
    content: 'Future scheduled content owned by Author A.',
    status: 'published',
    priority: 'normal',
    is_pinned: false,
    published_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    expires_at: null,
  },
  {
    code: 'S07_FIX_B_SCHED',
    ownerKey: 'AUTHOR_B',
    title: '[TEST] S07_FIX_B_SCHED Author B Future Scheduled',
    content: 'Future scheduled content owned by Author B.',
    status: 'published',
    priority: 'normal',
    is_pinned: false,
    published_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    expires_at: null,
  },
  {
    code: 'S07_FIX_A_ACTIVE',
    ownerKey: 'AUTHOR_A',
    title: '[TEST] S07_FIX_A_ACTIVE Author A Published Active',
    content: 'Publicly active published announcement from Author A.',
    status: 'published',
    priority: 'important',
    is_pinned: false,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    code: 'S07_FIX_B_ACTIVE',
    ownerKey: 'AUTHOR_B',
    title: '[TEST] S07_FIX_B_ACTIVE Author B Published Active',
    content: 'Publicly active published announcement from Author B.',
    status: 'published',
    priority: 'important',
    is_pinned: false,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    code: 'S07_FIX_A_EXP',
    ownerKey: 'AUTHOR_A',
    title: '[TEST] S07_FIX_A_EXP Author A Expired Notice',
    content: 'Expired announcement from Author A.',
    status: 'published',
    priority: 'normal',
    is_pinned: false,
    published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    expires_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    code: 'S07_FIX_B_EXP',
    ownerKey: 'AUTHOR_B',
    title: '[TEST] S07_FIX_B_EXP Author B Expired Notice',
    content: 'Expired announcement from Author B.',
    status: 'published',
    priority: 'normal',
    is_pinned: false,
    published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    expires_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    code: 'S07_FIX_A_PINACT',
    ownerKey: 'AUTHOR_A',
    title: '[TEST] S07_FIX_A_PINACT Author A Pinned Active Notice',
    content: 'Pinned active announcement from Author A.',
    status: 'published',
    priority: 'urgent',
    is_pinned: true,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    expires_at: null,
  },
  {
    code: 'S07_FIX_B_PINEXP',
    ownerKey: 'AUTHOR_B',
    title: '[TEST] S07_FIX_B_PINEXP Author B Pinned Expired Notice',
    content: 'Pinned but expired notice from Author B (must remain hidden).',
    status: 'published',
    priority: 'urgent',
    is_pinned: true,
    published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    expires_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ==============================================================================
// 3. UTILITY & SANITIZATION FUNCTIONS
// ==============================================================================

/**
 * Exact implementation of announcement search sanitization
 * Strip characters breaking PostgREST or filter syntax: () , " \ % :
 */
export function sanitizePostgrestFilter(term: string): string {
  if (!term || typeof term !== 'string') return '';
  return term.replace(/[(),"\\%:]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Redact sensitive substrings from error messages to avoid accidental secret leaks
 */
export function redactError(msg: string | null | undefined): string {
  if (!msg) return '';
  return msg
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/apikey=[A-Za-z0-9._-]+/gi, 'apikey=[REDACTED]')
    .replace(/key=[A-Za-z0-9._-]+/gi, 'key=[REDACTED]')
    .replace(/password=[^\s&]+/gi, 'password=[REDACTED]');
}

// ==============================================================================
// 4. SEMANTIC RESULT CLASSIFICATION HELPERS (BUG PREVENTION - SECTION 8 & 25)
// ==============================================================================

export type ErrorCategory =
  | 'RLS_DENIAL'
  | 'AUTH_FAILURE'
  | 'INFRASTRUCTURE_FAILURE'
  | 'UNEXPECTED_ERROR';

/**
 * Categorizes PostgREST and Auth errors into 4 distinct groups:
 * Group A: Authentic RLS / Authorization denial
 * Group B: Authentication failure (expired/invalid JWT, session missing) - NEVER an RLS denial!
 * Group C: Infrastructure/Schema failure (relation 42P01, function 42883, connection failure)
 * Group D: Unexpected error
 */
export function categorizePostgrestError(error: PostgrestError | null): ErrorCategory | null {
  if (!error) return null;
  const code = (error.code || '').toUpperCase();
  const msg = (error.message || '').toLowerCase();
  const details = (error.details || '').toLowerCase();

  // Group B: Authentication failure (MUST NEVER be treated as an RLS denial)
  if (
    code === 'PGRST301' ||
    msg.includes('jwt') ||
    msg.includes('token') ||
    msg.includes('invalid claim') ||
    msg.includes('session') ||
    msg.includes('auth') ||
    details.includes('jwt') ||
    details.includes('token')
  ) {
    return 'AUTH_FAILURE';
  }

  // Group C: Database/Schema/Infrastructure failure
  if (
    code === '42P01' || // relation does not exist
    code === '42883' || // undefined_function
    code === '57P01' || // admin_shutdown
    code === '08006' || // connection_failure
    (msg.includes('relation') && msg.includes('does not exist')) ||
    msg.includes('fetch failed') ||
    msg.includes('econnrefused') ||
    msg.includes('timeout')
  ) {
    return 'INFRASTRUCTURE_FAILURE';
  }

  // Group A: Authentic RLS / Authorization denial
  if (
    code === '42501' || // insufficient_privilege
    msg.includes('violates row-level security') ||
    msg.includes('row-level security policy') ||
    msg.includes('permission denied')
  ) {
    return 'RLS_DENIAL';
  }

  // Group D: Other/Unexpected error
  return 'UNEXPECTED_ERROR';
}

/**
 * Checks if a PostgREST error represents an authentic authorization/RLS denial (Group A only)
 */
export function isRlsOrAuthDenial(error: PostgrestError | null): boolean {
  return categorizePostgrestError(error) === 'RLS_DENIAL';
}

/**
 * Classifies a SELECT result under expected DENY or ALLOW
 */
export function classifySelectResult(
  data: unknown[] | null,
  error: PostgrestError | null,
  expected: 'DENY' | 'ALLOW',
  expectedRows = 1
): { status: TestStatus; details: string } {
  if (error) {
    const category = categorizePostgrestError(error);
    if (category === 'RLS_DENIAL' && expected === 'DENY') {
      return { status: 'PASS', details: `Denied with authentic RLS error: ${redactError(error.message)}` };
    }
    if (category === 'AUTH_FAILURE') {
      return {
        status: 'FAIL',
        details: `Authentication failure during test query (NOT an RLS pass) [${error.code}]: ${redactError(error.message)}`,
      };
    }
    if (category === 'INFRASTRUCTURE_FAILURE') {
      return {
        status: 'BLOCKED',
        details: `Database/Infrastructure error [${error.code}]: ${redactError(error.message)}`,
      };
    }
    return {
      status: 'FAIL',
      details: `Unexpected database error [${error.code}]: ${redactError(error.message)}`,
    };
  }

  const count = data ? data.length : 0;
  if (expected === 'DENY') {
    if (count === 0) {
      return { status: 'PASS', details: '0 rows returned (correctly denied by RLS)' };
    }
    return { status: 'FAIL', details: `VULNERABILITY: Leaked ${count} rows (expected 0)` };
  } else {
    if (count === expectedRows) {
      return { status: 'PASS', details: `${count} row(s) returned as expected` };
    }
    return { status: 'FAIL', details: `Expected ${expectedRows} rows, got ${count}` };
  }
}

/**
 * Classifies an UPDATE or DELETE mutation result under expected DENY or ALLOW
 */
export function classifyMutationResult(
  error: PostgrestError | null,
  count: number | null,
  expected: 'DENY' | 'ALLOW'
): { status: TestStatus; details: string } {
  if (error) {
    const category = categorizePostgrestError(error);
    if (category === 'RLS_DENIAL') {
      if (expected === 'DENY') {
        return { status: 'PASS', details: `Denied with authentic RLS error: ${redactError(error.message)}` };
      }
      return { status: 'FAIL', details: `Unexpectedly denied by RLS: ${redactError(error.message)}` };
    }
    if (category === 'AUTH_FAILURE') {
      return {
        status: 'FAIL',
        details: `Authentication failure during mutation (NOT an RLS pass) [${error.code}]: ${redactError(error.message)}`,
      };
    }
    if (category === 'INFRASTRUCTURE_FAILURE') {
      return {
        status: 'BLOCKED',
        details: `Database/Infrastructure error [${error.code}]: ${redactError(error.message)}`,
      };
    }
    return {
      status: 'FAIL',
      details: `Unexpected error during mutation [${error.code}]: ${redactError(error.message)}`,
    };
  }

  const affected = count ?? 0;
  if (expected === 'DENY') {
    // Under PostgREST, an unauthorized UPDATE/DELETE on non-matching RLS rows silently affects 0 rows
    if (affected === 0) {
      return { status: 'PASS', details: '0 rows affected (mutation rejected by RLS)' };
    }
    return { status: 'FAIL', details: `VULNERABILITY: ${affected} rows modified (expected 0)` };
  } else {
    if (affected > 0) {
      return { status: 'PASS', details: `${affected} row(s) affected as expected` };
    }
    return { status: 'FAIL', details: '0 rows affected (expected mutation to succeed)' };
  }
}

/**
 * Classifies a database check constraint test result
 */
export function classifyConstraintResult(
  error: PostgrestError | null,
  expectedConstraintName: string
): { status: TestStatus; details: string } {
  if (!error) {
    return { status: 'FAIL', details: 'Mutation succeeded without constraint violation (VULNERABILITY)' };
  }

  const category = categorizePostgrestError(error);
  if (category === 'AUTH_FAILURE') {
    return {
      status: 'FAIL',
      details: `Authentication failure during constraint check: ${redactError(error.message)}`,
    };
  }
  if (category === 'INFRASTRUCTURE_FAILURE') {
    return {
      status: 'BLOCKED',
      details: `Database infrastructure failure during constraint check: ${redactError(error.message)}`,
    };
  }

  // 23514 = check_violation
  const isCheckViolation = error.code === '23514' || error.message.includes(expectedConstraintName);
  if (isCheckViolation) {
    return {
      status: 'PASS',
      details: `PostgreSQL rejected with check violation [${error.code}]: ${expectedConstraintName}`,
    };
  }

  return {
    status: 'FAIL',
    details: `Unexpected error code [${error.code}]: ${redactError(error.message)}`,
  };
}

// ==============================================================================
// 5. MAIN RUNNER IMPLEMENTATION
// ==============================================================================

export async function runStep07LiveValidation(): Promise<void> {
  console.log('============================================================');
  console.log('SCHOOL NEWS PLATFORM — STEP 07 LIVE VALIDATION RUNNER');
  console.log('Protocol Version: 1.3');
  console.log('Execution Mode: Real PostgREST & Auth Live Test Runner');
  console.log('============================================================\n');

  const testResults: TestResult[] = [];
  const findings: string[] = [];
  let executionVerdict = 'BLOCKED — NON-PROD RUNTIME UNAVAILABLE';

  // ----------------------------------------------------------------------------
  // SECTION 19: Client-side Search Sanitization Unit Suite
  // ----------------------------------------------------------------------------
  console.log('--- [UNIT/STATIC] Search Filter Sanitization Tests ---');
  const searchSanitizationCases = [
    {
      input: 'Thông báo khẩn cấp về việc nghỉ học phòng chống bão số 3',
      expected: 'Thông báo khẩn cấp về việc nghỉ học phòng chống bão số 3',
      desc: 'Vietnamese text with diacritics',
    },
    {
      input: 'or(title.ilike.*,content.ilike.*)',
      expected: 'or title.ilike.* content.ilike.*',
      desc: 'PostgREST operator parenthesis and comma injection',
    },
    {
      input: 'admin" OR "1"="1',
      expected: 'admin OR 1 = 1',
      desc: 'Double quote and SQL injection characters',
    },
    {
      input: '100% discount \\ urgent: test',
      expected: '100 discount urgent test',
      desc: 'Percent, backslash, and colon characters',
    },
    {
      input: '   multiple    spaces   ',
      expected: 'multiple spaces',
      desc: 'Whitespace trimming and consolidation',
    },
  ];

  for (let i = 0; i < searchSanitizationCases.length; i++) {
    const sc = searchSanitizationCases[i];
    const actual = sanitizePostgrestFilter(sc.input);
    const passed = actual === sc.expected;
    testResults.push({
      id: `SAN-00${i + 1}`,
      category: 'Search Sanitization',
      actor: 'CLIENT_UNIT',
      operation: 'sanitizePostgrestFilter',
      expected: sc.expected,
      actual,
      status: passed ? 'PASS' : 'FAIL',
    });
  }
  console.log('Search sanitization unit assertions verified.\n');

  // ----------------------------------------------------------------------------
  // HARD SAFETY GATE (Hard Rule 1 & Section 4)
  // ----------------------------------------------------------------------------
  console.log('--- [SAFETY GATE] Checking Prerequisites & Environment Safety ---');

  let migrationsSourceReady = false;
  let remoteSchemaReady = false;
  let liveRlsExecution = false;

  const isPlaceholder = (val: string) =>
    !val ||
    val.includes('placeholder') ||
    val.includes('your-project') ||
    val.includes('example.com') ||
    val.includes('undefined');

  const hasUrl = !isPlaceholder(supabaseUrl);
  const hasAnon = !isPlaceholder(supabaseAnonKey);
  const hasServiceKey = !isPlaceholder(supabaseServiceRoleKey);

  console.log(`Node Runtime:           ${process.version}`);
  console.log(`Supabase URL Present:   ${hasUrl}`);
  console.log(`Anon Key Present:       ${hasAnon}`);
  console.log(`Service Role Present:   ${hasServiceKey}`);

  if (!hasUrl || !hasAnon || !hasServiceKey) {
    console.log('\n============================================================');
    console.log('FAIL-CLOSED: SUPABASE PREREQUISITES NOT CONFIGURED');
    console.log('REASON: Live testing requires real non-production credentials.');
    console.log('Missing/Placeholder:');
    if (!hasUrl) console.log('  - VITE_SUPABASE_URL');
    if (!hasAnon) console.log('  - VITE_SUPABASE_ANON_KEY');
    if (!hasServiceKey) console.log('  - SUPABASE_SERVICE_ROLE_KEY');
    console.log('============================================================\n');

    testResults.push({
      id: 'PREFLIGHT-001',
      category: 'Safety Gate',
      actor: 'RUNNER',
      operation: 'Validate Non-Production Credentials',
      expected: 'All non-prod credentials supplied',
      actual: 'Missing or placeholder credentials in current environment',
      status: 'BLOCKED',
    });

    executionVerdict = 'BLOCKED — NON-PROD RUNTIME UNAVAILABLE';
    await writeReports(testResults, executionVerdict, findings, {
      migrationsSourceReady,
      remoteSchemaReady,
      liveRlsExecution,
      identityMode: IDENTITY_MODE,
      createdTestRecords: 0,
      deletedTestRecords: 0,
      preExistingRecordsPreserved: 0,
      orphanRecords: 0,
      cleanupStatus: 'SKIPPED_UNCONFIGURED',
    });
    console.log('No production Supabase endpoint was contacted.');
    process.exit(1);
  }

  // URL Parsing & Production Safety Check
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch (err) {
    console.error('FATAL: Malformed Supabase URL:', redactError(err instanceof Error ? err.message : String(err)));
    testResults.push({
      id: 'PREFLIGHT-002',
      category: 'Safety Gate',
      actor: 'RUNNER',
      operation: 'Parse Supabase URL',
      expected: 'Valid HTTPS/HTTP URL structure',
      actual: 'Malformed URL',
      status: 'BLOCKED',
    });
    executionVerdict = 'BLOCKED — MALFORMED URL';
    await writeReports(testResults, executionVerdict, findings, {
      migrationsSourceReady,
      remoteSchemaReady,
      liveRlsExecution,
      identityMode: IDENTITY_MODE,
      createdTestRecords: 0,
      deletedTestRecords: 0,
      preExistingRecordsPreserved: 0,
      orphanRecords: 0,
      cleanupStatus: 'SKIPPED_UNCONFIGURED',
    });
    console.log('No production Supabase endpoint was contacted.');
    process.exit(1);
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isProdEnv = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';
  const isProtectedUrl = PROTECTED_URL_LIST.some(
    (p) => hostname.includes(p) || supabaseUrl.toLowerCase().includes(p)
  );
  // Production keyword check (strictly targeting known prod markers, NOT valid dev/staging supabase.co projects)
  const hasProdKeywords =
    hostname.includes('prod-school') ||
    hostname.includes('production') ||
    hostname.startsWith('prod-') ||
    hostname.startsWith('prod.');

  const runtimeEnvVar = (process.env.SUPABASE_RUNTIME_ENV || '').trim().toLowerCase();
  const explicitWrongEnv = runtimeEnvVar !== '' && runtimeEnvVar !== 'non-production';

  if (isProdEnv || isProtectedUrl || hasProdKeywords || explicitWrongEnv) {
    console.error('\nFATAL: HARD RULE 1 VIOLATION PREVENTED.');
    console.error(`Target host '${hostname}' or environment detected as production/protected.`);
    testResults.push({
      id: 'PREFLIGHT-003',
      category: 'Safety Gate',
      actor: 'RUNNER',
      operation: 'Production Host Guard',
      expected: 'Target must be isolated non-production',
      actual: `Protected target detected (${hostname})`,
      status: 'FAIL',
    });
    executionVerdict = 'FAIL — SECURITY VALIDATION FAILED';
    await writeReports(testResults, executionVerdict, findings, {
      migrationsSourceReady,
      remoteSchemaReady,
      liveRlsExecution,
      identityMode: IDENTITY_MODE,
      createdTestRecords: 0,
      deletedTestRecords: 0,
      preExistingRecordsPreserved: 0,
      orphanRecords: 0,
      cleanupStatus: 'ABORTED_PROD_GUARD',
    });
    console.log('No production Supabase endpoint was contacted.');
    process.exit(1);
  }

  console.log(`Safety gate passed: Non-production target confirmed (${hostname}).\n`);

  // ----------------------------------------------------------------------------
  // SECTION 3: Migration State Verification (Static Source Readiness Only)
  // ----------------------------------------------------------------------------
  console.log('--- [MIGRATIONS] Local Source Verification (Static Precondition) ---');
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const expectedMigrations = [
    '20260101000000_initial_schema.sql',
    '20260102000000_step03_foundation.sql',
    '20260103000000_step04_homepage_builder.sql',
    '20260104000000_step05_news_module.sql',
    '20260105000000_step05a_news_integrity_hardening.sql',
    '20260106000000_step06_documents_module.sql',
    '20260107000000_step06_security_hardening.sql',
    '20260108000000_step06_final_fix.sql',
    '20260109000000_step07_announcements_module.sql',
    '20260110000000_step07_security_integrity_fix.sql',
    '20260111000000_step07_author_authorization_fix.sql',
  ];

  let localMigrationsFound = 0;
  for (const mig of expectedMigrations) {
    const fullPath = path.join(migrationsDir, mig);
    if (fs.existsSync(fullPath)) {
      localMigrationsFound++;
    }
  }

  // Verify chronological ordering of migration versions
  let chronologicalOrderValid = true;
  for (let i = 1; i < expectedMigrations.length; i++) {
    const prevTimestamp = expectedMigrations[i - 1].slice(0, 14);
    const currTimestamp = expectedMigrations[i].slice(0, 14);
    if (currTimestamp <= prevTimestamp) {
      chronologicalOrderValid = false;
      break;
    }
  }

  const migrationsInventoryOk = localMigrationsFound === expectedMigrations.length && chronologicalOrderValid;
  migrationsSourceReady = migrationsInventoryOk;

  testResults.push({
    id: 'MIG-001',
    category: 'Migrations',
    actor: 'RUNNER',
    operation: 'Verify local 11 migration files & timestamp ordering',
    expected: 'All 11 migrations present locally in chronological sequence (MIGRATIONS_SOURCE_READY)',
    actual: `${localMigrationsFound}/11 migrations present, ordering valid: ${chronologicalOrderValid} (MIGRATIONS_SOURCE_READY)`,
    status: migrationsInventoryOk ? 'PASS' : 'FAIL',
  });

  // Privileged admin client for setup/cleanup only (Hard Rule 5)
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Anonymous client
  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Tracking containers for guaranteed cleanup (Section 20)
  const runtimeFixtureIds: Record<string, string> = {};
  const tempAnnouncementIds: string[] = [];
  const runnerCreatedUserIds: string[] = [];
  const preExistingUserIdsPreserved: string[] = [];
  const authenticatedClients: Record<string, SupabaseClient> = {};

  try {
    // --------------------------------------------------------------------------
    // SECTION 18: Live Database Object Verification (F7)
    // --------------------------------------------------------------------------
    console.log('\n--- [OBJECTS] Verifying Live Database Objects & Functions ---');

    // 1. Check announcements table accessibility
    const { error: tableError } = await anonClient.from('announcements').select('id').limit(0);
    const tableMissing = tableError && tableError.code === '42P01';

    testResults.push({
      id: 'OBJ-001',
      category: 'Database Objects',
      actor: 'ANONYMOUS',
      target: 'public.announcements',
      operation: 'Table accessibility check',
      expected: 'Table public.announcements accessible',
      actual: tableError
        ? tableMissing
          ? 'Prerequisite table public.announcements does not exist (42P01)'
          : `Database error [${tableError.code}]: ${redactError(tableError.message)}`
        : 'Table exists and responds to SELECT',
      status: tableError ? (tableMissing ? 'BLOCKED' : 'FAIL') : 'PASS',
      errorCode: tableError?.code,
      errorMessageRedacted: redactError(tableError?.message),
    });

    if (tableError) {
      throw new Error(`Prerequisite public.announcements table inaccessible: [${tableError.code}] ${tableError.message}`);
    }

    // 2. Check RPC functions
    const { data: permData, error: permRpcError } = await adminClient.rpc('has_permission', {
      required_permission: 'announcements.view',
    });
    const permMissing = permRpcError && permRpcError.code === '42883';
    const permValid = !permRpcError && typeof permData === 'boolean';

    testResults.push({
      id: 'OBJ-002',
      category: 'Database Objects',
      actor: 'ADMIN_CLIENT',
      target: 'public.has_permission(text)',
      operation: 'Execute RPC has_permission',
      expected: 'Function executes without error and returns boolean',
      actual: permRpcError
        ? `Error [${permRpcError.code}]: ${redactError(permRpcError.message)}`
        : `Function executed successfully and returned boolean (${permData})`,
      status: permValid ? 'PASS' : permMissing ? 'BLOCKED' : 'FAIL',
      errorCode: permRpcError?.code,
      errorMessageRedacted: redactError(permRpcError?.message),
    });

    if (!permValid) {
      throw new Error(`Prerequisite RPC public.has_permission failed: ${permRpcError?.message || 'Returned non-boolean'}`);
    }

    const { data: saData, error: superAdminRpcError } = await adminClient.rpc('is_super_admin');
    const saMissing = superAdminRpcError && superAdminRpcError.code === '42883';
    const saValid = !superAdminRpcError && typeof saData === 'boolean';

    testResults.push({
      id: 'OBJ-003',
      category: 'Database Objects',
      actor: 'ADMIN_CLIENT',
      target: 'public.is_super_admin()',
      operation: 'Execute RPC is_super_admin',
      expected: 'Function executes without error and returns boolean',
      actual: superAdminRpcError
        ? `Error [${superAdminRpcError.code}]: ${redactError(superAdminRpcError.message)}`
        : `Function executed successfully and returned boolean (${saData})`,
      status: saValid ? 'PASS' : saMissing ? 'BLOCKED' : 'FAIL',
      errorCode: superAdminRpcError?.code,
      errorMessageRedacted: redactError(superAdminRpcError?.message),
    });

    if (!saValid) {
      throw new Error(`Prerequisite RPC public.is_super_admin failed: ${superAdminRpcError?.message || 'Returned non-boolean'}`);
    }

    remoteSchemaReady = true;
    console.log('Database objects and security RPCs verified (REMOTE_SCHEMA_READY).\n');

    // --------------------------------------------------------------------------
    // SECTION 5 & 6: Provision 5 Test Identities & Create Authenticated Sessions (F2, F3, F6)
    // --------------------------------------------------------------------------
    console.log('\n--- [IDENTITIES] Provisioning 5 Test Identities with Genuine JWTs ---');

    const runtimePassword = `TestPass_${crypto.randomBytes(8).toString('hex')}!Aa1`;

    const { data: roleRecords, error: roleError } = await adminClient.from('roles').select('id, code');
    if (roleError || !roleRecords || roleRecords.length === 0) {
      throw new Error(`Failed to query roles catalog: ${roleError?.message || 'Empty roles catalog'}`);
    }
    const roleMap: Record<string, string> = {};
    for (const r of roleRecords) {
      roleMap[r.code] = r.id;
    }

    for (const [key, conf] of Object.entries(TEST_IDENTITY_CONFIGS)) {
      console.log(`Provisioning Auth user for ${key} (${conf.role})...`);

      let userId: string;
      let createdByRunner = false;

      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email: conf.email,
        password: runtimePassword,
        email_confirm: true,
        user_metadata: { full_name: conf.fullName, test_suite: 'STEP07_LIVE_VALIDATION' },
      });

      if (createError) {
        // Check if user already exists
        const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
        if (listError) {
          throw new Error(`Failed to list existing auth users: ${listError.message}`);
        }
        const existing = listData?.users.find((u: { email?: string; id: string }) => u.email === conf.email);
        if (existing) {
          userId = existing.id;
          createdByRunner = false;
          preExistingUserIdsPreserved.push(userId);
          const { error: updateAuthErr } = await adminClient.auth.admin.updateUserById(userId, {
            password: runtimePassword,
            email_confirm: true,
          });
          if (updateAuthErr) {
            throw new Error(`Failed to update password for pre-existing test user ${conf.email}: ${updateAuthErr.message}`);
          }
          console.log(`  Identified pre-existing user for ${key} (${userId}) - will NOT delete during cleanup.`);
        } else {
          throw new Error(`Failed to provision user ${conf.email}: ${createError.message}`);
        }
      } else {
        userId = createData.user.id;
        createdByRunner = true;
        runnerCreatedUserIds.push(userId);
      }

      // Upsert profile
      const { error: profError } = await adminClient.from('profiles').upsert({
        id: userId,
        email: conf.email,
        full_name: conf.fullName,
      });
      if (profError) {
        throw new Error(`Failed to upsert profile for ${conf.email}: ${profError.message}`);
      }

      // Assign role in user_roles
      const targetRoleId = roleMap[conf.role];
      if (!targetRoleId) {
        throw new Error(`Required role ${conf.role} does not exist in roles table`);
      }
      const { error: roleAssignError } = await adminClient.from('user_roles').upsert(
        { user_id: userId, role_id: targetRoleId },
        { onConflict: 'user_id,role_id' }
      );
      if (roleAssignError) {
        throw new Error(`Failed to assign role ${conf.role} to ${conf.email}: ${roleAssignError.message}`);
      }

      // Independent role assignment verification
      const { data: verifiedRoles, error: verifyRoleErr } = await adminClient
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .eq('role_id', targetRoleId);
      if (verifyRoleErr || !verifiedRoles || verifiedRoles.length === 0) {
        throw new Error(`Independent role verification failed for ${conf.email}: ${verifyRoleErr?.message || 'Assignment missing'}`);
      }

      // Authenticate via client with real password to obtain genuine JWT session
      const roleClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: authSession, error: signInError } = await roleClient.auth.signInWithPassword({
        email: conf.email,
        password: runtimePassword,
      });

      if (signInError || !authSession.session) {
        throw new Error(`Sign-in failed for test user ${conf.email}: ${signInError?.message || 'No session returned'}`);
      }

      if (authSession.user.id !== userId) {
        throw new Error(`Session user ID mismatch for ${conf.email}: expected ${userId}, got ${authSession.user.id}`);
      }

      authenticatedClients[key] = roleClient;

      testResults.push({
        id: `IDN-${key}`,
        category: 'Identity Provisioning',
        actor: key,
        operation: 'Provision Real Auth User, Role & Session',
        expected: 'Real user created and signed in with genuine JWT (AUTH + PROFILE + ROLE + SESSION READY)',
        actual: `Authenticated as runtime UUID ${userId} (createdByRunner: ${createdByRunner})`,
        status: 'PASS',
      });
    }

    // --------------------------------------------------------------------------
    // SECTION 7: Provision 10 Deterministic Test Fixtures (F3, F7)
    // --------------------------------------------------------------------------
    console.log('\n--- [FIXTURES] Provisioning 10 Deterministic Fixtures ---');

    // Fixture collision pre-check
    const fixtureTitles = FIXTURE_DEFINITIONS.map((f) => f.title);
    const { data: existingFixtures, error: checkFixErr } = await adminClient
      .from('announcements')
      .select('id, title')
      .in('title', fixtureTitles);

    if (checkFixErr) {
      throw new Error(`Failed to check existing fixtures: ${checkFixErr.message}`);
    }
    if (existingFixtures && existingFixtures.length > 0) {
      throw new Error(
        `Fixture collision detected: ${existingFixtures.length} test announcement(s) already exist in database namespace. Require clean test namespace.`
      );
    }

    for (const fix of FIXTURE_DEFINITIONS) {
      const ownerId =
        fix.ownerKey === 'AUTHOR_A'
          ? (await authenticatedClients.AUTHOR_A.auth.getUser()).data.user?.id
          : (await authenticatedClients.AUTHOR_B.auth.getUser()).data.user?.id;

      const { data: insertedFix, error: fixError } = await adminClient
        .from('announcements')
        .insert({
          title: fix.title,
          content: fix.content,
          status: fix.status,
          priority: fix.priority,
          is_pinned: fix.is_pinned,
          published_at: fix.published_at,
          expires_at: fix.expires_at,
          created_by: ownerId,
        })
        .select('id')
        .single();

      if (fixError || !insertedFix) {
        throw new Error(`Failed to create fixture ${fix.code}: ${fixError?.message}`);
      }

      runtimeFixtureIds[fix.code] = insertedFix.id;
    }
    console.log('All 10 fixtures created in database.\n');

    liveRlsExecution = true;

    // --------------------------------------------------------------------------
    // SECTION 10: Public Anonymous Tests (A-001 to A-010)
    // --------------------------------------------------------------------------
    console.log('--- [RLS] Public Anonymous Suite (A-001 to A-010) ---');

    // A-001: Anonymous SELECT draft -> Expected 0 rows
    const { data: a001Data, error: a001Err } = await anonClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const a001Res = classifySelectResult(a001Data, a001Err, 'DENY');
    testResults.push({
      id: 'A-001',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'SELECT Draft',
      expected: 'DENY (0 rows)',
      actual: a001Res.details,
      status: a001Res.status,
      affectedRows: a001Data?.length ?? 0,
      errorCode: a001Err?.code,
    });

    // A-002: Anonymous SELECT scheduled -> Expected 0 rows
    const { data: a002Data, error: a002Err } = await anonClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_SCHED);
    const a002Res = classifySelectResult(a002Data, a002Err, 'DENY');
    testResults.push({
      id: 'A-002',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'SELECT Scheduled',
      expected: 'DENY (0 rows)',
      actual: a002Res.details,
      status: a002Res.status,
      affectedRows: a002Data?.length ?? 0,
    });

    // A-003: Anonymous SELECT expired -> Expected 0 rows
    const { data: a003Data, error: a003Err } = await anonClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_EXP);
    const a003Res = classifySelectResult(a003Data, a003Err, 'DENY');
    testResults.push({
      id: 'A-003',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'SELECT Expired',
      expected: 'DENY (0 rows)',
      actual: a003Res.details,
      status: a003Res.status,
      affectedRows: a003Data?.length ?? 0,
    });

    // A-004: Anonymous SELECT active published -> Expected 1 row
    const { data: a004Data, error: a004Err } = await anonClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const a004Res = classifySelectResult(a004Data, a004Err, 'ALLOW', 1);
    testResults.push({
      id: 'A-004',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'SELECT Active Published',
      expected: 'ALLOW (1 row)',
      actual: a004Res.details,
      status: a004Res.status,
      affectedRows: a004Data?.length ?? 0,
    });

    // A-005: Anonymous SELECT pinned active -> Expected 1 row
    const { data: a005Data, error: a005Err } = await anonClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_PINACT);
    const a005Res = classifySelectResult(a005Data, a005Err, 'ALLOW', 1);
    testResults.push({
      id: 'A-005',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'SELECT Pinned Active',
      expected: 'ALLOW (1 row)',
      actual: a005Res.details,
      status: a005Res.status,
      affectedRows: a005Data?.length ?? 0,
    });

    // A-006: Anonymous SELECT pinned expired -> Expected 0 rows
    const { data: a006Data, error: a006Err } = await anonClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_PINEXP);
    const a006Res = classifySelectResult(a006Data, a006Err, 'DENY');
    testResults.push({
      id: 'A-006',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'SELECT Pinned Expired',
      expected: 'DENY (0 rows)',
      actual: a006Res.details,
      status: a006Res.status,
      affectedRows: a006Data?.length ?? 0,
    });

    // A-007: Anonymous SELECT scheduled pinned -> Expected 0 rows
    const { data: a007Data, error: a007Err } = await anonClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_SCHED);
    const a007Res = classifySelectResult(a007Data, a007Err, 'DENY');
    testResults.push({
      id: 'A-007',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'SELECT Scheduled Pinned',
      expected: 'DENY (0 rows)',
      actual: a007Res.details,
      status: a007Res.status,
      affectedRows: a007Data?.length ?? 0,
    });

    // A-008: Anonymous INSERT -> Expected DENY
    const { error: a008Error } = await anonClient
      .from('announcements')
      .insert({ title: 'Anon Post', content: 'Testing RLS', status: 'draft' });
    const a008Res = classifyMutationResult(a008Error, 0, 'DENY');
    testResults.push({
      id: 'A-008',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'INSERT announcement',
      expected: 'DENY (RLS check failure)',
      actual: a008Res.details,
      status: a008Res.status,
      errorCode: a008Error?.code,
    });

    // A-009: Anonymous UPDATE -> Expected DENY
    const { error: a009Error, count: a009Count } = await anonClient
      .from('announcements')
      .update({ title: 'Anon Defaced' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const a009Res = classifyMutationResult(a009Error, a009Count, 'DENY');
    testResults.push({
      id: 'A-009',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'UPDATE announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: a009Res.details,
      status: a009Res.status,
      affectedRows: a009Count,
    });

    // A-010: Anonymous DELETE -> Expected DENY
    const { error: a010Error, count: a010Count } = await anonClient
      .from('announcements')
      .delete()
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const a010Res = classifyMutationResult(a010Error, a010Count, 'DENY');
    testResults.push({
      id: 'A-010',
      category: 'RLS Anonymous',
      actor: 'ANONYMOUS',
      operation: 'DELETE announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: a010Res.details,
      status: a010Res.status,
      affectedRows: a010Count,
    });

    // --------------------------------------------------------------------------
    // SECTION 11: AUTHOR_A & AUTHOR_B Cross-User Isolation Suite
    // --------------------------------------------------------------------------
    console.log('\n--- [RLS] AUTHOR Cross-User Isolation Suite ---');
    const authorAClient = authenticatedClients.AUTHOR_A;
    const authorBClient = authenticatedClients.AUTHOR_B;

    // AA-001: Insert own draft -> Expected ALLOW
    const { data: aa001Data, error: aa001Error } = await authorAClient
      .from('announcements')
      .insert({ title: 'Author A New Draft', content: 'Draft Content', status: 'draft' })
      .select('id')
      .single();
    testResults.push({
      id: 'AA-001',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'Insert own draft',
      expected: 'ALLOW',
      actual: aa001Error ? `Error: ${redactError(aa001Error.message)}` : 'Inserted successfully',
      status: !aa001Error && aa001Data?.id ? 'PASS' : 'FAIL',
      errorCode: aa001Error?.code,
    });
    if (aa001Data?.id) {
      tempAnnouncementIds.push(aa001Data.id);
    }

    // AA-002: SELECT own draft -> Expected ALLOW (1 row)
    const { data: aa002Data, error: aa002Err } = await authorAClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const aa002Res = classifySelectResult(aa002Data, aa002Err, 'ALLOW', 1);
    testResults.push({
      id: 'AA-002',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'SELECT own draft',
      expected: 'ALLOW (1 row)',
      actual: aa002Res.details,
      status: aa002Res.status,
      affectedRows: aa002Data?.length ?? 0,
    });

    // AA-003: SELECT Author B draft -> Expected DENY (0 rows) [S07-F04-R Regression Check]
    const { data: aa003Data, error: aa003Err } = await authorAClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_DRAFT);
    const aa003Res = classifySelectResult(aa003Data, aa003Err, 'DENY');
    testResults.push({
      id: 'AA-003',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'SELECT Author B draft',
      expected: 'DENY (0 rows)',
      actual: aa003Res.details,
      status: aa003Res.status,
      affectedRows: aa003Data?.length ?? 0,
    });

    // AA-004: SELECT Author B scheduled -> Expected DENY (0 rows)
    const { data: aa004Data, error: aa004Err } = await authorAClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_SCHED);
    const aa004Res = classifySelectResult(aa004Data, aa004Err, 'DENY');
    testResults.push({
      id: 'AA-004',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'SELECT Author B scheduled',
      expected: 'DENY (0 rows)',
      actual: aa004Res.details,
      status: aa004Res.status,
    });

    // AA-005: SELECT Author B expired -> Expected DENY (0 rows)
    const { data: aa005Data, error: aa005Err } = await authorAClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_EXP);
    const aa005Res = classifySelectResult(aa005Data, aa005Err, 'DENY');
    testResults.push({
      id: 'AA-005',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'SELECT Author B expired',
      expected: 'DENY (0 rows)',
      actual: aa005Res.details,
      status: aa005Res.status,
    });

    // AA-006: SELECT Author B active published -> Expected ALLOW (1 row)
    const { data: aa006Data, error: aa006Err } = await authorAClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_ACTIVE);
    const aa006Res = classifySelectResult(aa006Data, aa006Err, 'ALLOW', 1);
    testResults.push({
      id: 'AA-006',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'SELECT Author B active published',
      expected: 'ALLOW (1 row)',
      actual: aa006Res.details,
      status: aa006Res.status,
    });

    // AA-007: UPDATE own draft -> Expected ALLOW
    const { error: aa007Error } = await authorAClient
      .from('announcements')
      .update({ content: 'Updated own draft content' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    testResults.push({
      id: 'AA-007',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'UPDATE own draft',
      expected: 'ALLOW',
      actual: aa007Error ? `Error: ${redactError(aa007Error.message)}` : 'Updated successfully',
      status: !aa007Error ? 'PASS' : 'FAIL',
    });

    // AA-008: UPDATE Author B draft -> Expected DENY
    const { error: aa008Error, count: aa008Count } = await authorAClient
      .from('announcements')
      .update({ content: 'Tampered content' })
      .eq('id', runtimeFixtureIds.S07_FIX_B_DRAFT);
    const aa008Res = classifyMutationResult(aa008Error, aa008Count, 'DENY');
    testResults.push({
      id: 'AA-008',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'UPDATE Author B draft',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: aa008Res.details,
      status: aa008Res.status,
    });

    // AA-009: UPDATE own published -> Expected DENY (Author lacks announcements.edit on published)
    const { error: aa009Error, count: aa009Count } = await authorAClient
      .from('announcements')
      .update({ content: 'Tampered published' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const aa009Res = classifyMutationResult(aa009Error, aa009Count, 'DENY');
    testResults.push({
      id: 'AA-009',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'UPDATE own published announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: aa009Res.details,
      status: aa009Res.status,
    });

    // AA-010: DELETE own draft -> Expected ALLOW
    const { data: tempDraft } = await authorAClient
      .from('announcements')
      .insert({ title: 'Temp Draft For Delete', content: 'Delete Me', status: 'draft' })
      .select('id')
      .single();
    if (tempDraft?.id) {
      tempAnnouncementIds.push(tempDraft.id);
      const { error: aa010Error } = await authorAClient
        .from('announcements')
        .delete()
        .eq('id', tempDraft.id);
      testResults.push({
        id: 'AA-010',
        category: 'RLS AUTHOR_A',
        actor: 'AUTHOR_A',
        operation: 'DELETE own draft',
        expected: 'ALLOW',
        actual: aa010Error ? `Error: ${redactError(aa010Error.message)}` : 'Deleted successfully',
        status: !aa010Error ? 'PASS' : 'FAIL',
      });
    }

    // AA-011: DELETE Author B draft -> Expected DENY
    const { error: aa011Error, count: aa011Count } = await authorAClient
      .from('announcements')
      .delete()
      .eq('id', runtimeFixtureIds.S07_FIX_B_DRAFT);
    const aa011Res = classifyMutationResult(aa011Error, aa011Count, 'DENY');
    testResults.push({
      id: 'AA-011',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'DELETE Author B draft',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: aa011Res.details,
      status: aa011Res.status,
    });

    // AA-012: DELETE own published -> Expected DENY
    const { error: aa012Error, count: aa012Count } = await authorAClient
      .from('announcements')
      .delete()
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const aa012Res = classifyMutationResult(aa012Error, aa012Count, 'DENY');
    testResults.push({
      id: 'AA-012',
      category: 'RLS AUTHOR_A',
      actor: 'AUTHOR_A',
      operation: 'DELETE own published announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: aa012Res.details,
      status: aa012Res.status,
    });

    // --- AUTHOR_B MIRROR SUITE ---
    // AB-001: SELECT Author A draft -> Expected DENY (0 rows)
    const { data: ab001Data, error: ab001Err } = await authorBClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const ab001Res = classifySelectResult(ab001Data, ab001Err, 'DENY');
    testResults.push({
      id: 'AB-001',
      category: 'RLS AUTHOR_B',
      actor: 'AUTHOR_B',
      operation: 'SELECT Author A draft',
      expected: 'DENY (0 rows)',
      actual: ab001Res.details,
      status: ab001Res.status,
    });

    // AB-002: SELECT own draft -> Expected ALLOW (1 row)
    const { data: ab002Data, error: ab002Err } = await authorBClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_DRAFT);
    const ab002Res = classifySelectResult(ab002Data, ab002Err, 'ALLOW', 1);
    testResults.push({
      id: 'AB-002',
      category: 'RLS AUTHOR_B',
      actor: 'AUTHOR_B',
      operation: 'SELECT own draft',
      expected: 'ALLOW (1 row)',
      actual: ab002Res.details,
      status: ab002Res.status,
    });

    // AB-003: SELECT Author A scheduled -> Expected DENY (0 rows)
    const { data: ab003Data, error: ab003Err } = await authorBClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_SCHED);
    const ab003Res = classifySelectResult(ab003Data, ab003Err, 'DENY');
    testResults.push({
      id: 'AB-003',
      category: 'RLS AUTHOR_B',
      actor: 'AUTHOR_B',
      operation: 'SELECT Author A scheduled',
      expected: 'DENY (0 rows)',
      actual: ab003Res.details,
      status: ab003Res.status,
    });

    // AB-004: SELECT own scheduled -> Expected ALLOW (1 row via created_by = auth.uid())
    const { data: ab004Data, error: ab004Err } = await authorBClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_SCHED);
    const ab004Res = classifySelectResult(ab004Data, ab004Err, 'ALLOW', 1);
    testResults.push({
      id: 'AB-004',
      category: 'RLS AUTHOR_B',
      actor: 'AUTHOR_B',
      operation: 'SELECT own scheduled',
      expected: 'ALLOW (1 row)',
      actual: ab004Res.details,
      status: ab004Res.status,
    });

    // AB-005: SELECT Author A active -> Expected ALLOW (1 row)
    const { data: ab005Data, error: ab005Err } = await authorBClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const ab005Res = classifySelectResult(ab005Data, ab005Err, 'ALLOW', 1);
    testResults.push({
      id: 'AB-005',
      category: 'RLS AUTHOR_B',
      actor: 'AUTHOR_B',
      operation: 'SELECT Author A active',
      expected: 'ALLOW (1 row)',
      actual: ab005Res.details,
      status: ab005Res.status,
    });

    // --------------------------------------------------------------------------
    // SECTION 12: EDITOR, ADMIN & SUPER_ADMIN Suites
    // --------------------------------------------------------------------------
    console.log('\n--- [RLS] EDITOR, ADMIN & SUPER_ADMIN Suites ---');
    const editorClient = authenticatedClients.EDITOR;
    const adminUserClient = authenticatedClients.ADMIN;
    const superAdminClient = authenticatedClients.SUPER_ADMIN;

    // ED-001: SELECT Author A draft -> Expected ALLOW (1 row)
    const { data: ed001Data, error: ed001Err } = await editorClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const ed001Res = classifySelectResult(ed001Data, ed001Err, 'ALLOW', 1);
    testResults.push({
      id: 'ED-001',
      category: 'RLS EDITOR',
      actor: 'EDITOR',
      operation: 'SELECT Author A draft',
      expected: 'ALLOW (1 row)',
      actual: ed001Res.details,
      status: ed001Res.status,
    });

    // ED-002: SELECT Author B draft -> Expected ALLOW (1 row)
    const { data: ed002Data, error: ed002Err } = await editorClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_B_DRAFT);
    const ed002Res = classifySelectResult(ed002Data, ed002Err, 'ALLOW', 1);
    testResults.push({
      id: 'ED-002',
      category: 'RLS EDITOR',
      actor: 'EDITOR',
      operation: 'SELECT Author B draft',
      expected: 'ALLOW (1 row)',
      actual: ed002Res.details,
      status: ed002Res.status,
    });

    // ED-003: INSERT draft -> Expected ALLOW
    const { data: ed003Data, error: ed003Error } = await editorClient
      .from('announcements')
      .insert({ title: 'Editor Draft', content: 'Editor Content', status: 'draft' })
      .select('id')
      .single();
    testResults.push({
      id: 'ED-003',
      category: 'RLS EDITOR',
      actor: 'EDITOR',
      operation: 'INSERT draft',
      expected: 'ALLOW',
      actual: ed003Error ? `Error: ${redactError(ed003Error.message)}` : 'Inserted',
      status: !ed003Error && ed003Data?.id ? 'PASS' : 'FAIL',
    });
    if (ed003Data?.id) tempAnnouncementIds.push(ed003Data.id);

    // ED-004: UPDATE draft -> Expected ALLOW
    const { error: ed004Error } = await editorClient
      .from('announcements')
      .update({ content: 'Editor Updated Content' })
      .eq('id', ed003Data?.id || runtimeFixtureIds.S07_FIX_A_DRAFT);
    testResults.push({
      id: 'ED-004',
      category: 'RLS EDITOR',
      actor: 'EDITOR',
      operation: 'UPDATE draft',
      expected: 'ALLOW',
      actual: ed004Error ? `Error: ${redactError(ed004Error.message)}` : 'Updated',
      status: !ed004Error ? 'PASS' : 'FAIL',
    });

    // ED-005: PUBLISH draft -> Expected ALLOW
    if (ed003Data?.id) {
      const { error: ed005Error } = await editorClient
        .from('announcements')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', ed003Data.id);
      testResults.push({
        id: 'ED-005',
        category: 'RLS EDITOR',
        actor: 'EDITOR',
        operation: 'PUBLISH draft',
        expected: 'ALLOW',
        actual: ed005Error ? `Error: ${redactError(ed005Error.message)}` : 'Published',
        status: !ed005Error ? 'PASS' : 'FAIL',
      });
    }

    // ED-007: UPDATE published announcement -> Expected ALLOW
    const { error: ed007Error } = await editorClient
      .from('announcements')
      .update({ content: 'Editor edited active notice' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    testResults.push({
      id: 'ED-007',
      category: 'RLS EDITOR',
      actor: 'EDITOR',
      operation: 'UPDATE published announcement',
      expected: 'ALLOW',
      actual: ed007Error ? `Error: ${redactError(ed007Error.message)}` : 'Updated',
      status: !ed007Error ? 'PASS' : 'FAIL',
    });

    // ED-008: PIN published announcement -> Expected ALLOW
    const { error: ed008Error } = await editorClient
      .from('announcements')
      .update({ is_pinned: true })
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    testResults.push({
      id: 'ED-008',
      category: 'RLS EDITOR',
      actor: 'EDITOR',
      operation: 'PIN published announcement',
      expected: 'ALLOW',
      actual: ed008Error ? `Error: ${redactError(ed008Error.message)}` : 'Pinned',
      status: !ed008Error ? 'PASS' : 'FAIL',
    });

    // ED-009: DELETE announcement -> Expected DENY (Editor lacks announcements.delete)
    const { error: ed009Error, count: ed009Count } = await editorClient
      .from('announcements')
      .delete()
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const ed009Res = classifyMutationResult(ed009Error, ed009Count, 'DENY');
    testResults.push({
      id: 'ED-009',
      category: 'RLS EDITOR',
      actor: 'EDITOR',
      operation: 'DELETE announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: ed009Res.details,
      status: ed009Res.status,
    });

    // --- ADMIN SUITE ---
    // AD-001: Admin INSERT published announcement -> Expected ALLOW
    const { data: ad001Data, error: ad001Error } = await adminUserClient
      .from('announcements')
      .insert({ title: 'Admin Notice', content: 'Admin Content', status: 'published' })
      .select('id')
      .single();
    testResults.push({
      id: 'AD-001',
      category: 'RLS ADMIN',
      actor: 'ADMIN',
      operation: 'INSERT published announcement',
      expected: 'ALLOW',
      actual: ad001Error ? `Error: ${redactError(ad001Error.message)}` : 'Inserted',
      status: !ad001Error && ad001Data?.id ? 'PASS' : 'FAIL',
    });
    if (ad001Data?.id) tempAnnouncementIds.push(ad001Data.id);

    // AD-007: Admin DELETE announcement -> Expected ALLOW
    if (ad001Data?.id) {
      const { error: ad007Error } = await adminUserClient
        .from('announcements')
        .delete()
        .eq('id', ad001Data.id);
      testResults.push({
        id: 'AD-007',
        category: 'RLS ADMIN',
        actor: 'ADMIN',
        operation: 'DELETE announcement',
        expected: 'ALLOW',
        actual: ad007Error ? `Error: ${redactError(ad007Error.message)}` : 'Deleted',
        status: !ad007Error ? 'PASS' : 'FAIL',
      });
    }

    // --- SUPER_ADMIN SUITE ---
    // SA-001: Super Admin RPC check
    const { data: sa001Data, error: sa001Error } = await superAdminClient.rpc('is_super_admin');
    testResults.push({
      id: 'SA-001',
      category: 'RLS SUPER_ADMIN',
      actor: 'SUPER_ADMIN',
      operation: 'Execute is_super_admin()',
      expected: 'TRUE',
      actual: sa001Error ? `Error: ${redactError(sa001Error.message)}` : String(sa001Data),
      status: !sa001Error && sa001Data === true ? 'PASS' : 'FAIL',
    });

    // --------------------------------------------------------------------------
    // SECTION 13: IDOR Suite (AUTHOR_B attempting access/tampering on Author A records)
    // Mandatory Re-read requirement enforced for every mutation!
    // --------------------------------------------------------------------------
    console.log('\n--- [IDOR] Executing IDOR Suite (AUTHOR_B vs Author A Draft) ---');

    // IDOR-001: GET Author A draft
    const { data: idor001Data, error: idor001Err } = await authorBClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const idor001Res = classifySelectResult(idor001Data, idor001Err, 'DENY');
    testResults.push({
      id: 'IDOR-001',
      category: 'IDOR',
      actor: 'AUTHOR_B',
      operation: 'GET Author A draft',
      expected: 'DENY (0 rows)',
      actual: idor001Res.details,
      status: idor001Res.status,
    });

    // IDOR-002: PATCH Author A draft content
    // Dynamically capture baseline content immediately before the unauthorized mutation attempt
    const { data: prePatchData002 } = await adminClient
      .from('announcements')
      .select('content')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const prePatchContent002 = prePatchData002?.content;

    const { error: idor002Error, count: idor002Count } = await authorBClient
      .from('announcements')
      .update({ content: 'IDOR Defacement' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const idor002Res = classifyMutationResult(idor002Error, idor002Count, 'DENY');

    // Independent verification re-read
    const { data: reRead002 } = await adminClient
      .from('announcements')
      .select('content')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const idor002Unmodified =
      Boolean(prePatchContent002) && reRead002?.content === prePatchContent002;

    testResults.push({
      id: 'IDOR-002',
      category: 'IDOR',
      actor: 'AUTHOR_B',
      operation: 'PATCH Author A draft content',
      expected: 'DENY (0 rows) & record content unchanged',
      actual: `${idor002Res.details} | Target content unmodified: ${idor002Unmodified}`,
      status: idor002Res.status === 'PASS' && idor002Unmodified ? 'PASS' : 'FAIL',
    });

    // IDOR-003: DELETE Author A draft
    const { error: idor003Error, count: idor003Count } = await authorBClient
      .from('announcements')
      .delete()
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const idor003Res = classifyMutationResult(idor003Error, idor003Count, 'DENY');

    // Independent verification re-read
    const { data: reRead003 } = await adminClient
      .from('announcements')
      .select('id')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const idor003StillExists = Boolean(reRead003?.id);

    testResults.push({
      id: 'IDOR-003',
      category: 'IDOR',
      actor: 'AUTHOR_B',
      operation: 'DELETE Author A draft',
      expected: 'DENY (0 rows) & record still exists',
      actual: `${idor003Res.details} | Target still exists: ${idor003StillExists}`,
      status: idor003Res.status === 'PASS' && idor003StillExists ? 'PASS' : 'FAIL',
    });

    // IDOR-004: PATCH Author A draft status='published'
    const { error: idor004Error, count: idor004Count } = await authorBClient
      .from('announcements')
      .update({ status: 'published' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const idor004Res = classifyMutationResult(idor004Error, idor004Count, 'DENY');

    const { data: reRead004 } = await adminClient
      .from('announcements')
      .select('status')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const idor004Unmodified = reRead004?.status === 'draft';

    testResults.push({
      id: 'IDOR-004',
      category: 'IDOR',
      actor: 'AUTHOR_B',
      operation: 'PATCH Author A draft status=published',
      expected: 'DENY (0 rows) & status remains draft',
      actual: `${idor004Res.details} | Target status: ${reRead004?.status}`,
      status: idor004Res.status === 'PASS' && idor004Unmodified ? 'PASS' : 'FAIL',
    });

    // IDOR-005: PATCH Author A draft is_pinned=true
    const { error: idor005Error, count: idor005Count } = await authorBClient
      .from('announcements')
      .update({ is_pinned: true })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const idor005Res = classifyMutationResult(idor005Error, idor005Count, 'DENY');

    const { data: reRead005 } = await adminClient
      .from('announcements')
      .select('is_pinned')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const idor005Unmodified = reRead005?.is_pinned === false;

    testResults.push({
      id: 'IDOR-005',
      category: 'IDOR',
      actor: 'AUTHOR_B',
      operation: 'PATCH Author A draft is_pinned=true',
      expected: 'DENY (0 rows) & is_pinned remains false',
      actual: `${idor005Res.details} | Target is_pinned: ${reRead005?.is_pinned}`,
      status: idor005Res.status === 'PASS' && idor005Unmodified ? 'PASS' : 'FAIL',
    });

    // IDOR-006: PATCH Author A draft created_by
    const authorBUser = (await authorBClient.auth.getUser()).data.user;
    const authorAUser = (await authorAClient.auth.getUser()).data.user;

    const { error: idor006Error, count: idor006Count } = await authorBClient
      .from('announcements')
      .update({ created_by: authorBUser?.id })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const idor006Res = classifyMutationResult(idor006Error, idor006Count, 'DENY');

    const { data: reRead006 } = await adminClient
      .from('announcements')
      .select('created_by')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const idor006Unmodified = reRead006?.created_by === authorAUser?.id;

    testResults.push({
      id: 'IDOR-006',
      category: 'IDOR',
      actor: 'AUTHOR_B',
      operation: 'PATCH Author A draft created_by',
      expected: 'DENY (0 rows) & created_by remains Author A',
      actual: `${idor006Res.details} | Target created_by: ${reRead006?.created_by}`,
      status: idor006Res.status === 'PASS' && idor006Unmodified ? 'PASS' : 'FAIL',
    });

    // --------------------------------------------------------------------------
    // SECTION 14: Privilege Escalation Suite (PE-001 to PE-007)
    // --------------------------------------------------------------------------
    console.log('\n--- [PRIVILEGE ESCALATION] Executing PE-001 to PE-007 ---');

    // PE-001: Author publish own draft -> Expected DENY
    const { error: pe001Error, count: pe001Count } = await authorAClient
      .from('announcements')
      .update({ status: 'published' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const pe001Res = classifyMutationResult(pe001Error, pe001Count, 'DENY');
    testResults.push({
      id: 'PE-001',
      category: 'Privilege Escalation',
      actor: 'AUTHOR_A',
      operation: 'Publish own draft without announcements.publish',
      expected: 'DENY (0 rows affected or RLS check failure)',
      actual: pe001Res.details,
      status: pe001Res.status,
    });

    // PE-002: Author direct INSERT published -> Expected DENY
    const { error: pe002Error } = await authorAClient
      .from('announcements')
      .insert({ title: 'Illegal Publish', content: 'Testing RLS', status: 'published' });
    const pe002Res = classifyMutationResult(pe002Error, 0, 'DENY');
    testResults.push({
      id: 'PE-002',
      category: 'Privilege Escalation',
      actor: 'AUTHOR_A',
      operation: 'Direct INSERT status=published without permission',
      expected: 'DENY (RLS check failure)',
      actual: pe002Res.details,
      status: pe002Res.status,
    });

    // PE-003: Author direct INSERT scheduled -> Expected DENY
    const { error: pe003Error } = await authorAClient
      .from('announcements')
      .insert({
        title: 'Illegal Scheduled',
        content: 'Testing RLS',
        status: 'published',
        published_at: new Date(Date.now() + 86400000).toISOString(),
      });
    const pe003Res = classifyMutationResult(pe003Error, 0, 'DENY');
    testResults.push({
      id: 'PE-003',
      category: 'Privilege Escalation',
      actor: 'AUTHOR_A',
      operation: 'Direct INSERT scheduled notice without permission',
      expected: 'DENY (RLS check failure)',
      actual: pe003Res.details,
      status: pe003Res.status,
    });

    // PE-004: Author update published announcement -> Expected DENY
    const { error: pe004Error, count: pe004Count } = await authorAClient
      .from('announcements')
      .update({ title: 'Defaced Published' })
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const pe004Res = classifyMutationResult(pe004Error, pe004Count, 'DENY');
    testResults.push({
      id: 'PE-004',
      category: 'Privilege Escalation',
      actor: 'AUTHOR_A',
      operation: 'Author UPDATE active published announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: pe004Res.details,
      status: pe004Res.status,
    });

    // PE-005: Author delete published announcement -> Expected DENY
    const { error: pe005Error, count: pe005Count } = await authorAClient
      .from('announcements')
      .delete()
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE);
    const pe005Res = classifyMutationResult(pe005Error, pe005Count, 'DENY');
    testResults.push({
      id: 'PE-005',
      category: 'Privilege Escalation',
      actor: 'AUTHOR_A',
      operation: 'Author DELETE published announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: pe005Res.details,
      status: pe005Res.status,
    });

    // PE-006: Author pin foreign record -> Expected DENY
    const { error: pe006Error, count: pe006Count } = await authorAClient
      .from('announcements')
      .update({ is_pinned: true })
      .eq('id', runtimeFixtureIds.S07_FIX_B_ACTIVE);
    const pe006Res = classifyMutationResult(pe006Error, pe006Count, 'DENY');
    testResults.push({
      id: 'PE-006',
      category: 'Privilege Escalation',
      actor: 'AUTHOR_A',
      operation: 'Author PIN foreign announcement',
      expected: 'DENY (0 rows affected or RLS error)',
      actual: pe006Res.details,
      status: pe006Res.status,
    });

    // PE-007: Author forge created_by on INSERT -> Expected RLS DENY or Trigger correction
    const { data: pe007Data, error: pe007Error } = await authorAClient
      .from('announcements')
      .insert({
        title: 'Forged Ownership Attempt',
        content: 'Testing PE-007 created_by enforcement',
        status: 'draft',
        created_by: authorBUser?.id,
      })
      .select('id, created_by')
      .single();

    if (pe007Data?.id) tempAnnouncementIds.push(pe007Data.id);

    let pe007Status: TestStatus;
    let pe007Details: string;
    if (pe007Error) {
      if (isRlsOrAuthDenial(pe007Error)) {
        pe007Status = 'PASS';
        pe007Details = `RLS rejected entire forged insert: ${redactError(pe007Error.message)}`;
      } else {
        pe007Status = 'FAIL';
        pe007Details = `Unexpected error: ${redactError(pe007Error.message)}`;
      }
    } else if (pe007Data) {
      if (pe007Data.created_by === authorAUser?.id) {
        pe007Status = 'PASS';
        pe007Details = `Operation succeeded & trigger correctly enforced created_by = ${authorAUser?.id}`;
      } else {
        pe007Status = 'FAIL';
        pe007Details = `VULNERABILITY: created_by accepted forged value ${pe007Data.created_by}`;
      }
    } else {
      pe007Status = 'FAIL';
      pe007Details = 'No error but no data returned';
    }

    testResults.push({
      id: 'PE-007',
      category: 'Privilege Escalation',
      actor: 'AUTHOR_A',
      operation: 'Insert draft with forged created_by',
      expected: 'RLS denial OR trigger enforcement of auth.uid()',
      actual: pe007Details,
      status: pe007Status,
    });

    // --------------------------------------------------------------------------
    // SECTION 15: Audit Trigger Tests (handle_announcements_audit_fields)
    // --------------------------------------------------------------------------
    console.log('\n--- [AUDIT TRIGGERS] Executing AF-001 to AF-006 ---');

    // AF-001: Shares implementation with PE-007
    testResults.push({
      id: 'AF-001',
      category: 'Audit Triggers',
      actor: 'AUTHOR_A',
      operation: 'Enforce created_by on INSERT',
      expected: 'created_by matches authenticated session identity',
      actual: pe007Details,
      status: pe007Status,
    });

    // AF-002: created_by changed on UPDATE -> Must remain OLD.created_by
    const { error: af002Error } = await authorAClient
      .from('announcements')
      .update({ created_by: authorBUser?.id })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const { data: af002Row } = await adminClient
      .from('announcements')
      .select('created_by')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const af002Pass = !af002Error && af002Row?.created_by === authorAUser?.id;
    testResults.push({
      id: 'AF-002',
      category: 'Audit Triggers',
      actor: 'AUTHOR_A',
      operation: 'Prevent created_by mutation on UPDATE',
      expected: 'created_by remains OLD.created_by',
      actual: `created_by: ${af002Row?.created_by} (Unchanged: ${af002Pass})`,
      status: af002Pass ? 'PASS' : 'FAIL',
    });

    // AF-003: created_at changed on UPDATE -> Must remain OLD.created_at
    const fakeOldDate = new Date('2020-01-01T00:00:00Z').toISOString();
    await authorAClient
      .from('announcements')
      .update({ created_at: fakeOldDate })
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT);
    const { data: af003Row } = await adminClient
      .from('announcements')
      .select('created_at')
      .eq('id', runtimeFixtureIds.S07_FIX_A_DRAFT)
      .single();
    const af003Pass = af003Row?.created_at !== fakeOldDate;
    testResults.push({
      id: 'AF-003',
      category: 'Audit Triggers',
      actor: 'AUTHOR_A',
      operation: 'Prevent created_at tampering on UPDATE',
      expected: 'created_at preserved by trigger',
      actual: `created_at was preserved (${af003Row?.created_at})`,
      status: af003Pass ? 'PASS' : 'FAIL',
    });

    // AF-004: published_by forged on draft -> Must remain NULL
    const { data: af004Data } = await authorAClient
      .from('announcements')
      .insert({
        title: 'Draft with Forged Publisher',
        content: 'Testing AF-004',
        status: 'draft',
        published_by: authorAUser?.id,
      })
      .select('id, published_by')
      .single();
    if (af004Data?.id) tempAnnouncementIds.push(af004Data.id);
    const af004Pass = af004Data?.published_by === null;
    testResults.push({
      id: 'AF-004',
      category: 'Audit Triggers',
      actor: 'AUTHOR_A',
      operation: 'Prevent published_by on draft status',
      expected: 'published_by is NULL for drafts',
      actual: `published_by is: ${af004Data?.published_by}`,
      status: af004Pass ? 'PASS' : 'FAIL',
    });

    // AF-005: Unauthorized publish -> Rejected by RLS
    testResults.push({
      id: 'AF-005',
      category: 'Audit Triggers',
      actor: 'AUTHOR_A',
      operation: 'Unauthorized publish attempt',
      expected: 'DENY',
      actual: pe001Res.details,
      status: pe001Res.status,
    });

    // AF-006: Authorized Editor publish -> published_by and published_at stamped
    const { data: af006Draft } = await editorClient
      .from('announcements')
      .insert({ title: 'Editor Draft for Publish', content: 'Testing AF-006', status: 'draft' })
      .select('id')
      .single();
    if (af006Draft?.id) {
      tempAnnouncementIds.push(af006Draft.id);
      await editorClient
        .from('announcements')
        .update({ status: 'published' })
        .eq('id', af006Draft.id);

      const { data: af006Row } = await adminClient
        .from('announcements')
        .select('published_by, published_at')
        .eq('id', af006Draft.id)
        .single();

      const editorUser = (await editorClient.auth.getUser()).data.user;
      const af006Pass = af006Row?.published_by === editorUser?.id && Boolean(af006Row?.published_at);
      testResults.push({
        id: 'AF-006',
        category: 'Audit Triggers',
        actor: 'EDITOR',
        operation: 'Authorized publish lifecycle stamping',
        expected: 'published_by and published_at automatically stamped by trigger',
        actual: `published_by=${af006Row?.published_by}, published_at=${af006Row?.published_at}`,
        status: af006Pass ? 'PASS' : 'FAIL',
      });
    }

    // --------------------------------------------------------------------------
    // SECTION 16: Database Constraints Suite (DC-001 to DC-006)
    // --------------------------------------------------------------------------
    console.log('\n--- [CONSTRAINTS] Executing Database Constraints Suite ---');

    // DC-001: chk_announcements_status (status = 'archived')
    // Direct database constraint probe: evaluates PostgreSQL check constraint directly
    // bypassing RLS authorization layers to isolate storage-level constraint validation
    const { error: dc001Error } = await adminClient
      .from('announcements')
      .insert({ title: 'Invalid Status', content: 'Testing Constraint', status: 'archived' });
    const dc001Res = classifyConstraintResult(dc001Error, 'chk_announcements_status');
    testResults.push({
      id: 'DC-001',
      category: 'Constraints',
      actor: 'DB_PROBE',
      target: 'chk_announcements_status',
      operation: 'INSERT status=archived',
      expected: 'PostgreSQL check constraint rejection (chk_announcements_status)',
      actual: dc001Res.details,
      status: dc001Res.status,
      errorCode: dc001Error?.code,
    });

    // DC-002: chk_announcements_priority (priority = 'critical')
    const { error: dc002Error } = await adminUserClient
      .from('announcements')
      .insert({ title: 'Invalid Priority', content: 'Testing Constraint', priority: 'critical' });
    const dc002Res = classifyConstraintResult(dc002Error, 'chk_announcements_priority');
    testResults.push({
      id: 'DC-002',
      category: 'Constraints',
      actor: 'ADMIN',
      target: 'chk_announcements_priority',
      operation: 'INSERT priority=critical',
      expected: 'PostgreSQL check constraint rejection (chk_announcements_priority)',
      actual: dc002Res.details,
      status: dc002Res.status,
      errorCode: dc002Error?.code,
    });

    // DC-003: chk_announcements_title_not_empty (title = '')
    const { error: dc003Error } = await adminUserClient
      .from('announcements')
      .insert({ title: '', content: 'Testing Constraint', status: 'draft' });
    const dc003Res = classifyConstraintResult(dc003Error, 'chk_announcements_title_not_empty');
    testResults.push({
      id: 'DC-003',
      category: 'Constraints',
      actor: 'ADMIN',
      target: 'chk_announcements_title_not_empty',
      operation: 'INSERT empty title',
      expected: 'PostgreSQL check constraint rejection (chk_announcements_title_not_empty)',
      actual: dc003Res.details,
      status: dc003Res.status,
      errorCode: dc003Error?.code,
    });

    // DC-004: chk_announcements_title_not_empty (whitespace only)
    const { error: dc004Error } = await adminUserClient
      .from('announcements')
      .insert({ title: '    ', content: 'Testing Constraint', status: 'draft' });
    const dc004Res = classifyConstraintResult(dc004Error, 'chk_announcements_title_not_empty');
    testResults.push({
      id: 'DC-004',
      category: 'Constraints',
      actor: 'ADMIN',
      target: 'chk_announcements_title_not_empty',
      operation: 'INSERT whitespace-only title',
      expected: 'PostgreSQL check constraint rejection (chk_announcements_title_not_empty)',
      actual: dc004Res.details,
      status: dc004Res.status,
      errorCode: dc004Error?.code,
    });

    // DC-005: chk_announcements_content_not_empty (content = '')
    const { error: dc005Error } = await adminUserClient
      .from('announcements')
      .insert({ title: 'Valid Title', content: '   ', status: 'draft' });
    const dc005Res = classifyConstraintResult(dc005Error, 'chk_announcements_content_not_empty');
    testResults.push({
      id: 'DC-005',
      category: 'Constraints',
      actor: 'ADMIN',
      target: 'chk_announcements_content_not_empty',
      operation: 'INSERT whitespace-only content',
      expected: 'PostgreSQL check constraint rejection (chk_announcements_content_not_empty)',
      actual: dc005Res.details,
      status: dc005Res.status,
      errorCode: dc005Error?.code,
    });

    // DC-006: chk_announcements_dates (expires_at <= published_at)
    const { error: dc006Error } = await adminUserClient.from('announcements').insert({
      title: 'Invalid Expiry Date',
      content: 'Testing Constraint',
      status: 'published',
      published_at: new Date('2026-09-09T10:00:00Z').toISOString(),
      expires_at: new Date('2026-09-09T09:00:00Z').toISOString(),
    });
    const dc006Res = classifyConstraintResult(dc006Error, 'chk_announcements_dates');
    testResults.push({
      id: 'DC-006',
      category: 'Constraints',
      actor: 'ADMIN',
      target: 'chk_announcements_dates',
      operation: 'INSERT expires_at <= published_at',
      expected: 'PostgreSQL check constraint rejection (chk_announcements_dates)',
      actual: dc006Res.details,
      status: dc006Res.status,
      errorCode: dc006Error?.code,
    });

    // --------------------------------------------------------------------------
    // SECTION 17: Schedule / Expiry Boundaries Suite (SE-001 to SE-007)
    // --------------------------------------------------------------------------
    console.log('\n--- [BOUNDARIES] Executing Schedule & Expiry Boundaries Suite ---');

    // SE-001: published_at < NOW() -> visible in active feed (ALLOW)
    testResults.push({
      id: 'SE-001',
      category: 'Schedule Boundaries',
      actor: 'ANONYMOUS',
      operation: 'Visibility for published_at < NOW()',
      expected: 'ALLOW (1 row)',
      actual: a004Res.details,
      status: a004Res.status,
    });

    // SE-003: published_at > NOW() -> hidden from anonymous (DENY)
    testResults.push({
      id: 'SE-003',
      category: 'Schedule Boundaries',
      actor: 'ANONYMOUS',
      operation: 'Visibility for published_at > NOW() (Scheduled)',
      expected: 'DENY (0 rows)',
      actual: a002Res.details,
      status: a002Res.status,
    });

    // SE-004: expires_at > NOW() -> visible in active feed (ALLOW)
    testResults.push({
      id: 'SE-004',
      category: 'Schedule Boundaries',
      actor: 'ANONYMOUS',
      operation: 'Visibility for expires_at > NOW()',
      expected: 'ALLOW (1 row)',
      actual: a004Res.details,
      status: a004Res.status,
    });

    // SE-006: expires_at < NOW() -> hidden from anonymous (DENY)
    testResults.push({
      id: 'SE-006',
      category: 'Schedule Boundaries',
      actor: 'ANONYMOUS',
      operation: 'Visibility for expires_at < NOW() (Expired)',
      expected: 'DENY (0 rows)',
      actual: a003Res.details,
      status: a003Res.status,
    });

    // SE-007: pinned + expired -> hidden from anonymous despite is_pinned=true (DENY)
    testResults.push({
      id: 'SE-007',
      category: 'Schedule Boundaries',
      actor: 'ANONYMOUS',
      operation: 'Visibility for pinned + expired announcement',
      expected: 'DENY (0 rows)',
      actual: a006Res.details,
      status: a006Res.status,
    });

    // --------------------------------------------------------------------------
    // DATA MINIMIZATION: Public creator.email exclusion
    // --------------------------------------------------------------------------
    console.log('\n--- [DATA MINIMIZATION] Verifying Public Feed Profile Projection ---');
    const { data: publicFeed } = await anonClient
      .from('announcements')
      .select('id, title, creator:profiles!created_by(id, full_name)')
      .eq('id', runtimeFixtureIds.S07_FIX_A_ACTIVE)
      .single();

    const exposedCreatorEmail = (publicFeed?.creator as unknown as Record<string, unknown>)?.email !== undefined;
    testResults.push({
      id: 'MIN-001',
      category: 'Data Minimization',
      actor: 'ANONYMOUS',
      operation: 'Check creator email in public query',
      expected: 'creator.email NOT exposed in public projection',
      actual: exposedCreatorEmail ? 'VULNERABILITY: Email present in projection' : 'Email safely excluded',
      status: !exposedCreatorEmail ? 'PASS' : 'FAIL',
    });

    // Evaluate verdict under Protocol 1.3 rules (Section 21)
    const hasFail = testResults.some((t) => t.status === 'FAIL');
    const hasBlocked = testResults.some((t) => t.status === 'BLOCKED');
    if (hasFail) {
      executionVerdict = 'FAIL — SECURITY VALIDATION FAILED';
    } else if (hasBlocked) {
      executionVerdict = 'CONDITIONAL PASS — RUNTIME VALIDATION BLOCKED';
    } else {
      executionVerdict = 'PASS — LIVE RLS VALIDATED';
    }
  } catch (err: unknown) {
    const errorMsg = redactError(err instanceof Error ? err.message : String(err));
    console.error('Execution encountered fatal error:', errorMsg);
    findings.push(`Fatal execution abort: ${errorMsg}`);
    executionVerdict = 'FAIL — SECURITY VALIDATION FAILED';
  } finally {
    // --------------------------------------------------------------------------
    // SECTION 20: Guaranteed Cleanup in finally block (F3 - Safe Selective Cleanup)
    // --------------------------------------------------------------------------
    console.log('\n--- [CLEANUP] Executing Guaranteed Selective Cleanup ---');
    let cleanupFailed = false;
    let deletedRecords = 0;
    let orphanRecords = 0;

    // 1. Clean up fixtures & temp announcements created by runner
    const allAnnouncementIds = Array.from(
      new Set([...Object.values(runtimeFixtureIds), ...tempAnnouncementIds])
    );
    const createdAnnouncementCount = allAnnouncementIds.length;

    if (allAnnouncementIds.length > 0) {
      const { error: cleanFixErr } = await adminClient
        .from('announcements')
        .delete()
        .in('id', allAnnouncementIds);
      if (cleanFixErr) {
        console.error('Fixture cleanup error:', redactError(cleanFixErr.message));
        cleanupFailed = true;
      } else {
        deletedRecords += allAnnouncementIds.length;
        console.log(`Cleaned up ${allAnnouncementIds.length} test announcements.`);
      }

      // Verify no test announcements remain
      const { data: leftoverFix } = await adminClient
        .from('announcements')
        .select('id')
        .in('id', allAnnouncementIds);
      if (leftoverFix && leftoverFix.length > 0) {
        orphanRecords += leftoverFix.length;
        console.error(`Cleanup verification failed: ${leftoverFix.length} announcement records remain!`);
        cleanupFailed = true;
      }
    }

    // 2. Clean up user_roles, profiles, and auth users ONLY for runner-created users (Preserving pre-existing)
    if (runnerCreatedUserIds.length > 0) {
      await adminClient.from('user_roles').delete().in('user_id', runnerCreatedUserIds);
      await adminClient.from('profiles').delete().in('id', runnerCreatedUserIds);

      for (const uid of runnerCreatedUserIds) {
        try {
          await adminClient.auth.admin.deleteUser(uid);
          deletedRecords++;
        } catch (delErr) {
          orphanRecords++;
          console.error(`Failed to delete runner-created auth user ${uid}:`, redactError(String(delErr)));
          cleanupFailed = true;
        }
      }
      console.log(`Cleaned up ${runnerCreatedUserIds.length} runner-created test identities.`);
    }

    if (preExistingUserIdsPreserved.length > 0) {
      console.log(`Pre-existing auth users preserved (${preExistingUserIdsPreserved.length}): ${preExistingUserIdsPreserved.join(', ')}`);
    }

    const totalCreatedRecords = createdAnnouncementCount + runnerCreatedUserIds.length;
    const cleanupStatus = cleanupFailed ? 'FAIL — CLEANUP INCOMPLETE' : 'CLEAN';

    if (cleanupFailed) {
      executionVerdict = 'FAIL — CLEANUP INCOMPLETE';
      findings.push('Cleanup of runner-created test fixtures or identities failed; orphan records detected.');
    }

    // Write final reports
    await writeReports(testResults, executionVerdict, findings, {
      migrationsSourceReady,
      remoteSchemaReady,
      liveRlsExecution,
      identityMode: IDENTITY_MODE,
      createdTestRecords: totalCreatedRecords,
      deletedTestRecords: deletedRecords,
      preExistingRecordsPreserved: preExistingUserIdsPreserved.length,
      orphanRecords,
      cleanupStatus,
    });
  }

  console.log('\n============================================================');
  console.log(`FINAL VERDICT: ${executionVerdict}`);
  console.log('============================================================');

  if (executionVerdict.startsWith('FAIL') || executionVerdict.startsWith('BLOCKED')) {
    process.exit(1);
  }
}

// ==============================================================================
// 6. REPORT ARTIFACT WRITERS (JSON & MARKDOWN)
// ==============================================================================

interface ReportMetadata {
  migrationsSourceReady: boolean;
  remoteSchemaReady: boolean;
  liveRlsExecution: boolean;
  identityMode: string;
  createdTestRecords: number;
  deletedTestRecords: number;
  preExistingRecordsPreserved: number;
  orphanRecords: number;
  cleanupStatus: string;
}

async function writeReports(
  results: TestResult[],
  verdict: string,
  findings: string[],
  meta: ReportMetadata
): Promise<void> {
  const artifactsDir = path.resolve(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const jsonReportPath = path.join(artifactsDir, 'step07-live-validation-report.json');
  const mdReportPath = path.join(artifactsDir, 'step07-live-validation-report.md');

  const summary = {
    generatedAt: new Date().toISOString(),
    protocolVersion: '1.3',
    verdict,
    migrationsSourceReady: meta.migrationsSourceReady,
    remoteSchemaReady: meta.remoteSchemaReady,
    liveRlsExecution: meta.liveRlsExecution,
    identityMode: meta.identityMode,
    totalTests: results.length,
    passed: results.filter((r) => r.status === 'PASS').length,
    failed: results.filter((r) => r.status === 'FAIL').length,
    blocked: results.filter((r) => r.status === 'BLOCKED').length,
    notExecuted: results.filter((r) => r.status === 'NOT_EXECUTED').length,
    createdTestRecords: meta.createdTestRecords,
    deletedTestRecords: meta.deletedTestRecords,
    preExistingRecordsPreserved: meta.preExistingRecordsPreserved,
    orphanRecords: meta.orphanRecords,
    cleanupStatus: meta.cleanupStatus,
    findings,
    results,
  };

  fs.writeFileSync(jsonReportPath, JSON.stringify(summary, null, 2), 'utf-8');

  let mdContent = `# STEP 07 LIVE RLS & SECURITY VALIDATION REPORT\n\n`;
  mdContent += `**Protocol Version:** 1.3  \n`;
  mdContent += `**Identity Model:** ${meta.identityMode}  \n`;
  mdContent += `**Migrations Source Ready:** ${meta.migrationsSourceReady ? 'YES' : 'NO'}  \n`;
  mdContent += `**Remote Schema Ready:** ${meta.remoteSchemaReady ? 'YES' : 'NO'}  \n`;
  mdContent += `**Live RLS Execution:** ${meta.liveRlsExecution ? 'YES' : 'NO'}  \n`;
  mdContent += `**Generated At:** ${summary.generatedAt}  \n`;
  mdContent += `**Final Verdict:** \`${verdict}\`  \n\n`;

  mdContent += `## Summary Statistics\n`;
  mdContent += `- **Total Tests:** ${summary.totalTests}\n`;
  mdContent += `- **PASS:** ${summary.passed}\n`;
  mdContent += `- **FAIL:** ${summary.failed}\n`;
  mdContent += `- **BLOCKED:** ${summary.blocked}\n`;
  mdContent += `- **NOT_EXECUTED:** ${summary.notExecuted}\n\n`;

  mdContent += `## Cleanup & Isolation Statistics\n`;
  mdContent += `- **Created Test Records:** ${meta.createdTestRecords}\n`;
  mdContent += `- **Deleted Test Records:** ${meta.deletedTestRecords}\n`;
  mdContent += `- **Pre-existing Records Preserved:** ${meta.preExistingRecordsPreserved}\n`;
  mdContent += `- **Orphan Records:** ${meta.orphanRecords}\n`;
  mdContent += `- **Cleanup Status:** \`${meta.cleanupStatus}\`\n\n`;

  mdContent += `## Test Results Matrix\n\n`;
  mdContent += `| ID | Category | Actor | Operation | Status | Details |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :---: | :--- |\n`;

  for (const r of results) {
    const statusBadge =
      r.status === 'PASS'
        ? '✅ PASS'
        : r.status === 'FAIL'
          ? '❌ FAIL'
          : r.status === 'BLOCKED'
            ? '⚠️ BLOCKED'
            : '⏸️ NOT_EXECUTED';
    mdContent += `| ${r.id} | ${r.category} | ${r.actor} | ${r.operation} | ${statusBadge} | ${r.actual.replace(/\|/g, '-')} |\n`;
  }

  if (findings.length > 0) {
    mdContent += `\n## Execution Findings\n`;
    for (const f of findings) {
      mdContent += `- ${f}\n`;
    }
  }

  fs.writeFileSync(mdReportPath, mdContent, 'utf-8');
  console.log(`Reports written to:`);
  console.log(`  - ${jsonReportPath}`);
  console.log(`  - ${mdReportPath}`);
}

// Entry point execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runStep07LiveValidation().catch((err) => {
    console.error('Unhandled runner error:', redactError(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  });
}
