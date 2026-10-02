import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { NavigationItem } from '../../navigation/types';
import { publicNavigationItems } from '../../navigation/publicNavigation';
import { SchoolIdentityConfig } from '../../types';
import { PublicMenu } from '../../modules/menu/components/PublicMenu';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import { useAuth } from '../../hooks/useAuth';

export interface PublicHeaderProps {
  schoolIdentity: SchoolIdentityConfig;
  navItems?: NavigationItem[];
  onToggleMobileNav: () => void;
  isMobileNavOpen?: boolean;
}

export function PublicHeader({
  schoolIdentity,
  navItems = publicNavigationItems,
  onToggleMobileNav,
  isMobileNavOpen = false,
}: PublicHeaderProps) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, roles, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isSuperAdmin = roles.includes('SUPER_ADMIN');

  // Format current Vietnamese date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = [
        'Chủ Nhật',
        'Thứ Hai',
        'Thứ Ba',
        'Thứ Tư',
        'Thứ Năm',
        'Thứ Sáu',
        'Thứ Bảy',
      ];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentDateTime(`${dayName}, ${day}/${month}/${year} | ${hours}:${minutes}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/news/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Quản trị viên';
  const displayRole = isSuperAdmin
    ? 'Super Admin'
    : roles && roles.length > 0
    ? roles[0]
    : 'Thành viên';

  return (
    <>
      <header className="w-full bg-white">
        {/* 1. Top Utility Bar: Thời gian, Sitemap, Liên hệ, Social, và ĐĂNG NHẬP / HỒ SƠ NGƯỜI DÙNG */}
        <div className="bg-[#002b66] text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-blue-900/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Day & Date & Time */}
            <div className="text-[11px] sm:text-xs font-medium text-slate-200 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentDateTime || 'Thứ Năm, 01/10/2026 | 08:30'}</span>
            </div>

            {/* Right: Sitemap, Liên hệ, Social Icons & Login / User Profile */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs">
              <Link
                to="/sitemap"
                className="hidden sm:inline text-slate-300 hover:text-white transition-colors text-[11px] sm:text-xs"
              >
                Sitemap
              </Link>
              <span className="hidden sm:inline text-blue-400/40">|</span>
              <Link
                to="/contact"
                className="hidden sm:inline text-slate-300 hover:text-white transition-colors text-[11px] sm:text-xs"
              >
                Liên hệ
              </Link>
              <span className="hidden sm:inline text-blue-400/40">|</span>

              {/* Social icons */}
              <div className="hidden md:flex items-center gap-1.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="h-5 w-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold hover:opacity-90 transition-opacity"
                >
                  f
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="h-5 w-5 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 20c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 4c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                  </svg>
                </a>
              </div>

              <span className="hidden sm:inline text-blue-400/40">|</span>

              {/* Login / User Profile Area */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-800/80 hover:bg-blue-800 text-white font-medium transition-all border border-blue-600/50 shadow-xs"
                  >
                    <div className="w-4 h-4 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-[9px]">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-300" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Shield className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-xs">
                            {displayRole}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-blue-700" />
                        <span>Bảng điều khiển quản trị</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] sm:text-xs shadow-xs transition-colors"
                >
                  <User className="w-3 h-3" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 2. Main Branding Header Banner: Chiều cao chuẩn 110 - 120px với họa tiết học đường & màu nền */}
        <div className="relative w-full min-h-[110px] sm:min-h-[120px] bg-gradient-to-r from-blue-900 via-[#003B8E] to-blue-800 text-white overflow-hidden shadow-sm flex items-center">
          {/* Subtle Background Pattern */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url('/school_header_pattern.jpg')` }}
          />

          {/* Educational Pattern Graphic Waves */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full flex items-center justify-between gap-4">
            {/* Left: Official Logo + School Title */}
            <Link to="/" className="flex items-center gap-3 sm:gap-5 group py-1">
              {/* Logo container with gentle shadow */}
              <div className="shrink-0 p-1 sm:p-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border-2 border-amber-400/80 group-hover:scale-105 transition-transform duration-300">
                <SchoolLogo size={80} className="h-16 w-16 sm:h-20 sm:w-20" />
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-widest drop-shadow-xs">
                  SỞ GIÁO DỤC VÀ ĐÀO TẠO AN GIANG
                </p>
                <h1 className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase drop-shadow-md group-hover:text-amber-200 transition-colors">
                  TRƯỜNG THCS &amp; THPT VĨNH PHONG
                </h1>
                <p className="text-[11px] sm:text-xs text-blue-100 font-medium tracking-wide flex items-center gap-2">
                  <span className="text-amber-300 font-bold">DẠY TỐT - HỌC TỐT</span>
                  <span className="hidden md:inline text-blue-300">•</span>
                  <span className="hidden md:inline text-blue-200">Xã Vĩnh Phong, Tỉnh An Giang</span>
                </p>
              </div>
            </Link>

            {/* Right: Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={onToggleMobileNav}
                aria-expanded={isMobileNavOpen}
                aria-label="Mở thực đơn điều hướng"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Primary Navigation Bar: Menu ngang với Icon Search xổ xuống dropdown */}
      <div className="hidden md:block sticky top-0 z-40 bg-[#002b66] text-white shadow-md border-b-2 border-amber-400 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Main Navigation Menu */}
          <div className="flex-1">
            <PublicMenu items={navItems} />
          </div>

          {/* Search Trigger Button on the right of navigation bar */}
          <div className="relative shrink-0 ml-4 py-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Mở khung tìm kiếm"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSearchOpen
                  ? 'bg-amber-400 text-blue-950 shadow-inner'
                  : 'bg-blue-900/60 hover:bg-blue-800 text-white border border-blue-700/60'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Tìm kiếm</span>
            </button>

            {/* Search Dropdown Modal / Box */}
            {isSearchOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in-50 slide-in-from-top-2">
                <form onSubmit={handleSearch} className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Tìm kiếm bài viết, tài liệu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs rounded-lg pl-3 pr-8 py-2 border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-800 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-[#003B8E] hover:bg-blue-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shrink-0 shadow-xs"
                  >
                    Tìm
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
