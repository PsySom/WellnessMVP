import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface MoodTrendsChartProps {
  entries: any[];
  period: string;
}

const MoodTrendsChart = ({ entries, period }: MoodTrendsChartProps) => {
  const data = entries
    .filter((e) => e.mood_score !== null)
    .map((entry) => {
      const date = new Date(`${entry.entry_date}T${entry.entry_time}`);
      let label = '';
      
      switch (period) {
        case 'week':
          label = format(date, 'EEE');
          break;
        case 'month':
          label = format(date, 'MMM d');
          break;
        case '3months':
        case 'year':
          label = format(date, 'MMM d');
          break;
      }

      return {
        time: label,
        mood: entry.mood_score,
        date: entry.entry_date,
      };
    });

  const avgMood = data.length > 0
    ? data.reduce((sum, d) => sum + d.mood, 0) / data.length
    : 0;

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
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Mood Over Time</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="moodGradientPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="moodGradientNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
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
            ticks={[-5, -3, 0, 3, 5]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
          <ReferenceLine 
            y={avgMood} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5" 
            label={{ value: 'Avg', position: 'right', fill: 'hsl(var(--primary))' }}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#moodGradientPositive)"
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 text-xs mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-accent" />
          <span className="text-muted-foreground">Positive (0 to +5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-destructive" />
          <span className="text-muted-foreground">Negative (-5 to 0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-primary" style={{ borderTop: '2px dashed hsl(var(--primary))' }} />
          <span className="text-muted-foreground">Average: {avgMood.toFixed(1)}</span>
        </div>
      </div>
    </Card>
  );
};

export default MoodTrendsChart;
