import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ReadyScreenProps {
  onComplete: () => void;
}

const ReadyScreen = ({ onComplete }: ReadyScreenProps) => {
  return (
    <Card className="p-8 space-y-8 animate-fade-in">
      {/* Success Icon */}
      <div className="flex justify-center py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-accent/20 to-primary/20 rounded-full p-12">
            <CheckCircle2 className="h-24 w-24 text-accent" strokeWidth={1.5} />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          You're all set!
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Let's start your wellness journey
        </p>
      </div>

      {/* Action */}
      <Button onClick={onComplete} className="w-full" size="lg">
        Go to Dashboard
      </Button>
    </Card>
  );
};

export default ReadyScreen;
