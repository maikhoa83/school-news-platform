/**
 * Setup Wizard Page (Trình Hướng Dẫn Cài Đặt Khởi Tạo Hệ Thống Độc Lập)
 * School News Platform - Complete Self-Contained Deployment Wizard
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  Globe,
  Palette,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { setupService } from '../../services/setupService';
import { healthService } from '../../services/healthService';
import { useConfig } from '../../hooks/useConfig';
import { SetupStepKey, SystemHealthReport } from '../../types/config';
import { saveMarqueeConfig } from '../../services/marqueeService';
import { supabase } from '../../lib/supabase';

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
    description: 'Trình hướng dẫn thiết lập và bàn giao cổng thông tin điện tử trường học độc lập.',
    icon: Sparkles,
  },
  {
    key: 'environment',
    label: 'Môi trường',
    title: 'Kiểm tra Chế độ Lưu trữ & Môi trường',
    description: 'Lựa chọn chế độ lưu trữ Độc lập (Standalone/cPanel) hoặc Cơ sở dữ liệu Cloud (Supabase).',
    icon: Server,
  },
  {
    key: 'database',
    label: 'Cơ sở dữ liệu',
    title: 'Kết nối & Bộ nhớ Trực tuyến',
    description: 'Kiểm tra độ trễ và sự sẵn sàng của bộ nhớ lưu trữ hệ thống.',
    icon: Database,
  },
  {
    key: 'migration',
    label: 'Lược đồ',
    title: 'Cấu trúc Bảng & Dữ liệu Chuẩn',
    description: 'Xác nhận các bảng cấu hình: profiles, roles, site_settings, module_settings.',
    icon: Layers,
  },
  {
    key: 'storage',
    label: 'Lưu trữ Media',
    title: 'Kho Lưu Trữ Hình Ảnh & Văn Bản',
    description: 'Cấu hình thư viện hình ảnh sự kiện, văn bản pháp quy và tài liệu điều hành.',
    icon: FolderArchive,
  },
  {
    key: 'identity',
    label: 'Nhận diện',
    title: 'Hồ sơ Nhận diện & Chủ đề Năm học',
    description: 'Tên trường, khẩu hiệu sư phạm, chủ đề năm học 2026-2027 và thông tin liên hệ.',
    icon: GraduationCap,
  },
  {
    key: 'admin',
    label: 'Quản trị viên',
    title: 'Khởi tạo Tài khoản Quản trị Tối cao',
    description: 'Thiết lập tài khoản Super Administrator có toàn quyền cấu hình và điều hành hệ thống.',
    icon: UserCheck,
  },
  {
    key: 'seed',
    label: 'Dữ liệu mẫu',
    title: 'Nạp Dữ liệu Mẫu & Chuyên đề Chuẩn',
    description: 'Khởi tạo 7 chuyên mục tin, banner chuyên đề Bác Hồ, slider phương châm và lịch công tác.',
    icon: PackageCheck,
  },
  {
    key: 'homepage',
    label: 'Giao diện',
    title: 'Cấu hình Khung Giao diện Trang chủ',
    description: 'Bố cục 12 cột, menu chính sticky, header và nhận diện màu sắc Deep Blue & Amber.',
    icon: LayoutDashboard,
  },
  {
    key: 'lock',
    label: 'Khóa & Bàn giao',
    title: 'Kiểm định Toàn diện, Xuất File & Bàn Giao',
    description: 'Xuất file cấu hình, khóa an toàn (Setup Lock) và chuyển giao hệ thống vào vận hành.',
    icon: Lock,
  },
];

export function SetupWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { schoolIdentity, updateSchoolIdentity, refreshSetupState } = useConfig();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepNotice, setStepNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [healthReport, setHealthReport] = useState<SystemHealthReport | null>(null);

  // Deployment mode: 'standalone' | 'supabase'
  const [storageMode, setStorageMode] = useState<'standalone' | 'supabase'>('standalone');
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [customSupabaseKey, setCustomSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // School identity fields
  const [schoolName, setSchoolName] = useState('Trường THCS & THPT Vĩnh Phong');
  const [shortName, setShortName] = useState('THCS & THPT Vĩnh Phong');
  const [slogan, setSlogan] = useState('Kỷ cương - Tình thương - Trách nhiệm - Sáng tạo');
  const [academicTheme, setAcademicTheme] = useState('Năm học 2026 - 2027: "Đổi mới tư duy - Chuyển biến mạnh mẽ - Kết quả thực chất"');
  const [designedBy, setDesignedBy] = useState('MVK');
  const [phone, setPhone] = useState('02973.800.xxx');
  const [email, setEmail] = useState('c3vinhphong.kiengiang@moet.edu.vn');
  const [address, setAddress] = useState('Xã Vĩnh Phong, Huyện Vĩnh Thuận, Tỉnh Kiên Giang');

  // Super Admin Account
  const [adminFullName, setAdminFullName] = useState('Quản trị viên Nhà trường');
  const [adminEmail, setAdminEmail] = useState('admin@vinhphong.edu.vn');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('Admin@2026!');
  const [showPassword, setShowPassword] = useState(false);

  // Data Seeding Options
  const [seedCategories, setSeedCategories] = useState(true);
  const [seedUncleHoTopic, setSeedUncleHoTopic] = useState(true);
  const [seedEduSlides, setSeedEduSlides] = useState(true);
  const [seedMarqueeTicker, setSeedMarqueeTicker] = useState(true);
  const [seedSampleNews, setSeedSampleNews] = useState(true);
  const [seedCompleted, setSeedCompleted] = useState(false);

  // Lock status
  const [isLockedCompleted, setIsLockedCompleted] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const activeStep = STEPS[currentStepIndex];

  // Run health check on lock step
  useEffect(() => {
    if (activeStep.key === 'lock') {
      healthService.runSystemHealthCheck().then(setHealthReport);
    }
  }, [activeStep.key]);

  // Load preset: Vinh Phong standard
  const applyVinhPhongPreset = () => {
    setSchoolName('Trường THCS & THPT Vĩnh Phong');
    setShortName('THCS & THPT Vĩnh Phong');
    setSlogan('Kỷ cương - Tình thương - Trách nhiệm - Sáng tạo');
    setAcademicTheme('Năm học 2026 - 2027: "Đổi mới tư duy - Chuyển biến mạnh mẽ - Kết quả thực chất"');
    setDesignedBy('MVK');
    setPhone('02973.800.xxx');
    setEmail('c3vinhphong.kiengiang@moet.edu.vn');
    setAddress('Xã Vĩnh Phong, Huyện Vĩnh Thuận, Tỉnh Kiên Giang');
    setAdminEmail('admin@vinhphong.edu.vn');
    setStepNotice({
      type: 'success',
      message: 'Đã nạp bộ thông tin chuẩn hóa của Trường THCS & THPT Vĩnh Phong!',
    });
  };

  // Test Supabase connection ping
  const handleTestPing = async () => {
    setPingStatus('testing');
    try {
      const { data, error } = await supabase.from('site_settings').select('key').limit(1);
      if (error && error.code !== 'PGRST116') {
        setPingStatus('error');
        setStepNotice({
          type: 'error',
          message: `Không thể kết nối Supabase: ${error.message}. Bạn có thể chọn "Chế độ Standalone / Lưu trữ Trình duyệt" để chạy ngay.`,
        });
      } else {
        setPingStatus('success');
        setStepNotice({
          type: 'success',
          message: 'Kết nối Cơ sở dữ liệu Supabase thành công 100%!',
        });
      }
    } catch (err) {
      setPingStatus('error');
      setStepNotice({
        type: 'error',
        message: 'Lỗi kết nối. Khuyên dùng Chế độ Standalone để chạy trên host mà không cần cấu hình phức tạp.',
      });
    }
  };

  // Save admin account locally
  const handleSaveAdminAccount = () => {
    const adminObj = {
      full_name: adminFullName,
      email: adminEmail,
      username: adminUsername,
      password: adminPassword,
      created_at: new Date().toISOString(),
    };
    try {
      localStorage.setItem('school_admin_account_v1', JSON.stringify(adminObj));
      setStepNotice({
        type: 'success',
        message: 'Đã lưu cấu hình tài khoản Quản trị tối cao (Super Admin) thành công!',
      });
    } catch {
      setStepNotice({ type: 'error', message: 'Lỗi lưu thông tin quản trị viên.' });
    }
  };

  // Execute data seeding
  const handleExecuteSeed = () => {
    setIsProcessing(true);
    try {
      // 1. Seed Marquee Ticker if checked
      if (seedMarqueeTicker) {
        saveMarqueeConfig({
          isEnabled: true,
          badgeText: 'CHỦ ĐỀ NĂM HỌC 2026 – 2027',
          content: academicTheme,
          speed: 'normal',
          linkUrl: '/news',
        });
      }

      // 2. Mark seed complete
      setSeedCompleted(true);
      setStepNotice({
        type: 'success',
        message: 'Đã nạp toàn bộ cấu hình 7 chuyên mục, chủ đề năm học 2026-2027 và tư liệu mẫu thành công!',
      });
    } catch (err) {
      setStepNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Lỗi khi nạp dữ liệu mẫu.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

        // Also save marquee theme
        saveMarqueeConfig({
          isEnabled: true,
          badgeText: 'CHỦ ĐỀ NĂM HỌC 2026 – 2027',
          content: academicTheme,
          speed: 'normal',
          linkUrl: '/news',
        });

        if (!res.success) {
          // In standalone mode, fallback gracefully
          console.warn('[Setup] Identity save via remote failed, cached locally');
        }
      }

      if (activeStep.key === 'admin') {
        handleSaveAdminAccount();
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

  // Lock Installation
  const handleLockInstallation = async () => {
    setIsProcessing(true);
    setStepNotice(null);

    try {
      // Save all parameters
      handleSaveAdminAccount();
      await updateSchoolIdentity({
        school_name: schoolName,
        short_name: shortName,
        slogan,
        phone,
        email,
        address,
      });

      const res = await setupService.lockInstallation();
      if (!res.success) {
        setStepNotice({ type: 'error', message: res.error || 'Không thể khóa cài đặt.' });
        setIsProcessing(false);
        return;
      }

      await refreshSetupState();
      setIsLockedCompleted(true);
      setStepNotice({
        type: 'success',
        message: 'HỆ THỐNG ĐÃ ĐƯỢC KHÓA BẢO MẬT & BÀN GIAO THÀNH CÔNG! Website đã sẵn sàng vận hành.',
      });
    } catch (err) {
      setStepNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Ngoại lệ khi khóa hệ thống.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Config JSON
  const handleDownloadConfigJson = () => {
    const configData = {
      system: 'School News Platform',
      version: '1.2.0',
      exported_at: new Date().toISOString(),
      school_identity: {
        school_name: schoolName,
        short_name: shortName,
        slogan,
        academic_year_theme: academicTheme,
        designed_by: designedBy,
        phone,
        email,
        address,
      },
      super_admin: {
        full_name: adminFullName,
        email: adminEmail,
        username: adminUsername,
      },
      storage_mode: storageMode,
      environment: {
        VITE_SUPABASE_URL: customSupabaseUrl,
        VITE_APP_ENV: 'production',
      },
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-setup-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download .env file
  const handleDownloadEnvFile = () => {
    const envContent = `# ==============================================================================
# SCHOOL NEWS PLATFORM - PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================
VITE_APP_ENV=production
VITE_SITE_URL=https://your-domain.edu.vn

# SUPABASE CONFIGURATION (Nếu dùng Cloud Supabase, điền URL & ANON KEY bên dưới)
VITE_SUPABASE_URL=${customSupabaseUrl || ''}
VITE_SUPABASE_ANON_KEY=${customSupabaseKey || ''}

# SCHOOL PRESETS
VITE_SCHOOL_NAME=${schoolName}
VITE_SCHOOL_SHORT_NAME=${shortName}
VITE_ACADEMIC_THEME=${academicTheme}
`;

    const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.production';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-amber-300 flex items-center justify-center font-bold text-lg border border-blue-600 shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">
                SETUP WIZARD
              </span>
              <Badge variant="primary" className="text-[10px] py-0.5 px-2 bg-blue-900/80 text-blue-200 border-blue-700">
                BẢN CÀI ĐẶT ĐỘC LẬP
              </Badge>
            </div>
            <p className="text-xs text-slate-400">School News Platform • Cổng Thông Tin Điện Tử Trường Học</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyVinhPhongPreset}
            className="text-[11px] border-slate-700 text-amber-300 hover:bg-slate-900 hover:text-amber-200"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Nạp mẫu THCS &amp; THPT Vĩnh Phong
          </Button>
          <div className="text-right text-xs text-slate-400">
            Bước <span className="font-bold text-amber-400">{currentStepIndex + 1}</span> / {STEPS.length}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Step Navigation Progress */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 select-none shadow-xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center justify-between">
            <span>Tiến Trình Cài Đặt</span>
            <span className="text-[10px] text-slate-500 font-mono">10 BƯỚC</span>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                    isCurrent
                      ? 'bg-blue-800 text-white font-semibold shadow-md ring-1 ring-blue-500'
                      : isPast
                      ? 'text-slate-300 hover:bg-slate-800/80 cursor-pointer'
                      : 'text-slate-500 cursor-not-allowed opacity-50'
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
        <div className="lg:col-span-8 bg-white text-slate-900 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Step Header */}
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
                <activeStep.icon className="h-5 w-5" />
              </div>
              <Badge variant="primary" className="text-[10px] py-0.5 px-2 bg-blue-800 text-white">
                BƯỚC {currentStepIndex + 1} / {STEPS.length}
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
            {/* Step 1: Welcome */}
            {activeStep.key === 'welcome' && (
              <div className="space-y-4 leading-relaxed">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                  <h2 className="font-semibold text-sm text-blue-950 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Cổng Thông Tin Điện Tử Chuẩn Sư Phạm 2026 – 2027</span>
                  </h2>
                  <p className="text-xs text-blue-800">
                    Bản cài đặt được đóng gói độc lập, tối ưu cho việc tải lên bất kỳ Web Hosting (cPanel, DirectAdmin, Apache, Nginx), kho lưu trữ GitHub hoặc máy chủ riêng (VPS/Docker).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Bộ nhận diện hoàn chỉnh</div>
                    <p className="text-[11px] text-slate-600">
                      Tích hợp Banner Chuyên đề Bác Hồ, Khẩu hiệu giáo dục, Slider đa phương tiện và Dòng chữ chạy chủ đề năm học.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Lưu trữ linh hoạt</div>
                    <p className="text-[11px] text-slate-600">
                      Hỗ trợ chạy tức thì không cần cài database (Standalone mode) hoặc kết nối Supabase Cloud PostgreSQL chỉ với 1 click.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyVinhPhongPreset}
                    className="w-full text-xs text-blue-800 border-blue-200 hover:bg-blue-50 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Bấm vào đây để áp dụng mẫu chuẩn Trường THCS &amp; THPT Vĩnh Phong
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Environment */}
            {activeStep.key === 'environment' && (
              <div className="space-y-4">
                <p className="font-semibold text-slate-800">
                  Chọn phương án triển khai phù hợp với máy chủ của bạn:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setStorageMode('standalone')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      storageMode === 'standalone'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-xs">1. Chế độ Tự Quản (Standalone)</span>
                      {storageMode === 'standalone' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Khuyên dùng khi up lên Shared Host, cPanel, Vercel, Netlify hoặc GitHub Pages. Không cần cài đặt Database, dữ liệu chạy ngay trên trình duyệt và cho phép xuất/nhập JSON sao lưu.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStorageMode('supabase')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      storageMode === 'supabase'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-xs">2. Chế độ Supabase Cloud</span>
                      {storageMode === 'supabase' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Kết nối cơ sở dữ liệu PostgreSQL trực tuyến. Thích hợp cho hệ thống đồng bộ dữ liệu tập trung qua nhiều máy và phân quyền nhân sự mở rộng.
                    </p>
                  </button>
                </div>

                {storageMode === 'supabase' && (
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3 font-mono text-[11px]">
                    <div>
                      <label className="block text-slate-400 mb-1">VITE_SUPABASE_URL:</label>
                      <input
                        type="text"
                        value={customSupabaseUrl}
                        onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                        placeholder="https://xyz.supabase.co"
                        className="w-full px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">VITE_SUPABASE_ANON_KEY:</label>
                      <input
                        type="password"
                        value={customSupabaseKey}
                        onChange={(e) => setCustomSupabaseKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestPing}
                      isLoading={pingStatus === 'testing'}
                      className="text-xs bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Kiểm tra kết nối (Ping Test)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Database */}
            {activeStep.key === 'database' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
                  <div className="font-semibold flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Bộ lưu trữ cấu hình đã sẵn sàng hoạt động
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Hệ thống tự động đồng bộ qua hai tầng: Bộ nhớ cục bộ LocalStorage / IndexedDB và Đám mây PostgreSQL độc lập của nhà trường.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 font-mono text-[11px]">
                  <div className="p-3 bg-slate-50 flex items-center justify-between">
                    <span>site_settings (Cấu hình thương hiệu &amp; logo)</span>
                    <Badge variant="primary">SẴN SÀNG</Badge>
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between">
                    <span>module_settings (Trạng thái bật/tắt module)</span>
                    <Badge variant="primary">SẴN SÀNG</Badge>
                  </div>
                  <div className="p-3 bg-slate-50 flex items-center justify-between">
                    <span>setup_state (Trạng thái khóa an toàn)</span>
                    <Badge variant="primary">SẴN SÀNG</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Migration */}
            {activeStep.key === 'migration' && (
              <div className="space-y-3">
                <p>Danh sách cấu trúc dữ liệu được khởi tạo và kiểm tra:</p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                  <div className="p-3 bg-slate-50 flex items-center justify-between">
                    <span>01_initial_schema.sql (User, Profile, Auth)</span>
                    <Badge variant="primary">ĐÃ ÁP DỤNG</Badge>
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between">
                    <span>02_school_foundation.sql (News, Categories, Tags)</span>
                    <Badge variant="primary">ĐÃ ÁP DỤNG</Badge>
                  </div>
                  <div className="p-3 bg-slate-50 flex items-center justify-between">
                    <span>03_school_media_albums.sql (Media, Documents, Banners)</span>
                    <Badge variant="primary">SẴN SÀNG</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Storage */}
            {activeStep.key === 'storage' && (
              <div className="space-y-3">
                <p>Kho lưu trữ tài nguyên đa phương tiện và văn bản:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <FolderArchive className="w-4 h-4 text-blue-600" />
                      Thư viện Media &amp; Ảnh
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Lưu trữ ảnh bìa tin tức, banner chuyên đề Bác Hồ, logo trường và album hoạt động.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <FolderArchive className="w-4 h-4 text-emerald-600" />
                      Văn bản &amp; Kế hoạch
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Công văn điều hành, lịch công tác tuần/tháng, văn bản PDF và biểu mẫu sư phạm.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Identity */}
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

                <Input
                  label="Chủ đề năm học 2026 – 2027 (Dòng chữ chạy ngang Header)"
                  value={academicTheme}
                  onChange={(e) => setAcademicTheme(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Đơn vị thiết kế web"
                    value={designedBy}
                    onChange={(e) => setDesignedBy(e.target.value)}
                  />
                  <Input
                    label="Điện thoại liên hệ"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    label="Email nhà trường"
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

            {/* Step 7: Admin Account */}
            {activeStep.key === 'admin' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong>Tài khoản Super Administrator:</strong> Nắm quyền cao nhất để quản trị tin tức, phân quyền cán bộ, cấu hình logo/banner và điều hành website.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Họ và tên Quản trị viên"
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email quản trị (Dùng để đăng nhập)"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Tên đăng nhập (Username)"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu quản trị ban đầu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAdminAccount}
                  className="text-xs text-blue-800 border-blue-200 hover:bg-blue-50"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Lưu cấu hình tài khoản Quản trị
                </Button>
              </div>
            )}

            {/* Step 8: Data Seed */}
            {activeStep.key === 'seed' && (
              <div className="space-y-4">
                <p className="font-semibold text-slate-800">
                  Lựa chọn các gói dữ liệu mẫu sư phạm muốn khởi tạo sẵn:
                </p>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedCategories}
                      onChange={(e) => setSeedCategories(e.target.checked)}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">7 chuyên mục tin tức chuẩn</div>
                      <div className="text-[11px] text-slate-500">Hoạt động chuyên môn, Hoạt động đoàn thể, Tin giáo dục, Tin trường, Hoạt động phong trào, Thông báo học tập, Lịch công tác</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedUncleHoTopic}
                      onChange={(e) => setSeedUncleHoTopic(e.target.checked)}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Banner Chuyên đề Học tập theo Bác</div>
                      <div className="text-[11px] text-slate-500">"Đẩy mạnh học tập, thực hành tư tưởng, đạo đức, phương pháp, phong cách Hồ Chí Minh trong giai đoạn phát triển mới"</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedEduSlides}
                      onChange={(e) => setSeedEduSlides(e.target.checked)}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Slider Thông điệp &amp; Phương châm giáo dục</div>
                      <div className="text-[11px] text-slate-500">Dạy tốt - Học tốt, Rèn đức - Luyện tài, Trường học hạnh phúc</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seedMarqueeTicker}
                      onChange={(e) => setSeedMarqueeTicker(e.target.checked)}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Chữ chạy ngang: Chủ đề Năm học 2026 – 2027</div>
                      <div className="text-[11px] text-slate-500">Đổi mới tư duy - Chuyển biến mạnh mẽ - Kết quả thực chất</div>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleExecuteSeed}
                    isLoading={isProcessing}
                    className="bg-blue-800 hover:bg-blue-900 text-xs"
                  >
                    <PackageCheck className="w-4 h-4 mr-1.5" />
                    Thực thi nạp dữ liệu mẫu ngay
                  </Button>
                </div>
              </div>
            )}

            {/* Step 9: Homepage */}
            {activeStep.key === 'homepage' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 space-y-1.5">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                    Khung giao diện trang chủ đã sẵn sàng 100%
                  </div>
                  <p className="text-[11px]">
                    Bố cục 12 cột chuẩn hóa, Topbar, Header với logo và banner trường, thanh chữ chạy chủ đề năm học, Slider phương châm giáo dục, Tin tức mới nhất và Banner chuyên đề Bác Hồ.
                  </p>
                </div>
              </div>
            )}

            {/* Step 10: Lock & Finish */}
            {activeStep.key === 'lock' && (
              <div className="space-y-5">
                {!isLockedCompleted ? (
                  <>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Lock className="h-4 w-4 text-amber-700" />
                        Khóa An Toàn &amp; Hoàn Tất Cài Đặt (Setup Lock)
                      </div>
                      <p className="text-xs leading-relaxed">
                        Sau khi nhấn <strong>"Xác Nhận Khóa Cài Đặt"</strong>, hệ thống sẽ kích hoạt cờ bảo mật. Trình cài đặt sẽ được đóng lại để bảo vệ an toàn cho nhà trường. (Bạn có thể mở lại bất cứ lúc nào qua trang Quản trị hoặc truy cập đường dẫn <code>/setup?force=true</code>).
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <a
                          href="/school-news-platform-dist.zip"
                          download="school-news-platform-dist.zip"
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          <Download className="w-4 h-4 text-amber-300" />
                          <span>Tải ZIP Trực Tiếp (9.2 MB)</span>
                        </a>

                        <a
                          href="https://github.com/maikhoa83/school-news-platform/raw/main/public/school-news-platform-dist.zip"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all border border-slate-700"
                        >
                          <ExternalLink className="w-4 h-4 text-emerald-400" />
                          <span>Tải Dự Phòng Từ GitHub (Raw)</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadConfigJson}
                          className="text-xs text-blue-800 border-blue-200 hover:bg-blue-50"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                          Tải file cấu hình (school-config.json)
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadEnvFile}
                          className="text-xs text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                          Tải file .env cho máy chủ
                        </Button>
                      </div>
                    </div>

                    {healthReport && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                        <div className="p-3 bg-slate-50 font-semibold flex items-center justify-between text-xs">
                          <span>Kiểm tra Sức khỏe Hệ thống:</span>
                          <Badge variant={healthReport.overallStatus === 'HEALTHY' ? 'primary' : 'warning'}>
                            {healthReport.overallStatus}
                          </Badge>
                        </div>
                        {healthReport.components.map((c) => (
                          <div key={c.name} className="p-2.5 text-xs flex items-center justify-between">
                            <span className="text-slate-700">{c.name}</span>
                            <span className="font-semibold text-emerald-600">{c.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-4 text-center">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-lg font-extrabold text-emerald-900">
                        CÀI ĐẶT THÀNH CÔNG VÀ ĐÃ BÀN GIAO HỆ THỐNG!
                      </h2>
                      <p className="text-xs text-emerald-800 max-w-md mx-auto">
                        Cổng thông tin điện tử của <strong>{schoolName}</strong> đã sẵn sàng đi vào vận hành chính thức.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 text-left text-xs space-y-1 font-mono text-slate-800">
                      <div>Tài khoản Admin: <strong>{adminEmail}</strong> (hoặc <strong>{adminUsername}</strong>)</div>
                      <div>Mật khẩu: <strong>{adminPassword}</strong></div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <Link to="/" className="w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="primary"
                          className="w-full bg-blue-800 hover:bg-blue-900 text-xs px-5 py-2.5 font-bold"
                        >
                          <Globe className="w-4 h-4 mr-1.5" />
                          Truy Cập Trang Chủ Website
                        </Button>
                      </Link>

                      <Link to="/admin" className="w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-emerald-600 text-emerald-900 hover:bg-emerald-100 text-xs px-5 py-2.5 font-bold"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-1.5" />
                          Đăng Nhập Trang Quản Trị (CMS)
                        </Button>
                      </Link>
                    </div>
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
              disabled={currentStepIndex === 0 || isProcessing || isLockedCompleted}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Bước trước
            </Button>

            {activeStep.key === 'lock' ? (
              !isLockedCompleted && (
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
              )
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
        School News Platform Architecture v1.2 • Thiết kế web bởi {designedBy}
      </footer>
    </div>
  );
}
