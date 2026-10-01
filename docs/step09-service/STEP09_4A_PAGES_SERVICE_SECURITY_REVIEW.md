# STEP 09.4A — PAGES SERVICE & HOOKS SECURITY REVIEW

## 1. Security Architecture & Threat Vectors

### 1.1 Insecure Direct Object References (IDOR) & Author Spoofing
- **Threat:** Malicious staff member creates a page and assigns `author_id` to the principal/admin or another user.
- **Remediation in `pageService.createPage`:**
  - The client-provided payload schema `PageCreateInput` does not accept `author_id`.
  - The service actively calls `supabase.auth.getUser()`, verifies that a real authenticated session exists, and forcibly writes `author_id: user.id`.
  - At the database layer, RLS Policy 3 strictly enforces `author_id = auth.uid()`. Even if the service was bypassed, the database would reject the insert.
- **Status:** **SECURED**

### 1.2 Mass Assignment & Immutable Fields Tampering
- **Threat:** Client attempts to overwrite `id`, `created_at`, `updated_at`, `search_vector`, or `view_count` via `updatePage`.
- **Remediation in `pageService.updatePage`:**
  - `PageUpdateInput` and `pageUpdateSchema` define a strict allow-list of mutable domain fields.
  - The payload for `.update()` is constructed explicitly key-by-key from validated properties.
  - System fields (`id`, `created_at`, `search_vector`, `view_count`) and `author_id` cannot be modified by standard update requests.
- **Status:** **SECURED**

### 1.3 PostgREST Filter Injection
- **Threat:** Malicious search query strings containing PostgREST filter operators (e.g. `(),":\`) altering query logic or causing 400 Bad Request.
- **Remediation in `pageService.listPages`:**
  - `sanitizePostgrestFilter` cleans input strings, stripping characters that break PostgREST expression parsers: `/[(),"\\%:]/g`.
- **Status:** **SECURED**

### 1.4 Broken Object-Level Authorization & Draft Page Exposure
- **Threat:** Unauthenticated public visitor tries to access draft, scheduled, or archived pages via `getPublishedPageBySlug` or `listPages`.
- **Remediation:**
  - `getPublishedPageBySlug` filters by `.eq('status', 'published')`.
  - Crucially, Supabase client runs under RLS Policy 1:
    ```sql
    USING (status = 'published' AND (published_at IS NULL OR published_at <= NOW()))
    ```
  - Anonymous callers will receive zero rows from PostgreSQL if the page is not in `published` status or `published_at` is in the future.
- **Status:** **SECURED**

### 1.5 Hierarchy Loop Injection (Self-Parenting)
- **Threat:** Admin sets a page's `parent_id` to its own `id`, causing infinite recursive loops in tree traversals.
- **Remediation:**
  - Application layer check in `updatePage`: throws `PageServiceError('Trang không thể tự chọn chính mình làm trang cha.', 'VALIDATION_ERROR')` if `parent_id === id`.
  - Database constraint: `CONSTRAINT chk_pages_parent_not_self CHECK (parent_id IS NULL OR parent_id != id)`.
- **Status:** **SECURED**

### 1.6 Child Orphan Cascade Risk
- **Threat:** Deleting a parent page unexpectedly deletes all child pages.
- **Remediation:**
  - Database constraint: `parent_id UUID REFERENCES public.pages(id) ON DELETE SET NULL`.
  - `deletePage` only sends `.delete().eq('id', id)`. PostgreSQL automatically sets `parent_id = NULL` on children, preserving their existence.
- **Status:** **SECURED**

### 1.7 Information Disclosure & Credential Leakage
- **Threat:** Secrets, tokens, or raw PostgreSQL internal stack traces exposed to frontend callers.
- **Remediation:**
  - No secrets, tokens, or credentials logged or serialized.
  - `handleDatabaseError` categorizes errors into user-friendly Vietnamese messages and typed error codes.
- **Status:** **SECURED**

---

## 2. Security Sign-off
- **OWASP Top 10 Compliance:** PASS
- **Multi-tenancy Isolation:** PASS (Strict single-school architecture maintained)
- **RLS Boundary Integrity:** PASS
- **Review Decision:** **APPROVED**
