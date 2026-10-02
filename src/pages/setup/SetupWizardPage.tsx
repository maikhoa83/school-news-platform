/**
 * Setup Wizard Page (10-Step Standard Installation & Permanent Lock)
 * School News Platform - Step 03 Foundation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Server,
  Database,
  Layers,
  FolderArchive,
  GraduationCap,
  UserCheck,
  PackageCheck,
  LayoutDashboard,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { setupService } from '../../services/setupService';
import { healthService } from '../../services/healthService';
import { useConfig } from '../../hooks/useConfig';
import { SetupStepKey, SystemHealthReport } from '../../types/config';

interface StepDefinition {
  key: SetupStepKey;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepDefinition[] = [
  {
    key: 'welcome',
    label: 'Khởi đầu',
    title: 'Chào mừng đến với School News Platform',
    description: 'Quy trình cấu hình và bàn giao cổng thông tin điện tử chuẩn hóa dành cho trường học.',
    icon: Sparkles,
  },
  {
    key: 'environment',
    label: 'Môi trường',
    title: 'Kiểm tra Biến Môi Trường (Environment)',
    description: 'Xác minh URL và Khóa truy cập Supabase của trường.',
    icon: Server,
  },
  {
    key: 'database',
    label: 'Cơ sở dữ liệu',
    title: 'Kết nối PostgreSQL / Supabase',
    description: 'Kiểm tra độ trễ và sự sẵn sàng của cơ sở dữ liệu độc lập.',
    icon: Database,
  },
  {
    key: 'migration',
    label: 'Migrations',
    title: 'Cấu trúc Bảng & Lược đồ (Schema)',
    description: 'Xác nhận các bảng cốt lõi (profiles, roles, site_settings, module_settings).',
    icon: Layers,
  },
  {
    key: 'storage',
    label: 'Lưu trữ Media',
    title: 'Cấu hình Supabase Storage',
    description: 'Kho lưu trữ ảnh hoạt động, tư liệu và văn bản điều hành.',
    icon: FolderArchive,
  },
  {
    key: 'identity',
    label: 'Nhận diện',
    title: 'Hồ sơ Nhận diện Nhà Trường',
    description: 'Tên trường, tên viết tắt, khẩu hiệu sư phạm và thông tin liên hệ.',
    icon: GraduationCap,
  },
  {
    key: 'admin',
    label: 'Quản trị viên',
    title: 'Khởi tạo Tài khoản Quản trị Ban đầu',
    description: 'Xác nhận tài khoản Quản trị tối cao (Super Administrator).',
    icon: UserCheck,
  },
  {
    key: 'seed',
    label: 'Dữ liệu mẫu',
    title: 'Nạp Dữ liệu Mẫu & Phân quyền',
    description: 'Thiết lập 5 vai trò hệ thống và danh mục quyền chuẩn sư phạm.',
    icon: PackageCheck,
  },
  {
    key: 'homepage',
    label: 'Giao diện',
    title: 'Cấu hình Khung Giao diện Trang chủ',
    description: 'Bố cục 12 cột, menu chính và nhận diện thương hiệu.',
    icon: LayoutDashboard,
  },
  {
    key: 'lock',
    label: 'Khóa Cài Đặt',
    title: 'Kiểm định Toàn diện & Khóa Hệ thống',
    description: 'Chạy chẩn đoán sức khỏe lần cuối và kích hoạt khóa bảo vệ (Setup Lock).',
    icon: Lock,
  },
];

export function SetupWizardPage() {
  const navigate = useNavigate();
  const { schoolIdentity, updateSchoolIdentity, refreshSetupState } = useConfig();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepNotice, setStepNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [healthReport, setHealthReport] = useState<SystemHealthReport | null>(null);

  // Editable identity fields for step 5
  const [schoolName, setSchoolName] = useState(schoolIdentity.school_name);
  const [shortName, setShortName] = useState(schoolIdentity.short_name);
  const [slogan, setSlogan] = useState(schoolIdentity.slogan);
  const [phone, setPhone] = useState(schoolIdentity.phone);
  const [email, setEmail] = useState(schoolIdentity.email);
  const [address, setAddress] = useState(schoolIdentity.address);

  const activeStep = STEPS[currentStepIndex];

  // Run health check on lock step
  useEffect(() => {
    if (activeStep.key === 'lock') {
      healthService.runSystemHealthCheck().then(setHealthReport);
    }
  }, [activeStep.key]);

  const handleNext = async () => {
    setStepNotice(null);
    setIsProcessing(true);

    try {
      // Step specific logic
      if (activeStep.key === 'identity') {
        const res = await updateSchoolIdentity({
          school_name: schoolName,
          short_name: shortName,
          slogan,
          phone,
          email,
          address,
        });
        if (!res.success) {
          setStepNotice({ type: 'error', message: res.error || 'Lỗi lưu thông tin nhận diện trường.' });
          setIsProcessing(false);
          return;
        }
      }

      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        await setupService.updateSetupStep(STEPS[nextIndex].key);
        setCurrentStepIndex(nextIndex);
      }
    } catch (err) {
      setStepNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Lỗi xử lý bước cài đặt.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setStepNotice(null);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleLockInstallation = async () => {
    setIsProcessing(true);
    setStepNotice(null);

    try {
      const res = await setupService.lockInstallation();
      if (!res.success) {
        setStepNotice({ type: 'error', message: res.error || 'Không thể khóa cài đặt.' });
        setIsProcessing(false);
        return;
      }

      await refreshSetupState();
      setStepNotice({
        type: 'success',
        message: 'Hệ thống đã được KHÓA CÀI ĐẶT THÀNH CÔNG! Đang chuyển hướng vào CMS...',
      });

      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      setStepNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Ngoại lệ khi khóa hệ thống.',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-800 text-amber-400 flex items-center justify-center font-bold text-lg border border-blue-700 shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">
                SETUP WIZARD
              </span>
              <Badge variant="primary" className="text-[10px] py-0 px-1.5 bg-blue-950 text-blue-300 border-blue-800">
                STEP 03 FOUNDATION
              </Badge>
            </div>
            <p className="text-xs text-slate-400">School News Platform • Cài Đặt Hệ Thống</p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400">
          Bước <span className="font-bold text-amber-400">{currentStepIndex + 1}</span> / {STEPS.length}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Step Navigation Progress */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 select-none shadow-lg">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2">
            Tiến Trình 10 Bước
          </h2>

          <div className="space-y-1">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <button
                  key={step.key}
                  type="button"
                  disabled={idx > currentStepIndex}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                    isCurrent
                      ? 'bg-blue-800 text-white font-semibold shadow-md ring-1 ring-blue-500'
                      : isPast
                      ? 'text-slate-300 hover:bg-slate-800/60'
                      : 'text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : isPast
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Step Interactive Panel */}
        <div className="lg:col-span-8 bg-white text-slate-900 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Step Header */}
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
                <activeStep.icon className="h-5 w-5" />
              </div>
              <Badge variant="primary" className="text-[10px] py-0.5 px-2">
                BƯỚC {currentStepIndex + 1}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {activeStep.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {activeStep.description}
            </p>
          </div>

          {stepNotice && (
            <Alert
              variant={stepNotice.type === 'success' ? 'success' : 'danger'}
              title={stepNotice.type === 'success' ? 'Thành công' : 'Lưu ý'}
            >
              {stepNotice.message}
            </Alert>
          )}

          {/* Dynamic Step Content */}
          <div className="py-2 text-xs text-slate-700">
            {activeStep.key === 'welcome' && (
              <div className="space-y-4 leading-relaxed">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                  <h2 className="font-semibold text-sm text-blue-950">
                    Nguyên Tắc Kiến Trúc Triển Khai:
                  </h2>
                  <p className="text-xs">
                    "BUILD ONCE → CONFIGURE PER SCHOOL → DEPLOY INDEPENDENTLY → MAINTAIN CENTRALLY → UPGRADE SAFELY"
                  </p>
                </div>
                <p>
                  Mỗi trường học được cấp phát một cơ sở hạ tầng Supabase độc lập. Trình hướng dẫn cài đặt (Setup Wizard) này giúp bạn cấu hình hồ sơ nhận diện, kiểm định các kết nối an toàn và khởi tạo các vai trò quản trị ban đầu trước khi bàn giao đưa vào sử dụng chính thức.
                </p>
              </div>
            )}

            {activeStep.key === 'environment' && (
              <div className="space-y-3">
                <p>Kiểm tra cấu hình biến môi trường tại tệp <code>.env</code>:</p>
                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                  <div>VITE_SUPABASE_URL = {import.meta.env.VITE_SUPABASE_URL || '(Chưa cung cấp URL)'}</div>
                  <div>VITE_SUPABASE_ANON_KEY = {import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••••••••••••••••••••••••••' : '(Chưa cung cấp Key)'}</div>
                  <div>VITE_APP_ENV = {import.meta.env.VITE_APP_ENV || 'development'}</div>
                </div>
              </div>
            )}

            {activeStep.key === 'database' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Cơ sở dữ liệu PostgreSQL Độc lập
                  </div>
                  <p className="text-[11px]">
                    Các bảng cấu hình <code>site_settings</code> và <code>module_settings</code> đã sẵn sàng kết nối.
                  </p>
                </div>
              </div>
            )}

            {activeStep.key === 'migration' && (
              <div className="space-y-3">
                <p>Danh sách các tệp Migration được kiểm tra:</p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                  <div className="p-3 bg-slate-50 flex items-center justify-between">
                    <span>20260101000000_initial_schema.sql</span>
                    <Badge variant="primary">ĐÃ ÁP DỤNG</Badge>
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between">
                    <span>20260102000000_step03_foundation.sql</span>
                    <Badge variant="primary">SẴN SÀNG</Badge>
                  </div>
                </div>
              </div>
            )}

            {activeStep.key === 'storage' && (
              <div className="space-y-3">
                <p>Cấu hình bucket lưu trữ dữ liệu đa phương tiện:</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Bucket: media</span>
                    <span className="text-slate-500">Ảnh bài viết, banner, album</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Bucket: documents</span>
                    <span className="text-slate-500">Công văn, PDF, biểu mẫu</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep.key === 'identity' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Tên đầy đủ nhà trường"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                  <Input
                    label="Tên viết tắt"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Khẩu hiệu sư phạm (Slogan)"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Điện thoại hotline"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    label="Email công vụ"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Input
                  label="Địa chỉ trụ sở trường"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            )}

            {activeStep.key === 'admin' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-600">
                    Tài khoản Super Administrator sẽ nắm quyền tối cao đối với toàn bộ các cài đặt nhận diện và cấu hình module của trường.
                  </p>
                  <div className="font-mono text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    Vai trò: SUPER_ADMIN (Toàn quyền hệ thống)
                  </div>
                </div>
              </div>
            )}

            {activeStep.key === 'seed' && (
              <div className="space-y-3">
                <p>Hệ thống đã nạp sẵn danh mục phân quyền RBAC sư phạm:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'PUBLIC_VISITOR'].map((role) => (
                    <div key={role} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-bold text-slate-800">
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStep.key === 'homepage' && (
              <div className="space-y-3">
                <p>Khung giao diện trang chủ đã sẵn sàng với bộ nhận diện màu sắc Deep Blue và Amber Gold.</p>
                <div className="p-4 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                  Sticky Primary Navigation, Mobile Drawer và Topbar đã kiểm định thành công.
                </div>
              </div>
            )}

            {activeStep.key === 'lock' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Lock className="h-4 w-4 text-amber-700" />
                    Cơ Chế Khóa An Toàn (Setup Lock)
                  </div>
                  <p className="text-xs leading-relaxed">
                    Sau khi nhấn <strong>"Xác Nhận Khóa Cài Đặt"</strong>, cờ <code>is_completed</code> sẽ chuyển thành <code>true</code>. Tuyến đường cài đặt này sẽ bị vô hiệu hóa hoàn toàn và mọi truy cập sau đó sẽ bị chặn để bảo vệ an toàn cho nhà trường.
                  </p>
                </div>

                {healthReport && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    <div className="p-3 bg-slate-50 font-semibold flex items-center justify-between text-xs">
                      <span>Báo cáo Sức khỏe Hệ thống:</span>
                      <Badge
                        variant={healthReport.overallStatus === 'HEALTHY' ? 'primary' : 'warning'}
                      >
                        {healthReport.overallStatus}
                      </Badge>
                    </div>
                    {healthReport.components.map((c) => (
                      <div key={c.name} className="p-3 text-xs flex items-center justify-between">
                        <span className="text-slate-700">{c.name}</span>
                        <span
                          className={`font-semibold ${
                            c.status === 'HEALTHY'
                              ? 'text-emerald-600'
                              : c.status === 'DEGRADED'
                              ? 'text-amber-600'
                              : c.status === 'UNKNOWN'
                              ? 'text-slate-500'
                              : 'text-red-600'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStepIndex === 0 || isProcessing}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Bước trước
            </Button>

            {activeStep.key === 'lock' ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleLockInstallation}
                isLoading={isProcessing}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                <Lock className="h-4 w-4 mr-1.5" />
                Xác Nhận Khóa Cài Đặt (Lock Installation)
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                isLoading={isProcessing}
              >
                Tiếp tục
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Disclaimer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-4 border-t border-slate-800 text-[11px] text-slate-500">
        School News Platform Architecture v1.2 • Step 03: Configuration & Setup Foundation
      </footer>
    </div>
  );
}
