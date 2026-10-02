import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  Eye,
  Tag,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Sample demonstration news items for Step 02 Public Shell layout preview
const DEMO_NEWS_ITEMS = [
  {
    id: 'demo-1',
    title: 'Khai mạc Hội khỏe Phù Đổng cấp trường năm học 2025 - 2026',
    summary: 'Sáng nay, nhà trường đã long trọng tổ chức lễ khai mạc Hội khỏe Phù Đổng với sự tham gia của hơn 1.200 vận động viên học sinh ở các bộ môn thi đấu.',
    category: 'Hoạt động học đường',
    date: '02/09/2026',
    views: 450,
    isFeatured: true,
  },
  {
    id: 'demo-2',
    title: 'Thông báo về việc tổ chức kiểm tra định kỳ Giữa Học kỳ II',
    summary: 'Ban Giám hiệu nhà trường ban hành kế hoạch và lịch kiểm tra giữa học kỳ dành cho các khối lớp 10, 11 và 12, đề nghị các tổ chuyên môn thực hiện nghiêm túc.',
    category: 'Thông báo điều hành',
    date: '28/08/2026',
    views: 890,
    isFeatured: false,
  },
  {
    id: 'demo-3',
    title: 'Tuyên dương 15 học sinh đạt giải cao trong Kỳ thi Học sinh Giỏi cấp Tỉnh',
    summary: 'Nhiệt liệt biểu dương thành tích xuất sắc của đội tuyển học sinh giỏi các môn Toán, Vật lý, Ngữ văn và Tiếng Anh trong kỳ thi vừa qua.',
    category: 'Thành tích & Khen thưởng',
    date: '25/08/2026',
    views: 620,
    isFeatured: false,
  },
  {
    id: 'demo-4',
    title: 'Tập huấn Chuyển đổi số và ứng dụng CNTT trong công tác giảng dạy',
    summary: 'Hội đồng sư phạm nhà trường đã tham gia buổi tập huấn nâng cao năng lực ứng dụng học liệu số và công nghệ bài giảng điện tử.',
    category: 'Chuyên môn sư phạm',
    date: '20/08/2026',
    views: 310,
    isFeatured: false,
  },
];

export function NewsPageDemo() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'Tất cả chuyên mục' },
    { key: 'hoat-dong', label: 'Hoạt động học đường' },
    { key: 'thong-bao', label: 'Thông báo điều hành' },
    { key: 'khen-thuong', label: 'Thành tích & Khen thưởng' },
    { key: 'chuyen-mon', label: 'Chuyên môn sư phạm' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
              <Newspaper className="h-4 w-4" />
              <span>CỔNG TIN TỨC & TRUYỀN THÔNG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tin tức & Sự kiện Nhà trường
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Trình diễn khung bố cục (Shell) danh sách bài viết học đường trên Public Shell.
            </p>
          </div>

          <Badge variant="primary" className="text-xs py-1 px-2.5">
            STEP 02 SHELL DEMO
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search form */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="search"
            placeholder="Tìm theo tiêu đề..."
            aria-label="Lọc tin tức"
            className="w-full text-xs rounded-lg pl-8 pr-3 py-2 border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 text-slate-900 transition-colors"
          />
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* News Grid Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_NEWS_ITEMS.map((item) => (
          <Card key={item.id} className="flex flex-col hover:border-blue-400 transition-all shadow-xs hover:shadow-md">
            {/* Thumbnail Placeholder */}
            <div className="relative h-44 bg-gradient-to-br from-blue-900/10 to-slate-200 flex items-center justify-center border-b border-slate-100 overflow-hidden">
              <Newspaper className="h-10 w-10 text-slate-400" />
              {item.isFeatured && (
                <div className="absolute top-2 left-2">
                  <Badge variant="accent" className="bg-amber-500 text-slate-950 text-[10px] font-bold">
                    Tiêu điểm
                  </Badge>
                </div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{item.date}</span>
              </div>
            </div>

            <CardContent className="flex-1 p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                    <Eye className="h-3 w-3" />
                    {item.views}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-blue-800 transition-colors cursor-pointer">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Bản tin mẫu</span>
                <span className="text-blue-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                  Xem chi tiết <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roadmap Boundary Notice Box */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">Quy định Ranh giới Phân kỳ (Step 02 Scope):</div>
          <p>
            Đây là giao diện trình diễn khung hiển thị bài viết (Public Content Shell). Chức năng Quản lý bài viết (CRUD News), Bộ soạn thảo tin bài (Rich Text Editor), Phân loại chuyên mục và Tải ảnh đa phương tiện sẽ được tích hợp tại <strong>STEP 05 (News & Media Module)</strong> theo đúng Roadmap v1.2.
          </p>
        </div>
      </div>
    </div>
  );
}
