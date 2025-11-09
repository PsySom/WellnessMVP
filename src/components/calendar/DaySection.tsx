import React, { useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DaySectionProps {
  title: string;
  timeRange?: string;
  activities: any[];
  onUpdate: () => void;
}

export const DaySection = ({ title, timeRange, activities, onUpdate }: DaySectionProps) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  if (activities.length === 0) return null;

  // Sort activities by start_time
  const sortedActivities = [...activities].sort((a, b) => {
    if (!a.start_time && !b.start_time) return 0;
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return a.start_time.localeCompare(b.start_time);
  });

  const completedCount = sortedActivities.filter(a => a.status === 'completed').length;
  const totalCount = sortedActivities.length;

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const calculateNewTime = (targetActivity: any) => {
    if (!targetActivity.start_time) return '09:00';
    
    const [hours, minutes] = targetActivity.start_time.split(':').map(Number);
    const targetMinutes = hours * 60 + minutes;
    const duration = parseInt(targetActivity.duration_minutes) || 60;
    const newMinutes = Math.max(0, targetMinutes - duration);
    
    const newHours = Math.floor(newMinutes / 60) % 24;
    const newMins = newMinutes % 60;
    
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const activityId = e.dataTransfer.getData('activityId');
    const targetActivity = sortedActivities[targetIndex];
    
    if (!activityId || !targetActivity || activityId === targetActivity.id) return;

    const newTime = calculateNewTime(targetActivity);

    const { error } = await supabase
      .from('activities')
      .update({ start_time: newTime })
      .eq('id', activityId);

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить время активности',
        variant: 'destructive'
      });
      return;
    }

    onUpdate();
  };

  return (
    <div className="mb-lg">
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-sm">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {timeRange && (
            <span className="text-xs text-muted-foreground">({timeRange})</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="space-y-sm">
        {sortedActivities.map((activity, index) => (
          <div
            key={activity.id}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`transition-all ${dragOverIndex === index ? 'border-t-2 border-primary pt-2' : ''}`}
          >
            <ActivityItem
              activity={activity}
              onUpdate={onUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
