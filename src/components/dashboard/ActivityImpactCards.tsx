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

// Цвета подобраны в соответствии с дизайн-системой.
// Используем явные HSL-значения, чтобы гарантировать корректное отображение в SVG.
const IMPACT_COLORS: Record<
  Activity['impact_type'],
  { active: string; light: string }
> = {
  restoring: {
    active: 'hsl(127 40% 62%)',
    light: 'hsl(127 40% 62% / 0.3)',
  },
  depleting: {
    active: 'hsl(0 72% 60%)',
    light: 'hsl(0 72% 60% / 0.25)',
  },
  neutral: {
    active: 'hsl(210 40% 60%)',
    light: 'hsl(210 40% 60% / 0.25)',
  },
  mixed: {
    active: 'hsl(31 85% 62%)',
    light: 'hsl(31 85% 62% / 0.25)',
  },
};

// Серый «пустой» круг, когда активностей этого типа нет
const MUTED_RING = 'hsl(215 16% 90%)';

const ActivityImpactCards = ({ activities }: ActivityImpactCardsProps) => {
  const { t } = useTranslation();
  const [animatedData, setAnimatedData] = useState<
    Record<Activity['impact_type'], { total: number; completed: number; percentage: number }>
  >({} as any);

  const impactTypes: { key: Activity['impact_type']; label: string }[] = [
    {
      key: 'restoring',
      label: t('dashboard.impactCards.restoring'),
    },
    {
      key: 'depleting',
      label: t('dashboard.impactCards.depleting'),
    },
    {
      key: 'neutral',
      label: t('dashboard.impactCards.neutral'),
    },
    {
      key: 'mixed',
      label: t('dashboard.impactCards.mixed'),
    },
  ];

  const calculateStats = (impactType: Activity['impact_type']) => {
    const typeActivities = activities.filter((a) => a.impact_type === impactType);
    const total = typeActivities.length;
    const completed = typeActivities.filter((a) => a.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  };

  useEffect(() => {
    const newData = {} as Record<
      Activity['impact_type'],
      { total: number; completed: number; percentage: number }
    >;

    (['restoring', 'depleting', 'neutral', 'mixed'] as Activity['impact_type'][]).forEach(
      (key) => {
        newData[key] = calculateStats(key);
      },
    );

    const timer = setTimeout(() => {
      setAnimatedData(newData);
    }, 100);

    return () => clearTimeout(timer);
  }, [activities]);

  return (
    <div className="grid grid-cols-2 gap-md">
      {impactTypes.map((type, index) => {
        const stats =
          animatedData[type.key] || ({ total: 0, completed: 0, percentage: 0 } as const);
        const hasActivities = stats.total > 0;
        const hasCompleted = stats.completed > 0;

        const colors = IMPACT_COLORS[type.key];

        // Логика заливки:
        // 1) Нет активностей этого типа → серый круг
        // 2) Есть, но ничего не выполнено → весь круг в светлом цвете типа
        // 3) Есть выполненные → часть круга насыщенным цветом, остальное светлым
        const chartData = !hasActivities
          ? [{ name: 'empty', value: 1 }]
          : [
              { name: 'completed', value: stats.completed },
              { name: 'remaining', value: stats.total - stats.completed },
            ];

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
                    {!hasActivities && <Cell fill={MUTED_RING} />}

                    {hasActivities && !hasCompleted && (
                      // только светлый цвет типа, без насыщенной части
                      <>
                        <Cell fill={colors.light} />
                        <Cell fill={colors.light} />
                      </>
                    )}

                    {hasActivities && hasCompleted && (
                      // часть круга насыщенная, остальное светлое
                      <>
                        <Cell fill={colors.active} />
                        <Cell fill={colors.light} />
                      </>
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
                      color: hasCompleted ? colors.active : colors.light,
                      transform: `scale(${stats.percentage > 0 ? 1 : 0.9})`,
                      opacity: stats.percentage > 0 ? 1 : 0.8,
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
