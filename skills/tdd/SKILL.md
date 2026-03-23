---
name: tdd
description: "Test-driven development with red-green-refactor loop. Triggers on: tdd, test first, red green refactor, write tests."
---

# Test-Driven Development

## Philosophy

**Tests verify behavior through public interfaces, not implementation.**

- **Good tests**: Integration-style, exercise real code paths, describe _what_ the system does
- **Bad tests**: Coupled to implementation, mock internals, break on refactor

## Anti-Pattern: Horizontal Slices

**DON'T** write all tests first, then all implementation.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
```

## Workflow

### 1. Planning

- Confirm what interface changes are needed
- Confirm which behaviors to test (prioritize — can't test everything)
- Identify opportunities for deep modules
- Get user approval

### 2. Tracer Bullet

One test that confirms one thing:

```
RED:   Write test → fails
GREEN: Minimal code → passes
```

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code → passes
```

Rules:
- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests

### 4. Refactor

After all tests pass:
- Extract duplication
- Deepen modules
- Run tests after each refactor

**Never refactor while RED.**

## Checklist Per Cycle

- [ ] Test describes behavior, not implementation
- [ ] Test uses public interface only
- [ ] Test would survive internal refactor
- [ ] Code is minimal for this test
