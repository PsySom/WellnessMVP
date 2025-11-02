import { AppLayout } from '@/components/layout/AppLayout';

const Journal = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Journal</h1>
        <p className="text-muted-foreground">Your personal journal will appear here.</p>
      </div>
    </AppLayout>
  );
};

export default Journal;
