# FleetOps Spec-Driven Development Constitution

Defines non-negotiable engineering principles, quality gates, and the governance model that all features (backend + frontend) must follow. This document supersedes ad‑hoc conventions; deviations must be explicitly justified in feature plans.

## Core Principles

### I. Spec Before Code
All substantial work starts with a feature directory under `specs/` produced via `/specify` (+ `/clarify` if ambiguity). No implementation without a committed `spec.md` for new features.

### II. Plan & Tasks Discipline
Implementation plans (`plan.md`) and dependency-ordered tasks (`tasks.md`) are required before writing production code (except trivial `chore:` / `docs:` changes). Tasks enforce failing-first tests for contracts & integration.

### III. Test-First & Red-Green Integrity
Contract tests, integration tests, and critical unit tests must be authored to fail before implementing endpoints, persistence, or UI flows. Green build required before merging. No skipping red → green cycle.

### IV. Contracts Are Source of Truth
API/interface changes flow: Update `contracts/` → Regenerate / adjust tests → Implement code. Never silently drift implementation from contract. Data model updates follow `data-model.md` first.

### V. Simplicity & Iterative Delivery
Prefer minimal viable slice (list → create → analytics → enrichment). Defer speculative abstractions until justified by at least two concrete use cases. Remove dead code promptly.

### VI. Observability & Traceability
Backend changes must maintain logging (structured), error transparency, and provide IDs for correlation (orderId, pickupId). Specs must enumerate required operational metrics for new domain events.

### VII. Consistency Across Frontend & Backend
Shared DTO fields and naming conventions remain aligned; mismatches trigger immediate contract update (& migration if needed). Angular services reflect backend pagination/filter semantics exactly.

## Additional Constraints & Standards

### Technology Stack Guardrails
- Backend: Spring Boot (Java), Flyway for migrations, PostgreSQL primary datastore.
- Frontend: Angular + Angular Material + Tailwind (respect existing theme variables). No additional UI frameworks without plan justification.
- Real-time: Server-Sent Events (SSE) for current live dashboards; evaluate WebSocket only if SSE limits reached.

### Performance & Reliability
- API endpoints must return within < 500ms p95 under nominal load (baseline to refine). Long-running work requires async/job pattern (future optimization) documented in research.
- Migrations must be idempotent, forward-only, and use zero-downtime safe operations (add columns nullable → backfill → enforce constraints in later migration if needed).

### Data & Schema Evolution
- Introduce new columns as nullable with defaults; avoid destructive alterations in same release.
- Use semantic naming: `*_at` timestamps (UTC), `*_id` foreign references, `*_status` enumerations.
- Enumerations documented in `data-model.md` and mirrored in TypeScript union types when consumed by frontend.

### Reusable Patterns & Frameworks
- **Bulk Upload Framework**: When implementing bulk operations for new entity types (Pickups, Customers, Shipments, etc.), follow the established pattern documented in `docs/implementation/BULK-UPLOAD-FRAMEWORK-GUIDE.md`:
  - Use dual idempotency strategy (CLIENT_REFERENCE + HASH fallback)
  - Implement Batch + Row persistence pattern for audit trail
  - Follow phase-based approach (Phase 1: upload + persistence, Phase 2: entity creation + validation)
  - Reuse generic components: ExcelParser, IdempotencyService, ValidationPipeline
  - Generate Excel templates with examples and validation notes
  - Include retention policy with automated cleanup jobs
  - Reference implementation checklist: `docs/implementation/BULK-UPLOAD-IMPLEMENTATION-CHECKLIST.md`
- New patterns emerging from >2 similar implementations should be documented in `docs/implementation/` and referenced here.

### Security & Input Validation
- Validate external inputs at API boundary (length, format, enum domain). Re-validate critical invariants in service layer.
- No sensitive logs; redact PII except where operationally essential (IDs, coarse location, statuses).

## Development Workflow & Quality Gates

### Branching & Naming
- Feature branches: `feature/<seq>-<kebab>` (e.g., `feature/007-order-cancellations`).
- Hotfix: `hotfix/<issue-ref>`; Maintenance: `maintenance/<scope>`.

### Version Control During Spec Phase
- Work through `/specify` → `/clarify` → `/plan` → `/tasks` **without committing after each step**.
- Commit the **complete spec suite** (spec.md + plan.md + tasks.md at minimum) together once planning phase is stable.
- Implementation commits reference the spec directory (e.g., `feat(001): implement batch upload endpoint`).
- Open PR only when feature is complete, referencing spec path (e.g., `Specs: specs/001-bulk-order-upload`).

### Required Artifacts Before Implementation
| Artifact | Mandatory For |
|----------|---------------|
| `spec.md` | New feature / major enhancement |
| `plan.md` | Any feature with backend schema or multi-component impact |
| `tasks.md` | All features with > 2 implementation steps |
| `contracts/*` | API additions/changes |
| `data-model.md` | Schema additions or relation changes |
| `quickstart.md` | Multi-step user flows crossing contexts |

### Build Gates (PR must pass)
1. Backend Gradle build & tests (`./gradlew build`).
2. Frontend build (`ng build console-app`).
3. Unit / integration tests green (including any new failing-first tests flipped to passing).
4. Flyway migration version sequence correct; no gaps or out-of-order commits.
5. Lint / formatting (Angular & Java) with zero new warnings (follow existing tooling—if not configured, add in plan before enforcement). 

### Test Strategy
- Contract tests: one per endpoint (request shape, response shape, status transitions). 
- Integration tests: business workflows (create → list → status update → analytics) using TestContainers for PostgreSQL.
- Unit tests: service logic edge cases (status transitions, validation, cost calculations).
- Frontend: service HTTP specs (mock backend), component interaction for critical dashboards.

### Task Execution Rules
- Mark parallel-safe tasks with `[P]` only if they touch disjoint files.
- Adjust `tasks.md` when scope changes; never re-order completed tasks retroactively—append rationale in a NOTE.

## Governance

1. This Constitution supersedes conflicting undocumented practices. 
2. Amendments require: (a) proposal entry in next feature plan Complexity section OR a dedicated `governance` spec, (b) reviewer approval, (c) version bump below.
3. PR reviewer checklist must explicitly confirm: artifacts present, tests added first, contracts aligned, migrations safe.
4. Any waiver (e.g., skipping `/clarify`) recorded in `plan.md` Progress/Complexity section with justification.
5. Automated CI enforcement (future) will parse tasks ensuring test-before-implementation ordering.

**Version**: 0.1.2 | **Ratified**: 2025-10-03 | **Last Amended**: 2025-10-04

---

## Amendments Log

### v0.1.2 (2025-10-04)
**Type**: MINOR - New reusable pattern guidance added

**Changes**:
- Added "Reusable Patterns & Frameworks" section under "Additional Constraints & Standards"
- Established Bulk Upload Framework as the first documented reusable pattern
- Referenced implementation guides: `BULK-UPLOAD-FRAMEWORK-GUIDE.md` and `BULK-UPLOAD-IMPLEMENTATION-CHECKLIST.md`

**Rationale**: Order bulk upload (feature/001-bulk-order-upload) established patterns applicable to future entity types (Pickups, Customers, Shipments). Documenting this in the constitution ensures consistency when similar features are specified.

**Impact**: Future bulk upload specifications should reference and follow the documented framework patterns.

---

### v0.1.1 (2025-10-03)
**Type**: Initial ratification

**Changes**: Original constitution established with core principles and development workflow.
