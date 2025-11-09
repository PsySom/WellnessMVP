import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface Test {
  id: string;
  slug: string;
  name_en: string;
  description_en: string;
  duration_minutes: number;
  total_questions: number;
}

interface LastResult {
  completed_at: string;
  category: string;
  score: number;
}

const Tests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [lastResults, setLastResults] = useState<{ [key: string]: LastResult }>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setIsLoading(true);
    
    // Load all tests
    const { data: testsData } = await supabase
      .from('tests')
      .select('*')
      .order('created_at');

    if (testsData) {
      setTests(testsData);

      // Load last results for each test
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const results: { [key: string]: LastResult } = {};
        
        for (const test of testsData) {
          const { data } = await supabase
            .from('test_results')
            .select('completed_at, category, score')
            .eq('user_id', user.id)
            .eq('test_id', test.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

          if (data) {
            results[test.id] = data;
          }
        }
        
        setLastResults(results);
      }
    }

    setIsLoading(false);
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('low') || category === 'minimal') return 'bg-green-500/10 text-green-500';
    if (category.includes('moderate') || category === 'mild') return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-red-500/10 text-red-500';
  };

  return (
    <AppLayout>
      <div className="space-y-6 lg:space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Psychological Tests</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Track your mental health with validated assessments
          </p>
        </div>

        {/* Tests Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-6" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </>
          ) : tests.length === 0 ? (
            <p className="text-center text-muted-foreground col-span-2">
              No tests available
            </p>
          ) : (
            tests.map((test, index) => {
              const lastResult = lastResults[test.id];
              
              return (
                <Card
                  key={test.id}
                  className="p-6 md:p-8 hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer animate-fade-in group"
                  onClick={() => navigate(`/tests/${test.slug}`)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-4 md:space-y-5">
                    <div>
                       <h3 className="text-2xl font-semibold text-foreground medium-transition group-hover:text-primary">
                        {test.name_en}
                      </h3>
                      <p className="text-base text-muted-foreground mt-sm">
                        {test.description_en}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-sm">
                      <Badge variant="outline" className="gap-1 text-sm medium-transition group-hover:border-primary">
                        <Clock className="h-4 w-4" />
                        {test.duration_minutes} min
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-sm medium-transition group-hover:border-primary">
                        <FileText className="h-4 w-4" />
                        {test.total_questions} questions
                      </Badge>
                    </div>

                    {lastResult && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">
                          Last taken: {new Date(lastResult.completed_at).toLocaleDateString()}
                        </p>
                        <Badge className={getCategoryColor(lastResult.category)}>
                          Score: {lastResult.score}
                        </Badge>
                      </div>
                    )}

                    <Button 
                      className="w-full hover-scale transition-all" 
                      variant={lastResult ? 'secondary' : 'default'}
                      size="default"
                    >
                      {lastResult ? 'Take Again' : 'Take Test'}
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tests;
