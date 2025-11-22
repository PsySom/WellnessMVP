import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface ImpactTypeFilterProps {
  selectedImpactType: string;
  onImpactTypeChange: (impactType: string) => void;
}

const getImpactTypeConfig = (type: string, language: string) => {
  const configs = {
    all: {
      emoji: '📋',
      label: { en: 'All', ru: 'Все', fr: 'Tout' }
    },
    restoring: {
      emoji: '🌱',
      label: { en: 'Restoring', ru: 'Восстанавливающие', fr: 'Restaurateur' }
    },
    depleting: {
      emoji: '⚡',
      label: { en: 'Depleting', ru: 'Истощающие', fr: 'Épuisant' }
    },
    mixed: {
      emoji: '⚖️',
      label: { en: 'Mixed', ru: 'Смешанные', fr: 'Mixte' }
    },
    neutral: {
      emoji: '⚪',
      label: { en: 'Neutral', ru: 'Нейтральные', fr: 'Neutre' }
    }
  };

  const config = configs[type as keyof typeof configs];
  return {
    emoji: config.emoji,
    label: config.label[language as 'en' | 'ru' | 'fr'] || config.label.en
  };
};

const getImpactTypeVariant = (type: string, isSelected: boolean) => {
  if (!isSelected) return 'outline';
  return 'default';
};

const getImpactTypeClassName = (type: string, isSelected: boolean) => {
  if (!isSelected) return '';
  
  switch (type) {
    case 'restoring':
      return 'bg-accent hover:bg-accent/90 border-accent';
    case 'depleting':
      return 'bg-destructive hover:bg-destructive/90 border-destructive';
    case 'mixed':
      return 'bg-warning hover:bg-warning/90 border-warning';
    case 'neutral':
      return 'bg-secondary hover:bg-secondary/90 border-secondary';
    default:
      return '';
  }
};

const ImpactTypeFilter = ({ selectedImpactType, onImpactTypeChange }: ImpactTypeFilterProps) => {
  const { i18n } = useTranslation();
  const impactTypes = ['all', 'restoring', 'depleting', 'mixed', 'neutral'];

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {impactTypes.map((type) => {
          const config = getImpactTypeConfig(type, i18n.language);
          const isSelected = selectedImpactType === type;
          
          return (
            <Badge
              key={type}
              variant={getImpactTypeVariant(type, isSelected)}
              className={`cursor-pointer whitespace-nowrap px-3 py-1.5 smooth-transition ${getImpactTypeClassName(type, isSelected)}`}
              onClick={() => onImpactTypeChange(type)}
            >
              <span className="mr-1">{config.emoji}</span>
              {config.label}
            </Badge>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default ImpactTypeFilter;
