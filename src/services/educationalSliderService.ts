/**
 * Educational Slider Service
 * Manages school educational messages, mottos, and slides
 */

export interface EducationalSlide {
  id: string;
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  isActive: boolean;
  order: number;
}

export const DEFAULT_EDUCATIONAL_SLIDES: EducationalSlide[] = [
  {
    id: 'slide-1',
    tag: 'THÔNG ĐIỆP GIÁO DỤC',
    title: 'MỖI HỌC SINH LÀ MỘT NGỌN LỬA',
    highlight: 'THẮP SÁNG TƯƠNG LAI',
    subtitle: 'Nhà trường là bệ phóng ươm mầm ước mơ, chắp cánh tri thức và bồi dưỡng nhân cách toàn diện.',
    image: '/education_slide_study.jpg',
    isActive: true,
    order: 1,
  },
  {
    id: 'slide-2',
    tag: 'PHƯƠNG CHÂM SƯ PHẠM',
    title: 'DẠY TỐT - HỌC TỐT',
    highlight: 'RÈN ĐỨC - LUYỆN TÀI',
    subtitle: 'Đổi mới phương pháp giảng dạy, khơi dậy đam mê sáng tạo, tư duy tự chủ và tự học suốt đời.',
    image: '/education_slide_growth.jpg',
    isActive: true,
    order: 2,
  },
  {
    id: 'slide-3',
    tag: 'MỤC TIÊU PHÁT TRIỂN',
    title: 'XÂY DỰNG TRƯỜNG HỌC HẠNH PHÚC',
    highlight: 'THÂN THIỆN & SÁNG TẠO',
    subtitle: 'Thầy cô tận tâm mẫu mực - Học sinh đoàn kết, trung thực, trách nhiệm và giàu khát vọng cống hiến.',
    image: '/school_header_pattern.jpg',
    isActive: true,
    order: 3,
  },
  {
    id: 'slide-4',
    tag: 'TRUYỀN THỐNG NHÀ TRƯỜNG',
    title: 'TỰ HÀO TRƯỜNG THCS & THPT VĨNH PHONG',
    highlight: 'VỮNG BƯỚC VƯƠN XA',
    subtitle: 'Kế thừa và phát huy truyền thống hiếu học quê hương Vĩnh Phong, nâng cao chất lượng giáo dục mũi nhọn.',
    image: '/vinh_phong_logo.jpg',
    isActive: true,
    order: 4,
  },
];

const STORAGE_KEY = 'school_educational_slides_v1';

export function getEducationalSlides(): EducationalSlide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EDUCATIONAL_SLIDES));
      return [...DEFAULT_EDUCATIONAL_SLIDES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [...DEFAULT_EDUCATIONAL_SLIDES];
  } catch (err) {
    console.warn('[educationalSliderService] Error loading slides:', err);
    return [...DEFAULT_EDUCATIONAL_SLIDES];
  }
}

export function saveEducationalSlides(slides: EducationalSlide[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    // Trigger custom event so any active component can re-render immediately
    window.dispatchEvent(new Event('school_educational_slides_updated'));
    return true;
  } catch (err) {
    console.error('[educationalSliderService] Error saving slides:', err);
    return false;
  }
}

export function resetToDefaultEducationalSlides(): EducationalSlide[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EDUCATIONAL_SLIDES));
    window.dispatchEvent(new Event('school_educational_slides_updated'));
    return [...DEFAULT_EDUCATIONAL_SLIDES];
  } catch {
    return [...DEFAULT_EDUCATIONAL_SLIDES];
  }
}
