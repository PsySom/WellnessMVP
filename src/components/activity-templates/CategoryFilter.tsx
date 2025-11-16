import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getAllCategories } from '@/config/categoryConfig';
import { useTranslation } from 'react-i18next';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { i18n } = useTranslation();
  const categories = getAllCategories();

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap px-3 py-1.5"
          onClick={() => onCategoryChange('all')}
        >
          <span className="mr-1">📋</span>
          {i18n.language === 'ru' ? 'Все' : i18n.language === 'fr' ? 'Tout' : 'All'}
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap px-3 py-1.5"
            onClick={() => onCategoryChange(cat.value)}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.label[i18n.language as 'en' | 'ru' | 'fr'] || cat.label.en}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;
