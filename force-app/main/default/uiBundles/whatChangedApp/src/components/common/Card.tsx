import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-surface dark:bg-surface border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-sm ${
        hoverable ? 'transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
