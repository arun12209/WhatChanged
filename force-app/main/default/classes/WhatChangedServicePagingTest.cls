/**
 * @description Tests for filtered pagination correctness, severity parsing (incl. ELEVATED),
 * and summary accuracy in WhatChangedAuditService.
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedServicePagingTest {

    private static WhatChangedEventNormalizer.RawAuditInput flowEvent(Integer index, DateTime eventTime) {
        WhatChangedEventNormalizer.RawAuditInput r = new WhatChangedEventNormalizer.RawAuditInput();
        r.id = '0Yt00000000' + String.valueOf(1000 + index);
        r.action = 'flowactivated';
        r.section = 'Process Automation';
        r.display = 'Activated Flow Bulk_Test_Flow_' + index;
        r.createdDate = eventTime;
        r.actorId = '005000000000009';
        r.actorName = 'Flow Admin';
        return r;
    }

    private static WhatChangedAuditRepository.FakeAuditRepository seedRepo(Integer flowCount) {
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        fakeRepo.clearRecords();
        DateTime base = System.now().addMinutes(-5);
        for (Integer i = 0; i < flowCount; i++) {
            fakeRepo.addRecord(flowEvent(i, base.addMinutes(-i)));
        }
        WhatChangedAuditRepository.setMock(fakeRepo);
        return fakeRepo;
    }

    @IsTest
    static void testParseSeverities() {
        System.assertEquals(null, WhatChangedAuditService.parseSeverities(null), 'Blank -> no filter');
        System.assertEquals(null, WhatChangedAuditService.parseSeverities('ALL'), 'ALL -> no filter');
        System.assertEquals(new Set<String>{ 'HIGH' }, WhatChangedAuditService.parseSeverities('high'));
        System.assertEquals(new Set<String>{ 'HIGH', 'CRITICAL' }, WhatChangedAuditService.parseSeverities('ELEVATED'));
        System.assertEquals(new Set<String>{ 'LOW', 'MEDIUM' }, WhatChangedAuditService.parseSeverities('LOW,MEDIUM'));
        System.assertEquals(null, WhatChangedAuditService.parseSeverities('BOGUS'), 'Unknown values ignored');
    }

    @IsTest
    static void testFilteredPaginationReturnsFullPagesAndHasNext() {
        WhatChangedSecurity.setBypassForTests(true);
        seedRepo(12);

        Test.startTest();
        WhatChangedDtos.ChangeEventsResponseDTO page1 = WhatChangedAuditService.getEvents(
            System.now().addDays(-1), System.now().addDays(1),
            'AUTOMATION', 'ALL', null, null, null, 5, null, null, 30
        );
        Test.stopTest();

        System.assertEquals(5, page1.events.size(), 'Full page despite category filter');
        System.assertEquals(true, page1.pageInfo.hasNextPage, 'More filtered results exist');
        System.assertNotEquals(null, page1.pageInfo.nextCursor, 'Cursor provided');

        WhatChangedDtos.ChangeEventsResponseDTO page2 = WhatChangedAuditService.getEvents(
            System.now().addDays(-1), System.now().addDays(1),
            'AUTOMATION', 'ALL', null, null, null, 5, page1.pageInfo.nextCursor, null, 30
        );
        System.assertEquals(5, page2.events.size(), 'Second full page');

        // No overlap between pages
        Set<String> page1Ids = new Set<String>();
        for (WhatChangedDtos.ChangeEventDTO e : page1.events) page1Ids.add(e.id);
        for (WhatChangedDtos.ChangeEventDTO e : page2.events) {
            System.assert(!page1Ids.contains(e.id), 'Pages must not overlap: ' + e.id);
        }

        WhatChangedDtos.ChangeEventsResponseDTO page3 = WhatChangedAuditService.getEvents(
            System.now().addDays(-1), System.now().addDays(1),
            'AUTOMATION', 'ALL', null, null, null, 5, page2.pageInfo.nextCursor, null, 30
        );
        System.assertEquals(2, page3.events.size(), 'Remaining events');
        System.assertEquals(false, page3.pageInfo.hasNextPage, 'Exhausted');
    }

    @IsTest
    static void testNonMatchingCategoryReturnsEmptyWithoutHasNext() {
        WhatChangedSecurity.setBypassForTests(true);
        seedRepo(12);

        WhatChangedDtos.ChangeEventsResponseDTO res = WhatChangedAuditService.getEvents(
            System.now().addDays(-1), System.now().addDays(1),
            'SECURITY', 'ALL', null, null, null, 5, null, null, 30
        );
        System.assertEquals(0, res.events.size(), 'No SECURITY events seeded');
        System.assertEquals(false, res.pageInfo.hasNextPage, 'Nothing further to load');
    }

    @IsTest
    static void testElevatedSeverityFilterIncludesHighAndCritical() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);
        // Default seed contains ACCESS/HIGH ("Changed field permissions...") and SECURITY/HIGH events

        WhatChangedDtos.ChangeEventsResponseDTO res = WhatChangedAuditService.getEvents(
            System.now().addDays(-1), System.now().addDays(1),
            'ALL', 'ELEVATED', null, null, null, 50, null, null, 30
        );

        System.assert(res.events.size() > 0, 'Elevated events returned');
        for (WhatChangedDtos.ChangeEventDTO e : res.events) {
            System.assert(e.severity == 'HIGH' || e.severity == 'CRITICAL',
                'Only HIGH/CRITICAL expected, got ' + e.severity);
        }
    }

    @IsTest
    static void testSummaryTotalIsNotCappedBySampleSize() {
        WhatChangedSecurity.setBypassForTests(true);
        seedRepo(230); // more than the old hardcoded 200-row cap

        Test.startTest();
        WhatChangedDtos.ChangeSummaryDTO summary = WhatChangedAuditService.getChangeSummary();
        Test.stopTest();

        System.assertEquals(230, summary.totalChangesToday, 'Exact count, not capped at 200');
        System.assertEquals(230, summary.automationChangesToday, 'Category counts cover all events');
        System.assertEquals(10, summary.recentChanges.size(), 'Top 10 recent changes');
    }

    @IsTest
    static void testSearchFilterMatchesDisplayText() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        WhatChangedDtos.ChangeEventsResponseDTO res = WhatChangedAuditService.getEvents(
            System.now().addDays(-1), System.now().addDays(1),
            'ALL', 'ALL', null, null, 'AnnualRevenue', 50, null, null, 30
        );

        System.assertEquals(1, res.events.size(), 'Display-text search matches one seeded event');
        System.assert(res.events[0].rawDisplay.contains('AnnualRevenue'), 'Correct event matched');
    }
}
