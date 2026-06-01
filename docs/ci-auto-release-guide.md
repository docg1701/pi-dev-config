# CI + Auto-Release a partir de Tags

Guia prático para implementar CI (testes automatizados) e geração automática de
GitHub Releases a partir da criação de tags semver, com changelog categorizado.

## Requisitos

- Python 3.11+ com `uv` como package manager
- Testes com `pytest`
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, etc.)
- Tags semver anotadas (`git tag -a vX.Y.Z -F arquivo.txt`)

## Arquitetura

Um único workflow file (`ci.yml`) com dois gatilhos e dois jobs:

```
push/PR em main ──► job: test (matrix 3.11 + 3.13)
                         │
push tag v*.*.* ──► job: test (mesma matrix)
                         │
                         └── se passar ──► job: release
                                              │
                                              ├── git fetch --tags
                                              ├── lê anotação da tag → título
                                              ├── git log categorizado → corpo
                                              └── gh release create
```

A release **nunca** é criada se os testes falharem (gate via `needs: test`).

## Workflow completo

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
    tags: ['v*.*.*']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.13']
    steps:
      - uses: actions/checkout@v5

      - uses: astral-sh/setup-uv@v8.1.0
        with:
          python-version: ${{ matrix.python-version }}
          enable-cache: true
          cache-dependency-glob: |
            **/pyproject.toml
            **/uv.lock

      - run: uv lock --check
      - run: uv run --frozen pytest -v

  release:
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Build release notes
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -uo pipefail

          git fetch --tags --force 2>/dev/null || true

          PREV_TAG=$(git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | grep -v "${{ github.ref_name }}" | head -1 || true)

          # Tag annotation first line → title subtitle (fall back to bare version)
          SUBTITLE=$(git tag -l --format='%(contents)' "${{ github.ref_name }}" 2>/dev/null | head -1 || true)
          if [ -z "$SUBTITLE" ]; then
            TITLE="${{ github.ref_name }}"
          else
            TITLE="${{ github.ref_name }}: $SUBTITLE"
          fi

          strip() { sed -E 's/^- [a-z]+(\([^)]*\))?: /- /'; }

          NOTES=/tmp/release-notes.md
          :> "$NOTES"

          if [ -n "$PREV_TAG" ]; then
            RANGE="${PREV_TAG}..${{ github.ref_name }}"
          else
            RANGE="${{ github.ref_name }}"
          fi

          ADDED=$(git log --pretty=format:"- %s" $RANGE --grep="^feat" -E 2>/dev/null | strip || true)
          if [ -n "$ADDED" ]; then
            { echo "### Added"; echo "$ADDED"; echo ""; } >> "$NOTES"
          fi

          FIXED=$(git log --pretty=format:"- %s" $RANGE --grep="^fix" -E 2>/dev/null | strip || true)
          if [ -n "$FIXED" ]; then
            { echo "### Fixed"; echo "$FIXED"; echo ""; } >> "$NOTES"
          fi

          CHANGED=$(git log --pretty=format:"- %s" $RANGE | grep -E '^- (chore|docs|ci|refactor|style|test|perf|revert|build)(\(.+\))?:' | strip || true)
          if [ -n "$CHANGED" ]; then
            { echo "### Changed"; echo "$CHANGED"; echo ""; } >> "$NOTES"
          fi

          if [ -n "$PREV_TAG" ]; then
            echo "**Full Changelog**: https://github.com/${{ github.repository }}/compare/${PREV_TAG}...${{ github.ref_name }}" >> "$NOTES"
          fi

          gh release create ${{ github.ref_name }} \
            --title "$TITLE" \
            --notes-file "$NOTES"
```

## Como usar

### 1. Criar a tag

A anotação da tag (arquivo passado com `-F`) define o subtítulo do release.
**Importante**: não use `#` no início das linhas — o Git trata como comentário
e remove via `git stripspace`.

```bash
cat > /tmp/release-notes.txt << 'EOF'
Nova feature X com correções Y e Z
EOF

git tag -a v2.4.2 -F /tmp/release-notes.txt
git push origin v2.4.2
```

Resultado:

- Título: `v2.4.2: Nova feature X com correções Y e Z`
- Corpo: changelog categorizado gerado automaticamente a partir dos commits

### 2. O que acontece

1. O push da tag dispara o workflow
2. `job: test` roda pytest em Python 3.11 e 3.13
3. Se ambos passarem, `job: release` executa:
   - `git fetch --tags --force` para garantir que a tag anotada está disponível localmente
   - Lê a anotação da tag → primeira linha vira subtítulo do título
   - `git log` entre a tag anterior e a atual, agrupado por tipo de commit
   - `sed` remove o prefixo (`fix:` → nada, `feat(scope):` → nada)
   - Cria o release via `gh release create`

### 3. Mapeamento de conventional commits → categorias

| Prefixo | Categoria |
|---|---|
| `feat:` | `### Added` |
| `fix:` | `### Fixed` |
| `chore:`, `docs:`, `ci:`, `refactor:`, `style:`, `test:`, `perf:`, `revert:`, `build:` | `### Changed` |

Categorias sem commits são omitidas (não aparece `### Added` vazio).

## Permissões necessárias

O workflow precisa de `contents: write` **apenas no job `release`**.
O token padrão `${{ github.token }}` é suficiente — não requer PAT nem secrets
adicionais.

```yaml
permissions:
  contents: write
```

## Segurança

| Mecanismo | O que protege |
|---|---|
| `needs: test` | Release só existe se testes passarem |
| `if: startsWith(github.ref, 'refs/tags/v')` | Só dispara em tag, nunca em branch |
| `github.ref_name` | Nome da tag vem do evento push, não de input |
| `permissions: contents: write` | Escopo mínimo, só escreve release |
| `secrets.GITHUB_TOKEN` | Efêmero, expira com o job |

## Dependências

| Ferramenta | Versão | Uso |
|---|---|---|
| `actions/checkout` | v5 | Clone do repositório |
| `astral-sh/setup-uv` | v8.1.0 | Instala uv + Python |
| `gh` CLI | pré-instalado no runner | Criação do release |

> **Nota**: `astral-sh/setup-uv` usa tags imutáveis (`v8.1.0`), não tags móveis
> (`v8`). Sempre use a versão exata.

## Pitfalls encontrados e como evitar

### 1. `generate-notes` da API do GitHub não categoriza sem PRs

**Problema**: `gh api .../releases/generate-notes` só produz `### Added`/`### Fixed`/`### Changed`
quando há Pull Requests mergeados. Com commits diretos na `main`, retorna apenas um link
de comparação.

**Solução**: gerar o changelog nós mesmos com `git log --grep` categorizando por
conventional commit type.

### 2. Race condition: tag não está disponível na API imediatamente

**Problema**: após o push, a API `git/ref/tags/...` pode retornar 404 por alguns segundos.

**Solução**: usar `git fetch --tags --force` (local, sem API) para acessar a anotação
da tag. Zero latência, zero race condition.

### 3. `git tag -l` não encontra tags anotadas no runner

**Problema**: `actions/checkout` com `fetch-depth: 0` nem sempre baixa os objetos de
tag anotada (apenas os commits).

**Solução**: `git fetch --tags --force` executado explicitamente antes de `git tag -l`.

### 4. `body_path` substitui o corpo, não faz append

**Problema**: no `softprops/action-gh-release`, `body_path` **substitui** o corpo
inteiro. `body` com heredoc **prepende** ao `generate_release_notes`.

**Solução**: gerar o arquivo de notas completo nós mesmos e usar `gh release create --notes-file`,
que aceita o conteúdo final sem ambiguity.

### 5. Prefixo `fix:` não é removido com sed mal escapado

**Problema**: `eval` + variáveis com sed aninhado em YAML block scalar causam
escapamento incorreto de backslashes.

**Solução**: definir uma `strip()` function em bash com sed inline, sem `eval`, sem
variáveis intermediárias. O padrão correto para ERE é:

```bash
strip() { sed -E 's/^- [a-z]+(\([^)]*\))?: /- /'; }
```

- `\(` e `\)` em ERE: escapam parênteses literais (scope opcional)
- `?`: torna o grupo do scope opcional
- Sem `\\` duplo (que o YAML interpretaria diferente)

### 6. `git stripspace` remove linhas com `#`

**Problema**: `git tag -a` aplica `git stripspace` que trata `#` como comentário e
remove linhas iniciadas com ele. `## What's new` é removido.

**Solução**: não use `#` no início das linhas da anotação. Use `What's new` ou
`Release notes` sem cerquilha.

### 7. `body_path` + `generate_release_notes` não combinam

**Problema**: a doc do `softprops/action-gh-release` diz que `body` faz prepend ao
`generate_release_notes`, mas `body_path` não tem o mesmo comportamento.

**Solução**: usar `gh release create --notes-file` com o arquivo já completo
(anotação + changelog categorizado), eliminando a ambiguidade.

### 8. `uv.lock` fica dessincronizado após bump de versão

**Problema**: ao alterar `version` no `pyproject.toml`, o `uv.lock` mantém a versão
anterior internamente. O `uv run --frozen` não detecta essa inconsistência — ele só
impede que o lockfile seja modificado, não valida que ele está em sync com o
`pyproject.toml`.

**Solução**: adicionar `uv lock --check` antes dos testes no CI. Esse comando
compara o lockfile com o `pyproject.toml` e falha se estiverem dessincronizados.

```yaml
- run: uv lock --check
```

Para corrigir localmente, execute `uv lock` e commite o `uv.lock` atualizado junto
com o bump de versão.

### 9. `__version__` hardcoded em `__init__.py` e testes quebra todo bump

**Problema**: muitos projetos mantêm `__version__ = "X.Y.Z"` hardcoded no
`__init__.py`, além do `version` no `pyproject.toml`. Testes que importam
`from pacote import __version__` e fazem `assert __version__ == "1.2.3"` quebram
a cada bump de versão. O CI que roda após o bump detecta a inconsistência e falha.

**Solução**: eliminar a dupla fonte de verdade. Usar `importlib.metadata.version()`
no `__init__.py` e nos testes verificar apenas que `__version__` é uma string não-vazia
(ou comparar com `importlib.metadata.version("nome-do-pacote")`).

```python
# src/pacote/__init__.py
from importlib.metadata import version

__version__ = version("nome-do-pacote")
```

```python
# tests/test_scaffold.py
def test_version() -> None:
    assert isinstance(__version__, str)
    assert len(__version__) > 0
```

Se o CLI usa `click.version_option(package_name="...")`, o teste de flag deve
usar `__version__` em vez de string hardcoded:

```python
def test_version_flag(self) -> None:
    runner = click.testing.CliRunner()
    result = runner.invoke(cli, ["--version"])
    assert result.exit_code == 0
    assert __version__ in result.output  # nunca "1.2.3"
```

## Variantes

### Projeto sem `uv.lock`

Se o projeto não tem lockfile, substitua:

```yaml
- run: uv run --frozen pytest -v
```

Por:

```yaml
- run: uv sync --group dev
- run: uv run pytest -v
```

### Projeto sem `uv`

Use `actions/setup-python`:

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: ${{ matrix.python-version }}
- run: pip install -e ".[dev]"
- run: pytest -v
```

### Tag sem anotação (lightweight)

Se a tag for criada sem `-a` (lightweight), `git tag -l --format='%(contents)'`
retorna vazio. O fallback usa o número da versão puro como título:

```
v2.5.0
```

Em vez de:

```
v2.5.0: Minha descrição aqui
```
