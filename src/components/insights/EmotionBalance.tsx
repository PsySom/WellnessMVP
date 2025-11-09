import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmotionBalanceProps {
  entries: any[];
}

const EmotionBalance = ({ entries }: EmotionBalanceProps) => {
  const { t } = useTranslation();
  let negative = 0;
  let neutral = 0;
  let positive = 0;

  entries.forEach((entry) => {
    entry.tracker_emotions?.forEach((emotion: any) => {
      const category = emotion.category?.toLowerCase();
      if (category === 'negative') negative++;
      else if (category === 'neutral') neutral++;
      else if (category === 'positive') positive++;
    });
  });

  const total = negative + neutral + positive;
  
  if (total === 0) {
    return null;
  }

  const data = [
    { name: 'Negative', value: negative, color: 'hsl(var(--destructive))' },
    { name: 'Neutral', value: neutral, color: 'hsl(var(--muted-foreground))' },
    { name: 'Positive', value: positive, color: 'hsl(var(--accent))' },
  ];

  const positiveRatio = (positive / total) * 100;
  const getTrend = () => {
    if (positiveRatio >= 60) return { icon: TrendingUp, text: t('insights.improving'), color: 'text-accent' };
    if (positiveRatio <= 40) return { icon: TrendingDown, text: t('insights.needsAttention'), color: 'text-destructive' };
    return { icon: Minus, text: t('insights.stable'), color: 'text-muted-foreground' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">{t('insights.emotionBalance')}</h3>
      
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
            </div>
            <div className="text-lg font-bold text-foreground">
              {Math.round((item.value / total) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">{item.name}</div>
          </div>
        ))}
      </div>

      <div className={`flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border ${trend.color}`}>
        <TrendIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{trend.text}</span>
      </div>
    </Card>
  );
};

export default EmotionBalance;
