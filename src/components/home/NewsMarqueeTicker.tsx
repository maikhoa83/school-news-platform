import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMarqueeConfig, MarqueeConfig, DEFAULT_MARQUEE_CONFIG } from '../../services/marqueeService';

export function NewsMarqueeTicker() {
  const [config, setConfig] = useState<MarqueeConfig>(getMarqueeConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getMarqueeConfig());
    };
    window.addEventListener('school_marquee_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('school_marquee_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!config.isEnabled || !config.content?.trim()) {
    return null;
  }

  // Animation duration based on speed
  const durationMap = {
    slow: '35s',
    normal: '25s',
    fast: '16s',
  };
  const duration = durationMap[config.speed] || '25s';

  const contentElement = (
    <span className="inline-block font-semibold text-slate-800 text-xs sm:text-sm tracking-wide">
      {config.content}
    </span>
  );

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 via-white to-blue-50 border-y border-amber-200/80 shadow-2xs overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3">
        {/* Left Badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-red-600 to-amber-600 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
          <Megaphone className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          <span>{config.badgeText || 'CHỦ ĐỀ NĂM HỌC'}</span>
        </div>

        {/* Scrolling text container */}
        <div className="flex-1 overflow-hidden relative group cursor-default">
          <div
            className="whitespace-nowrap flex items-center gap-8 group-hover:[animation-play-state:paused]"
            style={{
              animation: `marqueeTicker ${duration} linear infinite`,
            }}
          >
            {config.linkUrl ? (
              <Link
                to={config.linkUrl}
                className="hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                {contentElement}
                <ChevronRight className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />
              </Link>
            ) : (
              contentElement
            )}
            <span className="text-amber-500 font-bold">•</span>
            {config.linkUrl ? (
              <Link
                to={config.linkUrl}
                className="hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                {contentElement}
              </Link>
            ) : (
              contentElement
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueeTicker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
