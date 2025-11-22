import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Library } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import QuickTrackerCard from '@/components/dashboard/QuickTrackerCard';
import TodayActivitiesCard from '@/components/dashboard/TodayActivitiesCard';
import ActivityImpactCards from '@/components/dashboard/ActivityImpactCards';
import InsightsPreview from '@/components/dashboard/InsightsPreview';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefresh } from '@/components/common/PullToRefresh';

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTodayActivities();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchTodayActivities = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('activities')
        .select('*, exercises(slug), tests(slug)')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTodayActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('dashboard-activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchTodayActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleEntrySaved = () => {
    fetchTodayActivities();
  };

  const handleRefresh = async () => {
    await fetchTodayActivities();
  };

  const { containerRef, pullDistance, isRefreshing, shouldShowIndicator } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div ref={containerRef} className="space-y-lg md:space-y-xl relative overflow-auto">
        {shouldShowIndicator && (
          <PullToRefresh 
            pullDistance={pullDistance} 
            isRefreshing={isRefreshing} 
          />
        )}
        
        <DashboardHeader />
        
        {/* Main Content Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg md:gap-xl">
          {/* Left Column - Activities and Tracker */}
          <div className="lg:col-span-2 space-y-lg">
            <TodayActivitiesCard activities={todayActivities} onUpdate={fetchTodayActivities} />
            <QuickTrackerCard onEntrySaved={handleEntrySaved} />
            
            {/* Links to other pages */}
            <div className="flex gap-sm">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/tracker-history')}
              >
                {t('dashboard.viewTrackerHistory')}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-sm"
                onClick={() => navigate('/activity-templates')}
              >
                <Library className="h-4 w-4" />
                {t('dashboard.activityTemplates')}
              </Button>
            </div>
            
            <div className="lg:hidden">
              <InsightsPreview />
            </div>
          </div>
          
          {/* Right Column - Stats and Insights (Desktop only) */}
          <div className="hidden lg:block space-y-lg">
            <ActivityImpactCards activities={todayActivities} />
            <InsightsPreview />
          </div>
        </div>
        
        {/* Mobile/Tablet Stats */}
        <div className="lg:hidden">
          <ActivityImpactCards activities={todayActivities} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
