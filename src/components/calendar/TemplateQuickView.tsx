import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit, Plus, Calendar, RefreshCw } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { getCategoryConfig } from '@/config/categoryConfig';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card } from '@/components/ui/card';

interface ActivityTemplate {
  id: string;
  name: string;
  name_en: string;
  name_ru: string;
  name_fr: string;
  description: string | null;
  category: string;
  impact_type: string;
  default_duration_minutes: number | null;
  emoji: string;
  is_system: boolean;
}

interface TemplateQuickViewProps {
  template: ActivityTemplate;
  children: React.ReactNode;
  onEditDetails: () => void;
  onCreateActivity: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isAlreadyAddedToday?: boolean;
  isCoreActivity?: boolean;
}

const getImpactLabel = (impactType: string, t: (key: string) => string) => {
  switch (impactType) {
    case 'restoring':
      return t('activities.impactTypes.restoring');
    case 'depleting':
      return t('activities.impactTypes.depleting');
    case 'neutral':
      return t('activities.impactTypes.neutral');
    case 'mixed':
      return t('activities.impactTypes.mixed');
    default:
      return impactType;
  }
};

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

const getImpactEmoji = (impactType: string) => {
  switch (impactType) {
    case 'restoring':
      return '🟢';
    case 'depleting':
      return '🔴';
    case 'neutral':
      return '🟡';
    case 'mixed':
      return '🔵';
    default:
      return '⚪';
  }
};

export const TemplateQuickView = ({
  template,
  children,
  onEditDetails,
  onCreateActivity,
  onDragStart,
  isAlreadyAddedToday = false,
  isCoreActivity = false,
}: TemplateQuickViewProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [open, setOpen] = React.useState(false);

  const getLocalizedName = () => {
    if (locale === 'ru' && template.name_ru) return template.name_ru;
    if (locale === 'fr' && template.name_fr) return template.name_fr;
    return template.name_en;
  };

  const getCategoryLabel = (category: string) => {
    const categoryConfig = getCategoryConfig(category);
    if (categoryConfig) {
      return categoryConfig.label[locale as 'en' | 'ru' | 'fr'] || categoryConfig.label.en;
    }
    return category;
  };

  const handleEditDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onEditDetails();
  };

  const handleCreateActivity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onCreateActivity();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          draggable
          onDragStart={(e) => {
            setOpen(false);
            onDragStart(e);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0" 
        side="left" 
        align="start"
        sideOffset={8}
      >
        <div className="p-4 space-y-4">
          {/* Header with emoji and name */}
          <div className="flex items-start gap-3">
            <div className="text-4xl">{template.emoji}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base text-foreground leading-tight">
                {getLocalizedName()}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {getCategoryLabel(template.category)}
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-2">
            {/* Impact type */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('calendar.quickView.type')}</span>
              <Badge variant="outline" className={`text-xs ${getImpactColor(template.impact_type)}`}>
                {getImpactEmoji(template.impact_type)} {getImpactLabel(template.impact_type, t)}
              </Badge>
            </div>

            {/* Duration */}
            {template.default_duration_minutes && template.default_duration_minutes > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('calendar.quickView.duration')}</span>
                <div className="flex items-center gap-1 text-xs text-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{template.default_duration_minutes} {t('calendar.form.minutesShort')}</span>
                </div>
              </div>
            )}

            {/* Time slot */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('calendar.quickView.timeSlot')}</span>
              <div className="flex items-center gap-1 text-xs text-foreground">
                <Calendar className="h-3 w-3" />
                <span>{t('calendar.form.anytime')}</span>
              </div>
            </div>

            {/* Repetitions */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('calendar.quickView.repetitions')}</span>
              <div className="flex items-center gap-1 text-xs text-foreground">
                <RefreshCw className="h-3 w-3" />
                <span>{t('calendar.quickView.singleActivity')}</span>
              </div>
            </div>
          </div>

          {/* Status badges */}
          {(isAlreadyAddedToday || isCoreActivity) && (
            <div className="flex flex-wrap gap-1">
              {isCoreActivity && (
                <Badge variant="secondary" className="text-xs">
                  {t('calendar.quickView.coreActivity')}
                </Badge>
              )}
              {isAlreadyAddedToday && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                  ✓ {t('calendar.presets.addedToday')}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleEditDetails}
            >
              <Edit className="h-3 w-3 mr-1" />
              {t('calendar.quickView.editDetails')}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleCreateActivity}
              disabled={isAlreadyAddedToday && isCoreActivity}
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('calendar.quickView.create')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
