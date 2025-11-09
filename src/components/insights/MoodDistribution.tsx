import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

interface MoodDistributionProps {
  entries: any[];
}

const MoodDistribution = ({ entries }: MoodDistributionProps) => {
  const { t } = useTranslation();
  const moodEntries = entries.filter((e) => e.mood_score !== null);
  
  const distribution = {
    'Very Bad': moodEntries.filter((e) => e.mood_score <= -3).length,
    'Bad': moodEntries.filter((e) => e.mood_score > -3 && e.mood_score < -1).length,
    'Neutral': moodEntries.filter((e) => e.mood_score >= -1 && e.mood_score <= 1).length,
    'Good': moodEntries.filter((e) => e.mood_score > 1 && e.mood_score < 3).length,
    'Very Good': moodEntries.filter((e) => e.mood_score >= 3).length,
  };

  const total = moodEntries.length;
  const data = Object.entries(distribution).map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const colors = {
    'Very Bad': 'hsl(var(--destructive))',
    'Bad': 'hsl(31 88% 68%)',
    'Neutral': 'hsl(var(--muted-foreground))',
    'Good': 'hsl(204 55% 63%)',
    'Very Good': 'hsl(var(--accent))',
  };

  if (total === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">{t('insights.moodDistribution')}</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="category" 
            width={80}
            style={{ fontSize: '12px' }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={colors[entry.category as keyof typeof colors]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-5 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.category} className="text-center">
            <div className="text-lg font-bold text-foreground">{item.percentage}%</div>
            <div className="text-xs text-muted-foreground">{item.category}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MoodDistribution;
