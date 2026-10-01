-- ==============================================================================
-- Migration 00015: Create Audit Logs Table & RLS Policies
-- School News Platform - Step 10.3B
--
-- Approved Schema & Append-Only RLS Policies
-- Immutable, Read-Protected Security Audit Trail
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    classification VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    result VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimized B-Tree Indexes for Query, Filtering & Sorting
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_classification
    ON public.audit_logs(classification);

CREATE INDEX IF NOT EXISTS idx_audit_logs_result
    ON public.audit_logs(result);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
    ON public.audit_logs(resource);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email
    ON public.audit_logs(actor_email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Privileged read access controlled by audit.view permission or wildcard (*)
CREATE POLICY "Allow privileged read access to audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles ur
            JOIN public.role_permissions rp
                ON ur.role_id = rp.role_id
            JOIN public.permissions p
                ON rp.permission_id = p.id
            WHERE ur.user_id = auth.uid()
              AND (p.code = 'audit.view' OR p.code = '*')
        )
    );

-- Policy 2: Authenticated insert policy for audit trail event logging
CREATE POLICY "Allow authenticated insert to audit logs"
    ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Explicitly NO UPDATE policy defined (Audit trail is strictly immutable)
-- Explicitly NO DELETE policy defined (Audit trail cannot be pruned or tampered with)
