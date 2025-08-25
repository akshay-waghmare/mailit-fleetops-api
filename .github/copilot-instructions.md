# Copilot instructions — Schedule Pickup + Pickup Management Integration
Purpose
-------
Implement the integration between Schedule Pickup and Pickup Management components as described in `SCHEDULE-PICKUP-INTEGRATION-PLAN.md`. This creates a complete pickup workflow from scheduling to tracking and analytics.

Quick Demo / Current Status
---------------------------
**Phase 1 Complete** ✅ - Basic components implemented:
- Schedule Pickup: http://localhost:4200/pickup (3-step stepper workflow)
- Pickup Management: http://localhost:4200/pickup-list (Material table with filters)
- Pickup Analytics: http://localhost:4200/pickup-analytics (basic stub)

**Next Phase** 🔄 - Integration implementation:
- Link pickup creation to management list
- Real-time updates and notifications  
- Enhanced tracking and analytics

Quick run steps (from repo root):
```bash
cd frontend
npm install         # only if dependencies are missing
NG_CLI_ANALYTICS=0 npx ng serve console-app --port 4200
# Test workflow: /pickup → create pickup → should appear in /pickup-list
```

High-level goal
---------------
Create seamless integration between pickup scheduling and management by implementing:
1. **Data Flow**: Schedule Pickup → Backend Storage → Pickup Management
2. **Real-time Updates**: New pickups appear immediately in management list
3. **Status Tracking**: Complete pickup lifecycle management
4. **Analytics Integration**: Live metrics and performance insights

Implementation roadmap (4-week plan)
-----------------------------------
**Week 1: Backend Integration**
- [ ] Update `PickupService` with `createPickup()` method
- [ ] Integrate pickup creation in `pickup.component.ts` 
- [ ] Add success notifications with management navigation links
- [ ] Test end-to-end pickup creation → list appearance flow

**Week 2: Real-time Integration**  
- [ ] Add auto-refresh to pickup-list component
- [ ] Implement pickup highlighting via query parameters
- [ ] Add "Schedule New Pickup" navigation buttons
- [ ] Test real-time pickup updates and notifications

**Week 3: Enhanced Management**
- [ ] Create pickup detail modal component 
- [ ] Add edit/duplicate functionality from management list
- [ ] Implement status update and history tracking
- [ ] Test complete CRUD operations workflow

**Week 4: Analytics & Advanced Features**
- [ ] Connect pickup creation to real-time analytics
- [ ] Add performance metrics and trend analysis
- [ ] Implement advanced filtering and export features
- [ ] Performance testing and optimization

Core integration points
-----------------------
- **Data transformation**: `SchedulePickupData` → `PickupRecord` 
- **Service enhancement**: `PickupService.createPickup()` method
- **Navigation flow**: Pickup creation → Management list with highlighting
- **Real-time updates**: Auto-refresh pickup list every 30 seconds
- **Status management**: Track pickup lifecycle from scheduled → completed

Quick validation steps
---------------------
1. **Test current components**:
```bash
cd frontend && NG_CLI_ANALYTICS=0 npx ng serve console-app --port 4200
```

2. **Verify pickup creation workflow**:
   - Visit http://localhost:4200/pickup
   - Complete 3-step form (Client → Details → Service)
   - Confirm pickup creation success
   - Navigate to http://localhost:4200/pickup-list
   - Verify pickup appears in management list

3. **Test integration points**:
   - Check pickup data consistency
   - Verify status tracking
   - Test navigation between components

Technical implementation files
-----------------------------
**Core files to modify**:
- `frontend/libs/shared/pickup.service.ts` - Add createPickup() method
- `frontend/apps/console-app/src/app/pages/pickup.component.ts` - Integration calls
- `frontend/apps/console-app/src/app/pages/pickup-list.component.ts` - Auto-refresh & highlighting
- `frontend/apps/console-app/src/app/pages/pickup-analytics.component.ts` - Real-time metrics

**New files to create**:
- `pickup-detail-modal.component.ts` - Detailed pickup view
- `pickup-status.service.ts` - Status management service
- Integration test files for end-to-end workflow

Development guidelines
---------------------
- Follow existing Angular standalone components pattern
- Use Material Design + Tailwind CSS for consistency
- Implement demo data fallbacks for offline development
- Add comprehensive error handling for API failures
- Test on mobile devices for responsive design
- Use TypeScript strict mode and follow existing patterns

Architecture principles
-----------------------
- **Service-driven**: All data operations through PickupService
- **Real-time updates**: Auto-refresh and highlighting for UX
- **Modular components**: Reusable pickup detail modal and status management
- **Progressive enhancement**: Graceful degradation if backend unavailable
- **Mobile-first**: Responsive design for field staff usage

Contact / Resources
------------------
- **Main Plan**: `SCHEDULE-PICKUP-INTEGRATION-PLAN.md` (complete 4-week roadmap)
- **Original Plan**: `PICKUP-MANAGEMENT-DASHBOARD-PLAN.md` (dashboard specifications)
- **Implementation Notes**: `PICKUP-MANAGEMENT-IMPLEMENTATION-NOTES.md` (completed work log)
- **Current Status**: Basic components complete, integration in progress

Priority: **High** | Status: **Integration Phase** | Target: **4 weeks**
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
