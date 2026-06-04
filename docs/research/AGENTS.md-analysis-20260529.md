# Research Report: short2reel AGENTS.md vs. Industry Standard

**Research Mode:** Standard | **Total Sources:** 14 | **Generated:** 2026-05-29

---

## Executive Summary

The short2reel AGENTS.md was compared against the industry standard established
by the Agentic AI Foundation (AAIF/Linux Foundation), adopted by more than 60,000
open-source repositories. The analysis identified 7 structural gaps. The original
file (~200 lines) was rewritten to 180 lines covering all 6 core areas
of the standard.

**Key findings:**
- A well-structured AGENTS.md reduces agent runtime by 28.6% and tokens by 16.6%
  (Lulla et al., arxiv 2601.20404, Jan 2026)
- Projects with a detailed AGENTS.md have 35-55% fewer agent-generated bugs
  (Atlan, 2026)
- The original file did not cover 3 of the 6 core areas: Boundaries, Testing, Code Examples
- 44% of the original file (~85 lines) was redundant material or changelog

**Primary Recommendation:** The file was rewritten. Keep iterating: when
the agent repeatedly fails a pattern, add that rule.

---

## Introduction

### Research Question

How does the short2reel project's AGENTS.md compare to the industry standard for
AGENTS.md files, and what specific improvements are needed?

### Scope & Methodology

Investigated: official specification (agents.md, AAIF), empirical analyses
(GitHub Blog, 2,500+ repos), academic papers (arxiv 2601.20404), technical
reference guides (Atlan, BuildBetter, Context Studios, Addy Osmani,
The Prompt Shelf), and official tool documentation (OpenAI Codex,
Claude Code).

14 sources were consulted, covering August 2025 (emergence of the standard) to
May 2026. Each standard dimension was triangulated against 3+ independent sources.

### Key Assumptions

- The short2reel AGENTS.md is the only agent instruction file in the repo
- The project is small (~1,500 lines of Python) — monorepo recommendations do not apply
- The primary agent is Claude Code (as referenced in the project's AGENTS.md via pi)
- The 6 core areas from the GitHub Blog are the gold standard for evaluation

---

## Finding 1: The Industry Standard Converges on 6 Core Areas

All primary sources converge on the same 6 areas an AGENTS.md should cover.
The GitHub Blog [2] derived these areas from analysis of 2,500+ repositories. Addy Osmani [4]
replicated them as a checklist. O'Reilly [11], Context Studios [7], BuildBetter [8] and
Atlan [6] all reference and validate the same structure:

1. **Commands** — executable commands with exact flags, not just tool names
2. **Testing** — framework, location, naming, command with flags
3. **Project Structure** — directory map with responsibilities
4. **Code Style** — code examples, not descriptive paragraphs
5. **Git Workflow** — branching, commits, PR conventions
6. **Boundaries** — three levels: Always / Ask first / Never

**Sources:** [2], [4], [6], [7], [8], [11]

---

## Finding 2: Three-Level Boundaries Is the Most Effective Pattern

The GitHub Blog [2] identifies the pattern ✅ Always / ⚠️ Ask first / 🚫 Never as
the most effective constraint after analyzing 2,500+ repositories. Atlan [6] calls it
"the most battle-tested pattern from production AGENTS.md files". BuildBetter [8]
reinforces: "DO NOT use X prevents an entire class of agent mistakes."

The original short2reel AGENTS.md had no Boundaries section. Rules were scattered
("No further CLI surface expansion without explicit human approval",
"Never guess or trust memory") without a consolidated structure. The rewritten version
added the section with 4 Always rules, 4 Ask first, 4 Never.

**Sources:** [2], [6], [8]

---

## Finding 3: Code Examples Beat Abstract Descriptions

"One real code snippet showing your style beats three paragraphs describing it" [2].
O'Reilly [11]: "Show, don't tell." Addy Osmani [4]: "A code example communicates
style more effectively than a paragraph of description."

The original AGENTS.md listed abstract rules ("English only", "stdlib first",
"anti-bloat") but showed no example of how to write code in the project. The
rewritten version includes a good vs bad pair of the `extract_video_id()` function
with comments explaining each difference.

**Sources:** [2], [4], [11]

---

## Finding 4: Commands Must Be at the Top, Consolidated, with Flags

"Put executable commands at the beginning — with flags and options, not just
tool names" [2]. "Commands is the single highest-ROI section of any AGENTS.md
file" [6]. "Setup Commands is the highest-leverage section" [8].

In the original, commands were scattered across "Entry points" (~line 65), "Rules",
and "Thumbnail generation". The rewritten version consolidated everything into
`## Commands` right after the overview, with exact flags in a bash code block.

**Sources:** [2], [6], [8]

---

## Finding 5: Key Functions Tables Were Redundant (44% of the File)

The original devoted ~85 lines (44% of the total) to 5 tables with 37 functions,
duplicating signatures that already exist in the source code. If a function changes
and the table isn't updated, the agent receives wrong instructions.

BuildBetter [8] warns: "Stale guidance produces stale code." The rewritten version
reduced this to 1 table with 5 orchestrators (entry-point functions of each module),
saving ~77 lines and eliminating drift risk.

**Sources:** [8]

---

## Finding 6: Changelog Section (v2.4.0 Scope) Is Not Operational Instruction

The section documented what changed in a specific version. That is a changelog,
not agent instruction. The agent needs the current state, not the history.
Addy Osmani [4] recommends ≤150 lines; every line of noise consumes context window
tokens that could carry useful instructions.

**Sources:** [4]

---

## Finding 7: Post-upload Workflow Was 4x Repetitive

Four platforms with identical workflows (upload → mark published → date) took
~20 lines. The rewritten version condenses to 4 lines.

---

## Synthesis & Insights

### Patterns Identified

**Pattern 1: Human documentation vs. operational instruction.** The original
mixed the two purposes: changelog (for humans), key functions (for humans),
but also entry points and rules (for agents). The clear separation —
AGENTS.md is a runtime instruction set, README.md is human documentation —
removes noise from the agent's context window.

**Pattern 2: Specificity is the differentiator.** "Python 3.11+" beats "Python".
"uv run pytest -v" beats "run tests". "🚫 Never commit conta-*.yaml" beats
"don't commit secrets". Every consulted source converges on this.

### Novel Insights

The rewritten 180-line file delivers more operational value than the original
~200-line file because every surviving line was optimized for machine consumption
(copy-pasteable commands, code examples, actionable boundaries), not human reading.

---

## Limitations & Caveats

- The Lulla et al. study [3] used only OpenAI Codex (GPT-5.2-codex);
  gains may vary with Claude Code or other agents
- The GitHub Blog's analysis of 2,500+ repos [2] is observational, not experimental
- short2reel is a small project (~1,500 lines of Python); monorepo recommendations
  (nested AGENTS.md) do not apply
- The ≤150 lines recommendation comes from [4] and [6]; [8] suggests 200-500.
  For this project, 180 is adequate

---

## Recommendations

### Immediate Actions (done)
1. ✅ Add Boundaries section (✅/⚠️/🚫)
2. ✅ Create dedicated Testing section
3. ✅ Consolidate commands at the top
4. ✅ Add code examples (good vs bad)
5. ✅ Reduce tables to orchestrators only
6. ✅ Remove changelog v2.4.0
7. ✅ Condense post-upload workflow

### Ongoing
8. Treat AGENTS.md as code — update in the same PR that changes conventions
9. Iterate based on agent behavior — when it fails a pattern repeatedly,
   add a specific rule

---

## Bibliography

[1] Agentic AI Foundation. "AGENTS.md — A simple, open format for guiding coding agents."
https://agents.md/ (Retrieved: 2026-05-29)

[2] Nigh, M. (2025). "How to write a great agents.md: Lessons from over 2,500 repositories."
GitHub Blog. https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/

[3] Lulla, J.L., Mohsenimofidi, S., Galster, M., Zhang, J.M., Baltes, S., Treude, C. (2026).
"On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents."
arXiv:2601.20404. https://arxiv.org/html/2601.20404v1

[4] Osmani, A. (2025). "Lesson 16: AGENTS.md — giving agents project context."
https://addyosmani.com/agents/15-agents-md/

[5] The Prompt Shelf. (2026). "AGENTS.md Best Practices: Structure, Scope, and Real Examples."
https://thepromptshelf.dev/blog/agents-md-best-practices/

[6] Atlan. (2026). "How to Write an AGENTS.md File: The Complete Guide 2026."
https://atlan.com/know/how-to-write-agents-md/

[7] Kerkhoff, M. (2026). "AGENTS.md: The Research-Backed Guide to Making AI Agents 29% Faster."
Context Studios. https://www.contextstudios.ai/blog/agentsmd-the-research-backed-guide-to-making-ai-agents-29-faster

[8] Shulem, S. (2026). "AGENTS.md Complete Guide for Engineering Teams (2026)."
BuildBetter. https://blog.buildbetter.ai/agents-md-complete-guide-for-engineering-teams-in-2026/

[9] OpenAI. "Custom instructions with AGENTS.md — Codex."
https://developers.openai.com/codex/guides/agents-md

[10] DeepWiki. "AGENTS.md Format Overview and Specification."
https://deepwiki.com/openai/agents.md/5.1-format-overview-and-specification

[11] Osmani, A. (2025). "How to Write a Good Spec for AI Agents."
O'Reilly Radar. https://www.oreilly.com/radar/how-to-write-a-good-spec-for-ai-agents/

[12] AgentPatterns.ai. "AGENTS.md: Project-Level README for AI Coding Agents."
https://agentpatterns.ai/standards/agents-md/

[13] Claude Code Docs. "Create custom subagents."
https://code.claude.com/docs/en/sub-agents

[14] Claude Lab. "The Practical Guide to CLAUDE.md and AGENTS.md."
https://claudelab.net/en/articles/claude-code/claude-md-agents-md-complete-guide

---

## Appendix: Methodology

### Research Process

- **Phase 1 (SCOPE):** Decomposed the question into 10 evaluation dimensions
- **Phase 2 (PLAN):** Identified primary sources (specification, empirical studies, papers) and secondary (guides, tool documentation)
- **Phase 3 (RETRIEVE):** 6 parallel searches + 6 in-depth web_fetches, totaling 14 distinct sources
- **Phase 4 (TRIANGULATE):** Cross-referenced each dimension against 3+ independent sources; contested claims were flagged
- **Phase 5 (SYNTHESIZE):** Identified cross-source patterns, generated insights beyond the source material
- **Phase 8 (PACKAGE):** Markdown report with full bibliography

### Sources Consulted

**Total Sources:** 14

**Source Types:**
- Official specification: 2
- Academic paper: 1
- Industry empirical study: 1
- Technical guides: 6
- Tool documentation: 3
- References: 1

**Temporal Coverage:** 2025-08 to 2026-05

### Verification Approach

- All standard dimensions verified against 3+ independent sources
- Gaps in the original AGENTS.md confirmed by direct evidence from the file
- Contradictions between sources (e.g. ideal size 150 vs 500 lines) documented
  as caveats
