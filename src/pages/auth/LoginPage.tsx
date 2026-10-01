import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, isLoading: isAuthLoading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '/admin';

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
      {/* Header matching Mau quan tri và login.png */}
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">
          ĐĂNG NHẬP HỆ THỐNG
        </h2>
        <p className="text-xs text-slate-500">
          Vui lòng nhập thông tin tài khoản để đăng nhập
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger" title="Đăng nhập không thành công">
          {errorMessage}
        </Alert>
      )}

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
              className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
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
        © 2026 Trường THCS &amp; THPT Vĩnh Phong. All rights reserved.
      </div>
    </div>
  );
}
