import { Card } from '@/components/ui/card';
import { Clock, MessageSquare, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InsightData {
  averageSessionsPerWeek: number;
  mostActiveTimeOfDay: string;
  averageMessageCount: number;
  consistencyScore: number;
  topWords: { word: string; count: number }[];
}

interface JournalInsightsProps {
  insights: InsightData;
}

export const JournalInsights = ({ insights }: JournalInsightsProps) => {
  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Your Journaling Insights</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Journaling Habit</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best time of day:</span>
              <span className="font-medium">{insights.mostActiveTimeOfDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessions per week:</span>
              <span className="font-medium">{insights.averageSessionsPerWeek.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg. messages:</span>
              <span className="font-medium">{insights.averageMessageCount.toFixed(0)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Consistency Score</h4>
          </div>
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getConsistencyColor(insights.consistencyScore)}`}>
                {insights.consistencyScore}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {insights.consistencyScore >= 80 ? 'Excellent!' : 
                 insights.consistencyScore >= 50 ? 'Good progress' : 
                 'Keep going!'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Frequently Mentioned Topics</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {insights.topWords.length > 0 ? (
            insights.topWords.map((item) => (
              <Badge key={item.word} variant="secondary">
                {item.word} ({item.count})
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Start journaling to see your frequently mentioned topics
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
