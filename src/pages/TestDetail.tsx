import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, FileText, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Test {
  id: string;
  slug: string;
  name_en: string;
  description_en: string;
  duration_minutes: number;
  total_questions: number;
  scoring_info: {
    ranges: Array<{
      min: number;
      max: number;
      category: string;
      label: string;
    }>;
  };
}

const TestDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, [slug]);

  const loadTest = async () => {
    if (!slug) return;

    setIsLoading(true);

    const { data } = await supabase
      .from('tests')
      .select('*')
      .eq('slug', slug)
      .single();

    if (data) {
      setTest(data as unknown as Test);

      // Check if user has taken this test before
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: results } = await supabase
          .from('test_results')
          .select('id')
          .eq('user_id', user.id)
          .eq('test_id', data.id)
          .limit(1);

        setHasHistory(!!results && results.length > 0);
      }
    }

    setIsLoading(false);
  };

  const startTest = () => {
    navigate(`/tests/${slug}/take`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!test) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Test not found</p>
          <Button onClick={() => navigate('/tests')} className="mt-4">
            Back to Tests
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
            onClick={() => navigate('/tests')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{test.name_en}</h1>
        </div>

        {/* Test Info */}
        <Card className="p-6 space-y-4">
          <p className="text-muted-foreground">{test.description_en}</p>

          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {test.duration_minutes} minutes
            </Badge>
            <Badge variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              {test.total_questions} questions
            </Badge>
          </div>
        </Card>

        {/* What it Measures */}
        <Card className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">What This Test Measures</h3>
          <p className="text-sm text-muted-foreground">
            This assessment helps evaluate your current state and provides insights based on validated psychological scales.
          </p>
        </Card>

        {/* Result Categories */}
        <Card className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Result Categories</h3>
          <div className="space-y-2">
            {test.scoring_info.ranges.map((range, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="font-medium">{range.label}</span>
                <Badge variant="outline">
                  {range.min}-{range.max} points
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={startTest} size="lg" className="flex-1">
            Start Test
          </Button>
          {hasHistory && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/tests/${slug}/history`)}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          )}
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-muted-foreground text-center">
          Your responses are private and stored securely. This test is for self-assessment purposes and does not constitute medical advice.
        </p>
      </div>
    </AppLayout>
  );
};

export default TestDetail;
