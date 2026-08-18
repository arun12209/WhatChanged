/**
 * @description Core business logic service for WhatChanged
 * Handles event orchestration, baseline calculations, change story grouping, and metrics.
 * @group WhatChanged
 */
public with sharing class WhatChangedAuditService {

    /**
     * @description Retrieves the high-level operational summary and KPI metrics
     */
    @AuraEnabled(cacheable=true)
    public static WhatChangedDtos.ChangeSummaryDTO getChangeSummary() {
        WhatChangedSecurity.requireAccess();

        DateTime now = System.now();
        DateTime todayStart = DateTime.newInstance(now.date(), Time.newInstance(0, 0, 0, 0));
        DateTime todayEnd = DateTime.newInstance(now.date(), Time.newInstance(23, 59, 59, 999));

        WhatChangedAuditRepository.IWhatChangedAuditRepository repo = WhatChangedAuditRepository.getInstance();

        // 1. Fetch Today's events
        List<WhatChangedEventNormalizer.RawAuditInput> rawToday = repo.queryEvents(
            todayStart, todayEnd, null, null, null, 200, null
        );
        List<WhatChangedDtos.ChangeEventDTO> eventsToday = WhatChangedEventNormalizer.normalizeList(rawToday);

        WhatChangedDtos.ChangeSummaryDTO summary = new WhatChangedDtos.ChangeSummaryDTO();
        summary.totalChangesToday = eventsToday.size();
        summary.lastRefreshedAt = now;
        summary.environmentType = identifyEnvironment();

        // 2. Compute KPI Metrics
        Integer automationCount = 0;
        Integer flowCount = 0;
        Integer accessCount = 0;
        Integer highInterestCount = 0;
        Map<String, Integer> catCounts = new Map<String, Integer>();
        Map<Integer, Integer> hourCounts = new Map<Integer, Integer>();

        for (WhatChangedDtos.ChangeEventDTO evt : eventsToday) {
            // Category counting
            String cat = evt.category;
            catCounts.put(cat, (catCounts.containsKey(cat) ? catCounts.get(cat) : 0) + 1);

            if (cat == WhatChangedClassifier.CAT_AUTOMATION) {
                automationCount++;
                if (evt.title.containsIgnoreCase('flow')) {
                    flowCount++;
                }
            } else if (cat == WhatChangedClassifier.CAT_ACCESS || cat == WhatChangedClassifier.CAT_USER_ADMIN) {
                accessCount++;
            }

            if (evt.severity == WhatChangedClassifier.SEV_HIGH || evt.severity == WhatChangedClassifier.SEV_CRITICAL) {
                highInterestCount++;
            }

            // Hourly distribution
            Integer h = evt.createdDate.hour();
            hourCounts.put(h, (hourCounts.containsKey(h) ? hourCounts.get(h) : 0) + 1);
        }

        summary.automationChangesToday = automationCount;
        summary.automationSubtitle = flowCount > 0 ? (flowCount + ' Flow ' + (flowCount == 1 ? 'change' : 'changes')) : 'Automation active';

        summary.accessChangesToday = accessCount;
        summary.accessSubtitle = 'Permissions & users';

        summary.highInterestChangesToday = highInterestCount;
        summary.highInterestSubtitle = highInterestCount > 0 ? 'Review recommended' : 'Normal parameters';

        // 3. Calculate Baseline comparison
        calculateBaseline(summary, now, repo);

        // 4. Hourly Distribution (from 00:00 to 23:00 or active span)
        for (Integer h = 0; h < 24; h++) {
            Integer count = hourCounts.containsKey(h) ? hourCounts.get(h) : 0;
            String hourLabel = formatHourLabel(h);
            summary.hourlyActivity.add(new WhatChangedDtos.HourlyDistributionDTO(hourLabel, h, count));
        }

        // 5. Category Mix Distribution
        for (String cat : catCounts.keySet()) {
            Integer count = catCounts.get(cat);
            Decimal pct = summary.totalChangesToday > 0 ? ((Decimal.valueOf(count) / summary.totalChangesToday) * 100).setScale(1) : 0;
            summary.categoryMix.add(new WhatChangedDtos.CategoryDistributionDTO(cat, count, pct));
        }

        // 6. Attention Items ("Worth a look")
        summary.attentionItems = buildAttentionItems(eventsToday, highInterestCount, accessCount, automationCount);

        // 7. Recent changes (top 10)
        Integer recentLimit = Math.min(eventsToday.size(), 10);
        for (Integer i = 0; i < recentLimit; i++) {
            summary.recentChanges.add(eventsToday[i]);
        }

        return summary;
    }

    /**
     * @description Retrieves paginated and filtered change events
     */
    @AuraEnabled(cacheable=true)
    public static WhatChangedDtos.ChangeEventsResponseDTO getEvents(
        DateTime fromDate,
        DateTime toDate,
        String category,
        String severity,
        String actorId,
        String section,
        String search,
        Integer limitRows,
        String cursor,
        DateTime incidentTime,
        Integer incidentWindowMinutes
    ) {
        WhatChangedSecurity.requireAccess();

        WhatChangedAuditRepository.IWhatChangedAuditRepository repo = WhatChangedAuditRepository.getInstance();
        List<WhatChangedEventNormalizer.RawAuditInput> rawList;

        if (incidentTime != null) {
            rawList = repo.queryEventsAroundTime(incidentTime, incidentWindowMinutes);
        } else {
            rawList = repo.queryEvents(fromDate, toDate, actorId, section, search, limitRows != null ? limitRows + 1 : 51, cursor);
        }

        List<WhatChangedDtos.ChangeEventDTO> allEvents = WhatChangedEventNormalizer.normalizeList(rawList);
        List<WhatChangedDtos.ChangeEventDTO> filteredEvents = new List<WhatChangedDtos.ChangeEventDTO>();

        for (WhatChangedDtos.ChangeEventDTO evt : allEvents) {
            if (String.isNotBlank(category) && !category.equalsIgnoreCase('ALL') && !evt.category.equalsIgnoreCase(category)) {
                continue;
            }
            if (String.isNotBlank(severity) && !severity.equalsIgnoreCase('ALL') && !evt.severity.equalsIgnoreCase(severity)) {
                continue;
            }
            filteredEvents.add(evt);
        }

        Integer pageSize = (limitRows != null && limitRows > 0) ? limitRows : 50;
        Boolean hasNext = filteredEvents.size() > pageSize;
        String nextCursor = null;

        List<WhatChangedDtos.ChangeEventDTO> pagedEvents = new List<WhatChangedDtos.ChangeEventDTO>();
        for (Integer i = 0; i < Math.min(filteredEvents.size(), pageSize); i++) {
            pagedEvents.add(filteredEvents[i]);
        }

        if (hasNext && !pagedEvents.isEmpty()) {
            WhatChangedDtos.ChangeEventDTO lastItem = pagedEvents[pagedEvents.size() - 1];
            nextCursor = lastItem.createdDate.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'') + '_' + lastItem.id;
        }

        WhatChangedDtos.ChangeEventsResponseDTO response = new WhatChangedDtos.ChangeEventsResponseDTO();
        response.events = pagedEvents;
        response.pageInfo = new WhatChangedDtos.PageInfoDTO(hasNext, nextCursor, filteredEvents.size());
        response.changeStories = groupChangeStories(pagedEvents);

        return response;
    }

    /**
     * @description Retrieves contributor metrics and rankings
     */
    @AuraEnabled(cacheable=true)
    public static List<WhatChangedDtos.ContributorDTO> getContributors(DateTime fromDate, DateTime toDate) {
        WhatChangedSecurity.requireAccess();

        WhatChangedAuditRepository.IWhatChangedAuditRepository repo = WhatChangedAuditRepository.getInstance();
        List<WhatChangedEventNormalizer.RawAuditInput> rawList = repo.queryEvents(
            fromDate, toDate, null, null, null, 200, null
        );
        List<WhatChangedDtos.ChangeEventDTO> events = WhatChangedEventNormalizer.normalizeList(rawList);

        Map<String, WhatChangedDtos.ContributorDTO> contribMap = new Map<String, WhatChangedDtos.ContributorDTO>();

        for (WhatChangedDtos.ChangeEventDTO evt : events) {
            String actorKey = evt.actor != null && String.isNotBlank(evt.actor.name) ? evt.actor.name : 'Unknown';
            if (!contribMap.containsKey(actorKey)) {
                WhatChangedDtos.ContributorDTO c = new WhatChangedDtos.ContributorDTO();
                c.actorId = evt.actor != null ? evt.actor.id : null;
                c.actorName = actorKey;
                c.totalChanges = 0;
                c.lastChangeDate = evt.createdDate;
                c.lastActivityRelative = evt.relativeTime;
                contribMap.put(actorKey, c);
            }

            WhatChangedDtos.ContributorDTO contrib = contribMap.get(actorKey);
            contrib.totalChanges++;
            if (evt.createdDate > contrib.lastChangeDate) {
                contrib.lastChangeDate = evt.createdDate;
                contrib.lastActivityRelative = evt.relativeTime;
            }

            Integer catCount = contrib.categoryCounts.containsKey(evt.category) ? contrib.categoryCounts.get(evt.category) : 0;
            contrib.categoryCounts.put(evt.category, catCount + 1);
        }

        List<WhatChangedDtos.ContributorDTO> result = contribMap.values();
        for (WhatChangedDtos.ContributorDTO c : result) {
            // Determine top categories
            List<String> sortedCats = new List<String>(c.categoryCounts.keySet());
            for (Integer i = 0; i < Math.min(sortedCats.size(), 2); i++) {
                c.primaryCategories.add(sortedCats[i]);
            }
            // Trend label
            if (c.totalChanges >= 15) {
                c.trend = 'High activity';
            } else if (c.totalChanges >= 5) {
                c.trend = 'Steady';
            } else {
                c.trend = 'Occasional';
            }
        }

        // Sort descending by totalChanges
        return sortContributors(result);
    }

    /**
     * @description Retrieves longitudinal insights and trends
     */
    @AuraEnabled(cacheable=true)
    public static WhatChangedDtos.InsightsDTO getInsights(String range) {
        WhatChangedSecurity.requireAccess();

        DateTime now = System.now();
        DateTime fromDate = now.addDays(-7);
        if (range == '30d') {
            fromDate = now.addDays(-30);
        } else if (range == '24h') {
            fromDate = now.addHours(-24);
        }

        WhatChangedAuditRepository.IWhatChangedAuditRepository repo = WhatChangedAuditRepository.getInstance();
        List<WhatChangedEventNormalizer.RawAuditInput> rawList = repo.queryEvents(
            fromDate, now, null, null, null, 200, null
        );
        List<WhatChangedDtos.ChangeEventDTO> events = WhatChangedEventNormalizer.normalizeList(rawList);

        WhatChangedDtos.InsightsDTO insights = new WhatChangedDtos.InsightsDTO();
        insights.totalEvaluatedPeriodChanges = events.size();

        Map<Date, Integer> dayCounts = new Map<Date, Integer>();
        Map<Integer, Integer> hourCounts = new Map<Integer, Integer>();
        Map<String, Integer> catCounts = new Map<String, Integer>();
        Map<String, Integer> secCounts = new Map<String, Integer>();
        Map<String, Integer> sevCounts = new Map<String, Integer>();

        for (WhatChangedDtos.ChangeEventDTO evt : events) {
            Date d = evt.createdDate.date();
            dayCounts.put(d, (dayCounts.containsKey(d) ? dayCounts.get(d) : 0) + 1);

            Integer h = evt.createdDate.hour();
            hourCounts.put(h, (hourCounts.containsKey(h) ? hourCounts.get(h) : 0) + 1);

            catCounts.put(evt.category, (catCounts.containsKey(evt.category) ? catCounts.get(evt.category) : 0) + 1);

            String sec = String.isNotBlank(evt.section) ? evt.section : 'General';
            secCounts.put(sec, (secCounts.containsKey(sec) ? secCounts.get(sec) : 0) + 1);

            sevCounts.put(evt.severity, (sevCounts.containsKey(evt.severity) ? sevCounts.get(evt.severity) : 0) + 1);
        }

        // 1. Daily trends (past 7 days)
        for (Integer i = 6; i >= 0; i--) {
            Date d = now.addDays(-i).date();
            DateTime dt = DateTime.newInstance(d, Time.newInstance(12, 0, 0, 0));
            String dayName = dt.format('EEE');
            String dateLabel = dt.format('MMM d');
            Integer count = dayCounts.containsKey(d) ? dayCounts.get(d) : 0;
            insights.dailyTrends.add(new WhatChangedDtos.DayDistributionDTO(dayName, dateLabel, count));
        }

        // 2. Hourly trends
        for (Integer h = 0; h < 24; h++) {
            Integer count = hourCounts.containsKey(h) ? hourCounts.get(h) : 0;
            insights.hourlyTrends.add(new WhatChangedDtos.HourlyDistributionDTO(formatHourLabel(h), h, count));
        }

        // 3. Category distribution
        for (String cat : catCounts.keySet()) {
            Integer count = catCounts.get(cat);
            Decimal pct = events.size() > 0 ? ((Decimal.valueOf(count) / events.size()) * 100).setScale(1) : 0;
            insights.categoryDistribution.add(new WhatChangedDtos.CategoryDistributionDTO(cat, count, pct));
        }

        // 4. Top sections
        for (String sec : secCounts.keySet()) {
            insights.topSections.add(new WhatChangedDtos.SectionStatDTO(sec, secCounts.get(sec)));
        }

        // 5. Severity distribution
        insights.severityDistribution = sevCounts;

        return insights;
    }

    private static void calculateBaseline(WhatChangedDtos.ChangeSummaryDTO summary, DateTime now, WhatChangedAuditRepository.IWhatChangedAuditRepository repo) {
        String dayOfWeek = now.format('EEEE');
        List<Integer> pastSamples = new List<Integer>();

        // Sample past 3 weeks for same weekday
        for (Integer w = 1; w <= 3; w++) {
            DateTime pastDay = now.addDays(-7 * w);
            DateTime pastStart = DateTime.newInstance(pastDay.date(), Time.newInstance(0, 0, 0, 0));
            DateTime pastEnd = DateTime.newInstance(pastDay.date(), Time.newInstance(23, 59, 59, 999));
            Integer pastCount = repo.countEvents(pastStart, pastEnd);
            if (pastCount > 0) {
                pastSamples.add(pastCount);
            }
        }

        if (pastSamples.size() >= 2) {
            Integer sum = 0;
            for (Integer c : pastSamples) sum += c;
            Integer avg = sum / pastSamples.size();
            summary.baselineTypicalWeekday = avg;
            if (avg > 0) {
                Decimal delta = ((Decimal.valueOf(summary.totalChangesToday - avg) / avg) * 100).setScale(0);
                summary.deltaPercentageVsBaseline = delta;
                String sign = delta >= 0 ? '+' : '';
                summary.baselineStatus = sign + delta + '% vs typical ' + dayOfWeek;
            } else {
                summary.baselineStatus = 'Normal range';
            }
        } else {
            summary.baselineStatus = 'Building baseline';
        }
    }

    private static List<WhatChangedDtos.AttentionItemDTO> buildAttentionItems(
        List<WhatChangedDtos.ChangeEventDTO> events,
        Integer highInterestCount,
        Integer accessCount,
        Integer automationCount
    ) {
        List<WhatChangedDtos.AttentionItemDTO> items = new List<WhatChangedDtos.AttentionItemDTO>();

        if (highInterestCount > 0) {
            WhatChangedDtos.AttentionItemDTO item = new WhatChangedDtos.AttentionItemDTO();
            item.id = 'att-high-interest';
            item.title = 'High-interest configuration changes detected';
            item.reason = highInterestCount + ' changes flagged with elevated security or access impact.';
            item.severity = WhatChangedClassifier.SEV_HIGH;
            item.category = WhatChangedClassifier.CAT_SECURITY;
            item.relatedEventCount = highInterestCount;
            item.filterParam = 'severity=HIGH';
            items.add(item);
        }

        if (accessCount >= 5) {
            WhatChangedDtos.AttentionItemDTO item = new WhatChangedDtos.AttentionItemDTO();
            item.id = 'att-access-cluster';
            item.title = 'Elevated access control activity';
            item.reason = accessCount + ' permission set, profile, or user assignment modifications today.';
            item.severity = WhatChangedClassifier.SEV_MEDIUM;
            item.category = WhatChangedClassifier.CAT_ACCESS;
            item.relatedEventCount = accessCount;
            item.filterParam = 'category=ACCESS';
            items.add(item);
        }

        if (automationCount >= 5) {
            WhatChangedDtos.AttentionItemDTO item = new WhatChangedDtos.AttentionItemDTO();
            item.id = 'att-automation-cluster';
            item.title = 'Active process automation changes';
            item.reason = automationCount + ' flow or process automation adjustments detected today.';
            item.severity = WhatChangedClassifier.SEV_MEDIUM;
            item.category = WhatChangedClassifier.CAT_AUTOMATION;
            item.relatedEventCount = automationCount;
            item.filterParam = 'category=AUTOMATION';
            items.add(item);
        }

        return items;
    }

    /**
     * @description Groups nearby deterministic changes by same actor into logical Change Stories
     */
    public static List<WhatChangedDtos.ChangeStoryDTO> groupChangeStories(List<WhatChangedDtos.ChangeEventDTO> events) {
        List<WhatChangedDtos.ChangeStoryDTO> stories = new List<WhatChangedDtos.ChangeStoryDTO>();
        if (events == null || events.isEmpty()) return stories;

        Map<String, List<WhatChangedDtos.ChangeEventDTO>> actorBuckets = new Map<String, List<WhatChangedDtos.ChangeEventDTO>>();
        for (WhatChangedDtos.ChangeEventDTO evt : events) {
            String actorKey = evt.actor != null && String.isNotBlank(evt.actor.name) ? evt.actor.name : 'Unknown';
            if (!actorBuckets.containsKey(actorKey)) {
                actorBuckets.put(actorKey, new List<WhatChangedDtos.ChangeEventDTO>());
            }
            actorBuckets.get(actorKey).add(evt);
        }

        Integer storyIndex = 1;
        for (String actorName : actorBuckets.keySet()) {
            List<WhatChangedDtos.ChangeEventDTO> actorEvents = actorBuckets.get(actorName);
            if (actorEvents.size() < 2) continue; // Only group if 2+ related changes

            WhatChangedDtos.ChangeStoryDTO story = new WhatChangedDtos.ChangeStoryDTO();
            story.id = 'story-' + storyIndex++;
            story.actorName = actorName;
            story.actorId = actorEvents[0].actor != null ? actorEvents[0].actor.id : null;
            story.primaryCategory = actorEvents[0].category;
            story.maxSeverity = actorEvents[0].severity;
            story.changeCount = actorEvents.size();
            story.timeSpanFormatted = actorEvents[actorEvents.size() - 1].formattedTime + ' – ' + actorEvents[0].formattedTime;
            story.title = actorEvents[0].title + ' and ' + (actorEvents.size() - 1) + ' related changes';
            story.relatedEvents = actorEvents;
            stories.add(story);
        }

        return stories;
    }

    private static String identifyEnvironment() {
        try {
            Organization org = [SELECT IsSandbox, OrganizationType FROM Organization LIMIT 1];
            if (org.IsSandbox) {
                return 'Sandbox';
            }
            return 'Production';
        } catch (Exception e) {
            return 'Production';
        }
    }

    private static String formatHourLabel(Integer h) {
        if (h == 0) return '12 AM';
        if (h < 12) return h + ' AM';
        if (h == 12) return '12 PM';
        return (h - 12) + ' PM';
    }

    private static List<WhatChangedDtos.ContributorDTO> sortContributors(List<WhatChangedDtos.ContributorDTO> items) {
        // Simple bubble/insertion sort for small contributor list
        for (Integer i = 0; i < items.size(); i++) {
            for (Integer j = i + 1; j < items.size(); j++) {
                if (items[j].totalChanges > items[i].totalChanges) {
                    WhatChangedDtos.ContributorDTO temp = items[i];
                    items[i] = items[j];
                    items[j] = temp;
                }
            }
        }
        return items;
    }
}