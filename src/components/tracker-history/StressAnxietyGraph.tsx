import { Card } from '@/components/ui/card';
import { TrackerEntry, Period } from '@/pages/TrackerHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface StressAnxietyGraphProps {
  entries: TrackerEntry[];
  period: Period;
}

const StressAnxietyGraph = ({ entries, period }: StressAnxietyGraphProps) => {
  const data = entries
    .filter((e) => e.stress_level !== null || e.anxiety_level !== null)
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
        stress: entry.stress_level,
        anxiety: entry.anxiety_level,
      };
    });

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Stress & Anxiety Levels</h3>
        <p className="text-muted-foreground text-center py-8">No stress/anxiety data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Stress & Anxiety Levels</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            domain={[0, 10]} 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="stress"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--destructive))', r: 3 }}
            activeDot={{ r: 5 }}
            name="Stress"
          />
          <Line
            type="monotone"
            dataKey="anxiety"
            stroke="hsl(var(--warning))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--warning))', r: 3 }}
            activeDot={{ r: 5 }}
            name="Anxiety"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 text-xs pt-2 border-t">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded bg-accent" />
            <span className="text-muted-foreground">Normal (0-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded bg-warning" />
            <span className="text-muted-foreground">Elevated (4-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-8 rounded bg-destructive" />
            <span className="text-muted-foreground">High (8-10)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StressAnxietyGraph;
