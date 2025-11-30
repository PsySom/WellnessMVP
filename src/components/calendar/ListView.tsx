import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimeSlotSection } from './TimeSlotSection';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { TIME_SLOTS, filterActivitiesBySlot } from '@/utils/timeSlots';

interface ListViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const ListView = ({ currentDate, onDateChange }: ListViewProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (user) {
      fetchActivities();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('activities-realtime-listview')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('ListView realtime update:', payload);
            fetchActivities();
          }
        )
        .subscribe();
      
      // Слушаем пользовательское событие для принудительного обновления
      const handleActivityUpdate = () => {
        console.log('Manual ListView activity update triggered');
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
    const { data, error } = await supabase
      .from('activities')
      .select('*, exercises(slug), tests(slug)')
      .eq('user_id', user.id)
      .eq('date', format(currentDate, 'yyyy-MM-dd'))
      .order('start_time', { ascending: true });

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  const selectedDayActivities = activities.filter(a => 
    isSameDay(new Date(a.date), currentDate)
  );

  const completedCount = selectedDayActivities.filter(a => a.status === 'completed').length;
  const totalCount = selectedDayActivities.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Day Selector */}
      <ScrollArea className="border-b border-border">
        <div className="flex gap-2 p-4">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Button
                key={day.toString()}
                variant={isSelected ? 'default' : 'ghost'}
                className={`flex-1 min-w-[60px] flex flex-col h-auto py-3 ${
                  isToday && !isSelected ? 'border-2 border-primary' : ''
                }`}
                onClick={() => onDateChange(day)}
              >
                <span className="text-xs font-medium">
                  {format(day, 'EEE')}
                </span>
                <span className="text-lg font-bold mt-1">
                  {format(day, 'd')}
                </span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Activities List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : selectedDayActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">{t('calendar.noActivitiesYet')}</p>
              <p className="text-sm text-muted-foreground">{t('calendar.addOneToStart')}</p>
            </div>
          ) : (
            <>
              {TIME_SLOTS.map((slot) => {
                const slotActivities = filterActivitiesBySlot(selectedDayActivities, slot.key);
                return (
                  <TimeSlotSection
                    key={slot.key}
                    title={t(`calendar.sections.${slot.key}`)}
                    timeRange={t(`calendar.timeRanges.${slot.key}`)}
                    emoji={slot.emoji}
                    slot={slot.key}
                    activities={slotActivities}
                    onUpdate={fetchActivities}
                    date={format(currentDate, 'yyyy-MM-dd')}
                  />
                );
              })}
              
              {/* Anytime section */}
              <TimeSlotSection
                title={t('calendar.sections.anytime')}
                emoji="📌"
                slot="anytime"
                activities={filterActivitiesBySlot(selectedDayActivities, 'anytime')}
                onUpdate={fetchActivities}
                date={format(currentDate, 'yyyy-MM-dd')}
              />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Stats */}
      {totalCount > 0 && (
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {completedCount}/{totalCount} {t('calendar.completed')} ({completionRate}%)
            </span>
            {completionRate >= 80 && (
              <span className="text-sm text-accent font-medium">
                🎉 {t('calendar.greatProgress')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
