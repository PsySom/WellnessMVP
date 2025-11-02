import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface EnergyPatternsProps {
  entries: any[];
  period: string;
}

const EnergyPatterns = ({ entries, period }: EnergyPatternsProps) => {
  const data = entries
    .filter((e) => e.energy_level !== null)
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
        energy: entry.energy_level,
        hour: new Date(`${entry.entry_date}T${entry.entry_time}`).getHours(),
      };
    });

  if (data.length === 0) {
    return null;
  }

  // Calculate time of day patterns
  const timePatterns = data.reduce((acc: any, item) => {
    const timeSlot = 
      item.hour < 6 ? 'Night' :
      item.hour < 12 ? 'Morning' :
      item.hour < 18 ? 'Afternoon' : 'Evening';
    
    if (!acc[timeSlot]) {
      acc[timeSlot] = { sum: 0, count: 0 };
    }
    acc[timeSlot].sum += item.energy;
    acc[timeSlot].count += 1;
    return acc;
  }, {});

  const bestTime = Object.entries(timePatterns)
    .map(([time, data]: any) => ({ time, avg: data.sum / data.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Energy Patterns</h3>
      
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="energy"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            fill="url(#energyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {bestTime && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            ⚡ Highest energy typically in the <span className="font-semibold text-foreground">{bestTime.time}</span>
          </p>
        </div>
      )}
    </Card>
  );
};

export default EnergyPatterns;
