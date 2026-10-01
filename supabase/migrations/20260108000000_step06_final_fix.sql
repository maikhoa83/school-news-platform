-- ============================================================
-- STEP 06: DOCUMENTS & FORMS MODULE - FINAL SECURITY FIX
-- Findings: R06-001, R06-002, R06-003, R06-004
-- ============================================================

-- 1. HARDEN STORAGE BUCKET CONFIGURATION (R06-001)
-- Ensure 'documents' bucket is strictly PRIVATE (public = FALSE)
-- Whitelist: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (No ZIP / RAR)
UPDATE storage.buckets
SET public = FALSE,
    file_size_limit = 20971520, -- 20MB limit
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

-- 2. HARDEN STORAGE RLS POLICIES (R06-001 & R06-002)
-- Remove all legacy/insecure policies that used LIKE / substring matching
DROP POLICY IF EXISTS "Public can view documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Public can only view published document objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published document storage objects" ON storage.objects;

-- 2.1 Public Read Policy:
-- Strictly extract document UUID from first segment of storage object path ({document_id}/{filename}).
-- Strictly check existence of corresponding published document record.
-- NO LIKE, NO ILIKE, NO substring or arbitrary filename matching.
CREATE POLICY "Public can view published document storage objects"
    ON storage.objects FOR SELECT
    TO PUBLIC
    USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id::text = split_part(storage.objects.name, '/', 1)
              AND d.status = 'published'
        )
    );

-- 2.2 Authenticated Staff Read Policy:
-- Authorized staff can read objects associated with published documents,
-- or draft/archived documents if they have documents.view / documents.edit or are the creator.
DROP POLICY IF EXISTS "Authorized staff can view documents storage" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view document storage objects" ON storage.objects;

CREATE POLICY "Staff can view document storage objects"
    ON storage.objects FOR SELECT
    TO AUTHENTICATED
    USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id::text = split_part(storage.objects.name, '/', 1)
              AND (
                  d.status = 'published'
                  OR public.has_permission('documents.view')
                  OR public.has_permission('documents.edit')
                  OR d.created_by = auth.uid()
              )
        )
    );

-- 3. ENSURE RPC SECURITY & PRIVILEGES (R06-004 & Section 9)
-- Controlled download counter: SECURITY DEFINER, search_path set, status = 'published'
CREATE OR REPLACE FUNCTION public.increment_document_download(doc_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    new_count INT;
BEGIN
    UPDATE public.documents
    SET download_count = download_count + 1
    WHERE id = doc_id AND status = 'published'
    RETURNING download_count INTO new_count;

    RETURN COALESCE(new_count, 0);
END;
$$;

-- Explicitly grant execute privilege on RPCs to anon and authenticated
GRANT EXECUTE ON FUNCTION public.increment_document_download(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_secure_document_access(UUID) TO anon, authenticated;
