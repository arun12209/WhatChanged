import { describe, it, expect } from 'vitest';
import { getCategoryMeta, ALL_CATEGORIES } from '../domain/categories';
import { getSeverityMeta, ALL_SEVERITIES } from '../domain/severity';

describe('Domain Categories and Severities', () => {
  it('defines metadata for all 11 change categories', () => {
    expect(ALL_CATEGORIES.length).toBe(11);
    for (const cat of ALL_CATEGORIES) {
      const meta = getCategoryMeta(cat);
      expect(meta.label).toBeDefined();
      expect(meta.icon).toBeDefined();
      expect(meta.badgeBgLight).toBeDefined();
      expect(meta.dotColor).toBeDefined();
    }
  });

  it('defines metadata for all 5 severity levels', () => {
    expect(ALL_SEVERITIES.length).toBe(5);
    for (const sev of ALL_SEVERITIES) {
      const meta = getSeverityMeta(sev);
      expect(meta.label).toBe(sev);
      expect(meta.badgeClass).toBeDefined();
      expect(meta.dotClass).toBeDefined();
    }
  });

  it('correctly identifies high interest severities', () => {
    expect(getSeverityMeta('HIGH').isHighInterest).toBe(true);
    expect(getSeverityMeta('CRITICAL').isHighInterest).toBe(true);
    expect(getSeverityMeta('INFO').isHighInterest).toBe(false);
    expect(getSeverityMeta('LOW').isHighInterest).toBe(false);
    expect(getSeverityMeta('MEDIUM').isHighInterest).toBe(false);
  });
});
