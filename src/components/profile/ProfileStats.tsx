import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Activity, BookOpen, ClipboardList, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfileStatsProps {
  userId: string;
  joinDate: string;
}

export const ProfileStats = ({ userId, joinDate }: ProfileStatsProps) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    memberDays: 0,
    totalEntries: 0,
    activitiesCompleted: 0,
    testsTaken: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      // Calculate member days
      const memberDays = Math.floor(
        (new Date().getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Fetch tracker entries count
      const { count: entriesCount } = await supabase
        .from('tracker_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Fetch completed activities count
      const { count: activitiesCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Fetch tests taken count
      const { count: testsCount } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Calculate current streak
      const { data: recentEntries } = await supabase
        .from('tracker_entries')
        .select('entry_date')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(30);

      let streak = 0;
      if (recentEntries && recentEntries.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const dates = new Set(recentEntries.map((e) => e.entry_date));
        
        let currentDate = new Date();
        while (dates.has(currentDate.toISOString().split('T')[0])) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
      }

      setStats({
        memberDays,
        totalEntries: entriesCount || 0,
        activitiesCompleted: activitiesCount || 0,
        testsTaken: testsCount || 0,
        currentStreak: streak,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statItems = [
    {
      label: t('profile.stats.memberFor'),
      value: `${stats.memberDays} ${t('profile.stats.days')}`,
      icon: Activity,
      color: 'text-primary',
    },
    {
      label: t('profile.stats.totalEntries'),
      value: stats.totalEntries,
      icon: ClipboardList,
      color: 'text-secondary',
    },
    {
      label: t('profile.stats.activitiesCompleted'),
      value: stats.activitiesCompleted,
      icon: Activity,
      color: 'text-accent',
    },
    {
      label: t('profile.stats.testsTaken'),
      value: stats.testsTaken,
      icon: BookOpen,
      color: 'text-warning',
    },
    {
      label: t('profile.stats.currentStreak'),
      value: `${stats.currentStreak} ${t('profile.stats.days')}`,
      icon: Flame,
      color: 'text-destructive',
    },
  ];

  return (
    <Card className="p-lg animate-fade-in-scale">
      <h2 className="text-xl font-semibold text-foreground mb-md">{t('profile.stats.title')}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
        {statItems.map((stat, index) => (
          <div 
            key={index} 
            className="text-center animate-scale-in medium-transition hover:scale-105 cursor-pointer"
            style={{ animationDelay: `calc(${index} * var(--animation-delay-xs))` }}
          >
            <div className="flex justify-center mb-sm">
              <div className="p-sm bg-muted rounded-lg medium-transition spring-smooth hover:scale-110">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
