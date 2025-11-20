import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getCategoriesByType, getAllCategories } from '@/config/categoryConfig';
import { TimeSlot, TIME_SLOTS, getDefaultTimeForSlot } from '@/utils/timeSlots';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  duration_minutes: z.number().min(5).max(1440),
});

const IMPACT_TYPES = [
  { value: 'restoring' as const, color: 'bg-green-500' },
  { value: 'depleting' as const, color: 'bg-red-500' },
  { value: 'mixed' as const, color: 'bg-orange-500' },
  { value: 'neutral' as const, color: 'bg-blue-500' }
];

export const ActivityFormModal = ({ open, onOpenChange, defaultDate, activity, exerciseId, initialValues }: ActivityFormModalProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(activity?.id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: defaultDate || new Date(),
    start_time: '',
    duration_minutes: 60,
    impact_type: 'neutral' as 'restoring' | 'depleting' | 'mixed' | 'neutral',
    category: 'other' as any,
    is_recurring: false,
    recurrence_pattern: 'daily',
    reminder_enabled: false,
    reminder_minutes_before: 15,
    timeSlot: 'anytime' as TimeSlot | 'exact_time' | 'anytime',
  });

  const availableCategories = useMemo(() => {
    const recommended = getCategoriesByType(formData.impact_type);
    const all = getAllCategories();
    return { recommended, all };
  }, [formData.impact_type]);

  useEffect(() => {
    if (open) {
      if (activity) {
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          date: new Date(activity.date),
          start_time: activity.start_time || '',
          duration_minutes: activity.duration_minutes || 60,
          impact_type: activity.impact_type || 'neutral',
          category: activity.category || 'other',
          is_recurring: activity.is_recurring || false,
          recurrence_pattern: activity.recurrence_pattern || 'daily',
          reminder_enabled: activity.reminder_enabled || false,
          reminder_minutes_before: activity.reminder_minutes_before || 15,
          timeSlot: activity.start_time ? 'exact_time' : 'anytime'
        });
      } else if (initialValues) {
        setFormData(prev => ({
          ...prev,
          ...initialValues,
          timeSlot: initialValues.start_time ? 'exact_time' : 'anytime'
        }));
      } else if (defaultDate) {
        setFormData(prev => ({ ...prev, date: defaultDate }));
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

    const activityData = {
      title: formData.title,
      description: formData.description || null,
      date: format(formData.date, 'yyyy-MM-dd'),
      start_time: startTime,
      duration_minutes: formData.duration_minutes,
      impact_type: formData.impact_type,
      category: formData.category,
      is_recurring: formData.is_recurring,
      recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null,
      reminder_enabled: formData.reminder_enabled,
      reminder_minutes_before: formData.reminder_enabled ? formData.reminder_minutes_before : null,
      user_id: user!.id,
      exercise_id: exerciseId || null
    };

    const { error } = isEditing
      ? await supabase.from('activities').update(activityData as any).eq('id', activity.id)
      : await supabase.from('activities').insert(activityData as any);

    if (error) {
      toast.error(t('calendar.form.saveError'));
    } else {
      toast.success(activity ? t('calendar.form.updateSuccess') : t('calendar.form.createSuccess'));
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('calendar.editActivity') : t('calendar.addActivity')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('calendar.form.titleRequired')}</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>

          <div>
            <Label>{t('calendar.form.description')}</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
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
            <Label>{t('calendar.form.time')}</Label>
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
            <Select value={formData.duration_minutes.toString()} onValueChange={(v) => setFormData({ ...formData, duration_minutes: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="30">30 {t('calendar.form.minutes')}</SelectItem>
                <SelectItem value="60">1 {t('calendar.form.hour')}</SelectItem>
                <SelectItem value="120">2 {t('calendar.form.hours')}</SelectItem>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {availableCategories.recommended.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>{t('calendar.form.recommended')}</SelectLabel>
                    {availableCategories.recommended.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{t(`calendar.categories.${cat.value}`)}</SelectItem>
                    ))}
                  </SelectGroup>
                )}
                <SelectGroup>
                  <SelectLabel>{t('calendar.form.allCategories')}</SelectLabel>
                  {availableCategories.all.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{t(`calendar.categories.${cat.value}`)}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('calendar.form.cancel')}</Button>
            <Button type="submit" disabled={loading}>{loading ? t('calendar.form.saving') : t('calendar.form.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
