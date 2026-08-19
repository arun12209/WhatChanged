import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Inline, non-destructive error banner shown when a refresh fails but previously
 * loaded data is still on screen. Keeps stale data visible instead of replacing
 * the whole view with an error state.
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => (
  <div
    role="alert"
    className="flex items-start gap-2.5 p-3 mb-4 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-sm"
  >
    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
    <div className="flex-1 min-w-0">
      <span className="font-medium text-amber-800 dark:text-amber-200">
        Refresh failed — showing previously loaded data.
      </span>
      {message && (
        <span className="block mt-0.5 text-amber-700 dark:text-amber-300/90 break-words">{message}</span>
      )}
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        aria-label="Retry loading changes"
        className="flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-200 hover:underline flex-shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    )}
  </div>
);
