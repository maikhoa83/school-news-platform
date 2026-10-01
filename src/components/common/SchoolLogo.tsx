import React, { useState } from 'react';

export interface SchoolLogoProps {
  className?: string;
  size?: number;
  variant?: 'color' | 'white';
}

export function SchoolLogo({ className = 'h-12 w-12', size = 48, variant = 'color' }: SchoolLogoProps) {
  const [imgError, setImgError] = useState(false);

  // If white variant requested
  if (variant === 'white') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        {!imgError ? (
          <img
            src="/vinh_phong_logo.jpg"
            alt="Logo Trường THCS & THPT Vĩnh Phong"
            className="w-full h-full object-contain rounded-full brightness-0 invert drop-shadow-md"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Logo Trường THCS & THPT Vĩnh Phong"
          >
            <circle cx="60" cy="60" r="56" stroke="white" strokeWidth="4" />
            <circle cx="60" cy="60" r="50" fill="white" fillOpacity="0.15" />
            {/* Torch */}
            <path d="M60 22C64 28 68 30 65 37C63 41 61.5 42 60 44C58.5 42 57 41 55 37C52 30 56 28 60 22Z" fill="white" />
            {/* Book */}
            <path d="M42 50C50 46 56 48 60 50C64 48 70 46 78 50V68C70 64 64 66 60 68C56 66 50 64 42 68V50Z" fill="white" />
            {/* Ribbon banner */}
            <path d="M28 84L60 92L92 84V96L60 104L28 96V84Z" fill="white" />
            <text x="60" y="98" textAnchor="middle" fill="#0c326f" fontSize="7" fontWeight="bold">
              XÃ VĨNH PHONG
            </text>
          </svg>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src="/vinh_phong_logo.jpg"
          alt="Logo Trường THCS & THPT Vĩnh Phong"
          className="w-full h-full object-contain rounded-full shadow-xs"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Logo Trường THCS & THPT Vĩnh Phong"
        >
          {/* Outer circle */}
          <circle cx="60" cy="60" r="58" fill="#FFFFFF" />
          <circle cx="60" cy="60" r="55" stroke="#0c326f" strokeWidth="4" />
          <circle cx="60" cy="60" r="48" stroke="#0c326f" strokeWidth="1.5" />
          
          {/* Torch with green base and red flame */}
          <path d="M60 20C65 26 69 29 66 35C64 38 62 40 60 42C58 40 56 38 54 35C51 29 55 26 60 20Z" fill="#e3281c" />
          <rect x="53" y="42" width="14" height="4" rx="1" fill="#108544" />
          <rect x="55" y="46" width="10" height="3" rx="0.5" fill="#108544" />
          
          {/* Open Book */}
          <path d="M40 52C49 48 55 50 60 53C65 50 71 48 80 52V72C71 68 65 70 60 73C55 70 49 68 40 72V52Z" fill="#FFFFFF" stroke="#0c326f" strokeWidth="3" />
          <line x1="60" y1="53" x2="60" y2="73" stroke="#0c326f" strokeWidth="2.5" />
          
          {/* "DẠY TỐT - HỌC TỐT" text inside book */}
          <text x="49" y="60" textAnchor="middle" fill="#c51f1a" fontSize="5" fontWeight="bold">DẠY</text>
          <text x="49" y="66" textAnchor="middle" fill="#c51f1a" fontSize="5" fontWeight="bold">TỐT</text>
          <text x="71" y="60" textAnchor="middle" fill="#c51f1a" fontSize="5" fontWeight="bold">HỌC</text>
          <text x="71" y="66" textAnchor="middle" fill="#c51f1a" fontSize="5" fontWeight="bold">TỐT</text>
          
          {/* Bottom Ribbon Banner */}
          <path d="M22 84Q60 96 98 84V98Q60 110 22 98Z" fill="#0c326f" />
          <text x="60" y="94" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" letterSpacing="0.8">
            XÃ VĨNH PHONG
          </text>
        </svg>
      )}
    </div>
  );
}
