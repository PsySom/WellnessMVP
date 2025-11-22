import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Activity {
  impact_type: 'restoring' | 'depleting' | 'neutral' | 'mixed';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

interface ActivityImpactCardsProps {
  activities: Activity[];
}

const ActivityImpactCards = ({ activities }: ActivityImpactCardsProps) => {
  const { t } = useTranslation();

  const impactTypes = [
    { 
      key: 'restoring' as const, 
      label: t('dashboard.impactCards.restoring'),
      activeColor: 'hsl(var(--chart-1))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--chart-1) / 0.3)'
    },
    { 
      key: 'depleting' as const, 
      label: t('dashboard.impactCards.depleting'),
      activeColor: 'hsl(var(--chart-2))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--chart-2) / 0.3)'
    },
    { 
      key: 'neutral' as const, 
      label: t('dashboard.impactCards.neutral'),
      activeColor: 'hsl(var(--chart-3))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--chart-3) / 0.3)'
    },
    { 
      key: 'mixed' as const, 
      label: t('dashboard.impactCards.mixed'),
      activeColor: 'hsl(var(--chart-4))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--chart-4) / 0.3)'
    },
  ];

  const calculateStats = (impactType: 'restoring' | 'depleting' | 'neutral' | 'mixed') => {
    const typeActivities = activities.filter(a => a.impact_type === impactType);
    const total = typeActivities.length;
    const completed = typeActivities.filter(a => a.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  return (
    <div className="grid grid-cols-2 gap-md">
      {impactTypes.map((type, index) => {
        const stats = calculateStats(type.key);
        const hasActivities = stats.total > 0;
        const hasCompleted = stats.completed > 0;
        
        const chartData = hasActivities
          ? [
              { name: 'completed', value: stats.completed },
              { name: 'remaining', value: stats.total - stats.completed }
            ]
          : [{ name: 'empty', value: 1 }];

        const fillColor = !hasActivities 
          ? type.inactiveColor 
          : hasCompleted 
            ? type.activeColor 
            : type.lightColor;

        return (
          <Card 
            key={type.key}
            className="p-md space-y-sm hover:shadow-lg medium-transition ease-out-expo hover:scale-[1.02] animate-fade-in-scale"
            style={{ animationDelay: `calc(${index} * var(--animation-delay-sm))` }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={35}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {hasActivities ? (
                      <>
                        <Cell fill={hasCompleted ? type.activeColor : type.lightColor} />
                        <Cell fill={type.inactiveColor} />
                      </>
                    ) : (
                      <Cell fill={type.inactiveColor} />
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="text-center mt-sm">
                <p className="text-xs text-muted-foreground">{type.label}</p>
                {hasActivities && (
                  <p className="text-lg font-bold mt-xs" style={{ color: hasCompleted ? type.activeColor : type.lightColor }}>
                    {stats.percentage}%
                  </p>
                )}
                {!hasActivities && (
                  <p className="text-sm text-muted-foreground mt-xs">—</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ActivityImpactCards;
