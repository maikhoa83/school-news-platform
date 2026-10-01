/**
 * Public Navigation Dropdown Component (Desktop / Tablet)
 * School News Platform - Step 09.6B
 *
 * Renders an accessible parent navigation item with a collapsible dropdown menu:
 * - Hover, click, and keyboard focus states
 * - Escape key closes active dropdown
 * - Differentiates external and internal submenu links
 * - Full ARIA accessibility attributes (role="menu", role="menuitem")
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { NavigationItem } from '../../../navigation/types';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/utils';

export interface PublicMenuDropdownProps {
  item: NavigationItem;
  className?: string;
}

export const PublicMenuDropdown: React.FC<PublicMenuDropdownProps> = ({
  item,
  className,
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);
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

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasChildren = Boolean(item.children && item.children.length > 0);

  return (
    <li
      ref={containerRef}
      className={cn('relative group', className)}
      onMouseEnter={() => hasChildren && setIsOpen(true)}
      onMouseLeave={() => hasChildren && setIsOpen(false)}
    >
      <div className="flex items-center">
        {/* Parent Link */}
        {isExternal ? (
          <a
            href={item.href}
            target={item.target || '_blank'}
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-3 text-xs lg:text-sm font-medium transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
              isActive
                ? 'bg-blue-950 text-amber-400 border-amber-400 shadow-inner'
                : 'border-transparent text-slate-100 hover:bg-blue-800 hover:text-white'
            )}
          >
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
          </a>
        ) : (
          <Link
            to={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-3 text-xs lg:text-sm font-medium transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
              isActive
                ? 'bg-blue-950 text-amber-400 border-amber-400 shadow-inner'
                : 'border-transparent text-slate-100 hover:bg-blue-800 hover:text-white'
            )}
          >
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
          </Link>
        )}

        {/* Dropdown Toggle Trigger */}
        {hasChildren && (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-label={`Mở rộng menu con của ${item.label}`}
            className="p-3 text-slate-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 -ml-2"
          >
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 opacity-70 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {/* Accessible Submenu Panel */}
      {hasChildren && (
        <ul
          role="menu"
          aria-label={`Mục con của ${item.label}`}
          className={cn(
            'absolute top-full left-0 w-64 bg-white text-slate-900 rounded-b-lg shadow-xl border border-slate-200 py-2 z-50 transition-all duration-150',
            isOpen ? 'block animate-in fade-in-50 zoom-in-95' : 'hidden group-hover:block'
          )}
        >
          {item.children?.map((sub) => {
            const isSubExternal =
              sub.external ||
              sub.target === '_blank' ||
              /^(https?:|\/\/)/i.test(sub.href);

            const isSubActive =
              !isSubExternal && location.pathname === sub.href;

            const subIcon = sub.icon;

            const subContent = (
              <>
                <div className="font-semibold flex items-center justify-between text-sm text-slate-800 hover:text-blue-900">
                  <span className="flex items-center gap-2">
                    {subIcon && React.createElement(subIcon, { className: 'h-4 w-4 text-blue-700' })}
                    <span>{sub.label}</span>
                  </span>
                  {sub.badge && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      {sub.badge}
                    </span>
                  )}
                  {isSubExternal && (
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-1 shrink-0" />
                  )}
                </div>
                {sub.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {sub.description}
                  </p>
                )}
              </>
            );

            return (
              <li key={sub.key} role="none">
                {isSubExternal ? (
                  <a
                    href={sub.href}
                    target={sub.target || '_blank'}
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'block px-4 py-2.5 text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-900 transition-colors focus:outline-none focus:bg-blue-50 focus:text-blue-900',
                      isSubActive && 'bg-blue-50 text-blue-900 font-bold'
                    )}
                  >
                    {subContent}
                  </a>
                ) : (
                  <Link
                    to={sub.href}
                    target={sub.target}
                    rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
                    role="menuitem"
                    aria-current={isSubActive ? 'page' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'block px-4 py-2.5 text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-900 transition-colors focus:outline-none focus:bg-blue-50 focus:text-blue-900',
                      isSubActive && 'bg-blue-50 text-blue-900 font-bold'
                    )}
                  >
                    {subContent}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};
