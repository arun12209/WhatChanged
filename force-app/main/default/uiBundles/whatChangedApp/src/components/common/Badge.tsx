import React from 'react';
import { getCategoryMeta } from '../../domain/categories';
import { getSeverityMeta } from '../../domain/severity';
import { ChangeCategory, ChangeSeverity } from '../../domain/types';

interface CategoryBadgeProps {
  category: ChangeCategory | string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  size = 'md',
}) => {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md border ${meta.badgeBgLight} ${meta.badgeBgDark} ${sizeClasses}`}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{meta.label}</span>
    </span>
  );
};

interface SeverityBadgeProps {
  severity: ChangeSeverity | string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const meta = getSeverityMeta(severity);
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${meta.badgeClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
      <span>{meta.label}</span>
    </span>
  );
};
