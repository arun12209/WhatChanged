/**
 * @description Repository interface and implementations for retrieving SetupAuditTrail change history.
 * Supports production SOQL queries with keyset pagination and in-memory mock repository for unit testing.
 * @group WhatChanged
 */
public with sharing class WhatChangedAuditRepository {

    public interface IWhatChangedAuditRepository {
        List<WhatChangedEventNormalizer.RawAuditInput> queryEvents(
            DateTime fromDate,
            DateTime toDate,
            String actorId,
            String section,
            String searchKeyword,
            Integer limitRows,
            String cursor
        );

        Integer countEvents(DateTime fromDate, DateTime toDate);

        List<WhatChangedEventNormalizer.RawAuditInput> queryEventsAroundTime(DateTime targetTime, Integer windowMinutes);
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

    /**
     * @description Production implementation querying SetupAuditTrail
     */
    public class SalesforceSetupAuditRepository implements IWhatChangedAuditRepository {

        public List<WhatChangedEventNormalizer.RawAuditInput> queryEvents(
            DateTime fromDate,
            DateTime toDate,
            String actorId,
            String section,
            String searchKeyword,
            Integer limitRows,
            String cursor
        ) {
            Integer queryLimit = (limitRows != null && limitRows > 0 && limitRows <= 200) ? limitRows : 50;

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
            if (String.isNotBlank(section)) {
                query += 'AND Section = :section ';
            }
            if (String.isNotBlank(searchKeyword)) {
                String sanitized = String.escapeSingleQuotes(searchKeyword.trim());
                String searchLike = '%' + sanitized + '%';
                query += 'AND (Display LIKE :searchLike OR Action LIKE :searchLike OR Section LIKE :searchLike) ';
            }

            // Keyset cursor handling
            DateTime cursorDate;
            String cursorId;
            if (String.isNotBlank(cursor) && cursor.contains('_')) {
                List<String> parts = cursor.split('_');
                if (parts.size() >= 2) {
                    try {
                        cursorDate = DateTime.valueOfGmt(parts[0].replace('T', ' '));
                        cursorId = parts[1];
                        query += 'AND (CreatedDate < :cursorDate OR (CreatedDate = :cursorDate AND Id < :cursorId)) ';
                    } catch (Exception e) {
                        // ignore malformed cursor and fallback
                    }
                }
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
                ORDER BY CreatedDate ASC
                LIMIT 200
            ];

            List<WhatChangedEventNormalizer.RawAuditInput> result = new List<WhatChangedEventNormalizer.RawAuditInput>();
            for (SetupAuditTrail sat : records) {
                result.add(new WhatChangedEventNormalizer.RawAuditInput(sat));
            }
            return result;
        }
    }

    /**
     * @description In-memory mock repository for tests and development demonstration
     */
    public class FakeAuditRepository implements IWhatChangedAuditRepository {
        private List<WhatChangedEventNormalizer.RawAuditInput> mockRecords = new List<WhatChangedEventNormalizer.RawAuditInput>();

        public FakeAuditRepository() {
            seedDefaultMockRecords();
        }

        public void addRecord(WhatChangedEventNormalizer.RawAuditInput record) {
            mockRecords.add(record);
        }

        public List<WhatChangedEventNormalizer.RawAuditInput> queryEvents(
            DateTime fromDate,
            DateTime toDate,
            String actorId,
            String section,
            String searchKeyword,
            Integer limitRows,
            String cursor
        ) {
            List<WhatChangedEventNormalizer.RawAuditInput> filtered = new List<WhatChangedEventNormalizer.RawAuditInput>();
            Integer maxCount = (limitRows != null && limitRows > 0) ? limitRows : 50;

            for (WhatChangedEventNormalizer.RawAuditInput r : mockRecords) {
                if (fromDate != null && r.createdDate < fromDate) continue;
                if (toDate != null && r.createdDate > toDate) continue;
                if (String.isNotBlank(actorId) && r.actorId != actorId) continue;
                if (String.isNotBlank(section) && r.section != section) continue;
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
            DateTime windowStart = targetTime.addMinutes(-mins);
            DateTime windowEnd = targetTime.addMinutes(mins);

            List<WhatChangedEventNormalizer.RawAuditInput> res = new List<WhatChangedEventNormalizer.RawAuditInput>();
            for (WhatChangedEventNormalizer.RawAuditInput r : mockRecords) {
                if (r.createdDate >= windowStart && r.createdDate <= windowEnd) {
                    res.add(r);
                }
            }
            return res;
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