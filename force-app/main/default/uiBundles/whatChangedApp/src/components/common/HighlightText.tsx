import React from 'react';

interface HighlightTextProps {
  text: string;
  query?: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, query, className }) => {
  if (!query || !query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-200 dark:bg-amber-800/80 text-slate-900 dark:text-slate-100 font-semibold px-0.5 rounded-xs"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
