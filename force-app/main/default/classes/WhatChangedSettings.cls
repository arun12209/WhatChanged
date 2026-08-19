/**
 * @description Central configuration for WhatChanged, backed by WhatChanged_Setting__mdt.
 * Falls back to safe defaults when no custom metadata record is deployed.
 * @group WhatChanged
 */
public with sharing class WhatChangedSettings {

    public static final String DEFAULT_RECORD_NAME = 'Default';

    @TestVisible
    private static WhatChanged_Setting__mdt testOverride;

    private static WhatChanged_Setting__mdt cached;
    private static Boolean loaded = false;

    private static WhatChanged_Setting__mdt getRecord() {
        if (testOverride != null) {
            return testOverride;
        }
        if (!loaded) {
            loaded = true;
            cached = WhatChanged_Setting__mdt.getInstance(DEFAULT_RECORD_NAME);
        }
        return cached;
    }

    /** @description Apex class implementing WhatChangedClassifier.IClassificationStrategy */
    public static String getClassifierStrategyClass() {
        WhatChanged_Setting__mdt rec = getRecord();
        return (rec != null && String.isNotBlank(rec.Classifier_Strategy_Class__c))
            ? rec.Classifier_Strategy_Class__c
            : null;
    }

    /** @description Minimum access-related changes per day before an attention item is raised */
    public static Integer getAttentionAccessThreshold() {
        WhatChanged_Setting__mdt rec = getRecord();
        return (rec != null && rec.Attention_Access_Threshold__c != null)
            ? rec.Attention_Access_Threshold__c.intValue()
            : 5;
    }

    /** @description Minimum automation changes per day before an attention item is raised */
    public static Integer getAttentionAutomationThreshold() {
        WhatChanged_Setting__mdt rec = getRecord();
        return (rec != null && rec.Attention_Automation_Threshold__c != null)
            ? rec.Attention_Automation_Threshold__c.intValue()
            : 5;
    }

    /** @description How many of the most recent rows in range the distribution sample covers */
    public static Integer getAggregateSampleLimit() {
        WhatChanged_Setting__mdt rec = getRecord();
        Integer sampleLimit = (rec != null && rec.Aggregate_Sample_Limit__c != null)
            ? rec.Aggregate_Sample_Limit__c.intValue()
            : 2000;
        return Math.min(Math.max(sampleLimit, 200), 5000);
    }

    /** @description Upper bound on repository scan iterations per request when filters cannot be pushed into SOQL */
    public static Integer getMaxScanIterations() {
        WhatChanged_Setting__mdt rec = getRecord();
        Integer iters = (rec != null && rec.Max_Scan_Iterations__c != null) ? rec.Max_Scan_Iterations__c.intValue() : 20;
        return Math.min(Math.max(iters, 1), 50);
    }
}
