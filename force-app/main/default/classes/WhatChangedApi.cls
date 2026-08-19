/**
 * @description Apex REST resource exposing WhatChanged Change Intelligence endpoints:
 * GET /services/apexrest/what-changed/v1/summary
 * GET /services/apexrest/what-changed/v1/events
 * GET /services/apexrest/what-changed/v1/people   (accepts from/to or range=24h|7d|30d)
 * GET /services/apexrest/what-changed/v1/insights (accepts range=24h|7d|30d)
 *
 * Error contract: failures return { error: { code, message } } where message includes a
 * correlation id that is also written to the Apex debug log with the full stack trace.
 * @group WhatChanged
 */
@RestResource(urlMapping='/what-changed/v1/*')
global with sharing class WhatChangedApi {

    @HttpGet
    global static void handleGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        if (res == null) {
            res = new RestResponse();
            RestContext.response = res;
        }
        res.addHeader('Content-Type', 'application/json');

        try {
            // Security check
            WhatChangedSecurity.requireAccess();

            String path = req != null && req.requestURI != null ? req.requestURI.toLowerCase() : '';
            Map<String, String> params = req != null && req.params != null ? req.params : new Map<String, String>();

            if (path.endsWith('/summary')) {
                WhatChangedDtos.ChangeSummaryDTO summary = WhatChangedAuditService.getChangeSummary();
                res.statusCode = 200;
                res.responseBody = Blob.valueOf(JSON.serialize(summary));
                return;
            }

            if (path.endsWith('/events')) {
                DateTime fromDate = parseDateTime(params.get('from'));
                DateTime toDate = parseDateTime(params.get('to'));
                String category = params.get('category');
                String severity = params.get('severity');
                String actorId = params.get('actorId');
                String section = params.get('section');
                String search = params.get('search');
                Integer limitRows = parseInteger(params.get('limit'), 50);
                String cursor = params.get('cursor');
                DateTime incidentTime = parseDateTime(params.get('incidentTime'));
                Integer incidentWindow = parseInteger(params.get('incidentWindowMinutes'), 30);

                WhatChangedDtos.ChangeEventsResponseDTO response = WhatChangedAuditService.getEvents(
                    fromDate, toDate, category, severity, actorId, section, search, limitRows, cursor, incidentTime, incidentWindow
                );
                res.statusCode = 200;
                res.responseBody = Blob.valueOf(JSON.serialize(response));
                return;
            }

            if (path.endsWith('/people')) {
                DateTime fromDate = parseDateTime(params.get('from'));
                DateTime toDate = parseDateTime(params.get('to'));
                if (fromDate == null) {
                    fromDate = System.now().addDays(-rangeToDays(params.get('range'), 7));
                }
                if (toDate == null) {
                    toDate = System.now();
                }

                List<WhatChangedDtos.ContributorDTO> contributors = WhatChangedAuditService.getContributors(fromDate, toDate);
                res.statusCode = 200;
                res.responseBody = Blob.valueOf(JSON.serialize(contributors));
                return;
            }

            if (path.endsWith('/insights')) {
                String range = params.containsKey('range') ? params.get('range') : '7d';
                WhatChangedDtos.InsightsDTO insights = WhatChangedAuditService.getInsights(range);
                res.statusCode = 200;
                res.responseBody = Blob.valueOf(JSON.serialize(insights));
                return;
            }

            // Unknown route
            res.statusCode = 404;
            res.responseBody = Blob.valueOf(JSON.serialize(new WhatChangedDtos.ErrorResponseDTO(
                'NOT_FOUND', 'Unknown WhatChanged endpoint requested: ' + path
            )));

        } catch (WhatChangedSecurity.WhatChangedSecurityException secEx) {
            res.statusCode = 403;
            res.responseBody = Blob.valueOf(JSON.serialize(new WhatChangedDtos.ErrorResponseDTO(
                'FORBIDDEN', secEx.getMessage()
            )));
        } catch (QueryException qEx) {
            String errorId = newErrorId();
            logError(errorId, qEx);
            res.statusCode = 500;
            String permissionHint = qEx.getMessage() != null && qEx.getMessage().containsIgnoreCase('sObject type')
                ? ' You may be missing the "View Setup and Configuration" permission.'
                : '';
            res.responseBody = Blob.valueOf(JSON.serialize(new WhatChangedDtos.ErrorResponseDTO(
                'QUERY_ERROR',
                'Change history query failed: ' + qEx.getMessage() + permissionHint + ' (error id: ' + errorId + ')'
            )));
        } catch (Exception ex) {
            String errorId = newErrorId();
            logError(errorId, ex);
            res.statusCode = 500;
            res.responseBody = Blob.valueOf(JSON.serialize(new WhatChangedDtos.ErrorResponseDTO(
                'INTERNAL_ERROR',
                ex.getTypeName() + ': ' + ex.getMessage() + ' (error id: ' + errorId + ')'
            )));
        }
    }

    private static String newErrorId() {
        return 'WC-' + String.valueOf(Math.abs(Crypto.getRandomInteger())).left(8);
    }

    private static void logError(String errorId, Exception ex) {
        System.debug(LoggingLevel.ERROR,
            'WhatChanged API error ' + errorId + ' | ' + ex.getTypeName() + ': ' + ex.getMessage() +
            '\n' + ex.getStackTraceString());
    }

    private static Integer rangeToDays(String range, Integer defaultDays) {
        if (String.isBlank(range)) return defaultDays;
        if (range == '24h') return 1;
        if (range == '7d') return 7;
        if (range == '30d') return 30;
        return defaultDays;
    }

    private static DateTime parseDateTime(String isoStr) {
        if (String.isBlank(isoStr)) return null;
        try {
            // ISO-8601 parsing e.g. 2026-08-17T12:00:00.000Z, 2026-08-17T12:00:00Z, or 2026-08-17
            String clean = isoStr.trim().replace('Z', '').replace('T', ' ');
            if (clean.contains('.')) {
                clean = clean.substring(0, clean.indexOf('.'));
            }
            if (clean.length() == 10) {
                clean += ' 00:00:00';
            }
            return DateTime.valueOfGmt(clean);
        } catch (Exception e) {
            return null;
        }
    }

    private static Integer parseInteger(String intStr, Integer defaultValue) {
        if (String.isBlank(intStr)) return defaultValue;
        try {
            return Integer.valueOf(intStr);
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
