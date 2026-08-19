/**
 * @description Smoke tests that execute the REAL SetupAuditTrail SOQL paths of
 * SalesforceSetupAuditRepository. SetupAuditTrail rows cannot be inserted in tests, so
 * these assert the queries are VALID (no INVALID_FIELD / non-filterable-field errors)
 * rather than asserting row contents. This guards against regressions like filtering on
 * SetupAuditTrail.Display/Section, which are not filterable and previously caused
 * runtime 500s that unit tests with mock repositories could never catch.
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedLiveSoqlSmokeTest {

    private static WhatChangedAuditRepository.SalesforceSetupAuditRepository repo() {
        return new WhatChangedAuditRepository.SalesforceSetupAuditRepository();
    }

    @IsTest
    static void testQueryEventsWithAllParametersIsValidSoql() {
        Test.startTest();
        List<WhatChangedEventNormalizer.RawAuditInput> rows = repo().queryEvents(
            System.now().addDays(-7),
            System.now(),
            null,
            'Manage Users',            // must NOT reach SOQL (not filterable)
            'permission set',          // must NOT reach SOQL (Display not filterable)
            'ACCESS',                  // post-filtered by service
            new Set<String>{ 'HIGH' }, // post-filtered by service
            50,
            null
        );
        Test.stopTest();
        System.assertNotEquals(null, rows, 'Query executed without INVALID_FIELD errors');
    }

    @IsTest
    static void testQueryEventsWithCursorIsValidSoql() {
        String cursor = WhatChangedAuditRepository.buildCursor(System.now(), '0Yt000000000001EAA');
        Test.startTest();
        List<WhatChangedEventNormalizer.RawAuditInput> rows = repo().queryEvents(
            System.now().addDays(-1), System.now(), null, null, null, null, null, 10, cursor
        );
        Test.stopTest();
        System.assertNotEquals(null, rows, 'Keyset cursor query executed');
    }

    @IsTest
    static void testCursorRoundTrip() {
        DateTime dt = DateTime.newInstanceGmt(2026, 8, 19, 10, 15, 30);
        String cursor = WhatChangedAuditRepository.buildCursor(dt, '0Yt000000000001EAA');
        WhatChangedAuditRepository.CursorValue cv = WhatChangedAuditRepository.parseCursor(cursor);

        System.assertNotEquals(null, cv, 'Cursor parses back');
        System.assertEquals(dt, cv.createdDate, 'Cursor datetime round-trips exactly');
        System.assertEquals('0Yt000000000001EAA', cv.recordId, 'Cursor id round-trips');
        System.assertEquals(null, WhatChangedAuditRepository.parseCursor('garbage'), 'Malformed cursor returns null');
        System.assertEquals(null, WhatChangedAuditRepository.parseCursor('bad_cursor'), 'Unparseable date returns null');
    }

    @IsTest
    static void testCountAndPerDayCountsAreValidSoql() {
        Test.startTest();
        Integer total = repo().countEvents(System.now().addDays(-3), System.now());
        Map<Date, Integer> byDay = repo().countByDay(System.now().addDays(-3), System.now());
        Test.stopTest();

        System.assert(total >= 0, 'Count query executed');
        System.assertEquals(4, byDay.size(), 'One bucket per day inclusive of boundary days');
    }

    @IsTest
    static void testAggregateSamplesAreValidSoql() {
        WhatChangedSettings.testOverride = new WhatChanged_Setting__mdt(Aggregate_Sample_Limit__c = 200);
        WhatChangedAuditRepository.SalesforceSetupAuditRepository liveRepo = repo();

        Test.startTest();
        Map<String, Integer> byCat = liveRepo.countByCategory(System.now().addDays(-1), System.now());
        Map<String, Integer> bySev = liveRepo.countBySeverity(System.now().addDays(-1), System.now());
        Map<Integer, Integer> byHour = liveRepo.countByHour(System.now().addDays(-1), System.now());
        Map<String, Integer> bySec = liveRepo.countBySection(System.now().addDays(-1), System.now());
        List<WhatChangedAuditRepository.ActorStat> actors = liveRepo.actorStats(System.now().addDays(-1), System.now());
        Test.stopTest();

        System.assertNotEquals(null, byCat);
        System.assertNotEquals(null, bySev);
        System.assertNotEquals(null, byHour);
        System.assertNotEquals(null, bySec);
        System.assertNotEquals(null, actors);
    }

    @IsTest
    static void testQueryEventsAroundTimeIsValidSoql() {
        Test.startTest();
        List<WhatChangedEventNormalizer.RawAuditInput> rows = repo().queryEventsAroundTime(System.now().addHours(-1), 30);
        Test.stopTest();
        System.assertNotEquals(null, rows, 'Incident window query executed');
    }
}
