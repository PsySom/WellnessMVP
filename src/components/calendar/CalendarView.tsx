import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const IMPACT_COLORS: Record<string, string> = {
  restoring: 'bg-green-500',
  depleting: 'bg-red-500',
  neutral: 'bg-orange-500',
  mixed: 'bg-blue-500'
};

export const CalendarView = ({ currentDate, onDateChange }: CalendarViewProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekdays = [
    t('calendar.weekdays.short.mon'),
    t('calendar.weekdays.short.tue'),
    t('calendar.weekdays.short.wed'),
    t('calendar.weekdays.short.thu'),
    t('calendar.weekdays.short.fri'),
    t('calendar.weekdays.short.sat'),
    t('calendar.weekdays.short.sun')
  ];

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user, currentDate]);

  const fetchActivities = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('activities')
      .select('*, exercises(slug), tests(slug)')
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
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="text-center mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3 mb-1 sm:mb-2">
          {weekdays.map((day, index) => (
            <div key={`${day}-${index}`} className="text-center text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground py-1 sm:py-2 md:py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3">
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
                  relative aspect-square p-1 sm:p-2 md:p-3 lg:p-4 rounded-md sm:rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-lg
                  ${isCurrentMonth ? 'border-border hover:border-primary/50' : 'border-transparent'}
                  ${isToday && !isSelected ? 'border-2 border-primary' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground shadow-lg scale-105 border-primary' : 'bg-card hover:bg-accent/20'}
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-xs sm:text-sm md:text-base font-medium ${isSelected ? 'text-primary-foreground' : ''}`}>
                    {format(day, 'd')}
                  </span>

                  {/* Activity Dots */}
                  {dayActivities.length > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 mt-0.5 sm:mt-1 md:mt-2">
                      <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 flex-wrap justify-center">
                        {dayActivities.slice(0, 3).map((activity, i) => {
                          const color = IMPACT_COLORS[activity.impact_type] || 'bg-muted';
                          return (
                            <div
                              key={i}
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full ${color}`}
                            />
                          );
                        })}
                      </div>

                      {/* Completion Circle */}
                      <div className="relative w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="50%"
                            cy="50%"
                            r="40%"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="opacity-20"
                          />
                          <circle
                            cx="50%"
                            cy="50%"
                            r="40%"
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
