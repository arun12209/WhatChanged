import { ChangeCategory } from './types';
import {
  Cpu,
  Lock,
  ShieldAlert,
  Database,
  Code2,
  Layout,
  Network,
  Users,
  Rocket,
  Sliders,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  label: string;
  category: ChangeCategory;
  icon: LucideIcon;
  colorClass: string;
  badgeBgLight: string;
  badgeTextLight: string;
  badgeBgDark: string;
  badgeTextDark: string;
  dotColor: string;
  description: string;
}

export const CATEGORY_DEFINITIONS: Record<ChangeCategory, CategoryMeta> = {
  AUTOMATION: {
    label: 'Automation',
    category: 'AUTOMATION',
    icon: Cpu,
    colorClass: 'text-purple-600 dark:text-purple-400',
    badgeBgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeTextLight: 'text-purple-700',
    badgeBgDark: 'dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/50',
    badgeTextDark: 'dark:text-purple-300',
    dotColor: '#8b5cf6',
    description: 'Flows, Process Builders, Workflow Rules & Approvals',
  },
  ACCESS: {
    label: 'Access',
    category: 'ACCESS',
    icon: Lock,
    colorClass: 'text-blue-600 dark:text-blue-400',
    badgeBgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeTextLight: 'text-blue-700',
    badgeBgDark: 'dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50',
    badgeTextDark: 'dark:text-blue-300',
    dotColor: '#3b82f6',
    description: 'Permission Sets, Profiles, Groups, and User Entitlements',
  },
  SECURITY: {
    label: 'Security',
    category: 'SECURITY',
    icon: ShieldAlert,
    colorClass: 'text-rose-600 dark:text-rose-400',
    badgeBgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeTextLight: 'text-rose-700',
    badgeBgDark: 'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50',
    badgeTextDark: 'dark:text-rose-300',
    dotColor: '#f43f5e',
    description: 'Session Settings, Auth Providers, Sharing Rules & SSO',
  },
  DATA_MODEL: {
    label: 'Data Model',
    category: 'DATA_MODEL',
    icon: Database,
    colorClass: 'text-teal-600 dark:text-teal-400',
    badgeBgLight: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeTextLight: 'text-teal-700',
    badgeBgDark: 'dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/50',
    badgeTextDark: 'dark:text-teal-300',
    dotColor: '#14b8a6',
    description: 'Objects, Custom Fields, Picklists & Validation Rules',
  },
  CODE: {
    label: 'Code',
    category: 'CODE',
    icon: Code2,
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    badgeBgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeTextLight: 'text-indigo-700',
    badgeBgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/50',
    badgeTextDark: 'dark:text-indigo-300',
    dotColor: '#6366f1',
    description: 'Apex Classes, Triggers, LWC & Aura Components',
  },
  UI: {
    label: 'UI & Layout',
    category: 'UI',
    icon: Layout,
    colorClass: 'text-sky-600 dark:text-sky-400',
    badgeBgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeTextLight: 'text-sky-700',
    badgeBgDark: 'dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/50',
    badgeTextDark: 'dark:text-sky-300',
    dotColor: '#0ea5e9',
    description: 'Lightning Pages, Page Layouts, Tabs & Apps',
  },
  INTEGRATION: {
    label: 'Integration',
    category: 'INTEGRATION',
    icon: Network,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeTextLight: 'text-emerald-700',
    badgeBgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50',
    badgeTextDark: 'dark:text-emerald-300',
    dotColor: '#10b981',
    description: 'Connected Apps, Named Credentials & Remote Sites',
  },
  USER_ADMIN: {
    label: 'User Admin',
    category: 'USER_ADMIN',
    icon: Users,
    colorClass: 'text-fuchsia-600 dark:text-fuchsia-400',
    badgeBgLight: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    badgeTextLight: 'text-fuchsia-700',
    badgeBgDark: 'dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:border-fuchsia-800/50',
    badgeTextDark: 'dark:text-fuchsia-300',
    dotColor: '#a855f7',
    description: 'User Creation, Freezing, Passwords & Licenses',
  },
  DEPLOYMENT: {
    label: 'Deployment',
    category: 'DEPLOYMENT',
    icon: Rocket,
    colorClass: 'text-green-600 dark:text-green-400',
    badgeBgLight: 'bg-green-50 text-green-700 border-green-200',
    badgeTextLight: 'text-green-700',
    badgeBgDark: 'dark:bg-green-950/60 dark:text-green-300 dark:border-green-800/50',
    badgeTextDark: 'dark:text-green-300',
    dotColor: '#22c55e',
    description: 'Metadata Packages, Change Sets & Installations',
  },
  CONFIGURATION: {
    label: 'Config',
    category: 'CONFIGURATION',
    icon: Sliders,
    colorClass: 'text-slate-600 dark:text-slate-400',
    badgeBgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeTextLight: 'text-slate-700',
    badgeBgDark: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    badgeTextDark: 'dark:text-slate-300',
    dotColor: '#64748b',
    description: 'Company Profile, Business Hours & System Defaults',
  },
  OTHER: {
    label: 'Other',
    category: 'OTHER',
    icon: HelpCircle,
    colorClass: 'text-gray-500 dark:text-gray-400',
    badgeBgLight: 'bg-gray-100 text-gray-700 border-gray-200',
    badgeTextLight: 'text-gray-700',
    badgeBgDark: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    badgeTextDark: 'dark:text-gray-300',
    dotColor: '#6b7280',
    description: 'Miscellaneous setup changes',
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_DEFINITIONS) as ChangeCategory[];

export function getCategoryMeta(category: string): CategoryMeta {
  const cat = category as ChangeCategory;
  return CATEGORY_DEFINITIONS[cat] || CATEGORY_DEFINITIONS.OTHER;
}
