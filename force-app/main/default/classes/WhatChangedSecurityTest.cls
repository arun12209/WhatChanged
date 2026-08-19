/**
 * @description Unit tests for WhatChangedSecurity
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedSecurityTest {

    @IsTest
    static void testHasAccessWithBypass() {
        WhatChangedSecurity.setBypassForTests(true);
        System.assertEquals(true, WhatChangedSecurity.hasAccess(), 'Bypass should return true');
        System.assertEquals(true, WhatChangedSecurity.canQueryLiveAuditTrail(), 'canQueryLiveAuditTrail with bypass should return true');

        // requireAccess should not throw when bypass is active
        try {
            WhatChangedSecurity.requireAccess();
            System.assert(true, 'Access granted without exception');
        } catch (Exception ex) {
            System.assert(false, 'Should not throw exception when bypass active');
        }
    }

    @IsTest
    static void testRequireAccessThrowsWhenUnauthorized() {
        WhatChangedSecurity.setBypassForTests(false);
        Boolean canAccess = WhatChangedSecurity.hasAccess();
        if (!canAccess) {
            try {
                WhatChangedSecurity.requireAccess();
                System.assert(false, 'Expected WhatChangedSecurityException');
            } catch (WhatChangedSecurity.WhatChangedSecurityException ex) {
                System.assert(ex.getMessage().contains('permission'), 'Exception message should mention permission');
            }
        } else {
            // Context user already has admin/view setup permission
            System.assertEquals(true, canAccess);
            WhatChangedSecurity.requireAccess();
        }
    }

    @IsTest
    static void testCanQueryLiveAuditTrailDirect() {
        WhatChangedSecurity.setBypassForTests(false);
        Boolean canQuery = WhatChangedSecurity.canQueryLiveAuditTrail();
        System.assertNotEquals(null, canQuery);
    }
}