# WhatChanged Architecture

WhatChanged is a native Salesforce change intelligence and configuration observability platform built with **Salesforce Multi-Framework** (React + TypeScript) and a robust, secure **Apex REST backend**.

---

## High-Level Topology

```
User (Salesforce Lightning App Launcher)
   │
   ▼
Salesforce App Domain (https://<org>--c.<instance>.my.salesforce.app/app/c__whatChangedApp)
   │
   ▼
Native Multi-Framework React Frontend (UIBundle: whatChangedApp)
   │  Uses @salesforce/platform-sdk/data createDataSDK()
   ▼
Salesforce Apex REST API Endpoints (/services/apexrest/what-changed/v1/*)
   ├── WhatChangedSecurity (Custom Permission Gate: WhatChanged_Access)
   ├── WhatChangedAuditService (Orchestration, Baselines, Change Stories Clustering)
   ├── WhatChangedClassifier (Deterministic 11 Categories, 5 Severity Tiers)
   ├── WhatChangedEventNormalizer (Human-readable summaries & title transforms)
   └── WhatChangedAuditRepository (SOQL Keyset Pagination on SetupAuditTrail)
          │
          ▼
   Salesforce SetupAuditTrail & Platform Data
```

---

## Key Components

### 1. Apex REST Services (`force-app/main/default/classes/`)
* **`WhatChangedApi.cls`**: Apex REST Controller serving:
  * `GET /services/apexrest/what-changed/v1/summary`: High-level metrics, 24-hour hourly distributions, category counts, baseline comparisons.
  * `GET /services/apexrest/what-changed/v1/events`: Paginated setup audit trail events with story grouping and filtering.
  * `GET /services/apexrest/what-changed/v1/people`: Contributor intelligence, active engineers, and top modified areas.
  * `GET /services/apexrest/what-changed/v1/insights`: 7-day and 30-day longitudinal trends and patterns.
* **`WhatChangedAuditService.cls`**: Core service orchestrating data enrichment, statistical baselines, and multi-event story aggregation.
* **`WhatChangedClassifier.cls`**: Deterministic classification engine mapping setup action codes to categories (Automation, Security & Access, Schema, etc.) and risk tiers (`INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
* **`WhatChangedEventNormalizer.cls`**: Generates clean human-readable titles, narratives, and contextual diff highlights from raw audit trail records.
* **`WhatChangedSecurity.cls`**: Centralized security enforcer checking `FeatureManagement.checkPermission('WhatChanged_Access')`.
* **`WhatChangedAuditRepository.cls`**: Robust database repository handling SOQL execution and keyset pagination.

### 2. Multi-Framework React Application (`force-app/main/default/uiBundles/whatChangedApp/`)
* **Multi-Framework Runtime**: Native React 18 application running inside the Salesforce Multi-Framework container (`UIBundle`).
* **Vite + Tailwind CSS**: Optimized bundle size, lightning-fast compilation, modern dark/light mode UI.
* **Data SDK Integration**: Utilizes `@salesforce/platform-sdk` to make secure in-session REST calls to Apex endpoints without storing OAuth tokens.
* **Standalone Demo Mode**: Automatically provides realistic mock data when running outside Salesforce (e.g. during local Vite development).

---

## Security Model

1. **Authentication**: Handled natively by the Salesforce Platform runtime.
2. **Authorization**: Gated by the `WhatChanged_Access` Custom Permission. Administrators assign the `WhatChanged_User` Permission Set to authorized users.
3. **Data Access**: Enforces `WITH SYSTEM_MODE` / `WITH USER_MODE` where appropriate with strict field-level security checks and sanitized inputs.
