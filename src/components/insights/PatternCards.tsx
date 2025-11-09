import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Activity, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface PatternCardsProps {
  data: any;
}

const PatternCards = ({ data }: PatternCardsProps) => {
  const { trackerEntries, activities } = data;
  const { t } = useTranslation();

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
      const dayKey = bestDay.day.toLowerCase();
      patterns.push({
        icon: Sun,
        title: `${t('insights.patterns.bestDay')} ${t(`insights.patterns.weekdays.${dayKey}`)}`,
        description: `${t('insights.patterns.averageMoodScore')}: ${bestDay.avg.toFixed(1)}`,
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
            title: t('insights.patterns.activitiesBoost'),
            description: `${((avgActivityDayMood - avgOtherDayMood).toFixed(1))} ${t('insights.patterns.pointsHigher')}`,
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
      const timeSlotKey = mostActive[0].toLowerCase();
      patterns.push({
        icon: Calendar,
        title: `${t('insights.patterns.mostActive')} ${t(`insights.patterns.timeSlots.${timeSlotKey}`)}`,
        description: `${mostActive[1]} ${t('insights.patterns.activitiesScheduled')}`,
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
        title: t('insights.patterns.greatConsistency'),
        description: `${consistency.toFixed(0)}% ${t('insights.patterns.daysTracked')}`,
        color: 'text-accent',
        bgColor: 'bg-accent/10',
      });
    }
  }

  if (patterns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground animate-fade-in">{t('insights.patterns.title')}</h2>
      <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
        {patterns.map((pattern, index) => (
          <Card 
            key={index} 
            className="p-4 md:p-5 lg:p-6 animate-fade-in hover-scale transition-all duration-300 hover:shadow-lg cursor-pointer group"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className={`p-2 md:p-3 rounded-lg ${pattern.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                <pattern.icon className={`h-5 w-5 md:h-6 md:w-6 ${pattern.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">{pattern.title}</h4>
                <p className="text-sm md:text-base text-muted-foreground">{pattern.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatternCards;
