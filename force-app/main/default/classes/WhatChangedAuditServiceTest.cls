/**
 * @description Unit tests for WhatChangedAuditService
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedAuditServiceTest {

    @TestSetup
    static void setup() {
        WhatChangedSecurity.setBypassForTests(true);
    }

    @IsTest
    static void testGetChangeSummaryWithMockRepo() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        Test.startTest();
        WhatChangedDtos.ChangeSummaryDTO summary = WhatChangedAuditService.getChangeSummary();
        Test.stopTest();

        System.assertNotEquals(null, summary, 'Summary should not be null');
        System.assert(summary.totalChangesToday >= 0, 'Total changes calculated');
        System.assertNotEquals(null, summary.hourlyActivity, 'Hourly distribution generated');
        System.assertNotEquals(null, summary.categoryMix, 'Category mix generated');
        System.assertNotEquals(null, summary.attentionItems, 'Attention items generated');
    }

    @IsTest
    static void testGetChangeSummaryWithDateRange() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        Test.startTest();
        WhatChangedDtos.ChangeSummaryDTO summary = WhatChangedAuditService.getChangeSummary(
            System.now().addDays(-7), System.now()
        );
        Test.stopTest();

        System.assertNotEquals(null, summary);
        System.assert(summary.totalChangesToday >= 0);
    }

    @IsTest
    static void testGetEventsWithFiltersAndPagination() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        Test.startTest();
        WhatChangedDtos.ChangeEventsResponseDTO res = WhatChangedAuditService.getEvents(
            System.now().addDays(-1), System.now().addDays(1), 'ALL', 'ALL', null, null, null, 10, null, null, 30
        );
        Test.stopTest();

        System.assertNotEquals(null, res, 'Response should not be null');
        System.assert(res.events.size() > 0, 'Events returned');
        System.assertNotEquals(null, res.pageInfo, 'PageInfo populated');
    }

    @IsTest
    static void testGetEventsIncidentMode() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        Test.startTest();
        WhatChangedDtos.ChangeEventsResponseDTO res = WhatChangedAuditService.getEvents(
            null, null, null, null, null, null, null, 10, null, System.now().addMinutes(-20), 30
        );
        Test.stopTest();

        System.assertNotEquals(null, res, 'Incident mode response should return');
    }

    @IsTest
    static void testGetContributors() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        Test.startTest();
        List<WhatChangedDtos.ContributorDTO> contributors = WhatChangedAuditService.getContributors(
            System.now().addDays(-7), System.now()
        );
        Test.stopTest();

        System.assertNotEquals(null, contributors, 'Contributors list should not be null');
        System.assert(contributors.size() > 0, 'Contributors found from mock records');
        System.assert(contributors[0].totalChanges > 0, 'Contributor has changes');
    }

    @IsTest
    static void testGetInsights() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        Test.startTest();
        WhatChangedDtos.InsightsDTO insights = WhatChangedAuditService.getInsights('7d');
        Test.stopTest();

        System.assertNotEquals(null, insights, 'Insights returned');
        System.assertEquals(7, insights.dailyTrends.size(), '7 days trend returned');
        System.assertEquals(24, insights.hourlyTrends.size(), '24 hours trend returned');
    }
}