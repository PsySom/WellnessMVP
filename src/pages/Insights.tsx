import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import OverviewCards from '@/components/insights/OverviewCards';
import MoodTrendsChart from '@/components/insights/MoodTrendsChart';
import MoodDistribution from '@/components/insights/MoodDistribution';
import TopEmotions from '@/components/insights/TopEmotions';
import EmotionBalance from '@/components/insights/EmotionBalance';
import StressAnxietyChart from '@/components/insights/StressAnxietyChart';
import EnergyPatterns from '@/components/insights/EnergyPatterns';
import SatisfactionCharts from '@/components/insights/SatisfactionCharts';
import ActivityCompletion from '@/components/insights/ActivityCompletion';
import ActivityBreakdown from '@/components/insights/ActivityBreakdown';
import PatternCards from '@/components/insights/PatternCards';
import RecommendationsCard from '@/components/insights/RecommendationsCard';
import { useTranslation } from 'react-i18next';

type Period = 'week' | 'month' | '3months' | 'year';

const Insights = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch tracker entries with emotions
      const { data: trackerEntries, error: trackerError } = await supabase
        .from('tracker_entries')
        .select(`
          *,
          tracker_emotions (*)
        `)
        .eq('user_id', user?.id)
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: true });

      if (trackerError) throw trackerError;

      // Fetch activities
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Fetch journal sessions
      const { data: journalSessions, error: journalError } = await supabase
        .from('journal_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: true });

      if (journalError) throw journalError;

      setData({
        trackerEntries: trackerEntries || [],
        activities: activities || [],
        journalSessions: journalSessions || [],
      });
    } catch (error) {
      console.error('Error fetching insights data:', error);
      toast.error(t('insights.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      period,
      exported_at: new Date().toISOString(),
      ...data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-${period}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('insights.toasts.exportSuccess'));
  };

  const getPeriodLabel = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`;
  };

  const hasData = data && (
    data.trackerEntries.length > 0 || 
    data.activities.length > 0 || 
    data.journalSessions.length > 0
  );

  return (
    <AppLayout>
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{t('insights.title')}</h1>
              <p className="text-muted-foreground text-sm md:text-base mt-1">{getPeriodLabel()}</p>
            </div>
            <Button onClick={handleExport} variant="outline" size="default" disabled={!hasData} className="self-start lg:self-auto">
              <Download className="h-4 w-4 mr-2" />
              {t('insights.export')}
            </Button>
          </div>

          {/* Period Selector */}
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="grid grid-cols-4 w-full max-w-md lg:max-w-lg">
              <TabsTrigger value="week" className="text-xs md:text-sm">{t('insights.period.week')}</TabsTrigger>
              <TabsTrigger value="month" className="text-xs md:text-sm">{t('insights.period.month')}</TabsTrigger>
              <TabsTrigger value="3months" className="text-xs md:text-sm">{t('insights.period.3months')}</TabsTrigger>
              <TabsTrigger value="year" className="text-xs md:text-sm">{t('insights.period.year')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 md:h-28 lg:h-32" />
              ))}
            </div>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 lg:h-80" />
            ))}
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground">{t('insights.noData')}</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {t('insights.keepTracking')}
            </p>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8">
            {/* Overview Cards */}
            <OverviewCards data={data} />

            {/* Mood Section */}
            <div className="space-y-4 lg:space-y-6">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('insights.mood')}</h2>
              <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2">
                  <MoodTrendsChart entries={data.trackerEntries} period={period} />
                </div>
                <div className="lg:col-span-1">
                  <MoodDistribution entries={data.trackerEntries} />
                </div>
              </div>
            </div>

            {/* Emotional Landscape */}
            {data.trackerEntries.some((e: any) => e.tracker_emotions?.length > 0) && (
              <div className="space-y-4 lg:space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('insights.emotionalLandscape')}</h2>
                <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                  <TopEmotions entries={data.trackerEntries} />
                  <EmotionBalance entries={data.trackerEntries} />
                </div>
              </div>
            )}

            {/* Stress & Anxiety */}
            {data.trackerEntries.some((e: any) => e.stress_level !== null || e.anxiety_level !== null) && (
              <div className="space-y-4 lg:space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('insights.stressAndAnxiety')}</h2>
                <StressAnxietyChart entries={data.trackerEntries} period={period} />
              </div>
            )}

            {/* Energy & Satisfaction */}
            <div className="space-y-4 lg:space-y-6">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('insights.energyAndSatisfaction')}</h2>
              <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                <EnergyPatterns entries={data.trackerEntries} period={period} />
                <SatisfactionCharts entries={data.trackerEntries} />
              </div>
            </div>

            {/* Activities */}
            {data.activities.length > 0 && (
              <div className="space-y-4 lg:space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">{t('insights.activities')}</h2>
                <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                  <ActivityCompletion activities={data.activities} period={period} />
                  <ActivityBreakdown activities={data.activities} />
                </div>
              </div>
            )}

            {/* Patterns & Recommendations */}
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
              <PatternCards data={data} />
              <RecommendationsCard data={data} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Insights;
