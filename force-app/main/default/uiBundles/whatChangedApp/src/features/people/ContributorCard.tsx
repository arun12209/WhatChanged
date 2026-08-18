import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Contributor } from '../../domain/types';
import { CategoryBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';

interface ContributorCardProps {
  contributor: Contributor;
  onClick: (contributor: Contributor) => void;
}

export const ContributorCard: React.FC<ContributorCardProps> = ({ contributor, onClick }) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(contributor)}
      className="p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-sm border border-sky-200 dark:border-sky-800 flex-shrink-0 group-hover:scale-105 transition-transform">
            {contributor.actorName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {contributor.actorName}
            </h3>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>Last active {contributor.lastActivityRelative}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {contributor.totalChanges}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">changes</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Primary Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          {contributor.primaryCategories.map((cat) => (
            <CategoryBadge key={cat} category={cat} size="sm" />
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
          <span>View timeline</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
};
