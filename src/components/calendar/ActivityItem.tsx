import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { format, parseISO, isAfter } from 'date-fns';
import { ActivityDetailModal } from './ActivityDetailModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Play, Repeat } from 'lucide-react';
import { triggerActivityUpdate } from '@/utils/activitySync';

interface ActivityItemProps {
  activity: any;
  onUpdate: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  exercise: '🏃',
  health: '💊',
  social: '👥',
  hobby: '🎨',
  work: '💼',
  practice: '📚',
  reflection: '💆',
  sleep: '😴',
  nutrition: '🍎',
  leisure: '🎮',
  hydration: '💧'
};

const IMPACT_COLORS: Record<string, string> = {
  restoring: 'bg-green-500',
  depleting: 'bg-red-500',
  neutral: 'bg-orange-500',
  mixed: 'bg-blue-500'
};

export const ActivityItem = ({ activity, onUpdate }: ActivityItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recurrenceInfo, setRecurrenceInfo] = useState<{ total: number; remaining: number } | null>(null);
  const isCompleted = activity.status === 'completed';

  // Get recurrence info
  const repetitionConfig = activity?.repetition_config || {};
  const recurrenceGroupId = repetitionConfig.recurrence_group_id;
  const isRecurring = recurrenceGroupId && repetitionConfig.recurrence_type !== 'none';

  useEffect(() => {
    const fetchRecurrenceInfo = async () => {
      if (!isRecurring || !recurrenceGroupId) return;

      const { data: allActivities, error } = await supabase
        .from('activities')
        .select('id, date, repetition_config')
        .eq('user_id', activity.user_id);

      if (error || !allActivities) return;

      // Filter activities with the same recurrence_group_id
      const groupActivities = allActivities.filter((a: any) => {
        const config = a.repetition_config as any;
        return config?.recurrence_group_id === recurrenceGroupId;
      });

      const total = groupActivities.length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Count remaining (current date and future)
      const remaining = groupActivities.filter((a: any) => {
        const actDate = parseISO(a.date);
        return isAfter(actDate, today) || actDate.toDateString() === today.toDateString();
      }).length;

      setRecurrenceInfo({ total, remaining });
    };

    fetchRecurrenceInfo();
  }, [isRecurring, recurrenceGroupId, activity.user_id]);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('activityId', activity.id);
    e.dataTransfer.setData('startTime', activity.start_time || '');
    e.dataTransfer.setData('duration', activity.duration_minutes?.toString() || '60');
    
    // Создаем ghost image для drag
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleToggleComplete = async () => {
    const newStatus = isCompleted ? 'planned' : 'completed';
    
    const { error } = await supabase
      .from('activities')
      .update({ status: newStatus })
      .eq('id', activity.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update activity',
        variant: 'destructive'
      });
      return;
    }

    if (newStatus === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }

    onUpdate();
    triggerActivityUpdate();
  };

  // Use emoji from activity if available, fallback to category emoji
  const emoji = activity.emoji || CATEGORY_EMOJIS[activity.category] || '📌';
  const impactColor = IMPACT_COLORS[activity.impact_type] || 'bg-muted';

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`group relative bg-card/80 backdrop-blur-sm border-2 rounded-xl p-4 md:p-5 transition-all duration-300 ease-out cursor-grab active:cursor-grabbing animate-fade-in touch-manipulation ${
            isCompleted 
              ? 'opacity-50 border-muted-foreground/20 bg-muted/20' 
              : 'border-border hover:border-primary/50 hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1'
          } ${isDragging ? 'opacity-30 scale-95 rotate-3 shadow-2xl ring-4 ring-primary/30' : ''}`}
          onClick={() => setIsDetailOpen(true)}
        >
          {/* Status indicator line */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300 ${
            isCompleted ? 'bg-green-500' : 'bg-primary group-hover:w-1.5'
          }`} />
          
          <div className="flex items-start gap-3 md:gap-4">
            <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
              <Checkbox
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                className="h-5 w-5 md:h-6 md:w-6 transition-all duration-200 hover:scale-110"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl md:text-3xl transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">{emoji}</span>
                <h4 className={`font-semibold text-base md:text-lg transition-all duration-300 ${
                  isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {activity.title}
                </h4>
              </div>

              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                {activity.start_time && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 transition-all duration-300 group-hover:bg-primary/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      {format(new Date(`2000-01-01T${activity.start_time}`), 'HH:mm')}
                    </span>
                  </div>
                )}
              {activity.duration_minutes && (
                  <Badge variant="secondary" className="text-sm font-medium px-2.5 py-1 transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
                    {activity.duration_minutes} {t('calendar.form.minutesShort')}
                  </Badge>
                )}
                <div className={`w-3 h-3 rounded-full ${impactColor} shadow-lg transition-all duration-300 group-hover:scale-150 group-hover:shadow-xl`} 
                     title={activity.impact_type} />
                {isRecurring && recurrenceInfo && (
                  <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    {recurrenceInfo.remaining}/{recurrenceInfo.total}
                  </Badge>
                )}
              </div>

              {activity.description && (
                <CollapsibleContent>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-l-2 border-muted pl-3">
                    {activity.description}
                  </p>
                </CollapsibleContent>
              )}

              {(activity.exercise_id && activity.exercises?.slug) ? (
                <Button
                  size="sm"
                  className="mt-3 hover-scale"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/exercises/${activity.exercises.slug}/session`);
                  }}
                >
                  <Play className="h-4 w-4 mr-1.5" />
                  {t('exercises.start')}
                </Button>
              ) : (activity.test_id && activity.tests?.slug) ? (
                <Button
                  size="sm"
                  className="mt-3 hover-scale"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tests/${activity.tests.slug}/take`);
                  }}
                >
                  <Play className="h-4 w-4 mr-1.5" />
                  {t('exercises.start')}
                </Button>
              ) : null}
            </div>

            {activity.description && (
              <CollapsibleTrigger onClick={(e) => e.stopPropagation()} asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-muted transition-colors">
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-all duration-300 ${
                      isOpen ? 'rotate-180 text-foreground' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
          
          {/* Subtle animation on hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      </Collapsible>

      <ActivityDetailModal
        activity={activity}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={onUpdate}
      />
    </>
  );
};
