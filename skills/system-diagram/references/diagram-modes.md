# Diagram Modes

Choose the smallest mode that answers the question.

| Need | Mode | Shows |
| --- | --- | --- |
| Understand implementation flow | Code Flow | functions/methods/events/jobs and important payloads |
| Understand temporal communication | Sequence capability | participants, lifelines, ordered messages, activations, fragments, recovery |\n| Understand static communication | Component Communication / Architecture view | modules/services, protocols, boundaries, ownership |
| Understand product concepts | Domain Concept Model | concepts, meaning, states, relationships |
| Understand domain behavior | Domain Evolution Map | source → verb/effect → target state plus invariant/authority |
| Compare current/intended behavior | Before/After System Story | one stable baseline and material causal delta |
| Understand responsibility | Ownership/Lane Map | runtime/team/module/data ownership and handoffs |
| Understand alternatives | Decision Map | viable options, tradeoffs, uncertainty, escalation |
| Understand lifecycle | State/Lifecycle | states, triggers, guards, effects, terminal/recovery paths |
| Understand one delivery slice | Outside-In Slice | external need → entry → seam → state → observable proof |
| Compare UI placement/workflow | UI Decision Comparison | existing shell once, 2–3 deltas, shared action/outcome |

## Code flow

Show real names plus plain meaning:

```text
Human label
Class.method() / function
owner/runtime/layer
input/output or state
```

Label sync/async, protocol, route/topic/job, and important payload where relevant.

## Sequence capability

Use only when the question is who communicates with whom and in what temporal order. Preserve participant order and material return, self, alternative, optional, loop, note, activation, and recovery semantics. Do not use sequence for a merely linear workflow or static topology.

## Component communication

Lead with the user/system trigger and observable result. Components earn a node only when responsibility, boundary, state ownership, or failure changes. Use the sequence capability for temporal messages; use an architecture view for static runtime communication; use component decomposition only for one bounded container/module.

## Domain evolution

Use verbs and effects:

```text
Sale --decreases--> Livestock Position
visible effect: current heads lower
rule: accepted once by authorized user
```

Include invariant/authority and correction path. Do not draw generic actor → system → database skeletons.

## Before/after

Keep scale and vocabulary stable. Highlight the smallest meaningful delta and state what did not change. Do not compare unrelated redesigns.

## State/lifecycle

Label trigger, guard/authority, side effect, and recovery. Distinguish unavailable, empty, error, and zero when the domain does.

## Decision map

Only show viable options. Make evidence, tradeoff, reversibility, owner, and unresolved criteria visible. Do not let visual prominence silently choose an option.

## Outside-in slice

Trace external need → transport/entry contract → application seam → policy/state transition → persistence/handoff → observable result. Include failure only when it changes architecture.
