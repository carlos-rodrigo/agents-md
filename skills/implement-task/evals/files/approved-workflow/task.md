---
id: TASK-001
status: ready
order: 1
created: 2026-07-31
authorized_by: Eval Product Owner
authorized_at: 2026-07-31
authorization_basis: "approved-design: docs/features/canonical-document-renderer/design.document.json"
authorization_fingerprint: sha256:30a76d03b726e63c962d5aa7b885ff1c06a34175e538a1ffba6a57ca06fa170e
---

# TASK-001 — Prove installed renderer portability

## Brief

- Goal: A copied report skill renders the approved canonical document from an unrelated working directory
- Change: Prove the existing skill-relative renderer and declared diagram setup satisfy the approved portability path
- Done: The focused portability test exits 0 without a caller-repository script or alternate renderer

## Context

- Source anchors: docs/features/canonical-document-renderer/design.document.json; docs/features/canonical-document-renderer/design.html
- Facts / decisions: The canonical renderer design is Approved and this exact proof task is authorized
- Depends: none

## Execute

- Required behavior: A copied HTML Report Designer renders and validates canonical structured content from an unrelated cwd
- Required behavior: The declared System Diagram package renders exact Excalidraw output after its documented setup
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
- Edge: missing declared diagram setup → explicit failure rather than fallback
- Gate: `npm run test:skills` → exits 0
- Result: record actual actions and observations below

## Escalate if

- Approval required: any alternate renderer or report boundary
- Blocked when: portability requires a caller-repository script
