import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StressAnxietyChartProps {
  entries: any[];
  period: string;
}

const StressAnxietyChart = ({ entries, period }: StressAnxietyChartProps) => {
  const navigate = useNavigate();
  
  const data = entries
    .filter((e) => e.stress_level !== null || e.anxiety_level !== null)
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
        stress: entry.stress_level,
        anxiety: entry.anxiety_level,
      };
    });

  const avgStress = data.filter(d => d.stress !== null).reduce((sum, d) => sum + (d.stress || 0), 0) / data.length || 0;
  const avgAnxiety = data.filter(d => d.anxiety !== null).reduce((sum, d) => sum + (d.anxiety || 0), 0) / data.length || 0;
  
  const highStressCount = data.filter(d => (d.stress || 0) >= 8).length;
  const highAnxietyCount = data.filter(d => (d.anxiety || 0) >= 8).length;
  const hasHighLevels = highStressCount > 0 || highAnxietyCount > 0;

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Stress & Anxiety Levels</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(31 88% 68%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(31 88% 68%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="anxietyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(255 31% 64%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(255 31% 64%)" stopOpacity={0} />
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
              ticks={[0, 3, 7, 10]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="stress"
              stroke="hsl(31 88% 68%)"
              strokeWidth={2}
              fill="url(#stressGradient)"
              name="Stress"
            />
            <Area
              type="monotone"
              dataKey="anxiety"
              stroke="hsl(255 31% 64%)"
              strokeWidth={2}
              fill="url(#anxietyGradient)"
              name="Anxiety"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border text-sm">
          <div className="text-center">
            <div className="text-muted-foreground mb-1">Normal</div>
            <div className="text-foreground font-medium">0-3</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground mb-1">Elevated</div>
            <div className="text-foreground font-medium">4-7</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground mb-1">High</div>
            <div className="text-foreground font-medium">8-10</div>
          </div>
        </div>
      </Card>

      {hasHighLevels && (
        <Card className="p-4 bg-destructive/5 border-destructive/20">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-foreground">High levels detected</p>
              <p className="text-sm text-muted-foreground">
                {highStressCount > 0 && `High stress detected ${highStressCount} times. `}
                {highAnxietyCount > 0 && `High anxiety detected ${highAnxietyCount} times. `}
                Consider trying relaxation exercises.
              </p>
              <Button 
                size="sm" 
                onClick={() => navigate('/exercises')}
                className="mt-2"
              >
                View Exercises
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StressAnxietyChart;
