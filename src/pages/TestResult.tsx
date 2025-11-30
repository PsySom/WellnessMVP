import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Share2, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';

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
  const { t } = useTranslation();
  const { getLocalizedField, getLocalizedObject, formatDate } = useLocale();
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
        // Use localized scoring_info
        const localizedTest = {
          ...testData,
          scoring_info: getLocalizedObject(testData, 'scoring_info') || testData.scoring_info
        };
        setTest(localizedTest as unknown as Test);
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
      return t('tests.recommendations.minimal');
    } else if (result.category.includes('moderate') || result.category === 'mild') {
      return t('tests.recommendations.mild');
    } else {
      return t('tests.recommendations.severe');
    }
  };

  const getTranslatedCategory = (category: string) => {
    const key = `tests.categories.${category.replace(/ /g, '-').toLowerCase()}`;
    const translation = t(key);
    return translation === key ? category : translation;
  };

  const handleRetake = () => {
    navigate(`/tests/${slug}/take`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/tests/${slug}/results/${resultId}`;
    navigator.clipboard.writeText(url);
    toast({ title: t('exercises.linkCopied') });
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
          <p className="text-muted-foreground">{t('tests.testNotFound')}</p>
          <Button onClick={() => navigate('/tests')} className="mt-4">
            {t('tests.backToTests')}
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
            <h1 className="text-3xl font-bold text-foreground">{getLocalizedField(test, 'name')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('tests.completedOn')} {formatDate(result.completed_at, {
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
          <h3 className="text-xl font-semibold text-foreground">{t('tests.whatThisMeans')}</h3>
          <p className="text-muted-foreground">
            {getRecommendation()}
          </p>
        </Card>

        {/* Recommended Activities */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              {t('tests.recommendedSteps')}
            </h3>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{t('tests.recommendations.step1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{t('tests.recommendations.step2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{t('tests.recommendations.step3')}</span>
            </li>
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleRetake} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('tests.takeAgain')}
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            {t('exercises.share')}
          </Button>
          <Button
            onClick={() => navigate('/exercises-tests', { state: { tab: 'history' } })}
            variant="outline"
          >
            {t('tests.viewHistory')}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          {t('tests.disclaimer')}
        </p>
      </div>
    </AppLayout>
  );
};

export default TestResult;
