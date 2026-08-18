import { describe, it, expect } from 'vitest';
import { fetchSummary, fetchEvents, fetchPeople, fetchInsights } from '../data/whatChangedApi';

describe('Data Layer with Mock Data Fallback', () => {
  it('fetches summary metrics with expected structure', async () => {
    const summary = await fetchSummary();
    expect(summary).toBeDefined();
    expect(summary.totalChangesToday).toBeGreaterThan(0);
    expect(summary.hourlyActivity.length).toBeGreaterThan(0);
    expect(summary.categoryMix.length).toBeGreaterThan(0);
    expect(summary.recentChanges.length).toBeGreaterThan(0);
  });

  it('fetches events with filter criteria and pagination', async () => {
    const res = await fetchEvents({
      range: 'today',
      category: 'AUTOMATION',
      severity: 'ALL',
    });

    expect(res.events).toBeDefined();
    expect(res.events.every((e) => e.category === 'AUTOMATION')).toBe(true);
    expect(res.pageInfo).toBeDefined();
  });

  it('fetches contributors and insights', async () => {
    const people = await fetchPeople();
    expect(people.length).toBeGreaterThan(0);
    expect(people[0].actorName).toBeDefined();
    expect(people[0].totalChanges).toBeGreaterThan(0);

    const insights = await fetchInsights('7d');
    expect(insights.dailyTrends.length).toBe(7);
    expect(insights.hourlyTrends.length).toBe(10);
    expect(insights.topSections.length).toBeGreaterThan(0);
  });
});
