import { Card } from '@/components/ui/card';
import { TrackerEntry, Period } from '@/pages/TrackerHistory';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface EnergyGraphProps {
  entries: TrackerEntry[];
  period: Period;
}

const EnergyGraph = ({ entries, period }: EnergyGraphProps) => {
  const data = entries
    .filter((e) => e.energy_level !== null)
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
        energy: entry.energy_level,
      };
    });

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Energy Levels</h3>
        <p className="text-muted-foreground text-center py-8">No energy data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Energy Levels</h3>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
              <stop offset="50%" stopColor="hsl(var(--muted))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
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
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="energy"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#energyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>😴 Very tired</span>
        <span>😐 Neutral</span>
        <span>⚡ Energetic</span>
      </div>
    </Card>
  );
};

export default EnergyGraph;
