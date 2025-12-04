import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { GripVertical, Plus, Save, Trash2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ActivityTemplate {
  id: string;
  name: string;
  name_en: string;
  name_ru: string | null;
  name_fr: string;
  category: string;
  impact_type: string;
  default_duration_minutes: number | null;
  emoji: string;
}

interface PresetActivity {
  template_id: string;
  category: string;
  day_part: 'early_morning' | 'late_morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  duration: number;
  repetitions: number;
}

const DAY_PARTS = [
  { value: 'early_morning', labelKey: 'calendar.dayParts.earlyMorning', emoji: '🌅' },
  { value: 'late_morning', labelKey: 'calendar.dayParts.lateMorning', emoji: '☕' },
  { value: 'midday', labelKey: 'calendar.dayParts.midday', emoji: '☀️' },
  { value: 'afternoon', labelKey: 'calendar.dayParts.afternoon', emoji: '🌤️' },
  { value: 'evening', labelKey: 'calendar.dayParts.evening', emoji: '🌆' },
  { value: 'night', labelKey: 'calendar.dayParts.night', emoji: '🌙' },
];

const ActivityTemplates = () => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<PresetActivity[]>([]);
  const [selectedImpactType, setSelectedImpactType] = useState<string>('all');
  const [draggedTemplate, setDraggedTemplate] = useState<ActivityTemplate | null>(null);
  const [draggedActivityIndex, setDraggedActivityIndex] = useState<number | null>(null);
  const [dragOverDayPart, setDragOverDayPart] = useState<string | null>(null);

  // Fetch templates from database
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['activity-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_templates')
        .select('*')
        .order('impact_type', { ascending: true })
        .order('category', { ascending: true });
      if (error) throw error;
      return data as ActivityTemplate[];
    },
  });

  // Drag handlers for templates (left side)
  const handleTemplateDragStart = (e: React.DragEvent, template: ActivityTemplate) => {
    setDraggedTemplate(template);
    setDraggedActivityIndex(null);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Drag handlers for existing activities (right side)
  const handleActivityDragStart = (e: React.DragEvent, index: number) => {
    setDraggedActivityIndex(index);
    setDraggedTemplate(null);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTemplate(null);
    setDraggedActivityIndex(null);
    setDragOverDayPart(null);
  };

  const handleDayPartDragOver = (e: React.DragEvent, dayPartValue: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedTemplate ? 'copy' : 'move';
    setDragOverDayPart(dayPartValue);
  };

  const handleDayPartDragLeave = () => {
    setDragOverDayPart(null);
  };

  const handleDayPartDrop = (e: React.DragEvent, dayPartValue: string) => {
    e.preventDefault();
    setDragOverDayPart(null);

    if (draggedTemplate) {
      const newActivity: PresetActivity = {
        template_id: draggedTemplate.id,
        category: draggedTemplate.category,
        day_part: dayPartValue as PresetActivity['day_part'],
        duration: draggedTemplate.default_duration_minutes || 30,
        repetitions: 1,
      };
      setActivities([...activities, newActivity]);
    } else if (draggedActivityIndex !== null) {
      setActivities(activities.map((a, i) => 
        i === draggedActivityIndex ? { ...a, day_part: dayPartValue as PresetActivity['day_part'] } : a
      ));
    }

    handleDragEnd();
  };

  const handleRemoveZoneDragOver = (e: React.DragEvent) => {
    if (draggedActivityIndex !== null) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleRemoveZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedActivityIndex !== null) {
      removeActivity(draggedActivityIndex);
    }
    handleDragEnd();
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const activitiesJson = JSON.parse(JSON.stringify(activities));
      const presetData = { 
        name: name.trim(), 
        emoji: '📋', 
        activities: activitiesJson,
      };

      const { error } = await supabase
        .from('user_presets')
        .insert([{ user_id: user.id, ...presetData }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-presets'] });
      toast.success(t('calendar.presets.presetCreated'));
      setName('');
      setActivities([]);
    },
    onError: (error) => {
      console.error('Error saving preset:', error);
      toast.error(t('calendar.presets.saveError'));
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t('calendar.presets.nameRequired'));
      return;
    }
    if (activities.length === 0) {
      toast.error(t('calendar.presets.noActivitiesAdded'));
      return;
    }
    saveMutation.mutate();
  };

  const addActivity = (template: ActivityTemplate) => {
    const newActivity: PresetActivity = {
      template_id: template.id,
      category: template.category,
      day_part: 'early_morning',
      duration: template.default_duration_minutes || 30,
      repetitions: 1,
    };
    setActivities([...activities, newActivity]);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, updates: Partial<PresetActivity>) => {
    setActivities(activities.map((a, i) => (i === index ? { ...a, ...updates } : a)));
  };

  const getLocalizedName = (template: ActivityTemplate) => {
    if (locale === 'ru' && template.name_ru) return template.name_ru;
    if (locale === 'fr') return template.name_fr;
    return template.name_en;
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesType = selectedImpactType === 'all' || t.impact_type === selectedImpactType;
    if (!matchesType) return false;
    
    if (!searchQuery.trim()) return true;
    
    const search = searchQuery.toLowerCase();
    const localizedName = getLocalizedName(t).toLowerCase();
    return localizedName.includes(search) || 
           t.name_en.toLowerCase().includes(search) ||
           (t.name_ru?.toLowerCase().includes(search) ?? false) ||
           t.name_fr.toLowerCase().includes(search);
  });

  const getTemplateByActivity = (activity: PresetActivity) => {
    const byId = templates.find((t) => t.id === activity.template_id);
    if (byId) return byId;
    return templates.find((t) => t.category === activity.category);
  };

  const activitiesByDayPart = DAY_PARTS.map((dp) => ({
    ...dp,
    activities: activities
      .map((a, idx) => ({ ...a, originalIndex: idx }))
      .filter((a) => a.day_part === dp.value),
  }));

  const clearAll = () => {
    setName('');
    setSearchQuery('');
    setActivities([]);
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('calendar.presets.createPreset')}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAll} disabled={!name && activities.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.clear')}
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Template selector */}
          <div className="flex flex-col space-y-4">
            {/* Template name */}
            <div>
              <Label className="text-sm font-medium">{t('calendar.presets.presetName')}</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder={t('calendar.presets.namePlaceholder')}
                className="mt-1.5"
              />
            </div>

            {/* Search activities */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('activityTemplates.searchPlaceholder')}
                className="pl-10"
              />
            </div>

            {/* Select activities section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('calendar.presets.selectActivities')}</Label>
              
              {/* Impact type filter badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', emoji: '📋', labelKey: 'activityTemplates.allTypes' },
                  { value: 'restoring', emoji: '🔋', labelKey: 'activityTemplates.restoring' },
                  { value: 'depleting', emoji: '⚡', labelKey: 'activityTemplates.depleting' },
                  { value: 'mixed', emoji: '🔄', labelKey: 'activityTemplates.mixed' },
                  { value: 'neutral', emoji: '⚖️', labelKey: 'activityTemplates.neutral' },
                ].map((type) => (
                  <Badge
                    key={type.value}
                    variant={selectedImpactType === type.value ? 'default' : 'outline'}
                    className={`cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105 ${
                      selectedImpactType === type.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedImpactType(type.value)}
                  >
                    <span className="mr-1.5">{type.emoji}</span>
                    {t(type.labelKey)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Scrollable activity list */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea 
                className="h-full max-h-[400px] border rounded-lg bg-muted/20"
                onDragOver={handleRemoveZoneDragOver}
                onDrop={handleRemoveZoneDrop}
              >
                <div className="space-y-1.5 p-3 pr-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      {t('calendar.presets.noActivitiesFound')}
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        draggable
                        onDragStart={(e) => handleTemplateDragStart(e, template)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 cursor-grab hover:bg-accent/50 transition-all flex items-center gap-3 ${
                          draggedTemplate?.id === template.id ? 'opacity-50 scale-95' : ''
                        }`}
                        onClick={() => addActivity(template)}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xl">{template.emoji}</span>
                        <span className="text-sm font-medium flex-1 truncate">{getLocalizedName(template)}</span>
                        <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-60" />
                      </Card>
                    ))
                  )}
                </div>
                <ScrollBar orientation="vertical" className="w-2.5" />
              </ScrollArea>
            </div>

            {/* Drop to remove zone */}
            {draggedActivityIndex !== null && (
              <div className="p-3 border-2 border-dashed border-destructive/50 rounded-lg text-center text-sm text-muted-foreground bg-destructive/5">
                {t('calendar.presets.dropToRemove')}
              </div>
            )}
          </div>

          {/* Right: Day parts with activities */}
          <div className="flex flex-col space-y-3">
            <Label className="text-sm font-medium">{t('calendar.presets.distribution')}</Label>
            
            <ScrollArea className="flex-1 min-h-[300px] lg:h-[350px] border rounded-lg">
              <div className="space-y-2 p-3">
                {activitiesByDayPart.map((dayPart) => (
                  <Card 
                    key={dayPart.value} 
                    className={`p-3 transition-all min-h-[60px] ${
                      dragOverDayPart === dayPart.value 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : ''
                    }`}
                    onDragOver={(e) => handleDayPartDragOver(e, dayPart.value)}
                    onDragLeave={handleDayPartDragLeave}
                    onDrop={(e) => handleDayPartDrop(e, dayPart.value)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{dayPart.emoji}</span>
                      <Badge variant="outline" className="text-xs">
                        {t(dayPart.labelKey)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">({dayPart.activities.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {dayPart.activities.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-1 opacity-50">
                          {t('calendar.presets.dropActivitiesHere')}
                        </div>
                      ) : (
                        dayPart.activities.map((activity) => {
                          const template = getTemplateByActivity(activity);
                          return (
                            <div
                              key={activity.originalIndex}
                              draggable
                              onDragStart={(e) => handleActivityDragStart(e, activity.originalIndex)}
                              onDragEnd={handleDragEnd}
                              className={`flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-grab transition-all ${
                                draggedActivityIndex === activity.originalIndex ? 'opacity-50 scale-95' : ''
                              }`}
                            >
                              <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-base">{template?.emoji}</span>
                              <span className="text-sm flex-1 truncate">
                                {template ? getLocalizedName(template) : activity.category}
                              </span>

                              <Select
                                value={String(activity.repetitions)}
                                onValueChange={(v) => updateActivity(activity.originalIndex, { repetitions: parseInt(v) })}
                              >
                                <SelectTrigger className="w-16 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                      ×{n}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeActivity(activity.originalIndex)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="vertical" className="w-2" />
            </ScrollArea>
            
            {/* Action buttons below day parts list */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActivities([])} 
                disabled={activities.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('calendar.presets.clearDayFields')}
              </Button>
              <Button 
                size="sm"
                onClick={handleSave} 
                disabled={saveMutation.isPending || !name.trim() || activities.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {t('calendar.presets.saveTemplate')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ActivityTemplates;
