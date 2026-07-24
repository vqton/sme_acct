# Plan: Frontend Rewrite — Ant Design → Tailwind + shadcn/ui

> **Status:** ✅ COMPLETE (verified 2026-07-24)
> All phases done. 32 pages use shadcn/ui + Tailwind. Zero Ant Design references remain.

## Overview
Replace the entire Ant Design + inline-styles frontend with Tailwind CSS + shadcn/ui components. The backend integration layer (API service, types, auth hook) stays intact — only the UI layer gets rebuilt.

## Architecture Decisions
- **Keep**: `services/api.ts` (62 methods), `types/index.ts` (28+ interfaces), `hooks/useAuth.tsx` (auth logic)
- **Remove**: All 31 page components, 3 shared components, Ant Design dependency, inline styles
- **Replace with**: shadcn/ui components (built on Radix UI + Tailwind)
- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + react-router-dom v6
- **Approach**: Vertical slices — build one complete feature path at a time

## Phase 1: Foundation ✅
- [x] Remove old client code (pages, components, old styles)
- [x] Initialize shadcn/ui with Vite template (`npx shadcn@latest init --preset b0 --template vite`)
- [x] Restore `services/api.ts`, `types/index.ts`, `hooks/useAuth.tsx`
- [x] Build app shell: Sidebar layout with shadcn Sheet/Command for navigation
- [x] Set up routing with ProtectedRoute
- [x] Build CompanySelector page with shadcn Card/Button

**Checkpoint**: App compiles, login/company selection works with new UI ✅

## Phase 2: Auth Pages ✅
- [x] LoginPage — shadcn Card, Form, Input, Button
- [x] RegisterPage — shadcn Card, Form, Input, Button, Password strength
- [x] ForgotPasswordPage — shadcn Card, Form, Input
- [x] TwoFactorVerifyPage — shadcn Card, Input OTP
- [x] TwoFactorSetupPage — shadcn Card, QR display

**Checkpoint**: Full auth flow works end-to-end ✅

## Phase 3: Core Pages ✅
- [x] DashboardPage — shadcn Card, Badge, Table for KPIs
- [x] CompaniesPage — shadcn Table, Badge, Dialog for status
- [x] CompanyFormPage — shadcn Form, Input, Select, Textarea
- [x] CompanyDetailPage — shadcn Tabs, Table, Dialog for sub-resources
- [x] SessionsPage — shadcn Table, Badge, Button

**Checkpoint**: Company management fully functional ✅

## Phase 4: Accounting Core ✅
- [x] ChartOfAccountsPage — shadcn Table, Dialog, Input search
- [x] JournalEntryListPage — shadcn Table, Badge, Dialog
- [x] JournalEntryFormPage — shadcn Form, dynamic line items
- [x] LedgerPage — shadcn Table, Select filters
- [x] TrialBalancePage — shadcn Table, Select
- [x] FinancialStatementPage — shadcn Tabs, Table
- [x] PeriodClosePage — shadcn Card, Button, Alert

**Checkpoint**: Core accounting workflow functional ✅

## Phase 5: Tax ✅
- [x] TaxListPage — shadcn Table, Badge, Tabs
- [x] TaxDeclarationFormPage — shadcn Form, dynamic lines
- [x] TaxDeclarationDetailPage — shadcn Card, Table, Badge
- [x] TaxCalendarPage — shadcn Table, Badge, Card
- [x] TaxPeriodManagementPage — shadcn Table, Dialog, Badge

**Checkpoint**: Tax module functional ✅

## Phase 6: User & Department Management ✅
- [x] UsersPage — shadcn Table, Input search, Badge
- [x] UserFormPage — shadcn Form, Checkbox roles
- [x] UserDetailPage — shadcn Card, Badge, Table
- [x] UserGroupsPage — shadcn Table, Dialog, Switch
- [x] DepartmentsPage — shadcn Tree (custom), Dialog
- [x] DepartmentDetailPage — shadcn Tabs, Table, Badge

**Checkpoint**: User/dept management functional ✅

## Phase 7: Opening Balance ✅
- [x] OpeningBalanceListPage — shadcn Table, Badge, Dialog
- [x] OpeningBalanceFormPage — shadcn Form, dynamic lines
- [x] OpeningBalanceDetailPage — shadcn Card, Badge, Table

**Checkpoint**: Opening balance workflow functional ✅

## Phase 8: Stub Modules & Polish ✅
- [x] ModuleStub — shadcn Card placeholder (15 routes)
- [x] i18n integration
- [x] Final cleanup: remove unused deps, verify build

**Checkpoint**: Full app builds and runs ✅

## Files Kept (not modified)
- `client/src/services/api.ts` — API layer (62 methods)
- `client/src/types/index.ts` — TypeScript types (28+ interfaces)
- `client/src/hooks/useAuth.tsx` — Auth context + hook
- `client/src/i18n/` — i18n provider + translations

## Files Removed
- All `client/src/pages/*` — rebuilt with shadcn/ui
- All `client/src/components/*` — rebuilt with shadcn/ui
- `client/src/test/setup.ts` — will recreate if needed
