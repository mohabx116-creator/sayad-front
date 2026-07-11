# Berry Reference Map

This document maps reusable components and examples from the Berry template for future use before demo routes are removed.

## Components & Examples

| Component/Feature | Path | Classification |
| --- | --- | --- |
| DataGrid | `src/views/forms/tables/DataGrid.tsx` (and `GridTable.tsx`) | REUSE |
| Tables | `src/views/forms/tables/TableBasic.tsx`, `TableCollapsible.tsx`, `TableCustomized.tsx`, `TableDense.tsx`, `TableEnhanced.tsx`, `TableStickyHead.tsx` | REFERENCE ONLY |
| Autocomplete | `src/views/forms/components/AutoComplete.tsx` | REUSE |
| Date pickers | `src/views/forms/components/DateTime.tsx` | REUSE |
| React Hook Form examples | `src/views/forms/plugins/WysiwugEditor.tsx` (sometimes uses RHF), `src/views/forms/forms-validation.tsx` | REFERENCE ONLY |
| Formik examples | `src/views/forms/forms-validation.tsx`, `src/views/pages/authentication/auth-forms/*` | KEEP UNTIL REPLACED |
| Dialogs | `src/views/ui-elements/advance/UIDialog/` | REUSE |
| Drawers | `src/layout/MainLayout/Sidebar/` | KEEP |
| Charts | `src/views/widget/Chart/` | REUSE |
| File upload | `src/views/forms/plugins/Dropzone.tsx` (if available), `src/views/forms/plugins/FileUpload.tsx` | REUSE |
| Toast notifications | `src/views/ui-elements/advance/UISnackbar.tsx` (uses notistack) | REUSE |
| Skeletons | `src/ui-component/cards/Skeleton/` | KEEP |
| Loaders | `src/ui-component/Loader.tsx` | KEEP |
| Empty states | `src/views/pages/maintenance/Error.tsx` (and others) | REUSE |
| Error states | `src/views/pages/maintenance/Error.tsx` | KEEP |
| Print layouts | `src/views/application/invoice/` | REFERENCE ONLY |
| User profile menu | `src/layout/MainLayout/Header/ProfileSection/` | KEEP |
| Settings panel | `src/layout/MainLayout/Header/Customization/` | KEEP UNTIL REPLACED |
| RTL behavior | `src/ui-component/RTLLayout.tsx` | KEEP |
| Language switcher | `src/layout/MainLayout/Header/LocalizationSection/` | KEEP |

## Action Plan
- **KEEP**: Foundational files that remain in SAYAD permanently.
- **REUSE**: Extract patterns or wrap in Sayad-specific components before deleting the demo.
- **REFERENCE ONLY**: Keep the code around until a SAYAD equivalent is built, then delete.
- **REMOVE NOW**: Demo routes that are purely visual noise and have no implementation value for SAYAD.
- **KEEP UNTIL REPLACED**: Core UI pieces (like the settings panel) that we need for development but will eventually replace with SAYAD branding.
