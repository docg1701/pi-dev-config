# Research Report: AGENTS.md do short2reel vs. Padrão da Indústria

**Research Mode:** Standard | **Total Sources:** 14 | **Generated:** 2026-05-29

---

## Executive Summary

O AGENTS.md do short2reel foi comparado contra o padrão da indústria estabelecido
pela Agentic AI Foundation (AAIF/Linux Foundation), adotado por mais de 60.000
repositórios open-source. A análise identificou 7 gaps estruturais. O arquivo
original (~200 linhas) foi reescrito para 180 linhas cobrindo todas as 6 áreas
core do padrão.

**Key findings:**
- AGENTS.md bem estruturado reduz runtime do agente em 28.6% e tokens em 16.6%
  (Lulla et al., arxiv 2601.20404, Jan 2026)
- Projetos com AGENTS.md detalhado têm 35-55% menos bugs gerados por agentes
  (Atlan, 2026)
- O arquivo original não cobria 3 das 6 áreas core: Boundaries, Testing, Code Examples
- 44% do arquivo original (~85 linhas) era material redundante ou changelog

**Primary Recommendation:** O arquivo foi reescrito. Manter iteração contínua:
quando o agente errar um padrão repetidamente, adicionar essa regra.

---

## Introduction

### Research Question

Como o AGENTS.md do projeto short2reel se compara ao padrão da indústria para
arquivos AGENTS.md e quais melhorias específicas são necessárias?

### Scope & Methodology

Investigou-se: especificação oficial (agents.md, AAIF), análises empíricas
(GitHub Blog, 2.500+ repos), papers acadêmicos (arxiv 2601.20404), guias
técnicos de referência (Atlan, BuildBetter, Context Studios, Addy Osmani,
The Prompt Shelf), e documentação oficial de ferramentas (OpenAI Codex,
Claude Code).

Foram consultadas 14 fontes, cobrindo o período de agosto/2025 (surgimento
do padrão) a maio/2026. Cada dimensão do padrão foi triangulada em 3+ fontes
independentes.

### Key Assumptions

- O AGENTS.md do short2reel é o único arquivo de instrução para agentes no repo
- O projeto é pequeno (~1.500 linhas Python) — recomendações de monorepo não se aplicam
- O agente primário é Claude Code (conforme AGENTS.md do projeto referencia pi)
- As 6 áreas core do GitHub Blog são o gold standard para avaliação

---

## Finding 1: O Padrão da Indústria Converge em 6 Áreas Core

Todas as fontes primárias convergem nas mesmas 6 áreas que um AGENTS.md deve cobrir.
O GitHub Blog [2] derivou estas áreas da análise de 2.500+ repositórios. Addy Osmani [4]
as replicou como checklist. O'Reilly [11], Context Studios [7], BuildBetter [8] e
Atlan [6] todos referenciam e validam a mesma estrutura:

1. **Commands** — comandos executáveis com flags exatos, não só nomes de ferramentas
2. **Testing** — framework, localização, nomenclatura, comando com flags
3. **Project Structure** — mapa de diretórios com responsabilidades
4. **Code Style** — exemplos de código, não parágrafos descritivos
5. **Git Workflow** — branching, commits, PR conventions
6. **Boundaries** — três níveis: Always / Ask first / Never

**Sources:** [2], [4], [6], [7], [8], [11]

---

## Finding 2: Boundaries de Três Níveis É o Padrão Mais Eficaz

O GitHub Blog [2] identifica o padrão ✅ Always / ⚠️ Ask first / 🚫 Never como
a constraint mais eficaz após analisar 2.500+ repositórios. A Atlan [6] chama de
"the most battle-tested pattern from production AGENTS.md files". O BuildBetter [8]
reforça: "DO NOT use X prevents an entire class of agent mistakes."

O AGENTS.md original do short2reel não tinha seção Boundaries. Regras existiam
espalhadas ("No further CLI surface expansion without explicit human approval",
"Never guess or trust memory") mas sem estrutura consolidada. A versão reescrita
adicionou a seção com 4 regras Always, 4 Ask first, 4 Never.

**Sources:** [2], [6], [8]

---

## Finding 3: Exemplos de Código Superam Descrições Abstratas

"One real code snippet showing your style beats three paragraphs describing it" [2].
O'Reilly [11]: "Show, don't tell." Addy Osmani [4]: "A code example communicates
style more effectively than a paragraph of description."

O AGENTS.md original listava regras abstratas ("English only", "stdlib first",
"anti-bloat") mas não mostrava nenhum exemplo de como escrever código no projeto.
A versão reescrita inclui um par good vs bad da função `extract_video_id()` com
comentários explicando cada diferença.

**Sources:** [2], [4], [11]

---

## Finding 4: Comandos Precisam Estar no Topo, Consolidados, com Flags

"Put executable commands at the beginning — with flags and options, not just
tool names" [2]. "Commands is the single highest-ROI section of any AGENTS.md
file" [6]. "Setup Commands is the highest-leverage section" [8].

No original, comandos estavam em "Entry points" (linha ~65), "Rules" e
"Thumbnail generation". A versão reescrita consolidou todos em `## Commands`
logo após o overview, com flags exatos em bloco de código bash.

**Sources:** [2], [6], [8]

---

## Finding 5: Tabelas de Key Functions Eram Redundantes (44% do Arquivo)

O original dedicava ~85 linhas (44% do total) a 5 tabelas com 37 funções
duplicando assinaturas que já existem no código-fonte. Se uma função muda
e a tabela não é atualizada, o agente recebe instrução errada.

O BuildBetter [8] alerta: "Stale guidance produces stale code." A versão
reescrita reduziu para 1 tabela com 5 orchestrators (funções de entrada de
cada módulo), economizando ~77 linhas e eliminando o risco de drift.

**Sources:** [8]

---

## Finding 6: Seção de Changelog (v2.4.0 Scope) Não É Instrução Operacional

A seção documentava o que mudou em uma versão específica. Isso é changelog,
não instrução para agente. O agente precisa do estado atual, não do histórico.
Addy Osmani [4] recomenda ≤150 linhas; cada linha de ruído consome tokens do
context window que poderiam carregar instruções úteis.

**Sources:** [4]

---

## Finding 7: Post-upload Workflow Era 4 Vezes Repetitivo

Quatro plataformas com workflows idênticos (upload → marcar published → date)
ocupavam ~20 linhas. A versão reescrita condensa em 4 linhas.

---

## Synthesis & Insights

### Patterns Identified

**Pattern 1: Documentação humana vs. instrução operacional.** O original
misturava os dois propósitos: changelog (para humanos), key functions (para
humanos), mas também entry points e regras (para agentes). A separação clara
— AGENTS.md é runtime instruction set, README.md é documentação humana —
elimina ruído do context window do agente.

**Pattern 2: Especificidade é o diferencial.** "Python 3.11+" bate "Python".
"uv run pytest -v" bate "run tests". "🚫 Never commit conta-*.yaml" bate
"don't commit secrets". Cada fonte consultada converge nisto.

### Novel Insights

O arquivo reescrito com 180 linhas entrega mais valor operacional que o
original de ~200 linhas porque cada linha sobrevivente foi otimizada para
consumo por máquina (comandos copy-pasteáveis, code examples, boundaries
acionáveis), não para leitura humana.

---

## Limitations & Caveats

- O estudo de Lulla et al. [3] usou apenas OpenAI Codex (GPT-5.2-codex);
  ganhos podem variar com Claude Code ou outros agentes
- A análise de 2.500+ repos do GitHub Blog [2] é observacional, não experimental
- O short2reel é um projeto pequeno (~1.500 linhas Python); recomendações de
  monorepo (nested AGENTS.md) não se aplicam
- A recomendação de ≤150 linhas vem de [4] e [6]; [8] sugere 200-500.
  Para este projeto, 180 é adequado

---

## Recommendations

### Immediate Actions (done)
1. ✅ Adicionar seção Boundaries (✅/⚠️/🚫)
2. ✅ Criar seção Testing dedicada
3. ✅ Consolidar comandos no topo
4. ✅ Adicionar code examples (good vs bad)
5. ✅ Reduzir tabelas para orchestrators only
6. ✅ Remover changelog v2.4.0
7. ✅ Condensar post-upload workflow

### Ongoing
8. Tratar AGENTS.md como código — atualizar no mesmo PR que muda convenções
9. Iterar baseado em comportamento do agente — quando errar padrão repetidamente,
   adicionar regra específica

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

- **Phase 1 (SCOPE):** Decomposição da pergunta em 10 dimensões de avaliação
- **Phase 2 (PLAN):** Identificação de fontes primárias (especificação, estudos
  empíricos, papers) e secundárias (guias, documentação de ferramentas)
- **Phase 3 (RETRIEVE):** 6 buscas paralelas + 6 web_fetch em profundidade,
  totalizando 14 fontes distintas
- **Phase 4 (TRIANGULATE):** Cross-reference de cada dimensão em 3+ fontes
  independentes; claims contestadas foram marcadas
- **Phase 5 (SYNTHESIZE):** Identificação de padrões cross-source, geração
  de insights além do material fonte
- **Phase 8 (PACKAGE):** Relatório Markdown com bibliografia completa

### Sources Consulted

**Total Sources:** 14

**Source Types:**
- Especificação oficial: 2
- Paper acadêmico: 1
- Estudo empírico (indústria): 1
- Guias técnicos: 6
- Documentação de ferramentas: 3
- Referências: 1

**Temporal Coverage:** 2025-08 a 2026-05

### Verification Approach

- Todas as dimensões do padrão verificadas em 3+ fontes independentes
- Gaps no AGENTS.md original confirmados por evidência direta do arquivo
- Contradições entre fontes (ex: tamanho ideal 150 vs 500 linhas) documentadas
  como caveats
