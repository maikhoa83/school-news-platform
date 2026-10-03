import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import {
  getEducationalSlides,
  DEFAULT_EDUCATIONAL_SLIDES,
  EducationalSlide,
} from '../../services/educationalSliderService';

export function EducationalMessageSlider() {
  const [slides, setSlides] = useState<EducationalSlide[]>(() => {
    const loaded = getEducationalSlides().filter((s) => s.isActive !== false);
    return loaded.length > 0 ? loaded : DEFAULT_EDUCATIONAL_SLIDES;
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sync slides on custom update event or storage change
  useEffect(() => {
    const updateHandler = () => {
      const active = getEducationalSlides().filter((s) => s.isActive !== false);
      setSlides(active.length > 0 ? active : DEFAULT_EDUCATIONAL_SLIDES);
      setCurrentSlide(0);
    };

    window.addEventListener('school_educational_slides_updated', updateHandler);
    window.addEventListener('storage', updateHandler);
    return () => {
      window.removeEventListener('school_educational_slides_updated', updateHandler);
      window.removeEventListener('storage', updateHandler);
    };
  }, []);

  // Auto transition every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const activeIndex = currentSlide % slides.length;
  const slide = slides[activeIndex];

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#002b66] via-[#003B8E] to-[#0284c7] shadow-md border-2 border-blue-400/30 text-white h-[200px] sm:h-[180px] md:h-[185px]">
      {/* Background Graphic Pattern Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/25 pointer-events-none" />

      {/* Locked uniform inner layout */}
      <div className="relative w-full h-full flex flex-row items-stretch justify-between">
        {/* Left: Message content (Takes 60% locked width) */}
        <div className="w-3/5 h-full p-4 sm:p-5 md:p-6 z-10 flex flex-col justify-center space-y-1 sm:space-y-1.5 overflow-hidden">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{slide.tag}</span>
            </span>
          </div>

          <h3 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-wide leading-tight uppercase drop-shadow-sm line-clamp-2">
            {slide.title}{' '}
            <span className="text-amber-300 inline">{slide.highlight}</span>
          </h3>

          <p className="text-xs sm:text-sm text-blue-100 font-medium line-clamp-2 leading-relaxed">
            {slide.subtitle}
          </p>
        </div>

        {/* Right: Scaled Image (Takes 40% locked width and 100% locked height, strictly object-cover) */}
        <div className="w-2/5 h-full relative overflow-hidden shrink-0">
          <img
            key={slide.id}
            src={slide.image || '/campus_facade.jpg'}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlay to blend into blue background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#002b66] via-[#003B8E]/30 to-transparent" />
        </div>
      </div>

      {/* Navigation arrows (compact) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
            }
            aria-label="Thông điệp trước"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-xs z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            aria-label="Thông điệp kế tiếp"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-xs z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Chuyển đến thông điệp ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
