import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Search, ChevronRight, CalendarPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { ActivityFormModal } from '@/components/calendar/ActivityFormModal';
import { useAuth } from '@/contexts/AuthContext';

interface Exercise {
  id: string;
  slug: string;
  name_en: string;
  name_ru: string | null;
  name_fr: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  emoji: string;
}

interface Test {
  id: string;
  slug: string;
  name_en: string;
  name_ru: string | null;
  name_fr: string;
  duration_minutes: number;
  total_questions: number;
}

interface TestResult {
  test_id: string;
  completed_at: string;
  category: string;
  score: number;
}

const ExercisesTests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getLocalizedField } = useLocale();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'exercises' | 'tests'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Exercise | Test | null>(null);
  const [selectedType, setSelectedType] = useState<'exercise' | 'test' | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);

    // Load exercises
    const { data: exercisesData } = await supabase
      .from('exercises')
      .select('*')
      .order('category');

    if (exercisesData) {
      setExercises(exercisesData);
    }

    // Load tests
    const { data: testsData } = await supabase
      .from('tests')
      .select('*')
      .order('created_at');

    if (testsData) {
      setTests(testsData);

      // Load last test results
      if (user) {
        const results: { [key: string]: TestResult } = {};
        for (const test of testsData) {
          const { data } = await supabase
            .from('test_results')
            .select('test_id, completed_at, category, score')
            .eq('user_id', user.id)
            .eq('test_id', test.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

          if (data) {
            results[test.id] = data;
          }
        }
        setTestResults(results);
      }
    }

    setIsLoading(false);
  };

  const handleSchedule = (item: Exercise | Test, type: 'exercise' | 'test', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setSelectedType(type);
    setActivityModalOpen(true);
  };

  const handleStart = (item: Exercise | Test, type: 'exercise' | 'test') => {
    if (type === 'exercise') {
      navigate(`/exercises/${(item as Exercise).slug}`);
    } else {
      navigate(`/tests/${(item as Test).slug}`);
    }
  };

  const getPrefilledActivity = () => {
    if (!selectedItem || !selectedType) return undefined;

    return {
      title: getLocalizedField(selectedItem, 'name'),
      duration_minutes: selectedItem.duration_minutes,
      impact_type: selectedType === 'exercise' ? 'restoring' : 'neutral',
      category: selectedType === 'exercise' ? 'practice' : 'testing',
      description: '',
      date: new Date(),
      anytime: true,
      start_time: '09:00',
      is_recurring: false,
      recurrence_pattern: { type: 'none' as const },
      reminder_enabled: false,
      reminder_minutes_before: 15
    };
  };

  const filteredExercises = exercises.filter(ex => {
    if (searchQuery) {
      const name = getLocalizedField(ex, 'name').toLowerCase();
      if (!name.includes(searchQuery.toLowerCase())) return false;
    }
    if (categoryFilter !== 'all' && ex.category !== categoryFilter) return false;
    return true;
  });

  const filteredTests = tests.filter(test => {
    if (searchQuery) {
      const name = getLocalizedField(test, 'name').toLowerCase();
      if (!name.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const displayedItems = typeFilter === 'all' 
    ? [...filteredExercises, ...filteredTests]
    : typeFilter === 'exercises'
    ? filteredExercises
    : filteredTests;

  const getDifficultyDots = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return '•'.repeat(count);
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('low') || category === 'minimal') return 'bg-success/10 text-success';
    if (category.includes('moderate') || category === 'mild') return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.exercisesTests')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('dashboard.exercisesTestsSubtitle')}
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  {t('common.all')}
                </TabsTrigger>
                <TabsTrigger value="exercises" className="flex-1">
                  {t('exercises.title')}
                </TabsTrigger>
                <TabsTrigger value="tests" className="flex-1">
                  {t('tests.title')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Category Filter for exercises */}
            {typeFilter !== 'tests' && (
              <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all" className="text-xs">
                    {t('exercises.categories.all')}
                  </TabsTrigger>
                  <TabsTrigger value="grounding" className="text-xs">
                    {t('exercises.categories.grounding')}
                  </TabsTrigger>
                  <TabsTrigger value="stress" className="text-xs">
                    {t('exercises.categories.stress')}
                  </TabsTrigger>
                  <TabsTrigger value="anxiety" className="text-xs">
                    {t('exercises.categories.anxiety')}
                  </TabsTrigger>
                  <TabsTrigger value="cognitive" className="text-xs">
                    {t('exercises.categories.cognitive')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Items Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {isLoading ? (
                <>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-8 w-8 rounded-full mb-2" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-8 w-full" />
                    </Card>
                  ))}
                </>
              ) : displayedItems.length === 0 ? (
                <p className="text-center text-muted-foreground col-span-full py-8">
                  {t('common.noResults')}
                </p>
              ) : (
                displayedItems.map((item) => {
                  const isExercise = 'emoji' in item;
                  const exercise = isExercise ? (item as Exercise) : null;
                  const test = !isExercise ? (item as Test) : null;
                  const testResult = test ? testResults[test.id] : null;

                  return (
                    <Card
                      key={item.id}
                      className="p-4 hover:shadow-md hover-scale transition-all cursor-pointer group"
                      onClick={() => handleStart(item, isExercise ? 'exercise' : 'test')}
                    >
                      <div className="space-y-3">
                        {isExercise && exercise && (
                          <div className="text-3xl transition-transform group-hover:scale-110">
                            {exercise.emoji}
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {getLocalizedField(item, 'name')}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {isExercise && exercise ? (
                              <>
                                <Badge variant="secondary" className="text-xs">
                                  {t(`exercises.categories.${exercise.category}`)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {getDifficultyDots(exercise.difficulty)}
                                </span>
                              </>
                            ) : test ? (
                              <>
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  {test.duration_minutes} {t('common.min')}
                                </Badge>
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <FileText className="h-3 w-3" />
                                  {test.total_questions}
                                </Badge>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {testResult && (
                          <Badge className={getCategoryColor(testResult.category)}>
                            {t('tests.lastScore')}: {testResult.score}
                          </Badge>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => handleSchedule(item, isExercise ? 'exercise' : 'test', e)}
                          >
                            <CalendarPlus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" className="flex-1">
                            {t('common.start')}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityFormModal
        open={activityModalOpen}
        onOpenChange={setActivityModalOpen}
        initialValues={getPrefilledActivity()}
        exerciseId={selectedType === 'exercise' ? selectedItem?.id : undefined}
        testId={selectedType === 'test' ? selectedItem?.id : undefined}
      />
    </AppLayout>
  );
};

export default ExercisesTests;
