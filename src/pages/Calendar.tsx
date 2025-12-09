import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListView } from '@/components/calendar/ListView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ActivityFormModal } from '@/components/calendar/ActivityFormModal';
import { TemplatesSidebar } from '@/components/calendar/TemplatesSidebar';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Calendar = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialSlot, setInitialSlot] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<string | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleSlotClick = (slot: string, date: string) => {
    setInitialSlot(slot);
    setInitialDate(date);
    setIsAddModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      setInitialSlot(null);
      setInitialDate(null);
    }
  };

  return (
    <AppLayout>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={75} minSize={50}>
          <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <div className="p-4 md:p-6 lg:p-8 border-b-2 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 lg:mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousWeek}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl hover:bg-muted hover:scale-110 transition-all duration-300"
                  >
                    <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                  <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-3xl font-bold min-w-[180px] text-center animate-fade-in bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {format(weekStart, 'MMM d')} - {format(weekEnd, 'd')}
                    </h1>
                    <span className="text-xs md:text-sm text-muted-foreground font-medium">
                      {format(currentDate, 'yyyy')}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextWeek}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl hover:bg-muted hover:scale-110 transition-all duration-300"
                  >
                    <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="default"
                  onClick={goToToday}
                  className="self-start md:self-auto hover-scale transition-all duration-300 border-2 hover:border-primary hover:bg-primary/5 rounded-xl px-6 font-semibold"
                >
                  {t('calendar.today')}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')} className="w-full sm:w-auto">
                  <TabsList className="w-full sm:w-auto h-11 bg-muted/60 p-1 rounded-xl">
                    <TabsTrigger 
                      value="list" 
                      className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                    >
                      {t('calendar.list')}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="calendar" 
                      className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                    >
                      {t('calendar.calendar')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button 
                  onClick={() => setIsAddModalOpen(true)} 
                  size="lg" 
                  className="w-full sm:w-auto hover-scale transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl px-6 font-semibold touch-manipulation"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('calendar.addActivity')}
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {view === 'list' ? (
                <ListView 
                  currentDate={currentDate} 
                  onDateChange={setCurrentDate} 
                  onSlotClick={handleSlotClick}
                />
              ) : (
                <CalendarView 
                  currentDate={currentDate} 
                  onDateChange={setCurrentDate}
                  onDayClick={(date) => {
                    setCurrentDate(date);
                    setView('list');
                  }}
                />
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="hover:bg-primary/20 transition-colors" />

        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <TemplatesSidebar selectedDate={currentDate} />
        </ResizablePanel>
      </ResizablePanelGroup>

      <ActivityFormModal
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        defaultDate={initialDate ? new Date(initialDate) : currentDate}
        initialValues={initialSlot ? { slot: initialSlot } : undefined}
      />
    </AppLayout>
  );
};

export default Calendar;
