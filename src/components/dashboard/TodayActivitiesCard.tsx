import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeSlotSection } from '@/components/calendar/TimeSlotSection';
import { TIME_SLOTS, filterActivitiesBySlot } from '@/utils/timeSlots';
import { format } from 'date-fns';

interface Activity {
  id: string;
  title: string;
  start_time: string | null;
  status: string;
  impact_type: string;
  exercise_id: string | null;
  test_id: string | null;
  exercises?: {
    slug: string;
  };
  tests?: {
    slug: string;
  };
}

const TodayActivitiesCard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error(t('dashboard.todayActivitiesCard.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('activities-changes')
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

  const today = format(new Date(), 'EEEE, d MMMM');

  if (loading) {
    return (
      <Card className="p-md space-y-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-xs">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-md space-y-sm hover-scale animate-fade-in">
      <div className="flex items-center justify-between mb-xs">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-xs">
            📅 {t('dashboard.todayActivitiesCard.title')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/calendar')}
          className="text-xs hover-scale"
        >
          {t('dashboard.todayActivitiesCard.viewAll')}
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 space-y-sm">
          <p className="text-muted-foreground text-sm">
            {t('dashboard.todayActivitiesCard.noActivities')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/calendar')}
            className="gap-xs hover-scale"
          >
            <Plus className="h-4 w-4" />
            {t('dashboard.todayActivitiesCard.addActivity')}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-xs max-h-[500px] overflow-y-auto pr-1">
            {TIME_SLOTS.map((slot) => {
              const slotActivities = filterActivitiesBySlot(activities, slot.key);
              return (
                <TimeSlotSection
                  key={slot.key}
                  title={t(`calendar.sections.${slot.key}`)}
                  timeRange={t(`calendar.timeRanges.${slot.key}`)}
                  emoji={slot.emoji}
                  slot={slot.key}
                  activities={slotActivities}
                  onUpdate={fetchTodayActivities}
                />
              );
            })}
            
            <TimeSlotSection
              title={t('calendar.sections.anytime')}
              emoji="📌"
              slot="anytime"
              activities={filterActivitiesBySlot(activities, 'anytime')}
              onUpdate={fetchTodayActivities}
            />
          </div>

          <div className="pt-xs border-t border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {activities.filter(a => a.status === 'completed').length}/{activities.length} {t('dashboard.todayActivitiesCard.completed')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/calendar')}
              className="gap-xs hover-scale text-xs"
            >
              <Plus className="h-3 w-3" />
              {t('dashboard.todayActivitiesCard.addActivity')}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default TodayActivitiesCard;
