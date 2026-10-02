/**
 * Automatic Table of Contents (TOC) Component
 * School News Platform - Step 05 News Module
 */

import React, { useState } from 'react';
import { ListCollapse, ChevronDown, ChevronUp } from 'lucide-react';
import { TableOfContentItem } from '../../types/news';

interface TableOfContentsProps {
  items: TableOfContentItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!items || items.length === 0) {
    return null;
  }

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="article-toc"
      className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 sm:p-5 my-6 overflow-hidden transition-all shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm sm:text-base">
          <ListCollapse className="w-4 h-4 text-blue-600" />
          <span>Mục lục bài viết</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
          aria-label={isOpen ? 'Thu gọn mục lục' : 'Mở rộng mục lục'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <nav aria-label="Mục lục bài viết" className="mt-3 pt-3 border-t border-neutral-200/80">
          <ul className="space-y-2 text-xs sm:text-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className={`transition-colors leading-snug ${
                  item.level === 2
                    ? 'font-medium text-neutral-800'
                    : item.level === 3
                    ? 'pl-4 text-neutral-600 font-normal'
                    : 'pl-8 text-neutral-500 text-xs'
                }`}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  className="hover:text-blue-600 hover:underline block py-0.5"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};
