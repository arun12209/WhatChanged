/**
 * @description Security and access control validation for WhatChanged
 * Enforces Custom Permission 'WhatChanged_Access' and Setup inspection rights.
 * @group WhatChanged
 */
public with sharing class WhatChangedSecurity {

    public static final String CUSTOM_PERMISSION_NAME = 'WhatChanged_Access';

    public class WhatChangedSecurityException extends Exception {}

    private static Boolean bypassSecurityForTests = false;

    @TestVisible
    public static void setBypassForTests(Boolean bypass) {
        bypassSecurityForTests = bypass;
    }

    /**
     * @description Checks if the current context user has authorization to view Setup Change History
     */
    public static Boolean hasAccess() {
        if (bypassSecurityForTests) {
            return true;
        }

        // 1. Check Custom Permission assignment
        try {
            Boolean hasCustomPerm = FeatureManagement.checkPermission(CUSTOM_PERMISSION_NAME);
            if (hasCustomPerm) {
                return true;
            }
        } catch (Exception ex) {
            // In case custom permission is not yet deployed, fallback to standard profile checks
        }

        // 2. Check standard permissions (e.g. ViewSetup)
        try {
            List<User> runningUsers = [
                SELECT Id, Profile.PermissionsViewSetup, Profile.PermissionsModifyAllData
                FROM User
                WHERE Id = :UserInfo.getUserId()
                LIMIT 1
            ];
            if (!runningUsers.isEmpty()) {
                User u = runningUsers[0];
                if (u.Profile.PermissionsViewSetup || u.Profile.PermissionsModifyAllData) {
                    return true;
                }
            }
        } catch (Exception ex) {
            // Catch any unexpected query failure
        }

        return false;
    }

    /**
     * @description Enforces access; throws WhatChangedSecurityException if user is not authorized
     */
    public static void requireAccess() {
        if (!hasAccess()) {
            throw new WhatChangedSecurityException('You do not have permission to access Salesforce change history.');
        }
    }
}