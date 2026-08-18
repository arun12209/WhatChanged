import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch,
  Bot,
  FileCode,
} from 'lucide-react';
import { ChangeEvent } from '../../domain/types';
import { getCategoryMeta } from '../../domain/categories';
import { formatFullDateTime } from '../../utils/date';
import { CategoryBadge, SeverityBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

interface EventDetailDrawerProps {
  event: ChangeEvent | null;
  onClose: () => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ event, onClose }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const catMeta = getCategoryMeta(event.category);
  const Icon = catMeta.icon;

  const handleCopyDetails = () => {
    const jsonStr = JSON.stringify(event, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-surface border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header with Salesforce top banner clearance */}
          <div className="pt-14 sm:pt-16 pb-5 px-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-surface">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5"
                style={{
                  backgroundColor: `${catMeta.dotColor}18`,
                  color: catMeta.dotColor,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CategoryBadge category={event.category} size="sm" />
                  <SeverityBadge severity={event.severity} size="sm" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 break-words leading-snug">
                  {event.title}
                </h2>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close change details"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </Button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Change Narrative Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Change Overview
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {event.description}
              </div>
            </div>

            {/* 2. Metadata Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Metadata Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Section</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {event.section || 'General'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Action Key</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {event.action || 'Unknown'}
                  </span>
                </div>
                {event.responsibleNamespace && (
                  <div className="p-3 rounded-lg bg-surface border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Namespace</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {event.responsibleNamespace}
                    </span>
                  </div>
                )}
                {event.metadata?.componentName && (
                  <div className="p-3 rounded-lg bg-surface border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Component</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {event.metadata.componentName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Changed by Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Changed By
              </h3>
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-sm border border-sky-200 dark:border-sky-800">
                    {event.actor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {event.actor.name}
                    </div>
                    {event.actor.username && (
                      <div className="text-xs text-slate-400">
                        {event.actor.username}
                      </div>
                    )}
                    {event.delegatedUser && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        Delegated login: {event.delegatedUser}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-slate-200/80 dark:border-slate-800 text-xs flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{formatFullDateTime(event.createdDate)}</span>
                <span className="text-slate-400">({event.relativeTime})</span>
              </div>
            </div>

            {/* 4. Raw SetupAuditTrail Information */}
            <div className="space-y-2">
              <button
                onClick={() => setShowRaw((prev) => !prev)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                <span>Raw Salesforce Audit Event</span>
                {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRaw && (
                <div className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-1 animate-in fade-in duration-150">
                  <div><span className="text-slate-500">Id:</span> {event.id}</div>
                  <div><span className="text-slate-500">Action:</span> {event.action}</div>
                  <div><span className="text-slate-500">Section:</span> {event.section}</div>
                  <div><span className="text-slate-500">Display:</span> {event.rawDisplay}</div>
                  <div><span className="text-slate-500">CreatedDate:</span> {event.createdDate}</div>
                  <div><span className="text-slate-500">CreatedById:</span> {event.actor.id}</div>
                </div>
              )}
            </div>

            {/* 5. Future Integrations (Cleanly reserved / Disabled) */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Integrated Actions (Future Roadmap)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  disabled
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed flex items-center gap-2 opacity-60"
                  title="Jira Issue creation will be available in future releases"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Jira</span>
                </button>
                <button
                  disabled
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed flex items-center gap-2 opacity-60"
                  title="Metadata diff comparison will be available in future releases"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Compare Diff</span>
                </button>
                <button
                  disabled
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed flex items-center gap-2 opacity-60"
                  title="Source repository viewer will be available in future releases"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>View Source</span>
                </button>
                <button
                  disabled
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed flex items-center gap-2 opacity-60"
                  title="AI Explain will be available in future releases"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyDetails}
              className="flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to clipboard' : 'Copy details'}</span>
            </Button>

            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
