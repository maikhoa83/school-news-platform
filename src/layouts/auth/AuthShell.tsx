import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SchoolLogo } from '../../components/common/SchoolLogo';
import campusFacadeImg from '../../assets/images/campus_facade.jpg';

export interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
      {/* Return to homepage button */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200 shadow-md hover:bg-white hover:text-blue-900 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Về trang chủ</span>
      </Link>

      {/* Main Container Card: 2-column split matching the approved design */}
      <div className="w-full max-w-5xl bg-white sm:rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Column: School Campus Image with Deep Blue Overlay & Official Branding */}
        <div className="lg:col-span-6 relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden bg-blue-950">
          {/* Background School Campus Facade */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url(${campusFacadeImg})` }}
          />
          {/* Rich Blue Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/90 to-blue-800/80" />

          {/* Top spacer */}
          <div className="relative z-10" />

          {/* Center Brand Identity */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto py-8">
            {/* White Circular School Crest */}
            <div className="mb-6 p-2 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 shadow-lg">
              <SchoolLogo size={90} className="h-24 w-24 text-white" variant="white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
              TRƯỜNG THCS &amp; THPT VĨNH PHONG
            </h1>

            <p className="mt-2 text-sm sm:text-base text-amber-300 font-bold tracking-wider uppercase">
              Dạy tốt - Học tốt
            </p>

            <div className="w-16 h-0.5 bg-white/30 my-4" />

            <p className="text-xs sm:text-sm text-blue-100 max-w-sm leading-relaxed">
              Hệ thống quản trị nội dung website
              <br />
              Trường THCS &amp; THPT Vĩnh Phong
            </p>
          </div>

          {/* Bottom subtle building illustration */}
          <div className="relative z-10 text-center text-[11px] text-blue-200/70">
            Cổng thông tin điện tử & quản lý dữ liệu số học đường
          </div>
        </div>

        {/* Right Column: Clean White Login Form Area */}
        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="w-full max-w-sm mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
