import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const alertVariants = cva(
  'relative w-full rounded-lg border p-4 text-sm flex items-start gap-3 select-none',
  {
    variants: {
      variant: {
        info: 'border-blue-200 bg-blue-50 text-blue-900',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        danger: 'border-red-200 bg-red-50 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: React.ReactNode;
}

export function Alert({ className, variant = 'info', title, icon, children, ...props }: AlertProps) {
  const defaultIcon = {
    info: <Info className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />,
    danger: <XCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />,
  }[variant || 'info'];

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      {icon ?? defaultIcon}
      <div className="flex-1">
        {title && <h5 className="font-semibold leading-tight mb-1 text-inherit">{title}</h5>}
        <div className="text-sm opacity-90 leading-normal">{children}</div>
      </div>
    </div>
  );
}
