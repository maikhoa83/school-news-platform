import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  Calendar,
  Home,
  Camera,
  Film,
  FileText,
  Download,
  GraduationCap,
  Grid,
  Search,
  Flame,
  Bell,
  Star,
} from 'lucide-react';
import { NewsMarqueeTicker } from '../../components/home/NewsMarqueeTicker';
import { NewsImageSlider } from '../../components/home/NewsImageSlider';
import { EducationalMessageSlider } from '../../components/home/EducationalMessageSlider';
import { INITIAL_PUBLISHED_NEWS } from '../../data/seedNewsData';
import { INITIAL_SEED_VIDEOS, INITIAL_SEED_DOCS } from '../../data/seedMediaData';
import { NewsItem } from '../../types/news';
import { getPublishedNews } from '../../services/newsService';
import campusFacadeImg from '../../assets/images/campus_facade.jpg';
import bannerHoChiMinhImg from '../../assets/images/banner_ho_chi_minh.jpg';

export function HomePage() {
  const [activeMainTab, setActiveMainTab] = useState<'tieudiem' | 'noibat' | 'thongbao'>('tieudiem');
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video' | 'doc'>('image');
  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_PUBLISHED_NEWS);

  useEffect(() => {
    getPublishedNews({ limit: 20 })
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          setNewsList(res.items);
        }
      })
      .catch((err) => {
        console.warn('[HomePage] Using initial news fallback:', err);
      });
  }, []);

  // Quick Shortcuts (Giữ nguyên các tiện ích)
  const quickShortcuts = [
    {
      title: 'Tuyển sinh',
      desc: 'Thông tin tuyển sinh',
      icon: GraduationCap,
      href: '/news?cat=tuyen-sinh-dau-cap',
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

  // 1. Data for Block 1: TIN TỨC MỚI NHẤT
  // Main Big Featured post (Lễ tổng kết)
  const mainFeaturedPost =
    newsList.find((n) => n.slug === 'le-tong-ket-nam-hoc-2024-2025') || newsList[0];

  // Tab 1: Tin Tiêu điểm (5 bài)
  const tieuDiemItems = newsList
    .filter((n) => n.is_featured)
    .slice(0, 5);

  // Tab 2: Tin Nổi bật (5 bài)
  const noiBatItems = newsList
    .filter((n) => n.is_highlight || n.is_featured)
    .slice(0, 5);

  // Tab 3: Thông báo mới (5 bài)
  const announcementsList = [
    {
      id: 'tb-1',
      title: 'Thông báo về việc nghỉ lễ 30/4 và 01/5 năm học 2024 – 2025',
      date: '22/04/2025',
      href: '/announcements',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'tb-2',
      title: 'Thông báo tổ chức thi học kỳ II năm học 2024 – 2025',
      date: '16/04/2025',
      href: '/announcements',
      thumbnail: '/education_slide_study.jpg',
    },
    {
      id: 'tb-3',
      title: 'Thông báo tuyển sinh vào lớp 6 và lớp 10 năm học mới',
      date: '10/04/2025',
      href: '/announcements',
      thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'tb-4',
      title: 'Thông báo triển khai học bổng khuyến học cho học sinh vượt khó',
      date: '05/04/2025',
      href: '/announcements',
      thumbnail: '/education_slide_growth.jpg',
    },
    {
      id: 'tb-5',
      title: 'Lịch sinh hoạt Chi bộ và Hội đồng sư phạm tháng 05/2025',
      date: '02/05/2025',
      href: '/announcements',
      thumbnail: '/campus_facade.jpg',
    },
  ];

  // 2. Data for Block 2 Left: HOẠT ĐỘNG NHÀ TRƯỜNG
  // Big Activity Post (Sinh hoạt chuyên môn cụm trường)
  const activityBigPost =
    newsList.find((n) => n.slug === 'sinh-hoat-chuyen-mon-cum-truong-lan-thu-ii-nam-hoc-2024-2025') ||
    newsList[0];

  // 5 Activity items on the right side of Hoạt động nhà trường
  const activitySideItems = [
    {
      title: 'Đoàn trường tổ chức chương trình "Tiếp sức mùa thi 2025"',
      date: '26/05/2025',
      slug: 'doan-truong-to-chuc-chuong-trinh-tiep-suc-mua-thi-2025',
      thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Giáo viên nhà trường đạt danh hiệu Giáo viên giỏi cấp Tỉnh',
      date: '10/04/2025',
      slug: 'giao-vien-nha-truong-dat-danh-hieu-giao-vien-gioi-cap-tinh',
      thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Thông báo tuyển sinh vào lớp 6 và lớp 10 năm học mới',
      date: '10/04/2025',
      slug: 'thong-bao-tuyen-sinh-vao-lop-6-va-lop-10-nam-hoc-moi',
      thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Học sinh tham gia hội thi Khoa học Kỹ thuật và đạt giải Nhì cấp Tỉnh',
      date: '24/05/2025',
      slug: 'hoc-sinh-tham-gia-hoi-thi-khoa-hoc-ky-thuat',
      thumbnail: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Trường tổ chức giao lưu thể thao chào mừng ngày 30/4 – 1/5',
      date: '28/04/2025',
      slug: 'truong-to-chuc-giao-luu-the-thao-chao-mung-ngay-30-4-1-5',
      thumbnail: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=300&auto=format&fit=crop&q=80',
    },
  ];

  // 3. Data for Block 2 Right: TRUYỀN THÔNG
  // Top Big Media Post (Hội thi chuyên môn và sinh hoạt văn nghệ)
  const mediaBigPost = {
    title: 'Hội thi chuyên môn và sinh hoạt văn nghệ chào mừng ngày truyền thống nhà trường',
    slug: 'hoi-thi-chuyen-mon-va-sinh-hoat-van-nghe-chao-mung-ngay-truyen-thong-nha-truong',
    date: '24/05/2025',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80',
    excerpt:
      'Phong trào thi đua là sân chơi bổ ích, tạo cơ hội để học sinh thể hiện tài năng, nuôi dưỡng niềm đam mê nghệ thuật và tăng cường sự đoàn kết, gắn bó trong toàn trường.',
  };

  // 4 Bottom Image Cards for TRUYỀN THÔNG (Matching Bo tri tin chuan_OK.png)
  const mediaFourCards = [
    {
      title: 'Ngày hội đọc sách và văn hóa học đường',
      image: '/education_slide_study.jpg',
      link: '/news?cat=truyen-thong',
    },
    {
      title: 'Giải bóng đá học sinh khối 10',
      image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=500&auto=format&fit=crop&q=80',
      link: '/news?cat=truyen-thong',
    },
    {
      title: 'Tham quan trải nghiệm di tích lịch sử',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
      link: '/news?cat=truyen-thong',
    },
    {
      title: 'Chương trình "Vì môi trường xanh"',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=80',
      link: '/news?cat=truyen-thong',
    },
  ];

  // 4. Data for Block 3: THƯ VIỆN MEDIA & VĂN BẢN MỚI
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
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const newDocuments = [
    {
      title: 'Kế hoạch tổ chức ôn thi Tốt nghiệp THPT và chuyển cấp năm 2025',
      size: '1.2 MB',
      date: '28/05/2025',
    },
    {
      title: 'Hướng dẫn công tác coi thi và chấm thi học kỳ II năm học 2024 – 2025',
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
    <div className="space-y-6 sm:space-y-8 pb-16 bg-slate-50/50">
      {/* 1. DÒNG CHỮ CHẠY NGANG: CHỦ ĐỀ NĂM HỌC / THÁNG (Bố trí giữa Menu ngang và Slider tin) */}
      <NewsMarqueeTicker />

      {/* 2. SLIDER ẢNH TIN TỨC (BÊN TRÊN GẦN MENU NGANG) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsImageSlider />
      </section>

      {/* 3. BỐN PHÍM TẮT TRUY CẬP NHANH (QUICK SHORTCUTS) */}
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
                  <p className="text-xs text-slate-500 mt-0.5">{sc.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. KHỐI 1: ⭐ TIN TỨC MỚI NHẤT (CHUẨN THEO Bo tri tin chuan_OK.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#002b66] via-[#003B8E] to-[#0284c7] text-white px-5 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <Star className="h-5 w-5 text-amber-300 fill-amber-300" />
              <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                TIN TỨC MỚI NHẤT
              </h2>
            </div>
            <Link
              to="/news"
              className="text-xs text-amber-300 hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Body Content: Split 50% - 50% */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột Trái: 1 Tin lớn nổi bật */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-3.5">
              <div className="relative rounded-xl overflow-hidden h-60 sm:h-72 w-full bg-slate-100 group">
                <img
                  src={mainFeaturedPost.thumbnail || campusFacadeImg}
                  alt={mainFeaturedPost.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = campusFacadeImg;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#0052CC] text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                  TIN NỔI BẬT
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {mainFeaturedPost.published_at
                    ? new Date(mainFeaturedPost.published_at).toLocaleDateString('vi-VN')
                    : '29/05/2025'}
                </span>
              </div>

              <Link
                to={`/news/${mainFeaturedPost.slug}`}
                className="group block"
              >
                <h3 className="text-base sm:text-xl font-bold text-slate-900 group-hover:text-[#003B8E] leading-snug line-clamp-2 transition-colors">
                  {mainFeaturedPost.title}
                </h3>
              </Link>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {mainFeaturedPost.excerpt}
              </p>

              <div>
                <Link
                  to={`/news/${mainFeaturedPost.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#003B8E] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Cột Phải: Card với 3 Tab (Tin Tiêu điểm, Tin nổi bật, Thông báo) */}
            <div className="lg:col-span-6 flex flex-col bg-slate-50/70 rounded-xl border border-slate-200 overflow-hidden">
              {/* Tabs Switcher Header */}
              <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveMainTab('tieudiem')}
                  className={`py-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeMainTab === 'tieudiem'
                      ? 'bg-[#003B8E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Star className="h-3.5 w-3.5 text-amber-300" />
                  <span>Tin Tiêu điểm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMainTab('noibat')}
                  className={`py-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeMainTab === 'noibat'
                      ? 'bg-[#003B8E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>Tin nổi bật</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMainTab('thongbao')}
                  className={`py-3 px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeMainTab === 'thongbao'
                      ? 'bg-[#003B8E] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5 text-red-400" />
                  <span>Thông báo</span>
                </button>
              </div>

              {/* Tab Content List (5 items) */}
              <div className="p-3 sm:p-4 divide-y divide-slate-100 flex-1 flex flex-col justify-between">
                {activeMainTab === 'tieudiem' &&
                  tieuDiemItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/news/${item.slug}`}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:bg-white px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.thumbnail || campusFacadeImg}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = campusFacadeImg;
                          }}
                          className="h-13 w-18 object-cover rounded-lg shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.published_at
                              ? new Date(item.published_at).toLocaleDateString('vi-VN')
                              : '29/05/2025'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#003B8E] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}

                {activeMainTab === 'noibat' &&
                  noiBatItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/news/${item.slug}`}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:bg-white px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.thumbnail || campusFacadeImg}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = campusFacadeImg;
                          }}
                          className="h-13 w-18 object-cover rounded-lg shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.published_at
                              ? new Date(item.published_at).toLocaleDateString('vi-VN')
                              : '27/05/2025'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#003B8E] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}

                {activeMainTab === 'thongbao' &&
                  announcementsList.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:bg-white px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.thumbnail || campusFacadeImg}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = campusFacadeImg;
                          }}
                          className="h-13 w-18 object-cover rounded-lg shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#003B8E] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. BANNER CHUYÊN ĐỀ ĐẶC BIỆT: HỌC TẬP VÀ LÀM THEO TƯ TƯỞNG, ĐẠO ĐỨC, PHONG CÁCH HỒ CHÍ MINH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/chuyen-de/hoc-tap-va-lam-theo-bac"
          className="group relative block rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-md hover:shadow-xl transition-all duration-300"
        >
          {/* Background image & deep crimson gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B0000] via-[#A80000] to-[#7B0000]">
            <img
              src={bannerHoChiMinhImg}
              alt="Học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh"
              className="w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="relative px-5 py-4 sm:py-5 sm:px-7 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-red-950 font-black text-[11px] uppercase tracking-wider shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>CHUYÊN ĐỀ ĐẶC BIỆT</span>
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-black text-amber-200 tracking-tight leading-snug drop-shadow-xs uppercase">
                HỌC TẬP VÀ LÀM THEO TƯ TƯỞNG, ĐẠO ĐỨC, PHONG CÁCH HỒ CHÍ MINH
              </h2>
              <p className="text-xs sm:text-sm text-red-100 max-w-2xl font-medium">
                Tuổi trẻ Trường THCS &amp; THPT Vĩnh Phong rèn đức, luyện tài, học tập và noi gương Bác Hồ vĩ đại
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-extrabold text-xs sm:text-sm shadow-md group-hover:scale-105 transition-all">
                <span>Khám phá Chuyên đề &amp; Bài viết</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* 5. KHỐI 2: 2 CỘT SONG SONG 50% - 50% (HOẠT ĐỘNG NHÀ TRƯỜNG & TRUYỀN THÔNG) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CỘT TRÁI: 🏠 HOẠT ĐỘNG NHÀ TRƯỜNG */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Home className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                  HOẠT ĐỘNG NHÀ TRƯỜNG
                </h2>
              </div>
              <Link
                to="/news?cat=hoat-dong-nha-truong"
                className="text-xs text-amber-300 hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Inner Split: 50% Nửa Trái + 50% Nửa Phải */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
              {/* Nửa Trái: 1 Tin Nổi Bật Lớn */}
              <div className="flex flex-col justify-between space-y-3">
                <div className="relative rounded-xl overflow-hidden h-44 w-full bg-slate-100 group">
                  <img
                    src={activityBigPost.thumbnail || '/education_slide_study.jpg'}
                    alt={activityBigPost.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = campusFacadeImg;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-[#0052CC] text-white text-[10px] font-black px-2.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">
                    NỔI BẬT
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>29/05/2025</span>
                </div>

                <Link
                  to={`/news/${activityBigPost.slug}`}
                  className="group block"
                >
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#003B8E] leading-snug line-clamp-2 transition-colors">
                    {activityBigPost.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {activityBigPost.excerpt}
                </p>

                <div>
                  <Link
                    to={`/news/${activityBigPost.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#003B8E] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Xem chi tiết</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Nửa Phải: Danh sách 5 tin hoạt động nhỏ */}
              <div className="divide-y divide-slate-100 flex flex-col justify-between">
                {activitySideItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/news/${item.slug}`}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5 group hover:bg-slate-50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = campusFacadeImg;
                        }}
                        className="h-12 w-16 object-cover rounded-lg shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-snug transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#003B8E] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: 📷 TRUYỀN THÔNG */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                  TRUYỀN THÔNG
                </h2>
              </div>
              <Link
                to="/news?cat=truyen-thong"
                className="text-xs text-amber-300 hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              {/* Phần Trên: 1 Bài truyền thông lớn toàn chiều ngang */}
              <div className="space-y-2.5">
                <Link
                  to={`/news/${mediaBigPost.slug}`}
                  className="block relative rounded-xl overflow-hidden h-48 sm:h-52 w-full bg-slate-100 group"
                >
                  <img
                    src={mediaBigPost.image}
                    alt={mediaBigPost.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = campusFacadeImg;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{mediaBigPost.date}</span>
                </div>

                <Link
                  to={`/news/${mediaBigPost.slug}`}
                  className="group block"
                >
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#003B8E] leading-snug line-clamp-2 transition-colors">
                    {mediaBigPost.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {mediaBigPost.excerpt}
                </p>
              </div>

              {/* Phần Dưới: Lưới 4 ảnh hoạt động (Matching Bo tri tin chuan_OK.png) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
                {mediaFourCards.map((card, idx) => (
                  <Link
                    key={idx}
                    to={card.link}
                    className="group space-y-1.5 block text-center"
                  >
                    <div className="h-18 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={card.image}
                        alt={card.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = campusFacadeImg;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-[11px] font-semibold text-slate-700 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                      {card.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. KHỐI 3: THƯ VIỆN MEDIA & VĂN BẢN MỚI (GIỮ NGUYÊN NHƯ HIỆN TRẠNG) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột Trái: THƯ VIỆN MEDIA (6 cols) */}
          <div className="lg:col-span-6 space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-blue-900/15 bg-slate-50/40 shadow-xs">
            {/* Header Bar */}
            <div className="bg-gradient-to-r from-[#002b66] to-[#003B8E] text-white px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  THƯ VIỆN MEDIA
                </h2>
              </div>
              <Link
                to="/media"
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
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
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
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
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
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeMediaTab === 'doc'
                      ? 'bg-[#003B8E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tài liệu
                </button>
              </div>

              {/* Media Cards Grid depending on activeMediaTab */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                {activeMediaTab === 'image' &&
                  mediaAlbums.map((album, idx) => (
                    <Link
                      key={idx}
                      to="/media"
                      className="group space-y-1.5 text-center block"
                    >
                      <div className="h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={album.image}
                          alt={album.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = campusFacadeImg;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                        {album.title}
                      </h3>
                    </Link>
                  ))}

                {activeMediaTab === 'video' &&
                  INITIAL_SEED_VIDEOS.map((video) => (
                    <Link
                      key={video.id}
                      to="/media"
                      className="group space-y-1.5 text-center block"
                    >
                      <div className="h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = campusFacadeImg;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <Film className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                        {video.title}
                      </h3>
                    </Link>
                  ))}

                {activeMediaTab === 'doc' &&
                  INITIAL_SEED_DOCS.map((doc) => (
                    <Link
                      key={doc.id}
                      to="/media"
                      className="group p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 transition-all text-left flex flex-col justify-between h-28 block"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-red-600 font-mono">
                          {doc.fileFormat} • {doc.fileSize}
                        </span>
                        <h3 className="text-[11px] font-semibold text-slate-800 group-hover:text-[#003B8E] line-clamp-2 leading-tight transition-colors">
                          {doc.title}
                        </h3>
                      </div>
                      <span className="text-[10px] text-blue-700 font-bold flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Tải học liệu
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          {/* Cột Phải: VĂN BẢN MỚI (6 cols) */}
          <div className="lg:col-span-6 space-y-3 p-4 sm:p-5 rounded-2xl border-2 border-blue-900/15 bg-slate-50/40 shadow-xs">
            {/* Header Bar */}
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
                  <Link
                    key={idx}
                    to="/documents"
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all space-y-2 group shadow-2xs block"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="h-9 w-9 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
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
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SLIDER THÔNG ĐIỆP GIÁO DỤC & PHƯƠNG CHÂM (BÊN DƯỚI GẦN FOOTER, KHÓA CỠ KHUNG CHUẨN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <EducationalMessageSlider />
      </section>
    </div>
  );
}
