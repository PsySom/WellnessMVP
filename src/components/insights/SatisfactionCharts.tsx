import { Card } from '@/components/ui/card';

interface SatisfactionChartsProps {
  entries: any[];
}

const SatisfactionCharts = ({ entries }: SatisfactionChartsProps) => {
  const processScores = entries.filter((e) => e.process_satisfaction !== null);
  const resultScores = entries.filter((e) => e.result_satisfaction !== null);

  const avgProcess = processScores.length > 0
    ? processScores.reduce((sum, e) => sum + e.process_satisfaction, 0) / processScores.length
    : 0;

  const avgResult = resultScores.length > 0
    ? resultScores.reduce((sum, e) => sum + e.result_satisfaction, 0) / resultScores.length
    : 0;

  if (processScores.length === 0 && resultScores.length === 0) {
    return null;
  }

  const CircleProgress = ({ value, label }: { value: number; label: string }) => {
    const percentage = (value / 10) * 100;
    const strokeDasharray = `${percentage * 2.51} 251`;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{value.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/ 10</span>
          </div>
        </div>
        <p className="text-sm font-medium text-foreground mt-3">{label}</p>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-6">Satisfaction</h3>
      
      <div className="flex justify-around items-center">
        {processScores.length > 0 && (
          <CircleProgress value={avgProcess} label="Process" />
        )}
        {resultScores.length > 0 && (
          <CircleProgress value={avgResult} label="Result" />
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Average satisfaction scores based on your tracking
        </p>
      </div>
    </Card>
  );
};

export default SatisfactionCharts;
