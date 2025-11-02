import { Card } from '@/components/ui/card';
import { TrackerEntry } from '@/pages/TrackerHistory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SatisfactionMetricsProps {
  entries: TrackerEntry[];
}

const SatisfactionMetrics = ({ entries }: SatisfactionMetricsProps) => {
  const processValues = entries
    .filter((e) => e.process_satisfaction !== null)
    .map((e) => e.process_satisfaction!);
  
  const resultValues = entries
    .filter((e) => e.result_satisfaction !== null)
    .map((e) => e.result_satisfaction!);

  const processAvg = processValues.length > 0
    ? (processValues.reduce((a, b) => a + b, 0) / processValues.length).toFixed(1)
    : '0';

  const resultAvg = resultValues.length > 0
    ? (resultValues.reduce((a, b) => a + b, 0) / resultValues.length).toFixed(1)
    : '0';

  const data = [
    { name: 'Process', value: parseFloat(processAvg) },
    { name: 'Result', value: parseFloat(resultAvg) },
  ];

  if (processValues.length === 0 && resultValues.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Satisfaction Metrics</h3>
        <p className="text-muted-foreground text-center py-8">No satisfaction data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Average Satisfaction</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Process Satisfaction */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Process</p>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{processAvg}</p>
            <p className="text-xs text-muted-foreground">/10</p>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={[data[0]]}>
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <YAxis domain={[0, 10]} hide />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Result Satisfaction */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Result</p>
          <div className="text-center">
            <p className="text-4xl font-bold text-secondary">{resultAvg}</p>
            <p className="text-xs text-muted-foreground">/10</p>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={[data[1]]}>
              <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              <YAxis domain={[0, 10]} hide />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default SatisfactionMetrics;
