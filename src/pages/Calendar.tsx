import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListView } from '@/components/calendar/ListView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ActivityFormModal } from '@/components/calendar/ActivityFormModal';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useTranslation } from 'react-i18next';

const Calendar = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 md:p-6 lg:p-8 border-b border-border bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousWeek}
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <h1 className="text-lg md:text-xl lg:text-2xl font-semibold min-w-[140px] md:min-w-[180px] text-center">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'd')}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextWeek}
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="default"
              onClick={goToToday}
              className="self-start md:self-auto"
            >
              {t('calendar.today')}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="list" className="flex-1 sm:flex-none">{t('calendar.list')}</TabsTrigger>
                <TabsTrigger value="calendar" className="flex-1 sm:flex-none">{t('calendar.calendar')}</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={() => setIsAddModalOpen(true)} size="default" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              {t('calendar.addActivity')}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {view === 'list' ? (
            <ListView currentDate={currentDate} onDateChange={setCurrentDate} />
          ) : (
            <CalendarView currentDate={currentDate} onDateChange={setCurrentDate} />
          )}
        </div>
      </div>

      <ActivityFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        defaultDate={currentDate}
      />
    </AppLayout>
  );
};

export default Calendar;
