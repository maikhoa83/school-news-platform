import React from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  FileText,
  Bell,
  Image as ImageIcon,
  ChevronRight,
  Megaphone,
  Sparkles,
  Sliders,
  CalendarCheck,
  Palette,
} from 'lucide-react';
import campusFacadeImg from '../../assets/images/campus_facade.jpg';

export function AdminDashboardDemo() {
  const stats = [
    {
      label: 'Tin tức',
      count: '128',
      subtext: 'Tổng số tin',
      icon: Newspaper,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Văn bản',
      count: '56',
      subtext: 'Tổng số văn bản',
      icon: FileText,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Thông báo',
      count: '24',
      subtext: 'Tổng số thông báo',
      icon: Bell,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      label: 'Thư viện media',
      count: '342',
      subtext: 'Tổng số file',
      icon: ImageIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
  ];

  const recentNews = [
    {
      id: '1',
      title: 'Hội thi học sinh giỏi cấp Thành phố năm học 2023 - 2024',
      date: '22/05/2024 10:30',
      image: campusFacadeImg,
    },
    {
      id: '2',
      title: 'Lễ kỷ niệm 30 năm thành lập trường',
      date: '20/05/2024 09:15',
      image: campusFacadeImg,
    },
    {
      id: '3',
      title: 'Ngoại khóa: Thanh niên với văn hóa giao thông',
      date: '18/05/2024 14:20',
      image: campusFacadeImg,
    },
  ];

  const recentAnnouncements = [
    {
      id: '1',
      title: 'Thông báo nghỉ lễ 30/4 và 01/5',
      date: '22/04/2024',
      status: 'Đã đăng',
    },
    {
      id: '2',
      title: 'Thông báo về việc tổ chức thi học kỳ II năm học 2023 - 2024',
      date: '16/04/2024',
      status: 'Đã đăng',
    },
    {
      id: '3',
      title: 'Thông báo tuyển sinh lớp 10 năm học 2024 - 2025',
      date: '10/04/2024',
      status: 'Đã đăng',
    },
  ];

  // SVG Chart points for 7-day traffic
  const trafficData = [
    { day: '17/05', value: 2300 },
    { day: '18/05', value: 2800 },
    { day: '19/05', value: 1400 },
    { day: '20/05', value: 2400 },
    { day: '21/05', value: 1900 },
    { day: '22/05', value: 1400 },
    { day: '23/05', value: 2600 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title matching Mau quan tri và login.png */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Tổng quan
        </h1>
      </div>

      {/* 4 Stat Cards in 1 Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.bgColor} ${stat.borderColor}`}
                >
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight my-0.5">
                    {stat.count}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {stat.subtext}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts for School Customization */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-4 sm:p-5 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Thao tác nhanh Cấu hình &amp; Truyền thông</span>
            </h2>
            <p className="text-xs text-blue-100/80">
              Truy cập nhanh các tính năng tùy chỉnh thương hiệu, khẩu hiệu giáo dục và điều hành
            </p>
          </div>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-200 hover:text-white transition-colors"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Cấu hình Logo/Banner</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            to="/admin/homepage?tab=marquee"
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-semibold text-white group"
          >
            <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">Chữ chạy Header</div>
              <div className="text-[10px] text-blue-200 font-normal truncate">Chủ đề năm học</div>
            </div>
          </Link>

          <Link
            to="/admin/homepage?tab=slides"
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-semibold text-white group"
          >
            <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">Thông điệp giáo dục</div>
              <div className="text-[10px] text-blue-200 font-normal truncate">Slider ảnh &amp; khẩu hiệu</div>
            </div>
          </Link>

          <Link
            to="/admin/homepage"
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-semibold text-white group"
          >
            <div className="p-1.5 rounded-md bg-sky-500/20 text-sky-300 shrink-0 group-hover:scale-105 transition-transform">
              <Sliders className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">Bố cục Trang chủ</div>
              <div className="text-[10px] text-blue-200 font-normal truncate">Sắp xếp các khối 12 cột</div>
            </div>
          </Link>

          <Link
            to="/admin/announcements/new"
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-semibold text-white group"
          >
            <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate">Kế hoạch Tuần/Tháng</div>
              <div className="text-[10px] text-blue-200 font-normal truncate">Soạn lịch công tác</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Row 2: Traffic Line Chart + Recent News */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Traffic Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Thống kê truy cập (7 ngày qua)
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-0.5 bg-blue-600 rounded-full inline-block" />
              <span>Lượt truy cập</span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-56 pt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="24" textAnchor="end" fontSize="10" fill="#94a3b8">4,000</text>

              <line x1="40" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="64" textAnchor="end" fontSize="10" fill="#94a3b8">3,000</text>

              <line x1="40" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="104" textAnchor="end" fontSize="10" fill="#94a3b8">2,000</text>

              <line x1="40" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="144" textAnchor="end" fontSize="10" fill="#94a3b8">1,000</text>

              <line x1="40" y1="180" x2="490" y2="180" stroke="#e2e8f0" strokeWidth="1" />
              <text x="30" y="184" textAnchor="end" fontSize="10" fill="#94a3b8">0</text>

              {/* X-axis labels & points calculation:
                  Y-range: 0 is at y=180, 4000 is at y=20 (span 160 px, so 1 px = 25 units)
                  formula: y = 180 - (val / 4000 * 160)
                  17/05 (x=70): val=2300 => y=88
                  18/05 (x=140): val=2800 => y=68
                  19/05 (x=210): val=1400 => y=124
                  20/05 (x=280): val=2400 => y=84
                  21/05 (x=350): val=1900 => y=104
                  22/05 (x=420): val=1400 => y=124
                  23/05 (x=480): val=2600 => y=76
              */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="70,88 140,68 210,124 280,84 350,104 420,124 480,76"
              />

              {/* Data point dots */}
              {[
                { x: 70, y: 88, day: '17/05' },
                { x: 140, y: 68, day: '18/05' },
                { x: 210, y: 124, day: '19/05' },
                { x: 280, y: 84, day: '20/05' },
                { x: 350, y: 104, day: '21/05' },
                { x: 420, y: 124, day: '22/05' },
                { x: 480, y: 76, day: '23/05' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y="196" textAnchor="middle" fontSize="10" fill="#64748b">
                    {pt.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right Column (5 cols): Recent News */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Tin tức mới nhất
              </h2>
              <Link
                to="/admin/news"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentNews.map((item) => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-14 w-20 object-cover rounded-lg shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Announcements + Storage Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Recent Announcements Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Thông báo mới nhất
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-3 font-semibold">Tiêu đề</th>
                    <th className="pb-3 px-3 font-semibold whitespace-nowrap">Ngày đăng</th>
                    <th className="pb-3 text-right font-semibold whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAnnouncements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-2 text-slate-800 font-medium line-clamp-1 max-w-[280px]">
                        {item.title}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/admin/announcements"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Storage Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-4">
              Dung lượng lưu trữ
            </h2>

            {/* Donut Chart with Center Text */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background Track (63% empty) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  {/* Used Progress (37% of 251.2 circumference = ~93) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="12"
                    strokeDasharray="93 251.2"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text matching mockup */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                  <span className="text-[11px] text-slate-500 font-medium">Đã dùng</span>
                  <span className="text-sm font-bold text-slate-900">18.6 GB</span>
                  <span className="text-[10px] text-slate-400">(37%)</span>
                </div>
              </div>

              {/* Legend matching mockup */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
                  <span>Đã dùng: <strong>18.6 GB</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                  <span>Còn trống: <strong>31.4 GB</strong></span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  Tổng: 50 GB
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
