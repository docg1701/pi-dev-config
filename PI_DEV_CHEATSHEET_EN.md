# pi.dev — Practical Guide

> You describe **what**. The agent decides **how** and executes. Install, ask in natural language, watch it happen.

---

## Installation (one-time)

```bash
pi install npm:pi-subagents
pi install npm:pi-review-loop
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
  brief.md ──> planner ──> plan.md ──> /review-plan ──> plan.md (approved)

Phase 3: Execution (repeat for each plan-N.md)
  plan.md ──> worker ──> /review-start ──> next plan.md? ──> repeat until last ──> done
```

> `/review-plan` and `/review-start` are loops: they fix and repeat until "No issues found".
> Files in `docs/` by convention. Oracle (optional) between planner and /review-plan.

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
"/review-plan read docs/plan.md and compare with the codebase"
```

The review loop reads the plan against the codebase, finds inconsistencies, fixes them, repeats until "No issues found."

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
"/review-start"
```

The loop reviews, fixes, repeats until "No issues found." For specific focus:

```
"/review-start focus on error handling and edge cases"
```

**9. Repeat worker → review until all plan phases are exhausted.**

> The worker implements one phase at a time. Each phase goes through `/review-start`.
> When "No issues found", the worker advances to the next phase of the plan
> (already approved by `/review-plan`). The cycle repeats until the last phase.

---

## The Review Loop Explained

It's simple: the agent reviews its own work in a loop until it finds nothing left.

```
/review-start              → reviews code
/review-plan               → reviews plan/specification
/review-start focus X      → reviews with extra instruction
/review-fresh on           → each iteration sees the code with "fresh eyes"
/review-exit               → exits manually
/review-max 5              → caps at 5 iterations
/review-status             → shows current iteration
```

**Why it works:** Geoffrey Huntley documented the "Ralph Wiggum Loop" — agents make different mistakes on each pass. The first review catches some bugs, the second catches others, the third even more. Only exit when there genuinely is nothing left.

**Fresh context (`/review-fresh on`):** Removes previous iterations from context. Each pass is truly independent. Use for critical reviews.

**Recommended settings** (`~/.pi/agent/settings.json`):

```json
{
  "reviewerLoop": {
    "maxIterations": 5,
    "autoTrigger": false,
    "freshContext": true
  }
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
6. "/review-plan read docs/plan.md"
7. "Use the worker to implement phase 1 of the plan"
8. "/review-start"
9. [Repeat 7-8 for each phase of the plan]
```

### Safe refactoring

```
1. "Use the scout to map module [X]:
    duplicated code, long functions, coupling. Save to docs/"
2. "Use the planner to create a refactoring plan"
3. "/review-plan read docs/plan.md"
4. "Use the oracle to review the plan. What could break in production?"
5. Incorporate the oracle's feedback into the plan
6. "Use the worker to implement phase 1"
7. "/review-start focus on regressions"
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
| Skipping `/review-plan` | Unreviewed plan = architectural bugs that cost more later |
| Skipping `/review-start` | Unreviewed code = edge cases and silly mistakes slip through |
| Implementing everything at once | One phase at a time. Worker → review → worker. |
| Blindly trusting the plan | Use oracle for architecture and direction decisions |
| `/review-fresh off` on critical code | Enable fresh context for truly independent reviews |
| Asking "implement X" without context | Context produces a better plan. A better plan produces better code. |

---

## Reference Commands

| Command | Effect |
|---------|--------|
| `/review-start` | Starts code review loop |
| `/review-start focus X` | Review with extra instruction |
| `/review-plan read docs/plan.md` | Plan review loop (pass the path as focus) |
| `/review-exit` | Exits the loop |
| `/review-max N` | Caps iterations |
| `/review-fresh on/off` | Enables/disables fresh context |
| `/review-status` | Current loop state |
| `/run <agent>` | Launches a specific agent |
| `/chain a -> b -> c` | Sequential pipeline |
| `/parallel a -> b` | Parallel execution |
| `/agents` | Agent manager (Ctrl+Shift+A) |
| `/subagents-status` | Async run state |
| `/subagents-doctor` | Configuration diagnostics |
