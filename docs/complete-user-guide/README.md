# SAYAD ERP — Consolidated Interactive User & Operations Guide

> **Official Deliverable**: Single-File Self-Contained Interactive Documentation  
> **Primary Artifact**: [`index.html`](./index.html)  
> **Version**: 1.0 (FINAL) • September 2026  
> **Documentation Baseline**: `424f4b8` | **Final Delivery Baseline**: `2232938`

---

## 1. What is `index.html`?

`index.html` is the consolidated, interactive, single-file operational and user manual for **SAYAD ERP**. It brings together all user-facing documentation into a self-contained web manual that runs locally or hosted online without any external runtime dependencies.

### Key Characteristics
- **100% Self-Contained**: Zero external scripts, zero CDNs, zero remote fonts, and zero external stylesheets.
- **Offline-First**: Can be opened directly from disk (`file:///`) by double-clicking the file in any modern browser.
- **Full-Text Client Search**: Integrated search modal (`Ctrl+K` or `/`) indexing all chapters, sections, SOPs, troubleshooting entries, reports, and permissions.
- **Dual Theme**: Seamless light and dark mode switching with persistent local storage.
- **Print & PDF Ready**: Dedicated `@media print` stylesheets that reformat the document for clean A4 printing and browser "Save as PDF".
- **Downloadable**: Includes an offline export button to save a clean copy as `SAYAD-ERP-Complete-User-Guide.html`.

---

## 2. How to Open Locally

1. Navigate to `docs/complete-user-guide/` in your local file explorer.
2. Double-click [`index.html`](./index.html) (or right-click → Open with Chrome / Edge / Firefox).
3. The guide loads immediately. No local web server or `npm` command is required.

---

## 3. How to Download an Offline Copy

Inside the open guide:
1. Click the **"📥 تحميل أوفلاين" (Download Offline Guide)** button located on the top toolbar.
2. The browser automatically generates and downloads `SAYAD-ERP-Complete-User-Guide.html`.
3. The downloaded file can be transferred via USB or email and will run anywhere completely offline.

---

## 4. How to Print or Save as PDF

1. Click the **"🖨️ طباعة / PDF"** button on the top toolbar (or press `Ctrl+P`).
2. In the browser print dialog:
   - **Destination**: Choose "Save as PDF" (or select a physical printer).
   - **Paper Size**: A4.
   - **Options**: Enable "Background graphics" to preserve badge and callout colors.
3. The document automatically hides navigation sidebars, toolbars, and search modals, producing a clean, book-quality manual.

---

## 5. Consolidated Canonical Documentation Mapping

This single deliverable consolidates and faithfully preserves the following authoritative sources:

| Source Document | Chapters in Consolidated Guide | Covered Scope & Metrics |
|-----------------|-------------------------------|-------------------------|
| `docs/user-manual/01` to `11` | Chapters 1 through 13 | 11 core functional modules, business rules, workflows, and form validations. |
| `docs/reports/01-reports-guide.md` | Chapter 14 | All 20 reporting artifacts (12 User Reports, 2 Dashboards, 1 Analysis, 2 Reconciliations, 2 Backend-Only, 1 Placeholder). |
| `docs/sop/01-standard-operating-procedures.md` | Chapter 15 | All 155 Standard Operating Procedures (interactive collapsible cards). |
| `docs/troubleshooting/01-troubleshooting-guide.md` | Chapter 16 | All 98 operational troubleshooting scenarios with severity & module filters. |
| `docs/permissions/01-permissions-reference.md` | Chapter 17 | All 182 source permissions, 178 staging persisted, and staging drift notes. |
| System Catalog & Integration | Chapters 18, 19 & Appendices | Comprehensive glossary, quick reference index, routes catalog (142 routes), and 26 cross-module workflows. |

---

*Note: The canonical Markdown files in `docs/` remain the primary source of truth for the codebase.*
