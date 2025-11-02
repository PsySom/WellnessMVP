import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-md mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
