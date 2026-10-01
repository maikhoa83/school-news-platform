/**
 * Audit Metadata Sanitizer & Secret Redaction Utility
 * School News Platform - Step 10.3
 *
 * Guarantees:
 * - Purges sensitive keys (passwords, tokens, API keys, session secrets, auth headers)
 * - Limits string lengths to prevent storage bloat
 * - Bounds recursion depth and key count
 * - Returns clean, safe, and readable metadata
 */

import { AUDIT_LIMITS, SENSITIVE_KEY_PATTERNS } from '../config/auditConfig';

/**
 * Checks if a key matches any known sensitive patterns
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Recursively sanitizes a value, stripping sensitive keys and bounding payload size
 */
export function sanitizeMetadataValue(
  value: unknown,
  depth: number = 0
): unknown {
  if (depth > AUDIT_LIMITS.MAX_METADATA_DEPTH) {
    return '[TRUNCATED_DEPTH]';
  }

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    // Check if the string itself resembles a JWT token or bearer token
    if (value.startsWith('Bearer ') || value.startsWith('eyJ')) {
      return '[REDACTED_TOKEN]';
    }
    if (value.length > AUDIT_LIMITS.MAX_METADATA_STRING_LENGTH) {
      return `${value.slice(0, AUDIT_LIMITS.MAX_METADATA_STRING_LENGTH)}... [TRUNCATED]`;
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 20)
      .map((item) => sanitizeMetadataValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    const cleanObject: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>);
    let count = 0;

    for (const [key, val] of entries) {
      if (count >= AUDIT_LIMITS.MAX_METADATA_KEYS) {
        cleanObject['_more_keys'] = `[TRUNCATED_${entries.length - count}_KEYS]`;
        break;
      }

      if (isSensitiveKey(key)) {
        cleanObject[key] = '[REDACTED]';
      } else {
        cleanObject[key] = sanitizeMetadataValue(val, depth + 1);
      }
      count++;
    }

    return cleanObject;
  }

  return String(value);
}

/**
 * Main sanitizer function for Audit Log metadata
 */
export function sanitizeAuditMetadata(
  rawMetadata?: Record<string, unknown>
): Record<string, unknown> {
  if (!rawMetadata || typeof rawMetadata !== 'object') {
    return {};
  }
  return sanitizeMetadataValue(rawMetadata, 0) as Record<string, unknown>;
}

/**
 * Masks IP address to preserve user privacy
 */
export function maskIpAddress(ip?: string | null): string {
  if (!ip || ip.trim() === '') {
    return 'Không xác định';
  }
  const cleanIp = ip.trim();

  // IPv4 format: 192.168.1.10 -> 192.168.1.xxx
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }

  // IPv6 format
  if (cleanIp.includes(':')) {
    const parts = cleanIp.split(':');
    if (parts.length > 2) {
      return `${parts.slice(0, 3).join(':')}:xxxx`;
    }
  }

  return `${cleanIp.slice(0, 6)}...`;
}

/**
 * Formats actor display name and email
 */
export function formatAuditActor(
  name?: string | null,
  email?: string | null
): string {
  if (name && email) {
    return `${name} (${email})`;
  }
  if (name) {
    return name;
  }
  if (email) {
    return email;
  }
  return 'Hệ thống / Chưa xác thực';
}

/**
 * Formats resource display with optional resource ID
 */
export function formatAuditResource(
  resource: string,
  resourceId?: string | null
): string {
  if (resourceId && resourceId.trim() !== '') {
    return `${resource} #${resourceId}`;
  }
  return resource;
}
