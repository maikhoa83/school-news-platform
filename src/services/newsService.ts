/**
 * News Service
 * Core business logic for News Module (Public & Admin operations)
 * School News Platform - Step 05 News Module
 */

import { supabase } from '../lib/supabase';
import {
  NewsItem,
  NewsFilterParams,
  NewsPaginationResult,
  NewsStatus,
  NewsCategory,
  NewsTag,
} from '../types/news';
import { slugifyVietnamese } from '../lib/slugify';
import { INITIAL_CATEGORIES } from './categoryService';
import { INITIAL_TAGS } from './tagService';

/**
 * Rich fallback published news items for initial verification & cold database preview
 */
export const INITIAL_PUBLISHED_NEWS: NewsItem[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Lễ tổng kết năm học 2024 – 2025: Tự hào một chặng đường, vững bước tương lai',
    slug: 'le-tong-ket-nam-hoc-2024-2025',
    excerpt:
      'Sáng ngày 29/05/2025, Trường THCS & THPT Vĩnh Phong long trọng tổ chức Lễ tổng kết năm học 2024 – 2025, khép lại một chặng đường nỗ lực, đồng thời mở ra những kỳ vọng mới cho thầy và trò nhà trường.',
    content: `
      <h2>1. Nhìn lại chặng đường đã qua</h2>
      <p>Năm học 2024 – 2025 là một năm học đầy nỗ lực và nhiều dấu ấn của thầy và trò Trường THCS & THPT Vĩnh Phong. Với sự quan tâm, chỉ đạo sát sao của Ban Giám hiệu, sự đồng hành của phụ huynh và tinh thần đoàn kết, trách nhiệm của toàn thể cán bộ, giáo viên, học sinh, nhà trường đã đạt được nhiều thành tích đáng khích lệ trong học tập, rèn luyện và các hoạt động phong trào.</p>
      <p>Trong năm học, tỷ lệ học sinh giỏi tăng cao, nhiều em đạt giải trong các kỳ thi học sinh giỏi cấp thành phố, cấp quốc gia. Các hoạt động ngoại khóa, văn hóa – thể thao cũng diễn ra sôi nổi, góp phần xây dựng môi trường học đường an toàn, thân thiện và giàu bản sắc.</p>
      <h2>2. Vinh danh và định hướng tương lai</h2>
      <p>Tại buổi lễ, nhà trường đã tuyên dương, khen thưởng các tập thể, cá nhân có thành tích xuất sắc trong năm học. Đây là sự ghi nhận xứng đáng cho những nỗ lực không ngừng nghỉ của thầy và trò, đồng thời là nguồn động viên mạnh mẽ để tiếp tục phấn đấu trong những năm học tới.</p>
      <h2>3. Khoảnh khắc đáng nhớ</h2>
      <p>Lễ tổng kết khép lại trong không khí trang trọng, ấm áp và đầy cảm xúc. Những nụ cười, cái bắt tay, những ánh mắt rạng rỡ của học sinh là minh chứng cho một năm học thành công, mở ra hành trình mới với nhiều kỳ vọng.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000001',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    status: 'published',
    is_featured: true,
    view_count: 1248,
    published_at: '2025-05-29T08:30:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2025-05-29T08:00:00.000Z',
    updated_at: '2025-05-29T08:30:00.000Z',
    category: INITIAL_CATEGORIES[0],
    author: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Ban Truyền thông',
      avatar_url: null,
    },
    tags: INITIAL_TAGS.slice(0, 4),
  },
  {
    id: 'news-00000000-0000-0000-0000-000000000001',
    title: 'Khai mạc Hội khỏe Phù Đổng cấp trường năm học 2025 - 2026',
    slug: 'khai-mac-hoi-khoe-phu-dong-cap-truong-nam-hoc-2025-2026',
    excerpt:
      'Sáng nay, nhà trường đã long trọng tổ chức lễ khai mạc Hội khỏe Phù Đổng với sự tham gia của hơn 1.200 vận động viên học sinh ở các bộ môn thi đấu.',
    content: `
      <p class="lead">Nhằm duy trì và đẩy mạnh phong trào rèn luyện thân thể theo gương Bác Hồ vĩ đại, sáng ngày 02/09/2026, trường đã long trọng tổ chức Lễ khai mạc Hội khỏe Phù Đổng cấp trường năm học 2025 - 2026.</p>
      
      <h2>1. Không khí rực rỡ và tinh thần thể thao sôi nổi</h2>
      <p>Buổi lễ diễn ra trong không khí trang nghiêm và rực rỡ sắc màu với sự tham gia đầy đủ của Ban Giám hiệu, đại diện Hội Cha mẹ học sinh, toàn thể quý thầy cô giáo cùng hơn 1.200 vận động viên tiêu biểu đại diện cho 36 chi đoàn học sinh.</p>
      
      <h3>1.1. Lễ rước cờ và ngọn đuốc truyền thống</h3>
      <p>Ngọn đuốc truyền thống được các học sinh xuất sắc rước từ phòng truyền thống ra lễ đài, thắp sáng đài lửa thi đấu, tượng trưng cho tinh thần nhiệt huyết, trung thực và cao thượng của tuổi trẻ nhà trường.</p>
      
      <h3>1.2. Lời dặn dò và phát động của Ban Giám hiệu</h3>
      <p>Phát biểu khai mạc, Thầy Hiệu trưởng nhấn mạnh: <em>"Hội khỏe Phù Đổng không chỉ là sân chơi thể thao rèn luyện sức khỏe mà còn là cơ hội quý báu để các em giao lưu, thắt chặt tình đoàn kết và rèn luyện ý chí kiên định."</em></p>
      
      <h2>2. Các nội dung thi đấu trọng điểm</h2>
      <p>Hội thi năm nay quy tụ tranh tài ở 6 bộ môn thể thao mũi nhọn:</p>
      <ul>
        <li><strong>Bóng đá mini nam/nữ:</strong> 24 đội bóng tranh tài qua các vòng bảng quyết liệt.</li>
        <li><strong>Cầu lông & Bóng bàn:</strong> Tranh giải đơn nam, đơn nữ và đôi nam nữ phối hợp.</li>
        <li><strong>Điền kinh:</strong> Chạy cự ly 100m, 800m và nhảy xa tiếp sức.</li>
        <li><strong>Cờ vua:</strong> Đấu trí chiến thuật căng thẳng giữa các kỳ thủ trẻ.</li>
      </ul>
      
      <h2>3. Kế hoạch và lịch trình chung kết</h2>
      <p>Các trận chung kết và lễ bế mạc trao huy chương dự kiến sẽ diễn ra vào cuối tuần tới tại sân vận động trung tâm của nhà trường. Kính mời quý thầy cô, phụ huynh và các em học sinh đến cổ vũ cho các vận động viên.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000002',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    status: 'published',
    is_featured: true,
    view_count: 540,
    published_at: '2026-09-02T08:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-02T08:00:00.000Z',
    category: INITIAL_CATEGORIES[0].children![0],
    author: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Thầy Nguyễn Văn An (Bí thư Đoàn)',
      avatar_url: null,
    },
    tags: [INITIAL_TAGS[0], INITIAL_TAGS[3]],
  },
  {
    id: 'news-00000000-0000-0000-0000-000000000002',
    title: 'Tuyên dương 15 học sinh đạt giải cao trong Kỳ thi Học sinh Giỏi cấp Tỉnh',
    slug: 'tuyen-duong-15-hoc-sinh-dat-giai-cao-trong-ky-thi-hoc-sinh-gioi-cap-tinh',
    excerpt:
      'Nhiệt liệt biểu dương thành tích xuất sắc của đội tuyển học sinh giỏi các môn Toán, Vật lý, Ngữ văn và Tiếng Anh trong kỳ thi chọn học sinh giỏi cấp tỉnh vừa qua.',
    content: `
      <p class="lead">Sáng nay, trong buổi sinh hoạt dưới cờ đầu tuần, nhà trường đã long trọng tổ chức lễ tuyên dương và trao thưởng cho 15 học sinh xuất sắc đạt giải cao trong Kỳ thi Học sinh Giỏi cấp Tỉnh năm học 2025 - 2026.</p>
      
      <h2>1. Bảng vàng thành tích ấn tượng</h2>
      <p>Năm nay, đội tuyển của nhà trường tiếp tục giữ vững vị trí tốp đầu toàn tỉnh với tỷ lệ đạt giải lên đến 88%. Cụ thể:</p>
      <ul>
        <li><strong>03 Giải Nhất:</strong> Môn Toán học (Lớp 12A1), Môn Tiếng Anh (Lớp 11A1), Môn Ngữ văn (Lớp 12D1).</li>
        <li><strong>05 Giải Nhì:</strong> Các môn Vật lý, Hóa học và Sinh học.</li>
        <li><strong>07 Giải Ba và Khuyến khích:</strong> Trải đều ở các môn Lịch sử, Địa lý và Tin học.</li>
      </ul>

      <h2>2. Sự đồng hành tận tụy của các thầy cô bồi dưỡng</h2>
      <p>Để có được quả ngọt ngày hôm nay, đó là cả một hành trình miệt mài ôn luyện trong suốt 6 tháng qua của các thầy cô trong tổ chuyên môn bồi dưỡng học sinh giỏi.</p>
      
      <h3>2.1. Đổi mới phương pháp tiếp cận đề thi</h3>
      <p>Các tổ bộ môn đã chủ động áp dụng ngân hàng câu hỏi mở, tăng cường các câu hỏi liên hệ thực tiễn và phát triển tư duy phản biện cho các em học sinh.</p>
      
      <h2>3. Lời động viên hướng tới Kỳ thi Quốc gia</h2>
      <p>Ban Giám hiệu chúc mừng các em và bày tỏ kỳ vọng 3 học sinh đạt Giải Nhất tiếp tục giữ vững phong độ khi bước vào vòng chọn đội tuyển đại diện tỉnh tham dự Kỳ thi Học sinh Giỏi Quốc gia sắp tới.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000003',
    author_id: 'author-00000000-0000-0000-0000-000000000002',
    status: 'published',
    is_featured: true,
    view_count: 890,
    published_at: '2026-08-28T09:30:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000002',
    created_at: '2026-08-27T14:00:00.000Z',
    updated_at: '2026-08-28T09:30:00.000Z',
    category: INITIAL_CATEGORIES[0].children![1],
    author: {
      id: 'author-00000000-0000-0000-0000-000000000002',
      full_name: 'Cô Trần Thị Mai (Phó Hiệu trưởng Chuyên môn)',
      avatar_url: null,
    },
    tags: [INITIAL_TAGS[1]],
  },
  {
    id: 'news-00000000-0000-0000-0000-000000000003',
    title: 'Tập huấn Chuyển đổi số và ứng dụng CNTT trong công tác giảng dạy',
    slug: 'tap-huan-chuyen-doi-so-va-ung-dung-cntt-trong-cong-tac-giang-day',
    excerpt:
      'Hội đồng sư phạm nhà trường đã tham gia buổi tập huấn nâng cao năng lực ứng dụng học liệu số, nền tảng LMS và bài giảng tương tác thông minh.',
    content: `
      <p class="lead">Thực hiện kế hoạch chuyển đổi số ngành giáo dục giai đoạn 2025 - 2030, nhà trường đã tổ chức thành công đợt tập huấn chuyên sâu về ứng dụng công nghệ thông tin cho toàn thể cán bộ, giáo viên.</p>
      
      <h2>1. Mục tiêu nâng cao năng lực sư phạm số</h2>
      <p>Chuyển đổi số không đơn thuần là số hóa giáo án mà là sự đổi mới toàn diện về tư duy sư phạm, phương pháp đánh giá và cách thức tương tác giữa thầy và trò trong môi trường lớp học thông minh.</p>
      
      <h2>2. Các chuyên đề thực hành tại khóa tập huấn</h2>
      <ul>
        <li><strong>Xây dựng học liệu đa phương tiện:</strong> Thiết kế video bài giảng ngắn, sơ đồ tư duy tương tác.</li>
        <li><strong>Hệ thống quản lý học tập LMS:</strong> Giao bài tập về nhà, theo dõi tiến độ học tập cá nhân hóa.</li>
        <li><strong>Kiểm tra đánh giá tự động:</strong> Sử dụng công cụ trắc nghiệm trực tuyến bảo mật, chống gian lận.</li>
      </ul>
      
      <h2>3. Kết quả đánh giá cuối khóa</h2>
      <p>100% cán bộ, giáo viên tham gia đã hoàn thành bài tập thực hành thiết kế 01 giáo án điện tử đạt chuẩn và được cấp chứng nhận hoàn thành chương trình tập huấn.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000004',
    author_id: 'author-00000000-0000-0000-0000-000000000001',
    status: 'published',
    is_featured: false,
    view_count: 420,
    published_at: '2026-08-20T11:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000001',
    created_at: '2026-08-19T08:00:00.000Z',
    updated_at: '2026-08-20T11:00:00.000Z',
    category: INITIAL_CATEGORIES[1],
    author: {
      id: 'author-00000000-0000-0000-0000-000000000001',
      full_name: 'Thầy Nguyễn Văn An',
      avatar_url: null,
    },
    tags: [INITIAL_TAGS[2]],
  },
  {
    id: 'news-00000000-0000-0000-0000-000000000004',
    title: 'Thông báo về việc tổ chức kiểm tra định kỳ Giữa Học kỳ I',
    slug: 'thong-bao-ve-viec-to-chuc-kiem-tra-dinh-ky-giua-hoc-ky-i',
    excerpt:
      'Ban Giám hiệu nhà trường ban hành kế hoạch và lịch kiểm tra giữa học kỳ dành cho các khối lớp 10, 11 và 12, đề nghị các tổ chuyên môn thực hiện nghiêm túc.',
    content: `
      <p class="lead">Căn cứ theo kế hoạch thời gian năm học, Ban Giám hiệu nhà trường xin thông báo lịch kiểm tra định kỳ Giữa Học kỳ I năm học 2025 - 2026 dành cho học sinh toàn trường.</p>
      
      <h2>1. Thời gian và hình thức tổ chức kiểm tra</h2>
      <p>Kiểm tra diễn ra từ ngày 15/10 đến ngày 20/10/2026. Học sinh các khối 10, 11, 12 kiểm tra tập trung theo số báo danh và phòng thi được niêm yết tại bảng tin.</p>
      
      <h2>2. Quy định đối với học sinh tham gia kiểm tra</h2>
      <p>Học sinh phải có mặt tại phòng thi trước giờ phát đề 15 phút. Tuyệt đối không mang điện thoại di động và các thiết bị thu phát sóng vào phòng kiểm tra.</p>
    `,
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    category_id: 'cat-00000000-0000-0000-0000-000000000005',
    author_id: 'author-00000000-0000-0000-0000-000000000002',
    status: 'published',
    is_featured: false,
    view_count: 670,
    published_at: '2026-08-15T09:00:00.000Z',
    published_by: 'author-00000000-0000-0000-0000-000000000002',
    created_at: '2026-08-14T10:00:00.000Z',
    updated_at: '2026-08-15T09:00:00.000Z',
    category: INITIAL_CATEGORIES[2],
    author: {
      id: 'author-00000000-0000-0000-0000-000000000002',
      full_name: 'Cô Trần Thị Mai',
      avatar_url: null,
    },
    tags: [INITIAL_TAGS[4]],
  },
];

/**
 * Format raw database row to NewsItem
 */
function mapDbNews(row: Record<string, unknown>): NewsItem {
  const authorProfile = row.profiles as { id: string; full_name: string; avatar_url: string | null } | null;
  const categoryObj = row.news_categories as NewsCategory | null;

  // Resolve tags
  const tagsList: NewsTag[] = [];
  if (Array.isArray(row.news_tag_relations)) {
    for (const rel of row.news_tag_relations) {
      if (rel.news_tags) {
        tagsList.push(rel.news_tags as NewsTag);
      }
    }
  }

  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    content: String(row.content),
    thumbnail: row.thumbnail ? String(row.thumbnail) : null,
    category_id: String(row.category_id),
    author_id: String(row.author_id),
    status: row.status as NewsStatus,
    is_featured: Boolean(row.is_featured),
    view_count: typeof row.view_count === 'number' ? row.view_count : 0,
    published_at: row.published_at ? String(row.published_at) : null,
    published_by: row.published_by ? String(row.published_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    author: authorProfile
      ? {
          id: authorProfile.id,
          full_name: authorProfile.full_name,
          avatar_url: authorProfile.avatar_url,
        }
      : null,
    category: categoryObj || null,
    tags: tagsList,
  };
}

/**
 * Fetch published news with pagination, category filter, tag filter, and sorting
 */
export async function getPublishedNews(
  params: NewsFilterParams = {}
): Promise<NewsPaginationResult<NewsItem>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(params.limit || 9, 50));
  const offset = (page - 1) * limit;

  try {
    // 1. If searching, route to server-side full-text search function
    if (params.searchQuery && params.searchQuery.trim()) {
      return searchNews(params.searchQuery.trim(), params.categorySlug, params.tagSlug, page, limit);
    }

    let query = supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug,
          description
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug,
            usage_count
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'published');

    if (params.isFeatured !== undefined) {
      query = query.eq('is_featured', params.isFeatured);
    }

    // Category filter by slug: resolve category id first or filter directly if id provided
    if (params.categorySlug && params.categorySlug !== 'all') {
      const { data: catData } = await supabase
        .from('news_categories')
        .select('id')
        .eq('slug', params.categorySlug)
        .maybeSingle();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    // Sorting
    if (params.sort === 'views') {
      query = query.order('view_count', { ascending: false });
    } else if (params.sort === 'oldest') {
      query = query.order('published_at', { ascending: true });
    } else {
      query = query.order('published_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('[newsService] DB error fetching news:', error.message);
      }
      // Return fallback demo items with client filtering for cold DB
      let filtered = [...INITIAL_PUBLISHED_NEWS];
      if (params.categorySlug && params.categorySlug !== 'all') {
        filtered = filtered.filter((n) => n.category?.slug === params.categorySlug);
      }
      if (params.isFeatured !== undefined) {
        filtered = filtered.filter((n) => n.is_featured === params.isFeatured);
      }
      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);
      return {
        items: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    const items = data.map((row: Record<string, unknown>) => mapDbNews(row));
    const total = count || items.length;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[newsService] Exception fetching published news:', err);
    return {
      items: INITIAL_PUBLISHED_NEWS.slice(offset, offset + limit),
      total: INITIAL_PUBLISHED_NEWS.length,
      page,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Fetch news detail by slug
 * Automatically calls increment_news_views RPC in background
 */
export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug,
          description
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug,
            usage_count
          )
        )
      `
      )
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      // Fallback
      return INITIAL_PUBLISHED_NEWS.find((n) => n.slug === slug || n.id === slug) || INITIAL_PUBLISHED_NEWS[0] || null;
    }

    const newsItem = mapDbNews(data as Record<string, unknown>);

    // Fire view count increment asynchronously
    supabase.rpc('increment_news_views', { p_news_id: newsItem.id }).then(({ error: viewErr }) => {
      if (viewErr) {
        console.warn('[newsService] Could not increment view count:', viewErr.message);
      }
    });

    return newsItem;
  } catch (err) {
    console.warn('[newsService] Exception fetching news by slug:', err);
    return INITIAL_PUBLISHED_NEWS.find((n) => n.slug === slug || n.id === slug) || INITIAL_PUBLISHED_NEWS[0] || null;
  }
}

/**
 * Fetch 1–4 Related News articles
 * Prioritizes same category, can consider tags, strictly excludes current article!
 */
export async function getRelatedNews(
  currentNewsId: string,
  categoryId: string,
  limit = 4
): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug
        )
      `
      )
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', currentNewsId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      // Fallback from demo news
      return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
    }

    return data.map((r: Record<string, unknown>) => mapDbNews(r));
  } catch (err) {
    console.warn('[newsService] Exception fetching related news:', err);
    return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
  }
}

/**
 * Fetch Older News
 * Prioritizes articles published before the current article's published_at date in the same category
 */
export async function getOlderNews(
  currentNewsId: string,
  categoryId: string,
  publishedAt?: string | null,
  limit = 5
): Promise<NewsItem[]> {
  try {
    let query = supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        created_at,
        updated_at,
        news_categories (
          id,
          name,
          slug
        )
      `
      )
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', currentNewsId);

    if (publishedAt) {
      query = query.lt('published_at', publishedAt);
    }

    query = query.order('published_at', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Return older news from demo
      return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
    }

    return data.map((r: Record<string, unknown>) => mapDbNews(r));
  } catch (err) {
    console.warn('[newsService] Exception fetching older news:', err);
    return INITIAL_PUBLISHED_NEWS.filter((n) => n.id !== currentNewsId).slice(0, limit);
  }
}

/**
 * Server-side Full-Text Search for News using PostgreSQL search_news_fts RPC
 */
export async function searchNews(
  queryText: string,
  categorySlug?: string,
  tagSlug?: string,
  page = 1,
  limit = 12
): Promise<NewsPaginationResult<NewsItem>> {
  const offset = (page - 1) * limit;

  try {
    // Resolve category id if categorySlug provided
    let categoryId: string | null = null;
    if (categorySlug && categorySlug !== 'all') {
      const { data: catData } = await supabase
        .from('news_categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();
      if (catData) categoryId = catData.id;
    }

    // Resolve tag id if tagSlug provided
    let tagId: string | null = null;
    if (tagSlug) {
      const { data: tData } = await supabase
        .from('news_tags')
        .select('id')
        .eq('slug', tagSlug)
        .maybeSingle();
      if (tData) tagId = tData.id;
    }

    const { data, error } = await supabase.rpc('search_news_fts', {
      p_query: queryText.trim(),
      p_category_id: categoryId,
      p_tag_id: tagId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error || !data || data.length === 0) {
      // Fallback search over demo data
      const q = queryText.toLowerCase();
      const filtered = INITIAL_PUBLISHED_NEWS.filter(
        (n) => n.title.toLowerCase().includes(q) || (n.excerpt && n.excerpt.toLowerCase().includes(q))
      );
      return {
        items: filtered.slice(offset, offset + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }

    const total = data.length > 0 && data[0].total_count ? Number(data[0].total_count) : data.length;
    const items: NewsItem[] = data.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      title: String(r.title),
      slug: String(r.slug),
      excerpt: r.excerpt ? String(r.excerpt) : null,
      content: '',
      thumbnail: r.thumbnail ? String(r.thumbnail) : null,
      category_id: String(r.category_id),
      author_id: String(r.author_id),
      status: 'published',
      is_featured: false,
      view_count: typeof r.view_count === 'number' ? r.view_count : 0,
      published_at: r.published_at ? String(r.published_at) : null,
      created_at: '',
      updated_at: '',
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[newsService] Exception in searchNews:', err);
    return {
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Fetch news for Admin Management view with status filters
 */
export async function getAdminNewsList(params: {
  status?: NewsStatus;
  searchQuery?: string;
  categorySlug?: string;
  page?: number;
  limit?: number;
}): Promise<NewsPaginationResult<NewsItem>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(params.limit || 15, 50));
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug
          )
        )
      `,
        { count: 'exact' }
      );

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      query = query.ilike('title', `%${params.searchQuery.trim()}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error || !data) {
      console.warn('[newsService] Admin news fetch error:', error?.message);
      // Fallback
      let list = [...INITIAL_PUBLISHED_NEWS];
      if (params.status) {
        list = list.filter((n) => n.status === params.status);
      }
      return {
        items: list.slice(offset, offset + limit),
        total: list.length,
        page,
        limit,
        totalPages: Math.ceil(list.length / limit) || 1,
      };
    }

    const items = data.map((r: Record<string, unknown>) => mapDbNews(r));
    const total = count || items.length;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.warn('[newsService] Exception in getAdminNewsList:', err);
    return {
      items: INITIAL_PUBLISHED_NEWS,
      total: INITIAL_PUBLISHED_NEWS.length,
      page: 1,
      limit,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single news item by ID for editing
 */
export async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        category_id,
        author_id,
        status,
        is_featured,
        view_count,
        published_at,
        published_by,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        news_categories (
          id,
          name,
          slug
        ),
        news_tag_relations (
          news_tags (
            id,
            name,
            slug
          )
        )
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return INITIAL_PUBLISHED_NEWS.find((n) => n.id === id) || null;
    }

    return mapDbNews(data as Record<string, unknown>);
  } catch (err) {
    console.warn('[newsService] Exception fetching news by id:', err);
    return null;
  }
}

/**
 * Create a new article with tag relations
 */
export async function createNews(
  input: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    thumbnail?: string;
    category_id: string;
    author_name?: string;
    source?: string;
    source_url?: string;
    is_featured?: boolean;
    status?: NewsStatus;
    tag_ids?: string[];
  },
  authorId: string
): Promise<{ success: boolean; data?: NewsItem; error?: string }> {
  try {
    const title = input.title.trim();
    if (!title) return { success: false, error: 'Tiêu đề bài viết không được để trống' };
    if (!input.content || !input.content.trim()) {
      return { success: false, error: 'Nội dung bài viết không được để trống' };
    }
    if (!input.category_id) {
      return { success: false, error: 'Vui lòng chọn chuyên mục cho bài viết' };
    }

    if (input.thumbnail && input.thumbnail.startsWith('blob:')) {
      return {
        success: false,
        error: 'Không thể lưu ảnh đại diện dạng blob tạm thời. Vui lòng tải lại ảnh hợp lệ lên hệ thống lưu trữ.',
      };
    }

    const slug = input.slug?.trim() || `${slugifyVietnamese(title)}-${Date.now().toString(36)}`;
    const status: NewsStatus = input.status || 'draft';

    // 1. Insert article
    const { data: newsRow, error: newsErr } = await supabase
      .from('news')
      .insert({
        title,
        slug,
        excerpt: input.excerpt?.trim() || null,
        content: input.content,
        thumbnail: input.thumbnail || null,
        category_id: input.category_id,
        author_id: authorId,
        author_name: input.author_name?.trim() || null,
        source: input.source?.trim() || null,
        source_url: input.source_url?.trim() || null,
        status,
        is_featured: input.is_featured ?? false,
      })
      .select()
      .single();

    if (newsErr || !newsRow) {
      return { success: false, error: newsErr?.message || 'Lỗi khi lưu bài viết' };
    }

    // 2. Link tags if provided
    if (input.tag_ids && input.tag_ids.length > 0) {
      const relations = input.tag_ids.map((tagId) => ({
        news_id: newsRow.id,
        tag_id: tagId,
      }));
      await supabase.from('news_tag_relations').insert(relations);
    }

    return { success: true, data: newsRow as NewsItem };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo bài viết',
    };
  }
}

/**
 * Update an existing article and its tags
 */
export async function updateNews(
  id: string,
  input: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    category_id?: string;
    author_name?: string;
    source?: string;
    source_url?: string;
    is_featured?: boolean;
    status?: NewsStatus;
    tag_ids?: string[];
  }
): Promise<{ success: boolean; data?: NewsItem; error?: string }> {
  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updatePayload.title = input.title.trim();
    if (input.slug !== undefined) updatePayload.slug = input.slug.trim();
    if (input.excerpt !== undefined) updatePayload.excerpt = input.excerpt?.trim() || null;
    if (input.content !== undefined) updatePayload.content = input.content;
    if (input.author_name !== undefined) updatePayload.author_name = input.author_name?.trim() || null;
    if (input.source !== undefined) updatePayload.source = input.source?.trim() || null;
    if (input.source_url !== undefined) updatePayload.source_url = input.source_url?.trim() || null;

    if (input.thumbnail !== undefined) {
      if (input.thumbnail && input.thumbnail.startsWith('blob:')) {
        return {
          success: false,
          error: 'Không thể lưu ảnh đại diện dạng blob tạm thời. Vui lòng tải lại ảnh hợp lệ lên hệ thống lưu trữ.',
        };
      }
      updatePayload.thumbnail = input.thumbnail || null;
    }

    if (input.category_id !== undefined) updatePayload.category_id = input.category_id;
    if (input.is_featured !== undefined) updatePayload.is_featured = input.is_featured;
    if (input.status !== undefined) updatePayload.status = input.status;

    // 1. Update article
    const { data: newsRow, error: newsErr } = await supabase
      .from('news')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (newsErr || !newsRow) {
      return { success: false, error: newsErr?.message || 'Lỗi khi cập nhật bài viết' };
    }

    // 2. Sync tags if provided
    if (input.tag_ids !== undefined) {
      await supabase.from('news_tag_relations').delete().eq('news_id', id);
      if (input.tag_ids.length > 0) {
        const relations = input.tag_ids.map((tagId) => ({
          news_id: id,
          tag_id: tagId,
        }));
        await supabase.from('news_tag_relations').insert(relations);
      }
    }

    return { success: true, data: newsRow as NewsItem };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi cập nhật bài viết',
    };
  }
}

/**
 * Submit article for review (draft -> pending)
 */
export async function submitNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('news')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi gửi duyệt bài viết',
    };
  }
}

/**
 * Publish article (calls atomic server-side RPC publish_news_item)
 */
export async function publishNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('publish_news_item', { p_news_id: id });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xuất bản bài viết',
    };
  }
}

/**
 * Archive article
 */
export async function archiveNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('news')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi lưu trữ bài viết',
    };
  }
}

/**
 * Delete article
 */
export async function deleteNews(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi xóa bài viết',
    };
  }
}
