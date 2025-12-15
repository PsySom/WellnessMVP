import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getCategoriesByType, getGroupsForType, getCategoryConfig, getAllCategories, RESTORING_GROUPS } from '@/config/categoryConfig';
import { TimeSlot, TIME_SLOTS, getDefaultTimeForSlot } from '@/utils/timeSlots';
import { format, addDays, addWeeks, addMonths, addYears, getDay } from 'date-fns';
import { CalendarIcon, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { z } from 'zod';
import { triggerActivityUpdate } from '@/utils/activitySync';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ActivityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  activity?: any;
  exerciseId?: string;
  testId?: string;
  initialValues?: any;
  editMode?: 'single' | 'all';
}

const activitySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  duration_minutes: z.number().min(5).max(1440),
});

const IMPACT_TYPES = [
  { value: 'restoring' as const, color: 'bg-accent' },
  { value: 'depleting' as const, color: 'bg-destructive' },
  { value: 'mixed' as const, color: 'bg-warning' },
  { value: 'neutral' as const, color: 'bg-secondary' }
];

export const ActivityFormModal = ({ open, onOpenChange, defaultDate, activity, exerciseId, testId, initialValues, editMode = 'single' }: ActivityFormModalProps) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(activity?.id);
  const [duplicateDialog, setDuplicateDialog] = useState<{ open: boolean; onConfirm: () => void }>({ 
    open: false, 
    onConfirm: () => {} 
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: defaultDate || new Date(),
    start_time: '',
    duration_minutes: 60,
    impact_type: 'neutral' as 'restoring' | 'depleting' | 'mixed' | 'neutral',
    category: 'other' as any,
    priority: 3,
    is_recurring: false,
    recurrence_pattern: 'daily',
    reminder_enabled: false,
    reminder_minutes_before: 15,
    timeSlot: 'anytime' as TimeSlot | 'exact_time' | 'anytime',
    emoji: '📌',
    // New repetition logic
    recurrence_type: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'custom',
    recurrence_count: 7, // Number of repetitions for daily/weekly/monthly
    custom_interval: 1,
    custom_unit: 'day' as 'day' | 'week' | 'month' | 'year',
    custom_end_type: 'never' as 'never' | 'date' | 'count',
    custom_end_date: addMonths(new Date(), 1),
    custom_end_count: 30,
  });
  
  const [customRecurrenceOpen, setCustomRecurrenceOpen] = useState(false);

  const availableCategories = useMemo(() => {
    return getCategoriesByType(formData.impact_type);
  }, [formData.impact_type]);

  // Get label for the currently selected category (for display in SelectValue)
  const getCurrentCategoryLabel = useMemo(() => {
    const config = getCategoryConfig(formData.category);
    if (!config) return formData.category;
    const lang = i18n.language as 'en' | 'ru' | 'fr';
    return `${config.emoji} ${config.label[lang] || config.label.en}`;
  }, [formData.category, i18n.language]);

  // Auto-fill duration when category with default duration is selected
  useEffect(() => {
    const categoryConfig = availableCategories.find(cat => cat.value === formData.category);
    if (categoryConfig?.defaultDuration && !activity) {
      setFormData(prev => ({ ...prev, duration_minutes: categoryConfig.defaultDuration! }));
    }
  }, [formData.category, availableCategories, activity]);

  // Auto-update category when impact type changes (only for new activities, not editing)
  useEffect(() => {
    if (isEditing) return; // Don't auto-change category when editing
    
    const categories = getCategoriesByType(formData.impact_type);
    if (categories.length > 0) {
      const currentCategoryExists = categories.some(cat => cat.value === formData.category);
      if (!currentCategoryExists) {
        setFormData(prev => ({ ...prev, category: categories[0].value }));
      }
    }
  }, [formData.impact_type, formData.category, isEditing]);

  useEffect(() => {
    if (open) {
      if (activity) {
        const repetitionConfig = activity.repetition_config || {};
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          date: new Date(activity.date),
          start_time: activity.start_time || '',
          duration_minutes: activity.duration_minutes || 60,
          impact_type: activity.impact_type || 'neutral',
          category: activity.category || 'other',
          priority: activity.priority || 3,
          is_recurring: activity.is_recurring || false,
          recurrence_pattern: activity.recurrence_pattern || 'daily',
          reminder_enabled: activity.reminder_enabled || false,
          reminder_minutes_before: activity.reminder_minutes_before || 15,
          timeSlot: activity.start_time ? 'exact_time' : 'anytime',
          emoji: activity.emoji || '📌',
          recurrence_type: repetitionConfig.recurrence_type || 'none',
          recurrence_count: repetitionConfig.recurrence_count || 7,
          custom_interval: repetitionConfig.custom_interval || 1,
          custom_unit: repetitionConfig.custom_unit || 'day',
          custom_end_type: repetitionConfig.custom_end_type || 'never',
          custom_end_date: repetitionConfig.custom_end_date ? new Date(repetitionConfig.custom_end_date) : addMonths(new Date(), 1),
          custom_end_count: repetitionConfig.custom_end_count || 30,
        });
      } else if (initialValues) {
        const impactType = initialValues.impact_type || 'neutral';
        const categories = getCategoriesByType(impactType);
        const defaultCategory = categories.length > 0 ? categories[0].value : 'other';
        
        setFormData(prev => ({
          ...prev,
          ...initialValues,
          impact_type: impactType,
          category: initialValues.category || defaultCategory,
          timeSlot: initialValues.start_time ? 'exact_time' : 'anytime',
          emoji: initialValues.emoji || '📌',
          recurrence_type: 'none',
          recurrence_count: 7,
          custom_interval: 1,
          custom_unit: 'day',
          custom_end_type: 'never',
          custom_end_date: addMonths(new Date(), 1),
          custom_end_count: 30,
        }));
      } else {
        // Initialize with first available category for neutral type
        const categories = getCategoriesByType('neutral');
        const defaultCategory = categories.length > 0 ? categories[0].value : 'other';
        
        setFormData(prev => ({ 
          ...prev, 
          date: defaultDate || new Date(),
          category: defaultCategory,
          recurrence_type: 'none',
          recurrence_count: 7,
          custom_interval: 1,
          custom_unit: 'day',
          custom_end_type: 'never',
          custom_end_date: addMonths(new Date(), 1),
          custom_end_count: 30,
        }));
      }
    }
  }, [open, activity, initialValues, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      activitySchema.parse({
        title: formData.title,
        description: formData.description,
        duration_minutes: formData.duration_minutes,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    let startTime = null;
    if (formData.timeSlot === 'exact_time') {
      startTime = formData.start_time || null;
    } else if (formData.timeSlot !== 'anytime') {
      startTime = getDefaultTimeForSlot(formData.timeSlot as TimeSlot);
    }

    const baseActivityData = {
      title: formData.title,
      description: formData.description || null,
      date: format(formData.date, 'yyyy-MM-dd'),
      start_time: startTime,
      duration_minutes: formData.duration_minutes,
      impact_type: formData.impact_type,
      category: formData.category,
      priority: formData.priority,
      is_recurring: formData.recurrence_type !== 'none',
      recurrence_pattern: formData.recurrence_type !== 'none' ? formData.recurrence_type : null,
      reminder_enabled: formData.reminder_enabled,
      reminder_minutes_before: formData.reminder_enabled ? formData.reminder_minutes_before : null,
      user_id: user!.id,
      exercise_id: exerciseId || null,
      test_id: testId || null,
      emoji: formData.emoji || '📌',
      repetition_config: {
        recurrence_type: formData.recurrence_type,
        recurrence_count: formData.recurrence_count,
        recurrence_group_id: formData.recurrence_type !== 'none' ? crypto.randomUUID() : null,
        custom_interval: formData.custom_interval,
        custom_unit: formData.custom_unit,
        custom_end_type: formData.custom_end_type,
        custom_end_date: formData.custom_end_type === 'date' ? format(formData.custom_end_date, 'yyyy-MM-dd') : null,
        custom_end_count: formData.custom_end_type === 'count' ? formData.custom_end_count : null,
      }
    };

    if (isEditing) {
      const recurrenceGroupId = activity?.repetition_config?.recurrence_group_id;
      
      if (editMode === 'all' && recurrenceGroupId) {
        // Update all activities in the recurrence group
        const { data: allActivities, error: fetchError } = await supabase
          .from('activities')
          .select('id, repetition_config')
          .eq('user_id', user!.id);

        if (fetchError) {
          setLoading(false);
          toast.error(t('calendar.form.saveError'));
          return;
        }

        // Filter activities with the same recurrence_group_id
        const activityIds = allActivities
          ?.filter((a: any) => {
            const config = a.repetition_config as any;
            return config?.recurrence_group_id === recurrenceGroupId;
          })
          .map((a: any) => a.id) || [];

        // Update data without changing date/time for individual activities
        const updateData = {
          title: formData.title,
          description: formData.description || null,
          duration_minutes: formData.duration_minutes,
          impact_type: formData.impact_type,
          category: formData.category,
          priority: formData.priority,
          reminder_enabled: formData.reminder_enabled,
          reminder_minutes_before: formData.reminder_enabled ? formData.reminder_minutes_before : null,
          emoji: formData.emoji || '📌',
        };

        const { error } = await supabase
          .from('activities')
          .update(updateData as any)
          .in('id', activityIds);
        
        setLoading(false);

        if (error) {
          console.error('Activity save error:', error);
          toast.error(t('calendar.form.saveError'));
        } else {
          toast.success(t('calendar.form.updateAllSuccess', { count: activityIds.length }));
          onOpenChange(false);
          triggerActivityUpdate();
        }
      } else {
        // Update single activity
        const { error } = await supabase.from('activities').update(baseActivityData as any).eq('id', activity.id);
        
        setLoading(false);

        if (error) {
          console.error('Activity save error:', error);
          toast.error(t('calendar.form.saveError'));
        } else {
          toast.success(t('calendar.form.updateSuccess'));
          onOpenChange(false);
          triggerActivityUpdate();
        }
      }
    } else {
      // Check for duplicates first
      const { data: existingActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', format(formData.date, 'yyyy-MM-dd'))
        .eq('category', formData.category);

      const hasDuplicates = existingActivities && existingActivities.length > 0;

      const createActivities = async () => {
        // Generate dates based on recurrence type
        const activitiesToCreate: any[] = [];
        const baseDate = formData.date;
        
        const generateDates = (): Date[] => {
          const dates: Date[] = [baseDate];
          
          if (formData.recurrence_type === 'none') {
            return dates;
          }
          
          let interval = 1;
          let unit: 'day' | 'week' | 'month' | 'year' = 'day';
          
          if (formData.recurrence_type === 'daily') {
            interval = 1;
            unit = 'day';
          } else if (formData.recurrence_type === 'weekly') {
            interval = 1;
            unit = 'week';
          } else if (formData.recurrence_type === 'monthly') {
            interval = 1;
            unit = 'month';
          } else if (formData.recurrence_type === 'custom') {
            interval = formData.custom_interval;
            unit = formData.custom_unit;
          }
          
          // Generate additional dates for recurring activities
          let count = formData.recurrence_count;
          let maxIterations = 365; // Limit to prevent infinite loops
            
            if (formData.recurrence_type === 'custom') {
              if (formData.custom_end_type === 'count') {
                count = formData.custom_end_count;
              } else if (formData.custom_end_type === 'never') {
                // For "never", create activities for next 365 occurrences as max
                count = 365;
              } else if (formData.custom_end_type === 'date') {
                // Calculate how many occurrences until end date
                count = maxIterations;
              }
            }
            
            for (let i = 1; i < count && i < maxIterations; i++) {
              let newDate: Date;
              if (unit === 'day') {
                newDate = addDays(baseDate, interval * i);
              } else if (unit === 'week') {
                newDate = addWeeks(baseDate, interval * i);
              } else if (unit === 'month') {
                newDate = addMonths(baseDate, interval * i);
              } else {
                newDate = addYears(baseDate, interval * i);
              }
              
              // Check end date condition
              if (formData.recurrence_type === 'custom' && formData.custom_end_type === 'date') {
                if (newDate > formData.custom_end_date) break;
              }
              
              dates.push(newDate);
            }
          
          return dates;
        };
        
        const dates = generateDates();
        
        for (const date of dates) {
          activitiesToCreate.push({
            ...baseActivityData,
            date: format(date, 'yyyy-MM-dd'),
          });
        }

        const { error } = await supabase.from('activities').insert(activitiesToCreate as any);

        setLoading(false);

        if (error) {
          console.error('Activity save error:', error);
          toast.error(t('calendar.form.saveError'));
        } else {
          toast.success(t('calendar.form.createSuccess'));
          onOpenChange(false);
          triggerActivityUpdate();
        }
      };

      if (hasDuplicates) {
        setLoading(false);
        setDuplicateDialog({
          open: true,
          onConfirm: () => {
            setDuplicateDialog({ open: false, onConfirm: () => {} });
            setLoading(true);
            createActivities();
          }
        });
      } else {
        await createActivities();
      }
    }
  };

  return (
    <>
      <AlertDialog open={duplicateDialog.open} onOpenChange={(open) => setDuplicateDialog({ ...duplicateDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('calendar.duplicateDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('calendar.duplicateDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('calendar.duplicateDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={duplicateDialog.onConfirm}>
              {t('calendar.duplicateDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('calendar.editActivity') : t('calendar.addActivity')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('calendar.form.title')}</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>

          <div>
            <Label>{t('calendar.form.date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.date} onSelect={(date) => date && setFormData({ ...formData, date })} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t('calendar.form.timeLabel')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => (
                <Button key={slot.key} type="button" variant={formData.timeSlot === slot.key ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, timeSlot: slot.key })} className="justify-start h-9 text-xs">
                  <span className="mr-1.5">{slot.emoji}</span>
                  {t(`calendar.timeSlots.${slot.key}`)}
                </Button>
              ))}
              <Button type="button" variant={formData.timeSlot === 'anytime' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, timeSlot: 'anytime' })} className="justify-start h-9 text-xs">
                <span className="mr-1.5">📌</span>
                {t('calendar.timeSlots.anytime')}
              </Button>
              <Button type="button" variant={formData.timeSlot === 'exact_time' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, timeSlot: 'exact_time' })} className="justify-start h-9 text-xs">
                <span className="mr-1.5">⏰</span>
                {t('calendar.timeSlots.exact_time')}
              </Button>
            </div>
            {formData.timeSlot === 'exact_time' && (
              <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="mt-2" />
            )}
          </div>

          <div>
            <Label>{t('calendar.form.duration')}</Label>
            <Select 
              value={formData.duration_minutes.toString()} 
              onValueChange={(v) => {
                const parsed = parseInt(v, 10);
                if (!isNaN(parsed)) {
                  setFormData({ ...formData, duration_minutes: parsed });
                }
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="10">10 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="15">15 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="30">30 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="45">45 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="60">1 {t('calendar.form.hour')}</SelectItem>
                <SelectItem value="90">1.5 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="120">2 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="180">3 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="240">4 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="300">5 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="360">6 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="480">8 {t('calendar.form.hours')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('calendar.form.activityType')}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {IMPACT_TYPES.map(type => (
                <Button key={type.value} type="button" variant={formData.impact_type === type.value ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, impact_type: type.value })} className="justify-start">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${type.color}`}></span>
                  {t(`calendar.activityTypes.${type.value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>{t('calendar.form.category')}</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue>{getCurrentCategoryLabel}</SelectValue></SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50 max-h-[400px] overflow-y-auto">
                {(() => {
                  // Use all categories to allow user to select any category
                  const allCategories = getAllCategories();
                  const groups = getGroupsForType(formData.impact_type);
                  
                  // Group categories by impact type for better organization
                  const impactGroups = [
                    { id: 'restoring', label: { en: 'Restoring', ru: 'Восстанавливающие', fr: 'Restaurateur' } },
                    { id: 'depleting', label: { en: 'Depleting', ru: 'Истощающие', fr: 'Épuisant' } },
                    { id: 'mixed', label: { en: 'Mixed', ru: 'Смешанные', fr: 'Mixte' } },
                    { id: 'neutral', label: { en: 'Neutral', ru: 'Нейтральные', fr: 'Neutre' } },
                  ];
                  
                  return impactGroups.map((impactGroup, groupIndex) => {
                    const groupCategories = allCategories.filter(cat => cat.recommendedType === impactGroup.id);
                    if (groupCategories.length === 0) return null;
                    
                    return (
                      <React.Fragment key={impactGroup.id}>
                        {groupIndex > 0 && (
                          <div className="h-px bg-border my-2 mx-2" />
                        )}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {impactGroup.label[i18n.language as 'en' | 'ru' | 'fr'] || impactGroup.label.en}
                        </div>
                        {groupCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="mr-2">{cat.emoji}</span>
                            {cat.label[i18n.language as 'en' | 'ru' | 'fr'] || cat.label.en}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    );
                  });
                })()}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('calendar.form.priority')}</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: level })}
                  className="focus:outline-none transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      level <= formData.priority
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>{t('calendar.form.repetitions')}</Label>
            <Select 
              value={formData.recurrence_type} 
              onValueChange={(v: any) => {
                if (v === 'custom') {
                  setCustomRecurrenceOpen(true);
                }
                setFormData({ ...formData, recurrence_type: v });
              }}
            >
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('calendar.form.recurrence.none')}</SelectItem>
                <SelectItem value="daily">{t('calendar.form.recurrence.daily')}</SelectItem>
                <SelectItem value="weekly">{t('calendar.form.recurrence.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('calendar.form.recurrence.monthly')}</SelectItem>
                <SelectItem value="custom">{t('calendar.form.recurrence.custom')}</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Recurrence count selector for daily/weekly/monthly */}
            {(formData.recurrence_type === 'daily' || formData.recurrence_type === 'weekly' || formData.recurrence_type === 'monthly') && (
              <div className="mt-3 flex items-center gap-3">
                <Label className="whitespace-nowrap text-sm">{t('calendar.form.recurrence.repeatFor')}</Label>
                <div className="flex items-center gap-1">
                  <div className="relative w-16">
                    <Input 
                      type="number" 
                      min={1}
                      max={365}
                      value={formData.recurrence_count} 
                      onChange={(e) => setFormData({ ...formData, recurrence_count: Math.max(1, Math.min(365, parseInt(e.target.value) || 1)) })}
                      className="pr-6 text-center"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                      <button 
                        type="button" 
                        className="p-0.5 hover:bg-accent rounded"
                        onClick={() => setFormData({ ...formData, recurrence_count: Math.min(365, formData.recurrence_count + 1) })}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button 
                        type="button" 
                        className="p-0.5 hover:bg-accent rounded"
                        onClick={() => setFormData({ ...formData, recurrence_count: Math.max(1, formData.recurrence_count - 1) })}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formData.recurrence_type === 'daily' && t('calendar.form.recurrence.days')}
                    {formData.recurrence_type === 'weekly' && t('calendar.form.recurrence.weeks')}
                    {formData.recurrence_type === 'monthly' && t('calendar.form.recurrence.months')}
                  </span>
                </div>
              </div>
            )}
            
            {formData.recurrence_type === 'custom' && (
              <Button 
                type="button" 
                variant="outline" 
                className="mt-2 w-full text-sm"
                onClick={() => setCustomRecurrenceOpen(true)}
              >
                {t('calendar.form.recurrence.editCustom')}: {formData.custom_interval} {t(`calendar.form.recurrence.units.${formData.custom_unit}`)}
              </Button>
            )}
          </div>
          
          {/* Custom Recurrence Dialog */}
          <Dialog open={customRecurrenceOpen} onOpenChange={setCustomRecurrenceOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('calendar.form.recurrence.customTitle')}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Interval with unit */}
                <div className="flex items-center gap-3">
                  <Label className="whitespace-nowrap">{t('calendar.form.recurrence.repeatEvery')}</Label>
                  <div className="flex items-center gap-1">
                    <div className="relative w-16">
                      <Input 
                        type="number" 
                        min={1}
                        value={formData.custom_interval} 
                        onChange={(e) => setFormData({ ...formData, custom_interval: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="pr-6 text-center"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                        <button 
                          type="button" 
                          className="p-0.5 hover:bg-accent rounded"
                          onClick={() => setFormData({ ...formData, custom_interval: formData.custom_interval + 1 })}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button 
                          type="button" 
                          className="p-0.5 hover:bg-accent rounded"
                          onClick={() => setFormData({ ...formData, custom_interval: Math.max(1, formData.custom_interval - 1) })}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <Select 
                      value={formData.custom_unit} 
                      onValueChange={(v: any) => setFormData({ ...formData, custom_unit: v })}
                    >
                      <SelectTrigger className="w-28">
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
                </div>
                
                {/* End condition */}
                <div className="space-y-3">
                  <Label>{t('calendar.form.recurrence.ending')}</Label>
                  <RadioGroup 
                    value={formData.custom_end_type}
                    onValueChange={(v: any) => setFormData({ ...formData, custom_end_type: v })}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="never" id="end-never" />
                      <Label htmlFor="end-never" className="cursor-pointer font-normal">
                        {t('calendar.form.recurrence.never')}
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="date" id="end-date" />
                      <Label htmlFor="end-date" className="cursor-pointer font-normal">
                        {t('calendar.form.recurrence.endDate')}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            disabled={formData.custom_end_type !== 'date'}
                            className="ml-auto"
                          >
                            {format(formData.custom_end_date, 'd MMM yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar 
                            mode="single" 
                            selected={formData.custom_end_date} 
                            onSelect={(date) => date && setFormData({ ...formData, custom_end_date: date })}
                            disabled={(date) => date < formData.date}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="count" id="end-count" />
                      <Label htmlFor="end-count" className="cursor-pointer font-normal">
                        {t('calendar.form.recurrence.after')}
                      </Label>
                      <div className="flex items-center gap-2 ml-auto">
                        <Input 
                          type="number" 
                          min={1}
                          disabled={formData.custom_end_type !== 'count'}
                          value={formData.custom_end_count} 
                          onChange={(e) => setFormData({ ...formData, custom_end_count: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-16 text-center"
                        />
                        <span className="text-sm text-muted-foreground">
                          {t('calendar.form.recurrence.occurrences')}
                        </span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <DialogFooter className="gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setCustomRecurrenceOpen(false)}>
                  {t('calendar.form.cancel')}
                </Button>
                <Button type="button" onClick={() => setCustomRecurrenceOpen(false)}>
                  {t('calendar.form.recurrence.done')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div>
            <Label>{t('calendar.form.description')}</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('calendar.form.cancel')}</Button>
            <Button type="submit" disabled={loading}>{loading ? t('calendar.form.saving') : t('calendar.form.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};
