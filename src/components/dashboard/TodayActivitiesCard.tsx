import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeSlotSection } from '@/components/calendar/TimeSlotSection';
import { TIME_SLOTS, filterActivitiesBySlot } from '@/utils/timeSlots';
import { format } from 'date-fns';

interface TodayActivitiesCardProps {
  activities: any[];
  onUpdate: () => void;
}

interface TodayActivitiesCardProps {
  activities: any[];
  onUpdate: () => void;
}

const TodayActivitiesCard = ({ activities, onUpdate }: TodayActivitiesCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading] = useState(false);

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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/calendar')}
            className="gap-xs hover-scale"
          >
            <Plus className="h-3 w-3" />
            {t('dashboard.todayActivitiesCard.addActivity')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/calendar')}
            className="text-xs hover-scale"
          >
            {t('dashboard.todayActivitiesCard.viewAll')}
          </Button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            {t('dashboard.todayActivitiesCard.noActivities')}
          </p>
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
                  onUpdate={onUpdate}
                  date={format(new Date(), 'yyyy-MM-dd')}
                />
              );
            })}
            
            <TimeSlotSection
              title={t('calendar.sections.anytime')}
              emoji="📌"
              slot="anytime"
              activities={filterActivitiesBySlot(activities, 'anytime')}
              onUpdate={onUpdate}
              date={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          <div className="pt-xs border-t border-border">
            <span className="text-xs text-muted-foreground">
              {activities.filter(a => a.status === 'completed').length}/{activities.length} {t('dashboard.todayActivitiesCard.completed')}
            </span>
          </div>
        </>
      )}
    </Card>
  );
};

export default TodayActivitiesCard;
