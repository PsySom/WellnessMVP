import { AppLayout } from '@/components/layout/AppLayout';

const Insights = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Insights</h1>
        <p className="text-muted-foreground">Your personalized insights will appear here.</p>
      </div>
    </AppLayout>
  );
};

export default Insights;
