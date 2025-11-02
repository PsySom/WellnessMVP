import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListView } from '@/components/calendar/ListView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ActivityFormModal } from '@/components/calendar/ActivityFormModal';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

const Calendar = () => {
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
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousWeek}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold min-w-[140px] text-center">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'd')}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextWeek}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
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
