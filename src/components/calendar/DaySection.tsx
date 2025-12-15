import React, { useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DaySectionProps {
  title: string;
  timeRange?: string;
  activities: any[];
  onUpdate: () => void;
  date?: string; // ISO date string (YYYY-MM-DD)
}

export const DaySection = ({ title, timeRange, activities, onUpdate, date }: DaySectionProps) => {
  const { t } = useTranslation();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragConfirmDialog, setDragConfirmDialog] = useState<{
    open: boolean;
    activityId: string;
    newTime: string;
    hasGroup: boolean;
    recurrenceGroupId: string | null;
    userPresetId: string | null;
  } | null>(null);
  const [dragMode, setDragMode] = useState<'single' | 'all'>('single');
  
  // Sort activities by start_time
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
    if (!targetActivity.start_time) return '09:00';
    
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
      
      let newTime: string;
      if (sortedActivities.length === 0) {
        // Пустой день - используем 9:00
        newTime = '09:00';
      } else if (targetIndex === undefined) {
        // Перетащили в конец списка - добавляем после последней активности
        const lastActivity = sortedActivities[sortedActivities.length - 1];
        newTime = calculateNewTime(lastActivity, 'after');
      } else {
        // Перетащили между активностями - вставляем перед целевой
        const targetActivity = sortedActivities[targetIndex];
        newTime = calculateNewTime(targetActivity, 'before');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activityDate = date || new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('activities').insert({
        user_id: user.id,
        title: templateData.name,
        category: templateData.category,
        impact_type: templateData.impact_type,
        duration_minutes: templateData.duration_minutes,
        status: 'planned' as const,
        emoji: templateData.emoji || '📌',
        date: activityDate,
        start_time: newTime,
      });

      if (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать активность',
          variant: 'destructive'
        });
        return;
      }

      onUpdate();
      return;
    }
    
    // Если перетаскиваем существующую активность
    if (!activityId) return;

    // Find the activity data to check if it's recurring
    const activityData = e.dataTransfer.getData('activityData');
    let parsedActivity: any = null;
    try {
      parsedActivity = activityData ? JSON.parse(activityData) : null;
    } catch {}

    let newTime: string;
    
    if (sortedActivities.length === 0) {
      newTime = '09:00';
    } else if (targetIndex === undefined) {
      const lastActivity = sortedActivities[sortedActivities.length - 1];
      newTime = calculateNewTime(lastActivity, 'after');
    } else {
      const targetActivity = sortedActivities[targetIndex];
      if (activityId === targetActivity.id) return;
      newTime = calculateNewTime(targetActivity, 'before');
    }

    // Check if activity is part of a group
    const config = parsedActivity?.repetition_config || {};
    const recurrenceGroupId = config.recurrence_group_id;
    const userPresetId = parsedActivity?.user_preset_id;
    const hasGroup = Boolean(recurrenceGroupId) || Boolean(userPresetId);

    if (hasGroup) {
      setDragConfirmDialog({
        open: true,
        activityId,
        newTime,
        hasGroup,
        recurrenceGroupId,
        userPresetId
      });
      return;
    }

    // Simple update for non-recurring
    const { error } = await supabase
      .from('activities')
      .update({ start_time: newTime })
      .eq('id', activityId);

    if (error) {
      toast({
        title: t('common.error'),
        description: t('calendar.form.saveError'),
        variant: 'destructive'
      });
      return;
    }

    onUpdate();
  };

  const handleDragConfirm = async () => {
    if (!dragConfirmDialog) return;
    
    const { activityId, newTime, recurrenceGroupId, userPresetId } = dragConfirmDialog;
    
    if (dragMode === 'all') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allActivities } = await supabase
        .from('activities')
        .select('id, repetition_config, user_preset_id')
        .eq('user_id', user.id);

      const activityIds = allActivities
        ?.filter((a: any) => {
          if (recurrenceGroupId) {
            const config = a.repetition_config as any;
            return config?.recurrence_group_id === recurrenceGroupId;
          }
          if (userPresetId) {
            return a.user_preset_id === userPresetId;
          }
          return false;
        })
        .map((a: any) => a.id) || [];

      await supabase.from('activities').update({ start_time: newTime }).in('id', activityIds);
    } else {
      await supabase.from('activities').update({ start_time: newTime }).eq('id', activityId);
    }
    
    setDragConfirmDialog(null);
    onUpdate();
  };

  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const minHeight = isEmpty ? 'min-h-[60px]' : 'min-h-0';

  return (
    <>
    <AlertDialog open={!!dragConfirmDialog?.open} onOpenChange={(open) => !open && setDragConfirmDialog(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('calendar.detail.editRecurringTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('calendar.detail.editRecurringDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <RadioGroup value={dragMode} onValueChange={(v) => setDragMode(v as 'single' | 'all')} className="my-4 space-y-3">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="single" id="drag-single" />
            <Label htmlFor="drag-single" className="cursor-pointer font-normal">{t('calendar.detail.editSingle')}</Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="all" id="drag-all" />
            <Label htmlFor="drag-all" className="cursor-pointer font-normal">{t('calendar.detail.editAllRecurrences')}</Label>
          </div>
        </RadioGroup>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('calendar.form.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDragConfirm}>{t('calendar.form.save')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <div className={`mb-8 animate-fade-in ${minHeight}`}>
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
        
        {totalCount > 0 && (
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
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-4 px-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
        className={`space-y-3 md:space-y-4 rounded-xl transition-all duration-300 ease-out ${
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
          ))
        )}
      </div>
    </div>
    </>
  );
};
