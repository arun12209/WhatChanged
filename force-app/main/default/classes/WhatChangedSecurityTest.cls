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
        // Standard user or non-privileged context test
        // In unit test context without assigned perm set, verify standard behavior
        Boolean canAccess = WhatChangedSecurity.hasAccess();
        if (!canAccess) {
            try {
                WhatChangedSecurity.requireAccess();
                System.assert(false, 'Expected WhatChangedSecurityException');
            } catch (WhatChangedSecurity.WhatChangedSecurityException ex) {
                System.assert(ex.getMessage().contains('permission'), 'Exception message should mention permission');
            }
        }
    }
}