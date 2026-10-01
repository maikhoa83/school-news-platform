-- ==============================================================================
-- SCHOOL NEWS PLATFORM - MIGRATION 20260109000000_step07_announcements_module.sql
-- Step 07: Announcements Module (Thông báo điều hành)
-- Schema: announcements table, constraints, RLS, permissions, and initial seeds
-- ==============================================================================

-- 1. CREATE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_announcements_status CHECK (status IN ('draft', 'published')),
    CONSTRAINT chk_announcements_priority CHECK (priority IN ('normal', 'important', 'urgent')),
    CONSTRAINT chk_announcements_dates CHECK (
        expires_at IS NULL 
        OR published_at IS NULL 
        OR expires_at > published_at
    ),
    CONSTRAINT chk_announcements_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_announcements_content_not_empty CHECK (length(trim(content)) > 0)
);

-- 2. CREATE PERFORMANCE & VISIBILITY INDEXES
-- Composite index specifically optimizing public visibility query:
-- WHERE status = 'published' AND published_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())
-- ORDER BY is_pinned DESC, priority, published_at DESC
CREATE INDEX IF NOT EXISTS idx_announcements_public_visibility
    ON public.announcements (status, published_at, expires_at, is_pinned DESC, priority, created_at DESC);

-- Admin query and filter indexes
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements (status);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements (priority);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements (is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements (created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements (published_at DESC);

-- 3. UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 4.1 Public read access: ONLY active published announcements
-- Enforces: status = 'published' AND published_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())
-- Note: is_pinned does NOT override these rules. Pinned drafts remain invisible.
DROP POLICY IF EXISTS "Public can view active published announcements" ON public.announcements;
CREATE POLICY "Public can view active published announcements"
    ON public.announcements FOR SELECT
    TO PUBLIC
    USING (
        status = 'published'
        AND published_at <= NOW()
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- 4.2 Authenticated staff view access
DROP POLICY IF EXISTS "Staff can view announcements" ON public.announcements;
CREATE POLICY "Staff can view announcements"
    ON public.announcements FOR SELECT
    TO AUTHENTICATED
    USING (
        (status = 'published' AND published_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()))
        OR public.has_permission('announcements.view')
        OR created_by = auth.uid()
    );

-- 4.3 Authenticated staff insert access
DROP POLICY IF EXISTS "Staff can insert announcements" ON public.announcements;
CREATE POLICY "Staff can insert announcements"
    ON public.announcements FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
        public.has_permission('announcements.create')
        AND (created_by = auth.uid() OR created_by IS NULL)
        AND (
            status = 'draft'
            OR (status = 'published' AND public.has_permission('announcements.publish'))
        )
    );

-- 4.4 Authenticated staff update access
DROP POLICY IF EXISTS "Staff can update announcements" ON public.announcements;
CREATE POLICY "Staff can update announcements"
    ON public.announcements FOR UPDATE
    TO AUTHENTICATED
    USING (
        public.has_permission('announcements.edit')
        OR (created_by = auth.uid() AND status = 'draft')
    )
    WITH CHECK (
        public.is_super_admin()
        OR (
            public.has_permission('announcements.edit')
            AND (
                status = 'draft'
                OR (status = 'published' AND public.has_permission('announcements.publish'))
            )
        )
        OR (
            created_by = auth.uid()
            AND (
                status = 'draft'
                OR (status = 'published' AND public.has_permission('announcements.publish'))
            )
        )
    );

-- 4.5 Authenticated staff delete access
DROP POLICY IF EXISTS "Staff can delete announcements" ON public.announcements;
CREATE POLICY "Staff can delete announcements"
    ON public.announcements FOR DELETE
    TO AUTHENTICATED
    USING (
        public.has_permission('announcements.delete')
        OR (created_by = auth.uid() AND status = 'draft')
    );

-- 5. SEED PERMISSIONS
INSERT INTO public.permissions (code, resource, action, description)
VALUES
    ('announcements.view', 'announcements', 'view', 'Xem danh sách và chi tiết thông báo điều hành'),
    ('announcements.create', 'announcements', 'create', 'Tạo mới bản nháp thông báo điều hành'),
    ('announcements.edit', 'announcements', 'edit', 'Chỉnh sửa nội dung, ghim và mức độ ưu tiên thông báo'),
    ('announcements.publish', 'announcements', 'publish', 'Xuất bản hoặc lên lịch thông báo điều hành'),
    ('announcements.delete', 'announcements', 'delete', 'Xóa thông báo điều hành khỏi hệ thống')
ON CONFLICT (code) DO UPDATE SET
    description = EXCLUDED.description;

-- Grant all announcements permissions to ADMIN and SUPER_ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code IN ('ADMIN', 'SUPER_ADMIN')
  AND p.code IN (
    'announcements.view',
    'announcements.create',
    'announcements.edit',
    'announcements.publish',
    'announcements.delete'
  )
ON CONFLICT DO NOTHING;

-- Grant view, create, edit, publish to EDITOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'EDITOR'
  AND p.code IN (
    'announcements.view',
    'announcements.create',
    'announcements.edit',
    'announcements.publish'
  )
ON CONFLICT DO NOTHING;

-- Grant view and create to AUTHOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'AUTHOR'
  AND p.code IN (
    'announcements.view',
    'announcements.create'
  )
ON CONFLICT DO NOTHING;

-- 6. SEED REALISTIC VIETNAMESE SCHOOL ANNOUNCEMENTS
INSERT INTO public.announcements (
    id,
    title,
    content,
    priority,
    is_pinned,
    status,
    published_at,
    expires_at
)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'Thông báo khẩn: Điều chỉnh thời gian vào học và lịch sinh hoạt dưới cờ tuần 26',
        'Kính gửi: Toàn thể Cán bộ, Giáo viên, Nhân viên và Học sinh toàn trường.

Do điều kiện thời tiết chuyển rét đậm và theo chỉ đạo của Sở Giáo dục & Đào tạo, Ban Giám hiệu nhà trường thông báo điều chỉnh thời gian học tập từ ngày 10/03/2026 như sau:
1. Tiết 1 buổi sáng bắt đầu từ 07h30 (lùi 30 phút so với thời khóa biểu thông thường).
2. Buổi lễ Chào cờ đầu tuần sẽ được tổ chức tập trung tại lớp học thay vì sân trường ngoài trời.
3. Học sinh được phép mặc áo ấm gia đình đồng màu tối bên trong hoặc bên ngoài đồng phục mùa đông của trường.

Đề nghị các thầy cô giáo chủ nhiệm thông báo kịp thời đến cha mẹ học sinh và học sinh các lớp nắm rõ.',
        'urgent',
        TRUE,
        'published',
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '7 days'
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'Kế hoạch tổ chức kỳ thi khảo sát chất lượng học kỳ II khối 12 năm học 2025 - 2026',
        'Căn cứ kế hoạch chuyên môn năm học 2025 - 2026, Ban Giám hiệu nhà trường thông báo kế hoạch tổ chức kỳ thi khảo sát chất lượng khối 12 nhằm chuẩn bị cho kỳ thi Tốt nghiệp THPT Quốc gia.

Thời gian tổ chức: Từ ngày 24/03/2026 đến ngày 26/03/2026.
Đối tượng tham gia: 100% học sinh các lớp 12.
Hình thức thi: Thi tập trung theo số báo danh và phòng thi của Hội đồng khảo sát.

Lịch thi cụ thể:
- Sáng 24/03: Ngữ văn (120 phút), Toán (90 phút).
- Sáng 25/03: Bài thi KHTN (Vật lý, Hóa học, Sinh học) / KHXH (Lịch sử, Địa lý, GDCD).
- Chiều 25/03: Ngoại ngữ (60 phút).

Học sinh có mặt tại phòng thi trước giờ phát đề 20 phút. Mang theo thẻ học sinh và đồ dùng học tập được phép theo quy chế.',
        'important',
        TRUE,
        'published',
        NOW() - INTERVAL '1 day',
        NULL
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'Hướng dẫn đăng ký tham gia CLB Nghiên cứu Khoa học Kỹ thuật và STEM năm 2026',
        'Nhằm thúc đẩy phong trào nghiên cứu khoa học kỹ thuật và giáo dục STEM trong học sinh, Đoàn trường phối hợp cùng Tổ Vật lý - Tin học mở cổng đăng ký thành viên Câu lạc bộ STEM - Sáng tạo trẻ năm học mới.

Quyền lợi thành viên:
- Được tiếp cận phòng thực hành Robot và máy in 3D của nhà trường.
- Được các thầy cô giáo hướng dẫn thực hiện đề tài dự thi KHKT cấp Tỉnh/Thành phố.
- Cấp giấy chứng nhận tham gia hoạt động nghiên cứu khoa học cuối năm học.

Hạn chót đăng ký: 20/03/2026.
Hình thức đăng ký: Trực tuyến qua biểu mẫu của Đoàn trường hoặc nộp danh sách tại Văn phòng Đoàn.',
        'normal',
        FALSE,
        'published',
        NOW() - INTERVAL '3 days',
        NULL
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'Thông báo lịch họp Phụ huynh học sinh định kỳ giữa học kỳ II',
        'Ban Giám hiệu nhà trường trân trọng thông báo đến Quý Phụ huynh học sinh về lịch họp Phụ huynh định kỳ giữa học kỳ II năm học 2025 - 2026:

- Khối 10 và 11: 08h00 Chủ Nhật, ngày 29/03/2026.
- Khối 12: 14h00 Chủ Nhật, ngày 29/03/2026.
Địa điểm: Tại phòng học của từng lớp.

Nội dung chính:
- Báo cáo kết quả học tập và rèn luyện của học sinh trong nửa đầu học kỳ II.
- Phối hợp giữa Gia đình và Nhà trường trong giai đoạn ôn tập nước rút.
- Tư vấn định hướng chọn tổ hợp nghề nghiệp và thi tốt nghiệp THPT cho khối 12.

Rất mong Quý Phụ huynh thu xếp thời gian tham dự đầy đủ và đúng giờ.',
        'important',
        FALSE,
        'published',
        NOW() - INTERVAL '5 days',
        NOW() + INTERVAL '30 days'
    )
ON CONFLICT (id) DO NOTHING;
