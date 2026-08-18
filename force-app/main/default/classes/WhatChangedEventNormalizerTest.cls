/**
 * @description Unit tests for WhatChangedEventNormalizer
 * @group WhatChangedTests
 */
@IsTest
private class WhatChangedEventNormalizerTest {

    @IsTest
    static void testNormalizerSingleEvent() {
        WhatChangedEventNormalizer.RawAuditInput input = new WhatChangedEventNormalizer.RawAuditInput();
        input.id = '001000000000010';
        input.action = 'flowactivated';
        input.section = 'Process Automation';
        input.display = 'Activated Flow Account_Move_Wizard version 3';
        input.createdDate = System.now().addMinutes(-15);
        input.actorId = '005000000000001';
        input.actorName = 'Jane Smith';
        input.responsibleNamespace = 'c';

        WhatChangedDtos.ChangeEventDTO dto = WhatChangedEventNormalizer.normalize(input);

        System.assertEquals('Flow activated', dto.title, 'Title should be normalized');
        System.assert(dto.description.contains('Activated Flow'), 'Description should be narrative');
        System.assertEquals('AUTOMATION', dto.category, 'Category should be AUTOMATION');
        System.assertEquals('MEDIUM', dto.severity, 'Severity should be MEDIUM');
        System.assertEquals('Jane Smith', dto.actor.name, 'Actor name should match');
        System.assert(dto.searchTokens.contains('flow'), 'Tokens should include flow');
        System.assertNotEquals(null, dto.formattedTime, 'Formatted time should be populated');
    }

    @IsTest
    static void testMetadataComponentExtraction() {
        WhatChangedEventNormalizer.RawAuditInput input = new WhatChangedEventNormalizer.RawAuditInput();
        input.id = '001000000000020';
        input.action = 'customfieldcreated';
        input.section = 'Custom Objects';
        input.display = 'Created Custom Field Opportunity.Discount_Approved__c';
        input.createdDate = System.now().addMinutes(-5);
        input.actorId = '005000000000002';
        input.actorName = 'John Doe';

        WhatChangedDtos.ChangeEventDTO dto = WhatChangedEventNormalizer.normalize(input);

        System.assertEquals('Opportunity', dto.metadata.targetObject, 'Target object extracted');
        System.assertEquals('Discount_Approved__c', dto.metadata.fieldName, 'Field name extracted');
    }

    @IsTest
    static void testRelativeTimeFormatting() {
        DateTime now = System.now();
        System.assertEquals('Just now', WhatChangedEventNormalizer.formatRelativeTime(now));
        System.assertEquals('1 min ago', WhatChangedEventNormalizer.formatRelativeTime(now.addMinutes(-1)));
        System.assertEquals('10 mins ago', WhatChangedEventNormalizer.formatRelativeTime(now.addMinutes(-10)));
        System.assertEquals('2 hours ago', WhatChangedEventNormalizer.formatRelativeTime(now.addHours(-2)));
        System.assertEquals('Yesterday', WhatChangedEventNormalizer.formatRelativeTime(now.addHours(-26)));
    }
}