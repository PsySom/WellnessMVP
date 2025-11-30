import React, { useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TimeSlot, getDefaultTimeForSlot } from '@/utils/timeSlots';
import { triggerActivityUpdate } from '@/utils/activitySync';

interface TimeSlotSectionProps {
  title: string;
  timeRange?: string;
  emoji: string;
  slot: TimeSlot;
  activities: any[];
  onUpdate: () => void;
  date?: string; // ISO date string (YYYY-MM-DD)
}

export const TimeSlotSection = ({ title, timeRange, emoji, slot, activities, onUpdate, date }: TimeSlotSectionProps) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const sortedActivities = [...activities].sort((a, b) => {
    if (!a.start_time && !b.start_time) return 0;
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return a.start_time.localeCompare(b.start_time);
  });

  const completedCount = sortedActivities.filter(a => a.status === 'completed').length;
  const totalCount = sortedActivities.length;
  const isEmpty = sortedActivities.length === 0;

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
      setDragOverIndex(null);
    }
  };

  const calculateNewTime = (targetActivity: any, position: 'before' | 'after' = 'before') => {
    if (!targetActivity.start_time) {
      return getDefaultTimeForSlot(slot);
    }
    
    const [hours, minutes] = targetActivity.start_time.split(':').map(Number);
    const targetMinutes = hours * 60 + minutes;
    const duration = parseInt(targetActivity.duration_minutes) || 60;
    
    let newMinutes;
    if (position === 'before') {
      newMinutes = Math.max(0, targetMinutes - duration);
    } else {
      newMinutes = targetMinutes + duration;
    }
    
    const newHours = Math.floor(newMinutes / 60) % 24;
    const newMins = newMinutes % 60;
    
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  const handleDrop = async (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    setIsDragOver(false);

    const activityId = e.dataTransfer.getData('activityId');
    const templateId = e.dataTransfer.getData('templateId');
    
    // Если перетаскиваем шаблон - создаем новую активность
    if (templateId) {
      const templateData = JSON.parse(e.dataTransfer.getData('templateData'));
      
      let newTime: string | null;
      if (sortedActivities.length === 0 || targetIndex === undefined) {
        newTime = getDefaultTimeForSlot(slot);
      } else {
        const targetActivity = sortedActivities[targetIndex];
        newTime = calculateNewTime(targetActivity, 'before');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activityDate = date || new Date().toISOString().split('T')[0];
      
      const repetitionConfig = templateData.repetition_config || { frequency: 'daily', count: 1 };
      const count = repetitionConfig.count;

      const baseActivity = {
        user_id: user.id,
        title: templateData.name,
        category: templateData.category,
        impact_type: templateData.impact_type,
        duration_minutes: templateData.duration_minutes,
        status: 'planned' as const,
        emoji: templateData.emoji || '📌',
        repetition_config: repetitionConfig
      };

      const activitiesToCreate = [];

      if (repetitionConfig.frequency === 'daily' && count > 1) {
        const timeSlots = ['morning', 'afternoon', 'evening'];
        for (let i = 0; i < count; i++) {
          const slotIndex = i % timeSlots.length;
          const slotTime = getDefaultTimeForSlot(timeSlots[slotIndex] as TimeSlot);
          activitiesToCreate.push({
            ...baseActivity,
            date: activityDate,
            start_time: slotTime,
          });
        }
      } else if (repetitionConfig.frequency === 'weekly' && count > 1) {
        const daysToSpread = Math.floor(7 / count);
        for (let i = 0; i < count; i++) {
          const newDate = new Date(activityDate);
          newDate.setDate(newDate.getDate() + (i * daysToSpread));
          activitiesToCreate.push({
            ...baseActivity,
            date: newDate.toISOString().split('T')[0],
            start_time: newTime,
          });
        }
      } else if (repetitionConfig.frequency === 'monthly' && count > 1) {
        const weeksToSpread = Math.floor(4 / count);
        for (let i = 0; i < count; i++) {
          const newDate = new Date(activityDate);
          newDate.setDate(newDate.getDate() + (i * weeksToSpread * 7));
          activitiesToCreate.push({
            ...baseActivity,
            date: newDate.toISOString().split('T')[0],
            start_time: newTime,
          });
        }
      } else {
        activitiesToCreate.push({
          ...baseActivity,
          date: activityDate,
          start_time: newTime,
        });
      }

      const { error } = await supabase.from('activities').insert(activitiesToCreate);

      if (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать активность',
          variant: 'destructive'
        });
        return;
      }

      onUpdate();
      triggerActivityUpdate();
      return;
    }
    
    // Если перетаскиваем существующую активность
    if (!activityId) return;

    let newTime: string | null;
    
    if (sortedActivities.length === 0 || targetIndex === undefined) {
      newTime = getDefaultTimeForSlot(slot);
    } else {
      const targetActivity = sortedActivities[targetIndex];
      if (activityId === targetActivity.id) return;
      newTime = calculateNewTime(targetActivity, 'before');
    }

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
    triggerActivityUpdate();
  };

  const minHeight = isEmpty ? 'min-h-[60px]' : 'min-h-0';

  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`mb-6 md:mb-8 transition-all duration-300 animate-fade-in ${minHeight}`}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className="text-xl md:text-2xl transition-transform hover:scale-125 duration-300">{emoji}</span>
          <div className="flex flex-col">
            <h3 className="text-sm md:text-base font-bold text-foreground">{title}</h3>
            {timeRange && (
              <span className="text-xs text-muted-foreground font-medium">{timeRange}</span>
            )}
          </div>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-bold">
                {completedCount}<span className="text-muted-foreground">/{totalCount}</span>
              </div>
            </div>
            {/* Mini progress indicator */}
            <div className="w-8 h-8 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="2"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  className="stroke-primary transition-all duration-500"
                  strokeWidth="2"
                  strokeDasharray={`${completionPercentage} 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <div className="mb-3 px-1">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
        className={`space-y-3 rounded-xl transition-all duration-300 ease-out ${
          isEmpty ? 'border-3 border-dashed border-border/60 p-4 min-h-[80px] flex items-center justify-center' : ''
        } ${isDragOver && isEmpty ? 'border-primary bg-primary/5 scale-[1.03] shadow-lg ring-2 ring-primary/20' : ''}`}
      >
        {isEmpty ? (
          <div className="text-center">
            {isDragOver ? (
              <div className="flex flex-col items-center gap-2 animate-bounce">
                <div className="text-3xl">↓</div>
                <p className="text-sm font-medium text-primary">Переместите сюда</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Пусто</p>
            )}
          </div>
        ) : (
          sortedActivities.map((activity, index) => (
            <div
              key={activity.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`transition-all duration-300 ease-out ${
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
          ))
        )}
      </div>
    </div>
  );
};
