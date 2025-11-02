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
  positive: 'bg-accent',
  negative: 'bg-destructive',
  neutral: 'bg-muted',
  mixed: 'bg-warning'
};

export const ActivityItem = ({ activity, onUpdate }: ActivityItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isCompleted = activity.status === 'completed';

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
          className={`group relative bg-card border border-border rounded-lg p-3 transition-all hover:shadow-md ${
            isCompleted ? 'opacity-60' : ''
          }`}
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{emoji}</span>
                <h4 className={`font-medium text-sm ${isCompleted ? 'line-through' : ''}`}>
                  {activity.title}
                </h4>
                <div className={`w-2 h-2 rounded-full ${impactColor}`} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activity.start_time && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(`2000-01-01T${activity.start_time}`), 'HH:mm')}
                  </span>
                )}
                {activity.duration_minutes && (
                  <Badge variant="outline" className="text-xs">
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
