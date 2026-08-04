---
id: TASK-001
status: ready
order: 1
created: 2026-07-31
authorized_by: Eval Product Owner
authorized_at: 2026-07-31
authorization_basis: "approved-design: skills/implement-task/evals/files/approved-workflow/design.document.json"
authorization_fingerprint: sha256:e99fd30bd15d0d319ff6df0749a91aecaf051aa15f8591ecd69c775f06ea7ea4
---

# TASK-001 — Prove installed renderer portability

## Brief

- Goal: A copied report skill renders the approved canonical document from an unrelated working directory
- Change: Prove the existing skill-relative report renderer and dependency-free diagram renderer satisfy the approved portability path
- Done: The focused portability test exits 0 without a caller-repository script or alternate renderer

## Context

- Source anchors: skills/implement-task/evals/files/approved-workflow/design.document.json; skills/implement-task/evals/files/approved-workflow/design.html
- Facts / decisions: The approved workflow fixture is canonical, current, and authorizes this exact proof task
- Depends: none

## Execute

- Required behavior: A copied HTML Report Designer renders and validates canonical structured content from an unrelated cwd
- Required behavior: The dependency-free System Diagram renderer emits exact infrastructure-style SVG from retained JSON
- Required implementation: Reuse the bundled skill-relative renderer paths
- In scope: focused portability fixtures and checks
- Out of scope: alternate report templates, diagram renderers, or product behavior
- Invariants: generated HTML remains deterministic and self-contained

## Feedback loop

- State: Installed report and diagram skills work independently of the author checkout cwd
- Contract: Goal, Change, Done, and binding Execute items are satisfied
- Setup / repro: run the existing portability test before any repair
- Fast: `node scripts/test-skill-portability.mjs` → exits 0
- User/system: render from the copied skill in an unrelated cwd → valid self-contained report
- Edge: missing bundled diagram renderer → explicit failure rather than fallback
- Gate: `npm run test:skills` → exits 0
- Result: record actual actions and observations below

## Escalate if

- Approval required: any alternate renderer or report boundary
- Blocked when: portability requires a caller-repository script
