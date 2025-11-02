import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Activity, Sun } from 'lucide-react';
import { format } from 'date-fns';

interface PatternCardsProps {
  data: any;
}

const PatternCards = ({ data }: PatternCardsProps) => {
  const { trackerEntries, activities } = data;

  if (trackerEntries.length === 0 && activities.length === 0) {
    return null;
  }

  const patterns = [];

  // Best day of week for mood
  if (trackerEntries.length > 0) {
    const dayMoods: { [key: string]: { sum: number; count: number } } = {};
    
    trackerEntries.forEach((entry: any) => {
      if (entry.mood_score !== null) {
        const day = format(new Date(entry.entry_date), 'EEEE');
        if (!dayMoods[day]) {
          dayMoods[day] = { sum: 0, count: 0 };
        }
        dayMoods[day].sum += entry.mood_score;
        dayMoods[day].count += 1;
      }
    });

    const bestDay = Object.entries(dayMoods)
      .map(([day, data]) => ({ day, avg: data.sum / data.count }))
      .sort((a, b) => b.avg - a.avg)[0];

    if (bestDay) {
      patterns.push({
        icon: Sun,
        title: `You feel best on ${bestDay.day}s`,
        description: `Average mood score: ${bestDay.avg.toFixed(1)}`,
        color: 'text-accent',
        bgColor: 'bg-accent/10',
      });
    }
  }

  // Activity impact on mood
  if (trackerEntries.length > 0 && activities.length > 0) {
    const completedActivities = activities.filter((a: any) => a.status === 'completed');
    
    if (completedActivities.length > 0) {
      const activityDays = completedActivities.map((a: any) => a.date);
      const moodsOnActivityDays = trackerEntries.filter((e: any) => 
        activityDays.includes(e.entry_date) && e.mood_score !== null
      );
      
      const moodsOnOtherDays = trackerEntries.filter((e: any) => 
        !activityDays.includes(e.entry_date) && e.mood_score !== null
      );

      if (moodsOnActivityDays.length > 0 && moodsOnOtherDays.length > 0) {
        const avgActivityDayMood = moodsOnActivityDays.reduce((sum: number, e: any) => sum + e.mood_score, 0) / moodsOnActivityDays.length;
        const avgOtherDayMood = moodsOnOtherDays.reduce((sum: number, e: any) => sum + e.mood_score, 0) / moodsOnOtherDays.length;
        
        if (avgActivityDayMood > avgOtherDayMood) {
          patterns.push({
            icon: Activity,
            title: 'Activities boost your mood',
            description: `${((avgActivityDayMood - avgOtherDayMood).toFixed(1))} points higher on active days`,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          });
        }
      }
    }
  }

  // Most productive time
  if (activities.length > 0) {
    const timeSlots: { [key: string]: number } = {};
    
    activities.forEach((activity: any) => {
      if (activity.start_time) {
        const hour = parseInt(activity.start_time.split(':')[0]);
        const slot = 
          hour < 6 ? 'Night' :
          hour < 12 ? 'Morning' :
          hour < 18 ? 'Afternoon' : 'Evening';
        timeSlots[slot] = (timeSlots[slot] || 0) + 1;
      }
    });

    const mostActive = Object.entries(timeSlots)
      .sort((a, b) => b[1] - a[1])[0];

    if (mostActive) {
      patterns.push({
        icon: Calendar,
        title: `Most active in the ${mostActive[0]}`,
        description: `${mostActive[1]} activities scheduled`,
        color: 'text-secondary',
        bgColor: 'bg-secondary/10',
      });
    }
  }

  // Consistency pattern
  if (trackerEntries.length > 0) {
    const uniqueDays = new Set(trackerEntries.map((e: any) => e.entry_date)).size;
    const totalDays = Math.floor(
      (new Date().getTime() - new Date(trackerEntries[0].entry_date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const consistency = (uniqueDays / totalDays) * 100;

    if (consistency >= 70) {
      patterns.push({
        icon: TrendingUp,
        title: 'Great tracking consistency',
        description: `${consistency.toFixed(0)}% of days tracked`,
        color: 'text-accent',
        bgColor: 'bg-accent/10',
      });
    }
  }

  if (patterns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Patterns & Insights</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {patterns.map((pattern, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${pattern.bgColor}`}>
                <pattern.icon className={`h-5 w-5 ${pattern.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{pattern.title}</h4>
                <p className="text-sm text-muted-foreground">{pattern.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatternCards;
