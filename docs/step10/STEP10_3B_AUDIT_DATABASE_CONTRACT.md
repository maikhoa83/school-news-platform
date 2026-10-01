# STEP 10.3B — AUDIT DATABASE CONTRACT SPECIFICATION
**School News Platform — Data Model & Access Boundaries**

---

## 1. Database Schema Specification

### 1.1 Table: `public.audit_logs`

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| `id` | `UUID` | **NO** | `gen_random_uuid()` | Primary Key (Universally Unique Identifier) |
| `actor_id` | `UUID` | YES | `NULL` | Foreign key referencing `auth.users(id)` (`ON DELETE SET NULL`) |
| `actor_email` | `VARCHAR(255)` | YES | `NULL` | Snapshot of actor's email address at event time |
| `actor_name` | `VARCHAR(255)` | YES | `NULL` | Snapshot of actor's display name at event time |
| `actor_role` | `VARCHAR(50)` | YES | `NULL` | Snapshot of actor's primary role or active role context |
| `action` | `VARCHAR(100)` | **NO** | - | Structured action identifier (e.g., `USER_ROLE_ASSIGNED`, `AUTHORIZATION_DENIED`) |
| `classification` | `VARCHAR(50)` | **NO** | - | Event category: `AUTH`, `ROLE`, `USER`, `NEWS`, `MEDIA`, `SETTINGS`, `SECURITY`, `SYSTEM` |
| `resource` | `VARCHAR(100)` | **NO** | - | Resource domain (e.g., `news`, `users`, `roles`, `settings`, `media`) |
| `resource_id` | `VARCHAR(100)` | YES | `NULL` | Target resource identifier |
| `result` | `VARCHAR(20)` | **NO** | - | Outcome status: `SUCCESS`, `DENIED`, `FAILURE` |
| `description` | `TEXT` | **NO** | - | Human-readable explanation of the event |
| `metadata` | `JSONB` | **NO** | `'{}'::jsonb` | Sanitized contextual event payload |
| `ip_address` | `VARCHAR(45)` | YES | `NULL` | Masked client IP address (IPv4 or IPv6) |
| `user_agent` | `VARCHAR(500)` | YES | `NULL` | Truncated client user agent header |
| `created_at` | `TIMESTAMPTZ` | **NO** | `timezone('utc'::text, now())` | Immutable event timestamp in UTC |

---

## 2. Foreign Key & Referential Integrity

- **Constraint**: `FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL`
- **Behavior**: If an authenticated user account is deleted, existing audit logs remain intact for compliance; `actor_id` is set to `NULL`, while `actor_email`, `actor_name`, and `actor_role` preserve the historical forensic record.

---

## 3. Database Indexes

| Index Name | Column(s) | Type | Purpose |
|------------|-----------|------|---------|
| `audit_logs_pkey` | `id` | B-Tree (PK) | Direct record lookup by ID |
| `idx_audit_logs_created_at` | `created_at DESC` | B-Tree | Chronological sorting and time-range filtering |
| `idx_audit_logs_classification` | `classification` | B-Tree | Filtering by audit category |
| `idx_audit_logs_result` | `result` | B-Tree | Filtering by outcome (`SUCCESS`, `DENIED`, `FAILURE`) |
| `idx_audit_logs_resource` | `resource` | B-Tree | Filtering by target resource |
| `idx_audit_logs_actor_email` | `actor_email` | B-Tree | Searching audit events by actor email |

---

## 4. Row Level Security Policies

### 4.1 SELECT Policy: Privileged Read Access
- **Name**: `"Allow privileged read access to audit logs"`
- **Target Role**: `authenticated`
- **Specification**: Evaluates if the calling user holds an active role possessing `p.code = 'audit.view'` or `p.code = '*'`.
- **Anonymous Access**: Strictly blocked (evaluates to false / rejected).

### 4.2 INSERT Policy: Authenticated Event Logging
- **Name**: `"Allow authenticated insert to audit logs"`
- **Target Role**: `authenticated`
- **Check**: `auth.uid() IS NOT NULL`
- **Anonymous Insert**: Strictly blocked.

### 4.3 UPDATE & DELETE Policies
- **Explicit Omission**: Zero UPDATE or DELETE policies are declared.
- **Result**: PostgreSQL default deny rejects all update or delete attempts via Supabase APIs.

---

## 5. Application Service Boundary Contract

### 5.1 Service Methods (`src/modules/audit/services/auditService.ts`)

```typescript
// Create an audit event (with automated sanitization & IP masking)
export async function createAuditLog(event: RecordAuditEventInput): Promise<AuditLogRecord>;
export async function recordAuditEvent(event: RecordAuditEventInput): Promise<AuditLogRecord>;

// Paginated query with multi-dimensional filtering
export async function listAuditLogs(params: AuditFilterParams): Promise<PaginatedAuditLogs>;

// Single record inspection
export async function getAuditLogById(id: string): Promise<AuditLogRecord>;

// Aggregated metrics & security indicators
export async function getAuditStats(): Promise<AuditStats>;

// Health & fallback status
export function isAuditFallbackMode(): boolean;
```

### 5.2 Invariants & Data Guarantees
1. **Sanitization Invariant**: Sensitive fields (`password`, `token`, `secret`, `api_key`) are stripped from `metadata` before write.
2. **Privacy Invariant**: All IP addresses are masked before write (`192.168.1.xxx`).
3. **No Direct Supabase Calls**: All UI and hook consumers MUST import domain methods from `auditService` or associated hooks.
