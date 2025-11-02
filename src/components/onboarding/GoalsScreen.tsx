import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';
import ProgressIndicator from './ProgressIndicator';
import { cn } from '@/lib/utils';

interface GoalsScreenProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
}

const goals = [
  { id: 'track_mood', label: 'Track my mood', emoji: '📊' },
  { id: 'reduce_stress', label: 'Reduce stress', emoji: '😰' },
  { id: 'work_anxiety', label: 'Work with anxiety', emoji: '😟' },
  { id: 'improve_sleep', label: 'Improve sleep', emoji: '💤' },
  { id: 'build_habits', label: 'Build healthy habits', emoji: '🎯' },
  { id: 'understand_myself', label: 'Better understand myself', emoji: '🧠' },
  { id: 'daily_journaling', label: 'Daily journaling', emoji: '📝' },
];

const GoalsScreen = ({ data, onUpdate, onNext, onBack, step }: GoalsScreenProps) => {
  const toggleGoal = (goalId: string) => {
    const currentGoals = data.goals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((g) => g !== goalId)
      : [...currentGoals, goalId];
    onUpdate({ goals: newGoals });
  };

  const canContinue = data.goals && data.goals.length > 0;

  return (
    <Card className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="pl-0">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">What brings you here?</h2>
          <p className="text-muted-foreground">Select all that apply</p>
          <ProgressIndicator current={step} total={5} />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-3">
        {goals.map((goal) => {
          const isSelected = data.goals?.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 text-left smooth-transition',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              )}
            >
              <span className="text-2xl">{goal.emoji}</span>
              <span className={cn(
                'font-medium',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {goal.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action */}
      <Button 
        onClick={onNext} 
        className="w-full" 
        size="lg"
        disabled={!canContinue}
      >
        Continue
      </Button>
    </Card>
  );
};

export default GoalsScreen;
