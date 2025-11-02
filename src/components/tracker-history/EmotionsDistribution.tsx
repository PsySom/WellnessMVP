import { Card } from '@/components/ui/card';
import { TrackerEntry } from '@/pages/TrackerHistory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EmotionsDistributionProps {
  entries: TrackerEntry[];
}

const EmotionsDistribution = ({ entries }: EmotionsDistributionProps) => {
  // Aggregate emotions by category
  const emotionCounts = {
    negative: 0,
    neutral: 0,
    positive: 0,
  };

  entries.forEach((entry) => {
    if (entry.emotions) {
      entry.emotions.forEach((emotion) => {
        const category = emotion.category as keyof typeof emotionCounts;
        if (category in emotionCounts) {
          emotionCounts[category]++;
        }
      });
    }
  });

  const data = [
    {
      name: 'Emotions',
      negative: emotionCounts.negative,
      neutral: emotionCounts.neutral,
      positive: emotionCounts.positive,
    },
  ];

  const total = emotionCounts.negative + emotionCounts.neutral + emotionCounts.positive;

  if (total === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Emotions Distribution</h3>
        <p className="text-muted-foreground text-center py-8">No emotion data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Emotions Distribution</h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Bar dataKey="negative" stackId="a" fill="hsl(var(--destructive))" name="Negative" />
          <Bar dataKey="neutral" stackId="a" fill="hsl(var(--muted))" name="Neutral" />
          <Bar dataKey="positive" stackId="a" fill="hsl(var(--accent))" name="Positive" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold text-destructive">{emotionCounts.negative}</p>
          <p className="text-xs text-muted-foreground">Negative</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">{emotionCounts.neutral}</p>
          <p className="text-xs text-muted-foreground">Neutral</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{emotionCounts.positive}</p>
          <p className="text-xs text-muted-foreground">Positive</p>
        </div>
      </div>
    </Card>
  );
};

export default EmotionsDistribution;
