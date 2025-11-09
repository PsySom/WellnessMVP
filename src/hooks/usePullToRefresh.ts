import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from './use-mobile';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) => {
  const isMobile = useIsMobile();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let startY = 0;
    let currentY = 0;
    let pulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start if scrolled to top
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
        touchStartY.current = startY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling || isRefreshing) return;

      currentY = e.touches[0].clientY;
      const delta = currentY - startY;

      if (delta > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        const distance = Math.min(delta / resistance, threshold * 1.5);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling) return;
      pulling = false;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(threshold);

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, threshold, resistance, pullDistance, isRefreshing, onRefresh]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    shouldShowIndicator: pullDistance > 0,
  };
};
