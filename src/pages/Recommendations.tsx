import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Plus, Calendar, X, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Recommendation {
  id: string;
  activity_template_id: string;
  reason: string;
  priority: number;
  created_at: string;
  activity_templates: {
    name: string;
    emoji: string;
    category: string;
    impact_type: string;
    default_duration_minutes: number;
    description: string;
  };
}

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [hasHighPriority, setHasHighPriority] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const lang = i18n.language;
      const { data, error } = await supabase
        .from('user_recommendations')
        .select(`
          *,
          activity_templates (*)
        `)
        .eq('user_id', user?.id)
        .is('accepted', null)
        .eq('dismissed', false)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to get language-specific names
      const mappedData = (data || []).map((rec: any) => ({
        ...rec,
        activity_templates: {
          name: rec.activity_templates[`name_${lang}`] || rec.activity_templates.name_en,
          emoji: rec.activity_templates.emoji,
          category: rec.activity_templates.category,
          impact_type: rec.activity_templates.impact_type,
          default_duration_minutes: rec.activity_templates.default_duration_minutes,
          description: rec.activity_templates[`description_${lang}`] || rec.activity_templates.description_en,
        }
      }));

      setRecommendations(mappedData);
      setHasHighPriority(mappedData.some((r: Recommendation) => r.priority === 1));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-recommendations');
      
      if (error) throw error;

      toast.success('Recommendations updated');
      await fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToToday = async (rec: Recommendation) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const { error: activityError } = await supabase.from('activities').insert([{
        user_id: user?.id!,
        title: rec.activity_templates.name,
        category: rec.activity_templates.category as any,
        impact_type: rec.activity_templates.impact_type as any,
        date: today,
        start_time: startTime,
        duration_minutes: rec.activity_templates.default_duration_minutes,
        status: 'planned' as const,
        template_id: rec.activity_template_id,
      }]);

      if (activityError) throw activityError;

      const { error: updateError } = await supabase
        .from('user_recommendations')
        .update({ accepted: true })
        .eq('id', rec.id);

      if (updateError) throw updateError;

      toast.success('Activity added to today');
      fetchRecommendations();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    }
  };

  const handleSchedule = async (rec: Recommendation) => {
    await supabase
      .from('user_recommendations')
      .update({ accepted: true })
      .eq('id', rec.id);

    navigate('/calendar', { state: { templateId: rec.activity_template_id } });
  };

  const handleDismiss = async (recId: string) => {
    try {
      const { error } = await supabase
        .from('user_recommendations')
        .update({ dismissed: true })
        .eq('id', recId);

      if (error) throw error;

      setRecommendations(recommendations.filter(r => r.id !== recId));
      toast.success('Recommendation dismissed');
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast.error('Failed to dismiss recommendation');
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return { label: 'High', color: 'bg-destructive text-destructive-foreground' };
    if (priority === 2) return { label: 'Medium', color: 'bg-warning text-warning-foreground' };
    return { label: 'Low', color: 'bg-muted text-muted-foreground' };
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      case 'neutral': return 'text-muted-foreground';
      default: return 'text-warning';
    }
  };

  const groupedRecs = {
    high: recommendations.filter(r => r.priority === 1),
    medium: recommendations.filter(r => r.priority === 2),
    low: recommendations.filter(r => r.priority >= 3),
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('recommendations.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('recommendations.forYou')}</p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={generating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {t('recommendations.refresh')}
          </Button>
        </div>

        {/* Alert Section */}
        {hasHighPriority && !loading && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Attention Needed</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  High priority recommendations detected. Consider taking action soon.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && recommendations.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground">You're all set!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No new recommendations right now. Keep tracking your mood and activities to get personalized suggestions.
              </p>
              <Button onClick={generateRecommendations} disabled={generating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                Check for Recommendations
              </Button>
            </div>
          </Card>
        )}

        {/* Recommendations List */}
        {!loading && recommendations.length > 0 && (
          <div className="space-y-6">
            {/* High Priority */}
            {groupedRecs.high.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">High Priority</h2>
                {groupedRecs.high.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    onAddToToday={handleAddToToday}
                    onSchedule={handleSchedule}
                    onDismiss={handleDismiss}
                    getPriorityLabel={getPriorityLabel}
                    getImpactColor={getImpactColor}
                  />
                ))}
              </div>
            )}

            {/* Medium Priority */}
            {groupedRecs.medium.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Medium Priority</h2>
                {groupedRecs.medium.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    onAddToToday={handleAddToToday}
                    onSchedule={handleSchedule}
                    onDismiss={handleDismiss}
                    getPriorityLabel={getPriorityLabel}
                    getImpactColor={getImpactColor}
                  />
                ))}
              </div>
            )}

            {/* Low Priority */}
            {groupedRecs.low.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Suggestions</h2>
                {groupedRecs.low.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    onAddToToday={handleAddToToday}
                    onSchedule={handleSchedule}
                    onDismiss={handleDismiss}
                    getPriorityLabel={getPriorityLabel}
                    getImpactColor={getImpactColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const RecommendationCard = ({
  rec,
  onAddToToday,
  onSchedule,
  onDismiss,
  getPriorityLabel,
  getImpactColor,
}: {
  rec: Recommendation;
  onAddToToday: (rec: Recommendation) => void;
  onSchedule: (rec: Recommendation) => void;
  onDismiss: (id: string) => void;
  getPriorityLabel: (priority: number) => { label: string; color: string };
  getImpactColor: (impact: string) => string;
}) => {
  const priority = getPriorityLabel(rec.priority);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{rec.activity_templates.emoji}</div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={priority.color}>{priority.label}</Badge>
                <Badge variant="outline">{rec.reason}</Badge>
              </div>
              <h3 className="font-semibold text-foreground text-lg">
                {rec.activity_templates.name}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(rec.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {rec.activity_templates.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="capitalize">{rec.activity_templates.category}</span>
            {rec.activity_templates.default_duration_minutes && (
              <span>{rec.activity_templates.default_duration_minutes} min</span>
            )}
            <span className={`capitalize ${getImpactColor(rec.activity_templates.impact_type)}`}>
              {rec.activity_templates.impact_type}
            </span>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAddToToday(rec)}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Today
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSchedule(rec)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Recommendations;
