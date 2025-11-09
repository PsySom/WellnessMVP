import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrackerEntry } from '@/pages/TrackerHistory';
import { format } from 'date-fns';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface EntryDetailsModalProps {
  entry: TrackerEntry;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

const EntryDetailsModal = ({ entry, isOpen, onClose, onDeleted }: EntryDetailsModalProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const date = new Date(`${entry.entry_date}T${entry.entry_time}`);

  const getMoodLabel = (score: number | null) => {
    if (score === null) return 'Not set';
    if (score >= 3) return 'Great';
    if (score >= 1) return 'Good';
    if (score >= -1) return 'Neutral';
    if (score >= -3) return 'Bad';
    return 'Very bad';
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('tracker_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: 'Entry deleted',
        description: 'Your tracker entry has been removed.',
      });

      onDeleted();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting entry',
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl md:text-2xl">Entry Details</DialogTitle>
            <p className="text-sm md:text-base text-muted-foreground">
              {format(date, 'MMMM d, yyyy')} at {format(date, 'h:mm a')}
            </p>
          </DialogHeader>

          <div className="space-y-5 md:space-y-6 py-4">
            {/* Mood */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm md:text-base">Mood</h4>
              <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-lg bg-muted/50 transition-all hover:shadow-md">
                <span className="text-3xl md:text-4xl transition-transform hover:scale-110">
                  {entry.mood_score !== null && entry.mood_score >= 3 ? '😄' :
                   entry.mood_score !== null && entry.mood_score >= 1 ? '🙂' :
                   entry.mood_score !== null && entry.mood_score >= -1 ? '😐' :
                   entry.mood_score !== null && entry.mood_score >= -3 ? '😟' : '😢'}
                </span>
                <div>
                  <p className="font-medium text-base md:text-lg">{getMoodLabel(entry.mood_score)}</p>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Score: {entry.mood_score !== null ? (entry.mood_score > 0 ? '+' : '') + entry.mood_score : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emotions */}
            {entry.emotions && entry.emotions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Emotions</h4>
                <div className="space-y-2">
                  {entry.emotions.map((emotion, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{emotion.emotion_label}</span>
                        <span className="text-sm text-muted-foreground">
                          {emotion.intensity}/10
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(emotion.intensity / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stress & Anxiety */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm md:text-base">Stress</h4>
                <div className="p-4 md:p-5 rounded-lg bg-muted/50 text-center transition-all hover:shadow-md">
                  <p className="text-3xl md:text-4xl font-bold">{entry.stress_level ?? 'N/A'}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">/10</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm md:text-base">Anxiety</h4>
                <div className="p-4 md:p-5 rounded-lg bg-muted/50 text-center transition-all hover:shadow-md">
                  <p className="text-3xl md:text-4xl font-bold">{entry.anxiety_level ?? 'N/A'}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">/10</p>
                </div>
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Energy</h4>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">
                  {entry.energy_level !== null ? (entry.energy_level > 0 ? '+' : '') + entry.energy_level : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">-5 to +5</p>
              </div>
            </div>

            {/* Satisfaction */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Process</h4>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{entry.process_satisfaction ?? 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">/10</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Result</h4>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{entry.result_satisfaction ?? 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">/10</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 md:gap-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteAlert(true)}
              disabled={isDeleting}
              className="h-10 md:h-11 text-sm md:text-base hover-scale transition-all"
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your tracker entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EntryDetailsModal;
