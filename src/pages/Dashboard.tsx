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
import QuickStatsCard from '@/components/dashboard/QuickStatsCard';
import InsightsPreview from '@/components/dashboard/InsightsPreview';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

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
      <div className="space-y-6 md:space-y-8">
        <DashboardHeader />
        
        {/* Main Content Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Tracker and Activities */}
          <div className="lg:col-span-2 space-y-6">
            <QuickTrackerCard onEntrySaved={handleEntrySaved} />
            <TodayActivitiesCard />
            
            {/* Links to other pages */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/tracker-history')}
              >
                {t('dashboard.viewTrackerHistory')}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
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
          <div className="hidden lg:block space-y-6">
            <QuickStatsCard entriesCount={todayEntries.length} />
            <InsightsPreview />
          </div>
        </div>
        
        {/* Mobile/Tablet Stats */}
        <div className="lg:hidden">
          <QuickStatsCard entriesCount={todayEntries.length} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
