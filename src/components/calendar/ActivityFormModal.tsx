import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface ActivityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  activity?: any;
  exerciseId?: string;
  initialValues?: any;
}

const activitySchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: 'Title is required' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  description: z.string()
    .max(1000, { message: 'Description must be less than 1000 characters' })
    .optional(),
  duration_minutes: z.coerce.number()
    .int()
    .min(5, { message: 'Duration must be at least 5 minutes' })
    .max(1440, { message: 'Duration cannot exceed 24 hours' }),
});

const CATEGORIES = [
  { value: 'exercise' as const, emoji: '🏃' },
  { value: 'health' as const, emoji: '💊' },
  { value: 'hobby' as const, emoji: '🎨' },
  { value: 'work' as const, emoji: '💼' },
  { value: 'practice' as const, emoji: '📚' },
  { value: 'reflection' as const, emoji: '💆' },
  { value: 'sleep' as const, emoji: '😴' },
  { value: 'nutrition' as const, emoji: '🍎' },
  { value: 'social' as const, emoji: '👥' },
  { value: 'leisure' as const, emoji: '🎮' },
  { value: 'hydration' as const, emoji: '💧' }
];

const IMPACT_TYPES = [
  { value: 'restorative', label: 'Restorative', color: 'bg-green-500' },
  { value: 'draining', label: 'Draining', color: 'bg-red-500' },
  { value: 'neutral', label: 'Neutral', color: 'bg-orange-500' },
  { value: 'mixed', label: 'Mixed', color: 'bg-blue-500' }
];

export const ActivityFormModal = ({ open, onOpenChange, defaultDate, activity, exerciseId, initialValues }: ActivityFormModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(activity?.id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'leisure' as const,
    impact_type: 'neutral' as const,
    date: defaultDate || new Date(),
    anytime: true,
    start_time: '09:00',
    duration_minutes: 60,
    is_recurring: false,
    recurrence_pattern: { type: 'none' as 'none' | 'daily' | 'weekly' | 'times_per_day_1' | 'times_per_day_2' | 'times_per_day_3' },
    reminder_enabled: false,
    reminder_minutes_before: 15
  });

  useEffect(() => {
    if (activity && activity.id) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        category: activity.category || 'leisure',
        impact_type: activity.impact_type || 'neutral',
        date: new Date(activity.date),
        anytime: !activity.start_time,
        start_time: activity.start_time || '09:00',
        duration_minutes: activity.duration_minutes || 60,
        is_recurring: activity.is_recurring || false,
        recurrence_pattern: activity.recurrence_pattern || { type: 'none' },
        reminder_enabled: activity.reminder_enabled || false,
        reminder_minutes_before: activity.reminder_minutes_before || 15
      });
    } else if (initialValues) {
      setFormData(prev => ({ ...prev, ...initialValues }));
    } else if (defaultDate) {
      setFormData(prev => ({ ...prev, date: defaultDate }));
    }
  }, [activity, initialValues, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form data
    const safeDuration = Number.isFinite(Number(formData.duration_minutes)) ? Number(formData.duration_minutes) : 60;
    try {
      activitySchema.parse({
        title: formData.title,
        description: formData.description,
        duration_minutes: safeDuration,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('common.error'),
          description: error.errors[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);

    const baseData = {
      user_id: user.id,
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      category: formData.category,
      impact_type: formData.impact_type,
      date: format(formData.date, 'yyyy-MM-dd'),
      start_time: formData.anytime ? null : formData.start_time,
      end_time: null,
      duration_minutes: safeDuration,
      is_recurring: formData.is_recurring,
      recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null,
      reminder_enabled: formData.reminder_enabled,
      reminder_minutes_before: formData.reminder_enabled ? formData.reminder_minutes_before : null,
      status: 'planned' as const
    };

    const { error } = isEditing
      ? await supabase.from('activities').update(baseData).eq('id', activity.id)
      : await supabase.from('activities').insert({ ...baseData, exercise_id: exerciseId ?? null });

    if (error) {
      toast({
        title: t('common.error'),
        description: t('calendar.form.saveError'),
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('common.success'),
        description: activity ? t('calendar.form.updateSuccess') : t('calendar.form.createSuccess')
      });
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl md:text-2xl">{isEditing ? t('calendar.editActivity') : t('calendar.addActivity')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div>
            <Label htmlFor="title" className="text-sm md:text-base">{t('calendar.form.titleRequired')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={200}
              className="h-10 md:h-11 text-sm md:text-base"
              placeholder={t('calendar.form.titlePlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm md:text-base">{t('calendar.form.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={1000}
              className="text-sm md:text-base resize-none"
              placeholder={t('calendar.form.descriptionPlaceholder')}
            />
          </div>

          <div>
            <Label className="text-sm md:text-base">{t('calendar.form.date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-10 md:h-11 text-sm md:text-base">
                  <CalendarIcon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {format(formData.date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-muted/50">
            <Label htmlFor="anytime" className="text-sm md:text-base cursor-pointer">{t('calendar.form.anytime')}</Label>
            <Switch
              id="anytime"
              checked={formData.anytime}
              onCheckedChange={(checked) => setFormData({ ...formData, anytime: checked })}
            />
          </div>

          {!formData.anytime && (
            <div className="animate-fade-in">
              <Label htmlFor="start-time" className="text-sm md:text-base">{t('calendar.form.startTime')}</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="h-10 md:h-11 text-sm md:text-base"
              />
            </div>
          )}

          <div>
            <Label className="text-sm md:text-base">{t('calendar.form.duration')}</Label>
            <Select
              value={formData.duration_minutes.toString()}
              onValueChange={(v) => setFormData({ ...formData, duration_minutes: parseInt(v) })}
            >
              <SelectTrigger className="h-10 md:h-11 text-sm md:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="text-sm md:text-base">10 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="15" className="text-sm md:text-base">15 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="30" className="text-sm md:text-base">30 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="45" className="text-sm md:text-base">45 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="60" className="text-sm md:text-base">1 {t('calendar.form.hour')}</SelectItem>
                <SelectItem value="120" className="text-sm md:text-base">2 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="180" className="text-sm md:text-base">3 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="240" className="text-sm md:text-base">4 {t('calendar.form.hours')}</SelectItem>
                <SelectItem value="300" className="text-sm md:text-base">{t('calendar.form.more')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm md:text-base mb-3 block">{t('calendar.form.activityType')}</Label>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {IMPACT_TYPES.map(type => (
                <Button
                  key={type.value}
                  type="button"
                  variant={formData.impact_type === type.value ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, impact_type: type.value as typeof formData.impact_type })}
                  className="justify-start h-10 md:h-11 text-sm md:text-base transition-all hover-scale"
                >
                  <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full ${type.color} mr-2 shrink-0 ring-2 ring-border`} />
                  {t(`calendar.activityTypes.${type.value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm md:text-base">{t('calendar.form.category')}</Label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({ ...formData, category: v as typeof formData.category })}
            >
              <SelectTrigger className="h-10 md:h-11 text-sm md:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="text-sm md:text-base cursor-pointer">
                    {cat.emoji} {t(`calendar.categories.${cat.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-muted/50">
            <Label htmlFor="recurring" className="text-sm md:text-base cursor-pointer">{t('calendar.form.recurring')}</Label>
            <Switch
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked, recurrence_pattern: { type: checked ? 'daily' : 'none' } })}
            />
          </div>

          {formData.is_recurring && (
            <div className="animate-fade-in">
              <Label className="text-sm md:text-base">{t('calendar.form.recurrenceType')}</Label>
              <Select
                value={formData.recurrence_pattern.type}
                onValueChange={(v) => setFormData({ ...formData, recurrence_pattern: { type: v as any } })}
              >
                <SelectTrigger className="h-10 md:h-11 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="times_per_day_1" className="text-sm md:text-base">{t('calendar.form.oncePerDay')}</SelectItem>
                  <SelectItem value="times_per_day_2" className="text-sm md:text-base">{t('calendar.form.twicePerDay')}</SelectItem>
                  <SelectItem value="times_per_day_3" className="text-sm md:text-base">{t('calendar.form.thricePerDay')}</SelectItem>
                  <SelectItem value="daily" className="text-sm md:text-base">{t('calendar.form.everyDay')}</SelectItem>
                  <SelectItem value="weekly" className="text-sm md:text-base">{t('calendar.form.everyWeek')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-muted/50">
            <Label htmlFor="reminder" className="text-sm md:text-base cursor-pointer">{t('calendar.form.reminder')}</Label>
            <Switch
              id="reminder"
              checked={formData.reminder_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
            />
          </div>

          {formData.reminder_enabled && (
            <div className="animate-fade-in">
              <Label className="text-sm md:text-base">{t('calendar.form.remindBefore')}</Label>
              <Select
                value={formData.reminder_minutes_before.toString()}
                onValueChange={(v) => setFormData({ ...formData, reminder_minutes_before: parseInt(v) })}
              >
                <SelectTrigger className="h-10 md:h-11 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5" className="text-sm md:text-base">{t('calendar.form.5min')}</SelectItem>
                  <SelectItem value="10" className="text-sm md:text-base">{t('calendar.form.10min')}</SelectItem>
                  <SelectItem value="15" className="text-sm md:text-base">{t('calendar.form.15min')}</SelectItem>
                  <SelectItem value="30" className="text-sm md:text-base">{t('calendar.form.30min')}</SelectItem>
                  <SelectItem value="60" className="text-sm md:text-base">{t('calendar.form.1hour')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 md:gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
            >
              {t('calendar.form.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
            >
              {loading ? t('calendar.form.saving') : t('calendar.form.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
