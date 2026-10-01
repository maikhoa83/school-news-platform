-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260107000000_step06_security_hardening.sql
-- Step 06: Security Hardening & Storage Access Protection
-- S06-001 (Private Bucket & Access Control), S06-002, S06-003, S06-004
-- ==============================================================================

-- 1. HARDEN STORAGE BUCKET: MAKE 'documents' BUCKET PRIVATE
-- Anonymous users cannot read arbitrary files via public CDN URL.
UPDATE storage.buckets
SET public = FALSE,
    file_size_limit = 20971520, -- 20MB in bytes
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
WHERE id = 'documents';

-- 2. SECURE STORAGE POLICIES
-- Drop insecure wide-open policy
DROP POLICY IF EXISTS "Public can view documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Public can only view published document objects" ON storage.objects;

-- 2.1 Public read policy: ONLY objects associated with published documents
CREATE POLICY "Public can only view published document objects"
    ON storage.objects FOR SELECT
    TO PUBLIC
    USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.status = 'published'
              AND (
                  -- Locked Decision A1: path is {document_id}/{filename}
                  split_part(name, '/', 1) = d.id::text
                  OR d.file_url LIKE '%' || name
              )
        )
    );

-- 2.2 Authorized staff read policy: Can view all document storage objects
DROP POLICY IF EXISTS "Authorized staff can view documents storage" ON storage.objects;
CREATE POLICY "Authorized staff can view documents storage"
    ON storage.objects FOR SELECT
    TO AUTHENTICATED
    USING (
        bucket_id = 'documents'
        AND (
            public.has_permission('documents.view')
            OR public.has_permission('documents.create')
            OR public.has_permission('documents.edit')
        )
    );

-- 3. SECURE ACCESS VERIFICATION RPC FUNCTION
CREATE OR REPLACE FUNCTION public.get_secure_document_access(p_document_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_doc RECORD;
BEGIN
    SELECT id, status, file_url, file_name, created_by
    INTO v_doc
    FROM public.documents
    WHERE id = p_document_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('allowed', FALSE, 'error', 'Document not found');
    END IF;

    -- Only published documents can be accessed by public/anonymous
    IF v_doc.status = 'published' THEN
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'document_id', v_doc.id,
            'status', v_doc.status,
            'file_name', v_doc.file_name,
            'file_url', v_doc.file_url
        );
    END IF;

    -- Draft or archived require authentication and appropriate permission
    IF auth.role() = 'authenticated' AND (
        public.has_permission('documents.view')
        OR v_doc.created_by = auth.uid()
    ) THEN
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'document_id', v_doc.id,
            'status', v_doc.status,
            'file_name', v_doc.file_name,
            'file_url', v_doc.file_url
        );
    END IF;

    RETURN jsonb_build_object('allowed', FALSE, 'error', 'Access denied to unpublished document');
END;
$$;

-- 4. BASELINE SCHEMA ALIASES (S06-004 COMPATIBILITY)
-- Ensures queries expecting issuer, description, file_id seamlessly resolve
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'issuer'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN issuer TEXT GENERATED ALWAYS AS (issuing_authority) STORED;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN description TEXT GENERATED ALWAYS AS (excerpt) STORED;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'file_id'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN file_id TEXT GENERATED ALWAYS AS (file_url) STORED;
    END IF;
END $$;
