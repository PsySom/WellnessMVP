import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { getCategoryConfig } from '@/config/categoryConfig';
import ImpactTypeFilter from '@/components/activity-templates/ImpactTypeFilter';
import TemplateDetailModal from '@/components/activity-templates/TemplateDetailModal';
import { useTranslation } from 'react-i18next';
import { ACTIVITY_PRESETS, getCoreActivities, getAdditionalActivities } from '@/config/activityPresets';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getDefaultTimeForSlot } from '@/utils/timeSlots';
import { triggerActivityUpdate } from '@/utils/activitySync';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImpactType, setSelectedImpactType] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'core' | 'additional'>('all');

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

  const addActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const { error } = await supabase.from('activities').insert(activityData);
      if (error) throw error;
    },
    onSuccess: () => {
      triggerActivityUpdate();
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const { data: existingActivities = [] } = useQuery({
    queryKey: ['activities', user?.id, format(new Date(), 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', format(new Date(), 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Подсчет активностей для каждого пресета
  const getPresetActivityCount = (presetId: string) => {
    const preset = ACTIVITY_PRESETS.find(p => p.id === presetId);
    if (!preset) return { total: 0, added: 0 };
    
    const presetCategories = preset.activities.map(a => a.category);
    const addedCount = existingActivities.filter(activity => 
      presetCategories.includes(activity.category)
    ).length;
    
    return {
      total: preset.activities.length,
      added: addedCount
    };
  };

  const handleAddActivities = async (type: 'all' | 'core' | 'additional') => {
    if (!user || !selectedPreset) return;

    const preset = ACTIVITY_PRESETS.find(p => p.id === selectedPreset);
    if (!preset) return;

    let activitiesToAdd = preset.activities;
    if (type === 'core') {
      activitiesToAdd = getCoreActivities(selectedPreset);
    } else if (type === 'additional') {
      activitiesToAdd = getAdditionalActivities(selectedPreset);
    }

    // Фильтруем основные активности, которые уже существуют
    const filteredActivities = activitiesToAdd.filter(activity => {
      if (!activity.isCore) return true; // Дополнительные всегда можно добавлять
      
      // Проверяем, нет ли уже такой основной активности
      return !existingActivities.some(existing => existing.category === activity.category);
    });

    if (filteredActivities.length === 0) {
      toast.info(t('calendar.presets.allCoreActivitiesExist'));
      return;
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      for (const activity of filteredActivities) {
        // Найдем соответствующий шаблон
        const template = templates.find(t => t.category === activity.category);
        if (!template) continue;

        const startTime = activity.recommendedTimeSlot && activity.recommendedTimeSlot !== 'anytime'
          ? getDefaultTimeForSlot(activity.recommendedTimeSlot as any)
          : null;

        const repetitionConfig = activity.repetitionConfig || { frequency: 'daily', count: 1 };
        
        const activityData = {
          user_id: user.id,
          title: getLocalizedName(template),
          category: activity.category,
          impact_type: template.impact_type,
          date: today,
          start_time: startTime,
          duration_minutes: activity.recommendedDuration || template.default_duration_minutes || 60,
          status: 'planned' as const,
          emoji: template.emoji,
          repetition_config: repetitionConfig,
        };

        await addActivityMutation.mutateAsync(activityData);
      }

      const addedCount = filteredActivities.length;
      const skippedCount = activitiesToAdd.length - filteredActivities.length;
      
      if (skippedCount > 0) {
        toast.success(t('calendar.presets.addedWithSkipped', { added: addedCount, skipped: skippedCount }));
      } else {
        toast.success(t('calendar.presets.activitiesAdded', { count: addedCount }));
      }
    } catch (error) {
      console.error('Error adding activities:', error);
      toast.error(t('calendar.presets.addError'));
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesImpactType = selectedImpactType === 'all' || template.impact_type === selectedImpactType;
    
    // Фильтр по выбранному пресету
    if (selectedPreset) {
      const preset = ACTIVITY_PRESETS.find(p => p.id === selectedPreset);
      if (preset) {
        const presetCategories = preset.activities.map(a => a.category);
        const matchesPreset = presetCategories.includes(template.category);
        
        // Фильтр по типу активности (основная/дополнительная)
        if (activityFilter !== 'all') {
          const activity = preset.activities.find(a => a.category === template.category);
          const matchesFilter = activityFilter === 'core' ? activity?.isCore : !activity?.isCore;
          return matchesImpactType && matchesPreset && matchesFilter;
        }
        
        return matchesImpactType && matchesPreset;
      }
    }
    
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
        {/* Секция с пресетами */}
        <div className="p-4 border-b border-border space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t('calendar.presets.title')}
          </h3>
          
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-3">
              {ACTIVITY_PRESETS.map((preset) => {
                const { total, added } = getPresetActivityCount(preset.id);
                const hasActivities = total > 0;
                
                return (
                  <Card
                    key={preset.id}
                    className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedPreset === preset.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedPreset(preset.id === selectedPreset ? null : preset.id);
                      setActivityFilter('all');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{preset.emoji}</span>
                        <span className="text-sm font-medium truncate">
                          {preset.name[locale as 'en' | 'ru' | 'fr']}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {hasActivities && (
                          <Badge 
                            variant={added === total ? "default" : added > 0 ? "secondary" : "outline"}
                            className="text-xs px-1.5 py-0"
                          >
                            {added}/{total}
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Будущая функция настройки
                          }}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {hasActivities && added > 0 && (
                      <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${(added / total) * 100}%` }}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t('calendar.presets.recommendedActivities')}
          </h3>
          
          {selectedPreset && (
            <div className="mb-3 space-y-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleAddActivities('all')}
                  disabled={addActivityMutation.isPending}
                >
                  {t('calendar.presets.addAll')}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAddActivities('core')}
                  disabled={addActivityMutation.isPending}
                >
                  {t('calendar.presets.addCore')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAddActivities('additional')}
                  disabled={addActivityMutation.isPending}
                >
                  {t('calendar.presets.addAdditional')}
                </Button>
              </div>
              
              {/* Фильтры основные/дополнительные */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={activityFilter === 'all' ? 'secondary' : 'ghost'}
                  className="flex-1 text-xs"
                  onClick={() => setActivityFilter('all')}
                >
                  {t('calendar.presets.filterAll')}
                </Button>
                <Button
                  size="sm"
                  variant={activityFilter === 'core' ? 'secondary' : 'ghost'}
                  className="flex-1 text-xs"
                  onClick={() => setActivityFilter('core')}
                >
                  {t('calendar.presets.filterCore')}
                </Button>
                <Button
                  size="sm"
                  variant={activityFilter === 'additional' ? 'secondary' : 'ghost'}
                  className="flex-1 text-xs"
                  onClick={() => setActivityFilter('additional')}
                >
                  {t('calendar.presets.filterAdditional')}
                </Button>
              </div>
            </div>
          )}
          
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
