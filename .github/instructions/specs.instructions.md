---
applyTo: "specs/**,.specify/**,.github/SPEC-KIT-ADOPTION-PLAN.md"
---

# Spec Kit Artifacts Guidance

These directories/files contain live spec-driven development artifacts. Treat them as the single source of truth for in-flight feature design.

## Structure
- `specs/<NNN-feature-name>/spec.md` – Functional specification (WHAT & WHY). Avoid tech stack changes here.
- `specs/<NNN-feature-name>/plan.md` – Implementation plan (architecture, phases, structure, contracts generation approach).
- `specs/<NNN-feature-name>/research.md` – Supporting investigations / decisions referenced by the plan.
- `specs/<NNN-feature-name>/data-model.md` – Entities, fields, relationships, validation rules.
- `specs/<NNN-feature-name>/contracts/` – API or schema contracts (OpenAPI, GraphQL, etc.).
- `specs/<NNN-feature-name>/quickstart.md` – Scenario flows / integration test narratives.
- `specs/<NNN-feature-name>/tasks.md` – Ordered, dependency-aware task list (produced by /tasks). Tests must precede implementation tasks.
- `.specify/memory/constitution.md` – Project governing principles / quality gates.
- `.github/SPEC-KIT-ADOPTION-PLAN.md` – Adoption plan & rollout phases.

## Authoring Rules
1. Never silently diverge code from contracts: update contract files first, then adjust implementation & tests.
2. Keep `plan.md` under ~150 lines when possible (token efficiency). Offload details to `research.md`.
3. Every entity in `data-model.md` should map to persistence + DTO mapping tasks in `tasks.md`.
4. Each endpoint in contracts requires:
   - Contract test (failing first)
   - Implementation task
   - (If stateful) analytics or projection update consideration
5. Changes to spec after tasks exist: re-run `/plan` only if structural shifts; otherwise patch spec and annotate rationale in `research.md`.
6. Prefer incremental additions; do not rewrite prior phases unless misalignment is blocking.

## Review Checklist (apply before merging feature):
- Spec & plan consistent with delivered code.
- All tasks completed or explicitly deferred (marked and justified).
- All contract tests exist & pass; no orphan endpoints.
- Constitution principles not violated (or waivers documented in plan Complexity section).

## Naming / Numbering
Use zero-padded incremental directory numbers (e.g., `007-order-cancellations`). Do not reuse numbers.

## Exceptions
Tiny refactors or doc-only changes may bypass full flow; label commits/PR with `chore:` or `docs:`.

## When Unsure
If architectural uncertainty persists, add a research item instead of bloating `plan.md`.

---
This instruction file is intentionally concise to guide AI interactions focused on spec integrity.
