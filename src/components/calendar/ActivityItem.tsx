import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { ActivityDetailModal } from './ActivityDetailModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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
  restorative: 'bg-green-500',
  draining: 'bg-red-500',
  neutral: 'bg-orange-500',
  mixed: 'bg-blue-500'
};

export const ActivityItem = ({ activity, onUpdate }: ActivityItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isCompleted = activity.status === 'completed';

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('activityId', activity.id);
    e.dataTransfer.setData('startTime', activity.start_time || '');
    e.dataTransfer.setData('duration', activity.duration_minutes?.toString() || '60');
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
  };

  const emoji = CATEGORY_EMOJIS[activity.category] || '📌';
  const impactColor = IMPACT_COLORS[activity.impact_type] || 'bg-muted';

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          draggable={!isCompleted && !!activity.start_time}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`group relative bg-card border border-border rounded-lg p-3 md:p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer animate-fade-in ${
            isCompleted ? 'opacity-60' : ''
          } ${isDragging ? 'opacity-50' : ''} ${!isCompleted && activity.start_time ? 'cursor-move' : ''}`}
          onClick={() => setIsDetailOpen(true)}
        >
          <div className="flex items-start gap-3">
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                className="mt-1"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <span className="text-lg md:text-xl transition-transform duration-300 group-hover:scale-110">{emoji}</span>
                <h4 className={`font-medium text-sm md:text-base transition-colors duration-300 ${isCompleted ? 'line-through' : ''}`}>
                  {activity.title}
                </h4>
                <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${impactColor} transition-all duration-300 group-hover:scale-125`} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activity.start_time && (
                  <span className="text-xs md:text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                    {format(new Date(`2000-01-01T${activity.start_time}`), 'HH:mm')}
                  </span>
                )}
                {activity.duration_minutes && (
                  <Badge variant="outline" className="text-xs md:text-sm transition-all duration-300 group-hover:border-primary">
                    {activity.duration_minutes}m
                  </Badge>
                )}
              </div>

              {activity.description && (
                <CollapsibleContent>
                  <p className="text-xs text-muted-foreground mt-2">
                    {activity.description}
                  </p>
                </CollapsibleContent>
              )}
            </div>

            {activity.description && (
              <CollapsibleTrigger onClick={(e) => e.stopPropagation()}>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>
            )}
          </div>
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
