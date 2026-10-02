-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260106000000_step06_documents_module.sql
-- Step 06: Văn bản - Tài liệu (Documents Module)
-- Database Schema, Full-Text Search, RLS, Storage Policies, and Download Counter
-- ==============================================================================

-- 1. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    document_number TEXT NOT NULL,
    document_type TEXT NOT NULL,
    issuing_authority TEXT NOT NULL,
    signer TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_date DATE,
    excerpt TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL DEFAULT 0 CHECK (file_size >= 0),
    file_type TEXT NOT NULL DEFAULT 'pdf',
    mime_type TEXT,
    download_count INT NOT NULL DEFAULT 0 CHECK (download_count >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON public.documents(document_type, status);
CREATE INDEX IF NOT EXISTS idx_documents_authority_status ON public.documents(issuing_authority, status);
CREATE INDEX IF NOT EXISTS idx_documents_issue_date ON public.documents(issue_date DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_documents_download_count ON public.documents(download_count DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_documents_is_featured ON public.documents(is_featured) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_documents_number ON public.documents(document_number);
CREATE INDEX IF NOT EXISTS idx_documents_search_vector ON public.documents USING gin(search_vector);

-- 3. FULL-TEXT SEARCH TRIGGER & FUNCTION
CREATE OR REPLACE FUNCTION public.documents_generate_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.document_number, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.issuing_authority, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.signer, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.document_type, '')), 'C') ||
        setweight(to_tsvector('simple', COALESCE(NEW.excerpt, '')), 'C');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documents_search_vector ON public.documents;
CREATE TRIGGER trg_documents_search_vector
    BEFORE INSERT OR UPDATE OF document_number, title, issuing_authority, signer, document_type, excerpt
    ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.documents_generate_search_vector();

-- 4. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 5. CONTROLLED DOWNLOAD COUNTER RPC FUNCTION
-- Client cannot directly modify download_count via UPDATE query.
-- Increment is only allowed through this secure function, strictly for published documents.
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

-- 6. ROW LEVEL SECURITY (RLS) FOR DOCUMENTS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 6.1 Public read access: ONLY published documents
DROP POLICY IF EXISTS "Public can read published documents" ON public.documents;
CREATE POLICY "Public can read published documents"
    ON public.documents FOR SELECT
    TO PUBLIC
    USING (status = 'published');

-- 6.2 Authenticated staff view access
DROP POLICY IF EXISTS "Staff can read documents" ON public.documents;
CREATE POLICY "Staff can read documents"
    ON public.documents FOR SELECT
    TO AUTHENTICATED
    USING (
        status = 'published'
        OR public.has_permission('documents.view')
        OR created_by = auth.uid()
    );

-- 6.3 Authenticated staff create/insert access
DROP POLICY IF EXISTS "Staff can insert documents" ON public.documents;
CREATE POLICY "Staff can insert documents"
    ON public.documents FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('documents.create')
        AND (created_by = auth.uid() OR created_by IS NULL)
        AND (
            status = 'draft'
            OR (status = 'published' AND public.has_permission('documents.publish'))
        )
    );

-- 6.4 Authenticated staff update access
DROP POLICY IF EXISTS "Staff can update documents" ON public.documents;
CREATE POLICY "Staff can update documents"
    ON public.documents FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.has_permission('documents.edit')
        OR (created_by = auth.uid() AND status = 'draft')
    )
    WITH CHECK (
        public.has_permission('documents.edit')
        OR (
            created_by = auth.uid()
            AND (
                status = 'draft'
                OR (status = 'published' AND public.has_permission('documents.publish'))
            )
        )
    );

-- 6.5 Authenticated staff delete access
DROP POLICY IF EXISTS "Staff can delete documents" ON public.documents;
CREATE POLICY "Staff can delete documents"
    ON public.documents FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('documents.delete')
        OR (created_by = auth.uid() AND status = 'draft')
    );

-- 7. STORAGE BUCKET & POLICIES FOR DOCUMENTS
-- Ensure documents bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    TRUE,
    20971520, -- 20MB in bytes
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 20971520;

-- Storage RLS Policies for documents bucket
DROP POLICY IF EXISTS "Public can view documents storage" ON storage.objects;
CREATE POLICY "Public can view documents storage"
    ON storage.objects FOR SELECT
    TO PUBLIC
    USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authorized staff can upload documents storage" ON storage.objects;
CREATE POLICY "Authorized staff can upload documents storage"
    ON storage.objects FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        bucket_id = 'documents'
        AND (
            public.has_permission('documents.create')
            OR public.has_permission('documents.edit')
            OR public.has_permission('documents.upload')
        )
    );

DROP POLICY IF EXISTS "Authorized staff can update documents storage" ON storage.objects;
CREATE POLICY "Authorized staff can update documents storage"
    ON storage.objects FOR UPDATE
    TO AUTHENTICATED
    USING (
        bucket_id = 'documents'
        AND (
            public.has_permission('documents.edit')
            OR public.has_permission('documents.upload')
        )
    );

DROP POLICY IF EXISTS "Authorized staff can delete documents storage" ON storage.objects;
CREATE POLICY "Authorized staff can delete documents storage"
    ON storage.objects FOR DELETE
    TO AUTHENTICATED
    USING (
        bucket_id = 'documents'
        AND public.has_permission('documents.delete')
    );

-- 8. SEED PERMISSIONS & ASSIGN ROLES
INSERT INTO public.permissions (code, resource, action, description)
VALUES
    ('documents.publish', 'documents', 'publish', 'Duyệt và xuất bản văn bản hành chính lên website'),
    ('documents.upload', 'documents', 'upload', 'Tải tệp văn bản và biểu mẫu lên hệ thống')
ON CONFLICT (code) DO NOTHING;

-- Grant documents permissions to ADMIN and SUPER_ADMIN roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code IN ('ADMIN', 'SUPER_ADMIN')
  AND p.code IN (
    'documents.view',
    'documents.create',
    'documents.edit',
    'documents.delete',
    'documents.publish',
    'documents.upload'
  )
ON CONFLICT DO NOTHING;

-- Grant documents.view and documents.create to EDITOR role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'EDITOR'
  AND p.code IN ('documents.view', 'documents.create')
ON CONFLICT DO NOTHING;

-- Grant documents.view to AUTHOR role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'AUTHOR'
  AND p.code IN ('documents.view')
ON CONFLICT DO NOTHING;

-- 9. SEED INITIAL REALISTIC VIETNAMESE SCHOOL DOCUMENTS
INSERT INTO public.documents (
    title,
    document_number,
    document_type,
    issuing_authority,
    signer,
    issue_date,
    effective_date,
    excerpt,
    file_url,
    file_name,
    file_size,
    file_type,
    mime_type,
    download_count,
    status,
    is_featured
)
VALUES
    (
        'Kế hoạch giáo dục nhà trường năm học 2025 - 2026',
        '88/KH-THPT',
        'Kế hoạch',
        'Ban Giám hiệu',
        'TS. Nguyễn Văn A - Hiệu trưởng',
        '2025-08-28',
        '2025-09-01',
        'Ban hành khung kế hoạch thời gian năm học và nhiệm vụ trọng tâm công tác dạy học, hoạt động ngoại khóa năm học 2025 - 2026.',
        'https://moet.gov.vn/content/tintuc/Documents/Ke-hoach-nam-hoc-2025-2026.pdf',
        'Ke-hoach-nam-hoc-2025-2026.pdf',
        2450000,
        'pdf',
        'application/pdf',
        142,
        'published',
        TRUE
    ),
    (
        'Quyết định ban hành Quy chế chi tiêu nội bộ và quản lý tài sản công năm 2026',
        '105/QĐ-THPT',
        'Quyết định',
        'Hiệu trưởng',
        'TS. Nguyễn Văn A - Hiệu trưởng',
        '2026-01-10',
        '2026-01-15',
        'Quy định nguyên tắc, chế độ, định mức tiêu chuẩn sử dụng ngân sách và quản lý tài sản phục vụ hoạt động giáo dục nhà trường.',
        'https://moet.gov.vn/content/tintuc/Documents/Quy-che-chi-tieu-noi-bo-2026.pdf',
        'Quy-che-chi-tieu-noi-bo-2026.pdf',
        1850000,
        'pdf',
        'application/pdf',
        89,
        'published',
        TRUE
    ),
    (
        'Thông báo hướng dẫn đăng ký môn học lựa chọn và chuyên đề học tập lớp 10 năm học mới',
        '42/TB-THPT',
        'Thông báo',
        'Phòng Đào tạo',
        'ThS. Trần Thị B - Phó Hiệu trưởng',
        '2026-02-15',
        '2026-02-15',
        'Thông báo chi tiết các tổ hợp môn khoa học tự nhiên, khoa học xã hội và hướng dẫn học sinh đăng ký trực tuyến.',
        'https://moet.gov.vn/content/tintuc/Documents/Huong-dan-dang-ky-mon-hoc-lop-10.docx',
        'Huong-dan-dang-ky-mon-hoc-lop-10.docx',
        620000,
        'docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        215,
        'published',
        FALSE
    ),
    (
        'Công văn hướng dẫn tổ chức kỳ thi học sinh giỏi các môn văn hóa cấp trường',
        '18/CV-THPT',
        'Công văn',
        'Hội đồng Chuyên môn',
        'TS. Nguyễn Văn A - Hiệu trưởng',
        '2026-02-20',
        '2026-02-22',
        'Hướng dẫn nội dung, cấu trúc đề thi, tiêu chuẩn thí sinh tham dự kỳ thi chọn học sinh giỏi cấp trường năm học 2025 - 2026.',
        'https://moet.gov.vn/content/tintuc/Documents/Cong-van-thi-hoc-sinh-gioi.pdf',
        'Cong-van-thi-hoc-sinh-gioi.pdf',
        980000,
        'pdf',
        'application/pdf',
        64,
        'published',
        FALSE
    ),
    (
        'Biểu mẫu đơn xin chuyển trường và giấy tiếp nhận học sinh phổ thông',
        '05/BM-VP',
        'Biểu mẫu',
        'Văn phòng Nhà trường',
        'Văn phòng Nhà trường',
        '2026-01-05',
        '2026-01-05',
        'Mẫu đơn xin chuyển trường trong và ngoài tỉnh theo Thông tư mới của Bộ Giáo dục và Đào tạo.',
        'https://moet.gov.vn/content/tintuc/Documents/Bieu-mau-don-xin-chuyen-truong.docx',
        'Bieu-mau-don-xin-chuyen-truong.docx',
        310000,
        'docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        320,
        'published',
        TRUE
    ),
    (
        'Hướng dẫn cài đặt và sử dụng phần mềm sổ điểm điện tử và học bạ số',
        '12/HD-CNTT',
        'Hướng dẫn',
        'Tổ Tin học & CNTT',
        'Lê Văn C - Tổ trưởng CNTT',
        '2026-01-18',
        '2026-01-18',
        'Tài liệu hướng dẫn cán bộ giáo viên nhập điểm, phê duyệt sổ điểm và ký số học bạ điện tử an toàn.',
        'https://moet.gov.vn/content/tintuc/Documents/Huong-dan-so-diem-dien-tu.pdf',
        'Huong-dan-so-diem-dien-tu.pdf',
        3420000,
        'pdf',
        'application/pdf',
        178,
        'published',
        FALSE
    )
ON CONFLICT DO NOTHING;
