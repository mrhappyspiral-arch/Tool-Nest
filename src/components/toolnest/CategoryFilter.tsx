"use client";

import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: readonly Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      {categories.map((category) => {
        const isAll = category.id === "all";
        const isSelected = isAll ? selectedCategory === null : selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(isAll ? null : category.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              isSelected
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <span className="text-base">{category.icon}</span>
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
