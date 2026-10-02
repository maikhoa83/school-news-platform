/**
 * Public Mobile Navigation Menu Component
 * School News Platform - Step 09.6B
 *
 * Renders an accessible, touch-friendly vertical navigation tree for mobile drawers:
 * - Touch targets >= 44px
 * - Accessible expand/collapse for items with children
 * - Safe handling of external and internal URLs
 * - Closes drawer upon navigation item selection
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import type { NavigationItem } from '../../../navigation/types';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/utils';

export interface PublicMobileMenuProps {
  items: NavigationItem[];
  onItemClick?: () => void;
  className?: string;
}

export const PublicMobileMenu: React.FC<PublicMobileMenuProps> = ({
  items,
  onItemClick,
  className,
}) => {
  const location = useLocation();
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Danh mục điều hướng di động"
      className={cn('space-y-1', className)}
    >
      {items.map((item) => {
        const hasChildren = Boolean(item.children && item.children.length > 0);
        const isExpanded = Boolean(expandedKeys[item.key]);
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

        const itemContent = (
          <>
            {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" />}
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <Badge variant="primary" className="ml-auto text-[10px] py-0 px-1.5">
                {item.badge}
              </Badge>
            )}
            {isExternal && (
              <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-auto shrink-0" />
            )}
          </>
        );

        return (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between rounded-md min-h-[44px]">
              {isExternal ? (
                <a
                  href={item.href}
                  target={item.target || '_blank'}
                  rel="noopener noreferrer"
                  onClick={onItemClick}
                  className={cn(
                    'flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors min-h-[44px]',
                    'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {itemContent}
                </a>
              ) : (
                <Link
                  to={item.href}
                  target={item.target}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={onItemClick}
                  className={cn(
                    'flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors min-h-[44px]',
                    isActive
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {itemContent}
                </Link>
              )}

              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggleExpand(item.key)}
                  aria-label={`${isExpanded ? 'Thu gọn' : 'Mở rộng'} mục ${item.label}`}
                  aria-expanded={isExpanded}
                  className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Submenu Accordion */}
            {hasChildren && isExpanded && (
              <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-blue-200 ml-4 animate-in fade-in-50 duration-150">
                {item.children?.map((sub) => {
                  const isSubExternal =
                    sub.external ||
                    sub.target === '_blank' ||
                    /^(https?:|\/\/)/i.test(sub.href);

                  const isSubActive =
                    !isSubExternal && location.pathname === sub.href;

                  const subIcon = sub.icon;

                  const subContent = (
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5">
                        {subIcon && React.createElement(subIcon, { className: 'h-3.5 w-3.5 text-slate-400' })}
                        <span>{sub.label}</span>
                      </span>
                      {sub.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                          {sub.badge}
                        </span>
                      )}
                      {isSubExternal && (
                        <ExternalLink className="h-3 w-3 text-slate-400 ml-1 shrink-0" />
                      )}
                    </div>
                  );

                  return isSubExternal ? (
                    <a
                      key={sub.key}
                      href={sub.href}
                      target={sub.target || '_blank'}
                      rel="noopener noreferrer"
                      onClick={onItemClick}
                      className={cn(
                        'block px-3 py-2 rounded-md text-xs transition-colors min-h-[40px] flex items-center',
                        'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      {subContent}
                    </a>
                  ) : (
                    <Link
                      key={sub.key}
                      to={sub.href}
                      target={sub.target}
                      rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
                      aria-current={isSubActive ? 'page' : undefined}
                      onClick={onItemClick}
                      className={cn(
                        'block px-3 py-2 rounded-md text-xs transition-colors min-h-[40px] flex items-center',
                        isSubActive
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      {subContent}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
