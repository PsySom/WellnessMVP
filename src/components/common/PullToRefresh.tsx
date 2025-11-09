import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export const PullToRefresh = ({ 
  pullDistance, 
  isRefreshing, 
  threshold = 80 
}: PullToRefreshProps) => {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullDistance / threshold) * 360;

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50"
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold + 20)}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm',
          isRefreshing && 'bg-primary/20'
        )}
      >
        {isRefreshing ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-primary"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
