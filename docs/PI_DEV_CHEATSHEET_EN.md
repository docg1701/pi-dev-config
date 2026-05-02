# pi.dev — Practical Guide

> You describe **what**. The agent decides **how** and executes. Install, ask in natural language, watch it happen.

---

## Installation (one-time)

```bash
pi install npm:pi-subagents
pi install npm:pi-alert
```

Done. No need to create agents, write config, or memorize commands.

---

## The 8 Agents in 8 Sentences

| Agent | What it does |
|-------|--------------|
| **context-builder** | Reads requirements + codebase, generates `context.md` and `meta-prompt.md` with what matters |
| **researcher** | Searches the web: official docs, benchmarks, breaking changes. Generates `research.md` |
| **scout** | Quick code reconnaissance: entry points, data flow, risks. Generates `context.md` (⚠️ overwrites context-builder's output if using the same path) |
| **planner** | Turns context into a concrete implementation plan. Generates `plan.md`. **Does not edit code** |
| **reviewer** | Reviews code against the plan, tests edge cases, fixes issues. Can edit |
| **worker** | Implements. Edits files, validates, escalates unapproved decisions. One writer at a time |
| **oracle** | Advisory second opinion. Inherits context, challenges decisions, detects drift. **Does not edit code** |
| **delegate** | Lightweight generic subagent when no specialist fits |

---

## The Main Flow

```
Phase 1: Context
  context-builder ──> context.md ──┐
  researcher ──────> research.md ──┼──> brief.md (consolidation)
  scout ───────────> scout.md ─────┘    

Phase 2: Planning (plan.md or plan-01.md, plan-02.md ... plan-N.md)
  brief.md ──> planner ──> plan.md ──> reviewer ──> plan.md (approved)

Phase 3: Execution (repeat for each plan-N.md)
  plan.md ──> worker ──> reviewer ──> next plan.md? ──> repeat until last ──> done
```

> The `reviewer` reviews and fixes until "No issues found". For multiple passes,
> use a chain: `/chain reviewer -> reviewer -> reviewer`.
> Files in `docs/` by convention. Oracle (optional) between planner and reviewer.

### Step by step

**1. Context (Brownfield)**

```
"Use the context-builder to analyze the requirements and codebase.
 Save the output to docs/"
```

> Default output: `context.md` and `meta-prompt.md`. In this workflow, we redirect to `docs/`.

**2. Research (whenever there's an external dependency)**

```
"Use the researcher to investigate [technology X] and [library Y].
 Focus on breaking changes, current best practices, and benchmarks."
```

**3. Scout (context validation)**

```
"Use the scout to inspect [specific module/flow] that the
 context-builder may have missed. Validate [assumption X].
 Save to docs/scout.md to avoid overwriting context.md."
```

> ⚠️ Scout and context-builder share the same default output (`context.md`). Always separate them.

**4. Brief — consolidate context**

Ask the main agent to merge everything into `docs/brief.md`:

```
"Read docs/context.md, docs/meta-prompt.md, docs/research.md, and docs/scout.md.
 Consolidate the requirements, constraints, and decisions into docs/brief.md."
```

> `brief.md` is a manual consolidation step — it is not agent output.
> It serves as a single, lean input for the planner.

**5. Planning**

```
"Use the planner to generate an implementation plan from docs/brief.md."
```

> Default output: `plan.md`. The planner has `defaultReads: context.md` — since
> we redirected to `docs/`, use `reads=docs/brief.md` or specify it in the prompt.
>
> **Large plans?** Ask the planner to split into `plan-01.md`, `plan-02.md`,
> ... `plan-N.md`. Review each one with `/review-plan`, implement one at a time.

**6. Plan review**

```
"Use the reviewer to review docs/plan.md against the codebase.
 Find inconsistencies and fix them."
```

The reviewer reads the plan against the codebase, finds inconsistencies, fixes them.

If the plan involves risky decisions, interleave the oracle:

```
"Use the oracle to review the plan. Challenge the architecture decisions.
 What could break? Is there drift between the plan and what already exists?"
```

**7. Implementation**

```
"Use the worker to implement the approved plan."
```

**8. Code review**

```
"Use the reviewer to review the implemented code."
```

The reviewer reviews and fixes. For specific focus:

```
"Use the reviewer to review the code. Focus on error handling and edge cases."
```

**9. Repeat worker → reviewer until all plan phases are exhausted.**

> The worker implements one phase at a time. Each phase goes through the reviewer.
> When "No issues found", the worker advances to the next phase of the plan
> (already approved by the reviewer). The cycle repeats until the last phase.

---

## Reviewing with the Agent Reviewer

The `reviewer` agent reviews code against the plan, tests edge cases, and fixes issues.

**Single review:** call the reviewer once for a single review pass.

```
"Use the reviewer to review the implemented code. Compare with the plan."
```

**Multiple reviews:** create a chain with N reviewer steps. Each iteration is
independent (fresh context by default in subagents).

```
/chain reviewer -> reviewer -> reviewer
```

Or in natural language:

```
"Use a chain with 3 reviewer agents to review the code in sequence.
 Each should review, fix, and pass to the next."
```

**Why it works:** Geoffrey Huntley documented the "Ralph Wiggum Loop" — agents
make different mistakes on each pass. The first review catches some bugs, the second
catches others, the third even more. Only exit when there genuinely is nothing left.

**Chain with different models:** for more rigorous reviews, interleave different
models in the chain:

```json
// Example: chain in settings.json or prompt template
{
  "chain": [
    { "agent": "reviewer", "model": "ollama-cloud/kimi-k2.6" },
    { "agent": "reviewer", "model": "ollama-cloud/deepseek-v4-pro" },
    { "agent": "reviewer", "model": "ollama-cloud/kimi-k2.6" }
  ]
}
```

---

## Oracle and the Decision Flow

The oracle **implements nothing**. It is an advisory reviewer that inherits the main session's context and audits:

- Inherited decisions (what was already decided before)
- Drift (where the current direction conflicts with prior decisions)
- Hidden assumptions (what the main agent is assuming without realizing)
- Risks and contradictions

**The oracle suggests an "execution prompt"** — a ready-to-use instruction for the worker to execute. But you (or the main agent) decide whether to approve it before passing it to the worker.

> **Historical note:** `oracle-executor` existed as a separate agent but was consolidated into `worker` (starting with pi-subagents v1.x). The current `worker` already incorporates the "approved oracle handoff" guardrails. The flow is the same: oracle audits → you approve → worker implements.

### When to use

| Situation | Use |
|-----------|-----|
| High-risk architectural change | oracle → approve → worker |
| Hard bug, unknown cause | oracle diagnoses → approve direction → worker fixes |
| Complex plan with many dependencies | oracle critically reviews → incorporate feedback → worker |
| Suspected drift (old decisions conflicting with new ones) | oracle audits the history → realigns |

### How to ask

```
"Use the oracle to review my current direction.
 Challenge the assumptions and tell me what I'm missing."
```

```
"Use the oracle to diagnose the root cause of this bug.
 Propose the best next step before we edit any code."
```

The oracle responds with: inherited decisions, diagnosis, detected drift, recommendation, risks, and a **suggested execution prompt** — which you pass to the worker if you agree.

**`oracle-executor` no longer exists as a separate agent.** The pattern is: oracle → approval → worker.

---

## Recipes

### New feature in an existing project

```
1. "Use the context-builder to map the [X] module. Save to docs/"
2. "Use the researcher to investigate [technology]. Save to docs/research.md"
3. "Use the scout to validate [assumption]. Save to docs/scout.md"
4. "Read the files in docs/ and consolidate into docs/brief.md"
5. "Use the planner to generate a plan from docs/brief.md"
6. "Use the reviewer to review docs/plan.md against the codebase"
7. "Use the worker to implement phase 1 of the plan"
8. "Use the reviewer to review the implemented code"
9. [Repeat 7-8 for each phase of the plan]
```

### Safe refactoring

```
1. "Use the scout to map module [X]:
    duplicated code, long functions, coupling. Save to docs/"
2. "Use the planner to create a refactoring plan"
3. "Use the reviewer to review docs/plan.md against the codebase"
4. "Use the oracle to review the plan. What could break in production?"
5. Incorporate the oracle's feedback into the plan
6. "Use the worker to implement phase 1"
7. "Use the reviewer to review the code. Focus on regressions."
8. [Repeat 6-7 for each phase. Run tests between phases.]
```

### PR code review (without touching code)

```
"Use the reviewer to analyze the modified files in the feature/X branch.
 Compare with main. List issues, risks, and suggestions.
 Do NOT make changes — just report."
```

### Debugging an unknown cause

```
"The bug is: [description]. Use the oracle to investigate the root cause
 and propose the best next step."
```

### Chain: scout → planner → worker → reviewer

```
"Use chain: scout to map the auth flow →
 planner to create a migration plan → worker to implement →
 reviewer to review the code."
```

Or with the keyboard shortcut:

```
/chain scout "map auth" -> planner -> worker -> reviewer
```

---

## Anti-Patterns

| ❌ | ✅ |
|----|----|
| "Create a tasks API" (too vague) | Describe entities, endpoints, constraints. Let the planner detail. |
| "Refactor everything" (infinite scope) | "Refactor module X: extract functions >20 lines, remove duplication with Y" |
| "Fix the bug" (no stack trace) | Describe the symptom, paste the error, point to the suspect file |
| Skipping the reviewer | Unreviewed code = edge cases and silly mistakes slip through |
| Implementing everything at once | One phase at a time. Worker → review → worker. |
| Blindly trusting the plan | Use oracle for architecture and direction decisions |
| Asking "implement X" without context | Context produces a better plan. A better plan produces better code. |

---

## Reference Commands

| Command | Effect |
|---------|--------|
| `/run <agent>` | Launches a specific agent |
| `/chain a -> b -> c` | Sequential pipeline |
| `/parallel a -> b` | Parallel execution |
| `/agents` | Agent manager (Ctrl+Shift+A) |
| `/subagents-status` | Async run state |
| `/subagents-doctor` | Configuration diagnostics |
