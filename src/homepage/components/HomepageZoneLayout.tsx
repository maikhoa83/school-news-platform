import React from 'react';
import { HomepageBlock } from '../types';
import { BlockRenderer } from './BlockRenderer';

interface HomepageZoneLayoutProps {
  blocks: HomepageBlock[];
  isPreview?: boolean;
}

export function HomepageZoneLayout({
  blocks,
  isPreview = false,
}: HomepageZoneLayoutProps) {
  // Separate and sort blocks by zone and sortOrder
  const mainBlocks = blocks
    .filter((b) => b.zone === 'main')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const rightBlocks = blocks
    .filter((b) => b.zone === 'right')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="w-full">
      {/* 12-Column Responsive Grid Architecture: Desktop MAIN 8 + RIGHT 4; Tablet adaptive; Mobile 1 col */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
        {/* MAIN ZONE (8 Columns on Desktop) */}
        <main
          aria-label="Khu vực nội dung chính"
          className="lg:col-span-8 space-y-6 sm:space-y-8"
        >
          {mainBlocks.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
              Khu vực chính (8 cột) chưa có khối nội dung nào.
            </div>
          ) : (
            mainBlocks.map((block) => (
              <div key={block.id} className="w-full">
                <BlockRenderer block={block} isPreview={isPreview} />
              </div>
            ))
          )}
        </main>

        {/* RIGHT ZONE (4 Columns on Desktop) */}
        <aside
          aria-label="Khu vực tiện ích bên phải"
          className="lg:col-span-4 space-y-6"
        >
          {rightBlocks.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
              Khu vực bên phải (4 cột) chưa có khối nội dung nào.
            </div>
          ) : (
            rightBlocks.map((block) => (
              <div key={block.id} className="w-full">
                <BlockRenderer block={block} isPreview={isPreview} />
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
