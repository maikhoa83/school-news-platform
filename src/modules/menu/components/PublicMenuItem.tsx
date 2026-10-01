/**
 * Public Navigation Single Item Component
 * School News Platform - Step 09.6B
 *
 * Renders an accessible single navigation link:
 * - Differentiates external URLs (<a> with target & rel="noopener noreferrer")
 *   from internal SPA routes (<Link>).
 * - Displays icon, label, and optional badge.
 * - Handles current active route indication.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { NavigationItem } from '../../../navigation/types';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/utils';

export interface PublicMenuItemProps {
  item: NavigationItem;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  onClick?: () => void;
}

export const PublicMenuItem: React.FC<PublicMenuItemProps> = ({
  item,
  className,
  activeClassName = 'bg-blue-950 text-amber-400 border-amber-400 shadow-inner',
  inactiveClassName = 'border-transparent text-slate-100 hover:bg-blue-800 hover:text-white',
  onClick,
}) => {
  const location = useLocation();
  const Icon = item.icon;

  const isExternal =
    item.external ||
    item.target === '_blank' ||
    /^(https?:|\/\/)/i.test(item.href);

  const isActive =
    !isExternal &&
    (item.href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.href));

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span>{item.label}</span>
      {item.badge && (
        <Badge
          variant="accent"
          className="bg-amber-500 text-slate-950 text-[10px] py-0 px-1 font-bold border-none ml-1"
        >
          {item.badge}
        </Badge>
      )}
    </>
  );

  const combinedClassName = cn(
    'inline-flex items-center gap-1.5 px-3.5 py-3 text-xs lg:text-sm font-medium transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
    isActive ? activeClassName : inactiveClassName,
    className
  );

  if (isExternal) {
    return (
      <a
        href={item.href}
        target={item.target || '_blank'}
        rel="noopener noreferrer"
        onClick={onClick}
        className={combinedClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      target={item.target}
      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={combinedClassName}
    >
      {content}
    </Link>
  );
};
