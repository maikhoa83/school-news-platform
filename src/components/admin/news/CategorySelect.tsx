/**
 * Hierarchical Category Select Component
 * School News Platform - Step 05 News Module
 */

import React from 'react';
import { NewsCategory } from '../../../types/news';

interface CategorySelectProps {
  categories: NewsCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  value,
  onChange,
  required = false,
}) => {
  return (
    <select
      id="category-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      aria-label="Chọn chuyên mục"
      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
    >
      <option value="">-- Chọn chuyên mục bài viết --</option>
      {categories.map((cat) => (
        <React.Fragment key={cat.id}>
          <option value={cat.id} className="font-semibold text-neutral-900">
            {cat.name}
          </option>
          {cat.children &&
            cat.children.map((sub) => (
              <option key={sub.id} value={sub.id} className="text-neutral-700 pl-4">
                &nbsp;&nbsp;↳ {sub.name}
              </option>
            ))}
        </React.Fragment>
      ))}
    </select>
  );
};
