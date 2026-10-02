/**
 * Pages Module Database & Domain Service Layer
 * School News Platform - Step 09 Quản lý Trang tĩnh (Pages), Menu & Cấu hình SEO
 */

import { supabase } from '../lib/supabase';
import { envConfig } from '../lib/env';
import type {
  Page,
  PageWithRelations,
  PageCreateInput,
  PageUpdateInput,
  PageListParams,
  PagePaginationResult,
  PageTemplate,
  PageStatus,
} from '../types/page';
import {
  pageCreateSchema,
  pageUpdateSchema,
  pageListParamsSchema,
  UUID_REGEX,
  SLUG_REGEX,
} from '../modules/pages/schemas/pageSchema';
import { PAGE_PAGINATION_DEFAULTS } from '../modules/pages/config/pagesConfig';

// ==============================================================================
// 1. ERROR TAXONOMY
// ==============================================================================

export type PageServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'DUPLICATE_SLUG'
  | 'DATABASE_ERROR';

export class PageServiceError extends Error {
  readonly code: PageServiceErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: PageServiceErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'PageServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// ==============================================================================
// 2. SEED PAGES FOR TRƯỜNG THCS & THPT VĨNH PHONG
// ==============================================================================

export const INITIAL_PAGES: PageWithRelations[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    title: 'Giới thiệu Trường THCS & THPT Vĩnh Phong',
    slug: 'gioi-thieu',
    excerpt:
      'Trường THCS & THPT Vĩnh Phong tự hào với bề dày truyền thống dạy tốt - học tốt, xây dựng môi trường giáo dục hạnh phúc, kỷ cương, chất lượng tại xã Vĩnh Phong, huyện Vĩnh Thuận, tỉnh Kiên Giang.',
    content: `
      <div class="space-y-6 text-slate-800">
        <div class="p-4 bg-blue-50 border-l-4 border-blue-900 rounded-r-xl">
          <p class="font-bold text-blue-950 text-base">Phương châm giáo dục: "DẠY TỐT - HỌC TỐT | RÈN ĐỨC - LUYỆN TÀI"</p>
          <p class="text-xs sm:text-sm text-blue-800 mt-1">Xây dựng trường học thân thiện, học sinh tích cực, phát triển phẩm chất và năng lực người học toàn diện.</p>
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">1. Lịch sử hình thành và phát triển</h3>
        <p class="text-justify leading-relaxed">
          Trường THCS &amp; THPT Vĩnh Phong tọa lạc tại xã Vĩnh Phong, huyện Vĩnh Thuận, tỉnh Kiên Giang. Trải qua các năm tháng xây dựng và phát triển, tập thể cán bộ, giáo viên và học sinh nhà trường đã không ngừng nỗ lực, thi đua vượt khó vươn lên, khẳng định vị thế là một trong những trung tâm giáo dục tin cậy, giàu truyền thống của nhân dân vùng quê giàu tinh thần hiếu học.
        </p>
        <p class="text-justify leading-relaxed">
          Được sự quan tâm lãnh đạo, chỉ đạo sâu sát của Sở Giáo dục và Đào tạo tỉnh Kiên Giang, Huyện ủy, UBND huyện Vĩnh Thuận cùng chính quyền địa phương và sự đồng thuận của cha mẹ học sinh, khuôn viên nhà trường ngày nay đã được đầu tư xây dựng khang trang, xanh - sạch - đẹp, đáp ứng đầy đủ yêu cầu đổi mới căn bản, toàn diện giáo dục và đào tạo theo Chương trình GDPT 2018.
        </p>

        <h3 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">2. Sứ mệnh, Tầm nhìn và Giá trị cốt lõi</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
          <div class="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
            <h4 class="font-bold text-blue-900 text-sm mb-1.5 flex items-center gap-1.5">
              <span>🎯 Sứ mệnh nhà trường</span>
            </h4>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Kiến tạo môi trường giáo dục an toàn, kỷ cương, tình thương và trách nhiệm; giúp mỗi học sinh hình thành nhân cách tốt đẹp, phát huy tối đa tiềm năng trí tuệ, tự tin làm chủ tri thức và vững bước vào đời.
            </p>
          </div>

          <div class="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
            <h4 class="font-bold text-amber-900 text-sm mb-1.5 flex items-center gap-1.5">
              <span>🌟 Tầm nhìn tương lai</span>
            </h4>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Phấn đấu xây dựng Trường THCS &amp; THPT Vĩnh Phong thành trường chuẩn quốc gia có chất lượng giáo dục mũi nhọn và toàn diện cao, đi đầu trong chuyển đổi số và ứng dụng CNTT trong dạy học.
            </p>
          </div>
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">3. Cơ sở vật chất và Trang thiết bị</h3>
        <p class="text-justify leading-relaxed">
          Nhà trường sở hữu hệ thống phòng học kiên cố, các phòng bộ môn chuyên biệt như Tin học nối mạng Internet tốc độ cao, Ngoại ngữ, Khoa học Tự nhiên với đầy đủ thiết bị thí nghiệm hiện đại; Thư viện xanh thân thiện đạt chuẩn với hàng nghìn đầu sách phong phú, phục vụ đắc lực nhu cầu tự học và nghiên cứu của giáo viên, học sinh.
        </p>

        <h3 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">4. Đội ngũ Cán bộ - Giáo viên</h3>
        <p class="text-justify leading-relaxed">
          100% giáo viên đạt chuẩn và trên chuẩn theo Luật Giáo dục, có năng lực chuyên môn vững vàng, lòng nhiệt huyết, trách nhiệm cao và tận tụy với học trò. Nhiều thầy cô giáo là giáo viên dạy giỏi, chiến sĩ thi đua cấp cơ sở và cấp tỉnh, gương mẫu đi đầu trong phong trào đổi mới sáng tạo dạy học.
        </p>
      </div>
    `,
    featured_image: '/campus_facade.jpg',
    parent_id: null,
    template: 'default' as PageTemplate,
    status: 'published' as PageStatus,
    sort_order: 1,
    view_count: 520,
    author_id: '00000000-0000-0000-0000-000000000001',
    published_at: '2025-08-15T08:00:00Z',
    published_by: '00000000-0000-0000-0000-000000000001',
    meta_title: 'Giới thiệu Trường THCS & THPT Vĩnh Phong',
    meta_description: 'Giới thiệu lịch sử, sứ mệnh và truyền thống dạy tốt học tốt của Trường THCS & THPT Vĩnh Phong, huyện Vĩnh Thuận, tỉnh Kiên Giang.',
    meta_keywords: 'trường thcs thpt vĩnh phong, giới thiệu vĩnh phong, kiên giang',
    og_image: '/campus_facade.jpg',
    canonical_url: null,
    no_index: false,
    created_at: '2025-08-15T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
    author: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Ban Giám hiệu Nhà trường',
      email: 'bgh@vinhphong.edu.vn',
      avatar_url: null,
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    title: 'Cơ cấu Tổ chức & Đội ngũ Cán bộ - Giáo viên',
    slug: 'co-cau-to-chuc',
    excerpt: 'Sơ đồ cơ cấu tổ chức bộ máy quản lý, đoàn thể và các tổ chuyên môn Trường THCS & THPT Vĩnh Phong.',
    content: `
      <div class="space-y-6 text-slate-800">
        <div class="p-4 bg-emerald-50 border-l-4 border-emerald-700 rounded-r-xl">
          <p class="font-bold text-emerald-950 text-base">Cơ cấu tổ chức bộ máy nhà trường</p>
          <p class="text-xs sm:text-sm text-emerald-800 mt-1">Đoàn kết - Kỷ cương - Trách nhiệm - Đổi mới và Sáng tạo.</p>
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">1. Ban Giám hiệu</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 border rounded-xl bg-white shadow-2xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">Hiệu trưởng</span>
            <h4 class="text-base font-bold text-slate-900 mt-1.5">TS. Nguyễn Văn A</h4>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">Phụ trách chung toàn diện các mặt công tác, công tác chính trị tư tưởng, kế hoạch chiến lược phát triển nhà trường và quan hệ đối ngoại.</p>
          </div>
          <div class="p-4 border rounded-xl bg-white shadow-2xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">Phó Hiệu trưởng</span>
            <h4 class="text-base font-bold text-slate-900 mt-1.5">ThS. Trần Thị B</h4>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">Phụ trách công tác chuyên môn dạy học, khảo thí, bồi dưỡng học sinh giỏi, kiểm định chất lượng giáo dục và công tác Đoàn - Đội.</p>
          </div>
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">2. Các Tổ chức Đoàn thể &amp; Hội đồng</h3>
        <div class="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <div class="p-3 rounded-lg border bg-slate-50">
            <strong class="text-blue-900">Chi bộ Đảng:</strong> Hạt nhân lãnh đạo toàn diện mọi nhiệm vụ chính trị, tư tưởng và chuyên môn của trường.
          </div>
          <div class="p-3 rounded-lg border bg-slate-50">
            <strong class="text-blue-900">Công đoàn cơ sở:</strong> Vận động đoàn viên thi đua dạy tốt - học tốt, chăm lo đời sống vật chất và tinh thần cho cán bộ giáo viên.
          </div>
          <div class="p-3 rounded-lg border bg-slate-50">
            <strong class="text-blue-900">Đoàn TNCS Hồ Chí Minh &amp; Đội TNTP:</strong> Giáo dục lý tưởng, đạo đức, nếp sống văn minh và tổ chức các phong trào xung kích học đường.
          </div>
          <div class="p-3 rounded-lg border bg-slate-50">
            <strong class="text-blue-900">Hội đồng Trường &amp; Ban đại diện CMHS:</strong> Cầu nối đồng hành chặt chẽ giữa gia đình, nhà trường và xã hội.
          </div>
        </div>

        <h3 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">3. Các Tổ Chuyên môn &amp; Tổ Văn phòng</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div class="p-3.5 border rounded-lg bg-white shadow-2xs">
            <h5 class="font-bold text-slate-900">Tổ Toán - Tin học</h5>
            <p class="text-slate-500 mt-1">Ứng dụng CNTT, giáo dục STEM và bồi dưỡng năng khiếu toán học.</p>
          </div>
          <div class="p-3.5 border rounded-lg bg-white shadow-2xs">
            <h5 class="font-bold text-slate-900">Tổ Ngữ văn - Lịch sử - Địa lý</h5>
            <p class="text-slate-500 mt-1">Giáo dục truyền thống yêu nước, bồi dưỡng tâm hồn và nhân cách học sinh.</p>
          </div>
          <div class="p-3.5 border rounded-lg bg-white shadow-2xs">
            <h5 class="font-bold text-slate-900">Tổ Khoa học Tự nhiên</h5>
            <p class="text-slate-500 mt-1">Vật lý, Hóa học, Sinh học - chú trọng thí nghiệm thực hành và trải nghiệm sáng tạo.</p>
          </div>
          <div class="p-3.5 border rounded-lg bg-white shadow-2xs">
            <h5 class="font-bold text-slate-900">Tổ Ngoại ngữ</h5>
            <p class="text-slate-500 mt-1">Nâng cao kỹ năng nghe nói, giao tiếp tiếng Anh tự tin cho học sinh phổ thông.</p>
          </div>
          <div class="p-3.5 border rounded-lg bg-white shadow-2xs">
            <h5 class="font-bold text-slate-900">Tổ GDTC - GDQP &amp; Nghệ thuật</h5>
            <p class="text-slate-500 mt-1">Rèn luyện thể lực, thể thao học đường, kỹ năng quốc phòng và thẩm mỹ nghệ thuật.</p>
          </div>
          <div class="p-3.5 border rounded-lg bg-white shadow-2xs">
            <h5 class="font-bold text-slate-900">Tổ Văn phòng</h5>
            <p class="text-slate-500 mt-1">Quản lý hành chính, văn thư, kế toán tài chính, thư viện thiết bị và y tế học đường.</p>
          </div>
        </div>
      </div>
    `,
    featured_image: '/vinh_phong_logo.jpg',
    parent_id: null,
    template: 'default' as PageTemplate,
    status: 'published' as PageStatus,
    sort_order: 2,
    view_count: 380,
    author_id: '00000000-0000-0000-0000-000000000001',
    published_at: '2025-08-15T08:00:00Z',
    published_by: '00000000-0000-0000-0000-000000000001',
    meta_title: 'Cơ cấu Tổ chức - Trường THCS & THPT Vĩnh Phong',
    meta_description: 'Sơ đồ cơ cấu tổ chức và ban giám hiệu Trường THCS & THPT Vĩnh Phong.',
    meta_keywords: 'cơ cấu tổ chức, ban giám hiệu vĩnh phong',
    og_image: '/vinh_phong_logo.jpg',
    canonical_url: null,
    no_index: false,
    created_at: '2025-08-15T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
    author: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Văn phòng Nhà trường',
      email: 'vanphong@vinhphong.edu.vn',
      avatar_url: null,
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    title: 'Thông tin Liên hệ & Hòm thư Góp ý',
    slug: 'lien-he',
    excerpt:
      'Trang tiếp nhận ý kiến đóng góp, phản ánh của phụ huynh, học sinh và thông tin liên hệ chính thức của Trường THCS & THPT Vĩnh Phong.',
    content: `
      <div class="space-y-5 text-slate-800">
        <p class="text-justify leading-relaxed">
          Trường THCS &amp; THPT Vĩnh Phong luôn trân trọng lắng nghe và tiếp thu mọi ý kiến phản ánh, đóng góp xây dựng của quý phụ huynh, học sinh, cựu học sinh và các cơ quan đơn vị đối tác nhằm không ngừng hoàn thiện môi trường sư phạm thân thiện, tích cực.
        </p>

        <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs sm:text-sm text-slate-700">
          <p>📍 <strong>Trụ sở chính:</strong> Xã Vĩnh Phong, huyện Vĩnh Thuận, tỉnh Kiên Giang</p>
          <p>📞 <strong>Điện thoại văn phòng:</strong> (0297) 3829 115</p>
          <p>✉️ <strong>Hộp thư điện tử:</strong> maikhoa.c3vinhphong@gmail.com</p>
          <p>⏰ <strong>Thời gian tiếp dân:</strong> Thứ Hai đến Thứ Sáu (Sáng 7h00 - 11h30, Chiều 13h00 - 17h00)</p>
        </div>

        <p class="text-xs text-slate-500">
          Quý vị cũng có thể gửi phản ánh nhanh bằng cách điền thông tin vào biểu mẫu bên cạnh. Bộ phận Văn thư nhà trường sẽ chuyển nội dung đến Ban Giám hiệu để phản hồi kịp thời.
        </p>
      </div>
    `,
    featured_image: null,
    parent_id: null,
    template: 'contact' as PageTemplate,
    status: 'published' as PageStatus,
    sort_order: 3,
    view_count: 420,
    author_id: '00000000-0000-0000-0000-000000000001',
    published_at: '2025-08-15T08:00:00Z',
    published_by: '00000000-0000-0000-0000-000000000001',
    meta_title: 'Liên hệ - Trường THCS & THPT Vĩnh Phong',
    meta_description: 'Thông tin liên hệ, số điện thoại, email và biểu mẫu góp ý gửi Trường THCS & THPT Vĩnh Phong.',
    meta_keywords: 'liên hệ trường vĩnh phong, email vĩnh phong, địa chỉ vĩnh phong',
    og_image: null,
    canonical_url: null,
    no_index: false,
    created_at: '2025-08-15T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
    author: {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Bộ phận Tiếp dân & Văn phòng',
      email: 'maikhoa.c3vinhphong@gmail.com',
      avatar_url: null,
    },
  },
];

const LOCAL_PAGES_KEY = 'school_static_pages_v1_store';

function getLocalPages(): PageWithRelations[] {
  try {
    const raw = localStorage.getItem(LOCAL_PAGES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PAGES_KEY, JSON.stringify(INITIAL_PAGES));
      return [...INITIAL_PAGES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure seed pages always exist if user hasn't created them
      const slugs = new Set(parsed.map((p: Page) => p.slug));
      let merged = [...parsed];
      for (const initPage of INITIAL_PAGES) {
        if (!slugs.has(initPage.slug)) {
          merged.push(initPage);
        }
      }
      return merged;
    }
    return [...INITIAL_PAGES];
  } catch {
    return [...INITIAL_PAGES];
  }
}

function saveLocalPages(items: PageWithRelations[]): void {
  try {
    localStorage.setItem(LOCAL_PAGES_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[pageService] Failed to save local pages:', err);
  }
}

// ==============================================================================
// 3. INTERNAL UTILITIES & DATABASE ERROR HANDLER
// ==============================================================================

function validateUUID(id: string, fieldName: string = 'ID'): void {
  const cleanId = id ? id.replace(/^doc-|^page-/, '') : '';
  if (!cleanId || !UUID_REGEX.test(cleanId)) {
    throw new PageServiceError(
      `${fieldName} không hợp lệ (phải có định dạng UUID v4 chuẩn).`,
      'VALIDATION_ERROR'
    );
  }
}

function sanitizePostgrestFilter(term: string): string {
  if (!term || typeof term !== 'string') return '';
  return term.replace(/[(),"\\%:]/g, ' ').replace(/\s+/g, ' ').trim();
}

function handleDatabaseError(error: unknown, defaultMessage: string): never {
  if (error instanceof PageServiceError) {
    throw error;
  }

  const pgError = error as { code?: string; message?: string; details?: string };
  const message = pgError?.message || defaultMessage;
  const code = pgError?.code;

  if (
    code === '42501' ||
    message.includes('permission denied') ||
    message.includes('violates row-level security')
  ) {
    throw new PageServiceError(
      'Bạn không có quyền thực hiện thao tác này.',
      'UNAUTHORIZED',
      error
    );
  }

  if (
    code === '23505' ||
    message.includes('duplicate key value') ||
    message.includes('unique constraint') ||
    message.includes('pages_slug_key')
  ) {
    throw new PageServiceError(
      'Đường dẫn định danh (slug) đã được sử dụng. Vui lòng chọn slug khác.',
      'DUPLICATE_SLUG',
      error
    );
  }

  if (code === '23503' || message.includes('foreign key constraint')) {
    throw new PageServiceError(
      'Mục liên kết không tồn tại hoặc đã bị xóa (trang cha hoặc tài khoản tác giả).',
      'VALIDATION_ERROR',
      error
    );
  }

  if (code === '23514' || message.includes('check constraint')) {
    throw new PageServiceError(
      'Dữ liệu vi phạm ràng buộc kiểm tra của CSDL (tiêu đề/slug không được rỗng, trang cha không thể là chính mình).',
      'VALIDATION_ERROR',
      error
    );
  }

  if (code === 'PGRST116' || message.includes('JSON object requested, multiple (or no) rows returned')) {
    throw new PageServiceError('Không tìm thấy trang yêu cầu.', 'NOT_FOUND', error);
  }

  throw new PageServiceError(message, 'DATABASE_ERROR', error);
}

// ==============================================================================
// 4. READ OPERATIONS
// ==============================================================================

export async function listPages(
  params: PageListParams = {}
): Promise<PagePaginationResult<PageWithRelations>> {
  const parsedParams = pageListParamsSchema.safeParse(params);
  const validParams = parsedParams.success ? parsedParams.data : {};
  const page = Math.max(1, validParams.page ?? PAGE_PAGINATION_DEFAULTS.DEFAULT_PAGE);
  const limit = Math.min(
    PAGE_PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, validParams.limit ?? PAGE_PAGINATION_DEFAULTS.DEFAULT_LIMIT)
  );
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (envConfig.isConfigured) {
    try {
      let query = supabase
        .from('pages')
        .select(
          '*, author:profiles!author_id(id, full_name, email, avatar_url), parent:pages!parent_id(id, title, slug)',
          { count: 'exact' }
        );

      if (validParams.status && validParams.status !== 'all') {
        query = query.eq('status', validParams.status);
      }
      if (validParams.template && validParams.template !== 'all') {
        query = query.eq('template', validParams.template);
      }
      if (validParams.parentId !== undefined && validParams.parentId !== 'all') {
        if (validParams.parentId === 'root' || validParams.parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', validParams.parentId);
        }
      }
      if (validParams.search && validParams.search.trim()) {
        const sanitized = sanitizePostgrestFilter(validParams.search);
        if (sanitized) {
          query = query.or(`title.ilike.%${sanitized}%,content.ilike.%${sanitized}%`);
        }
      }

      const sortBy = validParams.sortBy || 'sort_order';
      const sortOrder = validParams.sortOrder || (sortBy === 'sort_order' ? 'asc' : 'desc');
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      if (sortBy !== 'sort_order') {
        query = query.order('sort_order', { ascending: true });
      }
      query = query.order('id', { ascending: true });
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        const total = count ?? data.length;
        const totalPages = Math.ceil(total / limit) || 1;
        return {
          items: data as PageWithRelations[],
          total,
          page,
          limit,
          totalPages,
        };
      }
    } catch (err) {
      console.warn('[pageService] Database query error, using local pages store:', err);
    }
  }

  // Fallback local store
  const local = getLocalPages();
  let filtered = [...local];

  if (validParams.status && validParams.status !== 'all') {
    filtered = filtered.filter((p) => p.status === validParams.status);
  }
  if (validParams.template && validParams.template !== 'all') {
    filtered = filtered.filter((p) => p.template === validParams.template);
  }
  if (validParams.search && validParams.search.trim()) {
    const q = validParams.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const items = filtered.slice(from, from + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getPageById(id: string): Promise<PageWithRelations | null> {
  const cleanId = (id || '').replace(/^page-|^doc-/, '');

  if (envConfig.isConfigured) {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select(
          '*, author:profiles!author_id(id, full_name, email, avatar_url), parent:pages!parent_id(id, title, slug)'
        )
        .eq('id', cleanId)
        .maybeSingle();

      if (!error && data) {
        return data as PageWithRelations;
      }
    } catch (err) {
      console.warn('[pageService] getPageById db error:', err);
    }
  }

  const local = getLocalPages();
  return local.find((p) => p.id === cleanId || p.id === id) || null;
}

export async function getPublishedPageBySlug(slug: string): Promise<PageWithRelations | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  if (envConfig.isConfigured) {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select(
          '*, author:profiles!author_id(id, full_name, email, avatar_url), parent:pages!parent_id(id, title, slug)'
        )
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!error && data) {
        return data as PageWithRelations;
      }
    } catch (err) {
      console.warn('[pageService] getPublishedPageBySlug db error:', err);
    }
  }

  const local = getLocalPages();
  return local.find((p) => p.slug === slug && p.status === 'published') || null;
}

// ==============================================================================
// 5. MUTATION OPERATIONS
// ==============================================================================

export async function createPage(input: PageCreateInput): Promise<Page> {
  const parseResult = pageCreateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu tạo trang không hợp lệ.';
    throw new PageServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublished = validated.status === 'published';
  const nowIso = new Date().toISOString();
  const publishedAt = isPublished ? validated.published_at || nowIso : validated.published_at || null;
  const publishedBy = isPublished ? user?.id || null : null;
  const newId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : '00000000-0000-0000-0000-' + Math.random().toString(16).slice(2, 14);

  const payload: Page = {
    id: newId,
    title: validated.title.trim(),
    slug: validated.slug.trim(),
    content: validated.content,
    excerpt: validated.excerpt ?? null,
    featured_image: validated.featured_image || null,
    parent_id: validated.parent_id ?? null,
    template: validated.template,
    status: validated.status,
    sort_order: validated.sort_order,
    view_count: 0,
    author_id: user?.id || '00000000-0000-0000-0000-000000000001',
    published_at: publishedAt,
    published_by: publishedBy,
    meta_title: validated.meta_title ?? null,
    meta_description: validated.meta_description ?? null,
    meta_keywords: validated.meta_keywords ?? null,
    og_image: validated.og_image || null,
    canonical_url: validated.canonical_url || null,
    no_index: validated.no_index,
    created_at: nowIso,
    updated_at: nowIso,
  };

  if (envConfig.isConfigured) {
    try {
      const { data: created, error } = await supabase
        .from('pages')
        .insert(payload)
        .select('*')
        .single();

      if (!error && created) {
        const local = getLocalPages();
        saveLocalPages([created as PageWithRelations, ...local]);
        return created as Page;
      }
    } catch (err) {
      console.warn('[pageService] Database insert failed, saving to local store:', err);
    }
  }

  // Fallback save to local store
  const local = getLocalPages();
  const withRelations: PageWithRelations = {
    ...payload,
    author: {
      id: payload.author_id,
      full_name: 'Ban Giám hiệu',
      email: 'bgh@vinhphong.edu.vn',
      avatar_url: null,
    },
  };
  saveLocalPages([withRelations, ...local]);
  return payload;
}

export async function updatePage(id: string, input: PageUpdateInput): Promise<Page> {
  const cleanId = (id || '').replace(/^page-|^doc-/, '');
  validateUUID(cleanId, 'ID trang');

  const parseResult = pageUpdateSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật trang không hợp lệ.';
    throw new PageServiceError(firstIssue, 'VALIDATION_ERROR', parseResult.error);
  }
  const validated = parseResult.data;

  if (validated.parent_id && validated.parent_id === cleanId) {
    throw new PageServiceError(
      'Trang không thể tự chọn chính mình làm trang cha.',
      'VALIDATION_ERROR'
    );
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.title !== undefined) payload.title = validated.title.trim();
  if (validated.slug !== undefined) payload.slug = validated.slug.trim();
  if (validated.content !== undefined) payload.content = validated.content;
  if (validated.excerpt !== undefined) payload.excerpt = validated.excerpt;
  if (validated.featured_image !== undefined) payload.featured_image = validated.featured_image || null;
  if (validated.parent_id !== undefined) payload.parent_id = validated.parent_id;
  if (validated.template !== undefined) payload.template = validated.template;
  if (validated.status !== undefined) {
    payload.status = validated.status;
    if (validated.status === 'published' && validated.published_at === undefined) {
      payload.published_at = new Date().toISOString();
    }
  }
  if (validated.sort_order !== undefined) payload.sort_order = validated.sort_order;
  if (validated.published_at !== undefined) payload.published_at = validated.published_at;
  if (validated.meta_title !== undefined) payload.meta_title = validated.meta_title;
  if (validated.meta_description !== undefined) payload.meta_description = validated.meta_description;
  if (validated.meta_keywords !== undefined) payload.meta_keywords = validated.meta_keywords;
  if (validated.og_image !== undefined) payload.og_image = validated.og_image || null;
  if (validated.canonical_url !== undefined) payload.canonical_url = validated.canonical_url || null;
  if (validated.no_index !== undefined) payload.no_index = validated.no_index;

  if (envConfig.isConfigured) {
    try {
      const { data: updated, error } = await supabase
        .from('pages')
        .update(payload)
        .eq('id', cleanId)
        .select('*')
        .single();

      if (!error && updated) {
        const local = getLocalPages();
        const updatedLocal = local.map((p) => (p.id === cleanId ? { ...p, ...updated } : p));
        saveLocalPages(updatedLocal);
        return updated as Page;
      }
    } catch (err) {
      console.warn('[pageService] Database update failed, updating local store:', err);
    }
  }

  const local = getLocalPages();
  const idx = local.findIndex((p) => p.id === cleanId || p.id === id);
  if (idx !== -1) {
    local[idx] = {
      ...local[idx],
      ...payload,
    } as PageWithRelations;
    saveLocalPages(local);
    return local[idx];
  }

  throw new PageServiceError('Không tìm thấy trang để cập nhật.', 'NOT_FOUND');
}

export async function deletePage(id: string): Promise<void> {
  const cleanId = (id || '').replace(/^page-|^doc-/, '');
  validateUUID(cleanId, 'ID trang');

  if (envConfig.isConfigured) {
    try {
      const { error } = await supabase.from('pages').delete().eq('id', cleanId);
      if (error) {
        console.warn('[pageService] Database delete error:', error.message);
      }
    } catch (err) {
      console.warn('[pageService] Database delete exception:', err);
    }
  }

  const local = getLocalPages();
  saveLocalPages(local.filter((p) => p.id !== cleanId && p.id !== id));
}
