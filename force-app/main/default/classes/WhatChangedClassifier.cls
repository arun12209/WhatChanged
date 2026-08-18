/**
 * @description Extensible deterministic classification engine for Salesforce Setup Audit Trail events.
 * Maps Action, Section, Display, and Namespace to Category and Severity.
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

    public class ClassificationResult {
        public String category;
        public String severity;

        public ClassificationResult(String category, String severity) {
            this.category = category;
            this.severity = severity;
        }
    }

    /**
     * @description Classifies a Setup Audit Trail record into Category and Severity
     */
    public static ClassificationResult classify(String action, String section, String display, String namespace) {
        String act = action != null ? action.toLowerCase() : '';
        String sec = section != null ? section.toLowerCase() : '';
        String disp = display != null ? display.toLowerCase() : '';

        String category = determineCategory(act, sec, disp, namespace);
        String severity = determineSeverity(category, act, sec, disp);

        return new ClassificationResult(category, severity);
    }

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