import React from 'react';
import { ActivityItem } from './ActivityItem';

interface DaySectionProps {
  title: string;
  timeRange?: string;
  activities: any[];
  onUpdate: () => void;
}

export const DaySection = ({ title, timeRange, activities, onUpdate }: DaySectionProps) => {
  if (activities.length === 0) return null;

  // Sort activities by start_time
  const sortedActivities = [...activities].sort((a, b) => {
    if (!a.start_time && !b.start_time) return 0;
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return a.start_time.localeCompare(b.start_time);
  });

  const completedCount = sortedActivities.filter(a => a.status === 'completed').length;
  const totalCount = sortedActivities.length;

  return (
    <div className="mb-lg">
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-sm">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {timeRange && (
            <span className="text-xs text-muted-foreground">({timeRange})</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="space-y-sm">
        {sortedActivities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};
