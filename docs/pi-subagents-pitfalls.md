# Pi Subagents — Pitfalls

Read this BEFORE using `subagent(...)` alongside the pi-subagents skill.
This file documents real bugs and schema rejections observed during testing.
It does not repeat the skill — it corrects it.

## Bugs observed

### Bug 1 — `as` and `context` in sequential chain steps are rejected

The pi-subagents skill shows many examples like:
```typescript
subagent({
  chain: [
    { agent: "scout", task: "...", as: "step1", context: "fresh" },
    { agent: "planner", task: "...", as: "step2", context: "fresh" }
  ]
})
```

This FAILS with:
```
chain.0: must not have additional properties
chain.1: must not have additional properties
```

**Rule**: `as` and `context` are NOT allowed on sequential chain steps. They
are ONLY valid on:
- top-level parallel task items (inside `tasks: [...]`)
- top-level parallel tasks inside a chain's `parallel` array
- top-level `chain` (at the root, not inside steps)

**Pattern that works**:
```typescript
subagent({
  chain: [
    { agent: "scout", task: "..." },   // plain step, no as, no context
    { agent: "planner", task: "..." },
    { agent: "worker", task: "..." }
  ]
})
```

**Pattern that also works** (as + context on parallel inside chain):
```typescript
subagent({
  chain: [
    { parallel: [
      { agent: "reviewer", as: "deployPlan", context: "fresh", task: "..." },
      { agent: "reviewer", as: "schedulerPlan", context: "fresh", task: "..." }
    ]},
    { agent: "worker", as: "workerResult", task: "..." }
  ]
})
```

### Bug 2 — `acceptance` in sequential chain steps is rejected

`acceptance` as a chain step property also fails as "additional property".

**Rule**: `acceptance` goes on the ROOT of the `subagent` call, or inside
parallel task items — NEVER on a sequential chain step.

**Pattern that works** (acceptance on root):
```typescript
subagent({
  chain: [
    { parallel: [...] },
    { agent: "worker", task: "..." }
  ],
  acceptance: {    // ← root level, correct
    criteria: ["..."],
    evidence: ["..."],
    maxFinalizationTurns: 3
  }
})
```

**Pattern that FAILS** (acceptance on step):
```typescript
subagent({
  chain: [
    { agent: "worker", task: "...", acceptance: { criteria: ["..."] } }
  ]
})
```

### Bug 3 — Mixing `action` with `agent`/`task`/`chain`/`tasks` silently drops

```typescript
subagent({ action: "list", agent: "oracle", task: "Review..." })
```

This does NOT execute the oracle. It lists agents. The `agent` and `task` are
silently ignored. No error is returned.

**Rule**: `action` and execution parameters (`agent`, `task`, `chain`, `tasks`)
are mutually exclusive. Never combine them.

### Bug 4 — `acceptance` with wrong `evidence` type for read-only tasks

Setting `evidence: ["changed-files"]` on a read-only reviewer causes the
acceptance self-review loop to fail because no files were changed.

**Rule**: `evidence` must match the actual work done. For read-only reviews,
use evidence types like `commands-run` or `validation-output`, or omit
`acceptance` entirely.

## Validated patterns (copy-paste)

### Single agent
```typescript
subagent({ agent: "reviewer", task: "Review staged diff for correctness.
Inspect changed files directly. Return findings with file:line refs.",
async: true, context: "fresh" })
```

### Parallel reviewers
```typescript
subagent({ tasks: [
  { agent: "reviewer", task: "Review for correctness", context: "fresh" },
  { agent: "reviewer", task: "Review for test coverage", context: "fresh" },
], concurrency: 2, async: true })
```

### Chain (sequential, no extras on steps)
```typescript
subagent({ chain: [
  { agent: "scout", task: "Map auth module, write context.md" },
  { agent: "planner", task: "Plan from {previous}" },
  { agent: "worker", task: "Implement from {previous}" }
], async: true })
```

### Chain with parallel inside
```typescript
subagent({ chain: [
  { parallel: [
    { agent: "reviewer", task: "Review correctness", context: "fresh", as: "correctness" },
    { agent: "reviewer", task: "Review simplicity", context: "fresh", as: "simplicity" }
  ]},
  { agent: "worker", task: "Apply accepted fixes from {outputs.correctness} and {outputs.simplicity}" }
], async: true })
```

## Builtin agents

- scout — codebase recon (context: fresh)
- reviewer — diff/plan review (context: fresh)
- worker — implementation (context: fork, needs persisted session)
- oracle — advisory review (context: fork, needs persisted session)
- planner — implementation plans (context: fork, needs persisted session)
- researcher — web research (context: fresh)
- context-builder — structured handoff (context: fresh)
- delegate — generic lightweight work (context: fresh)
