import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActivityBreakdownProps {
  activities: any[];
}

const ActivityBreakdown = ({ activities }: ActivityBreakdownProps) => {
  const { t } = useTranslation();
  
  if (activities.length === 0) {
    return null;
  }

  // Count by category
  const categoryCounts: { [key: string]: number } = {};
  activities.forEach(activity => {
    const category = activity.category || 'other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const categoryColors: { [key: string]: string } = {
    social: 'hsl(var(--primary))',
    physical: 'hsl(var(--secondary))',
    creative: 'hsl(var(--accent))',
    learning: 'hsl(31 88% 68%)',
    work: 'hsl(var(--muted-foreground))',
    rest: 'hsl(204 55% 63%)',
    practice: 'hsl(255 31% 64%)',
    other: 'hsl(var(--border))',
  };

  const data = Object.entries(categoryCounts).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    color: categoryColors[category] || 'hsl(var(--muted))',
  }));

  // Count by impact type with priority stars
  const impactCounts: { [key: string]: number } = {};
  let totalMinutes: { [key: string]: number } = {};
  let totalStars: { [key: string]: number } = {};
  
  activities.forEach(activity => {
    const impact = activity.impact_type || 'neutral';
    impactCounts[impact] = (impactCounts[impact] || 0) + 1;
    totalMinutes[impact] = (totalMinutes[impact] || 0) + (activity.duration_minutes || 0);
    totalStars[impact] = (totalStars[impact] || 0) + (activity.priority || 3);
  });

  // Calculate overall priority statistics
  const totalActivitiesCount = activities.length;
  const overallStars = activities.reduce((sum, a) => sum + (a.priority || 3), 0);
  const avgPriority = totalActivitiesCount > 0 ? (overallStars / totalActivitiesCount).toFixed(1) : '0';

  const impactColors: { [key: string]: string } = {
    restoring: 'hsl(var(--accent))',
    depleting: 'hsl(var(--destructive))',
    neutral: 'hsl(var(--muted-foreground))',
    mixed: 'hsl(31 88% 68%)',
  };

  const impactData = Object.entries(impactCounts).map(([impact, count]) => ({
    name: impact.charAt(0).toUpperCase() + impact.slice(1),
    value: count,
    minutes: totalMinutes[impact] || 0,
    stars: totalStars[impact] || 0,
    avgStars: count > 0 ? (totalStars[impact] / count).toFixed(1) : '0',
    color: impactColors[impact] || 'hsl(var(--muted))',
  }));

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Activities by Category</h3>
        
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Activity Impact</h3>
        
        {/* Priority summary */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.round(parseFloat(avgPriority)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {t('insights.avgPriority', 'Avg priority')}: <span className="font-semibold text-foreground">{avgPriority}</span>
          </span>
          <span className="text-sm text-muted-foreground ml-auto">
            {t('insights.totalStars', 'Total')}: <span className="font-semibold text-foreground">{overallStars}⭐</span>
          </span>
        </div>
        
        <div className="space-y-3">
          {impactData.map((item) => {
            const totalActivities = impactData.reduce((sum, d) => sum + d.value, 0);
            const percentage = (item.value / totalActivities) * 100;
            const hours = Math.floor((item.minutes || 0) / 60);
            const mins = (item.minutes || 0) % 60;
            
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      ({item.stars}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ~ {item.avgStars}/act)
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {hours > 0 && `${hours}h `}{mins}m
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ActivityBreakdown;
