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
  badgeText: 'CHỦ ĐỀ NĂM HỌC 2025 – 2026',
  content:
    'Nhiệt liệt chào mừng năm học mới! Thầy và trò Trường THCS & THPT Vĩnh Phong quyết tâm thi đua "Dạy tốt - Học tốt", tích cực đổi mới phương pháp giảng dạy, đẩy mạnh chuyển đổi số và xây dựng trường học hạnh phúc, an toàn, thân thiện!',
  speed: 'normal',
  linkUrl: '/news',
};

const STORAGE_KEY = 'school_marquee_banner_v1';

export function getMarqueeConfig(): MarqueeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MARQUEE_CONFIG));
      return { ...DEFAULT_MARQUEE_CONFIG };
    }
    const parsed = JSON.parse(raw);
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
