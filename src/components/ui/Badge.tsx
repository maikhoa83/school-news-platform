import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap select-none',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-800 border border-slate-200',
        primary: 'bg-blue-50 text-blue-700 border border-blue-200',
        accent: 'bg-amber-50 text-amber-800 border border-amber-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: 'bg-amber-100 text-amber-900 border border-amber-300',
        danger: 'bg-red-50 text-red-700 border border-red-200',
        outline: 'text-slate-600 border border-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="mr-1 inline-flex">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
