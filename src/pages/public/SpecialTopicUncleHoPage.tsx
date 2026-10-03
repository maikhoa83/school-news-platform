import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  BookOpen,
  Award,
  Video,
  FileDown,
  Quote,
  Star,
  Search,
  Calendar,
  Eye,
  ArrowRight,
  Sparkles,
  Share2,
} from 'lucide-react';
import bannerHoChiMinhImg from '../../assets/images/banner_ho_chi_minh.jpg';
import campusFacadeImg from '../../assets/images/campus_facade.jpg';

interface TopicArticle {
  id: string;
  title: string;
  category: 'quote' | 'story' | 'movement' | 'document';
  categoryLabel: string;
  excerpt: string;
  publishedDate: string;
  author: string;
  views: number;
  thumbnail: string;
  content: string;
}

const TOPIC_ARTICLES: TopicArticle[] = [
  {
    id: 'bac-1',
    title: 'Những lời dạy thiêng liêng của Chủ tịch Hồ Chí Minh đối với thầy và trò trường phổ thông',
    category: 'quote',
    categoryLabel: 'Lời dạy của Bác',
    excerpt:
      'Chủ tịch Hồ Chí Minh luôn dành tình cảm đặc biệt, sự quan tâm sâu sắc cho sự nghiệp giáo dục. Những lời căn dặn của Người là kim chỉ nam cho các thế hệ nhà giáo và học sinh trường THCS & THPT Vĩnh Phong.',
    publishedDate: '19/05/2025',
    author: 'Chi bộ Nhà trường',
    views: 1820,
    thumbnail: '/banner_ho_chi_minh.jpg',
    content: `
      Bác Hồ kính yêu từng căn dặn: "Dù khó khăn đến đâu cũng phải tiếp tục thi đua dạy tốt và học tốt". Đối với học sinh, Bác dặn dò phải yêu tổ quốc, yêu đồng bào, học tập tốt, lao động tốt, đoàn kết tốt, kỷ luật tốt, giữ gìn vệ sinh thật tốt, khiêm tốn, thật thà, dũng cảm.
    `,
  },
  {
    id: 'bac-2',
    title: 'Chi bộ nhà trường triển khai Kế hoạch học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh năm học 2024 – 2025',
    category: 'movement',
    categoryLabel: 'Phong trào thi đua',
    excerpt:
      'Kế hoạch gắn việc tu dưỡng, rèn luyện đạo đức nhà giáo với các nhiệm vụ chuyên môn cụ thể, nâng cao tinh thần gương mẫu của mỗi đảng viên, giáo viên và cán bộ quản lý.',
    publishedDate: '15/05/2025',
    author: 'Cấp ủy Chi bộ',
    views: 1450,
    thumbnail: '/education_slide_growth.jpg',
    content: `
      100% cán bộ, đảng viên và giáo viên nhà trường đã ký cam kết thi đua tu dưỡng rèn luyện theo gương Bác, tập trung vào đổi mới phương pháp giảng dạy, hết lòng vì học sinh thân yêu và xây dựng trường học hạnh phúc.
    `,
  },
  {
    id: 'bac-3',
    title: 'Câu chuyện về Bác: "Thời gian quý báu lắm" và bài học tự giác cho học sinh',
    category: 'story',
    categoryLabel: 'Kể chuyện về Bác',
    excerpt:
      'Mẫu chuyện giản dị nhưng sâu sắc về tác phong đúng giờ, quý trọng từng phút giây của Bác Hồ giúp các em học sinh xây dựng nếp sống văn minh, biết quý trọng thời gian học tập.',
    publishedDate: '10/05/2025',
    author: 'Đoàn Thanh niên',
    views: 1290,
    thumbnail: '/education_slide_study.jpg',
    content: `
      Bác Hồ là tấm gương mẫu mực về tính chính xác và tác phong làm việc khoa học. Bác từng nói: "Ai đi muộn một chút cũng làm lỡ việc của bao nhiêu người khác". Học tập Bác, học sinh Vĩnh Phong luôn đi học đúng giờ, tham gia sinh hoạt nề nếp.
    `,
  },
  {
    id: 'bac-4',
    title: 'Gương sáng học sinh noi gương Bác: Nhặt được tài sản đánh rơi, trao trả cho người mất',
    category: 'story',
    categoryLabel: 'Tấm gương noi theo',
    excerpt:
      'Hành động đẹp, trung thực của học sinh lớp 12A1 đã lan tỏa mạnh mẽ tinh thần "người tốt việc tốt", thực hiện tốt 5 điều Bác Hồ dạy trong toàn thể học sinh nhà trường.',
    publishedDate: '02/05/2025',
    author: 'Ban Thi đua',
    views: 1680,
    thumbnail: '/campus_facade.jpg',
    content: `
      Em Nguyễn Hoàng Nam, học sinh lớp 12A1 đã nhặt được chiếc ví chứa tiền mặt và giấy tờ tùy thân quan trọng trên đường đi học về và lập tức mang đến văn phòng Đoàn trường bàn giao để trả lại cho chủ nhân.
    `,
  },
  {
    id: 'bac-5',
    title: 'Đoàn trường tổ chức Hội thi kể chuyện tấm gương đạo đức Bác Hồ cấp trường năm học 2024 – 2025',
    category: 'movement',
    categoryLabel: 'Phong trào thi đua',
    excerpt:
      'Hội thi thu hút sự tham gia sôi nổi của 24 chi đoàn và chi đội với nhiều tiết mục sân khấu hóa xúc động, truyền cảm hứng sâu sắc đến toàn thể học sinh.',
    publishedDate: '26/04/2025',
    author: 'Đoàn Thanh niên',
    views: 940,
    thumbnail: '/slogan_banner.jpg',
    content: `
      Các thí sinh không chỉ kể lại những câu chuyện cảm động về tình cảm của Bác dành cho các cháu thiếu niên nhi đồng mà còn rút ra những bài học liên hệ bản thân thiết thực trong việc rèn luyện đạo đức hàng ngày.
    `,
  },
  {
    id: 'bac-6',
    title: 'Xây dựng "Tủ sách Bác Hồ" tại thư viện trường – Không gian đọc và nghiên cứu cho thầy và trò',
    category: 'document',
    categoryLabel: 'Tài liệu & Học liệu',
    excerpt:
      'Thư viện nhà trường khánh thành không gian trưng bày hơn 300 đầu sách quý về cuộc đời, sự nghiệp cách mạng và tư tưởng giáo dục của Chủ tịch Hồ Chí Minh.',
    publishedDate: '18/04/2025',
    author: 'Ban Thư viện',
    views: 860,
    thumbnail: '/education_slide_study.jpg',
    content: `
      Không gian Tủ sách Bác Hồ được trang trí trang trọng với các bộ sách tiểu sử, hồi ký, thơ văn của Bác và các tác phẩm đoạt giải viết về Người, phục vụ nhu cầu đọc sách, tìm hiểu tư liệu của học sinh và giáo viên.
    `,
  },
];

const STUDY_DOCUMENTS = [
  {
    id: 'doc-bac-1',
    title: 'Tài liệu chuyên đề toàn khóa: Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh về ý chí tự lực, tự cường',
    format: 'PDF',
    size: '3.8 MB',
    year: '2024 - 2025',
  },
  {
    id: 'doc-bac-2',
    title: 'Sổ tay 5 Điều Bác Hồ dạy thiếu niên và nhi đồng – Hướng dẫn rèn luyện phẩm chất và kỹ năng học đường',
    format: 'PDF',
    size: '2.1 MB',
    year: '2024 - 2025',
  },
  {
    id: 'doc-bac-3',
    title: 'Đề cương sinh hoạt chuyên đề Chi bộ: Nâng cao trách nhiệm nêu gương của cán bộ, đảng viên, giáo viên',
    format: 'DOCX',
    size: '1.4 MB',
    year: '2025',
  },
  {
    id: 'doc-bac-4',
    title: 'Kỷ yếu những mẩu chuyện hay về Bác Hồ và bài học giáo dục đạo đức học sinh',
    format: 'PDF',
    size: '4.6 MB',
    year: '2025',
  },
];

export function SpecialTopicUncleHoPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'quote' | 'story' | 'movement' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<TopicArticle | null>(null);

  const filteredArticles = TOPIC_ARTICLES.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDownloadDoc = (docTitle: string, format: string) => {
    const sampleContent = `TRƯỜNG THCS & THPT VĨNH PHONG\nCHUYÊN ĐỀ: HỌC TẬP VÀ LÀM THEO TƯ TƯỞNG, ĐẠO ĐỨC, PHONG CÁCH HỒ CHÍ MINH\n\nTài liệu: ${docTitle}\nNăm học: 2024 - 2025\nĐịnh dạng: ${format}\n\nNội dung tài liệu học tập, sinh hoạt chuyên đề tại Trường THCS & THPT Vĩnh Phong.`;
    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-[#003B8E] flex items-center gap-1 transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">Trang chuyên đề</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-[#003B8E] font-semibold">
              Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#990000] via-[#C00000] to-[#800000] text-white py-12 sm:py-16 shadow-lg border-b-4 border-amber-400">
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <img
            src={bannerHoChiMinhImg}
            alt="Họa tiết hoa sen và ánh sáng"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-red-950 font-black text-xs uppercase tracking-wider shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>CHUYÊN ĐỀ ĐẶC BIỆT NĂM HỌC 2024 – 2025</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-amber-200 leading-tight drop-shadow-md">
                ĐẨY MẠNH HỌC TẬP VÀ LÀM THEO TƯ TƯỞNG, ĐẠO ĐỨC, PHONG CÁCH HỒ CHÍ MINH
              </h1>
              <p className="text-sm sm:text-base text-red-100 leading-relaxed font-medium">
                Tuổi trẻ Trường THCS & THPT Vĩnh Phong quyết tâm thi đua dạy tốt, học tốt, rèn đức luyện tài,
                xây dựng trường học hạnh phúc, xứng đáng với niềm tin yêu của Bác Hồ kính yêu.
              </p>
            </div>

            {/* Quote Card */}
            <div className="bg-red-950/60 backdrop-blur-md border border-amber-400/40 p-5 sm:p-6 rounded-2xl max-w-md shadow-xl text-amber-50">
              <Quote className="w-8 h-8 text-amber-400 mb-2 opacity-80" />
              <p className="text-xs sm:text-sm italic leading-relaxed font-serif">
                “Non sông Việt Nam có trở nên tươi đẹp hay không, dân tộc Việt Nam có bước tới đài vinh quang
                để sánh vai với các cường quốc năm châu được hay không, chính là nhờ một phần lớn ở công học tập
                của các em.”
              </p>
              <div className="mt-3 pt-3 border-t border-amber-400/30 text-right">
                <span className="text-xs font-bold text-amber-300">— Chủ tịch Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filter & Search Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {[
                { id: 'all', label: 'Tất cả bài viết' },
                { id: 'quote', label: 'Lời dạy của Bác' },
                { id: 'story', label: 'Mẩu chuyện & Tấm gương' },
                { id: 'movement', label: 'Phong trào thi đua' },
                { id: 'document', label: 'Tài liệu & Học liệu' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết, câu chuyện..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Articles Grid & Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột Trái & Giữa: Danh sách bài viết chuyên đề (2 cột) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-700" />
                <span>Các bài viết &amp; Chuyên đề ({filteredArticles.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = campusFacadeImg;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {article.categoryLabel}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 line-clamp-2 leading-snug transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.publishedDate}
                    </span>
                    <span className="text-red-700 font-semibold group-hover:underline flex items-center gap-1">
                      Đọc chi tiết
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột Phải: Kho học liệu & Tư liệu tải về */}
          <div className="space-y-6">
            {/* Box 1: 5 Điều Bác Hồ Dạy */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-2xl border-2 border-amber-300 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-red-800 font-black text-sm uppercase">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>5 ĐIỀU BÁC HỒ DẠY</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                <li>Yêu Tổ quốc, yêu đồng bào</li>
                <li>Học tập tốt, lao động tốt</li>
                <li>Đoàn kết tốt, kỷ luật tốt</li>
                <li>Giữ gìn vệ sinh thật tốt</li>
                <li>Khiêm tốn, thật thà, dũng cảm</li>
              </ol>
            </div>

            {/* Box 2: Tài liệu học tập chuyên đề */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-red-700" />
                  <span>Tài liệu &amp; Đề cương học tập</span>
                </h3>
              </div>

              <div className="space-y-3">
                {STUDY_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-red-700 font-mono">
                        {doc.format} • {doc.size}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 group-hover:text-red-700 line-clamp-2 leading-snug">
                        {doc.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(doc.title, doc.format)}
                      className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Tải tài liệu về máy"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Video tài liệu tư liệu */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Video className="w-4 h-4 text-red-700" />
                <span>Phim tài liệu tư liệu</span>
              </h3>
              <div className="rounded-xl overflow-hidden relative aspect-video bg-slate-900 group cursor-pointer">
                <img
                  src={bannerHoChiMinhImg}
                  alt="Phim tài liệu Bác Hồ"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                    <Video className="w-5 h-5 ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Phim tài liệu: Hồ Chí Minh – Chân dung một con người vĩ đại
              </p>
              <p className="text-[11px] text-slate-500">
                Thời lượng: 28 phút • Tư liệu lưu trữ quốc gia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded">
              {selectedArticle.categoryLabel}
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {selectedArticle.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <span>Đăng ngày: {selectedArticle.publishedDate}</span>
              <span>•</span>
              <span>Tác giả: {selectedArticle.author}</span>
            </div>

            <div className="rounded-xl overflow-hidden max-h-72 w-full bg-slate-100">
              <img
                src={selectedArticle.thumbnail}
                alt={selectedArticle.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = campusFacadeImg;
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm font-semibold text-slate-700 leading-relaxed italic bg-red-50/60 p-3 rounded-lg border-l-4 border-red-600">
              {selectedArticle.excerpt}
            </p>

            <div className="text-sm text-slate-800 leading-relaxed space-y-3 whitespace-pre-wrap">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold hover:bg-red-800 transition-colors"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
