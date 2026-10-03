import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import { SchoolIdentityConfig } from '../../types';
import { NavigationItem } from '../../navigation/types';
import sloganBannerImg from '../../assets/images/slogan_banner.jpg';

export interface PublicFooterProps {
  schoolIdentity?: SchoolIdentityConfig;
  navItems?: NavigationItem[];
  menuTitle?: string;
}

export function PublicFooter({
  schoolIdentity: propSchoolIdentity,
  navItems,
  menuTitle,
}: PublicFooterProps = {}) {
  const { schoolIdentity: contextSchoolIdentity } = useConfig();
  const schoolIdentity = propSchoolIdentity || contextSchoolIdentity;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#002b66] text-white">
      {/* Main Footer Information 3 Columns matching mockup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: School Identity (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              {schoolIdentity.school_name || 'TRƯỜNG THCS & THPT VĨNH PHONG'}
            </h3>
            <div className="space-y-2 text-xs text-blue-100/90 leading-relaxed pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  {schoolIdentity.address ||
                    'Xã Vĩnh Phong, Tỉnh An Giang'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-300 shrink-0" />
                <span>
                  Điện thoại: {schoolIdentity.phone || '0296 3829 123'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-300 shrink-0" />
                <span>
                  Email: {schoolIdentity.email || 'c3vinhphong@angiang.edu.vn'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (4 cols, 2 sub-columns) */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              LIÊN KẾT NHANH
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-100/90 pt-1">
              <div className="space-y-2">
                <div>
                  <Link to="/about" className="hover:text-amber-300 transition-colors">
                    Giới thiệu
                  </Link>
                </div>
                <div>
                  <Link to="/news" className="hover:text-amber-300 transition-colors">
                    Tin tức
                  </Link>
                </div>
                <div>
                  <Link to="/news?cat=truyen-thong" className="hover:text-amber-300 transition-colors">
                    Truyền thông
                  </Link>
                </div>
                <div>
                  <Link to="/documents" className="hover:text-amber-300 transition-colors">
                    Văn bản
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Link to="/announcements" className="hover:text-amber-300 transition-colors">
                    Thông báo
                  </Link>
                </div>
                <div>
                  <Link to="/media" className="hover:text-amber-300 transition-colors">
                    Thư viện Media
                  </Link>
                </div>
                <div>
                  <Link to="/contact" className="hover:text-amber-300 transition-colors">
                    Liên hệ
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Social & Visitor Counter (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              KẾT NỐI VỚI CHÚNG TÔI
            </h3>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-8 w-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity shadow-sm"
              >
                f
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="h-8 w-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 20c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 4c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                </svg>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo"
                className="h-8 w-8 rounded-full bg-[#0068FF] text-white flex items-center justify-center text-[10px] font-bold tracking-tight hover:opacity-90 transition-opacity shadow-sm"
              >
                Zalo
              </a>
            </div>

            {/* Visitor Counter */}
            <div className="pt-2 text-xs text-blue-100">
              <span>Lượt truy cập: </span>
              <strong className="text-amber-300 font-mono text-sm ml-1">
                125,678
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & MVK credit */}
      <div className="border-t border-blue-900 bg-[#001f4d] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-200/80">
          <div>
            © {currentYear} TRƯỜNG THCS & THPT VĨNH PHONG. All rights reserved.
          </div>
          <div>
            Thiết kế web bởi <span className="font-semibold text-white">MVK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
