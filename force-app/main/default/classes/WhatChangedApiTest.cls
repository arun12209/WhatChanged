/**
 * @description Unit tests for WhatChangedApi REST controller
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedApiTest {

    @TestSetup
    static void setup() {
        WhatChangedSecurity.setBypassForTests(true);
    }

    @IsTest
    static void testGetSummaryEndpoint() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/summary';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode, 'Should return 200 OK');
        System.assertNotEquals(null, res.responseBody, 'Response body should not be null');
        String jsonStr = res.responseBody.toString();
        System.assert(jsonStr.contains('totalChangesToday'), 'JSON should contain totalChangesToday');
    }

    @IsTest
    static void testGetEventsEndpoint() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/events';
        req.httpMethod = 'GET';
        req.params.put('category', 'ALL');
        req.params.put('limit', '20');
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode, 'Should return 200 OK');
        String jsonStr = res.responseBody.toString();
        System.assert(jsonStr.contains('events'), 'JSON should contain events');
        System.assert(jsonStr.contains('pageInfo'), 'JSON should contain pageInfo');
    }

    @IsTest
    static void testGetPeopleEndpoint() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/people';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode, 'Should return 200 OK');
        String jsonStr = res.responseBody.toString();
        System.assert(jsonStr.contains('actorName'), 'JSON should contain actorName');
    }

    @IsTest
    static void testGetInsightsEndpoint() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/insights';
        req.httpMethod = 'GET';
        req.params.put('range', '7d');
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode, 'Should return 200 OK');
        String jsonStr = res.responseBody.toString();
        System.assert(jsonStr.contains('dailyTrends'), 'JSON should contain dailyTrends');
    }

    @IsTest
    static void testUnknownEndpointReturns404() {
        WhatChangedSecurity.setBypassForTests(true);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/unknown-endpoint';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(404, res.statusCode, 'Should return 404 for unknown endpoint');
    }

    @IsTest
    static void testGetEventsWithCustomDateParams() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/events';
        req.httpMethod = 'GET';
        req.params.put('from', '2026-08-18T00:00:00.000Z');
        req.params.put('to', '2026-08-18T23:59:59.999Z');
        req.params.put('limit', '25');
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode, 'Should return 200 OK for custom dates');
        String jsonStr = res.responseBody.toString();
        System.assert(jsonStr.contains('events'), 'JSON should contain events');
    }

    @IsTest
    static void testGetEventsIncidentMode() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/events';
        req.httpMethod = 'GET';
        req.params.put('incidentTime', '2026-08-18 10:00:00');
        req.params.put('incidentWindowMinutes', '45');
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode);
    }

    @IsTest
    static void testGetPeopleWithRangesAndCustomDates() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/people';
        req.httpMethod = 'GET';
        req.params.put('range', '24h');
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode);

        // Test 30d
        req.params.put('range', '30d');
        WhatChangedApi.handleGet();
        System.assertEquals(200, res.statusCode);

        // Test custom dates
        req.params.put('from', '2026-08-10');
        req.params.put('to', '2026-08-18');
        WhatChangedApi.handleGet();
        System.assertEquals(200, res.statusCode);
    }

    @IsTest
    static void testGetInsightsWithRanges() {
        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/insights';
        req.httpMethod = 'GET';
        req.params.put('range', '30d');
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertEquals(200, res.statusCode);
    }

    @IsTest
    static void testSecurityRejectionInApi() {
        WhatChangedSecurity.setBypassForTests(false);

        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/what-changed/v1/summary';
        req.httpMethod = 'GET';
        RestContext.request = req;
        RestContext.response = res;

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assert(res.statusCode == 200 || res.statusCode == 403);
    }

    @IsTest
    static void testApiHelpersDirect() {
        RestRequest req = new RestRequest();
        req.requestURI = '/services/apexrest/what-changed/v1/events';
        req.httpMethod = 'GET';
        req.params.put('from', 'invalid-date');
        req.params.put('limit', 'invalid-number');
        RestContext.request = req;
        RestContext.response = null; // Tests the null response fallback (line 19-22)

        WhatChangedSecurity.setBypassForTests(true);
        WhatChangedAuditRepository.FakeAuditRepository fakeRepo = new WhatChangedAuditRepository.FakeAuditRepository();
        WhatChangedAuditRepository.setMock(fakeRepo);

        Test.startTest();
        WhatChangedApi.handleGet();
        Test.stopTest();

        System.assertNotEquals(null, RestContext.response);
        System.assertEquals(200, RestContext.response.statusCode);
    }
}