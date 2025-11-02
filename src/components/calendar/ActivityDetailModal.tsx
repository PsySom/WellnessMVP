import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { ActivityFormModal } from './ActivityFormModal';
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

export const ActivityDetailModal = ({ activity, open, onOpenChange, onUpdate }: ActivityDetailModalProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = async () => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activity.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete activity',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Activity deleted'
      });
      onOpenChange(false);
      onUpdate();
    }
  };

  const emoji = CATEGORY_EMOJIS[activity.category] || '📌';

  return (
    <>
      <Dialog open={open && !isEditOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              {activity.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {activity.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Date</h4>
                <p className="text-sm">{format(new Date(activity.date), 'PPP')}</p>
              </div>

              {activity.start_time && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Time</h4>
                  <p className="text-sm">
                    {format(new Date(`2000-01-01T${activity.start_time}`), 'HH:mm')}
                  </p>
                </div>
              )}

              {activity.duration_minutes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Duration</h4>
                  <p className="text-sm">{activity.duration_minutes} minutes</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                  {activity.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(true);
                  onOpenChange(false);
                }}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
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
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
