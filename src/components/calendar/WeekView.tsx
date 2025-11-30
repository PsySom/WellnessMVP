import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimeSlotSection } from './TimeSlotSection';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { TIME_SLOTS, filterActivitiesBySlot } from '@/utils/timeSlots';

interface WeekViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const WeekView = ({ currentDate }: WeekViewProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (user) {
      fetchActivities();
      
      const channel = supabase
        .channel('activities-realtime-weekview')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('WeekView realtime update:', payload);
            fetchActivities();
          }
        )
        .subscribe();
      
      const handleActivityUpdate = () => {
        console.log('Manual WeekView activity update triggered');
        fetchActivities();
      };
      
      window.addEventListener('activity-updated', handleActivityUpdate);

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('activity-updated', handleActivityUpdate);
      };
    }
  }, [user, currentDate]);

  const fetchActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    const weekEnd = addDays(weekStart, 6);
    
    const { data, error } = await supabase
      .from('activities')
      .select('*, exercises(slug), tests(slug)')
      .eq('user_id', user.id)
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('start_time', { ascending: true });

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  const getActivitiesForDay = (day: Date) => {
    return activities.filter(a => isSameDay(new Date(a.date), day));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const dayActivities = getActivitiesForDay(day);
            const completedCount = dayActivities.filter(a => a.status === 'completed').length;
            const totalCount = dayActivities.length;
            
            return (
              <div
                key={day.toString()}
                className={`border border-border rounded-lg p-2 ${
                  isToday ? 'border-primary bg-primary/5' : 'bg-card'
                }`}
              >
                {/* Day Header */}
                <div className="text-center mb-3 pb-2 border-b border-border">
                  <div className="text-xs font-medium text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {format(day, 'd')}
                  </div>
                  {totalCount > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {completedCount}/{totalCount}
                    </div>
                  )}
                </div>

                {/* Time Slots */}
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {TIME_SLOTS.map((slot) => {
                      const slotActivities = filterActivitiesBySlot(dayActivities, slot.key);
                      return (
                        <TimeSlotSection
                          key={slot.key}
                          title={t(`calendar.sections.${slot.key}`)}
                          timeRange={t(`calendar.timeRanges.${slot.key}`)}
                          emoji={slot.emoji}
                          slot={slot.key}
                          activities={slotActivities}
                          onUpdate={fetchActivities}
                        />
                      );
                    })}
                    
                    {/* Anytime section */}
                    <TimeSlotSection
                      title={t('calendar.sections.anytime')}
                      emoji="📌"
                      slot="anytime"
                      activities={filterActivitiesBySlot(dayActivities, 'anytime')}
                      onUpdate={fetchActivities}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};