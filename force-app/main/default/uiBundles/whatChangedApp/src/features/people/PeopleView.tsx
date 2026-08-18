import React from 'react';
import { Users, RotateCw } from 'lucide-react';
import { Contributor } from '../../domain/types';
import { ContributorCard } from './ContributorCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

interface PeopleViewProps {
  contributors: Contributor[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onContributorClick: (contributor: Contributor) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  contributors,
  isLoading,
  error,
  onRefresh,
  onContributorClick,
}) => {
  if (error) {
    const isForbidden = (error as any).code === 'FORBIDDEN' || (error as any).statusCode === 403;
    return <ErrorState isForbidden={isForbidden} onRetry={onRefresh} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>Active Contributors</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Engineers, admins, and service accounts making modifications across Salesforce
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isLoading}
          className="flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh contributors</span>
        </Button>
      </div>

      {/* Grid of Contributors */}
      {contributors.length === 0 && !isLoading ? (
        <EmptyState
          title="No contributor activity"
          description="No recent user setup changes were detected in the evaluated period."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contributors.map((contrib) => (
            <ContributorCard
              key={contrib.actorName}
              contributor={contrib}
              onClick={onContributorClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
