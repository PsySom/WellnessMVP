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

  const completedCount = activities.filter(a => a.status === 'completed').length;
  const totalCount = activities.length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {timeRange && (
            <span className="text-xs text-muted-foreground">({timeRange})</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => (
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
