import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeScreen = ({ onNext, onSkip }: WelcomeScreenProps) => {
  return (
    <Card className="p-8 space-y-8 animate-fade-in">
      {/* Skip button */}
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onSkip} className="text-sm">
          Skip
        </Button>
      </div>

      {/* Illustration */}
      <div className="flex justify-center py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full p-12">
            <Brain className="h-24 w-24 text-primary" strokeWidth={1.5} />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to Mental Wellness
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Your personal companion for mental health and self-care
        </p>
      </div>

      {/* Action */}
      <Button onClick={onNext} className="w-full" size="lg">
        Get Started
      </Button>
    </Card>
  );
};

export default WelcomeScreen;
