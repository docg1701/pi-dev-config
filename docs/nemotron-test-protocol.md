# nemotron-3-ultra Re-Test Protocol

> Run this protocol when re-enabling `nemotron-3-ultra` for testing. The model
> burned ~20M tokens in a single runaway on 2026-06-04 and repeated the pattern
> on a smaller scale in this repo on the same day. Do not promote it to
> `enabledModels` or `agentOverrides` until the protocol below returns a clean
> pass on **3 consecutive weekly runs**.

## Pre-flight

Before launching any subagent with `model: "nemotron-3-ultra"`:

1. **Sandbox directory** is required. Create `/tmp/nemotron-test/` for the
   duration of the run. The repo at `pi-dev-config/` is read-only for this
   protocol — never edit `settings.json` or any tracked file in the repo as
   part of the test.
2. **Quota baseline** is required for the run. Before launching, open the
   Ollama Cloud dashboard (`/usage` in pi, or `ollama.com/usage` in browser)
   and record the current token total. Append the timestamp and value to
   `test-log.md` in the sandbox.
3. **Override the model inline** on every `subagent(...)` call. Pass
   `model: "nemotron-3-ultra"` explicitly. Do **not** rely on the
   `agentOverrides` block in `settings.json` — that block currently maps
   nemotron off for `worker` and `researcher` and is the safety net.
4. **Override the thinking level** on every call to `thinking: "high"`. Do
   not use `xhigh` — the model does not differentiate, and `xhigh` is wasted
   quota for the binary on/off toggle nemotron exposes.

## Monitoring cadence

While a run is in flight, poll status every 90 seconds:

```
subagent({ action: "status", id: "<run-id>" })
```

Polling is mandatory when the user can see the live counters. The skill rule
"do not poll just to wait" assumes the orchestrator has no other evidence;
when the user is monitoring externally, polling is the only way to catch a
runaway before it crosses the kill switch.

## Kill switches (hard)

Abort the run and mark the day a failure if **any** of these trigger:

| Trigger | Threshold | Why |
|---|---|---|
| Tokens per single request | > 1,000,000 | 4× the model context (256K). Indicates thinking loop has consumed the entire context window in one request. |
| Input/output token ratio in a simple task | > 50:1 | Indicates the model is re-processing context without producing output. Worker 1B on 2026-06-04 hit 295:1 (119,334 in, 404 out) on a 1-line bug fix. |
| Hallucinated completion | any | Model claims a side effect (file written, command run) that did not actually happen. Verified by reading the target file or running the verification command. |
| Empty content with `stopReason: stop` | any | Model returns a thinking block but no visible content and no tool call, yet reports completion. This is a known Nemotron v3 family bug across vLLM, OpenClaw, mlx-lm, and Ollama. Detected by checking the run's `message_end` event for `content: []` and `stopReason: "stop"`. |
| Tool schema violation | > 1 per run | Model calls a tool with arguments that violate the tool's schema (e.g. `queries: []` instead of `query: ""`). Recovery is allowed once; repeated violations indicate the model has not internalized the tool contract. |

## Known upstream bugs to watch

The Nemotron v3 family has a cluster of related issues across inference
runtimes that produce the symptoms this protocol guards against. Search
for current issues on the runtimes relevant to your re-test before
declaring nemotron-3-ultra usable on Ollama Cloud:

- **vLLM#39103** — `--reasoning-config` breaks Nemotron v3 reasoning parser; thinking unbounded
- **vLLM#39223** — Nemotron 3 super has corrupted output / infinite loops / system prompt repetition
- **NVIDIA/NemoClaw#2051** — Stalls on `stopReason: stop` with thinking-only response
- **ml-explore/mlx-lm#1050** — Thinking mode infinite loop on Apple Silicon (missing EOS token for ``)
- **openclaw#71847** — Drops thinking-only output, leaks metadata
- **ollama#14269** — `nemotron-3-nano` does not work at 1M context
- **ollama#13509** — `nemotron-3-nano` loses chat history (parser issue)

If any of these are still open and not yet fixed upstream when a re-test
is scheduled, escalate to Ollama Cloud support with the captured
`events.jsonl` rather than re-running the battery blind.

## The smoke battery

Once per re-test day. Run in this order; do not skip ahead.

### Phase 1 — Worker + Researcher (must pass both)

These are the two subagents that broke historically. If they fail, stop.

**Worker 1A — Synthetic short text**:
- Prompt: 300-word trade-off analysis, three perspectives, one recommendation
- Expected: file `/tmp/nemotron-test/r1a_worker.txt` exists, ~300 words, ends with a recommendation
- Verify: `wc -w /tmp/nemotron-test/r1a_worker.txt` returns 250-400

**Worker 1B — One-line code fix**:
- Setup: create `/tmp/nemotron-test/buggy.py` with `return a - b` in an `add` function
- Prompt: fix the bug in place, verify with `python3 /tmp/nemotron-test/buggy.py`
- Expected: file modified, `add(2, 3)` prints `5`
- Verify: `python3 /tmp/nemotron-test/buggy.py` exits 0 with output containing `5`

**Researcher 1A — Web search + write**:
- Prompt: ~250-word brief on a current (2026) topic, must use `web_search` then `write`
- Expected: file `/tmp/nemotron-test/r1a_researcher.txt` exists, ≥200 words, references real sources
- Verify: `wc -w` + `grep -c "^## \|^- " file | head` shows real content, not hallucinated

**Researcher 1B — Recovery from tool error** (only if 1A passes):
- Same shape, but the prompt **deliberately** asks the model to call
  `web_search` with the wrong arguments first, then correct and retry.
- Expected: model recovers, file written, no hallucination

**Pass criteria for Phase 1**: all four sub-runs complete, all files exist
with real content, no kill switch triggered.

### Phase 2 — Scout + Planner + Reviewer + Oracle (parallel pairs)

If Phase 1 passes. Run two in parallel, then the next two.

- **Scout**: map `/tmp/nemotron-test/`, produce `scout.md`
- **Planner**: plan a 1-file feature in the sandbox
- **Reviewer**: review `buggy.py` after the Worker 1B fix
- **Oracle**: review the Phase 1 results and challenge pass/fail

Pass criteria: all four complete, all outputs reference real files/contents.

### Phase 3 — Context-builder + Delegate

If Phase 2 passes. Both run in parallel.

- **Context-builder**: build context for adding a `/tmp/nemotron-test/feature.py`
- **Delegate**: generic delegation task (e.g. summarize a 100-line input file)

Pass criteria: both complete, outputs make sense.

## Promotion gate

nemotron-3-ultra is **promotable** when **3 consecutive weekly runs** of
the full smoke battery (Phases 1-3) pass without a kill switch trigger.

When promoted:
1. Add `"nemotron-3-ultra"` back to `enabledModels` in `settings.json`
2. Add overrides in `subagents.agentOverrides` for the subagents tested green
3. Update `README.md` "Troubleshooting" section: remove the re-test target
4. Commit on a feature branch, do not push to `main` without review

When rejected (kill switch triggers, or 4 weekly runs fail):
- Push the re-test target by another week
- Open an issue on `ollama/ollama` or contact Ollama Cloud support with the
  captured `test-log.md` and `events.jsonl` excerpts

## Cleanup after each run

- Save the run summary in `/tmp/nemotron-test/test-log.md` (append-only)
- Do **not** commit anything from `/tmp/nemotron-test/` to the repo
- `rm -rf /tmp/nemotron-test/` at the end of the day's session
- Leave the paused/dead async subagent runs in
  `/tmp/pi-subagents-uid-1000/async-subagent-runs/` for the next session to
  inspect via `subagent({ action: "status", id: "..." })` or
  `subagent({ action: "resume", id: "...", message: "..." })`

## Test log template

Append this block to `test-log.md` at the start of each run:

```markdown
## YYYY-MM-DD · Run N

- Quota baseline: <value>
- Phase 1: <pass|fail|killed>
  - worker 1A: <tokens in/out, file size, pass|fail>
  - worker 1B: <tokens in/out, file diff, pass|fail>
  - researcher 1A: <tokens in/out, file size, pass|fail>
  - researcher 1B: <tokens in/out, file size, pass|fail|skipped>
- Phase 2: <pass|fail|killed|skipped>
- Phase 3: <pass|fail|killed|skipped>
- Verdict: <promote|re-test next week|escalate to Ollama>
- Kill switch triggered: <yes|no, which one>
```

## Why this protocol exists

The model was promoted prematurely on 2026-06-04 without a smoke test. The
result was 20M tokens of quota burn across 29 requests. The re-deploy
attempt the same day repeated the runaway. This protocol is the
minimum-viable gate that should have existed before the original promotion.

The runaways are not isolated to Ollama Cloud. The Nemotron v3 family has
the same family of bugs (unbounded thinking, empty-content stops,
infinite loops) on vLLM, OpenClaw, mlx-lm, and local Ollama. The fix has
to come from NVIDIA's side of the model card, not from any single
inference runtime.
