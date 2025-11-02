import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smile, TrendingUp, Heart, Brain } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Good morning! 👋
          </h1>
          <p className="text-muted-foreground">
            How are you feeling today?
          </p>
        </div>

        {/* Quick Mood Check */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Quick Mood Check</h2>
          <div className="flex justify-between gap-2">
            {['😢', '😟', '😐', '🙂', '😄'].map((emoji, index) => (
              <button
                key={index}
                className="flex-1 aspect-square rounded-xl bg-muted hover:bg-primary/10 smooth-transition text-3xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smile className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Mood</span>
            </div>
            <p className="text-2xl font-bold">Good</p>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold">5 days</p>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Heart className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">Activities</span>
            </div>
            <p className="text-2xl font-bold">12</p>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Brain className="h-4 w-4 text-warning" />
              </div>
              <span className="text-xs text-muted-foreground">Insights</span>
            </div>
            <p className="text-2xl font-bold">3 new</p>
          </Card>
        </div>

        {/* Today's Activities */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Today's Activities</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                🧘
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Morning meditation</p>
                <p className="text-xs text-muted-foreground">10 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                🚶
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Evening walk</p>
                <p className="text-xs text-muted-foreground">30 minutes</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Temp Sign Out */}
        <Button 
          variant="outline" 
          onClick={signOut}
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
