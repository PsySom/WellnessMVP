import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InsightsPreview = () => {
  const navigate = useNavigate();

  // Mock insight - будет заменено на реальные AI рекомендации
  const hasInsight = true;
  const insight = {
    type: 'recommendation',
    title: 'High stress detected',
    description: 'Your stress levels have been elevated. Consider trying a breathing exercise.',
    action: 'Try breathing exercise',
  };

  if (!hasInsight) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          {insight.type === 'alert' ? (
            <AlertCircle className="h-5 w-5 text-primary" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">{insight.title}</h3>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => navigate('/insights')}>
              {insight.action}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/insights')}>
              View all insights
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InsightsPreview;
