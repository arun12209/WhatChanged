import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800 rounded-md ${className}`}
    />
  );
};

export const KpiCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
};

export const TimelineRowSkeleton: React.FC = () => {
  return (
    <div className="bg-surface border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-4">
      <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};
