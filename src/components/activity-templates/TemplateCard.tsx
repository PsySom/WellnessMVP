import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateCardProps {
  template: {
    id: string;
    name_en: string;
    emoji: string;
    category: string;
    impact_type: string;
    default_duration_minutes: number | null;
  };
  onClick: () => void;
}

const getImpactColor = (impactType: string) => {
  switch (impactType) {
    case 'restoring':
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    case 'depleting':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    case 'neutral':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    case 'mixed':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    sleep: 'Sleep',
    nutrition: 'Nutrition',
    hydration: 'Hydration',
    exercise: 'Exercise',
    hobby: 'Hobby',
    work: 'Work',
    social: 'Social',
    practice: 'Practice',
    health: 'Health',
    reflection: 'Reflection',
    leisure: 'Leisure',
  };
  return labels[category] || category;
};

const TemplateCard = ({ template, onClick }: TemplateCardProps) => {
  return (
    <Card 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{template.emoji}</div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
            {template.name_en}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(template.category)}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getImpactColor(template.impact_type)}`}>
              {template.impact_type}
            </Badge>
          </div>

          {template.default_duration_minutes !== null && template.default_duration_minutes > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{template.default_duration_minutes} min</span>
            </div>
          )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default TemplateCard;
