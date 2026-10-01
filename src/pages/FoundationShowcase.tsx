import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Layers,
  Shield,
  Palette,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Database,
  Box,
  Terminal,
  Monitor,
  Smartphone,
  Tablet,
  FileCheck,
  Compass
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Separator } from '../components/ui/Separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { checkSupabaseConnection, ConnectionStatus } from '../lib/supabase';
import { getAllModules } from '../lib/moduleRegistry';
import { envConfig } from '../lib/env';

export function FoundationShowcase() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isCheckingConn, setIsCheckingConn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sampleInput, setSampleInput] = useState('Trường THPT Chuyên Quốc Học Huế');
  const [sampleInputError, setSampleInputError] = useState('');
  const [responsiveMode, setResponsiveMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const modules = getAllModules();

  const handleTestConnection = async () => {
    setIsCheckingConn(true);
    try {
      const res = await checkSupabaseConnection();
      setConnectionStatus(res);
    } catch {
      setConnectionStatus({
        isConfigured: false,
        isConnected: false,
        message: 'Lỗi ngoại lệ khi kiểm tra kết nối Supabase.',
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setIsCheckingConn(false);
    }
  };

  useEffect(() => {
    handleTestConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header / Foundation Banner */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-base shadow-xs">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">SCHOOL NEWS PLATFORM</span>
                <Badge variant="primary">STEP 01 BASELINE</Badge>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Foundation & Design System • One Codebase per School
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-100 py-1 px-2.5 rounded-md border border-slate-200">
              <Database className="h-3.5 w-3.5 text-slate-600" />
              <span>Supabase Client:</span>
              <span className="font-mono font-medium text-slate-800">
                {envConfig.isConfigured ? 'Configured' : 'Dev Mock Fallback'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              isLoading={isCheckingConn}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Kiểm tra kết nối
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Step 01 Goal & Architecture Banner */}
        <section className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl text-white p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold border border-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Giai đoạn: Phase A — Foundation (Step 01 / 04)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Nền tảng Kiến trúc & Hệ thống Thiết kế
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Codebase được chuẩn hóa theo mô hình <strong>BUILD ONCE → CONFIGURE PER SCHOOL → DEPLOY INDEPENDENTLY</strong>.
              Step 01 thiết lập toàn bộ nền tảng TypeScript strict, design tokens, UI primitives, kết nối Supabase và module registry sẵn sàng cho Step 02 (Core Shell & Responsive).
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Kiến trúc:</span>
              <span className="font-semibold text-white">Single-tenant Isolated</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Backend & Auth:</span>
              <span className="font-semibold text-white">Supabase / PostgreSQL RLS</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Design System:</span>
              <span className="font-semibold text-white">Tailwind CSS + Primitives</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Trạng thái hiện tại:</span>
              <span className="font-semibold text-emerald-400">Step 01 Complete (Ready for Review)</span>
            </div>
          </div>
        </section>

        {/* Verification Tabs */}
        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <TabsList>
              <TabsTrigger value="overview" icon={<Layers className="h-4 w-4" />}>
                Tổng quan & Kết nối
              </TabsTrigger>
              <TabsTrigger value="design-system" icon={<Palette className="h-4 w-4" />}>
                Design Tokens & Typography
              </TabsTrigger>
              <TabsTrigger value="primitives" icon={<Box className="h-4 w-4" />}>
                Thư viện UI Primitives
              </TabsTrigger>
              <TabsTrigger value="registry" icon={<FileCheck className="h-4 w-4" />}>
                Hợp đồng Module (Registry)
              </TabsTrigger>
              <TabsTrigger value="database" icon={<Database className="h-4 w-4" />}>
                Database & Migrations
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: OVERVIEW & CONNECTION */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Connection Status Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-800" />
                      Kết nối Supabase
                    </CardTitle>
                    {connectionStatus && (
                      <StatusBadge
                        status={connectionStatus.isConnected ? 'healthy' : 'inactive'}
                        label={connectionStatus.isConnected ? 'Đã kết nối' : 'Dev Mock Mode'}
                      />
                    )}
                  </div>
                  <CardDescription>
                    Kiểm tra trạng thái kết nối độc lập của trường
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Môi trường:</span>
                      <span className="font-mono font-medium">{envConfig.appEnv}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Cấu hình URL:</span>
                      <span className="font-mono text-slate-800 truncate max-w-[180px]">
                        {envConfig.supabaseUrl || '(Chưa điền .env)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Độ trễ ping:</span>
                      <span className="font-mono font-medium text-emerald-600">
                        {connectionStatus?.latencyMs !== undefined
                          ? `${connectionStatus.latencyMs}ms`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <Alert
                    variant={connectionStatus?.isConnected ? 'success' : 'info'}
                    title={connectionStatus?.isConnected ? 'Kết nối thành công' : 'Chế độ Dev Mock / Chờ cấp phát'}
                  >
                    {connectionStatus?.message || 'Đang kiểm tra kết nối...'}
                  </Alert>

                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    Mỗi trường khi triển khai sẽ điền <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> và <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> vào file môi trường độc lập.
                  </div>
                </CardContent>
              </Card>

              {/* Architectural Principles Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-800" />
                    Nguyên tắc Cốt lõi & Ranh giới Kỹ thuật Step 01
                  </CardTitle>
                  <CardDescription>
                    Xác nhận tuân thủ nghiêm ngặt Master Documents v1.2
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                        <Check className="h-4 w-4 text-emerald-600" />
                        Không hard-code thông tin trường
                      </div>
                      <p className="text-xs text-slate-600">
                        Tất cả tên trường, logo, slogan, màu sắc được trừu tượng hóa thành Configuration và lưu trữ độc lập.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                        <Check className="h-4 w-4 text-emerald-600" />
                        Tách biệt UI & Business Logic
                      </div>
                      <p className="text-xs text-slate-600">
                        Design System → Theme/Shell → Module UI → Business Logic/Data. Thay đổi theme không tác động logic.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                        <Check className="h-4 w-4 text-emerald-600" />
                        Bảo mật RLS đa tầng
                      </div>
                      <p className="text-xs text-slate-600">
                        Authentication xác định danh tính; Authorization enforce bằng Postgres RLS và quyền hạn resource.action.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                        <Check className="h-4 w-4 text-emerald-600" />
                        Kiểm soát thay đổi chặt chẽ
                      </div>
                      <p className="text-xs text-slate-600">
                        Chỉ hoàn thành Step 01 và dừng lại báo cáo nghiệm thu; không tự ý nhảy cóc sang Step 02 hoặc Step 05+.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Terminal className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Quy ước Scope Control:</strong> Step 01 tạo lập Foundation, Design System, Typecheck, UI Primitives và Module Contracts. Các nghiệp vụ Content CRUD (News, Media, Documents) và Core Shell (Public/Admin Shell) được tách biệt sang các Step sau theo Roadmap.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: DESIGN SYSTEM & TYPOGRAPHY */}
          <TabsContent value="design-system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bảng Màu Thương Hiệu (Design Tokens)</CardTitle>
                <CardDescription>
                  Bảng màu chuyên nghiệp dành riêng cho cơ sở giáo dục phổ thông Việt Nam (Độ tương phản cao, trang nhã, nghiêm túc)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">
                    Màu Sắc Trọng Tâm (Primary & Accent)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="h-16 rounded-md bg-blue-800 shadow-inner flex items-end p-2 text-white font-mono">
                        #1e3a8a
                      </div>
                      <span className="font-medium text-slate-800 block">Primary (Academic Navy)</span>
                      <span className="text-slate-500 block">Màu đại diện chính thống, tiêu đề, menu</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-16 rounded-md bg-blue-900 shadow-inner flex items-end p-2 text-white font-mono">
                        #1e293b
                      </div>
                      <span className="font-medium text-slate-800 block">Primary Dark (Hover/Focus)</span>
                      <span className="text-slate-500 block">Nút hover, trạng thái active</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-16 rounded-md bg-amber-600 shadow-inner flex items-end p-2 text-white font-mono">
                        #d97706
                      </div>
                      <span className="font-medium text-slate-800 block">Accent (Scholastic Gold)</span>
                      <span className="text-slate-500 block">Điểm nhấn sự kiện, huy hiệu, thông báo</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-16 rounded-md bg-slate-900 shadow-inner flex items-end p-2 text-white font-mono">
                        #0f172a
                      </div>
                      <span className="font-medium text-slate-800 block">Neutral Deep (Chữ chính)</span>
                      <span className="text-slate-500 block">Văn bản bài viết, tiêu đề lớn</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">
                    Thử Nghiệm Typography Tiếng Việt (Vietnamese Diacritics & Rendering)
                  </h4>
                  <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-mono">Heading 1 / Tiêu đề lớn (28px - Bold)</span>
                      <h1 className="text-2xl font-bold text-slate-900 mt-1">
                        Khai mạc Hội khỏe Phù Đổng toàn trường năm học 2026 – 2027
                      </h1>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-mono">Heading 2 / Tiêu đề phân đoạn (20px - SemiBold)</span>
                      <h2 className="text-xl font-semibold text-slate-800 mt-1">
                        Nghị quyết Hội nghị Cán bộ, Giáo viên và Nhân viên đầu năm học
                      </h2>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-mono">Body / Đoạn văn chính (15px - Regular 1.6 Line-height)</span>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed max-w-3xl">
                        Nền tảng xuất bản điện tử dành cho trường phổ thông đảm bảo hiển thị hoàn hảo các dấu thanh âm tiếng Việt (huyền, sắc, hỏi, ngã, nặng) cùng các nguyên âm có dấu đặc trưng (ă, â, ê, ô, ơ, ư). Khoảng cách dòng (line-height) được căn chỉnh từ 1.6 đến 1.7 giúp bài viết dài, thông báo quy chế và văn bản chỉ đạo đọc rõ ràng, không bị dính dấu trên cả máy tính lẫn thiết bị di động.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: UI PRIMITIVES SHOWCASE */}
          <TabsContent value="primitives" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Button & Inputs Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Nút Bấm & Ô Nhập Liệu (Buttons & Inputs)</CardTitle>
                  <CardDescription>Các biến thể của Button và Input có kiểm soát trạng thái</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Biến thể Nút bấm</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="accent">Accent</Button>
                      <Button variant="danger">Danger</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="primary" isLoading>Đang lưu</Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Trường Nhập Liệu</label>
                    <Input
                      label="Tên đơn vị trường học"
                      value={sampleInput}
                      onChange={(e) => {
                        setSampleInput(e.target.value);
                        if (!e.target.value.trim()) {
                          setSampleInputError('Tên trường không được để trống.');
                        } else {
                          setSampleInputError('');
                        }
                      }}
                      error={sampleInputError}
                      helperText="Nhập tên chính thức trên con dấu của nhà trường."
                      required
                    />

                    <Input
                      label="Địa chỉ email liên hệ"
                      placeholder="banbientap@truong.edu.vn"
                      type="email"
                    />

                    <Select
                      label="Cấp học đơn vị (Select Primitive)"
                      helperText="Lựa chọn cấp học để cấu hình biểu mẫu mặc định."
                      options={[
                        { value: 'thpt', label: 'Trường Trung học Phổ thông (THPT)' },
                        { value: 'thcs', label: 'Trường Trung học Cơ sở (THCS)' },
                        { value: 'tieuhoc', label: 'Trường Tiểu học' },
                        { value: 'liencap', label: 'Trường Phổ thông Liên cấp' },
                      ]}
                    />

                    <Textarea
                      label="Mô tả tóm tắt nhà trường (Textarea Primitive)"
                      placeholder="Nhập thông tin giới thiệu ngắn gọn hiển thị trên thẻ meta..."
                      rows={3}
                      helperText="Dữ liệu mẫu kiểm thử giao diện Form Controls."
                    />
                  </div>

                  <Separator />

                  <div className="pt-1 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                      Mở hộp thoại mẫu (Modal Dialog)
                    </Button>
                    <span className="text-xs text-slate-500">Bấm Escape để đóng modal</span>
                  </div>
                </CardContent>
              </Card>

              {/* Badges, Alerts, Skeletons */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông Báo & Huy Hiệu (Badges, Alerts & Skeletons)</CardTitle>
                  <CardDescription>Các thành phần phản hồi trực quan và trạng thái</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Huy hiệu phân loại (Badges)</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="primary">Tin tức</Badge>
                      <Badge variant="accent">Thông báo khẩn</Badge>
                      <Badge variant="success">Đã xuất bản</Badge>
                      <Badge variant="warning">Chờ biên tập</Badge>
                      <Badge variant="danger">Đã từ chối</Badge>
                      <Badge variant="outline">Văn bản số</Badge>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Hộp Thông Báo (Alerts)</label>
                    <Alert variant="info" title="Thông báo hệ thống">
                      Cổng thông tin hoạt động độc lập trên hạ tầng riêng của nhà trường.
                    </Alert>
                    <Alert variant="success" title="Xác thực thành công">
                      Quyền hạn quản trị đã được xác minh theo tiêu chuẩn RLS.
                    </Alert>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Skeleton Loading Primitives</label>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2 pt-1">
                        <Skeleton className="h-8 w-24 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Primitive Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Bảng Dữ Liệu Chuẩn (Data Table Primitive)</CardTitle>
                <CardDescription>Thiết kế bảng dữ liệu phẳng, độ tương phản cao, tối ưu hiển thị danh sách</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã định danh</TableHead>
                      <TableHead>Tên thành phần</TableHead>
                      <TableHead>Phân nhóm</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs text-slate-500">UI-BTN-01</TableCell>
                      <TableCell className="font-medium">Button Primitive</TableCell>
                      <TableCell>Thành phần tương tác</TableCell>
                      <TableCell><Badge variant="success">Sẵn sàng</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm">Xem</Button></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs text-slate-500">UI-INP-02</TableCell>
                      <TableCell className="font-medium">Input & Form Controls</TableCell>
                      <TableCell>Thành phần nhập liệu</TableCell>
                      <TableCell><Badge variant="success">Sẵn sàng</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm">Xem</Button></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs text-slate-500">UI-MDL-03</TableCell>
                      <TableCell className="font-medium">Modal Dialog</TableCell>
                      <TableCell>Hộp thoại tương tác</TableCell>
                      <TableCell><Badge variant="success">Sẵn sàng</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm">Xem</Button></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Routing Architecture Verification Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-blue-800" />
                  Kiểm Định Tuyến Đường Nền Tảng (Routing Foundation)
                </CardTitle>
                <CardDescription>
                  Xác minh cấu trúc định tuyến cơ bản của Step 01 và khả năng xử lý biên định tuyến
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Link to="/foundation" className="block">
                    <div className="p-3.5 rounded-lg border border-blue-300 bg-blue-50/60 hover:bg-blue-100/70 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-blue-900">/foundation</span>
                        <Badge variant="primary">Hiện tại</Badge>
                      </div>
                      <p className="text-xs text-slate-600">Trang kiểm định Design System & Nền tảng.</p>
                    </div>
                  </Link>

                  <Link to="/login" className="block">
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-slate-900">/login</span>
                        <Badge variant="outline">Step 01 Test</Badge>
                      </div>
                      <p className="text-xs text-slate-600">Route nền tảng chuẩn bị cho Auth Shell (Step 02).</p>
                    </div>
                  </Link>

                  <Link to="/admin" className="block">
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-slate-900">/admin</span>
                        <Badge variant="outline">Step 01 Test</Badge>
                      </div>
                      <p className="text-xs text-slate-600">Route nền tảng chuẩn bị cho Admin Shell (Step 02).</p>
                    </div>
                  </Link>

                  <Link to="/thu-nghiem-404-not-found" className="block">
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-slate-900">/* (404)</span>
                        <Badge variant="warning">Catch-All</Badge>
                      </div>
                      <p className="text-xs text-slate-600">Kiểm tra NotFoundState khi truy cập đường dẫn lạ.</p>
                    </div>
                  </Link>
                </div>

                <div className="p-3 bg-slate-100 rounded-md text-xs text-slate-600 flex items-center justify-between">
                  <span>Các shell hoàn chỉnh (Public Shell, Auth Shell, Admin Shell) sẽ được phát triển đầy đủ tại <strong>Step 02</strong> theo đúng Roadmap v1.2.</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: MODULE REGISTRY */}
          <TabsContent value="registry" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Hợp Đồng Đăng Ký Module (Module Registry Contracts)</span>
                  <Badge variant="primary">{modules.length} modules</Badge>
                </CardTitle>
                <CardDescription>
                  Định nghĩa ranh giới 15 module cốt lõi theo Master Documents v1.2. Các module có thể bật/tắt độc lập cho từng trường mà không phá vỡ liên kết hệ thống.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã Module</TableHead>
                      <TableHead>Tên Phân Hệ</TableHead>
                      <TableHead>Phân Nhóm</TableHead>
                      <TableHead>Quyền Yêu Cầu</TableHead>
                      <TableHead>Đường dẫn mẫu</TableHead>
                      <TableHead className="text-right">Mặc định</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((m) => (
                      <TableRow key={m.key}>
                        <TableCell className="font-mono font-medium text-xs text-blue-900">
                          {m.key}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                          <div className="text-xs text-slate-500">{m.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.category === 'core'
                                ? 'primary'
                                : m.category === 'content'
                                ? 'accent'
                                : 'default'
                            }
                          >
                            {m.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {m.requiredPermissions.join(', ')}
                          </code>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono">
                          {m.publicRoute || m.adminRoute || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status="active" label="Sẵn sàng" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: DATABASE & MIGRATIONS */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cơ Sở Dữ Liệu & Migrations Khởi Tạo (Step 01)</CardTitle>
                <CardDescription>
                  Cấu trúc bảng lưu trữ PostgreSQL độc lập trong thư mục <code className="font-mono">supabase/migrations/</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Terminal className="h-4 w-4 text-blue-800" />
                      20260101000000_initial_schema.sql
                    </div>
                    <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
                      <li><strong>profiles:</strong> Lưu hồ sơ người dùng, liên kết auth.users</li>
                      <li><strong>roles:</strong> PUBLIC_VISITOR, AUTHOR, EDITOR, ADMIN, SUPER_ADMIN</li>
                      <li><strong>permissions:</strong> Quyền hạn dạng resource.action (news.view, v.v.)</li>
                      <li><strong>role_permissions & user_roles:</strong> Bảng liên kết RBAC chuẩn</li>
                      <li><strong>site_settings:</strong> Cấu hình trường nhận diện độc lập (JSONB)</li>
                      <li><strong>module_settings:</strong> Khóa bật/tắt module từng trường</li>
                      <li><strong>RLS Policies:</strong> Đã kích hoạt bảo mật Row Level Security</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Terminal className="h-4 w-4 text-amber-700" />
                      seed/00_roles_and_permissions.sql
                    </div>
                    <ul className="text-xs space-y-1 text-slate-600 list-disc list-inside">
                      <li>Khởi tạo 5 vai trò hệ thống cơ bản</li>
                      <li>Khởi tạo danh sách permissions chuẩn (news, documents, users, settings)</li>
                      <li>Khởi tạo mẫu site_settings (school_identity) không chứa bí mật</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <strong>Nguyên tắc Migration:</strong> Mọi thay đổi schema đều phải qua migration file mới. Tuyệt đối không chỉnh sửa trực tiếp các migration đã chạy trên production.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Demo Instance */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Xác nhận Kiểm tra Thiết kế (Modal Test)"
          description="Hộp thoại mẫu kiểm tra khả năng truy cập (Accessibility, Escape key, Focus trap)"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                Hoàn tất kiểm tra
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Đây là thành phần Modal Dialog của Design System, hỗ trợ phím Escape, khóa cuộn trang nền và hiển thị tiêu chuẩn theo quy cách sản phẩm.
            </p>
            <Alert variant="info">
              Trạng thái component hoạt động ổn định và tuân thủ ranh giới Step 01.
            </Alert>
          </div>
        </Modal>
      </main>
    </div>
  );
}
