# Copilot instructions — Pickup Management Dashboard executor
Purpose
-------
Provide concise, actionable instructions for implementing the Pickup Management Dashboard described in `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` at the repository root. This file is the quick executor note for contributors and Copilot.

Quick Demo / Quick view
-----------------------
To quickly view the pickup list in development after starting the console app dev server, open:

  http://localhost:4200/pickup-list

Quick run steps (from repo root):

```bash
cd frontend
npm install         # only if dependencies are missing
npx ng serve console-app --port 4200
# then open http://localhost:4200/pickup-list
```

If `ng` is not available in this environment, use the project scripts or ensure the Angular CLI is installed globally (`npm i -g @angular/cli`) or run via npx: `npx ng serve console-app --port 4200`.

High-level goal
---------------
Implement the Pickup Management Dashboard (list, analytics, detail modal, actions, export) following the plan file `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md`. Keep changes scoped, follow existing repo conventions, and use Angular standalone components + Angular Material and Tailwind utilities.

Minimum required tasks (checklist)
---------------------------------
- Create a feature branch named `feature/pickup-management` before making changes.
- Implement `pickup-list.component` (Material table with filters, sorting, pagination) at `frontend/apps/console-app/src/app/pages/`.
- Add supporting components: `pickup-detail-modal`, `pickup-analytics`, and any small UI Kit components under `frontend/apps/ui-kit/src/` or `libs/ui-kit` following existing patterns.
- Add `pickup.service.ts` and `pickup.interface.ts` under `frontend/libs/shared` (or the existing shared folder) to call backend APIs described in the plan.
- Wire routes: add `pickup-list` and `pickup-analytics` entries to the console app router and update the sidebar navigation.
- Add unit tests (Jasmine/Karma or the project's test runner) for the main components and a small integration test for the service (mocked HTTP) — at least happy path + one edge case.
- Ensure all new code uses Angular standalone components style and follows the repo TypeScript/formatting conventions.
- Run build, lint, and tests locally; fix issues until green. Commit with clear messages and open a PR when ready.

Execution guidance and constraints
---------------------------------
- Follow existing conventions in the repo for file locations, naming, and module boundaries. Inspect `frontend/apps/console-app` and `frontend/apps/ui-kit` to mirror patterns.
- Use Angular Material components and Tailwind utilities already present in the project. Respect `tailwind.config.js` colors and theming.
- Do not create or publish external packages. Do not make network requests to external services while implementing tests; mock HTTP responses instead.
- Avoid exposing secrets or changing CI/CD configurations in this change. Keep changes scoped to the pickup management feature.

API and data contract
---------------------
Use the endpoints and TypeScript interfaces listed in `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` as the source of truth for service shapes and query parameters. If an endpoint is missing, create a TODO and implement the frontend assuming the interface; coordinate backend changes via a separate issue/PR.

How to validate locally (short)
------------------------------
1. From repo root: install deps (if needed) and start console app dev server:

```bash
cd frontend
npm install
npx ng serve console-app --port 4200
```

2. Open the pickup list in your browser:

  http://localhost:4200/pickup-list

If you prefer tests only:

```bash
npm test --workspace=console-app
```

Contact / notes
---------------
If a missing backend API or schema prevents implementing a feature, add a TODO in the code and open an issue describing the required endpoint and minimal contract.

This file is intentionally concise — use `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` as the authoritative specification for feature details. Implement the plan incrementally: foundation (list + service) → analytics → details/actions → exports/real-time.
# 🚚 FleetOps Pickup Page Implementation Plan<!-- FleetOps Full-Stack Monorepo - Angular Frontend Setup Instructions -->



## 🎯 Objective# 🚀 FleetOps UI Enhancement Plan: Angular Material + Tailwind CSS Hybrid

Create a pickup page that follows the **exact same structure and design** as the existing orders page, but adapted for pickup operations only (no delivery components).

## ✅ PICKUP PAGE IMPLEMENTATION COMPLETE

## 📋 Requirements Analysis

### 🎯 Status Update (Completed August 2025)

### Orders Page Structure (Reference)The **Pickup Page** has been successfully implemented with full functionality including:

- **Step 1**: Client Selection (with search, filters, enhanced cards)

- **Step 2**: Shipment Details (weight, dimensions, sender details, delivery details)- ✅ **Complete Pickup Interface**: 3-step stepper workflow (Client Selection → Item Details → Schedule & Confirm)

- **Step 3**: Carrier Selection (serviceability check, carrier options)- ✅ **Client Management**: Search, filter, and select clients with real-time validation

- ✅ **Item Details**: Pickup item count, weight, description, and special instructions

### Pickup Page Structure (Target)- ✅ **Time Slot Selection**: Interactive time slot picker with availability status

- **Step 1**: Client Selection (identical to orders page)- ✅ **Carrier Selection**: Multiple pickup service options (Express, Standard, Economy)

- **Step 2**: Pickup Details (weight, dimensions, pickup address, items description)- ✅ **Form Validation**: Comprehensive reactive form validation with Material Design

- **Step 3**: Pickup Service Selection (pickup time slots, service options)- ✅ **Responsive Design**: Mobile-first responsive layout with Tailwind CSS utilities

- ✅ **Navigation Integration**: Fully integrated with main app routing and navigation

## 🔄 Implementation Strategy

**Implementation Location**: `/frontend/apps/console-app/src/app/pages/pickup.component.ts`

### Phase 1: Copy Orders Page Structure ✅**Architecture**: Standalone Angular 20 component with inline Material Design components

1. Use orders page as base template**Bundle Size**: 60.91 kB (optimal for lazy loading)
# Copilot instructions — Pickup Management Dashboard executor

Purpose
-------
Replace the previous Copilot instruction document with a concise, actionable set of instructions that direct Copilot (and collaborators) to implement the Pickup Management Dashboard described in `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` located at the repository root.

High-level goal
---------------
Implement the Pickup Management Dashboard end-to-end following the plan in `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md`: frontend components, UI Kit additions, services, routing, backend API integration points, tests, and documentation — while preserving repository conventions and the existing FleetOps design system.

Minimum required tasks (checklist)
---------------------------------
- [ ] Create a feature branch named `feature/pickup-management` before making changes.
- [ ] Implement `pickup-list.component` (Material table with filters, sorting, pagination) at `frontend/apps/console-app/src/app/pages/`.
- [ ] Add supporting components: `pickup-detail-modal`, `pickup-analytics`, and any small UI Kit components under `frontend/apps/ui-kit/src/` or `libs/ui-kit` following existing patterns.
- [ ] Add `pickup.service.ts` and `pickup.interface.ts` under `frontend/libs/shared` (or existing shared folder) to call backend APIs described in the plan.
- [ ] Wire routes: add `pickup-list` and `pickup-analytics` entries to the console app router and update the sidebar navigation item(s).
- [ ] Add unit tests (Jasmine/Karma or the project's test runner) for the main components and a small integration test for the service (mocked HTTP) — at least happy path + one edge case.
- [ ] Ensure all new code uses Angular standalone components style and follows the repo TypeScript/formatting conventions.
- [ ] Run build, lint, and tests locally; fix issues until green. Commit with clear messages and open a PR when ready.

Execution guidance and constraints
---------------------------------
- Follow existing conventions in the repo for file locations, naming, and module boundaries. Inspect `frontend/apps/console-app` and `frontend/apps/ui-kit` to mirror patterns.
- Use Angular Material components and Tailwind utilities already present in the project. Respect `tailwind.config.js` colors and theming.
- Do not create or publish external packages. Do not make network requests to external services while implementing tests; mock HTTP responses instead.
- Avoid exposing secrets or changing CI/CD configurations in this change. Keep changes scoped to the pickup management feature.

API and data contract
---------------------
Use the endpoints and TypeScript interfaces listed in `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` as the source of truth for service shapes and query parameters. If an endpoint is missing, create a TODO and implement the frontend assuming the interface; coordinate backend changes via a separate issue/PR.

Development checklist for each PR
-------------------------------
- Branch name follows `feature/pickup-management`.
- Commit messages are small, focused, and reference the issue/plan when applicable.
- Add/modify routes and navigation entries with clear titles and icons.
- Include unit tests for new components and services. Keep tests fast and deterministic.
- Run `npm run build` (or `ng build console-app`) and `npm test` locally; fix errors before PR.

How to validate locally (short)
------------------------------
1. From repo root: install deps (if needed) and start console app dev server:

  cd frontend
  npm install
  ng serve console-app --port 4200

2. Run unit tests:

  npm test --workspace=console-app

If build or tests fail, iterate locally and fix lint/type issues.

Contact / notes
---------------
If a missing backend API or schema prevents implementing a feature, add a TODO in the code and open an issue describing the required endpoint and minimal contract.

This file is intentionally concise — use `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` as the authoritative specification for feature details. Implement the plan incrementally: foundation (list + service) → analytics → details/actions → exports/real-time.
  - Pickup Address (from sender details in orders)- **Professional design** already implemented ✅
