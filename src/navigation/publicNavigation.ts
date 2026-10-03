import {
  Home,
  Newspaper,
  Info,
  FileText,
  Bell,
  Image,
  Radio,
  PhoneCall,
} from 'lucide-react';
import { NavigationItem } from './types';

/**
 * Public Navigation Configuration
 * Exact sequence:
 * 1. TRANG CHỦ
 * 2. GIỚI THIỆU (Tổng quan nhà trường, Cơ cấu tổ chức & Đội ngũ, Tầm nhìn & Sứ mệnh)
 * 3. TIN TỨC (Hoạt động nhà trường, Điểm tin giáo dục)
 * 4. TRUYỀN THÔNG (Điểm tin giáo dục, Gương sáng giáo dục, Phổ biến pháp luật)
 * 5. VĂN BẢN
 * 6. THÔNG BÁO
 * 7. THƯ VIỆN
 * 8. LIÊN HỆ
 */
export const publicNavigationItems: NavigationItem[] = [
  {
    key: 'home',
    label: 'TRANG CHỦ',
    href: '/',
    icon: Home,
  },
  {
    key: 'about',
    label: 'GIỚI THIỆU',
    href: '/page/gioi-thieu',
    icon: Info,
    children: [
      {
        key: 'about-school',
        label: 'Tổng quan nhà trường',
        href: '/page/gioi-thieu',
        description: 'Lịch sử phát triển và truyền thống nhà trường',
      },
      {
        key: 'about-board',
        label: 'Cơ cấu tổ chức & Đội ngũ',
        href: '/page/co-cau-to-chuc',
        description: 'Ban Giám hiệu, đoàn thể và các tổ chuyên môn',
      },
      {
        key: 'about-vision',
        label: 'Tầm nhìn & Sứ mệnh',
        href: '/page/gioi-thieu',
        description: 'Tri thức - Nhân ái - Kỷ cương - Sáng tạo',
      },
    ],
  },
  {
    key: 'news',
    label: 'TIN TỨC',
    href: '/news',
    icon: Newspaper,
    moduleKey: 'news',
    children: [
      {
        key: 'news-school-activities',
        label: 'Hoạt động nhà trường',
        href: '/news?cat=hoat-dong-nha-truong',
        description: 'Tin tức sinh hoạt chuyên môn, hội thi và đoàn thể',
      },
      {
        key: 'news-education-bulletin',
        label: 'Điểm tin giáo dục',
        href: '/news?cat=diem-tin-giao-duc',
        description: 'Các sự kiện giáo dục trọng đại và phong trào thi đua',
      },
    ],
  },
  {
    key: 'media-comms',
    label: 'TRUYỀN THÔNG',
    href: '/news?cat=truyen-thong',
    icon: Radio,
    moduleKey: 'news',
    children: [
      {
        key: 'comms-news-bulletin',
        label: 'Điểm tin giáo dục',
        href: '/news?cat=diem-tin-giao-duc',
        description: 'Bản tin tổng hợp các hoạt động nổi bật của nhà trường',
      },
      {
        key: 'comms-bright-examples',
        label: 'Gương sáng giáo dục',
        href: '/news?cat=guong-sang-gd',
        description: 'Tuyên dương thầy cô dạy giỏi và học sinh tiêu biểu',
      },
      {
        key: 'comms-legal-education',
        label: 'Phổ biến pháp luật',
        href: '/news?cat=pho-bien-phap-luat',
        description: 'An toàn giao thông, văn hóa mạng và kỹ năng sống',
      },
    ],
  },
  {
    key: 'documents',
    label: 'VĂN BẢN',
    href: '/documents',
    icon: FileText,
    moduleKey: 'documents',
  },
  {
    key: 'announcements',
    label: 'THÔNG BÁO',
    href: '/announcements',
    icon: Bell,
    moduleKey: 'announcements',
  },
  {
    key: 'media',
    label: 'THƯ VIỆN',
    href: '/media',
    icon: Image,
    moduleKey: 'albums',
  },
  {
    key: 'contact',
    label: 'LIÊN HỆ',
    href: '/page/lien-he',
    icon: PhoneCall,
  },
];
