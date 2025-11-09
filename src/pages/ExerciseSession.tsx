import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
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
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Instruction {
  step: number;
  title: string;
  content: string;
  duration?: number;
}

interface Exercise {
  id: string;
  slug: string;
  name_en: string;
  duration_minutes: number;
  instructions: Instruction[];
  emoji: string;
}

const ExerciseSession = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moodAfter, setMoodAfter] = useState<number[]>([5]);
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    loadExercise();
    setStartTime(Date.now());
  }, [slug]);

  const loadExercise = async () => {
    if (!slug) return;

    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data) {
      setExercise(data as unknown as Exercise);
    }
  };

  const handleNext = () => {
    if (!exercise) return;

    if (currentStep < exercise.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    navigate(`/exercises/${slug}`);
  };

  const handleComplete = async () => {
    if (!exercise) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/exercises');
      return;
    }

    const durationMinutes = Math.round((Date.now() - startTime) / 60000);

    const { error } = await supabase
      .from('exercise_sessions')
      .insert({
        user_id: user.id,
        exercise_id: exercise.id,
        duration_minutes: durationMinutes,
        mood_after: moodAfter[0],
        notes: notes.trim() || null
      });

    if (error) {
      console.error('Error saving session:', error);
    }

    toast({ 
      title: t('exercises.exerciseCompleted'),
      description: t('exercises.greatWork')
    });

    navigate('/exercises');
  };

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">{exercise.emoji}</div>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">
              {t('exercises.wellDone')}
            </h2>
            <p className="text-muted-foreground">
              {t('exercises.youCompleted')} {exercise.name_en}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('exercises.howFeelNow')}</Label>
              <div className="flex items-center gap-4">
                <span className="text-2xl">😟</span>
                <Slider
                  value={moodAfter}
                  onValueChange={setMoodAfter}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-2xl">😊</span>
              </div>
              <p className="text-center text-sm font-medium">{moodAfter[0]}/10</p>
            </div>

            <div className="space-y-2">
              <Label>{t('exercises.notesOptional')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('exercises.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={handleComplete} className="w-full">
              {t('exercises.done')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/journal')}
              className="w-full"
            >
              {t('exercises.addToJournal')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const instruction = exercise.instructions[currentStep];
  const progress = ((currentStep + 1) / exercise.instructions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <X className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('exercises.step')} {currentStep + 1} {t('tests.of')} {exercise.instructions.length}
          </span>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 min-h-[60vh] flex items-center">
        <Card className="w-full p-8 md:p-12">
          <div className="space-y-8 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mx-auto">
              {instruction.step}
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {instruction.title}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {instruction.content}
              </p>
            </div>

            {instruction.duration && (
              <div className="text-sm text-muted-foreground">
                {t('exercises.takeAbout')} {instruction.duration} {t('exercises.seconds')}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('tests.previous')}
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
          >
            {currentStep === exercise.instructions.length - 1 ? t('exercises.complete') : t('tests.next')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('exercises.exitExercise')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('exercises.progressNotSaved')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('exercises.continueExercise')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>
              {t('exercises.exit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExerciseSession;
