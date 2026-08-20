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
    static void testNormalizeList() {
        List<WhatChangedEventNormalizer.RawAuditInput> listInputs = new List<WhatChangedEventNormalizer.RawAuditInput>();
        WhatChangedEventNormalizer.RawAuditInput input = new WhatChangedEventNormalizer.RawAuditInput();
        input.id = '001000000000011';
        input.action = 'permset';
        input.section = 'Manage Users';
        input.display = 'Changed permission set Admin_Access';
        input.createdDate = System.now();
        listInputs.add(input);

        List<WhatChangedDtos.ChangeEventDTO> dtos = WhatChangedEventNormalizer.normalizeList(listInputs);
        System.assertEquals(1, dtos.size());
        System.assertEquals(0, WhatChangedEventNormalizer.normalizeList(null).size());
    }

    @IsTest
    static void testCategoryDeriveTitles() {
        WhatChangedEventNormalizer.RawAuditInput raw = new WhatChangedEventNormalizer.RawAuditInput();
        raw.id = '001000000000012';
        raw.createdDate = System.now();

        // Stored category/severity path
        raw.storedCategory = 'SECURITY';
        raw.storedSeverity = 'HIGH';
        raw.storedTitle = 'Custom Stored Title';
        raw.display = 'Some security change';
        WhatChangedDtos.ChangeEventDTO dto = WhatChangedEventNormalizer.normalize(raw);
        System.assertEquals('Custom Stored Title', dto.title);
        System.assertEquals('SECURITY', dto.category);

        // Security category
        raw.storedCategory = null;
        raw.storedSeverity = null;
        raw.storedTitle = null;
        raw.display = 'Created sharing rule Account_Share';
        raw.section = 'Security Controls';
        raw.action = 'sharingrule';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'Changed session settings';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'Configured auth provider Google';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        // Code category
        raw.section = 'Apex Classes';
        raw.action = 'apexclasscreated';
        raw.display = 'Created apex class AccountService';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'Modified apex trigger AccountTrigger';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'Updated lightning component c:testComp';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        // User admin
        raw.section = 'Manage Users';
        raw.action = 'createuser';
        raw.display = 'created user john.doe@example.com';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'deactivated user john.doe@example.com';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'froze user john.doe@example.com';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'password reset initiated for user';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        // UI & Layout
        raw.section = 'Lightning Pages';
        raw.action = 'pagelayout';
        raw.display = 'Updated page layout Account Layout';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        // Integration
        raw.section = 'Named Credentials';
        raw.action = 'namedcredential';
        raw.display = 'Updated named credential StripeAPI';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        // Automation
        raw.section = 'Process Automation';
        raw.action = 'workflow';
        raw.display = 'Updated workflow rule Account_Notify';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.display = 'Changed approval process Opportunity_Approval';
        System.assertNotEquals(null, WhatChangedEventNormalizer.normalize(raw).title);

        raw.action = 'flow';
        raw.display = 'Deactivated flow with Name "Account After Save Demo 1" and Unique Name "Account_After_Save_Demo_1"';
        System.assertEquals('Flow deactivated', WhatChangedEventNormalizer.normalize(raw).title, 'Deactivated flow display should produce Flow deactivated title');

        raw.display = 'Deactivated Flow Account_Move_Wizard version 3';
        System.assertEquals('Flow deactivated', WhatChangedEventNormalizer.normalize(raw).title, 'Deactivated Flow display should produce Flow deactivated title');

        raw.action = 'flowdeactivated';
        raw.display = 'Flow deactivated';
        System.assertEquals('Flow deactivated', WhatChangedEventNormalizer.normalize(raw).title, 'flowdeactivated action should produce Flow deactivated title');

        raw.action = 'flowactivated';
        raw.display = 'Activated Flow Account_Move_Wizard version 3';
        System.assertEquals('Flow activated', WhatChangedEventNormalizer.normalize(raw).title, 'Activated Flow display should produce Flow activated title');
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
        System.assertEquals('1 hour ago', WhatChangedEventNormalizer.formatRelativeTime(now.addHours(-1)));
        System.assertEquals('2 hours ago', WhatChangedEventNormalizer.formatRelativeTime(now.addHours(-2)));
        System.assertEquals('Yesterday', WhatChangedEventNormalizer.formatRelativeTime(now.addHours(-26)));
        System.assertEquals('5 days ago', WhatChangedEventNormalizer.formatRelativeTime(now.addDays(-5)));
        System.assertEquals('', WhatChangedEventNormalizer.formatRelativeTime(null));
        System.assertEquals('', WhatChangedEventNormalizer.formatTime(null));
    }
}