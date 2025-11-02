import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MoodGraph from '@/components/tracker-history/MoodGraph';
import EmotionsDistribution from '@/components/tracker-history/EmotionsDistribution';
import StressAnxietyGraph from '@/components/tracker-history/StressAnxietyGraph';
import EnergyGraph from '@/components/tracker-history/EnergyGraph';
import SatisfactionMetrics from '@/components/tracker-history/SatisfactionMetrics';
import EntriesList from '@/components/tracker-history/EntriesList';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export type Period = 'day' | 'week' | 'month';

export interface TrackerEntry {
  id: string;
  entry_date: string;
  entry_time: string;
  mood_score: number | null;
  stress_level: number | null;
  anxiety_level: number | null;
  energy_level: number | null;
  process_satisfaction: number | null;
  result_satisfaction: number | null;
  created_at: string;
  emotions?: Array<{
    emotion_label: string;
    intensity: number;
    category: string;
  }>;
}

const TrackerHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>('week');
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, period]);

  const fetchEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      const { data: entriesData, error: entriesError } = await supabase
        .from('tracker_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: true })
        .order('entry_time', { ascending: true });

      if (entriesError) throw entriesError;

      // Fetch emotions for each entry
      if (entriesData && entriesData.length > 0) {
        const entryIds = entriesData.map((e) => e.id);
        const { data: emotionsData, error: emotionsError } = await supabase
          .from('tracker_emotions')
          .select('*')
          .in('tracker_entry_id', entryIds);

        if (emotionsError) throw emotionsError;

        // Merge emotions with entries
        const entriesWithEmotions = entriesData.map((entry) => ({
          ...entry,
          emotions: emotionsData?.filter((e) => e.tracker_entry_id === entry.id) || [],
        }));

        setEntries(entriesWithEmotions);
      } else {
        setEntries([]);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading history',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-history-${period}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Your data has been downloaded.',
    });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="pl-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Mood History</h1>
            <p className="text-muted-foreground">Track your mental wellness journey</p>
          </div>

          {/* Period Selector */}
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">📊</div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No entries yet</h3>
                <p className="text-muted-foreground">Start tracking your mood to see insights</p>
              </div>
              <Button onClick={() => navigate('/dashboard')}>Start Tracking</Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Mood Graph */}
            <MoodGraph entries={entries} period={period} />

            {/* Emotions Distribution */}
            <EmotionsDistribution entries={entries} />

            {/* Stress & Anxiety */}
            <StressAnxietyGraph entries={entries} period={period} />

            {/* Energy */}
            <EnergyGraph entries={entries} period={period} />

            {/* Satisfaction */}
            <SatisfactionMetrics entries={entries} />

            {/* Entries List */}
            <EntriesList entries={entries} onEntryDeleted={fetchEntries} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default TrackerHistory;
