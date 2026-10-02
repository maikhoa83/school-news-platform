/**
 * Public Menu Desktop Navigation Bar Component
 * School News Platform - Step 09.6B
 *
 * Renders the top-level horizontal navigation bar for desktop and tablet screens.
 * Iterates through items and delegates rendering to PublicMenuItem or PublicMenuDropdown.
 */

import React from 'react';
import type { NavigationItem } from '../../../navigation/types';
import { PublicMenuItem } from './PublicMenuItem';
import { PublicMenuDropdown } from './PublicMenuDropdown';
import { cn } from '../../../lib/utils';

export interface PublicMenuProps {
  items: NavigationItem[];
  className?: string;
  ariaLabel?: string;
}

export const PublicMenu: React.FC<PublicMenuProps> = ({
  items,
  className,
  ariaLabel = 'Điều hướng chính',
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn('w-full', className)}
    >
      <ul className="flex items-center flex-wrap">
        {items.map((item) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          if (hasChildren) {
            return <PublicMenuDropdown key={item.key} item={item} />;
          }
          return (
            <li key={item.key}>
              <PublicMenuItem item={item} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
