# Guia Rápido: pi.dev com IA — Do Plano ao Deploy

> **Para quem não escreve código. Você descreve a ideia, o agente planeja, implementa, revisa e corrige.**  
> Você define **o quê** e **por quê**. O agente decide **como** e executa.

---

## Índice

1. [Modelo Mental](#1-modelo-mental)
2. [Ferramentas Essenciais](#2-ferramentas-essenciais)
3. [Agentes Embutidos](#3-agentes-embutidos)
4. [Workflow: Projeto Novo (Greenfield)](#4-workflow-greenfield)
5. [Workflow: Código Existente (Brownfield)](#5-workflow-brownfield)
6. [Workflow: Correção de Bug](#6-workflow-correção-de-bug)
7. [O Review Loop em Detalhe](#7-o-review-loop-em-detalhe)
8. [Comandos e Atalhos](#8-comandos-e-atalhos-rápida)
9. [Receitas Comuns](#9-receitas-comuns)
10. [Anti-Padrões](#10-anti-padrões)

---

## 1. Modelo Mental

```
VOCÊ                         PLANNER                     WORKER + REVIEW LOOP
─────                        ───────                     ─────────────────────
Descreve a ideia  ──►   Gera plano detalhado   ──►   Implementa feature
(linguagem natural)       (entidades, endpoints,        │
                          tech stack, fases)      /review-start (loop 2-5x)
                                                   │
                         /review-plan (loop 2-5x)  Corrige bugs, commita
                         Valida o plano            │
                                                   ▼
Você aprova         ◄──   Plano validado          "No issues found."
```

**Regra de ouro:** Você nunca escreve código, nem escreve o plano detalhado. Você descreve o que quer em linguagem natural, o **planner** gera o plano, o **worker** implementa, e o **review loop** garante qualidade em cada etapa.

---

## 2. Ferramentas Essenciais

### 2.1 Subagentes (`pi-subagents`)

Delegam tarefas a agentes especializados. Você controla **quem faz o quê**.

| Ferramenta | Quando usar |
|-----------|-------------|
| `scout` | Explorar código existente (rápido, barato) |
| `planner` | Criar plano de implementação detalhado |
| `worker` | Implementar código (mão na massa) |
| `reviewer` | Revisar e corrigir código |
| `oracle` | Revisão consultiva (não mexe em código) |
| `oracle-executor` | Implementar só depois de aprovação explícita |
| `researcher` | Pesquisar tecnologias, APIs, bibliotecas |
| `context-builder` | Analisar requisitos e gerar contexto |

### 2.2 Review Loop (`pi-review-loop`)

Loop automático de revisão. O agente revisa o próprio trabalho repetidamente até não encontrar mais nada.

| Comando | Efeito |
|---------|--------|
| `/review-start` | Ativa revisão de código |
| `/review-start foco em segurança` | Revisão com foco específico |
| `/review-plan` | Ativa revisão de plano/especificação |
| `/review-plan considere escala` | Revisão de plano com foco |
| `/review-fresh on` | Cada iteração vê o código com "olhos frescos" |
| `/review-max 5` | Limita a 5 iterações |
| `/review-exit` | Sai do loop manualmente |
| `/review-status` | Mostra iteração atual |
| `/review-auto on` | Ativa trigger automático por palavras-chave |

---

## 3. Agentes Embutidos

| Agente | Papel | Quando usar |
|--------|-------|-------------|
| **scout** | Reconhecimento rápido | "O que esse código faz?" — explora e resume |
| **planner** | Planejamento | "Crie um plano para implementar X" |
| **worker** | Implementação geral | "Implemente o plano Y" |
| **reviewer** | Revisão + correção | "Revise o código e corrija problemas" |
| **oracle** | Revisão consultiva | "Revise minha direção, desafie premissas" — **só aconselha, não mexe** |
| **oracle-executor** | Implementação pós-aprovação | Só implementa depois que você aprova a direção |
| **researcher** | Pesquisa web | "Pesquise as melhores práticas de X em 2025" |
| **context-builder** | Análise de requisitos | "Analise esses requisitos e a codebase" |

### Escalando complexidade

| Situação | Use |
|----------|-----|
| Feature simples, contexto claro | `worker` direto |
| Feature média, precisa de plano | `scout` → `planner` → `worker` |
| Feature complexa, alto risco | `scout` → `planner` → `oracle` → `oracle-executor` |
| Incerteza na direção | `oracle` para revisão consultiva primeiro |
| Precisa pesquisar antes | `researcher` antes de `planner` |

---

## 4. Workflow: Greenfield

### Fase 0 — Setup (uma vez)

```bash
# No diretório do projeto:
pi install npm:pi-subagents
pi install npm:pi-review-loop
pi install npm:pi-intercom      # opcional, para coordenação entre agentes
```

No `~/.pi/agent/settings.json`:
```json
{
  "reviewerLoop": {
    "maxIterations": 5,
    "autoTrigger": false,
    "freshContext": true
  }
}
```

### Fase 1 — Pesquisa e Contexto

```
💬 Você: "Pesquise as melhores práticas para construir uma API REST com Fastify 
        e Prisma em 2025. Quero um resumo com recomendações."
```

O agente usa a skill `deep-research` e produz um relatório com fontes.

**Alternativa com subagente:**
```
💬 Você: "Use o researcher para investigar Fastify vs Express para uma API de 
        alta concorrência. Gere um research.md."
```

### Fase 2 — Geração do Plano (Planner)

Você **não** escreve o plano. Você descreve a ideia e o planner gera:

```
💬 Você: "Quero uma API REST de tarefas (to-do list) multiusuário. 
        Tecnologia: Node.js + TypeScript + Fastify + Prisma + PostgreSQL.
        Precisa ter registro/login, CRUD de tasks (cada user vê só as suas),
        filtro por status. Testes com vitest, Docker Compose, logging com pino.
        Use o planner para gerar um plano detalhado com entidades, endpoints,
        estrutura de pastas, e fases de implementação."
```

O **planner** gera um documento com:
- Entidades, endpoints, schemas
- Estrutura de pastas e arquivos
- Fases de implementação ordenadas
- Decisões técnicas justificadas

**Dica:** Seja específico na descrição. Inclua "NÃO use X" quando relevante. Quanto mais contexto, melhor o plano gerado.

### Fase 3 — Revisão do Plano (Review Loop)

```
💬 Você: "/review-plan"
```

O agente vai:
1. Ler o plano contra a codebase (vazia neste caso)
2. Identificar inconsistências, omissões, riscos
3. Corrigir o próprio plano
4. Repetir até não encontrar mais problemas → "No issues found."

**Quando terminar:** Seu plano está sólido, validado e pronto para implementar.

### Fase 4 — Implementação (Worker)

```
💬 Você: "Implemente o plano."
```

O worker lê o plano, entende as fases, e implementa. Para projetos maiores, peça execução faseada:

```
💬 Você: "Implemente o plano uma fase por vez. Avise quando cada fase 
        terminar para eu revisar antes da próxima."
```

**Padrão com chain (para máxima qualidade):**

```
💬 Você: "Use chain: 
        1) planner para refinar o plano existente com a codebase atual
        2) worker para implementar fase 1 (setup)
        3) reviewer para revisar o código da fase 1"
```

### Fase 5 — Review Loop de Código

Após cada fase de implementação:

```
💬 Você: "/review-start foco em segurança e injeção de SQL"
```

Ou sem foco específico:
```
💬 Você: "/review-start"
```

O loop vai:
1. Ler todo o código novo e existente relevante
2. Procurar bugs, edge cases, problemas de segurança
3. Corrigir automaticamente
4. Reportar "Fixed N issue(s). Ready for another review."
5. Repetir até responder "No issues found."

**Habilite fresh context para revisões mais rigorosas:**
```
💬 Você: "/review-fresh on"
💬 Você: "/review-start"
```

### Fase 6 — Deploy

```
💬 Você: "O código está pronto. Prepare:
        1) Script de build e Dockerfile de produção
        2) GitHub Actions para CI/CD
        3) Documentação de deploy (README.md)
        4) Changelog das features implementadas"
```

```
💬 Você: "/review-start"
```

```
💬 Você: "Faça commit com mensagem descritiva e crie uma tag v1.0.0"
```

---

## 5. Workflow: Brownfield

### Fase 0 — Reconhecimento (Scout)

Antes de qualquer plano, entenda o que já existe:

```
💬 Você: "Use o scout para mapear a estrutura do projeto, 
        arquivos principais, padrões de código e dependências."
```

O scout gera um `context.md` com o mapeamento.

### Fase 1 — Geração do Plano (Planner + Scout)

```
💬 Você: "Use o contexto gerado pelo scout e crie um plano para 
        adicionar [feature X]. Descreva fases, arquivos a modificar,
        e riscos. Respeite os padrões existentes do projeto."
```

O planner gera um plano que respeita a arquitetura existente.

### Fase 2 — Revisão do Plano

```
💬 Você: "/review-plan"
```

⚠️ **Importante em brownfield:** O agente lê o código existente E o plano, verificando conflitos, inconsistências de padrão, e impacto em outras partes do sistema.

### Fase 3 — Oracle (para mudanças de alto risco)

```
💬 Você: "Use o oracle para revisar o plano. 
        O que pode dar errado? Há risco de breaking change? 
        Estamos seguindo os padrões do projeto?"
```

O oracle **só analisa e reporta**, não altera nada. Depois você decide.

### Fase 4 — Implementação + Review

Igual greenfield: worker implementa → `/review-start` → repete por feature.

### Dica Brownfield

Peça ao agente para SEMPRE:
- "Antes de editar, leia os arquivos que serão impactados"
- "Siga os mesmos padrões de código do projeto"
- "Não refatore código não relacionado à feature"
- "Atualize os testes existentes que quebrarem"

---

## 6. Workflow: Correção de Bug

### Fluxo Rápido

```
💬 Você: "Use o scout para ler o arquivo src/auth.ts e entender o fluxo. 
        O bug é: login falha com token expirado mas não retorna 401."
```

```
💬 Você: "Corrija o bug."
```

```
💬 Você: "/review-start"
```

### Fluxo com Causa Desconhecida

```
💬 Você: "Há um bug: usuários reportam erro 500 intermitente ao criar tasks. 
        Use o scout para mapear o fluxo de criação de tasks. 
        Depois use o reviewer para encontrar a causa raiz."
```

### Com Review Automático

```
💬 Você: "/review-auto on"
💬 Você: "Corrija o bug de timeout no endpoint /tasks. 
        Implemente a correção e revise."
```

Com auto-trigger, palavras como "implemente" ativam o review loop automaticamente após a implementação.

---

## 7. O Review Loop em Detalhe

### 7.1 Modos de Review

| Modo | Comando | Revisa |
|------|---------|--------|
| Código | `/review-start` | Código implementado |
| Código com foco | `/review-start foco em erros de concorrência` | Código + instrução extra |
| Plano | `/review-plan` | Plano/especificação vs codebase |
| Plano com foco | `/review-plan verifique segurança e auth` | Plano + foco |

### 7.2 Fresh Context

Sem fresh context, a 3ª iteração de review vê as 2 anteriores — o agente pode ficar "viciado" nas próprias conclusões.

Com fresh context **(`/review-fresh on`)**, cada iteração:
- Vê APENAS o contexto original (antes do review)
- Recebe instrução para reler plano/código com "olhos frescos"
- Faz uma revisão verdadeiramente independente

**Quando usar:** Reviews críticas, código de segurança, features complexas.

### 7.3 Auto-Trigger

Com `/review-auto on`, o review loop dispara automaticamente quando você usa frases como:
- "implemente o plano"
- "implement the plan"
- "execute o plano"
- `/double-check`

**Use com cuidado:** Pode disparar quando você não quer. Prefira ativação manual com `/review-start`.

### 7.4 O Que o Agente Vê (Formato de Resposta)

O review loop espera que o agente responda com:

**Encontrou problemas:**
```
Fixed 3 issue(s). Ready for another review.
  - Null check ausente em getUser()
  - Race condition no update de status
  - Log sem nível de severidade
```

**Não encontrou problemas:**
```
No issues found.
```

O loop detecta essas frases e decide se continua ou termina.

### 7.5 Configuração Recomendada

```json
{
  "reviewerLoop": {
    "maxIterations": 5,
    "autoTrigger": false,
    "freshContext": true
  }
}
```

**Por que 5 e não 7?** Em projetos normais, 3-5 iterações são suficientes. Mais que isso geralmente indica que o plano estava mal escrito ou o problema é muito complexo — melhor refinar o plano.

---

## 8. Comandos e Atalhos (Referência Rápida)

### Review Loop

| Comando | Efeito |
|---------|--------|
| `/review-start` | Inicia loop de review de código |
| `/review-start <foco>` | Inicia com instrução extra |
| `/review-plan` | Inicia loop de review de plano |
| `/review-plan <foco>` | Review de plano com foco |
| `/review-exit` | Sai do review loop |
| `/review-max <N>` | Define máximo de iterações |
| `/review-auto on/off` | Liga/desliga auto-trigger |
| `/review-fresh on/off` | Liga/desliga fresh context |
| `/review-status` | Mostra estado atual do loop |
| `/double-check` | Template de review manual |

### Subagentes

| Comando | Efeito |
|---------|--------|
| `/run <agente>` | Lança um agente específico |
| `/chain` | Abre TUI para configurar chain |
| `/parallel` | Abre TUI para tarefas paralelas |
| `/agents` | Abre gerenciador de agentes |
| `/subagents-status` | Inspeciona runs assíncronos |

### Sessão

| Comando | Efeito |
|---------|--------|
| `/name <nome>` | Nomeia a sessão atual |
| `/new` | Nova sessão limpa |
| `/resume` | Retoma sessão anterior |
| `/fork` | Ramifica a partir de um ponto |
| `/tree` | Navega histórico de conversa |
| `/compact` | Resume sessão (economiza tokens) |

---

## 9. Receitas Comuns

### 9.1 Feature Nova (Receita Padrão)

```
1. 💬 "Quero [feature X] com [tecnologias Y]. Use o planner para gerar
        um plano detalhado com entidades, endpoints e fases."
2. 💬 "/review-plan"
3. [O planner ajusta o plano conforme feedback do review loop]
4. 💬 "Implemente o plano."
5. 💬 "/review-start"
6. 💬 "Commit com mensagem 'feat: [descrição]'"
```

### 9.2 Refatoração

```
1. 💬 "Use o scout para mapear o módulo [X] e identificar:
        - código duplicado
        - funções muito longas
        - acoplamento excessivo
        - padrões inconsistentes"
2. 💬 "Com base no scout, use o planner para criar um plano de
        refatoração que minimize risco e preserve comportamento."
3. 💬 "/review-plan"
4. 💬 "Implemente a refatoração fase por fase. Avise ao final de cada."
5. 💬 "/review-start foco em regressões e breaking changes"
6. 💬 "Rode os testes e corrija falhas."
```

### 9.3 Migração de Tecnologia

```
1. 💬 "Use o scout para mapear todos os endpoints Express atuais
        e suas dependências."
2. 💬 "Use o researcher para investigar migração Express → Fastify:
        breaking changes, plugins equivalentes."
3. 💬 "Use o planner para criar um plano de migração faseado
        com base no scout e na pesquisa."
4. 💬 "/review-plan"
5. 💬 "Use o oracle para revisar o plano de migração.
        O que pode quebrar em produção?"
6. 💬 "Implemente a fase 1."
7. 💬 "/review-start"
8. [Repita para cada fase]
```

### 9.4 Code Review de Pull Request (Sem Escrever Código)

```
1. 💬 "Use o reviewer para analisar os arquivos modificados 
        no branch feature/xyz. Compare com main.
        Liste problemas, riscos e sugestões. 
        NÃO faça alterações — só reporte."
```

### 9.5 Debugging

```
1. 💬 "Use o scout para ler os arquivos do fluxo de [feature X]."
2. 💬 "O bug é: [descrição precisa]. 
        Stack trace: [cole aqui]. 
        Encontre a causa raiz e corrija."
3. 💬 "/review-start foco em edge cases do mesmo tipo de bug"
```

### 9.6 Planejamento de Arquitetura

```
1. 💬 "Quero construir [sistema X] com [requisitos Y].
        Use o context-builder para analisar os requisitos.
        Depois use o planner para gerar um documento de arquitetura."
2. 💬 "/review-plan"
3. 💬 "Use o oracle para revisar criticamente a arquitetura:
        escalabilidade, segurança, pontos de falha, trade-offs."
4. 💬 "Incorpore o feedback do oracle no plano."
```

---

## 10. Anti-Padrões

| ❌ Não faça | ✅ Faça |
|------------|--------|
| "Cria uma API de tasks" (vago) | Descreva entidades, endpoints, restrições. Deixe o planner detalhar. |
| Escrever o plano manualmente | Use o planner: "Use o planner para gerar um plano para X com Y" |
| "Arruma o bug" (sem contexto) | Descreva o bug, cole stack trace, indique arquivos |
| "Refatora tudo" (escopo infinito) | "Refatore o módulo X: extraia funções >20 linhas" |
| Pular `/review-plan` | Sempre revise o plano antes de implementar |
| Pular `/review-start` | Sempre revise o código depois de implementar |
| Implementar tudo de uma vez | Implemente em fases e revise cada fase |
| Confiar cegamente no agente | Use oracle para decisões de arquitetura |
| Ignorar o fresh context | Ative `/review-fresh on` para revisões críticas |
| Deixar auto-trigger ligado sempre | Prefira ativação manual com `/review-start` |

---

## Fluxo Visual Completo

```
                    PROJETO NOVO (GREENFIELD)
                    ═════════════════════════
                    
  [Pesquisa]         [Plano gerado]      [Review Plano]
  researcher ───►  planner ──────►  /review-plan (loop 2-5x)
      │            (gera do zero)          │
      │                  │                 ▼
      ▼                  ▼          [Plano validado]
  [Pesquisa         [Plano.md]            │
   concluída]        completo             ▼
                                     [Implementação]
                                     worker (fase 1)
                                          │
                                     /review-start (loop 2-5x)
                                          │
                                     worker (fase 2)
                                          │
                                     /review-start (loop 2-5x)
                                          │
                                          ...
                                          │
                                     [Deploy]


                    CÓDIGO EXISTENTE (BROWNFIELD)
                    ═══════════════════════════════
                    
  [Reconhecimento]    [Plano gerado]      [Review Plano]
  scout ───────►  planner ──────►  /review-plan (loop 2-5x)
      │            (usa contexto           │
      ▼             do scout)              ▼
  [context.md]                        [Plano validado]
                                           │
                                     [Oracle review]
                                     oracle (só analisa)
                                           │
                                     [Aprovação]
                                     Você decide
                                           │
                                     [Implementação]
                                     worker (fase única)
                                           │
                                     /review-start (loop 2-5x)
                                           │
                                     [Deploy]


                    BUG / PEQUENA CORREÇÃO
                    ═══════════════════════
                    
  [Diagnóstico]      [Correção]         [Review]
  scout ──────►  worker ──────►  /review-start (loop 2-5x)
                                         │
                                    [Commit]
```

---

## Instalação e Configuração Inicial

```bash
# Instalar extensões
pi install npm:pi-subagents
pi install npm:pi-review-loop

# Configuração recomendada (~/.pi/agent/settings.json)
```

```json
{
  "reviewerLoop": {
    "maxIterations": 5,
    "autoTrigger": false,
    "freshContext": true,
    "reviewPrompt": "template:double-check"
  }
}
```

**Pronto.** Agora é só descrever a ideia e deixar os agentes trabalharem.
