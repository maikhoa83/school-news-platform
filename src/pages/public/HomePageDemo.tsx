import React from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  BellRing,
  FileText,
  Calendar,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { defaultSchoolIdentity } from '../../config/schoolIdentity';

export function HomePageDemo() {
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Top Notification Banner: Step 02 Milestone */}
      <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>STEP 02 — CORE SHELL & RESPONSIVE:</strong> Khung giao diện đa nền tảng (Public Shell, Admin Shell, Auth Shell) đã sẵn sàng.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/foundation" className="underline font-semibold hover:text-amber-950">
              Xem QA Step 01
            </Link>
            <span>•</span>
            <Link to="/admin" className="underline font-semibold hover:text-amber-950">
              Vào Admin Shell
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Section */}
        <section
          aria-label="Khối chào mừng"
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-blue-800"
        >
          {/* Subtle background glow */}
          <div
            className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-700 text-amber-300 text-xs font-semibold">
              <GraduationCap className="h-4 w-4" />
              <span>NỀN TẢNG THÔNG TIN HỌC ĐƯỜNG CHUẨN MỰC</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Chào mừng đến với {defaultSchoolIdentity.school_name}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Cổng thông tin điện tử chính thức phục vụ quản trị, công khai hoạt động giáo dục, chỉ đạo điều hành và kết nối giữa nhà trường, giáo viên, học sinh và phụ huynh.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/news">
                <Button variant="accent" size="lg">
                  <Newspaper className="h-4 w-4 mr-2" />
                  Xem Tin tức & Hoạt động
                </Button>
              </Link>

              <Link to="/admin">
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Shield className="h-4 w-4 mr-2 text-amber-400" />
                  Khu vực Quản trị CMS
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Highlights Grid */}
        <section aria-label="Các phân hệ chính" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Chuyên mục & Hoạt động Nổi bật
              </h2>
              <p className="text-xs text-slate-500">
                Trình diễn khả năng tương thích của Public Shell với các khối nội dung học đường
              </p>
            </div>
            <Link
              to="/news"
              className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                  <Newspaper className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Tin tức & Sự kiện</CardTitle>
                <CardDescription>Hoạt động giáo dục và phong trào thi đua</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>Cập nhật liên tục các tin tức chuyên môn, lễ kỷ niệm và sinh hoạt ngoại khóa.</p>
                <Link to="/news" className="inline-flex items-center text-blue-700 font-medium hover:underline pt-1">
                  Đến trang tin tức <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <BellRing className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Thông báo Điều hành</CardTitle>
                <CardDescription>Chỉ đạo chính thức từ Ban Giám hiệu</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>Thông báo lịch thi, thời khóa biểu, công tác kiểm tra và thông tin phụ huynh.</p>
                <Link to="/news?cat=thong-bao" className="inline-flex items-center text-blue-700 font-medium hover:underline pt-1">
                  Xem thông báo mới <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Văn bản & Biểu mẫu</CardTitle>
                <CardDescription>Hồ sơ chỉ đạo và biểu mẫu giáo viên</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>Kho lưu trữ văn bản quy phạm, hướng dẫn chuyên môn và mẫu đơn trực tuyến.</p>
                <span className="text-[11px] text-slate-400 block pt-1">Sẵn sàng tích hợp Step 05</span>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-400 transition-colors">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">Hoạt động Đoàn - Đội</CardTitle>
                <CardDescription>Kỹ năng sống và văn thể mỹ</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>Các câu lạc bộ học thuật, hoạt động tình nguyện và các kỳ thi học sinh giỏi.</p>
                <span className="text-[11px] text-slate-400 block pt-1">Sẵn sàng tích hợp Step 05</span>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* School Overview Metrics Banner */}
        <section
          aria-label="Chỉ số giáo dục nhà trường"
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">45+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Lớp học các khối</div>
            </div>
            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">120+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Cán bộ & Giáo viên</div>
            </div>
            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-900">2.100+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Học sinh theo học</div>
            </div>
            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">30+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Năm truyền thống</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
