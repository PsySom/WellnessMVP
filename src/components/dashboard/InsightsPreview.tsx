import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const InsightsPreview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [topRecommendation, setTopRecommendation] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_recommendations')
        .select(`
          *,
          activity_templates (name, emoji)
        `)
        .eq('user_id', user?.id)
        .is('accepted', null)
        .eq('dismissed', false)
        .order('priority', { ascending: true })
        .limit(1);

      if (error) throw error;

      setRecommendationCount(data?.length || 0);
      if (data && data.length > 0) {
        setTopRecommendation(data[0]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  if (recommendationCount === 0 || !topRecommendation) return null;

  const isPriority = topRecommendation.priority === 1;

  return (
    <Card className={`p-6 bg-gradient-to-br ${
      isPriority 
        ? 'from-destructive/5 to-warning/5 border-destructive/20' 
        : 'from-primary/5 to-secondary/5 border-primary/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${
          isPriority ? 'bg-destructive/10' : 'bg-primary/10'
        }`}>
          {isPriority ? (
            <AlertCircle className={`h-5 w-5 ${isPriority ? 'text-destructive' : 'text-primary'}`} />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{topRecommendation.activity_templates.emoji}</span>
            <h3 className="font-semibold text-foreground">
              {recommendationCount} {recommendationCount === 1 ? 'recommendation' : 'recommendations'} for you
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {topRecommendation.reason}: {topRecommendation.activity_templates.name}
          </p>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => navigate('/recommendations')}>
              View recommendations
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InsightsPreview;
