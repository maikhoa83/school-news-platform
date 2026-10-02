import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, ArrowLeft, Layers, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function GenericPageDemo() {
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes('about')) {
      return {
        title: 'Giới thiệu Nhà trường & Cơ cấu Tổ chức',
        desc: 'Thông tin lịch sử hình thành, ban giám hiệu, các tổ chuyên môn và truyền thống dạy tốt học tốt.',
        module: 'Module Giới thiệu (Step 05)',
      };
    }
    if (path.includes('documents')) {
      return {
        title: 'Văn bản Chỉ đạo & Biểu mẫu Hành chính',
        desc: 'Hệ thống văn bản công khai, quy định chuyên môn và biểu mẫu hồ sơ dành cho giáo viên và học sinh.',
        module: 'Module Văn bản (Step 05)',
      };
    }
    if (path.includes('activities')) {
      return {
        title: 'Hoạt động Đoàn - Đội & Phong trào Thanh niên',
        desc: 'Các hoạt động ngoại khóa, kỹ năng sống, câu lạc bộ học thuật và sinh hoạt đoàn viên.',
        module: 'Module Hoạt động (Step 05)',
      };
    }
    if (path.includes('admissions')) {
      return {
        title: 'Thông tin Tuyển sinh Lớp 10 & Chuyển trường',
        desc: 'Chỉ tiêu tuyển sinh, hướng dẫn nộp hồ sơ, lịch thi và kết quả điểm chuẩn hàng năm.',
        module: 'Module Tuyển sinh (Step 05)',
      };
    }
    if (path.includes('gallery')) {
      return {
        title: 'Thư viện Hình ảnh & Hoạt động Giáo dục',
        desc: 'Kho lưu trữ tư liệu ảnh các ngày lễ truyền thống, hội thi giáo viên dạy giỏi và các hoạt động trải nghiệm.',
        module: 'Module Thư viện Media (Step 05)',
      };
    }
    if (path.includes('contact')) {
      return {
        title: 'Thông tin Liên hệ & Hòm thư Góp ý',
        desc: 'Thông tin địa chỉ, sơ đồ chỉ dẫn, số điện thoại văn phòng và biểu mẫu tiếp nhận phản ánh.',
        module: 'Module Liên hệ (Step 05)',
      };
    }
    return {
      title: 'Trang Thông tin Học đường',
      desc: 'Nội dung trang thông tin thuộc cổng thông tin điện tử của nhà trường.',
      module: 'Step 05 Content Pages',
    };
  };

  const info = getPageInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Breadcrumb & Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link to="/" className="hover:text-blue-800 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{info.title}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {info.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{info.desc}</p>
          </div>
          <Badge variant="primary" className="bg-blue-100 text-blue-900 font-semibold">
            {info.module}
          </Badge>
        </div>
      </div>

      {/* Presentation Content Box */}
      <Card className="border-dashed border-2 border-slate-200 bg-white">
        <CardContent className="p-8 text-center space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Khung Bố Cục Public Shell Sẵn Sàng
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Trang này đang nằm trong <strong>Public Shell</strong> của School News Platform (có Header đầy đủ, Breadcrumb, Mobile Bottom Bar và Footer). Nội dung chi tiết của trang tĩnh và chuyên mục sẽ được kích hoạt tại <strong>STEP 05</strong> theo Roadmap.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Về Trang chủ
              </Button>
            </Link>
            <Link to="/news">
              <Button variant="primary" size="sm">
                Xem Trang Tin tức
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
