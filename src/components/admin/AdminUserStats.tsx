import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Activity, BookOpen, Brain, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface Stats {
  totalUsers: number;
  totalActivities: number;
  totalJournalSessions: number;
  totalTestResults: number;
  totalExerciseSessions: number;
}

export const AdminUserStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalActivities },
        { count: totalJournalSessions },
        { count: totalTestResults },
        { count: totalExerciseSessions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('journal_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('test_results').select('*', { count: 'exact', head: true }),
        supabase.from('exercise_sessions').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalActivities: totalActivities || 0,
        totalJournalSessions: totalJournalSessions || 0,
        totalTestResults: totalTestResults || 0,
        totalExerciseSessions: totalExerciseSessions || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: t('admin.stats.totalUsers'), value: stats?.totalUsers || 0, color: 'text-blue-500' },
    { icon: Activity, label: t('admin.stats.totalActivities'), value: stats?.totalActivities || 0, color: 'text-green-500' },
    { icon: BookOpen, label: t('admin.stats.journalSessions'), value: stats?.totalJournalSessions || 0, color: 'text-purple-500' },
    { icon: Brain, label: t('admin.stats.testResults'), value: stats?.totalTestResults || 0, color: 'text-orange-500' },
    { icon: Dumbbell, label: t('admin.stats.exerciseSessions'), value: stats?.totalExerciseSessions || 0, color: 'text-pink-500' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
