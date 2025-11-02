import { Card } from '@/components/ui/card';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';

interface ActivityCompletionProps {
  activities: any[];
  period: string;
}

const ActivityCompletion = ({ activities, period }: ActivityCompletionProps) => {
  if (activities.length === 0) {
    return null;
  }

  // Get date range
  const dates = activities.map(a => new Date(a.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const allDays = eachDayOfInterval({ start: minDate, end: maxDate });
  
  // Calculate completion rate per day
  const dayData = allDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayActivities = activities.filter(a => a.date === dayStr);
    const completed = dayActivities.filter(a => a.status === 'completed').length;
    const total = dayActivities.length;
    const rate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      date: day,
      rate,
      completed,
      total,
    };
  });

  const avgCompletionRate = dayData.length > 0
    ? dayData.reduce((sum, d) => sum + d.rate, 0) / dayData.length
    : 0;

  // Get intensity color
  const getIntensityColor = (rate: number) => {
    if (rate === 0) return 'bg-muted';
    if (rate < 33) return 'bg-destructive/30';
    if (rate < 66) return 'bg-warning/50';
    return 'bg-accent';
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Activity Completion</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Average completion rate</span>
          <span className="text-lg font-bold text-foreground">{avgCompletionRate.toFixed(0)}%</span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-1.5 min-w-[280px]">
            {dayData.slice(-35).map((day, i) => (
              <div
                key={i}
                className={`aspect-square rounded ${getIntensityColor(day.rate)} hover:ring-2 hover:ring-primary transition-all cursor-pointer group relative`}
                title={`${format(day.date, 'MMM d')}: ${day.completed}/${day.total}`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-medium text-foreground">
                  {day.completed}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <div className="w-3 h-3 rounded bg-destructive/30" />
            <div className="w-3 h-3 rounded bg-warning/50" />
            <div className="w-3 h-3 rounded bg-accent" />
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCompletion;
