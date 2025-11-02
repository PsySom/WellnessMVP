import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const IMPACT_COLORS: Record<string, string> = {
  positive: 'bg-accent',
  negative: 'bg-destructive',
  neutral: 'bg-muted-foreground',
  mixed: 'bg-warning'
};

export const CalendarView = ({ currentDate, onDateChange }: CalendarViewProps) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, currentDate]);

  const fetchActivities = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', format(calendarStart, 'yyyy-MM-dd'))
      .lte('date', format(calendarEnd, 'yyyy-MM-dd'));

    if (data) {
      setActivities(data);
    }
  };

  const getActivitiesForDay = (day: Date) => {
    return activities.filter(a => isSameDay(new Date(a.date), day));
  };

  const getCompletionRate = (dayActivities: any[]) => {
    if (dayActivities.length === 0) return 0;
    const completed = dayActivities.filter(a => a.status === 'completed').length;
    return Math.round((completed / dayActivities.length) * 100);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayActivities = getActivitiesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            const completionRate = getCompletionRate(dayActivities);

            return (
              <button
                key={day.toString()}
                onClick={() => onDateChange(day)}
                className={`
                  relative aspect-square p-2 rounded-lg border transition-all
                  ${isCurrentMonth ? 'border-border' : 'border-transparent'}
                  ${isToday ? 'border-2 border-primary' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent/10'}
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary-foreground' : ''}`}>
                    {format(day, 'd')}
                  </span>

                  {/* Activity Dots */}
                  {dayActivities.length > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-1 mt-1">
                      <div className="flex gap-1 flex-wrap justify-center">
                        {dayActivities.slice(0, 3).map((activity, i) => {
                          const color = IMPACT_COLORS[activity.impact_type] || 'bg-muted';
                          return (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${color}`}
                            />
                          );
                        })}
                      </div>

                      {/* Completion Circle */}
                      <div className="relative w-6 h-6">
                        <svg className="w-6 h-6 transform -rotate-90">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="opacity-20"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 10}`}
                            strokeDashoffset={`${2 * Math.PI * 10 * (1 - completionRate / 100)}`}
                            className={isSelected ? 'stroke-primary-foreground' : 'stroke-accent'}
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};
