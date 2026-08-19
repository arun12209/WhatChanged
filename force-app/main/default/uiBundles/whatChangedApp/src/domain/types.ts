export type ChangeCategory =
  | 'DEPLOYMENT'
  | 'AUTOMATION'
  | 'ACCESS'
  | 'SECURITY'
  | 'DATA_MODEL'
  | 'CODE'
  | 'UI'
  | 'INTEGRATION'
  | 'USER_ADMIN'
  | 'CONFIGURATION'
  | 'OTHER';

export type ChangeSeverity =
  | 'INFO'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface Actor {
  id?: string;
  name: string;
  username?: string;
  smallPhotoUrl?: string;
}

export interface ChangeMetadata {
  componentName?: string;
  componentType?: string;
  targetObject?: string;
  fieldName?: string;
}

export interface ChangeEvent {
  id: string;
  createdDate: string;
  formattedTime: string;
  relativeTime: string;
  actor: Actor;
  delegatedUser?: string;
  category: ChangeCategory;
  severity: ChangeSeverity;
  title: string;
  description: string;
  action: string;
  section: string;
  rawDisplay: string;
  responsibleNamespace?: string;
  metadata?: ChangeMetadata;
  searchTokens?: string[];
}

export interface HourlyDistribution {
  hourLabel: string;
  hour: number;
  count: number;
}

export interface CategoryDistribution {
  category: ChangeCategory;
  count: number;
  percentage: number;
}

export interface AttentionItem {
  id: string;
  title: string;
  reason: string;
  severity: ChangeSeverity;
  category: ChangeCategory;
  relatedEventCount: number;
  filterParam?: string;
}

export interface ChangeSummary {
  totalChangesToday: number;
  baselineTypicalWeekday?: number;
  deltaPercentageVsBaseline?: number;
  baselineStatus: string;
  automationChangesToday: number;
  automationSubtitle: string;
  accessChangesToday: number;
  accessSubtitle: string;
  highInterestChangesToday: number;
  highInterestSubtitle: string;
  lastRefreshedAt: string;
  environmentType: 'Production' | 'Sandbox' | 'Demo Data' | string;
  hourlyActivity: HourlyDistribution[];
  categoryMix: CategoryDistribution[];
  attentionItems: AttentionItem[];
  recentChanges: ChangeEvent[];
}

export interface Contributor {
  actorId?: string;
  actorName: string;
  totalChanges: number;
  primaryCategories: string[];
  lastChangeDate: string;
  lastActivityRelative: string;
  trend: 'High activity' | 'Steady' | 'Occasional';
  categoryCounts?: Record<string, number>;
}

export interface DayDistribution {
  dayName: string;
  dateLabel: string;
  count: number;
}

export interface SectionStat {
  section: string;
  count: number;
}

export interface Insights {
  dailyTrends: DayDistribution[];
  hourlyTrends: HourlyDistribution[];
  categoryDistribution: CategoryDistribution[];
  topSections: SectionStat[];
  severityDistribution: Record<string, number>;
  totalEvaluatedPeriodChanges: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export interface ChangeStory {
  id: string;
  title: string;
  actorName: string;
  actorId?: string;
  timeSpanFormatted: string;
  changeCount: number;
  primaryCategory: ChangeCategory;
  maxSeverity: ChangeSeverity;
  relatedEvents: ChangeEvent[];
}

export interface ChangeEventsResponse {
  events: ChangeEvent[];
  pageInfo: PageInfo;
  changeStories: ChangeStory[];
}

export type DateRangeOption = 'today' | '24h' | '7d' | '30d' | 'custom';

/**
 * Severity filter value. 'ELEVATED' is a server-supported alias for HIGH + CRITICAL
 * (used by the "Worth a Look" KPI and attention items).
 */
export type SeverityFilter = ChangeSeverity | 'ALL' | 'ELEVATED';

export interface TimelineFilters {
  range: DateRangeOption;
  customFrom?: string;
  customTo?: string;
  category?: ChangeCategory | 'ALL';
  severity?: SeverityFilter;
  actorId?: string;
  actorName?: string;
  section?: string;
  search?: string;
  incidentTime?: string;
  incidentWindowMinutes?: number;
  incidentModeEnabled?: boolean;
}

export type ViewTab = 'overview' | 'timeline' | 'insights' | 'people' | 'about';
