import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Clock,
  BarChart2,
  Users,
  Shield,
  Cpu,
  Lock,
  RotateCw,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import { ViewTab, ChangeCategory } from '../../domain/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ViewTab) => void;
  onApplyFilter: (category?: ChangeCategory | 'ALL', search?: string) => void;
  onRefresh: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onApplyFilter,
  onRefresh,
  onToggleTheme,
  isDark,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    {
      id: 'nav-overview',
      title: 'Go to Overview',
      subtitle: 'Dashboard, KPIs and daily operational health',
      icon: LayoutDashboard,
      action: () => {
        onNavigate('overview');
        onClose();
      },
    },
    {
      id: 'nav-timeline',
      title: 'Go to Timeline',
      subtitle: 'Complete chronological feed of Salesforce changes',
      icon: Clock,
      action: () => {
        onNavigate('timeline');
        onClose();
      },
    },
    {
      id: 'nav-insights',
      title: 'Go to Insights',
      subtitle: 'Visual analytics, trends and busy hours',
      icon: BarChart2,
      action: () => {
        onNavigate('insights');
        onClose();
      },
    },
    {
      id: 'nav-people',
      title: 'Go to People',
      subtitle: 'Top active contributors & engineers',
      icon: Users,
      action: () => {
        onNavigate('people');
        onClose();
      },
    },
    {
      id: 'filter-access',
      title: "Show today's Access changes",
      subtitle: 'Permission sets, profiles, and user permissions',
      icon: Lock,
      action: () => {
        onNavigate('timeline');
        onApplyFilter('ACCESS');
        onClose();
      },
    },
    {
      id: 'filter-automation',
      title: "Show today's Automation changes",
      subtitle: 'Flow activations, process builders & workflows',
      icon: Cpu,
      action: () => {
        onNavigate('timeline');
        onApplyFilter('AUTOMATION');
        onClose();
      },
    },
    {
      id: 'filter-security',
      title: "Show today's Security & Sharing changes",
      subtitle: 'Session settings, auth providers & sharing rules',
      icon: Shield,
      action: () => {
        onNavigate('timeline');
        onApplyFilter('SECURITY');
        onClose();
      },
    },
    {
      id: 'action-refresh',
      title: 'Refresh change history',
      subtitle: 'Query latest SetupAuditTrail logs',
      icon: RotateCw,
      action: () => {
        onRefresh();
        onClose();
      },
    },
    {
      id: 'action-theme',
      title: isDark ? 'Switch to Light mode' : 'Switch to Dark mode',
      subtitle: 'Toggle dashboard color theme',
      icon: isDark ? Sun : Moon,
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'nav-about',
      title: 'About WhatChanged',
      subtitle: 'Architecture, security model and diagnostic info',
      icon: Info,
      action: () => {
        onNavigate('about');
        onClose();
      },
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered.length > 0) {
                filtered[0].action();
              }
            }}
            autoFocus
            className="w-full py-4 text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching commands or navigation paths found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-950/60 group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  {idx === 0 && (
                    <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-700">
                      ↵
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Navigation &amp; Quick Actions</span>
          <span>Tip: Press <strong>/</strong> anywhere to search</span>
        </div>
      </div>
    </div>
  );
};
