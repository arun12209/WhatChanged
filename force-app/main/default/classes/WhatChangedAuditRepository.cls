/**
 * @description Repository interface and implementations for retrieving SetupAuditTrail change history.
 *
 * PLATFORM LIMITATIONS this layer works around (verified against the org):
 *  - SetupAuditTrail.Display and SetupAuditTrail.Section are NOT filterable in SOQL
 *    ("field can not be filtered in a query call"), so only Id/CreatedDate/CreatedById
 *    predicates are pushed into SOQL. Section/search/category/severity filtering happens
 *    in Apex; WhatChangedAuditService drives a bounded keyset scan loop for pagination.
 *  - SetupAuditTrail does not support GROUP BY, so distributions (category/severity/hour/
 *    section/actor) are computed from a bounded sample of the most recent rows in range.
 *    COUNT() queries consume only one query row, so totals and per-day counts are EXACT.
 *  - SetupAuditTrail retains roughly the last 180 days only.
 * @group WhatChanged
 */
public with sharing class WhatChangedAuditRepository {

    public interface IWhatChangedAuditRepository {
        /**
         * May return rows that do not match section/search/category/severity filters
         * (the live source cannot filter them in SOQL). The service layer always
         * re-applies every filter after normalization.
         */
        List<WhatChangedEventNormalizer.RawAuditInput> queryEvents(
            DateTime fromDate,
            DateTime toDate,
            String actorId,
            String section,
            String searchKeyword,
            String category,
            Set<String> severities,
            Integer limitRows,
            String cursor
        );

        /** Exact count of events in range */
        Integer countEvents(DateTime fromDate, DateTime toDate);

        List<WhatChangedEventNormalizer.RawAuditInput> queryEventsAroundTime(DateTime targetTime, Integer windowMinutes);

        /** Distribution of events by category (may be computed from a bounded sample) */
        Map<String, Integer> countByCategory(DateTime fromDate, DateTime toDate);

        /** Distribution of events by severity (may be computed from a bounded sample) */
        Map<String, Integer> countBySeverity(DateTime fromDate, DateTime toDate);

        /** Distribution of events by hour of day (may be computed from a bounded sample) */
        Map<Integer, Integer> countByHour(DateTime fromDate, DateTime toDate);

        /** Exact count per calendar day in range */
        Map<Date, Integer> countByDay(DateTime fromDate, DateTime toDate);

        /** Distribution of events by Setup section (may be computed from a bounded sample) */
        Map<String, Integer> countBySection(DateTime fromDate, DateTime toDate);

        /** Per-actor totals and category mix (may be computed from a bounded sample) */
        List<ActorStat> actorStats(DateTime fromDate, DateTime toDate);

        /** True when all filters passed to queryEvents are applied natively */
        Boolean supportsNativeFilters();

        /** Number of rows the distribution sample can cover per range (null = exact/unlimited) */
        Integer sampleLimit();
    }

    /** @description Per-actor aggregate used by the People view */
    public class ActorStat {
        public String actorId;
        public String actorName;
        public Integer totalChanges = 0;
        public DateTime lastChangeDate;
        public Map<String, Integer> categoryCounts = new Map<String, Integer>();
    }

    private static IWhatChangedAuditRepository mockInstance;

    public static void setMock(IWhatChangedAuditRepository mock) {
        mockInstance = mock;
    }

    public static IWhatChangedAuditRepository getInstance() {
        if (mockInstance != null) {
            return mockInstance;
        }
        return new SalesforceSetupAuditRepository();
    }

    // ==================================================================================
    // Keyset cursor helpers, shared by all implementations
    // ==================================================================================

    public static String buildCursor(DateTime createdDate, String recordId) {
        if (createdDate == null || String.isBlank(recordId)) {
            return null;
        }
        return createdDate.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'') + '_' + recordId;
    }

    public class CursorValue {
        public DateTime createdDate;
        public String recordId;
    }

    public static CursorValue parseCursor(String cursor) {
        if (String.isBlank(cursor) || !cursor.contains('_')) {
            return null;
        }
        List<String> parts = cursor.split('_');
        if (parts.size() < 2) {
            return null;
        }
        try {
            CursorValue cv = new CursorValue();
            cv.createdDate = DateTime.valueOfGmt(parts[0].replace('T', ' ').replace('Z', ''));
            cv.recordId = parts[1];
            return (cv.createdDate != null && String.isNotBlank(cv.recordId)) ? cv : null;
        } catch (Exception e) {
            return null; // malformed cursor: restart from the top rather than fail
        }
    }

    private static Integer clampLimit(Integer limitRows, Integer defaultValue, Integer maxValue) {
        if (limitRows == null || limitRows <= 0) {
            return defaultValue;
        }
        return Math.min(limitRows, maxValue);
    }

    private static void increment(Map<String, Integer> counts, String key) {
        if (key == null) {
            key = '';
        }
        counts.put(key, (counts.containsKey(key) ? counts.get(key) : 0) + 1);
    }

    // ==================================================================================
    // LIVE implementation: SetupAuditTrail
    // ==================================================================================

    /**
     * @description Live SetupAuditTrail queries. Only Id/CreatedDate/CreatedById are
     * filterable, so section/search/category/severity are intentionally NOT in the WHERE
     * clause (the service layer post-filters and drives a scan loop). Totals and per-day
     * counts are exact; distributions are computed from a bounded sample of the most
     * recent rows in range (size configurable via WhatChanged_Setting__mdt).
     */
    public class SalesforceSetupAuditRepository implements IWhatChangedAuditRepository {

        private Map<String, List<WhatChangedEventNormalizer.RawAuditInput>> sampleCache =
            new Map<String, List<WhatChangedEventNormalizer.RawAuditInput>>();

        public Boolean supportsNativeFilters() {
            return false;
        }

        public Integer sampleLimit() {
            return WhatChangedSettings.getAggregateSampleLimit();
        }

        public List<WhatChangedEventNormalizer.RawAuditInput> queryEvents(
            DateTime fromDate,
            DateTime toDate,
            String actorId,
            String section,
            String searchKeyword,
            String category,
            Set<String> severities,
            Integer limitRows,
            String cursor
        ) {
            Integer queryLimit = clampLimit(limitRows, 50, 2000);

            String query = 'SELECT Id, Action, CreatedById, CreatedBy.Name, CreatedDate, DelegateUser, Display, ResponsibleNamespacePrefix, Section ' +
                           'FROM SetupAuditTrail WHERE Id != null ';

            if (fromDate != null) {
                query += 'AND CreatedDate >= :fromDate ';
            }
            if (toDate != null) {
                query += 'AND CreatedDate <= :toDate ';
            }
            if (String.isNotBlank(actorId)) {
                query += 'AND CreatedById = :actorId ';
            }

            CursorValue cv = parseCursor(cursor);
            DateTime cursorDate = cv != null ? cv.createdDate : null;
            String cursorId = cv != null ? cv.recordId : null;
            if (cv != null) {
                query += 'AND (CreatedDate < :cursorDate OR (CreatedDate = :cursorDate AND Id < :cursorId)) ';
            }

            query += 'ORDER BY CreatedDate DESC, Id DESC LIMIT :queryLimit';

            List<SetupAuditTrail> records = Database.query(query);
            List<WhatChangedEventNormalizer.RawAuditInput> result = new List<WhatChangedEventNormalizer.RawAuditInput>();
            for (SetupAuditTrail sat : records) {
                result.add(new WhatChangedEventNormalizer.RawAuditInput(sat));
            }
            return result;
        }

        public Integer countEvents(DateTime fromDate, DateTime toDate) {
            String query = 'SELECT count() FROM SetupAuditTrail WHERE Id != null ';
            if (fromDate != null) {
                query += 'AND CreatedDate >= :fromDate ';
            }
            if (toDate != null) {
                query += 'AND CreatedDate <= :toDate ';
            }
            return Database.countQuery(query);
        }

        public List<WhatChangedEventNormalizer.RawAuditInput> queryEventsAroundTime(DateTime targetTime, Integer windowMinutes) {
            if (targetTime == null) {
                targetTime = System.now();
            }
            Integer mins = (windowMinutes != null && windowMinutes > 0) ? windowMinutes : 30;
            DateTime windowStart = targetTime.addMinutes(-mins);
            DateTime windowEnd = targetTime.addMinutes(mins);

            List<SetupAuditTrail> records = [
                SELECT Id, Action, CreatedById, CreatedBy.Name, CreatedDate, DelegateUser, Display, ResponsibleNamespacePrefix, Section
                FROM SetupAuditTrail
                WHERE CreatedDate >= :windowStart AND CreatedDate <= :windowEnd
                ORDER BY CreatedDate DESC, Id DESC
                LIMIT 500
            ];

            List<WhatChangedEventNormalizer.RawAuditInput> result = new List<WhatChangedEventNormalizer.RawAuditInput>();
            for (SetupAuditTrail sat : records) {
                result.add(new WhatChangedEventNormalizer.RawAuditInput(sat));
            }
            return result;
        }

        /**
         * @description Exact per-day counts via one COUNT() query per day
         * (COUNT() consumes a single query row). Bounded to 31 days per call.
         */
        public Map<Date, Integer> countByDay(DateTime fromDate, DateTime toDate) {
            Map<Date, Integer> counts = new Map<Date, Integer>();
            if (fromDate == null) {
                return counts;
            }
            DateTime effectiveTo = toDate != null ? toDate : System.now();
            Date startDay = fromDate.date();
            Date endDay = effectiveTo.date();
            Integer days = startDay.daysBetween(endDay);
            if (days < 0 || days > 31) {
                return counts;
            }
            for (Date d = startDay; d <= endDay; d = d.addDays(1)) {
                DateTime dayStart = DateTime.newInstance(d, Time.newInstance(0, 0, 0, 0));
                DateTime dayEnd = DateTime.newInstance(d, Time.newInstance(23, 59, 59, 999));
                // Clip the first/last day to the requested range boundaries
                if (dayStart < fromDate) {
                    dayStart = fromDate;
                }
                if (dayEnd > effectiveTo) {
                    dayEnd = effectiveTo;
                }
                counts.put(d, countEvents(dayStart, dayEnd));
            }
            return counts;
        }

        // ---------- Sample-based distributions (most recent rows in range) ----------

        private List<WhatChangedEventNormalizer.RawAuditInput> sample(DateTime fromDate, DateTime toDate) {
            String key = String.valueOf(fromDate) + '|' + String.valueOf(toDate);
            if (!sampleCache.containsKey(key)) {
                sampleCache.put(key, queryEvents(fromDate, toDate, null, null, null, null, null, sampleLimit(), null));
            }
            return sampleCache.get(key);
        }

        public Map<String, Integer> countByCategory(DateTime fromDate, DateTime toDate) {
            Map<String, Integer> counts = new Map<String, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : sample(fromDate, toDate)) {
                increment(counts, WhatChangedClassifier.classify(r.action, r.section, r.display, r.responsibleNamespace).category);
            }
            return counts;
        }

        public Map<String, Integer> countBySeverity(DateTime fromDate, DateTime toDate) {
            Map<String, Integer> counts = new Map<String, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : sample(fromDate, toDate)) {
                increment(counts, WhatChangedClassifier.classify(r.action, r.section, r.display, r.responsibleNamespace).severity);
            }
            return counts;
        }

        public Map<Integer, Integer> countByHour(DateTime fromDate, DateTime toDate) {
            Map<Integer, Integer> counts = new Map<Integer, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : sample(fromDate, toDate)) {
                Integer h = r.createdDate.hour();
                counts.put(h, (counts.containsKey(h) ? counts.get(h) : 0) + 1);
            }
            return counts;
        }

        public Map<String, Integer> countBySection(DateTime fromDate, DateTime toDate) {
            Map<String, Integer> counts = new Map<String, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : sample(fromDate, toDate)) {
                increment(counts, String.isNotBlank(r.section) ? r.section : 'General');
            }
            return counts;
        }

        public List<ActorStat> actorStats(DateTime fromDate, DateTime toDate) {
            Map<String, ActorStat> statsByName = new Map<String, ActorStat>();
            for (WhatChangedEventNormalizer.RawAuditInput r : sample(fromDate, toDate)) {
                String name = String.isNotBlank(r.actorName) ? r.actorName : 'Unknown';
                ActorStat stat = statsByName.get(name);
                if (stat == null) {
                    stat = new ActorStat();
                    stat.actorId = r.actorId;
                    stat.actorName = name;
                    statsByName.put(name, stat);
                }
                stat.totalChanges++;
                if (stat.lastChangeDate == null || r.createdDate > stat.lastChangeDate) {
                    stat.lastChangeDate = r.createdDate;
                }
                increment(stat.categoryCounts, WhatChangedClassifier.classify(r.action, r.section, r.display, r.responsibleNamespace).category);
            }
            return statsByName.values();
        }
    }

    // ==================================================================================
    // FAKE implementation for unit tests and demos
    // ==================================================================================

    /**
     * @description In-memory mock repository for tests and development demonstration.
     * Applies all filters natively.
     */
    public class FakeAuditRepository implements IWhatChangedAuditRepository {
        private List<WhatChangedEventNormalizer.RawAuditInput> mockRecords = new List<WhatChangedEventNormalizer.RawAuditInput>();

        public FakeAuditRepository() {
            seedDefaultMockRecords();
        }

        public void addRecord(WhatChangedEventNormalizer.RawAuditInput record) {
            mockRecords.add(record);
        }

        public void clearRecords() {
            mockRecords.clear();
        }

        public Boolean supportsNativeFilters() {
            return true;
        }

        public Integer sampleLimit() {
            return null;
        }

        public List<WhatChangedEventNormalizer.RawAuditInput> queryEvents(
            DateTime fromDate,
            DateTime toDate,
            String actorId,
            String section,
            String searchKeyword,
            String category,
            Set<String> severities,
            Integer limitRows,
            String cursor
        ) {
            List<WhatChangedEventNormalizer.RawAuditInput> filtered = new List<WhatChangedEventNormalizer.RawAuditInput>();
            Integer maxCount = (limitRows != null && limitRows > 0) ? limitRows : 50;
            CursorValue cv = parseCursor(cursor);

            for (WhatChangedEventNormalizer.RawAuditInput r : sortedDesc(mockRecords)) {
                if (fromDate != null && r.createdDate < fromDate) continue;
                if (toDate != null && r.createdDate > toDate) continue;
                if (String.isNotBlank(actorId) && r.actorId != actorId) continue;
                if (String.isNotBlank(section) && r.section != section) continue;
                if (cv != null) {
                    Boolean beyondCursor = r.createdDate < cv.createdDate ||
                        (r.createdDate == cv.createdDate && r.id != null && r.id.compareTo(cv.recordId) < 0);
                    if (!beyondCursor) continue;
                }
                WhatChangedClassifier.ClassificationResult cr =
                    WhatChangedClassifier.classify(r.action, r.section, r.display, r.responsibleNamespace);
                if (String.isNotBlank(category) && !category.equalsIgnoreCase('ALL') && !cr.category.equalsIgnoreCase(category)) continue;
                if (severities != null && !severities.isEmpty() && !severities.contains(cr.severity)) continue;
                if (String.isNotBlank(searchKeyword)) {
                    String kw = searchKeyword.toLowerCase();
                    Boolean match = (r.display != null && r.display.toLowerCase().contains(kw)) ||
                                    (r.action != null && r.action.toLowerCase().contains(kw)) ||
                                    (r.section != null && r.section.toLowerCase().contains(kw)) ||
                                    (r.actorName != null && r.actorName.toLowerCase().contains(kw));
                    if (!match) continue;
                }
                filtered.add(r);
                if (filtered.size() >= maxCount) break;
            }
            return filtered;
        }

        public Integer countEvents(DateTime fromDate, DateTime toDate) {
            Integer c = 0;
            for (WhatChangedEventNormalizer.RawAuditInput r : mockRecords) {
                if (fromDate != null && r.createdDate < fromDate) continue;
                if (toDate != null && r.createdDate > toDate) continue;
                c++;
            }
            return c;
        }

        public List<WhatChangedEventNormalizer.RawAuditInput> queryEventsAroundTime(DateTime targetTime, Integer windowMinutes) {
            if (targetTime == null) targetTime = System.now();
            Integer mins = (windowMinutes != null && windowMinutes > 0) ? windowMinutes : 30;
            return queryEvents(targetTime.addMinutes(-mins), targetTime.addMinutes(mins), null, null, null, null, null, 500, null);
        }

        public Map<String, Integer> countByCategory(DateTime fromDate, DateTime toDate) {
            Map<String, Integer> counts = new Map<String, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : inRange(fromDate, toDate)) {
                increment(counts, WhatChangedClassifier.classify(r.action, r.section, r.display, r.responsibleNamespace).category);
            }
            return counts;
        }

        public Map<String, Integer> countBySeverity(DateTime fromDate, DateTime toDate) {
            Map<String, Integer> counts = new Map<String, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : inRange(fromDate, toDate)) {
                increment(counts, WhatChangedClassifier.classify(r.action, r.section, r.display, r.responsibleNamespace).severity);
            }
            return counts;
        }

        public Map<Integer, Integer> countByHour(DateTime fromDate, DateTime toDate) {
            Map<Integer, Integer> counts = new Map<Integer, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : inRange(fromDate, toDate)) {
                Integer h = r.createdDate.hour();
                counts.put(h, (counts.containsKey(h) ? counts.get(h) : 0) + 1);
            }
            return counts;
        }

        public Map<Date, Integer> countByDay(DateTime fromDate, DateTime toDate) {
            Map<Date, Integer> counts = new Map<Date, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : inRange(fromDate, toDate)) {
                Date d = r.createdDate.date();
                counts.put(d, (counts.containsKey(d) ? counts.get(d) : 0) + 1);
            }
            return counts;
        }

        public Map<String, Integer> countBySection(DateTime fromDate, DateTime toDate) {
            Map<String, Integer> counts = new Map<String, Integer>();
            for (WhatChangedEventNormalizer.RawAuditInput r : inRange(fromDate, toDate)) {
                increment(counts, String.isNotBlank(r.section) ? r.section : 'General');
            }
            return counts;
        }

        public List<ActorStat> actorStats(DateTime fromDate, DateTime toDate) {
            Map<String, ActorStat> statsByName = new Map<String, ActorStat>();
            for (WhatChangedEventNormalizer.RawAuditInput r : inRange(fromDate, toDate)) {
                String name = String.isNotBlank(r.actorName) ? r.actorName : 'Unknown';
                ActorStat stat = statsByName.get(name);
                if (stat == null) {
                    stat = new ActorStat();
                    stat.actorId = r.actorId;
                    stat.actorName = name;
                    statsByName.put(name, stat);
                }
                stat.totalChanges++;
                if (stat.lastChangeDate == null || r.createdDate > stat.lastChangeDate) {
                    stat.lastChangeDate = r.createdDate;
                }
                increment(stat.categoryCounts, WhatChangedClassifier.classify(r.action, r.section, r.display, r.responsibleNamespace).category);
            }
            return statsByName.values();
        }

        private List<WhatChangedEventNormalizer.RawAuditInput> inRange(DateTime fromDate, DateTime toDate) {
            List<WhatChangedEventNormalizer.RawAuditInput> res = new List<WhatChangedEventNormalizer.RawAuditInput>();
            for (WhatChangedEventNormalizer.RawAuditInput r : mockRecords) {
                if (fromDate != null && r.createdDate < fromDate) continue;
                if (toDate != null && r.createdDate > toDate) continue;
                res.add(r);
            }
            return res;
        }

        private List<WhatChangedEventNormalizer.RawAuditInput> sortedDesc(List<WhatChangedEventNormalizer.RawAuditInput> input) {
            List<WhatChangedEventNormalizer.RawAuditInput> copy = new List<WhatChangedEventNormalizer.RawAuditInput>(input);
            // insertion sort: newest first (mock lists are small)
            for (Integer i = 1; i < copy.size(); i++) {
                WhatChangedEventNormalizer.RawAuditInput current = copy[i];
                Integer j = i - 1;
                while (j >= 0 && copy[j].createdDate < current.createdDate) {
                    copy[j + 1] = copy[j];
                    j--;
                }
                copy[j + 1] = current;
            }
            return copy;
        }

        private void seedDefaultMockRecords() {
            DateTime now = System.now();

            WhatChangedEventNormalizer.RawAuditInput r1 = new WhatChangedEventNormalizer.RawAuditInput();
            r1.id = '001000000000001';
            r1.action = 'changedfieldperms';
            r1.section = 'Manage Users';
            r1.display = 'Changed field permissions in permission set C360 Account Manager: Account.AnnualRevenue edit permission granted';
            r1.createdDate = now.addMinutes(-18);
            r1.actorId = '005000000000001';
            r1.actorName = 'Jane Smith';
            mockRecords.add(r1);

            WhatChangedEventNormalizer.RawAuditInput r2 = new WhatChangedEventNormalizer.RawAuditInput();
            r2.id = '001000000000002';
            r2.action = 'flowactivated';
            r2.section = 'Process Automation';
            r2.display = 'Activated Flow Account_Move_Wizard version 3';
            r2.createdDate = now.addMinutes(-42);
            r2.actorId = '005000000000002';
            r2.actorName = 'John Doe';
            mockRecords.add(r2);

            WhatChangedEventNormalizer.RawAuditInput r3 = new WhatChangedEventNormalizer.RawAuditInput();
            r3.id = '001000000000003';
            r3.action = 'deploymetadatapackage';
            r3.section = 'Deployment';
            r3.display = 'Deployed metadata package v2.14.0 containing 18 components';
            r3.createdDate = now.addHours(-2);
            r3.actorId = '005000000000003';
            r3.actorName = 'Release Automation Bot';
            mockRecords.add(r3);

            WhatChangedEventNormalizer.RawAuditInput r4 = new WhatChangedEventNormalizer.RawAuditInput();
            r4.id = '001000000000004';
            r4.action = 'customfieldcreated';
            r4.section = 'Custom Objects';
            r4.display = 'Created Custom Field Opportunity.Discount_Approved__c';
            r4.createdDate = now.addHours(-4);
            r4.actorId = '005000000000001';
            r4.actorName = 'Jane Smith';
            mockRecords.add(r4);

            WhatChangedEventNormalizer.RawAuditInput r5 = new WhatChangedEventNormalizer.RawAuditInput();
            r5.id = '001000000000005';
            r5.action = 'sessionsettingschanged';
            r5.section = 'Security';
            r5.display = 'Changed session settings: Session timeout updated to 120 minutes';
            r5.createdDate = now.addHours(-5);
            r5.actorId = '005000000000004';
            r5.actorName = 'Marcus Vance';
            mockRecords.add(r5);
        }
    }
}
