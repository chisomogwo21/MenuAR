import React from 'react';
import type { Category } from '../../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CategoryPillsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, activeCategoryId, onSelect }) => {
  return (
    <div className="flex overflow-x-auto gap-2 px-5 py-4 scrollbar-hide no-scrollbar">
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
              isActive 
                ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                : "bg-white border-surface-container text-surface-dim hover:bg-surface-container"
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
