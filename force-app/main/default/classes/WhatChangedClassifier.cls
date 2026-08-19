/**
 * @description Extensible deterministic classification engine for Salesforce Setup Audit Trail events.
 * Maps Action, Section, Display, and Namespace to Category and Severity.
 *
 * Classification is pluggable:
 *  1. WhatChanged_Setting__mdt.Classifier_Strategy_Class__c may name any Apex class
 *     implementing IClassificationStrategy (resolved via Type.forName).
 *  2. The default strategy first evaluates admin-configurable WhatChanged_Classification_Rule__mdt
 *     records (ordered by Sort_Order__c); the first matching active rule wins.
 *  3. If no rule matches, the built-in keyword engine below is used.
 * @group WhatChanged
 */
public with sharing class WhatChangedClassifier {

    public static final String CAT_DEPLOYMENT = 'DEPLOYMENT';
    public static final String CAT_AUTOMATION = 'AUTOMATION';
    public static final String CAT_ACCESS = 'ACCESS';
    public static final String CAT_SECURITY = 'SECURITY';
    public static final String CAT_DATA_MODEL = 'DATA_MODEL';
    public static final String CAT_CODE = 'CODE';
    public static final String CAT_UI = 'UI';
    public static final String CAT_INTEGRATION = 'INTEGRATION';
    public static final String CAT_USER_ADMIN = 'USER_ADMIN';
    public static final String CAT_CONFIGURATION = 'CONFIGURATION';
    public static final String CAT_OTHER = 'OTHER';

    public static final String SEV_INFO = 'INFO';
    public static final String SEV_LOW = 'LOW';
    public static final String SEV_MEDIUM = 'MEDIUM';
    public static final String SEV_HIGH = 'HIGH';
    public static final String SEV_CRITICAL = 'CRITICAL';

    private static final Set<String> VALID_CATEGORIES = new Set<String>{
        CAT_DEPLOYMENT, CAT_AUTOMATION, CAT_ACCESS, CAT_SECURITY, CAT_DATA_MODEL,
        CAT_CODE, CAT_UI, CAT_INTEGRATION, CAT_USER_ADMIN, CAT_CONFIGURATION, CAT_OTHER
    };
    private static final Set<String> VALID_SEVERITIES = new Set<String>{
        SEV_INFO, SEV_LOW, SEV_MEDIUM, SEV_HIGH, SEV_CRITICAL
    };

    public class ClassificationResult {
        public String category;
        public String severity;

        public ClassificationResult(String category, String severity) {
            this.category = category;
            this.severity = severity;
        }
    }

    /**
     * @description Contract for pluggable classification strategies.
     */
    public interface IClassificationStrategy {
        ClassificationResult classify(String action, String section, String display, String namespace);
    }

    private static IClassificationStrategy strategyInstance;

    @TestVisible
    private static void setStrategyForTests(IClassificationStrategy strategy) {
        strategyInstance = strategy;
    }

    private static IClassificationStrategy getStrategy() {
        if (strategyInstance != null) {
            return strategyInstance;
        }
        String className = WhatChangedSettings.getClassifierStrategyClass();
        if (String.isNotBlank(className)) {
            try {
                Type t = Type.forName(className);
                if (t != null) {
                    Object candidate = t.newInstance();
                    if (candidate instanceof IClassificationStrategy) {
                        strategyInstance = (IClassificationStrategy) candidate;
                        return strategyInstance;
                    }
                }
                System.debug(LoggingLevel.WARN,
                    'WhatChanged: configured classifier strategy "' + className + '" not found or does not implement IClassificationStrategy; using default.');
            } catch (Exception ex) {
                System.debug(LoggingLevel.WARN,
                    'WhatChanged: failed to instantiate classifier strategy "' + className + '": ' + ex.getMessage());
            }
        }
        strategyInstance = new DefaultClassificationStrategy();
        return strategyInstance;
    }

    /**
     * @description Classifies a Setup Audit Trail record into Category and Severity
     */
    public static ClassificationResult classify(String action, String section, String display, String namespace) {
        return getStrategy().classify(action, section, display, namespace);
    }

    // ==================================================================================
    // Custom-metadata rule support
    // ==================================================================================

    @TestVisible
    private static List<WhatChanged_Classification_Rule__mdt> rulesForTests;

    private static List<WhatChanged_Classification_Rule__mdt> cachedRules;

    /**
     * @description Active classification rules, ordered by Sort_Order__c ascending.
     */
    public static List<WhatChanged_Classification_Rule__mdt> getActiveRules() {
        if (rulesForTests != null) {
            return rulesForTests;
        }
        if (cachedRules == null) {
            cachedRules = [
                SELECT DeveloperName, Sort_Order__c, Is_Active__c,
                       Match_Action_Contains__c, Match_Section_Contains__c, Match_Display_Contains__c,
                       Category__c, Severity__c
                FROM WhatChanged_Classification_Rule__mdt
                WHERE Is_Active__c = true
                ORDER BY Sort_Order__c ASC NULLS LAST
                LIMIT 500
            ];
        }
        return cachedRules;
    }

    /**
     * @description Default strategy: CMDT rules first, then the built-in keyword engine.
     */
    public class DefaultClassificationStrategy implements IClassificationStrategy {

        public ClassificationResult classify(String action, String section, String display, String namespace) {
            String act = action != null ? action.toLowerCase() : '';
            String sec = section != null ? section.toLowerCase() : '';
            String disp = display != null ? display.toLowerCase() : '';

            // 1. Admin-configured rules (first active match by sort order wins)
            for (WhatChanged_Classification_Rule__mdt rule : getActiveRules()) {
                if (ruleMatches(rule, act, sec, disp)) {
                    String cat = normalizeCategory(rule.Category__c);
                    String sev = normalizeSeverity(rule.Severity__c);
                    if (cat == null) {
                        cat = determineCategory(act, sec, disp, namespace);
                    }
                    if (sev == null) {
                        sev = determineSeverity(cat, act, sec, disp);
                    }
                    return new ClassificationResult(cat, sev);
                }
            }

            // 2. Built-in keyword engine
            String category = determineCategory(act, sec, disp, namespace);
            String severity = determineSeverity(category, act, sec, disp);
            return new ClassificationResult(category, severity);
        }

        private Boolean ruleMatches(WhatChanged_Classification_Rule__mdt rule, String act, String sec, String disp) {
            Boolean hasCriteria = false;
            if (String.isNotBlank(rule.Match_Action_Contains__c)) {
                hasCriteria = true;
                if (!act.contains(rule.Match_Action_Contains__c.toLowerCase().trim())) {
                    return false;
                }
            }
            if (String.isNotBlank(rule.Match_Section_Contains__c)) {
                hasCriteria = true;
                if (!sec.contains(rule.Match_Section_Contains__c.toLowerCase().trim())) {
                    return false;
                }
            }
            if (String.isNotBlank(rule.Match_Display_Contains__c)) {
                hasCriteria = true;
                if (!disp.contains(rule.Match_Display_Contains__c.toLowerCase().trim())) {
                    return false;
                }
            }
            return hasCriteria;
        }

        private String normalizeCategory(String raw) {
            if (String.isBlank(raw)) {
                return null;
            }
            String cat = raw.trim().toUpperCase();
            return VALID_CATEGORIES.contains(cat) ? cat : null;
        }

        private String normalizeSeverity(String raw) {
            if (String.isBlank(raw)) {
                return null;
            }
            String sev = raw.trim().toUpperCase();
            return VALID_SEVERITIES.contains(sev) ? sev : null;
        }
    }

    // ==================================================================================
    // Built-in keyword engine (default fallback)
    // ==================================================================================

    private static String determineCategory(String act, String sec, String disp, String namespace) {
        // 1. DEPLOYMENT & PACKAGING
        if (sec.contains('package') || sec.contains('deployment') || sec.contains('change set') ||
            act.contains('package') || act.contains('deploy') || disp.contains('installed package') ||
            disp.contains('uploaded package') || disp.contains('deployed metadata')) {
            return CAT_DEPLOYMENT;
        }

        // 2. AUTOMATION
        if (sec.contains('flow') || sec.contains('process builder') || sec.contains('workflow') ||
            sec.contains('approval') || sec.contains('orchestration') ||
            act.contains('flow') || act.contains('workflow') || act.contains('process') ||
            disp.contains('flow') || disp.contains('workflow rule') || disp.contains('process builder') ||
            disp.contains('approval process') || disp.contains('orchestration')) {
            return CAT_AUTOMATION;
        }

        // 3. INTEGRATION & APIS (Prioritized before Security Controls since Named Creds / Remote Sites are placed under Security Controls)
        if (sec.contains('connected app') || sec.contains('named credential') || sec.contains('remote site') ||
            sec.contains('csp') || sec.contains('external credential') || sec.contains('endpoint') ||
            act.contains('connectedapp') || act.contains('remotesite') || act.contains('namedcredential') ||
            disp.contains('connected app') || disp.contains('named credential') || disp.contains('remote site setting') ||
            disp.contains('csp trusted site') || disp.contains('external data source')) {
            return CAT_INTEGRATION;
        }

        // 4. ACCESS & PERMISSIONS
        if (sec.contains('permission set') || sec.contains('profile') || sec.contains('permission') ||
            sec.contains('role') || sec.contains('public group') || sec.contains('queue') ||
            act.contains('permission') || act.contains('profile') || act.contains('permset') ||
            disp.contains('permission set') || disp.contains('profile') || disp.contains('permission set group') ||
            disp.contains('field permissions') || disp.contains('object permissions') || disp.contains('user permissions')) {
            return CAT_ACCESS;
        }

        // 5. SECURITY & AUTHENTICATION
        if (sec.contains('security') || sec.contains('session') || sec.contains('auth') ||
            sec.contains('single sign-on') || sec.contains('sso') || sec.contains('certificate') ||
            sec.contains('sharing') || sec.contains('login') || sec.contains('ip range') ||
            act.contains('security') || act.contains('auth') || act.contains('sharing') ||
            disp.contains('session settings') || disp.contains('two-factor') || disp.contains('mfa') ||
            disp.contains('saml') || disp.contains('sharing rule') || disp.contains('trusted ip') ||
            disp.contains('password policy') || disp.contains('identity provider')) {
            return CAT_SECURITY;
        }

        // 6. DATA MODEL & SCHEMA
        if (sec.contains('custom object') || sec.contains('custom field') || sec.contains('field') ||
            sec.contains('schema') || sec.contains('record type') || sec.contains('validation rule') ||
            sec.contains('picklist') || sec.contains('relationship') ||
            act.contains('customfield') || act.contains('customobject') || act.contains('validationrule') ||
            disp.contains('custom field') || disp.contains('custom object') || disp.contains('record type') ||
            disp.contains('validation rule') || disp.contains('picklist value') || disp.contains('lookup relationship')) {
            return CAT_DATA_MODEL;
        }

        // 7. CODE & DEV METADATA
        if (sec.contains('apex') || sec.contains('visualforce') || sec.contains('lightning component') ||
            sec.contains('aura') || sec.contains('lwc') || sec.contains('static resource') ||
            act.contains('apex') || act.contains('trigger') || act.contains('class') ||
            disp.contains('apex class') || disp.contains('apex trigger') || disp.contains('lightning component') ||
            disp.contains('aura bundle') || disp.contains('static resource')) {
            return CAT_CODE;
        }

        // 8. UI & LAYOUTS
        if (sec.contains('page layout') || sec.contains('flexipage') || sec.contains('lightning app') ||
            sec.contains('tab') || sec.contains('navigation') || sec.contains('view') ||
            sec.contains('compact layout') || sec.contains('theme') ||
            act.contains('layout') || act.contains('flexipage') || act.contains('tab') ||
            disp.contains('page layout') || disp.contains('lightning page') || disp.contains('custom tab') ||
            disp.contains('compact layout') || disp.contains('utility bar')) {
            return CAT_UI;
        }

        // 9. USER ADMIN
        if (sec.contains('user') || sec.contains('manage users') || sec.contains('license') ||
            act.contains('user') || act.contains('freeze') || act.contains('password') ||
            disp.contains('created user') || disp.contains('activated user') || disp.contains('deactivated user') ||
            disp.contains('froze user') || disp.contains('reset password') || disp.contains('assigned license')) {
            return CAT_USER_ADMIN;
        }

        // 10. GENERAL CONFIGURATION
        if (sec.contains('company') || sec.contains('fiscal') || sec.contains('business hours') ||
            sec.contains('currency') || sec.contains('translation') || sec.contains('label') ||
            disp.contains('custom label') || disp.contains('business hours') || disp.contains('company information')) {
            return CAT_CONFIGURATION;
        }

        return CAT_OTHER;
    }

    private static String determineSeverity(String category, String act, String sec, String disp) {
        // CRITICAL rules (Use sparingly, only for high-risk platform actions)
        if (disp.contains('modify all data') || disp.contains('view all data') ||
            disp.contains('author apex') || disp.contains('customize application') ||
            disp.contains('disabled single sign-on') || disp.contains('deleted sharing rule') ||
            disp.contains('deleted custom object') || disp.contains('deleted custom field') ||
            disp.contains('relaxed ip restrictions') || disp.contains('bypass mfa')) {
            return SEV_CRITICAL;
        }

        // HIGH rules
        if (category == CAT_SECURITY ||
            (category == CAT_ACCESS && (disp.contains('permission set') || disp.contains('profile') || disp.contains('grant'))) ||
            (category == CAT_INTEGRATION && (disp.contains('secret') || disp.contains('auth provider') || disp.contains('connected app'))) ||
            (category == CAT_DEPLOYMENT && disp.contains('deployed')) ||
            disp.contains('sharing') || disp.contains('role hierarchy') || disp.contains('admin')) {
            return SEV_HIGH;
        }

        // MEDIUM rules
        if (category == CAT_AUTOMATION ||
            category == CAT_DATA_MODEL ||
            category == CAT_CODE ||
            (category == CAT_USER_ADMIN && (disp.contains('created user') || disp.contains('deactivated user')))) {
            return SEV_MEDIUM;
        }

        // LOW rules
        if (category == CAT_UI ||
            category == CAT_CONFIGURATION ||
            (category == CAT_USER_ADMIN && disp.contains('password reset'))) {
            return SEV_LOW;
        }

        // Default to INFO for labels and minor/other items
        if (disp.contains('label') || disp.contains('description') || category == CAT_OTHER) {
            return SEV_INFO;
        }

        return SEV_INFO;
    }
}
