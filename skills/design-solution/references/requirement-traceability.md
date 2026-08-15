# Architecture Requirement Traceability

Load this reference when a design has approved product requirements, technical outcomes, contracts, or architecture slices that must be proven against the proposal.

## Walkthrough contract

Use one structured `architecture` block per requirement or bounded technical outcome:

```text
arch-### — requirement or technical outcome
Source/authority: Approved product truth | Sourced fact | Proposed recommendation | Assumption | Open question
Requirement references: PRD/BDD/contract IDs
Architecture slices: slice IDs
Entry/trigger: route | command | event | job | state transition
Participating elements: handler/controller, service/use case, domain policy/state, repository/adapter, persistence/effect
Contract/state consequence: inputs, outputs, records, transitions, invariants, compatibility
Persistence/external effect: durable or external result
Failure/recovery: failure mode and owning recovery
Proof: test, boundary evidence, runtime signal, or verification path
Fit: fits | unresolved | blocked
Escalation: decision owner and question when unresolved or blocked
```

Use stable `arch-###` IDs. Every entry must reference at least one requirement, contract, or bounded technical outcome and at least one architecture slice. Every slice must remain independently reviewable and have proof.

## Stress procedure

1. Enumerate requirements and technical outcomes from approved product sources, code, tests, ADRs, contracts, persistence, runtime, or deployment evidence.
2. Link each entry to the architecture slice that delivers it.
3. Walk the trigger through ownership, domain/state change, contract consequence, persistence/effect, result, and recovery.
4. Check that the proposed mechanism does not invent product behavior or contradict an approved contract.
5. Record fit and proof.
6. Escalate any mismatch before claiming the design is complete.

If a requirement does not fit, do not silently omit it, weaken it, add a hidden subsystem, or force a workaround. Mark the entry unresolved or blocked, explain the competing architectural or product consequences, name the decision owner, and request input. A Proposed recommendation may frame an option but cannot become accepted architecture without authority.

This is architecture-level detail. Keep commands, file-edit sequences, task assignments, and execution receipts in Simple Tasks or Implement Task.
