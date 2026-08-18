import React, { useState } from 'react';
import { HourlyDistribution } from '../../domain/types';
import { Card } from '../../components/common/Card';

interface ActivityChartProps {
  data: HourlyDistribution[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const [hoveredHour, setHoveredHour] = useState<HourlyDistribution | null>(null);

  // Filter only business/active hours or span
  const displayData = data && data.length > 0 ? data : [];
  const maxCount = Math.max(...displayData.map((d) => d.count), 5);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Change Activity Today
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hourly distribution of Salesforce setup and metadata events
          </p>
        </div>
        {hoveredHour && (
          <div className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <strong>{hoveredHour.hourLabel}:</strong> {hoveredHour.count} {hoveredHour.count === 1 ? 'change' : 'changes'}
          </div>
        )}
      </div>

      {/* SVG Bar Chart */}
      <div className="relative h-44 w-full pt-4">
        <div className="flex items-end justify-between h-32 gap-1.5 sm:gap-2 px-1">
          {displayData.map((item) => {
            const heightPercent = Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 2);
            const isHovered = hoveredHour?.hour === item.hour;

            return (
              <div
                key={item.hour}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredHour(item)}
                onMouseLeave={() => setHoveredHour(null)}
              >
                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[24px] rounded-t-md transition-all duration-200 ${
                    item.count === 0
                      ? 'bg-slate-200/60 dark:bg-slate-800'
                      : isHovered
                      ? 'bg-sky-500 shadow-md shadow-sky-500/20'
                      : 'bg-sky-600/80 dark:bg-sky-500/80 hover:bg-sky-500'
                  }`}
                />
                {/* X Label */}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 truncate w-full text-center">
                  {item.hour % 2 === 0 ? item.hourLabel.replace(' ', '') : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
