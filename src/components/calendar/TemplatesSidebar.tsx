import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { getCategoryConfig } from '@/config/categoryConfig';
import ImpactTypeFilter from '@/components/activity-templates/ImpactTypeFilter';
import TemplateDetailModal from '@/components/activity-templates/TemplateDetailModal';
import { useTranslation } from 'react-i18next';

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

export const TemplatesSidebar = () => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [selectedImpactType, setSelectedImpactType] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['activity-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name_en', { ascending: true });
      
      if (error) throw error;
      return data as ActivityTemplate[];
    },
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesImpactType = selectedImpactType === 'all' || template.impact_type === selectedImpactType;
    return matchesImpactType;
  });

  const getLocalizedName = (template: ActivityTemplate) => {
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

  return (
    <>
      <div className="h-full flex flex-col border-l border-border bg-card/50">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t('activityTemplates.title')}
          </h3>
          
          <ImpactTypeFilter
            selectedImpactType={selectedImpactType}
            onImpactTypeChange={setSelectedImpactType}
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {isLoading ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">{t('activityTemplates.noTemplatesFound')}</p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const handleDragStart = (e: React.DragEvent) => {
                  e.dataTransfer.effectAllowed = 'copy';
                  e.dataTransfer.setData('templateId', template.id);
                  e.dataTransfer.setData('templateData', JSON.stringify({
                    name: getLocalizedName(template),
                    category: template.category,
                    impact_type: template.impact_type,
                    duration_minutes: template.default_duration_minutes || 60,
                    emoji: template.emoji
                  }));
                };

                return (
                  <Card 
                    key={template.id}
                    draggable
                    onDragStart={handleDragStart}
                    className="p-3 hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing group"
                    onClick={() => setSelectedTemplate(template)}
                  >
                  <div className="flex items-start gap-2">
                    <div className="text-2xl">{template.emoji}</div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
                        {getLocalizedName(template)}
                      </h4>
                      
                      <div className="flex flex-wrap gap-1 mb-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {getCategoryLabel(template.category)}
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
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(template);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <TemplateDetailModal
        template={selectedTemplate}
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />
    </>
  );
};
