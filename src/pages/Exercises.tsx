import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, ChevronRight, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { ActivityFormModal } from '@/components/calendar/ActivityFormModal';

interface Exercise {
  id: string;
  slug: string;
  name_en: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  effects: string[];
  emoji: string;
}

const Exercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getLocalizedField, getLocalizedArray } = useLocale();

  const handleScheduleExercise = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExercise(exercise);
    setActivityModalOpen(true);
  };

  const getPrefilledActivity = () => {
    if (!selectedExercise) return undefined;
    
    return {
      title: getLocalizedField(selectedExercise, 'name'),
      duration_minutes: selectedExercise.duration_minutes,
      impact_type: 'restoring',
      category: 'practice',
      description: getLocalizedField(selectedExercise, 'description') || '',
      date: new Date(),
      anytime: true,
      start_time: '09:00',
      is_recurring: false,
      recurrence_pattern: { type: 'none' as const },
      reminder_enabled: false,
      reminder_minutes_before: 15
    };
  };

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, categoryFilter]);

  const loadExercises = async () => {
    setIsLoading(true);
    
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .order('category');

    if (data) {
      setExercises(data);
    }

    setIsLoading(false);
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ex => ex.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex => {
        const localizedName = getLocalizedField(ex, 'name');
        const localizedEffects = getLocalizedArray(ex, 'effects');
        return localizedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          localizedEffects.some((effect: string) => effect.toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }

    setFilteredExercises(filtered);
  };

  const getDifficultyDots = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return '•'.repeat(count);
  };

  return (
    <AppLayout>
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground animate-slide-up">{t('exercises.title')}</h1>
          <p className="text-base text-muted-foreground mt-sm">
            {t('exercises.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('exercises.searchPlaceholder')}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="text-sm">{t('exercises.categories.all')}</TabsTrigger>
            <TabsTrigger value="grounding" className="text-sm">{t('exercises.categories.grounding')}</TabsTrigger>
            <TabsTrigger value="stress" className="text-sm">{t('exercises.categories.stress')}</TabsTrigger>
            <TabsTrigger value="anxiety" className="text-sm">{t('exercises.categories.anxiety')}</TabsTrigger>
            <TabsTrigger value="cognitive" className="text-sm">{t('exercises.categories.cognitive')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Exercises Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </>
          ) : filteredExercises.length === 0 ? (
            <p className="text-center text-muted-foreground col-span-full">
              {t('exercises.noExercisesFound')}
            </p>
          ) : (
            filteredExercises.map((exercise, index) => (
              <Card
                key={exercise.id}
                className="p-6 md:p-8 hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer animate-fade-in group"
                onClick={() => navigate(`/exercises/${exercise.slug}`)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-4 md:space-y-5">
                  <div className="text-5xl md:text-6xl transition-transform duration-300 group-hover:scale-110">{exercise.emoji}</div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                      {getLocalizedField(exercise, 'name')}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 md:mt-3">
                      <Badge variant="secondary" className="text-xs md:text-sm">
                        {t(`exercises.categories.${exercise.category}`)}
                      </Badge>
                      <span className="text-sm md:text-base text-muted-foreground">
                        {getDifficultyDots(exercise.difficulty)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full hover-scale transition-all" 
                      size="default"
                      onClick={(e) => handleScheduleExercise(exercise, e)}
                    >
                      <CalendarPlus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      {t('exercises.schedule')}
                    </Button>
                    <Button className="w-full hover-scale transition-all" size="default">
                      {t('exercises.start')}
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <ActivityFormModal
        open={activityModalOpen}
        onOpenChange={setActivityModalOpen}
        initialValues={getPrefilledActivity()}
        exerciseId={selectedExercise?.id}
      />
    </AppLayout>
  );
};

export default Exercises;
