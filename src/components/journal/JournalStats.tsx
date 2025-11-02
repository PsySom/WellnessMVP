import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Flame, BarChart3 } from 'lucide-react';

interface JournalStatsProps {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  thisMonthCount: number;
}

export const JournalStats = ({
  totalSessions,
  currentStreak,
  longestStreak,
  thisMonthCount
}: JournalStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{thisMonthCount}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
