/**
 * @description Normalization layer converting raw Salesforce SetupAuditTrail rows
 * into human-readable titles, narratives, and search tokens.
 * @group WhatChanged
 */
public with sharing class WhatChangedEventNormalizer {

    public class RawAuditInput {
        public String id;
        public String action;
        public String section;
        public String display;
        public DateTime createdDate;
        public String actorId;
        public String actorName;
        public String delegateUser;
        public String responsibleNamespace;
        // Optional pre-computed classification (kept for pluggable future sources)
        public String storedCategory;
        public String storedSeverity;
        public String storedTitle;

        public RawAuditInput() {}

        public RawAuditInput(SetupAuditTrail sat) {
            this.id = sat.Id;
            this.action = sat.Action;
            this.section = sat.Section;
            this.display = sat.Display;
            this.createdDate = sat.CreatedDate;
            this.actorId = sat.CreatedById;
            this.actorName = sat.CreatedBy != null ? sat.CreatedBy.Name : 'System / Unknown';
            this.delegateUser = sat.DelegateUser;
            this.responsibleNamespace = sat.ResponsibleNamespacePrefix;
        }
    }

    /**
     * @description Normalizes a list of raw audit inputs into strongly typed ChangeEventDTOs
     */
    public static List<WhatChangedDtos.ChangeEventDTO> normalizeList(List<RawAuditInput> rawList) {
        List<WhatChangedDtos.ChangeEventDTO> result = new List<WhatChangedDtos.ChangeEventDTO>();
        if (rawList == null || rawList.isEmpty()) {
            return result;
        }

        for (RawAuditInput raw : rawList) {
            result.add(normalize(raw));
        }
        return result;
    }

    /**
     * @description Normalizes a single raw audit input
     */
    public static WhatChangedDtos.ChangeEventDTO normalize(RawAuditInput raw) {
        WhatChangedDtos.ChangeEventDTO dto = new WhatChangedDtos.ChangeEventDTO();
        dto.id = raw.id;
        dto.createdDate = raw.createdDate != null ? raw.createdDate : System.now();
        dto.formattedTime = formatTime(dto.createdDate);
        dto.relativeTime = formatRelativeTime(dto.createdDate);
        dto.actor = new WhatChangedDtos.ActorDTO(raw.actorId, String.isNotBlank(raw.actorName) ? raw.actorName : 'Unknown Contributor');
        dto.delegatedUser = raw.delegateUser;
        dto.action = raw.action != null ? raw.action : '';
        dto.section = raw.section != null ? raw.section : '';
        dto.rawDisplay = raw.display != null ? raw.display : '';
        dto.responsibleNamespace = raw.responsibleNamespace;

        // Classify Category & Severity (reuse persisted classification for ingested rows)
        if (String.isNotBlank(raw.storedCategory) && String.isNotBlank(raw.storedSeverity)) {
            dto.category = raw.storedCategory;
            dto.severity = raw.storedSeverity;
        } else {
            WhatChangedClassifier.ClassificationResult cr = WhatChangedClassifier.classify(
                dto.action, dto.section, dto.rawDisplay, dto.responsibleNamespace
            );
            dto.category = cr.category;
            dto.severity = cr.severity;
        }

        // Human-friendly title and narrative
        dto.title = String.isNotBlank(raw.storedTitle)
            ? raw.storedTitle
            : deriveTitle(dto.action, dto.section, dto.rawDisplay, dto.category);
        dto.description = deriveDescription(dto.rawDisplay, dto.title, dto.actor.name);

        // Component metadata extraction
        dto.metadata = extractMetadata(dto.action, dto.section, dto.rawDisplay);

        // Search tokens
        dto.searchTokens = buildSearchTokens(dto);

        return dto;
    }

    private static String deriveTitle(String action, String section, String display, String category) {
        String disp = display.toLowerCase();
        String act = action.toLowerCase();

        if (category == WhatChangedClassifier.CAT_AUTOMATION) {
            if (disp.contains('activated flow') || disp.contains('flow activated') || act.contains('flowactivated')) {
                return 'Flow activated';
            }
            if (disp.contains('deactivated flow') || act.contains('flowdeactivated')) {
                return 'Flow deactivated';
            }
            if (disp.contains('workflow rule')) {
                return 'Workflow Rule updated';
            }
            if (disp.contains('approval process')) {
                return 'Approval Process changed';
            }
            return 'Automation configuration updated';
        }

        if (category == WhatChangedClassifier.CAT_ACCESS) {
            if (disp.contains('permission set group')) {
                return 'Permission Set Group modified';
            }
            if (disp.contains('permission set') || act.contains('permset')) {
                return 'Permission Set updated';
            }
            if (disp.contains('profile')) {
                return 'Profile permissions updated';
            }
            if (disp.contains('assigned') && disp.contains('user')) {
                return 'Access granted to user';
            }
            return 'Access control changed';
        }

        if (category == WhatChangedClassifier.CAT_SECURITY) {
            if (disp.contains('sharing rule')) {
                return 'Sharing Rule updated';
            }
            if (disp.contains('session')) {
                return 'Session Security settings changed';
            }
            if (disp.contains('auth provider') || disp.contains('sso') || disp.contains('saml')) {
                return 'Authentication Provider updated';
            }
            return 'Security configuration updated';
        }

        if (category == WhatChangedClassifier.CAT_DATA_MODEL) {
            if (disp.contains('custom field') || act.contains('customfield')) {
                if (disp.contains('created') || act.contains('created')) return 'Custom Field created';
                if (disp.contains('deleted') || act.contains('deleted')) return 'Custom Field deleted';
                return 'Custom Field updated';
            }
            if (disp.contains('custom object') || act.contains('customobject')) {
                if (disp.contains('created')) return 'Custom Object created';
                if (disp.contains('deleted')) return 'Custom Object deleted';
                return 'Custom Object updated';
            }
            if (disp.contains('validation rule')) {
                return 'Validation Rule modified';
            }
            return 'Data Model / Schema changed';
        }

        if (category == WhatChangedClassifier.CAT_CODE) {
            if (disp.contains('apex class')) {
                if (disp.contains('created')) return 'Apex Class created';
                if (disp.contains('deleted')) return 'Apex Class deleted';
                return 'Apex Class modified';
            }
            if (disp.contains('apex trigger')) {
                return 'Apex Trigger modified';
            }
            if (disp.contains('lightning component') || disp.contains('lwc') || disp.contains('aura')) {
                return 'Lightning Component updated';
            }
            return 'Apex / Developer code updated';
        }

        if (category == WhatChangedClassifier.CAT_UI) {
            if (disp.contains('page layout')) return 'Page Layout updated';
            if (disp.contains('lightning page') || disp.contains('flexipage')) return 'Lightning Page updated';
            if (disp.contains('tab')) return 'Custom Tab updated';
            return 'UI & Layout changed';
        }

        if (category == WhatChangedClassifier.CAT_INTEGRATION) {
            if (disp.contains('named credential')) return 'Named Credential updated';
            if (disp.contains('connected app')) return 'Connected App updated';
            if (disp.contains('remote site')) return 'Remote Site setting modified';
            return 'Integration setting updated';
        }

        if (category == WhatChangedClassifier.CAT_USER_ADMIN) {
            if (disp.contains('created user')) return 'User account created';
            if (disp.contains('deactivated user')) return 'User account deactivated';
            if (disp.contains('froze user') || disp.contains('frozen')) return 'User account frozen';
            if (disp.contains('password reset')) return 'Password reset initiated';
            return 'User administration change';
        }

        if (category == WhatChangedClassifier.CAT_DEPLOYMENT) {
            return 'Deployment / Package activity';
        }

        // Fallback
        if (String.isNotBlank(section)) {
            return section + ' configuration changed';
        }
        return 'Salesforce configuration updated';
    }

    private static String deriveDescription(String rawDisplay, String title, String actorName) {
        if (String.isBlank(rawDisplay)) {
            return title + ' by ' + actorName + '.';
        }
        // Clean trailing periods or double spaces
        String cleaned = rawDisplay.trim();
        if (!cleaned.endsWith('.')) {
            cleaned += '.';
        }
        return cleaned;
    }

    private static WhatChangedDtos.ChangeMetadataDTO extractMetadata(String action, String section, String display) {
        WhatChangedDtos.ChangeMetadataDTO meta = new WhatChangedDtos.ChangeMetadataDTO();
        if (String.isBlank(display)) return meta;

        // Try extracting standard component patterns
        // e.g. "Changed field Opportunity.Discount_Percent__c" or "Activated Flow Order_Processing"
        if (display.contains('.')) {
            List<String> words = display.split('\\s+');
            for (String w : words) {
                if (w.contains('.') && !w.endsWith('.')) {
                    List<String> parts = w.split('\\.');
                    if (parts.size() == 2) {
                        meta.targetObject = parts[0];
                        meta.fieldName = parts[1];
                        meta.componentName = w;
                        meta.componentType = 'CustomField';
                        return meta;
                    }
                }
            }
        }

        meta.componentType = section;
        meta.componentName = action;
        return meta;
    }

    private static List<String> buildSearchTokens(WhatChangedDtos.ChangeEventDTO dto) {
        Set<String> tokens = new Set<String>();
        if (String.isNotBlank(dto.title)) tokens.addAll(dto.title.toLowerCase().split('\\s+'));
        if (String.isNotBlank(dto.category)) tokens.add(dto.category.toLowerCase());
        if (String.isNotBlank(dto.severity)) tokens.add(dto.severity.toLowerCase());
        if (String.isNotBlank(dto.action)) tokens.add(dto.action.toLowerCase());
        if (String.isNotBlank(dto.section)) tokens.add(dto.section.toLowerCase());
        if (dto.actor != null && String.isNotBlank(dto.actor.name)) tokens.addAll(dto.actor.name.toLowerCase().split('\\s+'));
        if (String.isNotBlank(dto.responsibleNamespace)) tokens.add(dto.responsibleNamespace.toLowerCase());
        return new List<String>(tokens);
    }

    public static String formatTime(DateTime dt) {
        if (dt == null) return '';
        return dt.format('h:mm a');
    }

    public static String formatRelativeTime(DateTime dt) {
        if (dt == null) return '';
        Long diffMs = System.now().getTime() - dt.getTime();
        Long diffMins = diffMs / (1000 * 60);
        if (diffMins < 1) return 'Just now';
        if (diffMins == 1) return '1 min ago';
        if (diffMins < 60) return diffMins + ' mins ago';
        Long diffHours = diffMins / 60;
        if (diffHours == 1) return '1 hour ago';
        if (diffHours < 24) return diffHours + ' hours ago';
        Long diffDays = diffHours / 24;
        if (diffDays == 1) return 'Yesterday';
        return diffDays + ' days ago';
    }
}