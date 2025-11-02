import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Activity, BookOpen, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendationsCardProps {
  data: any;
}

const RecommendationsCard = ({ data }: RecommendationsCardProps) => {
  const navigate = useNavigate();
  const { trackerEntries, activities, journalSessions } = data;

  const recommendations = [];

  // Check stress/anxiety levels
  const highStressEntries = trackerEntries.filter((e: any) => 
    e.stress_level >= 7 || e.anxiety_level >= 7
  );
  
  if (highStressEntries.length > trackerEntries.length * 0.3) {
    recommendations.push({
      icon: Brain,
      title: 'Try stress-relief exercises',
      description: 'Your stress levels have been elevated. Breathing exercises and meditation can help.',
      action: 'Browse Exercises',
      onClick: () => navigate('/exercises'),
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    });
  }

  // Check activity completion
  const completedActivities = activities.filter((a: any) => a.status === 'completed');
  const completionRate = activities.length > 0 ? completedActivities.length / activities.length : 0;
  
  if (completionRate < 0.5 && activities.length > 0) {
    recommendations.push({
      icon: Activity,
      title: 'Focus on fewer activities',
      description: 'You might be planning too much. Try scheduling fewer activities and completing them fully.',
      action: 'View Calendar',
      onClick: () => navigate('/calendar'),
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    });
  }

  // Check journaling frequency
  const daysSinceLastJournal = journalSessions.length > 0
    ? Math.floor((new Date().getTime() - new Date(journalSessions[journalSessions.length - 1].started_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceLastJournal > 7) {
    recommendations.push({
      icon: BookOpen,
      title: 'Regular journaling helps',
      description: 'It\'s been a while since your last journal entry. Regular journaling can improve self-awareness.',
      action: 'Start Journaling',
      onClick: () => navigate('/journal'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    });
  }

  // Check low mood patterns
  const lowMoodEntries = trackerEntries.filter((e: any) => e.mood_score < -2);
  
  if (lowMoodEntries.length > trackerEntries.length * 0.4 && trackerEntries.length > 5) {
    recommendations.push({
      icon: Sparkles,
      title: 'Consider taking a wellness test',
      description: 'Your mood has been low recently. Taking a psychological test might provide helpful insights.',
      action: 'View Tests',
      onClick: () => navigate('/tests'),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    });
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">You're doing great! 🎉</h3>
            <p className="text-sm text-muted-foreground">
              Keep up the good work with tracking your mood, completing activities, and maintaining your wellness routine.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Recommendations</h2>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <Card key={index} className={`p-4 ${rec.bgColor} border-opacity-30`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-card`}>
                <rec.icon className={`h-5 w-5 ${rec.color}`} />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-foreground">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <Button size="sm" onClick={rec.onClick} variant="default">
                  {rec.action}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsCard;
