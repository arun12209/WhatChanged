/**
 * @description Unit tests for WhatChangedClassifier
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedClassifierTest {

    @IsTest
    static void testAutomationClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'flowactivated', 'Process Automation', 'Activated Flow Account_Move_Wizard version 3', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_AUTOMATION, res.category, 'Should classify flow as AUTOMATION');
        System.assertEquals(WhatChangedClassifier.SEV_MEDIUM, res.severity, 'Flow activation should be MEDIUM severity');
    }

    @IsTest
    static void testAccessAndCriticalClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'changedperms', 'Manage Users', 'Granted Modify All Data permission in Profile System Administrator', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_ACCESS, res.category, 'Should classify as ACCESS');
        System.assertEquals(WhatChangedClassifier.SEV_CRITICAL, res.severity, 'Modify All Data should be CRITICAL severity');
    }

    @IsTest
    static void testSecurityClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'sessionsettingschanged', 'Security', 'Changed session settings: timeout updated to 120 minutes', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_SECURITY, res.category, 'Should classify as SECURITY');
        System.assertEquals(WhatChangedClassifier.SEV_HIGH, res.severity, 'Security settings should be HIGH severity');
    }

    @IsTest
    static void testDataModelClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'customfieldcreated', 'Custom Objects', 'Created Custom Field Opportunity.Discount_Approved__c', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_DATA_MODEL, res.category, 'Should classify as DATA_MODEL');
        System.assertEquals(WhatChangedClassifier.SEV_MEDIUM, res.severity, 'Field creation should be MEDIUM severity');
    }

    @IsTest
    static void testCodeClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'apexclasscreated', 'Apex Classes', 'Created Apex Class OrderProcessingQueueable', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_CODE, res.category, 'Should classify as CODE');
    }

    @IsTest
    static void testUIClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'pagelayoutupdated', 'Page Layouts', 'Updated Page Layout Account Layout', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_UI, res.category, 'Should classify as UI');
        System.assertEquals(WhatChangedClassifier.SEV_LOW, res.severity, 'Page layout should be LOW severity');
    }

    @IsTest
    static void testIntegrationClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'namedcredentialupdated', 'Security Controls', 'Updated Named Credential PaymentGateway', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_INTEGRATION, res.category, 'Should classify as INTEGRATION');
    }

    @IsTest
    static void testDeploymentClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'deploypackage', 'Deployment', 'Deployed metadata package v2.1.0', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_DEPLOYMENT, res.category, 'Should classify as DEPLOYMENT');
    }

    @IsTest
    static void testUnknownFallbackClassification() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(
            'unknown_action_xyz', 'MysterySection', 'Some random unmapped text', null
        );
        System.assertEquals(WhatChangedClassifier.CAT_OTHER, res.category, 'Unknown action should safely default to OTHER');
        System.assertEquals(WhatChangedClassifier.SEV_INFO, res.severity, 'Unknown action should default to INFO');
    }

    @IsTest
    static void testNullInputsSafelyHandled() {
        WhatChangedClassifier.ClassificationResult res = WhatChangedClassifier.classify(null, null, null, null);
        System.assertEquals(WhatChangedClassifier.CAT_OTHER, res.category);
        System.assertEquals(WhatChangedClassifier.SEV_INFO, res.severity);
    }
}