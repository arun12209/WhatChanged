import { ChangeSeverity } from './types';

export interface SeverityMeta {
  label: string;
  severity: ChangeSeverity;
  badgeClass: string;
  dotClass: string;
  description: string;
  isHighInterest: boolean;
}

export const SEVERITY_DEFINITIONS: Record<ChangeSeverity, SeverityMeta> = {
  INFO: {
    label: 'INFO',
    severity: 'INFO',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-400',
    description: 'Informational or label/documentation change',
    isHighInterest: false,
  },
  LOW: {
    label: 'LOW',
    severity: 'LOW',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50',
    dotClass: 'bg-emerald-500',
    description: 'Minor UI layout or visual adjustment',
    isHighInterest: false,
  },
  MEDIUM: {
    label: 'MEDIUM',
    severity: 'MEDIUM',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50',
    dotClass: 'bg-amber-500',
    description: 'Flow or data model adjustment with operational scope',
    isHighInterest: false,
  },
  HIGH: {
    label: 'HIGH',
    severity: 'HIGH',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50 font-semibold',
    dotClass: 'bg-rose-500',
    description: 'Permission, security, sharing or integration change',
    isHighInterest: true,
  },
  CRITICAL: {
    label: 'CRITICAL',
    severity: 'CRITICAL',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-700 font-bold animate-pulse',
    dotClass: 'bg-red-600',
    description: 'Broad access grant, SSO disruption or critical risk heuristic',
    isHighInterest: true,
  },
};

export const ALL_SEVERITIES = Object.keys(SEVERITY_DEFINITIONS) as ChangeSeverity[];

export function getSeverityMeta(severity: string): SeverityMeta {
  const sev = severity as ChangeSeverity;
  return SEVERITY_DEFINITIONS[sev] || SEVERITY_DEFINITIONS.INFO;
}
