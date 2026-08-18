import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Command,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ViewTab } from '../../domain/types';

interface UserMenuProps {
  environment: string;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenCommandPalette: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  environment,
  onNavigateTab,
  onOpenCommandPalette,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isDemo = environment.toLowerCase().includes('demo');

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:ring-2 hover:ring-sky-500/50 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        AK
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Header */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-10 h-10 rounded-full bg-sky-600 dark:bg-sky-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-xs">
              AK
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                Arun Kumar
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                arun.kumar@enterprise.org
              </div>
              <div className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>System Administrator</span>
              </div>
            </div>
          </div>

          {/* Org & Context Info */}
          <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Environment</span>
              <span className="font-semibold flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDemo ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                {environment}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Salesforce API</span>
              <span className="font-mono font-semibold text-[11px]">v66.0 GA</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Permission Set</span>
              <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                WhatChanged_User
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCommandPalette();
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 group"
            >
              <div className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                <span>Command Palette</span>
              </div>
              <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateTab('about');
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 group"
            >
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                <span>About &amp; Diagnostics</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
