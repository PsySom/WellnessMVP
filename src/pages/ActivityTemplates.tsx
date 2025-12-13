import React, { useState, useEffect } from 'react';
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
import { GripVertical, Plus, Save, Trash2, Search, Edit, ChevronDown, ChevronUp, Calendar as CalendarIcon, BarChart3, History, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths } from 'date-fns';

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

interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  activities: PresetActivity[];
  created_at: string;
  updated_at: string;
}

const DAY_PARTS = [
  { value: 'early_morning', labelKey: 'calendar.dayParts.earlyMorning', emoji: '🌅' },
  { value: 'late_morning', labelKey: 'calendar.dayParts.lateMorning', emoji: '☕' },
  { value: 'midday', labelKey: 'calendar.dayParts.midday', emoji: '☀️' },
  { value: 'afternoon', labelKey: 'calendar.dayParts.afternoon', emoji: '🌤️' },
  { value: 'evening', labelKey: 'calendar.dayParts.evening', emoji: '🌆' },
  { value: 'night', labelKey: 'calendar.dayParts.night', emoji: '🌙' },
];

const RECURRENCE_TYPES = [
  { value: 'none', labelKey: 'calendar.form.recurrence.none' },
  { value: 'daily', labelKey: 'calendar.form.recurrence.daily' },
  { value: 'weekly', labelKey: 'calendar.form.recurrence.weekly' },
  { value: 'monthly', labelKey: 'calendar.form.recurrence.monthly' },
  { value: 'custom', labelKey: 'calendar.form.recurrence.custom' },
];

const ActivityTemplates = () => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Editor state
  const [editingPreset, setEditingPreset] = useState<UserPreset | null>(null);
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<PresetActivity[]>([]);
  const [selectedImpactType, setSelectedImpactType] = useState<string>('all');
  const [draggedTemplate, setDraggedTemplate] = useState<ActivityTemplate | null>(null);
  const [draggedActivityIndex, setDraggedActivityIndex] = useState<number | null>(null);
  const [dragOverDayPart, setDragOverDayPart] = useState<string | null>(null);

  // Recurrence settings
  const [recurrenceType, setRecurrenceType] = useState<string>('none');
  const [recurrenceCount, setRecurrenceCount] = useState<number>(7);
  const [customInterval, setCustomInterval] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<string>('day');
  const [customEndType, setCustomEndType] = useState<string>('never');
  const [customEndDate, setCustomEndDate] = useState<Date>(addMonths(new Date(), 1));
  const [customEndCount, setCustomEndCount] = useState<number>(30);

  // Fetch templates from database
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
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

  // Fetch user presets
  const { data: userPresets = [], isLoading: presetsLoading } = useQuery({
    queryKey: ['user-presets'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(p => ({
        ...p,
        activities: Array.isArray(p.activities) ? p.activities : JSON.parse(p.activities as string || '[]')
      })) as UserPreset[];
    },
    enabled: !!user,
  });

  // Load preset into editor
  const loadPresetForEditing = (preset: UserPreset) => {
    setEditingPreset(preset);
    setName(preset.name);
    setActivities(preset.activities || []);
  };

  // Clear editor
  const clearEditor = () => {
    setEditingPreset(null);
    setName('');
    setActivities([]);
    setRecurrenceType('none');
    setRecurrenceCount(7);
    setSearchQuery('');
  };

  // Drag handlers for templates (left side)
  const handleTemplateDragStart = (e: React.DragEvent, template: ActivityTemplate) => {
    setDraggedTemplate(template);
    setDraggedActivityIndex(null);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Drag handlers for existing activities (right side)
  const handleActivityDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedActivityIndex(index);
    setDraggedTemplate(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragEnd = () => {
    setDraggedTemplate(null);
    setDraggedActivityIndex(null);
    setDragOverDayPart(null);
  };

  const handleDayPartDragOver = (e: React.DragEvent, dayPartValue: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = draggedTemplate ? 'copy' : 'move';
    setDragOverDayPart(dayPartValue);
  };

  const handleDayPartDragLeave = () => {
    setDragOverDayPart(null);
  };

  const handleDayPartDrop = (e: React.DragEvent, dayPartValue: string) => {
    e.preventDefault();
    e.stopPropagation();
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
      const updatedActivities = [...activities];
      updatedActivities[draggedActivityIndex] = {
        ...updatedActivities[draggedActivityIndex],
        day_part: dayPartValue as PresetActivity['day_part']
      };
      setActivities(updatedActivities);
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

      if (editingPreset?.id) {
        const { error } = await supabase
          .from('user_presets')
          .update(presetData)
          .eq('id', editingPreset.id);
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
      toast.success(editingPreset ? t('calendar.presets.presetUpdated') : t('calendar.presets.presetCreated'));
      clearEditor();
    },
    onError: (error) => {
      console.error('Error saving preset:', error);
      toast.error(t('calendar.presets.saveError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (presetId: string) => {
      const { error } = await supabase.from('user_presets').delete().eq('id', presetId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-presets'] });
      toast.success(t('calendar.presets.presetDeleted'));
      if (editingPreset) clearEditor();
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

  // Statistics
  const totalPresets = userPresets.length;
  const totalActivitiesInPresets = userPresets.reduce((sum, p) => sum + (p.activities?.length || 0), 0);
  const avgActivitiesPerPreset = totalPresets > 0 ? Math.round(totalActivitiesInPresets / totalPresets) : 0;

  return (
    <AppLayout>
      <div className="h-full flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-7 w-7" />
            {t('activityTemplates.title')}
          </h1>
        </div>

        {/* Main content grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: Template Editor */}
          <Card className="flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Edit className="h-5 w-5" />
                {editingPreset ? t('calendar.presets.editPreset') : t('calendar.presets.createPreset')}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearEditor} disabled={!name && activities.length === 0}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('common.clear')}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  {t('common.save')}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-3">
              {/* Left column: Activity selector */}
              <div className="flex flex-col space-y-3">
                {/* Template name */}
                <div>
                  <Label className="text-xs font-medium">{t('calendar.presets.presetName')}</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={t('calendar.presets.namePlaceholder')}
                    className="mt-1 h-8"
                  />
                </div>

                {/* Search activities */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('activityTemplates.searchPlaceholder')}
                    className="pl-8 h-8"
                  />
                </div>

                {/* Impact type filter badges */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{t('calendar.presets.selectActivities')}</Label>
                    {selectedImpactType !== 'all' && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {filteredTemplates.length} / {templates.length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { value: 'all', emoji: '📋', labelKey: 'activityTemplates.allTypes', color: 'bg-muted' },
                      { value: 'restoring', emoji: '🔋', labelKey: 'activityTemplates.restoring', color: 'bg-green-500/20 border-green-500/50' },
                      { value: 'depleting', emoji: '⚡', labelKey: 'activityTemplates.depleting', color: 'bg-red-500/20 border-red-500/50' },
                      { value: 'mixed', emoji: '🔄', labelKey: 'activityTemplates.mixed', color: 'bg-yellow-500/20 border-yellow-500/50' },
                      { value: 'neutral', emoji: '⚖️', labelKey: 'activityTemplates.neutral', color: 'bg-blue-500/20 border-blue-500/50' },
                    ].map((type) => (
                      <Badge
                        key={type.value}
                        variant={selectedImpactType === type.value ? 'default' : 'outline'}
                        className={`cursor-pointer px-1.5 py-0.5 text-[10px] transition-all hover:scale-105 ${
                          selectedImpactType === type.value 
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' 
                            : `hover:${type.color}`
                        }`}
                        onClick={() => setSelectedImpactType(type.value)}
                      >
                        <span className="mr-0.5">{type.emoji}</span>
                        {t(type.labelKey)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Scrollable activity list with fixed height */}
                <div className="flex-1 min-h-0 relative">
                  <ScrollArea 
                    className="h-full max-h-[300px] border rounded-lg bg-muted/20"
                    onDragOver={handleRemoveZoneDragOver}
                    onDrop={handleRemoveZoneDrop}
                  >
                    <div className="space-y-1 p-2 pr-3">
                      {templatesLoading ? (
                        <div className="space-y-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-9 bg-muted animate-pulse rounded-md" />
                          ))}
                        </div>
                      ) : filteredTemplates.length === 0 ? (
                        <div className="text-center text-xs text-muted-foreground py-8">
                          {t('calendar.presets.noActivitiesFound')}
                        </div>
                      ) : (
                        filteredTemplates.map((template) => (
                          <Card
                            key={template.id}
                            draggable
                            onDragStart={(e) => handleTemplateDragStart(e, template)}
                            onDragEnd={handleDragEnd}
                            className={`p-2 cursor-grab hover:bg-accent/50 transition-all flex items-center gap-2 ${
                              draggedTemplate?.id === template.id ? 'opacity-50 scale-95' : ''
                            }`}
                            onClick={() => addActivity(template)}
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-base">{template.emoji}</span>
                            <span className="text-xs font-medium flex-1 truncate">{getLocalizedName(template)}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] px-1 py-0 ${
                                template.impact_type === 'restoring' ? 'border-green-500/50 text-green-600' :
                                template.impact_type === 'depleting' ? 'border-red-500/50 text-red-600' :
                                template.impact_type === 'mixed' ? 'border-yellow-500/50 text-yellow-600' :
                                'border-blue-500/50 text-blue-600'
                              }`}
                            >
                              {template.impact_type === 'restoring' ? '🔋' :
                               template.impact_type === 'depleting' ? '⚡' :
                               template.impact_type === 'mixed' ? '🔄' : '⚖️'}
                            </Badge>
                            <Plus className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-60" />
                          </Card>
                        ))
                      )}
                    </div>
                    <ScrollBar orientation="vertical" className="w-2.5" />
                  </ScrollArea>
                </div>

                {/* Drop to remove zone */}
                {draggedActivityIndex !== null && (
                  <div className="p-2 border-2 border-dashed border-destructive/50 rounded-lg text-center text-xs text-muted-foreground bg-destructive/5">
                    {t('calendar.presets.dropToRemove')}
                  </div>
                )}
              </div>

              {/* Right column: Day parts distribution */}
              <div className="flex flex-col h-full min-h-0">
                <Label className="flex-shrink-0 mb-2 text-xs">{t('calendar.presets.distribution')}</Label>
                <ScrollArea className="flex-1 min-h-0 h-[280px] border rounded-md">
                  <div className="space-y-1.5 p-2">
                    {activitiesByDayPart.map((dayPart) => (
                      <Card 
                        key={dayPart.value} 
                        className={`p-2 transition-all min-h-[44px] ${
                          dragOverDayPart === dayPart.value 
                            ? 'ring-2 ring-primary bg-primary/10 scale-[1.01]' 
                            : 'hover:bg-muted/30'
                        } ${draggedActivityIndex !== null ? 'cursor-copy' : ''}`}
                        onDragOver={(e) => handleDayPartDragOver(e, dayPart.value)}
                        onDragLeave={handleDayPartDragLeave}
                        onDrop={(e) => handleDayPartDrop(e, dayPart.value)}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm">{dayPart.emoji}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {t(dayPart.labelKey)}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">({dayPart.activities.length})</span>
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
                                className={`flex items-center gap-1 p-1 bg-muted/50 rounded text-xs cursor-grab transition-all ${
                                  draggedActivityIndex === activity.originalIndex ? 'opacity-50 scale-95' : ''
                                }`}
                              >
                                <GripVertical className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">{template?.emoji}</span>
                                <span className="flex-1 truncate text-[11px]">
                                  {template ? getLocalizedName(template) : activity.category}
                                </span>
                                <Select
                                  value={String(activity.repetitions)}
                                  onValueChange={(v) => updateActivity(activity.originalIndex, { repetitions: parseInt(v) })}
                                >
                                  <SelectTrigger className="w-12 h-5 text-[10px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <SelectItem key={n} value={String(n)}>×{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5"
                                  onClick={() => removeActivity(activity.originalIndex)}
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            );
                          })}

                          {dayPart.activities.length === 0 && (
                            <p className="text-[10px] text-muted-foreground text-center py-0.5">
                              {t('calendar.presets.dropActivities')}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Recurrence settings */}
                <Card className="p-2 mt-2 flex-shrink-0 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">{t('calendar.form.recurrenceType')}</Label>
                    <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                      <SelectTrigger className="w-full h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRENCE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {t(type.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(recurrenceType === 'daily' || recurrenceType === 'weekly' || recurrenceType === 'monthly') && (
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
                      <Label className="text-[10px] whitespace-nowrap">{t('calendar.presets.repeatFor')}</Label>
                      <div className="flex items-center gap-0.5">
                        <Button type="button" size="icon" variant="outline" className="h-6 w-6"
                          onClick={() => setRecurrenceCount(Math.max(1, recurrenceCount - 1))}>
                          <ChevronDown className="h-2.5 w-2.5" />
                        </Button>
                        <Input type="number" value={recurrenceCount}
                          onChange={(e) => setRecurrenceCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-10 h-6 text-center text-[10px] px-0.5" min={1} />
                        <Button type="button" size="icon" variant="outline" className="h-6 w-6"
                          onClick={() => setRecurrenceCount(recurrenceCount + 1)}>
                          <ChevronUp className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {recurrenceType === 'daily' && t('calendar.presets.days')}
                        {recurrenceType === 'weekly' && t('calendar.presets.weeks')}
                        {recurrenceType === 'monthly' && t('calendar.presets.months')}
                      </span>
                    </div>
                  )}

                  {recurrenceType === 'custom' && (
                    <div className="space-y-2 pt-1.5 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-[10px] whitespace-nowrap">{t('calendar.form.recurrence.repeatEvery')}</Label>
                        <div className="flex items-center gap-0.5">
                          <Button type="button" size="icon" variant="outline" className="h-6 w-6"
                            onClick={() => setCustomInterval(Math.max(1, customInterval - 1))}>
                            <ChevronDown className="h-2.5 w-2.5" />
                          </Button>
                          <Input type="number" value={customInterval}
                            onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 h-6 text-center text-[10px] px-0.5" min={1} />
                          <Button type="button" size="icon" variant="outline" className="h-6 w-6"
                            onClick={() => setCustomInterval(customInterval + 1)}>
                            <ChevronUp className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                        <Select value={customUnit} onValueChange={setCustomUnit}>
                          <SelectTrigger className="w-20 h-6 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">{t('calendar.form.recurrence.units.day')}</SelectItem>
                            <SelectItem value="week">{t('calendar.form.recurrence.units.week')}</SelectItem>
                            <SelectItem value="month">{t('calendar.form.recurrence.units.month')}</SelectItem>
                            <SelectItem value="year">{t('calendar.form.recurrence.units.year')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px]">{t('calendar.form.recurrence.ending')}</Label>
                        <RadioGroup value={customEndType} onValueChange={setCustomEndType} className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <RadioGroupItem value="never" id="end-never" className="h-3 w-3" />
                            <Label htmlFor="end-never" className="text-[10px]">{t('calendar.form.recurrence.never')}</Label>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <RadioGroupItem value="date" id="end-date" className="h-3 w-3" />
                            <Label htmlFor="end-date" className="text-[10px]">{t('calendar.form.recurrence.endDate')}</Label>
                            {customEndType === 'date' && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                                    <CalendarIcon className="h-2.5 w-2.5 mr-1" />
                                    {format(customEndDate, 'dd.MM.yyyy')}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={customEndDate}
                                    onSelect={(date) => date && setCustomEndDate(date)}
                                    disabled={(date) => date < new Date()} initialFocus />
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RadioGroupItem value="count" id="end-count" className="h-3 w-3" />
                            <Label htmlFor="end-count" className="text-[10px]">{t('calendar.form.recurrence.after')}</Label>
                            {customEndType === 'count' && (
                              <>
                                <Input type="number" value={customEndCount}
                                  onChange={(e) => setCustomEndCount(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-12 h-6 text-[10px]" min={1} />
                                <span className="text-[10px] text-muted-foreground">{t('calendar.form.recurrence.occurrences')}</span>
                              </>
                            )}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </Card>

          {/* RIGHT: Template Library */}
          <Card className="flex flex-col p-4 overflow-hidden">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5" />
              {t('activityTemplates.library')}
            </h2>

            <ScrollArea className="flex-1 min-h-0">
              {presetsLoading ? (
                <div className="space-y-2 p-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : userPresets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Layers className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">{t('activityTemplates.noPresets')}</p>
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {userPresets.map((preset) => (
                    <Card key={preset.id} className="p-3 hover:bg-accent/30 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{preset.emoji}</span>
                          <div>
                            <p className="font-medium text-sm">{preset.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {preset.activities?.length || 0} {t('activityTemplates.activitiesCount')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadPresetForEditing(preset)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(preset.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Day parts preview */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {DAY_PARTS.map((dp) => {
                          const count = (preset.activities || []).filter(a => a.day_part === dp.value).length;
                          if (count === 0) return null;
                          return (
                            <Badge key={dp.value} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {dp.emoji} {count}
                            </Badge>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </Card>
        </div>

        {/* BOTTOM: Statistics */}
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('activityTemplates.statistics')}</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalPresets}</p>
              <p className="text-xs text-muted-foreground">{t('activityTemplates.totalPresets')}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalActivitiesInPresets}</p>
              <p className="text-xs text-muted-foreground">{t('activityTemplates.totalActivities')}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-primary">{avgActivitiesPerPreset}</p>
              <p className="text-xs text-muted-foreground">{t('activityTemplates.avgPerPreset')}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-primary">{templates.length}</p>
              <p className="text-xs text-muted-foreground">{t('activityTemplates.availableActivities')}</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ActivityTemplates;
