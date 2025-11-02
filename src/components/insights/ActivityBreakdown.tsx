import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ActivityBreakdownProps {
  activities: any[];
}

const ActivityBreakdown = ({ activities }: ActivityBreakdownProps) => {
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

  // Count by impact type
  const impactCounts: { [key: string]: number } = {};
  let totalMinutes: { [key: string]: number } = {};
  
  activities.forEach(activity => {
    const impact = activity.impact_type || 'neutral';
    impactCounts[impact] = (impactCounts[impact] || 0) + 1;
    totalMinutes[impact] = (totalMinutes[impact] || 0) + (activity.duration_minutes || 0);
  });

  const impactColors: { [key: string]: string } = {
    restorative: 'hsl(var(--accent))',
    draining: 'hsl(var(--destructive))',
    neutral: 'hsl(var(--muted-foreground))',
    mixed: 'hsl(31 88% 68%)',
  };

  const impactData = Object.entries(impactCounts).map(([impact, count]) => ({
    name: impact.charAt(0).toUpperCase() + impact.slice(1),
    value: count,
    minutes: totalMinutes[impact] || 0,
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
        
        <div className="space-y-3">
          {impactData.map((item) => {
            const totalActivities = impactData.reduce((sum, d) => sum + d.value, 0);
            const percentage = (item.value / totalActivities) * 100;
            const hours = Math.floor((item.minutes || 0) / 60);
            const mins = (item.minutes || 0) % 60;
            
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.name}</span>
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
