# STEP 09.4B — MENUS & MENU ITEMS SECURITY REVIEW

## 1. Threat Model & Attack Surface Assessment

### A. Direct Database Access Bypass
- **Threat:** Client components or hooks executing raw queries bypassing the service layer.
- **Remediation:** Architecture strictly enforces `View -> Hook -> menuService.ts -> Supabase Client`. Static audit confirms 0 direct Supabase calls within hooks or UI modules.

### B. Service Role Key Compromise
- **Threat:** Leaking privileged credentials into client-side bundles.
- **Remediation:** `SUPABASE_SERVICE_ROLE_KEY` is not referenced anywhere in the menu module or service layer. All requests run through the authenticated client respecting RLS.

### C. Mass Assignment / Field Tampering
- **Threat:** Malicious payload attempting to override `id`, `created_at`, `updated_at`, or corrupt relational keys.
- **Remediation:** Both `createMenu`/`updateMenu` and `createMenuItem`/`updateMenuItem` construct explicit allow-list payloads from validated Zod safe parses. Disallowed fields are stripped before database dispatch.

### D. Hierarchy Corruption (Cycles & Cross-Menu Injection)
- **Threats:**
  1. A menu item in Menu A assigning a parent item located in Menu B.
  2. A menu item assigning itself as parent (`id === parent_id`).
  3. A menu item assigning its own descendant as parent, forming an infinite recursion loop (cycle).
- **Remediation:**
  1. `parentItem.menu_id === currentItem.menu_id` is enforced in `menuService` and backed by database RLS check.
  2. Self-parenting is blocked by Zod and `menuService`.
  3. Cycle detection traverses all ancestors up to the root, blocking cycles before updating the database.

### E. PostgREST Filter Injection
- **Threat:** Input containing characters `(),"\:%` manipulating PostgREST query expressions.
- **Remediation:** `sanitizePostgrestFilter()` strips illegal control characters before query assembly.

### F. Deletion Cascading & Preservation of Linked Pages
- **Threat:** Deleting a menu item deleting an associated static page.
- **Remediation:** Schema definition specifies `page_id REFERENCES public.pages(id) ON DELETE SET NULL`. Menu item deletion only removes the menu link; the target page remains intact.

---

## 2. RBAC & Permissions Alignment
- Relies exclusively on approved permissions from Step 09.3B:
  - `settings.view` for read-only staff operations.
  - `settings.edit` for menu and menu item management.
- Zero invented permissions created (`menus.view`, `menus.manage`, etc.).
- Public read access is strictly filtered by RLS (`is_active = TRUE`).

---

## 3. Security Audit Verdict
- **Verdict:** **APPROVED** (Zero vulnerabilities detected; compliant with OWASP Top 10 API Security & Supabase RLS Guidelines).
