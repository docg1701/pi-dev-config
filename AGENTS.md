FILESYSTEM: Read anywhere. Write only in the working repository. Temp files allowed; keep managed and organized.

GIT: Short commit/tag/release messages. Branch for features and fixes. Ask before merging to main/master.

SECURITY: No hardcoded secrets. Keep .gitignore current.

DEPENDENCIES: Install, configure, and update dependencies before dev, run, or refactor.

PRINCIPLES: KISS, DRY, YAGNI, TDA.

CODE: Native English. UI and user-facing docs may use another language if specified. Functions ≤50 lines. Files ≤700 lines.

COMMENTS: Guide senior developers only. No TODOs or noise.

DOCUMENTATION: Brief, precise, simple Markdown.

TESTS: Test behavior only. Assert and verify. Mock external dependencies only. Never mock internal logic. Target 80% testable-logic coverage. Workflow: red → green → refactor → check regressions.

RESEARCH: context7 for library docs. Web search for general queries.

KNOWLEDGE: Check stack versions against your knowledge cutoff. Read current docs before acting when versions are newer or confidence in syntax, dependencies, APIs, or patterns is <85%.
