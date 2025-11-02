import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      emoji: '👋',
      title: 'Welcome to Mental Wellness',
      description: 'Your personal companion for mental health and wellbeing',
    },
    {
      emoji: '📊',
      title: 'Track Your Mood',
      description: 'Easily log your emotions and understand patterns over time',
    },
    {
      emoji: '📅',
      title: 'Plan Activities',
      description: 'Schedule self-care activities and get gentle reminders',
    },
    {
      emoji: '📝',
      title: 'Reflect Daily',
      description: 'Keep a journal to track your thoughts and progress',
    },
    {
      emoji: '💡',
      title: 'Get Insights',
      description: 'Receive personalized recommendations based on your data',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm p-8 space-y-8 animate-fade-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full smooth-transition ${
                index === step
                  ? 'w-8 bg-primary'
                  : index < step
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <div className="text-6xl">{currentStep.emoji}</div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentStep.title}
          </h1>
          <p className="text-muted-foreground">
            {currentStep.description}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleNext} className="w-full">
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          
          {step < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full"
            >
              Skip
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
