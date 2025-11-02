import { Card } from '@/components/ui/card';
import { TrackerEntry, Period } from '@/pages/TrackerHistory';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';

interface MoodGraphProps {
  entries: TrackerEntry[];
  period: Period;
}

const MoodGraph = ({ entries, period }: MoodGraphProps) => {
  const data = entries
    .filter((e) => e.mood_score !== null)
    .map((entry) => {
      const date = new Date(`${entry.entry_date}T${entry.entry_time}`);
      let label = '';
      
      switch (period) {
        case 'day':
          label = format(date, 'HH:mm');
          break;
        case 'week':
          label = format(date, 'EEE');
          break;
        case 'month':
          label = format(date, 'MMM d');
          break;
      }

      return {
        time: label,
        mood: entry.mood_score,
        fullDate: date.toISOString(),
      };
    });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const emoji = value >= 3 ? '😄' : value >= 1 ? '🙂' : value >= -1 ? '😐' : value >= -3 ? '😟' : '😢';
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-2xl mb-1">{emoji}</p>
          <p className="text-sm font-semibold">Mood: {value > 0 ? '+' : ''}{value}</p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Mood Over Time</h3>
        <p className="text-muted-foreground text-center py-8">No mood data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Mood Over Time</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            domain={[-5, 5]} 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#moodGradient)"
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-accent" />
          <span className="text-muted-foreground">Positive mood</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-destructive" />
          <span className="text-muted-foreground">Negative mood</span>
        </div>
      </div>
    </Card>
  );
};

export default MoodGraph;
