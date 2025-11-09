import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Play, Calendar, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';

interface Exercise {
  id: string;
  slug: string;
  name_en: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  effects: string[];
  instructions: Array<{
    step: number;
    title: string;
    content: string;
    duration?: number;
  }>;
  emoji: string;
}

const ExerciseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { getLocalizedField } = useLocale();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercise();
  }, [slug]);

  const loadExercise = async () => {
    if (!slug) return;

    setIsLoading(true);

    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data) {
      setExercise(data as unknown as Exercise);
    }

    setIsLoading(false);
  };

  const handleStart = () => {
    navigate(`/exercises/${slug}/session`);
  };

  const handleAddToCalendar = () => {
    // Navigate to calendar with pre-filled data
    navigate('/calendar', {
      state: {
        prefill: {
          title: exercise ? getLocalizedField(exercise, 'name') : '',
          category: 'practice',
          impact_type: 'restorative',
          duration_minutes: exercise?.duration_minutes
        }
      }
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/exercises/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: t('exerciseDetail.linkCopied') });
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: { [key: string]: string } = {
      easy: t('exerciseDetail.difficulty.easy'),
      medium: t('exerciseDetail.difficulty.medium'),
      hard: t('exerciseDetail.difficulty.hard')
    };
    return labels[difficulty] || difficulty;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-20 w-20" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">{t('exerciseDetail.exerciseNotFound')}</p>
          <Button onClick={() => navigate('/exercises')} className="mt-4">
            {t('exerciseDetail.backToExercises')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/exercises')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Exercise Info */}
        <div className="space-y-4">
          <div className="text-6xl">{exercise.emoji}</div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">{getLocalizedField(exercise, 'name')}</h1>
            <p className="text-muted-foreground mt-2">{getLocalizedField(exercise, 'description')}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {exercise.duration_minutes} {t('exercises.minutes')}
            </Badge>
            <Badge variant="secondary">
              {t(`calendar.categories.${exercise.category}`)}
            </Badge>
            <Badge variant="outline">
              {getDifficultyLabel(exercise.difficulty)}
            </Badge>
          </div>
        </div>

        {/* Effects */}
        <Card className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            ✨ {t('exerciseDetail.whatThisHelps')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(getLocalizedField(exercise, 'effects') as string[]).map((effect, i) => (
              <Badge key={i} variant="secondary">
                {effect}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Instructions Preview */}
        <Card className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{t('exerciseDetail.howItWorks')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('exerciseDetail.stepsInfo', { 
              count: exercise.instructions.length,
              minutes: Math.ceil(exercise.duration_minutes / exercise.instructions.length)
            })}
          </p>
          <div className="space-y-2">
            {exercise.instructions.map((instruction, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                  {instruction.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{getLocalizedField(instruction, 'title')}</h4>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleStart} size="lg" className="w-full">
            <Play className="h-5 w-5 mr-2" />
            {t('exerciseDetail.startExercise')}
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleAddToCalendar}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('exerciseDetail.addToCalendar')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t('exerciseDetail.share')}
            </Button>
          </div>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          {t('exerciseDetail.note')}
        </p>
      </div>
    </AppLayout>
  );
};

export default ExerciseDetail;
