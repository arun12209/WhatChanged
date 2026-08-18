import React from 'react';
import {
  RotateCw,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { ViewTab } from '../../domain/types';
import { Button } from '../common/Button';
import { BrandLogo } from '../common/BrandLogo';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  environment: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  secondsAgo: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  environment,
  isRefreshing,
  onRefresh,
  secondsAgo,
  isDark,
  onToggleTheme,
  onOpenCommandPalette,
}) => {
  const tabs: { id: ViewTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'insights', label: 'Insights' },
    { id: 'people', label: 'People' },
    { id: 'about', label: 'About' },
  ];

  const getEnvBadge = () => {
    const isSandbox = environment.toLowerCase().includes('sandbox');
    const isDemo = environment.toLowerCase().includes('demo');

    if (isDemo) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Demo Data
        </span>
      );
    }

    if (isSandbox) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          Sandbox
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Production
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-surface/90 dark:bg-surface/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => onTabChange('overview')}>
              <BrandLogo size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-[17px] leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    WhatChanged
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                  Salesforce Change Intelligence
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search Shortcut */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70 rounded-lg transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search changes...</span>
              <kbd className="font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1 text-[10px]">
                ⌘K
              </kbd>
            </button>

            {/* Environment Badge */}
            {getEnvBadge()}

            {/* Refresh */}
            <div className="hidden lg:flex items-center text-xs text-slate-400 dark:text-slate-500 tabular-nums">
              {secondsAgo < 5 ? 'Just updated' : `${secondsAgo}s ago`}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              isLoading={isRefreshing}
              title="Refresh change history"
              className="text-slate-600 dark:text-slate-300"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="text-slate-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
              AK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
