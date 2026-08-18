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
}