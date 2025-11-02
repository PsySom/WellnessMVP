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

interface ActivityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  activity?: any;
}

const CATEGORIES = [
  { value: 'exercise' as const, label: '🏃 Exercise', emoji: '🏃' },
  { value: 'health' as const, label: '💊 Health', emoji: '💊' },
  { value: 'hobby' as const, label: '🎨 Hobby', emoji: '🎨' },
  { value: 'work' as const, label: '💼 Work', emoji: '💼' },
  { value: 'practice' as const, label: '📚 Practice', emoji: '📚' },
  { value: 'reflection' as const, label: '💆 Reflection', emoji: '💆' },
  { value: 'sleep' as const, label: '😴 Sleep', emoji: '😴' },
  { value: 'nutrition' as const, label: '🍎 Nutrition', emoji: '🍎' },
  { value: 'social' as const, label: '👥 Social', emoji: '👥' },
  { value: 'leisure' as const, label: '🎮 Leisure', emoji: '🎮' },
  { value: 'hydration' as const, label: '💧 Hydration', emoji: '💧' }
];

const IMPACT_TYPES = [
  { value: 'positive', label: 'Positive', color: 'bg-accent' },
  { value: 'negative', label: 'Negative', color: 'bg-destructive' },
  { value: 'neutral', label: 'Neutral', color: 'bg-muted' },
  { value: 'mixed', label: 'Mixed', color: 'bg-warning' }
];

export const ActivityFormModal = ({ open, onOpenChange, defaultDate, activity }: ActivityFormModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'leisure' as const,
    impact_type: 'neutral' as const,
    date: defaultDate || new Date(),
    all_day: true,
    start_time: '09:00',
    end_time: '10:00',
    duration_minutes: 60,
    reminder_enabled: false,
    reminder_minutes_before: 15
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        category: activity.category || 'leisure',
        impact_type: activity.impact_type || 'neutral',
        date: new Date(activity.date),
        all_day: !activity.start_time,
        start_time: activity.start_time || '09:00',
        end_time: activity.end_time || '10:00',
        duration_minutes: activity.duration_minutes || 60,
        reminder_enabled: activity.reminder_enabled || false,
        reminder_minutes_before: activity.reminder_minutes_before || 15
      });
    } else if (defaultDate) {
      setFormData(prev => ({ ...prev, date: defaultDate }));
    }
  }, [activity, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const activityData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      impact_type: formData.impact_type,
      date: format(formData.date, 'yyyy-MM-dd'),
      start_time: formData.all_day ? null : formData.start_time,
      end_time: formData.all_day ? null : formData.end_time,
      duration_minutes: formData.duration_minutes,
      reminder_enabled: formData.reminder_enabled,
      reminder_minutes_before: formData.reminder_enabled ? formData.reminder_minutes_before : null,
      status: 'planned' as const
    };

    const { error } = activity
      ? await supabase.from('activities').update(activityData).eq('id', activity.id)
      : await supabase.from('activities').insert(activityData);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save activity',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: activity ? 'Activity updated' : 'Activity created'
      });
      onOpenChange(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({ ...formData, category: v as typeof formData.category })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Impact Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {IMPACT_TYPES.map(type => (
                <Button
                  key={type.value}
                  type="button"
                  variant={formData.impact_type === type.value ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, impact_type: type.value as typeof formData.impact_type })}
                  className="justify-start"
                >
                  <div className={`w-3 h-3 rounded-full ${type.color} mr-2`} />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="all-day">All Day</Label>
            <Switch
              id="all-day"
              checked={formData.all_day}
              onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked })}
            />
          </div>

          {!formData.all_day && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  step="5"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="reminder">Reminder</Label>
            <Switch
              id="reminder"
              checked={formData.reminder_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
            />
          </div>

          {formData.reminder_enabled && (
            <div>
              <Label>Remind me before</Label>
              <Select
                value={formData.reminder_minutes_before.toString()}
                onValueChange={(v) => setFormData({ ...formData, reminder_minutes_before: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
