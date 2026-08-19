/**
 * @description Core business logic service for WhatChanged
 * Handles event orchestration, baseline calculations, change story grouping, and metrics.
 *
 * Totals and per-day trends are exact (COUNT() queries). Category/severity/hour/section
 * distributions come from a bounded sample of the most recent rows in range (SetupAuditTrail
 * does not support GROUP BY); when the sample is smaller than the exact total, distribution
 * counts are proportionally scaled to the exact total so numbers stay consistent.
 * Event listing uses a bounded scan loop so pagination stays correct even when a filter
 * cannot be pushed into SOQL by the underlying repository.
 * @group WhatChanged
 */
public with sharing class WhatChangedAuditService {

    /** Severity filter alias meaning HIGH or CRITICAL */
    public static final String SEVERITY_ELEVATED = 'ELEVATED';

    private static final Set<String> KNOWN_SEVERITIES = new Set<String>{
        WhatChangedClassifier.SEV_INFO, WhatChangedClassifier.SEV_LOW, WhatChangedClassifier.SEV_MEDIUM,
        WhatChangedClassifier.SEV_HIGH, WhatChangedClassifier.SEV_CRITICAL
    };

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

        WhatChangedDtos.ChangeSummaryDTO summary = new WhatChangedDtos.ChangeSummaryDTO();
        summary.lastRefreshedAt = now;
        summary.environmentType = identifyEnvironment();

        // 1. Exact totals from aggregates (not capped by a page-size sample)
        summary.totalChangesToday = repo.countEvents(todayStart, todayEnd);

        Map<String, Integer> catCounts = scaleToTotal(repo.countByCategory(todayStart, todayEnd), summary.totalChangesToday);
        Map<String, Integer> sevCounts = scaleToTotal(repo.countBySeverity(todayStart, todayEnd), summary.totalChangesToday);
        Map<Integer, Integer> hourCounts = scaleHoursToTotal(repo.countByHour(todayStart, todayEnd), summary.totalChangesToday);

        Integer automationCount = valueOr(catCounts, WhatChangedClassifier.CAT_AUTOMATION, 0);
        Integer accessCount = valueOr(catCounts, WhatChangedClassifier.CAT_ACCESS, 0) +
                              valueOr(catCounts, WhatChangedClassifier.CAT_USER_ADMIN, 0);
        Integer highInterestCount = valueOr(sevCounts, WhatChangedClassifier.SEV_HIGH, 0) +
                                    valueOr(sevCounts, WhatChangedClassifier.SEV_CRITICAL, 0);

        summary.automationChangesToday = automationCount;
        summary.automationSubtitle = automationCount > 0 ? 'Flows & process automation' : 'No automation changes';

        summary.accessChangesToday = accessCount;
        summary.accessSubtitle = 'Permissions & users';

        summary.highInterestChangesToday = highInterestCount;
        summary.highInterestSubtitle = highInterestCount > 0 ? 'Review recommended' : 'Normal parameters';

        // 2. Baseline comparison (count vs count — both uncapped)
        calculateBaseline(summary, now, repo);

        // 3. Hourly Distribution
        for (Integer h = 0; h < 24; h++) {
            Integer count = hourCounts.containsKey(h) ? hourCounts.get(h) : 0;
            summary.hourlyActivity.add(new WhatChangedDtos.HourlyDistributionDTO(formatHourLabel(h), h, count));
        }

        // 4. Category Mix Distribution
        for (String cat : catCounts.keySet()) {
            Integer count = catCounts.get(cat);
            Decimal pct = summary.totalChangesToday > 0
                ? ((Decimal.valueOf(count) / summary.totalChangesToday) * 100).setScale(1)
                : 0;
            summary.categoryMix.add(new WhatChangedDtos.CategoryDistributionDTO(cat, count, pct));
        }

        // 5. Attention Items ("Worth a look") with configurable thresholds
        summary.attentionItems = buildAttentionItems(highInterestCount, accessCount, automationCount);

        // 6. Recent changes (top 10)
        List<WhatChangedEventNormalizer.RawAuditInput> rawRecent = repo.queryEvents(
            todayStart, todayEnd, null, null, null, null, null, 10, null
        );
        summary.recentChanges = WhatChangedEventNormalizer.normalizeList(rawRecent);

        return summary;
    }

    /**
     * @description Retrieves paginated and filtered change events.
     * severity accepts a single value, a comma-separated list, or 'ELEVATED' (HIGH + CRITICAL).
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
        Set<String> severitySet = parseSeverities(severity);
        Integer pageSize = (limitRows != null && limitRows > 0) ? Math.min(limitRows, 200) : 50;

        WhatChangedDtos.ChangeEventsResponseDTO response = new WhatChangedDtos.ChangeEventsResponseDTO();

        if (incidentTime != null) {
            List<WhatChangedEventNormalizer.RawAuditInput> rawList = repo.queryEventsAroundTime(incidentTime, incidentWindowMinutes);
            List<WhatChangedDtos.ChangeEventDTO> filtered = filterEvents(
                WhatChangedEventNormalizer.normalizeList(rawList), category, severitySet, section, search
            );
            response.events = filtered;
            response.pageInfo = new WhatChangedDtos.PageInfoDTO(false, null, filtered.size());
            response.changeStories = groupChangeStories(filtered);
            return response;
        }

        // Bounded scan loop: keeps requesting chunks past the cursor until the page is
        // full. Repositories with native SOQL filters fill the page on the first chunk;
        // the live SetupAuditTrail source (which cannot filter Display/Section in SOQL)
        // may need several chunks.
        Integer maxIterations = WhatChangedSettings.getMaxScanIterations();
        List<WhatChangedDtos.ChangeEventDTO> collected = new List<WhatChangedDtos.ChangeEventDTO>();
        String scanCursor = cursor;
        Boolean exhausted = false;

        for (Integer iteration = 0; iteration < maxIterations && collected.size() <= pageSize; iteration++) {
            Integer chunkSize = repo.supportsNativeFilters() ? (pageSize + 1) : 500;
            List<WhatChangedEventNormalizer.RawAuditInput> rawChunk = repo.queryEvents(
                fromDate, toDate, actorId, section, search, category, severitySet, chunkSize, scanCursor
            );
            if (rawChunk.isEmpty()) {
                exhausted = true;
                break;
            }

            List<WhatChangedDtos.ChangeEventDTO> chunkDtos = WhatChangedEventNormalizer.normalizeList(rawChunk);
            collected.addAll(filterEvents(chunkDtos, category, severitySet, section, search));

            WhatChangedEventNormalizer.RawAuditInput lastRaw = rawChunk[rawChunk.size() - 1];
            scanCursor = WhatChangedAuditRepository.buildCursor(lastRaw.createdDate, lastRaw.id);

            if (rawChunk.size() < chunkSize) {
                exhausted = true;
                break;
            }
        }

        Boolean hasNext = collected.size() > pageSize || !exhausted;
        List<WhatChangedDtos.ChangeEventDTO> pagedEvents = new List<WhatChangedDtos.ChangeEventDTO>();
        for (Integer i = 0; i < Math.min(collected.size(), pageSize); i++) {
            pagedEvents.add(collected[i]);
        }

        String nextCursor = null;
        if (hasNext && !pagedEvents.isEmpty()) {
            WhatChangedDtos.ChangeEventDTO lastItem = pagedEvents[pagedEvents.size() - 1];
            nextCursor = WhatChangedAuditRepository.buildCursor(lastItem.createdDate, lastItem.id);
        } else if (hasNext && pagedEvents.isEmpty()) {
            // Scan budget exhausted without a match: let the client continue from where the scan stopped
            nextCursor = scanCursor;
        }

        // Exact total only when it is cheap and unambiguous (no filters the count cannot honor)
        Integer totalCount = null;
        Boolean hasNonCountableFilters =
            (String.isNotBlank(category) && !category.equalsIgnoreCase('ALL')) ||
            severitySet != null || String.isNotBlank(section) || String.isNotBlank(search) || String.isNotBlank(actorId);
        if (!hasNonCountableFilters) {
            totalCount = repo.countEvents(fromDate, toDate);
        }

        response.events = pagedEvents;
        response.pageInfo = new WhatChangedDtos.PageInfoDTO(hasNext, nextCursor, totalCount);
        response.changeStories = groupChangeStories(pagedEvents);
        return response;
    }

    /**
     * @description Retrieves contributor metrics and rankings (exact aggregates)
     */
    @AuraEnabled(cacheable=true)
    public static List<WhatChangedDtos.ContributorDTO> getContributors(DateTime fromDate, DateTime toDate) {
        WhatChangedSecurity.requireAccess();

        WhatChangedAuditRepository.IWhatChangedAuditRepository repo = WhatChangedAuditRepository.getInstance();
        List<WhatChangedAuditRepository.ActorStat> stats = repo.actorStats(fromDate, toDate);

        List<WhatChangedDtos.ContributorDTO> result = new List<WhatChangedDtos.ContributorDTO>();
        for (WhatChangedAuditRepository.ActorStat stat : stats) {
            WhatChangedDtos.ContributorDTO c = new WhatChangedDtos.ContributorDTO();
            c.actorId = stat.actorId;
            c.actorName = stat.actorName;
            c.totalChanges = stat.totalChanges;
            c.lastChangeDate = stat.lastChangeDate;
            c.lastActivityRelative = WhatChangedEventNormalizer.formatRelativeTime(stat.lastChangeDate);
            c.categoryCounts = stat.categoryCounts;
            c.primaryCategories = topCategories(stat.categoryCounts, 2);

            if (c.totalChanges >= 15) {
                c.trend = 'High activity';
            } else if (c.totalChanges >= 5) {
                c.trend = 'Steady';
            } else {
                c.trend = 'Occasional';
            }
            result.add(c);
        }

        return sortContributors(result);
    }

    /**
     * @description Retrieves longitudinal insights and trends (exact aggregates)
     */
    @AuraEnabled(cacheable=true)
    public static WhatChangedDtos.InsightsDTO getInsights(String range) {
        WhatChangedSecurity.requireAccess();

        DateTime now = System.now();
        Integer daysBack = 7;
        DateTime fromDate = now.addDays(-7);
        if (range == '30d') {
            fromDate = now.addDays(-30);
            daysBack = 30;
        } else if (range == '24h') {
            fromDate = now.addHours(-24);
        }

        WhatChangedAuditRepository.IWhatChangedAuditRepository repo = WhatChangedAuditRepository.getInstance();

        WhatChangedDtos.InsightsDTO insights = new WhatChangedDtos.InsightsDTO();
        insights.totalEvaluatedPeriodChanges = repo.countEvents(fromDate, now);

        Map<Date, Integer> dayCounts = repo.countByDay(fromDate, now);
        Map<Integer, Integer> hourCounts = scaleHoursToTotal(repo.countByHour(fromDate, now), insights.totalEvaluatedPeriodChanges);
        Map<String, Integer> catCounts = scaleToTotal(repo.countByCategory(fromDate, now), insights.totalEvaluatedPeriodChanges);
        Map<String, Integer> secCounts = scaleToTotal(repo.countBySection(fromDate, now), insights.totalEvaluatedPeriodChanges);

        // 1. Daily trends
        for (Integer i = daysBack - 1; i >= 0; i--) {
            Date d = now.addDays(-i).date();
            DateTime dt = DateTime.newInstance(d, Time.newInstance(12, 0, 0, 0));
            Integer count = dayCounts.containsKey(d) ? dayCounts.get(d) : 0;
            insights.dailyTrends.add(new WhatChangedDtos.DayDistributionDTO(dt.format('EEE'), dt.format('MMM d'), count));
        }

        // 2. Hourly trends
        for (Integer h = 0; h < 24; h++) {
            Integer count = hourCounts.containsKey(h) ? hourCounts.get(h) : 0;
            insights.hourlyTrends.add(new WhatChangedDtos.HourlyDistributionDTO(formatHourLabel(h), h, count));
        }

        // 3. Category distribution
        for (String cat : catCounts.keySet()) {
            Integer count = catCounts.get(cat);
            Decimal pct = insights.totalEvaluatedPeriodChanges > 0
                ? ((Decimal.valueOf(count) / insights.totalEvaluatedPeriodChanges) * 100).setScale(1)
                : 0;
            insights.categoryDistribution.add(new WhatChangedDtos.CategoryDistributionDTO(cat, count, pct));
        }

        // 4. Top sections (by volume)
        for (String sec : sortKeysByCountDesc(secCounts, 10)) {
            insights.topSections.add(new WhatChangedDtos.SectionStatDTO(sec, secCounts.get(sec)));
        }

        // 5. Severity distribution
        insights.severityDistribution = scaleToTotal(repo.countBySeverity(fromDate, now), insights.totalEvaluatedPeriodChanges);

        return insights;
    }

    // ==================================================================================
    // Filtering helpers
    // ==================================================================================

    /**
     * @description Parses a severity request parameter into a set of severity values.
     * Accepts a single value, a comma-separated list, or the ELEVATED alias.
     * Returns null when no severity filtering should be applied.
     */
    public static Set<String> parseSeverities(String severity) {
        if (String.isBlank(severity) || severity.trim().equalsIgnoreCase('ALL')) {
            return null;
        }
        Set<String> result = new Set<String>();
        for (String token : severity.split(',')) {
            String value = token.trim().toUpperCase();
            if (value == SEVERITY_ELEVATED) {
                result.add(WhatChangedClassifier.SEV_HIGH);
                result.add(WhatChangedClassifier.SEV_CRITICAL);
            } else if (KNOWN_SEVERITIES.contains(value)) {
                result.add(value);
            }
        }
        return result.isEmpty() ? null : result;
    }

    /**
     * @description Re-applies all request filters to normalized events. Always executed,
     * regardless of which filters the repository already pushed into SOQL.
     */
    private static List<WhatChangedDtos.ChangeEventDTO> filterEvents(
        List<WhatChangedDtos.ChangeEventDTO> events,
        String category,
        Set<String> severities,
        String section,
        String search
    ) {
        List<WhatChangedDtos.ChangeEventDTO> filtered = new List<WhatChangedDtos.ChangeEventDTO>();
        String query = String.isNotBlank(search) ? search.trim().toLowerCase() : null;

        for (WhatChangedDtos.ChangeEventDTO evt : events) {
            if (String.isNotBlank(category) && !category.equalsIgnoreCase('ALL') && !evt.category.equalsIgnoreCase(category)) {
                continue;
            }
            if (severities != null && !severities.contains(evt.severity)) {
                continue;
            }
            if (String.isNotBlank(section) && !section.equalsIgnoreCase(evt.section)) {
                continue;
            }
            if (query != null) {
                String haystack = (
                    (evt.title != null ? evt.title : '') + ' ' +
                    (evt.rawDisplay != null ? evt.rawDisplay : '') + ' ' +
                    (evt.action != null ? evt.action : '') + ' ' +
                    (evt.section != null ? evt.section : '') + ' ' +
                    (evt.actor != null && evt.actor.name != null ? evt.actor.name : '')
                ).toLowerCase();
                if (!haystack.contains(query)) {
                    continue;
                }
            }
            filtered.add(evt);
        }
        return filtered;
    }

    private static Integer valueOr(Map<String, Integer> counts, String key, Integer fallback) {
        return counts.containsKey(key) ? counts.get(key) : fallback;
    }

    /**
     * @description When distributions come from a bounded sample smaller than the exact
     * total (SetupAuditTrail cannot GROUP BY), proportionally scale the sampled counts to
     * the exact total so headline numbers and breakdowns stay consistent.
     */
    private static Map<String, Integer> scaleToTotal(Map<String, Integer> counts, Integer exactTotal) {
        Integer sampleTotal = 0;
        for (Integer c : counts.values()) sampleTotal += c;
        if (sampleTotal == 0 || exactTotal == null || exactTotal <= sampleTotal) {
            return counts;
        }
        Decimal factor = Decimal.valueOf(exactTotal) / sampleTotal;
        Map<String, Integer> scaled = new Map<String, Integer>();
        for (String key : counts.keySet()) {
            scaled.put(key, (Decimal.valueOf(counts.get(key)) * factor).round(System.RoundingMode.HALF_UP).intValue());
        }
        return scaled;
    }

    private static Map<Integer, Integer> scaleHoursToTotal(Map<Integer, Integer> counts, Integer exactTotal) {
        Integer sampleTotal = 0;
        for (Integer c : counts.values()) sampleTotal += c;
        if (sampleTotal == 0 || exactTotal == null || exactTotal <= sampleTotal) {
            return counts;
        }
        Decimal factor = Decimal.valueOf(exactTotal) / sampleTotal;
        Map<Integer, Integer> scaled = new Map<Integer, Integer>();
        for (Integer key : counts.keySet()) {
            scaled.put(key, (Decimal.valueOf(counts.get(key)) * factor).round(System.RoundingMode.HALF_UP).intValue());
        }
        return scaled;
    }

    private static List<String> topCategories(Map<String, Integer> categoryCounts, Integer topN) {
        List<String> keys = sortKeysByCountDesc(categoryCounts, topN);
        return keys;
    }

    private static List<String> sortKeysByCountDesc(Map<String, Integer> counts, Integer topN) {
        List<String> keys = new List<String>(counts.keySet());
        // insertion sort by count descending (maps here are small)
        for (Integer i = 1; i < keys.size(); i++) {
            String current = keys[i];
            Integer j = i - 1;
            while (j >= 0 && counts.get(keys[j]) < counts.get(current)) {
                keys[j + 1] = keys[j];
                j--;
            }
            keys[j + 1] = current;
        }
        List<String> top = new List<String>();
        for (Integer i = 0; i < Math.min(keys.size(), topN); i++) {
            top.add(keys[i]);
        }
        return top;
    }

    // ==================================================================================
    // Summary helpers
    // ==================================================================================

    private static void calculateBaseline(
        WhatChangedDtos.ChangeSummaryDTO summary,
        DateTime now,
        WhatChangedAuditRepository.IWhatChangedAuditRepository repo
    ) {
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
            item.filterParam = 'severity=ELEVATED';
            items.add(item);
        }

        if (accessCount >= WhatChangedSettings.getAttentionAccessThreshold()) {
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

        if (automationCount >= WhatChangedSettings.getAttentionAutomationThreshold()) {
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
        // Simple insertion sort for small contributor list
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
