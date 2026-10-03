import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../hooks/useAuth';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import { supabase } from '../../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, isLoading: isAuthLoading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '/admin';

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const redirectUri = window.location.origin + redirectUrl;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
        },
      });
      if (error) {
        setErrorMessage(`Đăng nhập Google thất bại: ${error.message}`);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Không thể kết nối với dịch vụ đăng nhập Google.'
      );
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Normalize username to standard email format if entered without domain
      const emailValue = usernameOrEmail.includes('@')
        ? usernameOrEmail.trim()
        : `${usernameOrEmail.trim()}@truong.edu.vn`;

      const result = await signIn(emailValue, password);
      if (!result.success) {
        setErrorMessage(
          result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
        );
        setIsSubmitting(false);
        return;
      }

      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi trong quá trình xác thực.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Prominent School Logo */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="p-1.5 rounded-full bg-blue-50 border border-blue-200/60 shadow-xs">
            <SchoolLogo size={68} className="h-16 w-16" />
          </div>
        </div>
        <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">
          TRƯỜNG THCS &amp; THPT VĨNH PHONG
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          ĐĂNG NHẬP HỆ THỐNG
        </h2>
        <p className="text-xs text-slate-500">
          Vui lòng nhập thông tin tài khoản hoặc sử dụng Google để truy cập
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger" title="Đăng nhập không thành công">
          {errorMessage}
        </Alert>
      )}

      {/* Google Sign-in Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs hover:border-slate-400 transition-all cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Đang kết nối Google...' : 'Đăng nhập với Google'}</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          HOẶC TÀI KHOẢN NỘI BỘ
        </span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username input */}
        <div className="space-y-1">
          <div className="relative flex items-center">
            <User className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full text-xs sm:text-sm pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Password input with toggle */}
        <div className="space-y-1">
          <div className="relative flex items-center">
            <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-800">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert('Vui lòng liên hệ Quản trị viên nhà trường để được cấp lại mật khẩu.');
            }}
            className="text-blue-700 hover:text-blue-800 hover:underline font-medium"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit button matching mockup */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-2.5 text-sm font-semibold bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
            disabled={isSubmitting || isAuthLoading}
            isLoading={isSubmitting}
          >
            Đăng nhập
          </Button>
        </div>
      </form>

      {/* Footer Copyright */}
      <div className="pt-8 text-center text-[11px] text-slate-400">
        © 2026 Trường THCS &amp; THPT Vĩnh Phong. All rights reserved. · Thiết kế web bởi <strong className="font-semibold text-slate-500">MVK</strong>
      </div>
    </div>
  );
}
