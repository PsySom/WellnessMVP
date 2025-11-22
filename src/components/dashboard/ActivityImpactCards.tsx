import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface Activity {
  impact_type: 'restoring' | 'depleting' | 'neutral' | 'mixed';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

interface ActivityImpactCardsProps {
  activities: Activity[];
}

const ActivityImpactCards = ({ activities }: ActivityImpactCardsProps) => {
  const { t } = useTranslation();
  const [animatedData, setAnimatedData] = useState<Record<string, { total: number; completed: number; percentage: number }>>({});

  const impactTypes = [
    { 
      key: 'restoring' as const, 
      label: t('dashboard.impactCards.restoring'),
      activeColor: 'hsl(var(--accent))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--accent) / 0.3)'
    },
    { 
      key: 'depleting' as const, 
      label: t('dashboard.impactCards.depleting'),
      activeColor: 'hsl(var(--destructive))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--destructive) / 0.3)'
    },
    { 
      key: 'neutral' as const, 
      label: t('dashboard.impactCards.neutral'),
      activeColor: 'hsl(var(--secondary))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--secondary) / 0.3)'
    },
    { 
      key: 'mixed' as const, 
      label: t('dashboard.impactCards.mixed'),
      activeColor: 'hsl(var(--warning))',
      inactiveColor: 'hsl(var(--muted))',
      lightColor: 'hsl(var(--warning) / 0.3)'
    },
  ];

  const calculateStats = (impactType: 'restoring' | 'depleting' | 'neutral' | 'mixed') => {
    const typeActivities = activities.filter(a => a.impact_type === impactType);
    const total = typeActivities.length;
    const completed = typeActivities.filter(a => a.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  useEffect(() => {
    // Анимация появления данных
    const newData: Record<string, { total: number; completed: number; percentage: number }> = {};
    impactTypes.forEach((type) => {
      newData[type.key] = calculateStats(type.key);
    });
    
    // Задержка для плавной анимации
    const timer = setTimeout(() => {
      setAnimatedData(newData);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activities]);

  return (
    <div className="grid grid-cols-2 gap-md">
      {impactTypes.map((type, index) => {
        const stats = animatedData[type.key] || { total: 0, completed: 0, percentage: 0 };
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
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {hasActivities ? (
                      <>
                        <Cell fill={type.activeColor} />
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
                  <p 
                    className="text-lg font-bold mt-xs transition-all duration-500 ease-out" 
                    style={{ 
                      color: hasCompleted ? type.activeColor : type.lightColor,
                      transform: `scale(${stats.percentage > 0 ? 1 : 0.8})`,
                      opacity: stats.percentage > 0 ? 1 : 0.6
                    }}
                  >
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
