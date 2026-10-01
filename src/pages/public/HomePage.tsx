import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Megaphone,
  FileText,
  GraduationCap,
  Calendar,
  Grid,
  Search,
  Sparkles,
  Award,
  Film,
  Download,
} from 'lucide-react';
import campusFacadeImg from '../../assets/images/campus_facade.jpg';
import sloganBannerImg from '../../assets/images/slogan_banner.jpg';
import { EducationalMessageSlider } from '../../components/home/EducationalMessageSlider';

export function HomePage() {
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video' | 'doc'>('image');
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Lễ tổng kết năm học 2024 – 2025: Tự hào một chặng đường, vững bước tương lai',
      date: '29/05/2025',
      category: 'Hoạt động nhà trường',
      image: campusFacadeImg,
      link: '/news',
    },
    {
      title: 'Thầy và trò Trường THCS & THPT Vĩnh Phong thi đua Dạy tốt - Học tốt',
      date: '20/05/2025',
      category: 'Sự kiện trọng đại',
      image: '/education_slide_study.jpg',
      link: '/news',
    },
    {
      title: 'Hội thi giáo viên dạy giỏi cấp Tỉnh năm học 2024 – 2025',
      date: '15/05/2025',
      category: 'Thi đua dạy tốt',
      image: '/education_slide_growth.jpg',
      link: '/news',
    },
  ];

  const quickShortcuts = [
    {
      title: 'Tuyển sinh',
      desc: 'Thông tin tuyển sinh',
      icon: GraduationCap,
      href: '/admissions',
    },
    {
      title: 'Lịch công tác',
      desc: 'Lịch công tác tuần',
      icon: Calendar,
      href: '/announcements',
    },
    {
      title: 'Thời khóa biểu',
      desc: 'Xem thời khóa biểu',
      icon: Grid,
      href: '/documents',
    },
    {
      title: 'Tra cứu điểm',
      desc: 'Tra cứu kết quả học tập',
      icon: Search,
      href: '/documents',
    },
  ];

  const latestNews = [
    {
      id: '1',
      title: 'Lễ tổng kết năm học 2024 – 2025: Tự hào một chặng đường, vững bước tương lai',
      date: '29/05/2025',
      image: campusFacadeImg,
      href: '/news/le-tong-ket-nam-hoc-2024-2025',
    },
    {
      id: '2',
      title: 'Sinh hoạt chuyên môn cụm trường lần thứ II năm học 2024 – 2025',
      date: '27/05/2025',
      image: '/education_slide_study.jpg',
      href: '/news/2',
    },
    {
      id: '3',
      title: 'Đoàn trường tổ chức chương trình "Tiếp sức mùa thi 2025"',
      date: '26/05/2025',
      image: '/education_slide_growth.jpg',
      href: '/news/3',
    },
    {
      id: '4',
      title: 'Giáo viên nhà trường đạt danh hiệu Giáo viên giỏi cấp Tỉnh',
      date: '25/05/2025',
      image: sloganBannerImg,
      href: '/news/4',
    },
  ];

  const latestAnnouncements = [
    {
      id: '1',
      title: 'Thông báo về việc nghỉ lễ 30/4 và 01/5',
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
      title: 'Thông báo tuyển sinh vào lớp 6 và lớp 10 năm học mới',
      date: '10/04/2025',
      href: '/announcements',
    },
    {
      id: '4',
      title: 'Thông báo về việc triển khai học bổng khuyến học cho học sinh vượt khó',
      date: '05/04/2025',
      href: '/announcements',
    },
  ];

  const spotlightSideNews = [
    {
      title: 'Sinh hoạt chuyên môn cụm trường lần thứ II năm học 2024 – 2025',
      date: '27/05/2025',
      image: '/education_slide_study.jpg',
    },
    {
      title: 'Đoàn trường tổ chức chương trình "Tiếp sức mùa thi 2025"',
      date: '26/05/2025',
      image: '/education_slide_growth.jpg',
    },
    {
      title: 'Giáo viên nhà trường đạt danh hiệu Giáo viên giỏi cấp Tỉnh',
      date: '25/05/2025',
      image: sloganBannerImg,
    },
    {
      title: 'Học sinh tham gia hội thi Khoa học Kỹ thuật và Tin học trẻ',
      date: '24/05/2025',
      image: campusFacadeImg,
    },
  ];

  const mediaAlbums = [
    {
      title: 'Lễ chào cờ đầu tuần và phát động phong trào Dạy tốt - Học tốt',
      image: campusFacadeImg,
    },
    {
      title: 'Hoạt động trải nghiệm sáng tạo và giáo dục kỹ năng sống',
      image: '/education_slide_study.jpg',
    },
    {
      title: 'Hội khỏe Phù Đổng cấp trường năm học 2024 – 2025',
      image: '/education_slide_growth.jpg',
    },
    {
      title: 'Lễ tri ân và trưởng thành của học sinh khối 12',
      image: sloganBannerImg,
    },
  ];

  const newDocuments = [
    {
      title: 'Kế hoạch tổ chức ôn thi Tốt nghiệp THPT và chuyển cấp năm 2025',
      size: '1.2 MB',
      date: '28/05/2025',
    },
    {
      title: 'Hướng dẫn công tác coi thi và chấm thi học kỳ II',
      size: '850 KB',
      date: '20/05/2025',
    },
    {
      title: 'Thông báo lịch trực hè và phân công nhiệm vụ cán bộ quản lý',
      size: '420 KB',
      date: '15/05/2025',
    },
    {
      title: 'Quyết định ban hành Quy chế chi tiêu nội bộ năm tài chính 2025',
      size: '2.1 MB',
      date: '10/05/2025',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. HERO CAROUSEL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-2xl overflow-hidden shadow-md h-72 sm:h-96 md:h-[460px] bg-slate-900 group">
          {/* Slide Image */}
          <img
            src={heroSlides[activeSlide].image}
            alt={heroSlides[activeSlide].title}
            className="w-full h-full object-cover transition-transform duration-700"
          />

          {/* Dark Overlay Gradient for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() =>
              setActiveSlide((prev) =>
                prev === 0 ? heroSlides.length - 1 : prev - 1
              )
            }
            aria-label="Slide trước"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveSlide((prev) =>
                prev === heroSlides.length - 1 ? 0 : prev + 1
              )
            }
            aria-label="Slide tiếp theo"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Overlay Card matching school branding (Bottom Left) */}
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xl bg-black/70 backdrop-blur-md p-5 rounded-xl border border-white/15 text-white space-y-3 z-10">
            <span className="inline-block px-2.5 py-0.5 rounded-sm bg-[#0052CC] text-white text-[11px] font-bold uppercase tracking-wider">
              TIN TỨC NỔI BẬT
            </span>
            <h2 className="text-base sm:text-xl font-bold leading-snug line-clamp-2 text-white">
              {heroSlides[activeSlide].title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Clock className="h-3.5 w-3.5 text-amber-300" />
              <span>{heroSlides[activeSlide].date}</span>
              <span>•</span>
              <span>{heroSlides[activeSlide].category}</span>
            </div>
            <div>
              <Link
                to={heroSlides[activeSlide].link}
                className="inline-block bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-bold px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                aria-label={`Chuyển đến slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === i ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. FOUR QUICK SHORTCUT CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickShortcuts.map((sc, idx) => {
            const Icon = sc.icon;
            return (
              <Link
                key={idx}
                to={sc.href}
                className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex items-center gap-3.5 group"
              >
                <div className="h-11 w-11 rounded-lg bg-blue-50 text-[#003B8E] group-hover:bg-[#003B8E] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#003B8E] transition-colors">
                    {sc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sc.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. LATEST NEWS (8 Cols) & ANNOUNCEMENTS (4 Cols) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tin tức mới nhất (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header with primary color background */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  TIN TỨC MỚI NHẤT
                </h2>
              </div>
              <Link
                to="/news"
                className="text-xs text-amber-300 hover:text-white font-semibold inline-flex items-center gap-0.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestNews.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-400 transition-all group flex flex-col"
                >
                  <div className="h-32 w-full overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <span className="text-[11px] text-slate-400">
                      {item.date}
                    </span>
                    {/* H3 increased by ~15-20% */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#003B8E] transition-colors line-clamp-3 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Thông báo mới (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Header with primary color background */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  THÔNG BÁO MỚI
                </h2>
              </div>
              <Link
                to="/announcements"
                className="text-xs text-amber-300 hover:text-white font-semibold inline-flex items-center gap-0.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-4 divide-y divide-slate-100 shadow-2xs space-y-3">
              {latestAnnouncements.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="pt-3 first:pt-0 flex items-start gap-3 group block"
                >
                  <Megaphone className="h-4 w-4 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    {/* H3 increased by ~15-20% */}
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] transition-colors line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {item.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. TIÊU ĐIỂM (6 Cols) & HOẠT ĐỘNG NỔI BẬT (6 Cols) WITH DISTINCT FRAMED CONTAINERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột Trái: TIÊU ĐIỂM (6 cols) - Framed Container */}
          <div className="lg:col-span-6 space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-blue-900/15 bg-slate-50/40 shadow-xs">
            {/* Header bar: Primary color background + Icon before H2 */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  TIÊU ĐIỂM
                </h2>
              </div>
              <Link
                to="/news"
                className="text-xs text-amber-300 hover:text-white font-semibold inline-flex items-center gap-0.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Left Sub-col: Big Spotlight Article */}
              <div className="sm:col-span-7 space-y-2.5">
                <div className="relative rounded-lg overflow-hidden h-44 bg-slate-100">
                  <img
                    src={campusFacadeImg}
                    alt="Tiêu điểm"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#0052CC] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase shadow-xs">
                    NỔI BẬT
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>29/05/2025</span>
                </div>
                {/* H3 increased by ~15-20% */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  Lễ tổng kết năm học 2024 – 2025: Tự hào một chặng đường, vững bước tương lai
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  Sáng ngày 29/05/2025, Trường THCS &amp; THPT Vĩnh Phong đã long trọng tổ chức Lễ tổng kết năm học 2024 – 2025. Buổi lễ là dịp để thầy và trò cùng nhìn lại một năm học với nhiều nỗ lực, thành tích đáng tự hào...
                </p>
                <div>
                  <Link
                    to="/news"
                    className="inline-block bg-[#003B8E] hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors shadow-xs"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              {/* Right Sub-col: compact news items */}
              <div className="sm:col-span-5 space-y-3 divide-y divide-slate-100">
                {spotlightSideNews.map((item, idx) => (
                  <div key={idx} className="pt-2.5 first:pt-0 flex items-start gap-2.5 group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-14 w-16 object-cover rounded-md shrink-0 bg-slate-100 border border-slate-200"
                    />
                    <div className="min-w-0">
                      {/* H3/H4 increased font size */}
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Phải: HOẠT ĐỘNG NỔI BẬT (6 cols) - Framed Container */}
          <div className="lg:col-span-6 space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-blue-900/15 bg-slate-50/40 shadow-xs">
            {/* Header bar: Primary color background + Icon before H2 */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  HOẠT ĐỘNG NỔI BẬT
                </h2>
              </div>
              <Link
                to="/activities"
                className="text-xs text-amber-300 hover:text-white font-semibold inline-flex items-center gap-0.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              {/* Featured Activity Image */}
              <div className="relative rounded-lg overflow-hidden h-48 bg-slate-100">
                <img
                  src="/education_slide_study.jpg"
                  alt="Hoạt động nổi bật"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-[#0052CC] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase shadow-xs">
                  NỔI BẬT
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>24/05/2025</span>
                </div>
                {/* H3 increased by ~15-20% */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  Hội thi chuyên môn và sinh hoạt văn nghệ chào mừng ngày truyền thống nhà trường
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  Phong trào thi đua là sân chơi bổ ích, tạo cơ hội để học sinh thể hiện tài năng, nuôi dưỡng niềm đam mê nghệ thuật và tăng cường sự đoàn kết, gắn bó trong toàn trường.
                </p>
              </div>

              {/* 4 Bottom Gallery Thumbnails */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[campusFacadeImg, '/education_slide_growth.jpg', '/education_slide_study.jpg', sloganBannerImg].map(
                  (thumb, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-md overflow-hidden border border-slate-200"
                    >
                      <img
                        src={thumb}
                        alt="Hình ảnh hoạt động"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THƯ VIỆN MEDIA (6 Cols) & VĂN BẢN MỚI (6 Cols) WITH DISTINCT FRAMED CONTAINERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột Trái: THƯ VIỆN MEDIA - Framed Container */}
          <div className="lg:col-span-6 space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-blue-900/15 bg-slate-50/40 shadow-xs">
            {/* Header bar: Primary color background + Icon before H2 */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  THƯ VIỆN MEDIA
                </h2>
              </div>
              <Link
                to="/albums"
                className="text-xs text-amber-300 hover:text-white font-semibold inline-flex items-center gap-0.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
              {/* Media Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('image')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeMediaTab === 'image'
                      ? 'bg-[#003B8E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Hình ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeMediaTab === 'video'
                      ? 'bg-[#003B8E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('doc')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeMediaTab === 'doc'
                      ? 'bg-[#003B8E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tài liệu
                </button>
              </div>

              {/* 4 Album Cards Carousel Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                {mediaAlbums.map((album, idx) => (
                  <div
                    key={idx}
                    className="group cursor-pointer space-y-1.5 text-center"
                  >
                    <div className="h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={album.image}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* H3/P font size */}
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                      {album.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Phải: VĂN BẢN MỚI - Framed Container */}
          <div className="lg:col-span-6 space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-blue-900/15 bg-slate-50/40 shadow-xs">
            {/* Header bar: Primary color background + Icon before H2 */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  VĂN BẢN MỚI
                </h2>
              </div>
              <Link
                to="/documents"
                className="text-xs text-amber-300 hover:text-white font-semibold inline-flex items-center gap-0.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {newDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* H3/H4 increased by ~15-20% */}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                          {doc.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded-xs bg-red-100 text-red-700 font-bold font-mono flex items-center gap-1">
                        <Download className="w-2.5 h-2.5" />
                        PDF {doc.size}
                      </span>
                      <span className="text-slate-400">{doc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MỤC THÔNG ĐIỆP GIÁO DỤC: BỐ TRÍ DẠNG SLIDE VỚI CHIỀU CAO THẤP GỌN 50-60% */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <EducationalMessageSlider />
      </section>
    </div>
  );
}
