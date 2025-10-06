# Spec Kit (Specify CLI) Adoption Plan

Date: 2025-10-03  
Status: Draft (Phase 0)

## 1. Objectives

Introduce GitHub Spec Kit (Specify CLI) to enforce a consistent, spec‑driven workflow for feature development (e.g., Order Management enhancements) in this monorepo. Outcomes:

- Shift feature lifecycle to: Constitution -> Specification (`/specify`) -> Clarification (`/clarify`) -> Plan (`/plan`) -> Tasks (`/tasks`) -> Implementation (`/implement`).
- Provide repeatable artifact structure under `specs/` for each feature branch.
- Improve review quality with explicit contracts, data models, and failing-first tests.
- Enable parallelization and traceability of implementation tasks.

## 2. Scope (Phase 1 Introduction)

In-scope now:
- Scaffolding Spec Kit into existing repository (in-place initialization).
- Creating initial project constitution aligned with current guidelines (testing, quality gates, database migrations, frontend-backend contract discipline).
- Documenting usage for contributors (README & docs link).
- Running a pilot on next net-new backend feature (Order Management DB integration expansion) + one incremental frontend enhancement.

Deferred (later phases):
- Automated validation of spec/task completeness in CI.
- Enforcement bot / PR templates referencing spec IDs.
- Automated generation of contract test skeletons tied into Spring Boot test suite.
- Multi-service spec cross-check (consistency analysis automation).

## 3. Constraints & Assumptions

| Area | Notes |
|------|-------|
| Platform | Windows dev (WSL optional) + Linux CI; Need POSIX + PowerShell scripts -> keep both variants. |
| Repo Layout | Existing `backend/` (Spring Boot) and `frontend/` (Angular). Spec Kit root-level expected tree acceptable. |
| Git History | Must avoid destructive overwrite; use `--force` only after auditing conflicts. |
| Security | No external network calls added to CI beyond pulling Spec Kit templates. |
| Tooling | Python 3.11+ & `uv` may not yet be installed on all dev machines—document minimal install path. |

## 4. Deliverables (Phase 1)

| ID | Deliverable | Acceptance Criteria |
|----|-------------|---------------------|
| D1 | `.specify/` scaffolding | Directory & scripts added; no overwrites of core app code. |
| D2 | `memory/constitution.md` | Reflects existing quality gates (build, lint, tests, migrations). |
| D3 | Pilot feature spec (`specs/00x-*`) | Contains `spec.md`, `plan.md` after running commands. |
| D4 | Contributor doc section | README (or docs) updated with quick start & workflow diagram. |
| D5 | Adoption guideline | This plan file committed under `.github/`. |

## 5. Workflow Integration

Feature lifecycle mapping:

1. Create branch: `feature/<seq>-<kebab-feature>` (e.g., `feature/007-order-cancellations`).
2. Run `/specify` with high-level functional intent (no tech stack specifics yet).
3. If ambiguities: `/clarify` (required if open questions remain) -> `spec.md` updated.
4. Run `/plan` to generate implementation plan + research/data-model/contracts skeletons.
5. Run `/tasks` to produce dependency-ordered `tasks.md`.
6. Code: Use `/implement` or manual execution referencing tasks; ensure failing tests first for contract/integration layers.
7. Open PR referencing spec path (e.g., `Specs: specs/007-order-cancellations`).
8. Reviewers validate: Constitution compliance, plan-task alignment, red → green test evidence.

## 6. Repository Conventions Alignment

Current conventions (summarized):
- Backend: Spring Boot + Flyway migrations (`backend/src/main/resources/db/migration`).
- Frontend: Angular workspace with `apps/console-app` & shared libs.
- Docs already segmented under `docs/implementation` & `docs/completed`.

Spec Kit artifact placement does not conflict; `specs/` becomes canonical live design source, while `docs/` retains narrative/completed summaries.

## 7. Pilot Candidate Selection

Primary Pilot: Remaining Order Management database integration & analytics endpoints (as per `ORDER-MANAGEMENT-DATABASE-INTEGRATION-PLAN.md`).  
Secondary (stretch): New export/reporting enhancement for pickups (if needed) to validate multi-feature parallel spec directories.

## 8. Rollout Phases

| Phase | Name | Focus | Exit Criteria |
|-------|------|-------|---------------|
| P1 | Scaffolding | Add Spec Kit + constitution draft | D1, D2 merged |
| P2 | Pilot Spec | Create first spec/plan/tasks | D3 present; tasks validated |
| P3 | Implementation Pilot | Build feature using tasks | Feature merged; retro feedback logged |
| P4 | CI & Governance | Add lint/check automation | Basic CI job passes & blocks missing spec refs |
| P5 | Expansion | All new features required to use flow | Policy noted in CONTRIBUTING |

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Developer learning curve | Slow initial velocity | Provide concise quick start snippet in README |
| Drift between spec and code | Reduced trust | Require PR checklist item confirming sync |
| Overhead for tiny fixes | Resistance | Allow exception label: `chore:` bypass (document) |
| Tool install friction (uv/Python) | Blocked adoption | Provide fallback: run scripts w/out execution (manual editing) |

## 10. Minimal Quick Start (Draft to add to README)

```bash
# 1. (One time) ensure Python 3.11+ & uv installed
pip install --upgrade uv  # or follow uv docs

# 2. Initialize (already done in repo after adoption)
uvx --from git+https://github.com/github/spec-kit.git specify init --here --ai copilot --ignore-agent-tools

# 3. Create a new feature spec
/specify Implement order cancellation flow with audit trail

# 4. Clarify if needed
/clarify

# 5. Plan & tasks
/plan
/tasks

# 6. Implement
/implement
```

## 11. Acceptance Checklist (for merging this plan)

- [ ] No destructive changes to existing project code
- [ ] Plan reflects upstream Spec Kit process accurately
- [ ] Clear pilot feature identified
- [ ] Risks & mitigations documented
- [ ] Quick start block ready for README inclusion

## 12. Next Actions (Actionable Tasks)

| Order | Action | Owner | Notes |
|-------|--------|-------|-------|
| 1 | Initialize Spec Kit scaffolding | Dev | Use `--here` with caution; review diff |
| 2 | Draft constitution from current guidelines | Dev | Map quality gates, branching, testing |
| 3 | Pilot spec for Order Mgmt remaining work | Dev | Create `specs/00x-order-management-phase2` |
| 4 | Generate plan & tasks | Dev | Validate tasks coverage matrix |
| 5 | README update (Quick Start) | Dev | Cross-link this plan |
| 6 | Retro after pilot | Team | Decide on CI enforcement |

## 13. Future Enhancements (Backlog)

- CI job: Parse `tasks.md` ensuring test-before-impl ordering.
- Script to diff OpenAPI contracts vs implemented controllers (Spring).
- Add spec ID badge to PR template.
- Auto-number feature directories via helper script.

---
Prepared as part of initial Spec Kit adoption. Iterate after pilot feedback.
