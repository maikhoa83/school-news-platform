import React from 'react';
import { BlockRenderProps } from '../../types';

export function SpacerBlock({ block }: BlockRenderProps) {
  const height = block.config.height || 'md';

  const heightClass =
    height === 'sm'
      ? 'h-4'
      : height === 'lg'
      ? 'h-12'
      : height === 'xl'
      ? 'h-16'
      : 'h-8';

  return (
    <div
      aria-hidden="true"
      className={`w-full ${heightClass} flex items-center justify-center`}
    >
      <div className="w-full border-t border-slate-100/60" />
    </div>
  );
}
