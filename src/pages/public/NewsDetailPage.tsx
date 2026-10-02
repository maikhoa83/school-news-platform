import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Eye,
  User,
  Home,
  Megaphone,
  ChevronRight,
  Share2,
  Check,
  Quote,
  ExternalLink,
  Bookmark,
} from 'lucide-react';
import { useNewsDetail } from '../../hooks/useNewsDetail';
import { CommentSection } from '../../components/news/CommentSection';
import { sanitizeHtml } from '../../lib/sanitize';
import campusFacadeImg from '../../assets/images/campus_facade.jpg';
import sloganBannerImg from '../../assets/images/slogan_banner.jpg';

export const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { news: dbNews, isLoading } = useNewsDetail(slug);
  const [copiedLink, setCopiedLink] = useState(false);

  // Default article mock data matching Chi tiet tin.png if not loaded from database
  const fallbackArticle = {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Lễ tổng kết năm học 2024 – 2025: Tự hào một chặng đường, vững bước tương lai',
    slug: 'le-tong-ket-nam-hoc-2024-2025',
    category: {
      name: 'Hoạt động nhà trường',
      slug: 'hoat-dong-nha-truong',
    },
    author: {
      full_name: 'Ban Truyền thông',
    },
    author_name: 'Ban Truyền thông & Biên tập',
    source: 'Cổng thông tin Trường THCS & THPT Vĩnh Phong',
    source_url: null,
    published_at: '29/05/2025',
    view_count: 1248,
    excerpt:
      'Sáng ngày 29/05/2025, Trường THCS & THPT Vĩnh Phong long trọng tổ chức Lễ tổng kết năm học 2024 – 2025, khép lại một chặng đường nỗ lực, đồng thời mở ra những kỳ vọng mới cho thầy và trò nhà trường.',
    tags: [
      { id: '1', name: 'tổng kết năm học', slug: 'tong-ket-nam-hoc' },
      { id: '2', name: 'hoạt động nhà trường', slug: 'hoat-dong-nha-truong' },
      { id: '3', name: 'học sinh', slug: 'hoc-sinh' },
      { id: '4', name: 'năm học 2024 – 2025', slug: 'nam-hoc-2024-2025' },
    ],
  };

  const article = dbNews || fallbackArticle;

  const sidebarLatestNews = [
    {
      id: '1',
      title: 'Lễ tổng kết năm học 2024 – 2025: Tự hào một chặng đường, vững bước tương lai',
      date: '29/05/2025',
      category: 'Hoạt động nhà trường',
      image: campusFacadeImg,
      href: '/news/1',
    },
    {
      id: '2',
      title: 'Lễ tri ân và trưởng thành cho học sinh khối 12 năm học 2024 – 2025',
      date: '28/05/2025',
      category: 'Hoạt động nhà trường',
      image: sloganBannerImg,
      href: '/news/2',
    },
    {
      id: '3',
      title: 'Hội nghị cha mẹ học sinh đầu năm học 2025 – 2026',
      date: '25/05/2025',
      category: 'Thông báo',
      image: campusFacadeImg,
      href: '/news/3',
    },
    {
      id: '4',
      title: 'Giải bóng đá học sinh THCS & THPT Vĩnh Phong lần thứ 8 – Năm học 2024 – 2025',
      date: '20/05/2025',
      category: 'Hoạt động phong trào',
      image: sloganBannerImg,
      href: '/news/4',
    },
    {
      id: '5',
      title: 'Đoàn trường tổ chức chương trình "Tiếp sức mùa thi 2025"',
      date: '18/05/2025',
      category: 'Hoạt động Đoàn - Hội',
      image: campusFacadeImg,
      href: '/news/5',
    },
  ];

  const sidebarAnnouncements = [
    {
      id: '1',
      title: 'Thông báo về việc nghỉ lễ 30/4 và 1/5',
      date: '22/04/2025',
      href: '/announcements',
    },
    {
      id: '2',
      title: 'Thông báo tổ chức thi học kỳ II năm học 2024 – 2025',
      date: '16/04/2025',
      href: '/announcements',
    },
    {
      id: '3',
      title: 'Thông báo tuyển sinh lớp 10 năm học 2025 – 2026',
      date: '10/04/2025',
      href: '/announcements',
    },
    {
      id: '4',
      title: 'Thông báo về việc thay đổi lịch học đối với khối 12',
      date: '05/04/2025',
      href: '/announcements',
    },
  ];

  const mostViewedNews = [
    {
      id: '1',
      title: 'Lễ tổng kết năm học 2024 – 2025',
      views: '1.248 lượt xem',
      href: '/news/1',
    },
    {
      id: '2',
      title: 'Lễ tri ân và trưởng thành cho học sinh khối 12',
      views: '982 lượt xem',
      href: '/news/2',
    },
    {
      id: '3',
      title: 'Hội nghị cha mẹ học sinh đầu năm học 2025 – 2026',
      views: '756 lượt xem',
      href: '/news/3',
    },
    {
      id: '4',
      title: 'Giải bóng đá học sinh THPT Lê Quý Đôn',
      views: '642 lượt xem',
      href: '/news/4',
    },
    {
      id: '5',
      title: 'Thông báo tuyển sinh lớp 10 năm học 2025 – 2026',
      views: '521 lượt xem',
      href: '/news/5',
    },
  ];

  const relatedNewsList = [
    {
      id: 'rel-1',
      title: 'Lễ tri ân và trưởng thành cho học sinh khối 12 năm học 2024 – 2025',
      date: '28/05/2025',
      category: 'Hoạt động nhà trường',
      image: sloganBannerImg,
      href: '/news/2',
    },
    {
      id: 'rel-2',
      title: 'Hội nghị cha mẹ học sinh đầu năm học 2025 – 2026',
      date: '25/05/2025',
      category: 'Thông báo',
      image: campusFacadeImg,
      href: '/news/3',
    },
    {
      id: 'rel-3',
      title: 'Giải bóng đá học sinh THPT Lê Quý Đôn lần thứ 8 – Năm học 2024 – 2025',
      date: '20/05/2025',
      category: 'Hoạt động phong trào',
      image: sloganBannerImg,
      href: '/news/4',
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formattedDate =
    typeof article.published_at === 'string' && article.published_at.includes('/')
      ? article.published_at
      : article.published_at
      ? new Date(article.published_at).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '29/05/2025';

  return (
    <div id="news-detail-page" className="min-h-screen bg-slate-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. BREADCRUMB matching Chi tiet tin.png */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-slate-500 flex-wrap"
        >
          <Link
            to="/"
            className="flex items-center gap-1 text-[#003B8E] hover:underline font-medium"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <span className="text-slate-400">/</span>
          <Link to="/news" className="text-[#003B8E] hover:underline font-medium">
            Tin tức
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">
            {article.category?.name || 'Hoạt động nhà trường'}
          </span>
        </nav>

        {/* 2. MAIN 12-COLUMN GRID (MAIN 8 COLS + SIDEBAR 4 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: MAIN ARTICLE CONTENT (8 COLUMNS) */}
          <main className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-8 lg:p-9 shadow-2xs space-y-6">
            {/* Category badge */}
            <div>
              <span className="inline-block px-3 py-1 rounded-sm bg-[#003B8E] text-white text-[11px] font-bold uppercase tracking-wider">
                {article.category?.name || 'HOẠT ĐỘNG NHÀ TRƯỜNG'}
              </span>
            </div>

            {/* Article Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#002B66] leading-snug tracking-tight">
              {article.title}
            </h1>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-700" />
                <span>Tác giả: <strong className="text-slate-700">{article.author_name || article.author?.full_name || 'Ban Truyền thông'}</strong></span>
              </div>
              {article.source && (
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                  <span>Nguồn: </span>
                  {article.source_url ? (
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003B8E] hover:underline font-semibold inline-flex items-center gap-0.5"
                    >
                      <span>{article.source}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <strong className="text-slate-700">{article.source}</strong>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {typeof article.view_count === 'number'
                    ? article.view_count.toLocaleString('vi-VN')
                    : '1.248'}{' '}
                  lượt xem
                </span>
              </div>
            </div>

            {/* Excerpt / Lead */}
            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Main Featured Image with Caption */}
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={campusFacadeImg}
                  alt={article.title}
                  className="w-full h-auto max-h-[460px] object-cover"
                />
              </div>
              <p className="text-center text-[11px] sm:text-xs text-slate-500 italic">
                Toàn cảnh buổi lễ tổng kết năm học 2024 – 2025 tại sân trường THCS &amp; THPT Vĩnh Phong
              </p>
            </div>

            {/* Rich Article Body Content matching Chi tiet tin.png */}
            {dbNews?.content ? (
              <div
                className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(dbNews.content) }}
              />
            ) : (
              <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
                {/* Section 1 */}
                <div className="space-y-3">
                  <h2 className="text-sm sm:text-base font-bold text-[#002B66]">
                    1. Nhìn lại chặng đường đã qua
                  </h2>
                  <p>
                    Năm học 2024 – 2025 là một năm học đầy nỗ lực và nhiều dấu ấn của thầy và trò Trường THCS &amp; THPT Vĩnh Phong. Với sự quan tâm, chỉ đạo sát sao của Ban Giám hiệu, sự đồng hành của phụ huynh và tinh thần đoàn kết, trách nhiệm của toàn thể cán bộ, giáo viên, học sinh, nhà trường đã đạt được nhiều thành tích đáng khích lệ trong học tập, rèn luyện và các hoạt động phong trào.
                  </p>
                  <p>
                    Trong năm học, tỷ lệ học sinh giỏi tăng cao, nhiều em đạt giải trong các kỳ thi học sinh giỏi cấp thành phố, cấp quốc gia. Các hoạt động ngoại khóa, văn hóa – thể thao cũng diễn ra sôi nổi, góp phần xây dựng môi trường học đường an toàn, thân thiện và giàu bản sắc.
                  </p>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <h2 className="text-sm sm:text-base font-bold text-[#002B66]">
                    2. Vinh danh và định hướng tương lai
                  </h2>
                  <p>
                    Tại buổi lễ, nhà trường đã tuyên dương, khen thưởng các tập thể, cá nhân có thành tích xuất sắc trong năm học. Đây là sự ghi nhận xứng đáng cho những nỗ lực không ngừng nghỉ của thầy và trò, đồng thời là nguồn động viên mạnh mẽ để tiếp tục phấn đấu trong những năm học tới.
                  </p>

                  {/* Callout Quote Box matching mockup */}
                  <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-4">
                    <Quote className="h-6 w-6 text-[#003B8E] shrink-0 mt-1 fill-blue-100" />
                    <div className="space-y-2 flex-1">
                      <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed font-normal">
                        “Mỗi thành tích hôm nay là nền tảng cho những ước mơ ngày mai. Tập thể sư phạm và học sinh nhà trường sẽ tiếp tục phát huy truyền thống, đoàn kết, sáng tạo, vững bước trên hành trình chinh phục những mục tiêu mới.”
                      </p>
                      <p className="text-right text-xs font-bold text-[#003B8E]">
                        — Ban Giám hiệu nhà trường
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-3">
                  <h2 className="text-sm sm:text-base font-bold text-[#002B66]">
                    3. Khoảnh khắc đáng nhớ
                  </h2>
                  <p>
                    Lễ tổng kết khép lại trong không khí trang trọng, ấm áp và đầy cảm xúc. Những nụ cười, cái bắt tay, những ánh mắt rạng rỡ của học sinh là minh chứng cho một năm học thành công, mở ra hành trình mới với nhiều kỳ vọng.
                  </p>

                  {/* 3-Column Image Gallery Grid with Captions matching Chi tiet tin.png */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    <div className="space-y-1.5">
                      <div className="h-28 sm:h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={campusFacadeImg}
                          alt="Tuyên dương học sinh"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        Tuyên dương, khen thưởng học sinh có thành tích xuất sắc
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-28 sm:h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={sloganBannerImg}
                          alt="Tiết mục văn nghệ"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        Tiết mục văn nghệ chào mừng Lễ tổng kết
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-28 sm:h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={campusFacadeImg}
                          alt="Khoảnh khắc đáng nhớ"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        Học sinh khối 12 lưu giữ khoảnh khắc đáng nhớ cùng thầy cô
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Author & Source Attribution Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#003B8E] flex items-center justify-center font-bold shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Tác giả bài viết:</span>
                  <strong className="text-slate-900 font-bold text-xs sm:text-sm">
                    {article.author_name || article.author?.full_name || 'Ban Truyền thông & Biên tập'}
                  </strong>
                </div>
              </div>

              {article.source && (
                <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-slate-500 text-[11px] block">Nguồn bài viết:</span>
                  {article.source_url ? (
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003B8E] hover:underline font-bold text-xs sm:text-sm inline-flex items-center gap-1"
                    >
                      <span>{article.source}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-800 font-bold text-xs sm:text-sm">{article.source}</span>
                  )}
                </div>
              )}
            </div>

            {/* 3. TAGS & SHARE ROW matching Chi tiet tin.png */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Từ khóa:</span>
                {(article.tags && article.tags.length > 0
                  ? article.tags
                  : fallbackArticle.tags
                ).map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/news/search?q=${encodeURIComponent(tag.name)}`}
                    className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-blue-50 hover:text-[#003B8E] text-slate-700 text-[11px] transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>

              {/* Share Icons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Chia sẻ:</span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.href
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chia sẻ lên Facebook"
                    className="h-6 w-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    f
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      window.location.href
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chia sẻ lên Twitter/X"
                    className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold hover:opacity-90 transition-opacity"
                  >
                    𝕏
                  </a>
                  <a
                    href={`https://zalo.me/share`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chia sẻ lên Zalo"
                    className="h-6 w-6 rounded-full bg-[#0068FF] text-white flex items-center justify-center text-[8px] font-bold hover:opacity-90 transition-opacity"
                  >
                    Zalo
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    aria-label="Sao chép liên kết"
                    className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition-colors"
                    title="Sao chép liên kết"
                  >
                    {copiedLink ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Share2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. COMMENT SECTION (BẢO TOÀN NGUYÊN VẸN THEO YÊU CẦU CỦA NGƯỜI DÙNG) */}
            <div className="pt-6 border-t border-slate-100">
              <CommentSection newsId={article.id || '1'} />
            </div>
          </main>

          {/* RIGHT: SIDEBAR (4 COLUMNS) matching Chi tiet tin.png */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Block 1: TIN MỚI NHẤT */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-[#003B8E] uppercase tracking-wide">
                  TIN MỚI NHẤT
                </h2>
                <Link
                  to="/news"
                  className="text-[11px] text-[#0052CC] hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3.5">
                {sidebarLatestNews.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-start gap-3 group block"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-14 w-20 object-cover rounded-md shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] text-slate-400 block">
                        {item.date}
                      </span>
                      <h3 className="text-xs font-medium text-slate-900 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-[#0052CC] block">
                        {item.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Block 2: THÔNG BÁO */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-[#003B8E] uppercase tracking-wide">
                  THÔNG BÁO
                </h2>
                <Link
                  to="/announcements"
                  className="text-[11px] text-[#0052CC] hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 space-y-3">
                {sidebarAnnouncements.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3 group block"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Megaphone className="h-4 w-4 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0">
                        <h3 className="text-xs font-medium text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 group-hover:text-[#003B8E] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Block 3: XEM NHIỀU */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-[#003B8E] uppercase tracking-wide">
                  XEM NHIỀU
                </h2>
                <Link
                  to="/news"
                  className="text-[11px] text-[#0052CC] hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  <span>Xem tất cả</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {mostViewedNews.map((item, index) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-start gap-3 group"
                  >
                    <div className="h-5 w-5 rounded-full bg-[#003B8E] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-medium text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {item.views}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* 5. TIN LIÊN QUAN (RELATED NEWS - FULL WIDTH) matching Chi tiet tin.png */}
        <section className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
            <h2 className="text-sm sm:text-base font-bold text-[#003B8E] uppercase tracking-wide">
              TIN LIÊN QUAN
            </h2>
            <Link
              to="/news"
              className="text-xs text-[#0052CC] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedNewsList.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="group flex flex-col space-y-2.5"
              >
                <div className="h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400">{item.date}</span>
                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                    {item.title}
                  </h3>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-sm bg-blue-50 text-[#003B8E] text-[10px] font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
