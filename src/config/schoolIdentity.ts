import { SchoolIdentityConfig } from '../types';

/**
 * Placeholder School Identity Configuration for Step 02 Core Shell
 *
 * PRODUCTIZATION RULE:
 * This is a neutral template configuration for independent school deployments.
 * It does NOT hardcode real school identities, logos, phone numbers, or domains.
 */
export const defaultSchoolIdentity: SchoolIdentityConfig = {
  school_name: 'Trường THPT Mẫu Chuẩn',
  short_name: 'THPT Mẫu Chuẩn',
  slogan: 'Kỷ cương - Tình thương - Trách nhiệm - Sáng tạo',
  logo_url: '',
  favicon_url: '',
  primary_color: '#1e3a8a',
  secondary_color: '#d97706',
  phone: '028.3800.xxxx',
  email: 'vanphong@truong.edu.vn',
  address: 'Số 123 Đường Giáo Dục, Quận Tri Thức, Thành phố Mẫu',
  website: 'https://truong.edu.vn',
  social_links: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    zalo: 'https://zalo.me',
  },
};
