/**
 * @description Unit tests for WhatChangedSettings defaults and overrides
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedSettingsTest {

    @IsTest
    static void testDefaultsWhenNoRecord() {
        WhatChangedSettings.testOverride = new WhatChanged_Setting__mdt();

        System.assertEquals(null, WhatChangedSettings.getClassifierStrategyClass(), 'No strategy by default');
        System.assertEquals(5, WhatChangedSettings.getAttentionAccessThreshold(), 'Default access threshold');
        System.assertEquals(5, WhatChangedSettings.getAttentionAutomationThreshold(), 'Default automation threshold');
        System.assertEquals(2000, WhatChangedSettings.getAggregateSampleLimit(), 'Default sample limit');
        System.assertEquals(20, WhatChangedSettings.getMaxScanIterations(), 'Default scan iterations');
    }

    @IsTest
    static void testConfiguredValuesAndClamping() {
        WhatChanged_Setting__mdt rec = new WhatChanged_Setting__mdt(
            Classifier_Strategy_Class__c = 'WhatChangedClassifier.DefaultClassificationStrategy',
            Attention_Access_Threshold__c = 10,
            Attention_Automation_Threshold__c = 3,
            Aggregate_Sample_Limit__c = 99999,
            Max_Scan_Iterations__c = 0
        );
        WhatChangedSettings.testOverride = rec;

        System.assertEquals('WhatChangedClassifier.DefaultClassificationStrategy', WhatChangedSettings.getClassifierStrategyClass());
        System.assertEquals(10, WhatChangedSettings.getAttentionAccessThreshold());
        System.assertEquals(3, WhatChangedSettings.getAttentionAutomationThreshold());
        System.assertEquals(5000, WhatChangedSettings.getAggregateSampleLimit(), 'Sample limit clamped to max 5000');
        System.assertEquals(1, WhatChangedSettings.getMaxScanIterations(), 'Scan iterations clamped to min 1');
    }
}
