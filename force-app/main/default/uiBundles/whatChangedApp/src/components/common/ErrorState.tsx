import React from 'react';
import { ShieldX, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  isForbidden?: boolean;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  isForbidden = false,
  onRetry,
}) => {
  if (isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 max-w-lg mx-auto my-12">
        <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
          <ShieldX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          You don't have access to WhatChanged
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Access to Salesforce Change Intelligence requires the <strong>WhatChanged_Access</strong> permission set or Setup audit review rights.
          Please contact your Salesforce administrator if you believe you should have access.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-surface max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title || 'Unable to load changes'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {message || "We couldn't retrieve Salesforce change history right now."}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
