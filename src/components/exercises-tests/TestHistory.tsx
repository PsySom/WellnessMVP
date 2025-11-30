import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { ru, enUS, fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  id: string;
  test_id: string;
  score: number;
  max_score: number;
  category: string;
  completed_at: string;
}

interface Test {
  id: string;
  name_en: string;
  name_ru: string | null;
  name_fr: string;
}

interface TestWithResults {
  test: Test;
  results: TestResult[];
}

export const TestHistory = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { getLocalizedField } = useLocale();
  const [testsWithResults, setTestsWithResults] = useState<TestWithResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTestHistory();
    }
  }, [user]);

  const loadTestHistory = async () => {
    if (!user) return;

    setIsLoading(true);

    // Load all test results for user
    const { data: resultsData } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: true });

    if (resultsData && resultsData.length > 0) {
      // Get unique test IDs
      const testIds = [...new Set(resultsData.map(r => r.test_id))];

      // Load test info
      const { data: testsData } = await supabase
        .from('tests')
        .select('id, name_en, name_ru, name_fr')
        .in('id', testIds);

      if (testsData) {
        // Group results by test
        const grouped = testsData.map(test => ({
          test,
          results: resultsData.filter(r => r.test_id === test.id)
        }));

        setTestsWithResults(grouped);
      }
    }

    setIsLoading(false);
  };

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'ru': return ru;
      case 'fr': return fr;
      default: return enUS;
    }
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('low') || category === 'minimal') return 'hsl(var(--success))';
    if (category.includes('moderate') || category === 'mild') return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getCategoryBadgeColor = (category: string) => {
    if (category.includes('low') || category === 'minimal') return 'bg-success/10 text-success';
    if (category.includes('moderate') || category === 'mild') return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (testsWithResults.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t('tests.history.noResults')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {testsWithResults.map(({ test, results }) => {
        const chartData = results.map(result => ({
          date: format(new Date(result.completed_at), 'dd MMM', { locale: getDateLocale() }),
          fullDate: format(new Date(result.completed_at), 'PPp', { locale: getDateLocale() }),
          score: result.score,
          percentage: Math.round((result.score / result.max_score) * 100),
          category: result.category
        }));

        const latestResult = results[results.length - 1];

        return (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{getLocalizedField(test, 'name')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('tests.history.completedTimes', { count: results.length })}
                  </p>
                </div>
                <Badge className={getCategoryBadgeColor(latestResult.category)}>
                  {latestResult.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))'
                      }}
                      formatter={(value: any, name: string, props: any) => {
                        if (name === 'score') {
                          return [
                            `${value} (${props.payload.percentage}%)`,
                            t('tests.history.score')
                          ];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.fullDate;
                        }
                        return label;
                      }}
                    />
                    <Legend 
                      formatter={() => t('tests.history.score')}
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={getCategoryColor(latestResult.category)}
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--background))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
