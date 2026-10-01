# School News Platform — Step 07 Live Validation Runner v1.3

## Overview
This standalone package contains the official Protocol v1.3 test runner for validating the Step 07 Announcements Module against an isolated, non-production Supabase project.

## Mandatory Directives Enforced
- **HARD RULE 1:** Never test production (automatic fail-closed on production markers or protected hosts).
- **HARD RULE 2:** No mock / No simulation (executes real PostgREST queries or exits with BLOCKED).
- **HARD RULE 3:** No false PASS (semantic classification of authentic RLS error codes and affected rows).
- **HARD RULE 4:** Zero secret leakage (comprehensive redaction of JWTs, keys, and authorization headers).
- **HARD RULE 5:** Authenticated client separation (never evaluates role-specific policies using service_role).

## Package Contents
- `scripts/run_step07_live_validation.ts`: The complete 2,200+ line Protocol v1.3 test runner.
- `package.json`: Project manifest containing the `test:step07` script and dependencies.
- `tsconfig.json` & `tsconfig.node.json`: TypeScript compiler configuration.
- `supabase/migrations/`: All 11 local database migrations inspected during precondition check (`MIG-001`).
- `artifacts/`: Generated test results (`step07-live-validation-report.json`, `step07-live-validation-report.md`).
- `.env.example`: Environment variables template.

## Prerequisites & Installation
1. Node.js v18+ (tested on Node v20/v22).
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Configuration
Set the required non-production Supabase credentials:
```bash
export VITE_SUPABASE_URL="https://your-dev-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

*Note: The runner will intentionally fail-closed and block execution if any of these variables are empty, contain placeholder text, or target a protected production URL.*

## Execution
Run the validation suite via npm:
```bash
npm run test:step07
```
Or directly using tsx:
```bash
npx tsx scripts/run_step07_live_validation.ts
```

The runner automatically generates:
- `artifacts/step07-live-validation-report.json`
- `artifacts/step07-live-validation-report.md`
