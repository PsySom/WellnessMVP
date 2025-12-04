import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X, GripVertical, Trash2 } from 'lucide-react';
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

interface UserPresetData {
  name: string;
  emoji: string;
  activities: PresetActivity[];
  weekly_repetitions?: number;
}

interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  activities: PresetActivity[];
}

interface PresetEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset?: UserPreset | null;
}

const DAY_PARTS = [
  { value: 'early_morning', labelKey: 'calendar.dayParts.earlyMorning', emoji: '🌅' },
  { value: 'late_morning', labelKey: 'calendar.dayParts.lateMorning', emoji: '☕' },
  { value: 'midday', labelKey: 'calendar.dayParts.midday', emoji: '☀️' },
  { value: 'afternoon', labelKey: 'calendar.dayParts.afternoon', emoji: '🌤️' },
  { value: 'evening', labelKey: 'calendar.dayParts.evening', emoji: '🌆' },
  { value: 'night', labelKey: 'calendar.dayParts.night', emoji: '🌙' },
];

export const PresetEditModal = ({ open, onOpenChange, preset }: PresetEditModalProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [activities, setActivities] = useState<PresetActivity[]>([]);
  const [weeklyRepetitions, setWeeklyRepetitions] = useState<number>(7);
  const [selectedImpactType, setSelectedImpactType] = useState<string>('all');
  const [draggedTemplate, setDraggedTemplate] = useState<ActivityTemplate | null>(null);
  const [draggedActivityIndex, setDraggedActivityIndex] = useState<number | null>(null);
  const [dragOverDayPart, setDragOverDayPart] = useState<string | null>(null);

  // Fetch templates from database
  const { data: templates = [] } = useQuery({
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

  useEffect(() => {
    if (preset) {
      setName(preset.name);
      setEmoji(preset.emoji);
      setActivities(preset.activities || []);
      setWeeklyRepetitions((preset as any).weekly_repetitions || 7);
    } else {
      setName('');
      setEmoji('📋');
      setActivities([]);
      setWeeklyRepetitions(7);
    }
  }, [preset, open]);

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
      // Adding new activity from template
      const newActivity: PresetActivity = {
        template_id: draggedTemplate.id,
        category: draggedTemplate.category,
        day_part: dayPartValue as PresetActivity['day_part'],
        duration: draggedTemplate.default_duration_minutes || 30,
        repetitions: 1,
      };
      setActivities([...activities, newActivity]);
    } else if (draggedActivityIndex !== null) {
      // Moving existing activity to different day part
      setActivities(activities.map((a, i) => 
        i === draggedActivityIndex ? { ...a, day_part: dayPartValue as PresetActivity['day_part'] } : a
      ));
    }

    handleDragEnd();
  };

  // Handle dropping back to left side (remove activity)
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
    mutationFn: async (data: UserPresetData) => {
      if (!user) throw new Error('Not authenticated');

      const activitiesJson = JSON.parse(JSON.stringify(data.activities));
      const presetData = { 
        name: data.name, 
        emoji: data.emoji, 
        activities: activitiesJson,
      };

      if (preset?.id) {
        const { error } = await supabase
          .from('user_presets')
          .update(presetData)
          .eq('id', preset.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_presets')
          .insert([{ user_id: user.id, ...presetData }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-presets'] });
      toast.success(preset ? t('calendar.presets.presetUpdated') : t('calendar.presets.presetCreated'));
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving preset:', error);
      toast.error(t('calendar.presets.saveError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!preset?.id) throw new Error('No preset to delete');
      const { error } = await supabase.from('user_presets').delete().eq('id', preset.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-presets'] });
      toast.success(t('calendar.presets.presetDeleted'));
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t('calendar.presets.nameRequired'));
      return;
    }
    saveMutation.mutate({ name: name.trim(), emoji, activities, weekly_repetitions: weeklyRepetitions });
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
    return selectedImpactType === 'all' || t.impact_type === selectedImpactType;
  });

  const getTemplateByActivity = (activity: PresetActivity) => {
    // First try to find by template_id, then fallback to category
    const byId = templates.find((t) => t.id === activity.template_id);
    if (byId) return byId;
    return templates.find((t) => t.category === activity.category);
  };

  // Group activities by day part
  const activitiesByDayPart = DAY_PARTS.map((dp) => ({
    ...dp,
    activities: activities
      .map((a, idx) => ({ ...a, originalIndex: idx }))
      .filter((a) => a.day_part === dp.value),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {preset ? t('calendar.presets.editPreset') : t('calendar.presets.createPreset')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
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
            <ScrollArea 
              className="flex-1 h-[260px] border rounded-lg bg-muted/20"
              onDragOver={handleRemoveZoneDragOver}
              onDrop={handleRemoveZoneDrop}
            >
              <div className="space-y-1.5 p-2 pr-4">
                {filteredTemplates.length === 0 ? (
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
                      className={`p-2.5 cursor-grab hover:bg-accent/50 transition-all flex items-center gap-3 ${
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
              <ScrollBar orientation="vertical" className="w-2" />
            </ScrollArea>

            {/* Drop to remove zone */}
            {draggedActivityIndex !== null && (
              <div className="p-3 border-2 border-dashed border-destructive/50 rounded-lg text-center text-sm text-muted-foreground bg-destructive/5">
                {t('calendar.presets.dropToRemove')}
              </div>
            )}
          </div>

          {/* Right: Day parts with activities */}
          <div className="flex flex-col space-y-2">
            <Label>{t('calendar.presets.distribution')}</Label>
            <ScrollArea className="flex-1 h-[320px] border rounded-md">
              <div className="space-y-2 p-2">
                {activitiesByDayPart.map((dayPart) => (
                  <Card 
                    key={dayPart.value} 
                    className={`p-2 transition-all ${
                      dragOverDayPart === dayPart.value 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : ''
                    }`}
                    onDragOver={(e) => handleDayPartDragOver(e, dayPart.value)}
                    onDragLeave={handleDayPartDragLeave}
                    onDrop={(e) => handleDayPartDrop(e, dayPart.value)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{dayPart.emoji}</span>
                      <Badge variant="outline" className="text-xs">
                        {t(dayPart.labelKey)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">({dayPart.activities.length})</span>
                    </div>

                    <div className="space-y-1">
                      {dayPart.activities.map((activity) => {
                        const template = getTemplateByActivity(activity);
                        return (
                          <div
                            key={activity.originalIndex}
                            draggable
                            onDragStart={(e) => handleActivityDragStart(e, activity.originalIndex)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-1 p-1.5 bg-muted/50 rounded-md cursor-grab transition-all ${
                              draggedActivityIndex === activity.originalIndex ? 'opacity-50 scale-95' : ''
                            }`}
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">{template?.emoji}</span>
                            <span className="text-xs flex-1 truncate">
                              {template ? getLocalizedName(template) : activity.category}
                            </span>

                            <Select
                              value={activity.day_part}
                              onValueChange={(v) => updateActivity(activity.originalIndex, { day_part: v as any })}
                            >
                              <SelectTrigger className="w-24 h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAY_PARTS.map((dp) => (
                                  <SelectItem key={dp.value} value={dp.value}>
                                    {dp.emoji} {t(dp.labelKey)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={String(activity.repetitions)}
                              onValueChange={(v) => updateActivity(activity.originalIndex, { repetitions: parseInt(v) })}
                            >
                              <SelectTrigger className="w-14 h-6 text-xs">
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
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => removeActivity(activity.originalIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}

                      {dayPart.activities.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          {t('calendar.presets.dropActivities')}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Weekly repetitions setting */}
            <Card className="p-3 mt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('calendar.presets.weeklyRepetitions')}</Label>
                <Select
                  value={String(weeklyRepetitions)}
                  onValueChange={(v) => setWeeklyRepetitions(parseInt(v))}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {t('calendar.presets.daysPerWeek')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {preset && (
              <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
