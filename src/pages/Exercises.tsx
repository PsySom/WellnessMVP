import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

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
  const navigate = useNavigate();

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
      filtered = filtered.filter(ex =>
        ex.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.effects.some(effect => effect.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredExercises(filtered);
  };

  const getDifficultyDots = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return '•'.repeat(count);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      grounding: 'Grounding',
      stress: 'Stress Relief',
      anxiety: 'Anxiety',
      cognitive: 'Cognitive'
    };
    return labels[category] || category;
  };

  return (
    <AppLayout>
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground animate-slide-up">Exercises & Practices</h1>
          <p className="text-base text-muted-foreground mt-sm">
            Guided exercises for mental wellness
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
            <TabsTrigger value="grounding" className="text-sm">Grounding</TabsTrigger>
            <TabsTrigger value="stress" className="text-sm">Stress Relief</TabsTrigger>
            <TabsTrigger value="anxiety" className="text-sm">Anxiety</TabsTrigger>
            <TabsTrigger value="cognitive" className="text-sm">Cognitive</TabsTrigger>
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
              No exercises found
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
                      {exercise.name_en}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 md:mt-3">
                      <Badge variant="secondary" className="text-xs md:text-sm">{getCategoryLabel(exercise.category)}</Badge>
                      <span className="text-sm md:text-base text-muted-foreground">
                        {getDifficultyDots(exercise.difficulty)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                    <Clock className="h-4 w-4 md:h-5 md:w-5" />
                    {exercise.duration_minutes} min
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    {exercise.effects.slice(0, 2).map((effect, i) => (
                      <p key={i} className="text-sm md:text-base text-muted-foreground">
                        • {effect}
                      </p>
                    ))}
                  </div>

                  <Button className="w-full hover-scale transition-all" size="default">
                    Start
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Exercises;
