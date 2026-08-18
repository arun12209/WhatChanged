import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { ChangeStory, ChangeEvent } from '../../domain/types';
import { CategoryBadge, SeverityBadge } from '../../components/common/Badge';
import { HighlightText } from '../../components/common/HighlightText';

interface ChangeStoryCardProps {
  story: ChangeStory;
  searchQuery?: string;
  onEventClick: (event: ChangeEvent) => void;
}

export const ChangeStoryCard: React.FC<ChangeStoryCardProps> = ({ story, searchQuery, onEventClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-gradient-to-r from-sky-50/40 via-surface to-surface dark:from-sky-950/20 shadow-xs mb-3">
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                Change Story
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                <HighlightText text={story.title} query={searchQuery} />
              </h4>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                <HighlightText text={story.actorName} query={searchQuery} />
              </span>
              <span>·</span>
              <span>{story.timeSpanFormatted}</span>
              <span>·</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                {story.changeCount} related changes
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CategoryBadge category={story.primaryCategory} size="sm" />
          <SeverityBadge severity={story.maxSeverity} size="sm" />
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded sub-events */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2 pl-4 animate-in fade-in duration-150">
          {story.relatedEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(evt);
              }}
              className="p-2.5 rounded-lg bg-surface border border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-slate-400 tabular-nums">{evt.formattedTime}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  <HighlightText text={evt.title} query={searchQuery} />
                </span>
                <span className="text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                  — <HighlightText text={evt.description} query={searchQuery} />
                </span>
              </div>
              <SeverityBadge severity={evt.severity} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
