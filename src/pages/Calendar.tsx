import { AppLayout } from '@/components/layout/AppLayout';

const Calendar = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Calendar</h1>
        <p className="text-muted-foreground">Your activities calendar will appear here.</p>
      </div>
    </AppLayout>
  );
};

export default Calendar;
