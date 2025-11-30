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

  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-bold text-foreground tracking-tight">{title}</h3>
            {timeRange && (
              <span className="text-xs md:text-sm text-muted-foreground font-medium">
                {timeRange}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm md:text-base font-bold text-foreground">
              {completedCount}<span className="text-muted-foreground">/{totalCount}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(completionPercentage)}%
            </div>
          </div>
          
          {/* Mini progress circle */}
          <div className="relative w-10 h-10 md:w-12 md:h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-muted"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-primary transition-all duration-500"
                strokeWidth="2.5"
                strokeDasharray={`${completionPercentage} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {completedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 px-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {sortedActivities.map((activity, index) => (
          <div
            key={activity.id}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`transition-all duration-300 ${
              dragOverIndex === index 
                ? 'border-t-4 border-primary pt-4 -mt-2 scale-[1.02]' 
                : ''
            }`}
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
