import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickTrackerCard from '@/components/dashboard/QuickTrackerCard';
import TodayActivitiesCard from '@/components/dashboard/TodayActivitiesCard';
import QuickStatsCard from '@/components/dashboard/QuickStatsCard';
import InsightsPreview from '@/components/dashboard/InsightsPreview';
import { Skeleton } from '@/components/ui/skeleton';

export interface TrackerData {
  moodScore: number;
  selectedEmotions: Array<{ label: string; intensity: number; category: string }>;
  stressLevel: number;
  anxietyLevel: number;
  energyLevel: number;
  processSatisfaction: number;
  resultSatisfaction: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayEntries, setTodayEntries] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTodayEntries();
    }
  }, [user]);

  const fetchTodayEntries = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tracker_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .order('entry_time', { ascending: false });

      if (error) throw error;
      setTodayEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrySaved = () => {
    fetchTodayEntries();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <DashboardHeader />
        
        <QuickTrackerCard onEntrySaved={handleEntrySaved} />
        
        <TodayActivitiesCard />
        
        <QuickStatsCard entriesCount={todayEntries.length} />
        
        <InsightsPreview />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
