/**
 * Marquee / News Ticker Service
 * Manages school school-year themes or monthly educational focal points
 */

export interface MarqueeConfig {
  isEnabled: boolean;
  badgeText: string;
  content: string;
  speed: 'slow' | 'normal' | 'fast';
  linkUrl?: string;
}

export const DEFAULT_MARQUEE_CONFIG: MarqueeConfig = {
  isEnabled: true,
  badgeText: 'CHỦ ĐỀ NĂM HỌC 2026 – 2027',
  content:
    'Năm học 2026 - 2027: "Đổi mới tư duy - Chuyển biến mạnh mẽ - Kết quả thực chất". Thầy và trò Trường THCS & THPT Vĩnh Phong quyết tâm thi đua dạy tốt, học tốt, đổi mới căn bản toàn diện và nâng cao chất lượng giáo dục!',
  speed: 'normal',
  linkUrl: '/news',
};

const STORAGE_KEY = 'school_marquee_banner_v2';

export function getMarqueeConfig(): MarqueeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MARQUEE_CONFIG));
      return { ...DEFAULT_MARQUEE_CONFIG };
    }
    const parsed = JSON.parse(raw);
    if (parsed.badgeText && (parsed.badgeText.includes('2025') || parsed.badgeText.includes('2024'))) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MARQUEE_CONFIG));
      return { ...DEFAULT_MARQUEE_CONFIG };
    }
    return { ...DEFAULT_MARQUEE_CONFIG, ...parsed };
  } catch (err) {
    console.warn('[marqueeService] Error loading config:', err);
    return { ...DEFAULT_MARQUEE_CONFIG };
  }
}

export function saveMarqueeConfig(config: MarqueeConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('school_marquee_updated'));
    return true;
  } catch (err) {
    console.error('[marqueeService] Error saving config:', err);
    return false;
  }
}
