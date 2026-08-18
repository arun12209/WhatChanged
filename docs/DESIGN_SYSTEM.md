# WhatChanged Design System

The WhatChanged user interface is crafted to deliver a modern, high-density engineering observability and intelligence dashboard for Salesforce administrators and architects.

---

## 🎨 Color Palette & Themes

### Dark Mode (Default)
- **Background**: `#090d16` (Deep Obsidian) / `#0f172a` (Slate 900)
- **Surface / Cards**: `#131c31` (Navy Slate) with subtle border `#1e293b`
- **Primary / Brand Accent**: `#6366f1` (Indigo 500) to `#818cf8` (Indigo 400)
- **Text**: Primary `#f8fafc` (Slate 50), Secondary `#94a3b8` (Slate 400), Muted `#64748b` (Slate 500)

### Light Mode
- **Background**: `#f8fafc` (Slate 50)
- **Surface / Cards**: `#ffffff` (Pure White) with border `#e2e8f0` (Slate 200)
- **Primary / Brand Accent**: `#4f46e5` (Indigo 600)
- **Text**: Primary `#0f172a` (Slate 900), Secondary `#475569` (Slate 600), Muted `#94a3b8` (Slate 400)

---

## 🚦 Severity Tiers & Indicators

| Severity | Color | Background (Badge) | Description |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `#ef4444` (Red 500) | `rgba(239, 68, 68, 0.15)` | Immediate platform risk (e.g. security bypass, mass purge, license changes) |
| **HIGH** | `#f97316` (Orange 500) | `rgba(249, 115, 22, 0.15)` | Elevated risk changes (e.g. core permission sets, profile mods, apex triggers) |
| **MEDIUM** | `#eab308` (Yellow 500) | `rgba(234, 179, 8, 0.15)` | Operational impacts (e.g. flow activations, validation rules, field deletions) |
| **LOW** | `#3b82f6` (Blue 500) | `rgba(59, 130, 246, 0.15)` | Standard operational modifications (e.g. layout tweaks, report updates) |
| **INFO** | `#64748b` (Slate 500) | `rgba(100, 116, 139, 0.15)` | Informational notifications and minor metadata touchpoints |

---

## 🧩 Key UI Components

1. **Executive KPI Cards**: Display 24-hour summary metrics with baseline delta pill indicators.
2. **Activity Heatmap & Timeline Group**: Hourly histogram and chronologically clustered change stories.
3. **Incident Mode Investigation Bar**: Precision sliding window filter for correlating changes during release windows or incidents.
4. **Command Palette (`⌘K` / `/`)**: Global quick-search dialog for rapid navigation across categories, events, and contributors.
5. **Event Detail Drawer**: Deep-dive slideover inspector presenting full audit details, actor metadata, and raw Salesforce payloads.
