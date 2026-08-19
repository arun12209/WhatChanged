/**
 * @description Security and access control validation for WhatChanged
 * Enforces Custom Permission 'WhatChanged_Access' and Setup inspection rights.
 * @group WhatChanged
 */
public with sharing class WhatChangedSecurity {

    public static final String CUSTOM_PERMISSION_NAME = 'WhatChanged_Access';

    public class WhatChangedSecurityException extends Exception {}

    private static Boolean bypassSecurityForTests = false;
    private static Boolean cachedViewSetup;

    @TestVisible
    public static void setBypassForTests(Boolean bypass) {
        bypassSecurityForTests = bypass;
    }

    /**
     * @description Checks if the current context user has authorization to view Setup Change History.
     * Grants access via the WhatChanged_Access custom permission OR effective (profile- or
     * permission-set-granted) View Setup / Modify All Data permissions.
     */
    public static Boolean hasAccess() {
        if (bypassSecurityForTests) {
            return true;
        }

        // 1. Custom Permission assignment (assigned via WhatChanged_User permission set)
        try {
            if (FeatureManagement.checkPermission(CUSTOM_PERMISSION_NAME)) {
                return true;
            }
        } catch (Exception ex) {
            // Custom permission not deployed yet — fall back to standard permission checks
        }

        return canQueryLiveAuditTrail();
    }

    /**
     * @description True when the running user can query SetupAuditTrail directly
     * (requires effective View Setup and Configuration or Modify All Data).
     * Uses UserPermissionAccess so permission-set-granted permissions are honored,
     * not just profile-level ones.
     */
    public static Boolean canQueryLiveAuditTrail() {
        if (bypassSecurityForTests) {
            return true;
        }
        if (cachedViewSetup != null) {
            return cachedViewSetup;
        }
        cachedViewSetup = false;
        try {
            List<UserPermissionAccess> access = [
                SELECT PermissionsViewSetup, PermissionsModifyAllData
                FROM UserPermissionAccess
                LIMIT 1
            ];
            if (!access.isEmpty()) {
                cachedViewSetup = (access[0].PermissionsViewSetup == true) ||
                                  (access[0].PermissionsModifyAllData == true);
            }
        } catch (Exception ex) {
            cachedViewSetup = false;
        }
        return cachedViewSetup;
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
