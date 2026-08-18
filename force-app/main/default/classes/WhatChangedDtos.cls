/**
 * @description Strongly typed Data Transfer Objects (DTOs) for WhatChanged Salesforce Change Intelligence
 * @group WhatChanged
 */
public with sharing class WhatChangedDtos {

    public class ActorDTO {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String username { get; set; }
        @AuraEnabled public String smallPhotoUrl { get; set; }

        public ActorDTO() {}
        public ActorDTO(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    public class ChangeMetadataDTO {
        @AuraEnabled public String componentName { get; set; }
        @AuraEnabled public String componentType { get; set; }
        @AuraEnabled public String targetObject { get; set; }
        @AuraEnabled public String fieldName { get; set; }
    }

    public class ChangeEventDTO {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public DateTime createdDate { get; set; }
        @AuraEnabled public String formattedTime { get; set; }
        @AuraEnabled public String relativeTime { get; set; }
        @AuraEnabled public ActorDTO actor { get; set; }
        @AuraEnabled public String delegatedUser { get; set; }
        @AuraEnabled public String category { get; set; }      // AUTOMATION, ACCESS, SECURITY, etc.
        @AuraEnabled public String severity { get; set; }      // INFO, LOW, MEDIUM, HIGH, CRITICAL
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public String action { get; set; }
        @AuraEnabled public String section { get; set; }
        @AuraEnabled public String rawDisplay { get; set; }
        @AuraEnabled public String responsibleNamespace { get; set; }
        @AuraEnabled public ChangeMetadataDTO metadata { get; set; }
        @AuraEnabled public List<String> searchTokens { get; set; }

        public ChangeEventDTO() {
            this.searchTokens = new List<String>();
            this.metadata = new ChangeMetadataDTO();
        }
    }

    public class CategoryDistributionDTO {
        @AuraEnabled public String category { get; set; }
        @AuraEnabled public Integer count { get; set; }
        @AuraEnabled public Decimal percentage { get; set; }

        public CategoryDistributionDTO(String category, Integer count, Decimal percentage) {
            this.category = category;
            this.count = count;
            this.percentage = percentage;
        }
    }

    public class HourlyDistributionDTO {
        @AuraEnabled public String hourLabel { get; set; }
        @AuraEnabled public Integer hour { get; set; }
        @AuraEnabled public Integer count { get; set; }

        public HourlyDistributionDTO(String hourLabel, Integer hour, Integer count) {
            this.hourLabel = hourLabel;
            this.hour = hour;
            this.count = count;
        }
    }

    public class AttentionItemDTO {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String reason { get; set; }
        @AuraEnabled public String severity { get; set; }
        @AuraEnabled public String category { get; set; }
        @AuraEnabled public Integer relatedEventCount { get; set; }
        @AuraEnabled public String filterParam { get; set; }
    }

    public class ChangeSummaryDTO {
        @AuraEnabled public Integer totalChangesToday { get; set; }
        @AuraEnabled public Integer baselineTypicalWeekday { get; set; }
        @AuraEnabled public Decimal deltaPercentageVsBaseline { get; set; }
        @AuraEnabled public String baselineStatus { get; set; } // "+18% vs typical Monday", "Normal range", "Building baseline"
        @AuraEnabled public Integer automationChangesToday { get; set; }
        @AuraEnabled public String automationSubtitle { get; set; }
        @AuraEnabled public Integer accessChangesToday { get; set; }
        @AuraEnabled public String accessSubtitle { get; set; }
        @AuraEnabled public Integer highInterestChangesToday { get; set; }
        @AuraEnabled public String highInterestSubtitle { get; set; }
        @AuraEnabled public DateTime lastRefreshedAt { get; set; }
        @AuraEnabled public String environmentType { get; set; } // "Production", "Sandbox", "Developer Edition"
        @AuraEnabled public List<HourlyDistributionDTO> hourlyActivity { get; set; }
        @AuraEnabled public List<CategoryDistributionDTO> categoryMix { get; set; }
        @AuraEnabled public List<AttentionItemDTO> attentionItems { get; set; }
        @AuraEnabled public List<ChangeEventDTO> recentChanges { get; set; }

        public ChangeSummaryDTO() {
            this.hourlyActivity = new List<HourlyDistributionDTO>();
            this.categoryMix = new List<CategoryDistributionDTO>();
            this.attentionItems = new List<AttentionItemDTO>();
            this.recentChanges = new List<ChangeEventDTO>();
        }
    }

    public class ContributorDTO {
        @AuraEnabled public String actorId { get; set; }
        @AuraEnabled public String actorName { get; set; }
        @AuraEnabled public Integer totalChanges { get; set; }
        @AuraEnabled public List<String> primaryCategories { get; set; }
        @AuraEnabled public DateTime lastChangeDate { get; set; }
        @AuraEnabled public String lastActivityRelative { get; set; }
        @AuraEnabled public String trend { get; set; } // "High activity", "Steady", "Occasional"
        @AuraEnabled public Map<String, Integer> categoryCounts { get; set; }

        public ContributorDTO() {
            this.primaryCategories = new List<String>();
            this.categoryCounts = new Map<String, Integer>();
        }
    }

    public class DayDistributionDTO {
        @AuraEnabled public String dayName { get; set; }
        @AuraEnabled public String dateLabel { get; set; }
        @AuraEnabled public Integer count { get; set; }

        public DayDistributionDTO(String dayName, String dateLabel, Integer count) {
            this.dayName = dayName;
            this.dateLabel = dateLabel;
            this.count = count;
        }
    }

    public class SectionStatDTO {
        @AuraEnabled public String section { get; set; }
        @AuraEnabled public Integer count { get; set; }

        public SectionStatDTO(String section, Integer count) {
            this.section = section;
            this.count = count;
        }
    }

    public class InsightsDTO {
        @AuraEnabled public List<DayDistributionDTO> dailyTrends { get; set; }
        @AuraEnabled public List<HourlyDistributionDTO> hourlyTrends { get; set; }
        @AuraEnabled public List<CategoryDistributionDTO> categoryDistribution { get; set; }
        @AuraEnabled public List<SectionStatDTO> topSections { get; set; }
        @AuraEnabled public Map<String, Integer> severityDistribution { get; set; }
        @AuraEnabled public Integer totalEvaluatedPeriodChanges { get; set; }

        public InsightsDTO() {
            this.dailyTrends = new List<DayDistributionDTO>();
            this.hourlyTrends = new List<HourlyDistributionDTO>();
            this.categoryDistribution = new List<CategoryDistributionDTO>();
            this.topSections = new List<SectionStatDTO>();
            this.severityDistribution = new Map<String, Integer>();
        }
    }

    public class PageInfoDTO {
        @AuraEnabled public Boolean hasNextPage { get; set; }
        @AuraEnabled public String nextCursor { get; set; }
        @AuraEnabled public Integer totalCount { get; set; }

        public PageInfoDTO(Boolean hasNextPage, String nextCursor, Integer totalCount) {
            this.hasNextPage = hasNextPage;
            this.nextCursor = nextCursor;
            this.totalCount = totalCount;
        }
    }

    public class ChangeEventsResponseDTO {
        @AuraEnabled public List<ChangeEventDTO> events { get; set; }
        @AuraEnabled public PageInfoDTO pageInfo { get; set; }
        @AuraEnabled public List<ChangeStoryDTO> changeStories { get; set; }

        public ChangeEventsResponseDTO() {
            this.events = new List<ChangeEventDTO>();
            this.changeStories = new List<ChangeStoryDTO>();
        }
    }

    public class ChangeStoryDTO {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String actorName { get; set; }
        @AuraEnabled public String actorId { get; set; }
        @AuraEnabled public String timeSpanFormatted { get; set; }
        @AuraEnabled public Integer changeCount { get; set; }
        @AuraEnabled public String primaryCategory { get; set; }
        @AuraEnabled public String maxSeverity { get; set; }
        @AuraEnabled public List<ChangeEventDTO> relatedEvents { get; set; }

        public ChangeStoryDTO() {
            this.relatedEvents = new List<ChangeEventDTO>();
        }
    }

    public class ErrorDetailDTO {
        @AuraEnabled public String code { get; set; }
        @AuraEnabled public String message { get; set; }

        public ErrorDetailDTO(String code, String message) {
            this.code = code;
            this.message = message;
        }
    }

    public class ErrorResponseDTO {
        @AuraEnabled public ErrorDetailDTO error { get; set; }

        public ErrorResponseDTO(String code, String message) {
            this.error = new ErrorDetailDTO(code, message);
        }
    }
}