import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
        .select('id, title, start_time, status, impact_type, exercise_id, test_id, exercises(slug), tests(slug)')
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

  const toggleComplete = async (activityId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'planned' : 'completed';
      
      const { error } = await supabase
        .from('activities')
        .update({ status: newStatus })
        .eq('id', activityId);

      if (error) throw error;
      
      await fetchTodayActivities();
      toast.success(
        newStatus === 'completed' 
          ? t('dashboard.todayActivitiesCard.marked') 
          : t('dashboard.todayActivitiesCard.unmarked')
      );
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error(t('dashboard.todayActivitiesCard.errorUpdating'));
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'restorative':
        return 'bg-green-500';
      case 'draining':
        return 'bg-red-500';
      case 'neutral':
        return 'bg-orange-500';
      case 'mixed':
        return 'bg-blue-500';
      default:
        return 'bg-orange-500';
    }
  };

  if (loading) {
    return (
      <Card className="p-lg space-y-md">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-sm">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-lg space-y-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{t('dashboard.todayActivitiesCard.title')}</h3>
        <Button size="sm" variant="ghost" onClick={() => navigate('/calendar')}>
          <Plus className="h-4 w-4 mr-1" />
          {t('dashboard.todayActivitiesCard.add')}
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-xl">
          <p className="text-muted-foreground">{t('dashboard.todayActivitiesCard.noActivities')}</p>
          <Button variant="outline" className="mt-md" onClick={() => navigate('/calendar')}>
            {t('dashboard.todayActivitiesCard.planYourDay')}
          </Button>
        </div>
      ) : (
        <div className="space-y-sm">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center gap-sm p-sm rounded-lg bg-muted/50 hover:bg-muted medium-transition ease-out-expo hover:scale-[1.01] animate-slide-in-right"
              style={{ animationDelay: `calc(${index} * var(--animation-delay-xs))` }}
            >
              <Checkbox 
                checked={activity.status === 'completed'} 
                onCheckedChange={() => toggleComplete(activity.id, activity.status)}
              />
              <div
                className={`h-2 w-2 rounded-full ${getImpactColor(activity.impact_type)}`}
              />
              <div className="flex-1">
                <p className={`font-medium ${activity.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.start_time ? activity.start_time.slice(0, 5) : t('dashboard.todayActivitiesCard.noTime')}
                </p>
              </div>
              {(activity.exercise_id && activity.exercises?.slug) ? (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/exercises/${activity.exercises.slug}/session`);
                  }}
                  className="shrink-0"
                >
                  {t('exercises.start')}
                </Button>
              ) : (activity.test_id && activity.tests?.slug) ? (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tests/${activity.tests.slug}/take`);
                  }}
                  className="shrink-0"
                >
                  {t('exercises.start')}
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Button
        variant="link"
        className="w-full"
        onClick={() => navigate('/calendar')}
      >
        {t('dashboard.todayActivitiesCard.viewAll')}
      </Button>
    </Card>
  );
};

export default TodayActivitiesCard;
