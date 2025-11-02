import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Share2, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  id: string;
  score: number;
  max_score: number;
  category: string;
  completed_at: string;
  test_id: string;
}

interface Test {
  name_en: string;
  slug: string;
  scoring_info: {
    ranges: Array<{
      min: number;
      max: number;
      category: string;
      label: string;
    }>;
  };
}

const TestResult = () => {
  const { slug, resultId } = useParams<{ slug: string; resultId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<TestResult | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    if (!resultId) return;

    setIsLoading(true);

    const { data: resultData } = await supabase
      .from('test_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (resultData) {
      setResult(resultData);

      const { data: testData } = await supabase
        .from('tests')
        .select('*')
        .eq('id', resultData.test_id)
        .single();

      if (testData) {
        setTest(testData as unknown as Test);
      }
    }

    setIsLoading(false);
  };

  const getCategoryDetails = () => {
    if (!test || !result) return null;

    return test.scoring_info.ranges.find(
      r => r.category === result.category
    );
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('low') || category === 'minimal') 
      return 'bg-green-500/10 text-green-500 border-green-500';
    if (category.includes('moderate') || category === 'mild') 
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
    return 'bg-red-500/10 text-red-500 border-red-500';
  };

  const getEmoji = (category: string) => {
    if (category.includes('low') || category === 'minimal') return '😊';
    if (category.includes('moderate') || category === 'mild') return '😐';
    return '😟';
  };

  const getRecommendation = () => {
    if (!result) return '';

    if (result.category.includes('low') || result.category === 'minimal') {
      return "Great! Your results indicate a healthy state. Continue with your current wellness practices.";
    } else if (result.category.includes('moderate') || result.category === 'mild') {
      return "Your results suggest moderate levels. Consider incorporating stress-reduction activities and monitoring your progress.";
    } else {
      return "Your results indicate high levels. Consider speaking with a mental health professional for personalized support.";
    }
  };

  const handleRetake = () => {
    navigate(`/tests/${slug}/take`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/tests/${slug}/results/${resultId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied to clipboard' });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!result || !test) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Result not found</p>
          <Button onClick={() => navigate('/tests')} className="mt-4">
            Back to Tests
          </Button>
        </div>
      </AppLayout>
    );
  }

  const categoryDetails = getCategoryDetails();
  const percentage = Math.round((result.score / result.max_score) * 100);

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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{test.name_en}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Completed on {new Date(result.completed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Score Display */}
        <Card className="p-8 text-center space-y-4">
          <div className="text-6xl">{getEmoji(result.category)}</div>
          <div>
            <div className="text-5xl font-bold text-foreground">
              {result.score}
              <span className="text-2xl text-muted-foreground">/{result.max_score}</span>
            </div>
            <p className="text-lg text-muted-foreground mt-2">{percentage}%</p>
          </div>
          {categoryDetails && (
            <Badge 
              className={`text-lg px-6 py-2 ${getCategoryColor(result.category)}`}
              variant="outline"
            >
              {categoryDetails.label}
            </Badge>
          )}
        </Card>

        {/* Interpretation */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold text-foreground">What This Means</h3>
          <p className="text-muted-foreground">
            {getRecommendation()}
          </p>
        </Card>

        {/* Recommended Activities */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Recommended Next Steps
            </h3>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Schedule regular check-ins with yourself using the journal feature</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Track your daily activities and their impact on your wellbeing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Retake this test periodically to monitor your progress</span>
            </li>
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleRetake} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Take Again
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={() => navigate(`/tests/${slug}/history`)}
            variant="outline"
          >
            View History
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          This assessment is for informational purposes only and does not replace professional medical advice. 
          If you're experiencing distress, please consult with a qualified mental health professional.
        </p>
      </div>
    </AppLayout>
  );
};

export default TestResult;
