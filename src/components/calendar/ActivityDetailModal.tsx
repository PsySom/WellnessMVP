import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActivityFormModal } from './ActivityFormModal';
import { triggerActivityUpdate } from '@/utils/activitySync';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ActivityDetailModalProps {
  activity: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  mixed: 'bg-blue-500',
  neutral: 'bg-orange-500'
};

export const ActivityDetailModal = ({ activity, open, onOpenChange, onUpdate }: ActivityDetailModalProps) => {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'all'>('single');

  // Check if activity is part of a recurrence group
  const repetitionConfig = activity?.repetition_config || {};
  const recurrenceGroupId = repetitionConfig.recurrence_group_id;
  const isRecurring = recurrenceGroupId && repetitionConfig.recurrence_type !== 'none';

  const handleDelete = async () => {
    if (deleteMode === 'all' && recurrenceGroupId) {
      // Delete all activities in the recurrence group
      const { data: allActivities, error: fetchError } = await supabase
        .from('activities')
        .select('id, repetition_config')
        .eq('user_id', activity.user_id);

      if (fetchError) {
        toast({
          title: t('common.error'),
          description: t('calendar.detail.deleteError'),
          variant: 'destructive'
        });
        return;
      }

      // Filter activities with the same recurrence_group_id
      const activityIds = allActivities
        ?.filter((a: any) => {
          const config = a.repetition_config as any;
          return config?.recurrence_group_id === recurrenceGroupId;
        })
        .map((a: any) => a.id) || [];

      if (activityIds.length > 0) {
        const { error } = await supabase
          .from('activities')
          .delete()
          .in('id', activityIds);

        if (error) {
          toast({
            title: t('common.error'),
            description: t('calendar.detail.deleteError'),
            variant: 'destructive'
          });
        } else {
          toast({
            title: t('common.success'),
            description: t('calendar.detail.deleteAllSuccess', { count: activityIds.length })
          });
          onOpenChange(false);
          onUpdate();
          triggerActivityUpdate();
        }
      }
    } else {
      // Delete single activity
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activity.id);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('calendar.detail.deleteError'),
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('common.success'),
          description: t('calendar.detail.deleteSuccess')
        });
        onOpenChange(false);
        onUpdate();
        triggerActivityUpdate();
      }
    }
  };

  // Use emoji from activity if available, fallback to category emoji
  const emoji = activity.emoji || CATEGORY_EMOJIS[activity.category] || '📌';
  const impactColor = IMPACT_COLORS[activity.impact_type] || 'bg-muted';

  return (
    <>
      <Dialog open={open && !isEditOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md md:max-w-lg lg:max-w-xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl">{emoji}</span>
              <span className="text-xl md:text-2xl">{activity.title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 md:space-y-6">
            {activity.description && (
              <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.description')}</h4>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{activity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.date')}</h4>
                <p className="text-sm md:text-base">{format(new Date(activity.date), 'PPP')}</p>
              </div>

              <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.category')}</h4>
                <p className="text-sm md:text-base">{t(`calendar.categories.${activity.category}`)}</p>
              </div>

              {activity.start_time && (
                <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                  <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.startTime')}</h4>
                  <p className="text-sm md:text-base">
                    {format(new Date(`2000-01-01T${activity.start_time}`), 'HH:mm')}
                  </p>
                </div>
              )}

              {activity.end_time && (
                <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                  <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.endTime')}</h4>
                  <p className="text-sm md:text-base">
                    {format(new Date(`2000-01-01T${activity.end_time}`), 'HH:mm')}
                  </p>
                </div>
              )}

              {activity.duration_minutes && (
                <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                  <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.duration')}</h4>
                  <p className="text-sm md:text-base">{activity.duration_minutes} {t('calendar.detail.minutes')}</p>
                </div>
              )}

              <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.activityType')}</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${impactColor}`} />
                  <span className="text-sm md:text-base">{t(`calendar.activityTypes.${activity.impact_type}`)}</span>
                </div>
              </div>

              <div className="p-4 md:p-5 rounded-lg bg-muted/50">
                <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.status')}</h4>
                <Badge 
                  variant={activity.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs md:text-sm"
                >
                  {t(`calendar.status.${activity.status}`)}
                </Badge>
              </div>

              {isRecurring && (
                <div className="p-4 md:p-5 rounded-lg bg-muted/50 col-span-2">
                  <h4 className="text-sm md:text-base font-medium mb-2">{t('calendar.detail.recurrence')}</h4>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {t(`calendar.form.recurrence.${repetitionConfig.recurrence_type}`)}
                    {repetitionConfig.recurrence_count && ` (${repetitionConfig.recurrence_count} ${t('calendar.detail.occurrences')})`}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 md:gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(true);
                  onOpenChange(false);
                }}
                className="flex-1 h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
              >
                <Edit className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                {t('calendar.detail.edit')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                className="flex-1 h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
              >
                <Trash2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                {t('calendar.detail.delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ActivityFormModal
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            onUpdate();
          }
        }}
        activity={activity}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('calendar.detail.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {isRecurring 
                ? t('calendar.detail.deleteRecurringDescription')
                : t('calendar.detail.deleteConfirmation')
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {isRecurring && (
            <RadioGroup 
              value={deleteMode} 
              onValueChange={(v) => setDeleteMode(v as 'single' | 'all')}
              className="my-4 space-y-3"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="single" id="delete-single" />
                <Label htmlFor="delete-single" className="cursor-pointer font-normal">
                  {t('calendar.detail.deleteSingle')}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="all" id="delete-all" />
                <Label htmlFor="delete-all" className="cursor-pointer font-normal">
                  {t('calendar.detail.deleteAllRecurrences')}
                </Label>
              </div>
            </RadioGroup>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>{t('calendar.form.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('calendar.detail.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};