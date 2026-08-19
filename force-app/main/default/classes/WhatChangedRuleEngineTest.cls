/**
 * @description Unit tests for custom-metadata-driven classification rules and the
 * pluggable strategy resolution in WhatChangedClassifier.
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedRuleEngineTest {

    private static WhatChanged_Classification_Rule__mdt rule(
        Decimal sortOrder, String actionContains, String sectionContains, String displayContains,
        String category, String severity
    ) {
        return new WhatChanged_Classification_Rule__mdt(
            Sort_Order__c = sortOrder,
            Is_Active__c = true,
            Match_Action_Contains__c = actionContains,
            Match_Section_Contains__c = sectionContains,
            Match_Display_Contains__c = displayContains,
            Category__c = category,
            Severity__c = severity
        );
    }

    @IsTest
    static void testRuleOverridesCategoryAndSeverity() {
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>{
            rule(10, null, null, 'data export', 'SECURITY', 'CRITICAL')
        };

        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'dataexport', 'Data Management', 'Scheduled a weekly Data Export', null
        );

        System.assertEquals('SECURITY', result.category, 'Rule category applied');
        System.assertEquals('CRITICAL', result.severity, 'Rule severity applied');
    }

    @IsTest
    static void testFirstMatchingRuleWinsBySortOrder() {
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>{
            rule(1, 'flow', null, null, 'DEPLOYMENT', 'LOW'),
            rule(2, 'flow', null, null, 'AUTOMATION', 'CRITICAL')
        };

        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'flowactivated', 'Process Automation', 'Activated Flow X', null
        );

        System.assertEquals('DEPLOYMENT', result.category, 'First rule in sort order wins');
        System.assertEquals('LOW', result.severity);
    }

    @IsTest
    static void testAllNonBlankCriteriaMustMatch() {
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>{
            rule(1, 'flow', 'Security', null, 'SECURITY', 'HIGH')
        };

        // Action matches but Section does not -> rule skipped, engine fallback applies
        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'flowactivated', 'Process Automation', 'Activated Flow X', null
        );

        System.assertEquals(WhatChangedClassifier.CAT_AUTOMATION, result.category, 'Falls back to built-in engine');
    }

    @IsTest
    static void testRuleWithBlankSeverityKeepsEngineSeverity() {
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>{
            rule(1, 'sessionsettings', null, null, 'SECURITY', null)
        };

        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'sessionsettingschanged', 'Security', 'Changed session settings', null
        );

        System.assertEquals('SECURITY', result.category);
        System.assertEquals(WhatChangedClassifier.SEV_HIGH, result.severity, 'Engine severity for SECURITY category');
    }

    @IsTest
    static void testInvalidRuleCategoryFallsBackToEngine() {
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>{
            rule(1, 'flowactivated', null, null, 'NOT_A_CATEGORY', null)
        };

        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'flowactivated', 'Process Automation', 'Activated Flow X', null
        );

        System.assertEquals(WhatChangedClassifier.CAT_AUTOMATION, result.category, 'Invalid rule category ignored');
    }

    @IsTest
    static void testNoActiveRulesUsesBuiltInEngine() {
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>();

        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'changedfieldperms', 'Manage Users', 'Changed field permissions in permission set X', null
        );

        System.assertEquals(WhatChangedClassifier.CAT_ACCESS, result.category);
        System.assertEquals(WhatChangedClassifier.SEV_HIGH, result.severity);
    }

    @IsTest
    static void testConfiguredStrategyClassIsResolved() {
        WhatChangedSettings.testOverride = new WhatChanged_Setting__mdt(
            Classifier_Strategy_Class__c = 'WhatChangedClassifier.DefaultClassificationStrategy'
        );
        WhatChangedClassifier.setStrategyForTests(null);
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>();

        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'flowactivated', 'Process Automation', 'Activated Flow X', null
        );

        System.assertEquals(WhatChangedClassifier.CAT_AUTOMATION, result.category, 'Configured strategy resolves and classifies');
    }

    @IsTest
    static void testUnknownStrategyClassFallsBackToDefault() {
        WhatChangedSettings.testOverride = new WhatChanged_Setting__mdt(
            Classifier_Strategy_Class__c = 'DoesNotExistClass123'
        );
        WhatChangedClassifier.setStrategyForTests(null);
        WhatChangedClassifier.rulesForTests = new List<WhatChanged_Classification_Rule__mdt>();

        WhatChangedClassifier.ClassificationResult result = WhatChangedClassifier.classify(
            'flowactivated', 'Process Automation', 'Activated Flow X', null
        );

        System.assertEquals(WhatChangedClassifier.CAT_AUTOMATION, result.category, 'Falls back to default strategy');
    }
}
