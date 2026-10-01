/**
 * School News Platform - Step 10.3 Verification Script
 * AUDIT LOG & AUTHORIZATION AUDIT VERIFICATION
 */

import fs from 'fs';
import path from 'path';
import {
  auditActionSchema,
  auditClassificationSchema,
  auditResultSchema,
  auditLogQuerySchema,
  recordAuditLogSchema,
} from '../../src/modules/audit/schemas/auditSchema';
import {
  sanitizeAuditMetadata,
  maskIpAddress,
  formatAuditActor,
  formatAuditResource,
} from '../../src/modules/audit/utils/auditSanitizer';
import {
  AUDIT_CLASSIFICATIONS,
  AUDIT_RESULTS,
  AUDIT_ACTIONS,
  AUDIT_CLASSIFICATION_CONFIG,
  AUDIT_RESULT_CONFIG,
} from '../../src/modules/audit/config/auditConfig';
import {
  listAuditLogs,
  getAuditLogById,
  getAuditStats,
  recordAuditLog,
  isAuditFallbackMode,
  AuditServiceError,
} from '../../src/modules/audit/services/auditService';
import { authorizationAudit } from '../../src/modules/audit/services/authorizationAudit';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

async function runStep10_3Verification() {
  console.log('============================================================');
  console.log('RUNNING STEP 10.3 AUDIT LOG & AUTHORIZATION AUDIT VERIFICATION');
  console.log('============================================================\n');

  // -----------------------------------------------------------------------------
  // 1. Module Structure & Architecture Inspection
  // -----------------------------------------------------------------------------
  console.log('--- 1. Module Structure & File Hierarchy ---');

  const requiredFiles = [
    'src/modules/audit/types/audit.ts',
    'src/types/audit.ts',
    'src/modules/audit/config/auditConfig.ts',
    'src/modules/audit/schemas/auditSchema.ts',
    'src/modules/audit/utils/auditSanitizer.ts',
    'src/modules/audit/services/auditService.ts',
    'src/services/auditService.ts',
    'src/modules/audit/services/authorizationAudit.ts',
    'src/modules/audit/hooks/useAuditLogs.ts',
    'src/modules/audit/hooks/useAuditLog.ts',
    'src/modules/audit/hooks/useAuditStats.ts',
    'src/modules/audit/hooks/index.ts',
    'src/modules/audit/components/AuditResultBadge.tsx',
    'src/modules/audit/components/AuditClassificationBadge.tsx',
    'src/modules/audit/components/AuditDetailModal.tsx',
    'src/modules/audit/components/index.ts',
    'src/modules/audit/pages/AdminAuditPage.tsx',
    'src/pages/admin/AdminAuditPage.tsx',
    'src/modules/audit/index.ts',
  ];

  requiredFiles.forEach((relPath) => {
    const fullPath = path.resolve(process.cwd(), relPath);
    assert(fs.existsSync(fullPath), `Structure: Required file exists: ${relPath}`);
  });

  // -----------------------------------------------------------------------------
  // 2. Static Security & Architecture Invariants
  // -----------------------------------------------------------------------------
  console.log('\n--- 2. Static Security & Architecture Invariants ---');

  function getAllFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getAllFiles(full));
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const auditFiles = getAllFiles(path.resolve(process.cwd(), 'src/modules/audit'));

  // 2.1 Zero service_role in client codebase
  auditFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    const rel = path.relative(process.cwd(), f);
    assert(!content.includes('service_role'), `Security: Zero service_role in ${rel}`);
  });

  // 2.2 Zero @ts-ignore in audit module
  auditFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    const rel = path.relative(process.cwd(), f);
    assert(!content.includes('@ts-ignore'), `Hygiene: Zero @ts-ignore in ${rel}`);
  });

  // 2.3 Zero explicit "any" in audit module
  const explicitAnyRegex = /(:\s*any\b|\bas\s+any\b)/;
  auditFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    const rel = path.relative(process.cwd(), f);
    assert(!explicitAnyRegex.test(content), `Type Safety: Zero explicit "any" in ${rel}`);
  });

  // 2.4 Zero hardcoded literal UUIDs in audit module
  const hardcodedUuidRegex = /['"][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}['"]/i;
  auditFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    const rel = path.relative(process.cwd(), f);
    assert(!hardcodedUuidRegex.test(content), `Security: Zero hardcoded UUIDs in ${rel}`);
  });

  // 2.5 Zero direct supabase calls in UI components, hooks, or pages
  const uiAndHookFiles = auditFiles.filter(
    (f) =>
      f.includes('/components/') ||
      f.includes('/hooks/') ||
      f.includes('/pages/')
  );
  uiAndHookFiles.forEach((f) => {
    const content = fs.readFileSync(f, 'utf-8');
    const rel = path.relative(process.cwd(), f);
    assert(!content.includes('supabase.from('), `Architecture: Zero supabase.from in ${rel}`);
    assert(!content.includes('supabase.auth'), `Architecture: Zero supabase.auth in ${rel}`);
  });

  // 2.6 Database migrations count preserved (14 baseline or 15 with Step 10.3B audit_logs)
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  assert(
    migrationFiles.length >= 14 && migrationFiles.length <= 15,
    `Database Invariant: Migration files count strictly preserved (Found: ${migrationFiles.length})`
  );

  // -----------------------------------------------------------------------------
  // 3. Schema & Validation Contracts
  // -----------------------------------------------------------------------------
  console.log('\n--- 3. Schema & Validation Contracts ---');

  // 3.1 Classifications & Results
  assert(AUDIT_CLASSIFICATIONS.length === 7, 'Contract: Exactly 7 audit classifications configured');
  assert(AUDIT_RESULTS.length === 3, 'Contract: Exactly 3 audit result types configured');

  // 3.2 AuditAction validation
  assert(auditActionSchema.safeParse('USER_ROLE_ASSIGNED').success, 'Schema: USER_ROLE_ASSIGNED accepted');
  assert(auditActionSchema.safeParse('AUTHORIZATION_DENIED').success, 'Schema: AUTHORIZATION_DENIED accepted');
  assert(auditActionSchema.safeParse('PRIVILEGE_ESCALATION_ATTEMPT').success, 'Schema: PRIVILEGE_ESCALATION_ATTEMPT accepted');
  assert(!auditActionSchema.safeParse('INVALID_ACTION_CODE').success, 'Schema: Invented action rejected');

  // 3.3 AuditClassification validation
  assert(auditClassificationSchema.safeParse('ROLE').success, 'Schema: ROLE classification accepted');
  assert(auditClassificationSchema.safeParse('AUTHORIZATION').success, 'Schema: AUTHORIZATION classification accepted');
  assert(!auditClassificationSchema.safeParse('UNKNOWN_CLASSIFICATION').success, 'Schema: Invalid classification rejected');

  // 3.4 AuditResult validation
  assert(auditResultSchema.safeParse('SUCCESS').success, 'Schema: SUCCESS result accepted');
  assert(auditResultSchema.safeParse('DENIED').success, 'Schema: DENIED result accepted');
  assert(auditResultSchema.safeParse('FAILURE').success, 'Schema: FAILURE result accepted');
  assert(!auditResultSchema.safeParse('ERROR').success, 'Schema: Non-standard result code rejected');

  // 3.5 Query Schema validation
  const validQuery = auditLogQuerySchema.safeParse({
    page: 1,
    pageSize: 25,
    classification: 'SECURITY',
    result: 'DENIED',
    search: 'escalation',
  });
  assert(validQuery.success, 'Query Schema: Valid query parameters accepted');

  const negativePageQuery = auditLogQuerySchema.safeParse({ page: -5 });
  assert(!negativePageQuery.success, 'Query Schema: Negative page number rejected');

  // 3.6 Record Creation Schema (strict mode)
  const validRecordInput = recordAuditLogSchema.safeParse({
    action: 'CONTENT_PUBLISHED',
    classification: 'CONTENT',
    resource: 'news',
    result: 'SUCCESS',
    description: 'Tin tức đã xuất bản',
    metadata: { post_id: '123' },
  });
  assert(validRecordInput.success, 'Record Schema: Valid audit entry accepted');

  const emptyDescInput = recordAuditLogSchema.safeParse({
    action: 'CONTENT_PUBLISHED',
    classification: 'CONTENT',
    resource: 'news',
    result: 'SUCCESS',
    description: '',
  });
  assert(!emptyDescInput.success, 'Record Schema: Empty description rejected');

  const rogueFieldInput = recordAuditLogSchema.safeParse({
    action: 'CONTENT_PUBLISHED',
    classification: 'CONTENT',
    resource: 'news',
    result: 'SUCCESS',
    description: 'Test',
    rogue_field: 'exploit',
  });
  assert(!rogueFieldInput.success, 'Record Schema: Strict mode blocks arbitrary/rogue fields');

  // -----------------------------------------------------------------------------
  // 4. Data Sanitization & Privacy Invariants
  // -----------------------------------------------------------------------------
  console.log('\n--- 4. Data Sanitization & Privacy Invariants ---');

  // 4.1 Sensitive Key Redaction
  const rawMetadata = {
    user_id: 'user-123',
    password: 'SuperSecretPassword123!',
    token: 'jwt.token.here',
    api_key: 'AIzaSyExampleKey',
    credentials: { private_key: '-----BEGIN RSA PRIVATE KEY-----' },
    nested: {
      session_secret: 'session-xyz',
      safe_param: 'allowed-value',
    },
  };

  const sanitized = sanitizeAuditMetadata(rawMetadata);
  assert(sanitized.user_id === 'user-123', 'Sanitizer: Preserves non-sensitive keys');
  assert(sanitized.password === '[REDACTED]', 'Sanitizer: Redacts password');
  assert(sanitized.token === '[REDACTED]', 'Sanitizer: Redacts token');
  assert(sanitized.api_key === '[REDACTED]', 'Sanitizer: Redacts api_key');

  const nested = sanitized.nested as Record<string, unknown>;
  assert(nested.session_secret === '[REDACTED]', 'Sanitizer: Redacts nested sensitive keys');
  assert(nested.safe_param === 'allowed-value', 'Sanitizer: Preserves nested safe values');

  // 4.2 IP Address Masking
  assert(maskIpAddress('192.168.1.150') === '192.168.1.xxx', 'Sanitizer: Masks IPv4 address');
  assert(maskIpAddress('10.0.0.1') === '10.0.0.xxx', 'Sanitizer: Masks private IPv4 address');
  assert(maskIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334').includes(':xxxx'), 'Sanitizer: Masks IPv6 address');
  assert(maskIpAddress(null) === 'Không xác định', 'Sanitizer: Handles null IP gracefully');

  // 4.3 Format Helpers
  assert(
    formatAuditActor('Nguyễn Văn A', 'admin@truong.edu.vn') === 'Nguyễn Văn A (admin@truong.edu.vn)',
    'Sanitizer: Formats full actor display'
  );
  assert(
    formatAuditActor(null, null) === 'Hệ thống / Chưa xác thực',
    'Sanitizer: Fallback for unauthenticated/system actor'
  );
  assert(
    formatAuditResource('news', 'n-123') === 'news #n-123',
    'Sanitizer: Formats resource with identifier'
  );

  // -----------------------------------------------------------------------------
  // 5. Service & Fallback Semantics
  // -----------------------------------------------------------------------------
  console.log('\n--- 5. Service & Fallback Semantics ---');

  // 5.1 Fallback availability
  const fallbackActive = isAuditFallbackMode();
  assert(typeof fallbackActive === 'boolean', 'Service: isAuditFallbackMode returns boolean');

  // 5.2 listAuditLogs
  const listResult = await listAuditLogs({ page: 1, pageSize: 5 });
  assert(listResult.data.length <= 5, 'Service: listAuditLogs respects pageSize pagination');
  assert(listResult.total > 0, 'Service: listAuditLogs reports total item count');
  assert(listResult.page === 1, 'Service: listAuditLogs returns requested page');
  assert(listResult.totalPages >= 1, 'Service: listAuditLogs returns valid totalPages');

  // 5.3 Filter by classification
  const securityLogs = await listAuditLogs({ classification: 'SECURITY' });
  assert(
    securityLogs.data.every((log) => log.classification === 'SECURITY'),
    'Service: Filters precisely by classification'
  );

  // 5.4 Filter by result
  const deniedLogs = await listAuditLogs({ result: 'DENIED' });
  assert(
    deniedLogs.data.every((log) => log.result === 'DENIED'),
    'Service: Filters precisely by result code'
  );

  // 5.5 getAuditLogById
  if (listResult.data.length > 0) {
    const sampleId = listResult.data[0].id;
    const singleLog = await getAuditLogById(sampleId);
    assert(singleLog !== null && singleLog.id === sampleId, 'Service: getAuditLogById retrieves exact record');
  }

  let notFoundCaught = false;
  try {
    await getAuditLogById(['00000000', '0000', '0000', '0000', '000000000000'].join('-'));
  } catch (err) {
    if (err instanceof AuditServiceError && err.code === 'NOT_FOUND') {
      notFoundCaught = true;
    }
  }
  assert(notFoundCaught, 'Service: getAuditLogById throws NOT_FOUND for missing ID');

  // 5.6 getAuditStats
  const stats = await getAuditStats();
  assert(stats.totalLogs >= 0, 'Service: getAuditStats returns totalLogs count');
  assert(typeof stats.deniedCount === 'number', 'Service: getAuditStats returns deniedCount metric');
  assert(typeof stats.securityAlertCount === 'number', 'Service: getAuditStats returns securityAlertCount metric');

  // 5.7 recordAuditLog sanitizes and appends
  const recorded = await recordAuditLog({
    action: 'SETTINGS_UPDATED',
    classification: 'SETTINGS',
    resource: 'settings',
    resource_id: 'test_setting',
    result: 'SUCCESS',
    description: 'Unit test audit event',
    metadata: {
      safe_data: 'ok',
      secret_token: 'should-be-masked',
    },
    ip_address: '10.20.30.40',
  });
  assert(recorded.id.length > 0, 'Service: recordAuditLog returns created record with generated ID');
  assert(
    (recorded.metadata as Record<string, unknown>).secret_token === '[REDACTED]',
    'Service: recordAuditLog automatically sanitizes metadata on write'
  );

  // -----------------------------------------------------------------------------
  // 6. Authorization Audit Bridge
  // -----------------------------------------------------------------------------
  console.log('\n--- 6. Authorization Audit Bridge ---');

  // 6.1 logDeniedAccess does not throw
  let deniedAuditSuccess = false;
  try {
    await authorizationAudit.logDeniedAccess({
      attempted_permission: 'news.delete',
      held_roles: ['AUTHOR'],
      resource: 'news',
      resource_id: 'news-99',
      actor_id: 'user-author',
      actor_email: 'tacgia@truong.edu.vn',
      reason: 'AUTHOR cannot delete published news',
    });
    deniedAuditSuccess = true;
  } catch {
    deniedAuditSuccess = false;
  }
  assert(deniedAuditSuccess, 'Bridge: logDeniedAccess executes fail-safely');

  // 6.2 logPrivilegeEscalationAttempt does not throw
  let escalationAuditSuccess = false;
  try {
    await authorizationAudit.logPrivilegeEscalationAttempt({
      actor_id: 'user-editor',
      actor_email: 'editor@truong.edu.vn',
      target_user_id: 'user-editor',
      attempted_role: 'SUPER_ADMIN',
      guard: 'userService.assignUserRoles',
    });
    escalationAuditSuccess = true;
  } catch {
    escalationAuditSuccess = false;
  }
  assert(escalationAuditSuccess, 'Bridge: logPrivilegeEscalationAttempt executes fail-safely');

  // 6.3 logRoleMutation does not throw
  let roleMutationSuccess = false;
  try {
    await authorizationAudit.logRoleMutation({
      actor_id: 'admin-user',
      actor_email: 'admin@truong.edu.vn',
      target_user_id: 'user-teacher',
      target_user_email: 'teacher@truong.edu.vn',
      assigned_roles: ['EDITOR'],
      previous_roles: ['AUTHOR'],
      success: true,
    });
    roleMutationSuccess = true;
  } catch {
    roleMutationSuccess = false;
  }
  assert(roleMutationSuccess, 'Bridge: logRoleMutation executes fail-safely');

  // -----------------------------------------------------------------------------
  // 7. Navigation, Routing & Module Registry Integration
  // -----------------------------------------------------------------------------
  console.log('\n--- 7. Navigation, Routing & Module Registry Integration ---');

  const routerPath = path.resolve(process.cwd(), 'src/routes/index.tsx');
  const routerContent = fs.readFileSync(routerPath, 'utf-8');

  assert(
    routerContent.includes("import { AdminAuditPage } from '../pages/admin/AdminAuditPage'"),
    'Router: Imports AdminAuditPage component'
  );
  assert(
    routerContent.includes('path="audit"') && routerContent.includes('requiredPermission="audit.view"'),
    'Router: /admin/audit is guarded with audit.view'
  );
  assert(
    routerContent.includes('moduleKey="audit"'),
    'Router: Protected by ModuleGuard with moduleKey="audit"'
  );

  const registryPath = path.resolve(process.cwd(), 'src/lib/moduleRegistry.ts');
  const registryContent = fs.readFileSync(registryPath, 'utf-8');

  assert(
    registryContent.includes("requiredPermissions: ['audit.view']"),
    'Module Registry: audit module requires audit.view permission'
  );
  assert(
    registryContent.includes("adminRoute: '/admin/audit'"),
    'Module Registry: audit module adminRoute configured to /admin/audit'
  );

  const navPath = path.resolve(process.cwd(), 'src/navigation/adminNavigation.ts');
  const navContent = fs.readFileSync(navPath, 'utf-8');

  assert(
    navContent.includes("href: '/admin/audit'"),
    'Admin Navigation: Navigates to /admin/audit'
  );
  assert(
    navContent.includes("requiredPermission: 'audit.view'"),
    'Admin Navigation: Protected by audit.view'
  );

  // -----------------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`STEP 10.3 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED (TOTAL: ${passCount + failCount})`);
  console.log('============================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runStep10_3Verification().catch((err) => {
  console.error('Fatal Verification Failure:', err);
  process.exit(1);
});
