import React from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from '../common/Button';

interface HeroProps {
  title?: string;
  subtitle?: string;
  lastRefreshedAt?: string;
  secondsAgo: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  title = 'What changed today?',
  subtitle = 'A live view of configuration, automation, access and platform changes across your Salesforce org.',
  secondsAgo,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <div className="py-6 border-b border-slate-200/80 dark:border-slate-800/80 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {secondsAgo < 5 ? 'Last refreshed just now' : `Last refreshed ${secondsAgo} seconds ago`}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
