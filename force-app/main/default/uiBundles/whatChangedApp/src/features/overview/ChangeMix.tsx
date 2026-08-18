import React from 'react';
import { CategoryDistribution, ChangeCategory } from '../../domain/types';
import { getCategoryMeta } from '../../domain/categories';
import { Card } from '../../components/common/Card';

interface ChangeMixProps {
  data: CategoryDistribution[];
  onCategoryClick: (category: ChangeCategory) => void;
}

export const ChangeMix: React.FC<ChangeMixProps> = ({ data, onCategoryClick }) => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Change Mix
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Proportion of setup modifications across functional areas
        </p>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mb-5">
        {data.map((item) => {
          const meta = getCategoryMeta(item.category);
          return (
            <div
              key={item.category}
              style={{ width: `${item.percentage}%`, backgroundColor: meta.dotColor }}
              className="h-full transition-all duration-300 hover:opacity-80"
              title={`${meta.label}: ${item.count} (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Ranked Category List */}
      <div className="space-y-2.5">
        {data.map((item) => {
          const meta = getCategoryMeta(item.category);
          const Icon = meta.icon;
          return (
            <div
              key={item.category}
              onClick={() => onCategoryClick(item.category)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: meta.dotColor }}
                />
                <Icon className={`w-4 h-4 ${meta.colorClass}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                  {item.percentage}%
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
