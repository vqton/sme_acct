---
name: dev-standup
description: Dev progress summary — git changes, build status, todo list, blocker scan
argument-hint: "optional: show-diffs to include file diffs"
---

# Dev Standup

Run a development standup: git changes on `src/`, build health, scaffold status, blocking issues.

## Usage

```
skill({ name: "dev-standup" })
# or with diffs
skill({ name: "dev-standup", arguments: "show-diffs" })
```

## What it shows

1. **Git changes** — commits touching `src/` since yesterday (or last 10 if none today)
2. **Build status** — `dotnet build` result
3. **Scaffold gaps** — empty directories in Application, Infrastructure, Tests
4. **Blocker scan** — missing classes, `// TODO` comments, `#error` directives
5. **Next work** — reads AGENTS.md pending todos
