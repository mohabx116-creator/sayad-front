# Phase 4A.3 Purchases Targeted Visual Polish Report

## Overview
This phase successfully completed a targeted visual-polish pass for the Purchases module (Invoices and Returns) without rewriting any component logic or modifying the backend. The primary focus was on resolving translation gaps, reducing excessive whitespace, correcting duplicate headings, and enforcing visual consistency with the 8/4 Grid layout.

## Completed Tasks

### 1. Localization completeness
- Addressed all remaining hardcoded keys in `ar.json` and `en.json`.
- Missing keys such as `purchase-invoice`, `subtotal`, `grand-total`, `total-tax`, `discount`, `total-discount`, `unit-cost`, `return-cancelled`, `no-cancel-reason`, `return-number`, `return-date`, `returnable-quantity`, `return-total`, `rows-per-page`, `date-from`, `date-to`, `post`, `post-return`, `return-lines`, and `return-notes` were added.
- Fallback/raw keys no longer appear on screens or in tables.

### 2. Page Headings & Breadcrumbs
- Removed the `<Typography variant="h2">` duplicate rendering from the `Breadcrumbs` component by applying `card={false}`, `title={false}`, and `divider={false}` on the 6 Purchase pages.
- Aligned custom `<Typography variant="h2">` headings with the Breadcrumb trail directly below it, bringing action buttons (Post, Save as Draft, Cancel, Back, Edit) cleanly in-line horizontally.

### 3. Form and Details Layout Ordering
- Fixed the order of the summary 4-column sidebars on all Details and Forms pages to place `totals-summary` logically above the `invoice-notes` and `return-notes`.
- Removed `sx={{ height: '100%' }}` flex stretching from the Notes component, which was causing the empty box to stretch to the bottom of the viewport awkwardly.

### 4. Table Polish
- Added `sx={{ minWidth: 900 }}` to Item detail tables in Forms and Details pages to prevent the fields from crushing together in smaller viewpoints. This ensures clean horizontal scrolling behavior without affecting the page layout.
- Added localization to the Material-UI `<TablePagination>` using `labelRowsPerPage`.

### 5. "جار التحميل" Sidebar Observation
- Investigated the multiple "جار التحميل" loading entries in the sidebar.
- Concluded that it is a global issue caused by a pre-existing defect in the Berry layout (`sayad-front/src/layout/MainLayout/MenuList/index.tsx`) where the `widgetMenu` is spliced permanently into the global menu structure upon API menu load.
- Documented as an out-of-scope global issue per the requirements constraints.

## Validation Checklist
- [x] All localization raw keys are removed.
- [x] Breadcrumbs and titles are cleanly merged with no duplication.
- [x] Totals Summary is placed above Notes on forms and details.
- [x] White spaces and layout margins are cleaned up.
- [x] `yarn build` passed.
- [x] `yarn lint` passed.
- [x] `yarn tsc` passed.
- [x] Backend untouched.

## Next Steps
The Purchases module visual alignment and polish for Phase 4A is fully complete. The code is ready for the Phase 4B visual QA or next functional phase.
