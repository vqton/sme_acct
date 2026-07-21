# AGENTS.md — SME Accounting

Vietnamese SME accounting system. Two packages: `server/` (Express + SQLite) and `client/` (React + Vite).

## Quick Commands

```bash
# Run both (from root)
npm run dev

# Or individually
cd server && npm run dev    # tsx watch on port 3000
cd client && npm run dev    # Vite dev server on port 5173

# Build
npm run build               # both packages
cd server && npm run build  # tsc only
cd client && npm run build  # tsc -b && vite build
```

## Architecture

**DDD-lite** with 4 layers in `server/src/`:
- `domain/` — entities, value objects, repository interfaces
- `application/` — use cases (AuthService, CompanyUseCases)
- `infrastructure/` — SQLite via better-sqlite3, JWT auth
- `presentation/` — Express controllers, middleware

**Database**: SQLite (`server/data/sme_acct.db`). Schema auto-creates on startup via `initDatabase()`.

**Path aliases** in server tsconfig: `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`

## Key Gotchas

- Prepared statements lazy-init (avoid circular import timing issues)
- Vietnamese regulatory context: LDN 2024, TT 99/2025/TT-BTC, NĐ 168/2025/NĐ-CP
- Domain terminology defined in `UBIQUITOUS_LANGUAGE.md` — use exact terms
- Business requirements in `docs/brd/` — reference before adding features

## Conventions

- ESM modules (`"type": "module"` in both packages)
- TypeScript strict mode
- better-sqlite3 is synchronous (no async/await in repos)
- Code quality standards in `CODE_QUALITY.md` — follow when writing code
- Test strategy in `TEST_STRATEGY.md` — follow when writing tests
- Skill routing guide in `SKILL_DECISION_GUIDE.md` — use when unsure which skill to load
