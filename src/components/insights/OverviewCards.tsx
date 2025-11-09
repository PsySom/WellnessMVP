import { Card } from '@/components/ui/card';
import { Activity, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OverviewCardsProps {
  data: any;
}

const OverviewCards = ({ data }: OverviewCardsProps) => {
  const { trackerEntries, activities, journalSessions } = data;
  const { t } = useTranslation();

  // Calculate average mood
  const moodEntries = trackerEntries.filter((e: any) => e.mood_score !== null);
  const avgMood = moodEntries.length > 0
    ? (moodEntries.reduce((sum: number, e: any) => sum + e.mood_score, 0) / moodEntries.length).toFixed(1)
    : '0';

  const getMoodEmoji = (score: number) => {
    if (score >= 3) return '😄';
    if (score >= 1) return '🙂';
    if (score >= -1) return '😐';
    if (score >= -3) return '😟';
    return '😢';
  };

  // Calculate completion rate
  const completedActivities = activities.filter((a: any) => a.status === 'completed').length;
  const totalActivities = activities.length;
  const completionRate = totalActivities > 0 
    ? Math.round((completedActivities / totalActivities) * 100) 
    : 0;

  // Calculate streak
  const calculateStreak = () => {
    if (trackerEntries.length === 0) return 0;
    
    const uniqueDates = new Set<string>();
    trackerEntries.forEach((e: any) => {
      if (e.entry_date) uniqueDates.add(e.entry_date);
    });
    const dates = Array.from(uniqueDates).sort();
    
    let streak = 0;
    const today = new Date();
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const entryDate = new Date(dates[i]);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const stats = [
    {
      title: t('insights.overview.averageMood'),
      value: avgMood,
      icon: getMoodEmoji(parseFloat(avgMood)),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('insights.overview.activities'),
      value: `${completedActivities}/${totalActivities}`,
      subtitle: `${completionRate}%`,
      icon: Activity,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: t('insights.overview.currentStreak'),
      value: `${calculateStreak()}`,
      subtitle: t('insights.overview.days'),
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: t('insights.overview.journalEntries'),
      value: journalSessions.length,
      icon: BookOpen,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="p-4 md:p-5 lg:p-6 animate-fade-in hover-scale transition-all duration-300 hover:shadow-lg cursor-pointer"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className={`p-2 md:p-2.5 lg:p-3 rounded-lg ${stat.bgColor} transition-transform duration-300 hover:scale-110`}>
              {typeof stat.icon === 'string' ? (
                <span className="text-2xl md:text-3xl">{stat.icon}</span>
              ) : (
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground">{stat.subtitle}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OverviewCards;
