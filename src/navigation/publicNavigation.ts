import {
  Home,
  Newspaper,
  Info,
  FileText,
  Bell,
  Image,
  BookOpen,
  Calendar,
  PhoneCall,
} from 'lucide-react';
import { NavigationItem } from './types';

/**
 * Public Navigation Configuration matching Trang chu_Chot.png
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
        key: 'news-school',
        label: 'Hoạt động nhà trường',
        href: '/news?cat=hoat-dong',
        description: 'Các hoạt động giáo dục, thi đua',
      },
      {
        key: 'news-events',
        label: 'Sự kiện học đường',
        href: '/news?cat=su-kien',
        description: 'Các ngày lễ kỷ niệm, hội thi',
      },
      {
        key: 'news-education',
        label: 'Tin ngành Giáo dục',
        href: '/news?cat=giao-duc',
        description: 'Chủ trương và chính sách mới',
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
    key: 'media-comms',
    label: 'TRUYỀN THÔNG',
    href: '/news?cat=truyen-thong',
    icon: Newspaper,
    children: [
      {
        key: 'media-school-activities',
        label: 'Hoạt động nhà trường',
        href: '/news?cat=hoat-dong',
        description: 'Tin tức hoạt động giáo dục và phong trào thi đua',
      },
      {
        key: 'media-school-events',
        label: 'Sự kiện học đường',
        href: '/news?cat=su-kien',
        description: 'Lễ hội, kỷ niệm và các chuyên đề ngoại khóa',
      },
      {
        key: 'media-edu-bulletin',
        label: 'Bản tin giáo dục',
        href: '/news?cat=giao-duc',
        description: 'Thông tin tuyên truyền, phổ biến giáo dục và kỹ năng',
      },
    ],
  },
  {
    key: 'contact',
    label: 'LIÊN HỆ',
    href: '/page/lien-he',
    icon: PhoneCall,
  },
];
