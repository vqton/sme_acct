# Test Strategy — SME Accounting System

Living document. Review quarterly or on major scope changes.

---

## 1. Scope

### In Scope

- Unit tests for domain logic, value objects, calculation functions
- Integration tests for repository layer (SQLite), use cases, API endpoints
- Component tests for React UI (forms, pages, interactions)
- API contract tests (request/response shape validation)
- Financial calculation accuracy tests (precision, rounding, edge cases)
- Auth flow tests (login, register, JWT, company switching)

### Out of Scope (for now)

- End-to-end browser tests (add Playwright when flows stabilize)
- Performance/load testing (add when approaching production)
- Security penetration testing (add pre-launch)
- Visual regression testing (add Storybook later)

---

## 2. Test Model

**Hybrid Trophy + Domain-Heavy Pyramid.**

Our accounting system has complex business logic (financial calculations, Vietnamese tax rules, multi-company isolation) AND a React frontend that users interact with directly.

| Layer | Shape | Why |
|---|---|---|
| Static analysis | Base | TypeScript strict + ESLint catches type errors before tests run |
| Unit tests | Strong base | Financial calculations need precision testing with edge cases |
| Integration tests | Largest section | CRUD APIs, DB operations, auth flows — test full request cycle |
| Component tests | Moderate | React forms, company switching, dashboard rendering |
| E2E tests | Thin top | Only critical user journeys (login → create company → view dashboard) |

**Target ratio:** ~20% unit, ~50% integration, ~20% component, ~10% E2E

---

## 3. Test Levels

### 3.1 Unit Tests

**What:** Pure functions, value objects, calculation logic, domain rules.

**Runner:** Vitest (shares Vite config, native TypeScript, ~200ms cold start).

**Where to test:**

- `Money` value object arithmetic (add, subtract, compare, format)
- `TaxCode` validation (10/14 digits, checksum)
- `CompanyStatus` state transitions
- Financial calculation helpers (tax computation, rounding)
- Zod schema validation (input sanitization)

**Financial Calculation Rules:**

```ts
// Integer arithmetic — NO floating-point intermediates
// Store and compute in cents (integer), display as decimal
const amount = 10050; // $100.50 stored as cents

// Round at OUTPUT boundaries, never mid-chain
function calculateTax(subtotalCents: number, rate: number): number {
  return Math.round(subtotalCents * rate); // round once at end
}

// Edge cases to ALWAYS test:
// 1. Zero amounts — must return 0, not NaN
// 2. Maximum values — overflow protection
// 3. Rounding boundaries — $10.005 rounds to $10.00 or $10.01?
// 4. Negative amounts — allowed or rejected?
// 5. Precision chain — no accumulated float errors across operations
```

**AAA Pattern:**

```ts
describe('Money value object', () => {
  describe('add', () => {
    it('adds two amounts in same currency', () => {
      // Arrange
      const a = new Money(10050, 'VND');
      const b = new Money(20030, 'VND');

      // Act
      const result = a.add(b);

      // Assert
      expect(result.amount).toBe(30080);
      expect(result.currency).toBe('VND');
    });

    it('rejects different currencies', () => {
      const vnd = new Money(10050, 'VND');
      const usd = new Money(10050, 'USD');

      expect(() => vnd.add(usd)).toThrow('Currency mismatch');
    });
  });
});
```

### 3.2 Integration Tests

**What:** Full request cycle — HTTP → Express middleware → Controller → Use Case → Repository → SQLite → Response.

**Runner:** Vitest + Supertest (no real server startup, no port conflicts).

**Database:** SQLite in-memory (`:memory:`) or separate test file. Clean state before each test.

```ts
// Critical: Export app without calling listen()
// server/src/presentation/app.ts — already does this ✓

import request from 'supertest';
import { app } from '../app';

describe('POST /api/companies', () => {
  it('creates company with valid data', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        name: 'Công ty ABC',
        taxCode: '0123456789',
        address: 'Hà Nội',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: 'Công ty ABC',
      taxCode: '0123456789',
    });
  });

  it('returns 400 for invalid tax code', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Test', taxCode: '123', address: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/companies')
      .send({ name: 'Test', taxCode: '0123456789', address: 'Test' });

    expect(res.status).toBe(401);
  });
});
```

**What to test at integration level:**

- Every API endpoint: happy path + validation error + auth error
- Repository CRUD against real SQLite (catch SQL bugs, constraint violations)
- Auth middleware: token validation, expiration, company switching
- Zod validation: request body sanitization
- Error response format: consistent `{ error: string }` shape

**Test isolation:**

- `beforeEach`: clean DB or truncate tables
- Each test file: self-contained, no order dependency
- Integration tests: run sequentially (`--runInBand` or `pool: 'forks'`)

### 3.3 Component Tests

**What:** React components rendered in jsdom, tested via user interactions.

**Runner:** Vitest + React Testing Library + `@testing-library/jest-dom`.

**Query Priority (enforced):**

1. `getByRole` — buttons, inputs, headings (best)
2. `getByLabelText` — form fields
3. `getByText` — content elements
4. `getByDisplayValue` — pre-filled inputs
5. `getByTestId` — last resort only (add `data-testid` sparingly)

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyForm } from './CompanyForm';

describe('CompanyForm', () => {
  it('validates required fields before submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CompanyForm onSubmit={onSubmit} />);

    // Submit without filling anything
    await user.click(screen.getByRole('button', { name: /tạo/i }));

    // Validation errors appear
    expect(screen.getByText(/tên công ty không được để trống/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CompanyForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /tên công ty/i }), 'ABC Corp');
    await user.type(screen.getByRole('textbox', { name: /mã số thuế/i }), '0123456789');
    await user.click(screen.getByRole('button', { name: /tạo/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'ABC Corp',
      taxCode: '0123456789',
    });
  });
});
```

**When to test components:**

- Form validation logic (required fields, format checks)
- Conditional rendering (loading states, error messages)
- User interactions (click handlers, form submission)
- Multi-step flows (company creation wizard)
- Auth-dependent rendering (login page vs dashboard)

**When NOT to test components:**

- CSS styling (use visual regression later)
- Third-party library internals
- Simple prop passthrough (covered by TypeScript)

### 3.4 API Contract Tests

**What:** Validate request/response shapes match Zod schemas at trust boundaries.

```ts
describe('Company API contract', () => {
  it('CreateCompanySchema rejects invalid input', () => {
    const result = CreateCompanySchema.safeParse({
      name: '',
      taxCode: 'not-a-number',
    });

    expect(result.success).toBe(false);
  });

  it('CreateCompanySchema accepts valid input', () => {
    const result = CreateCompanySchema.safeParse({
      name: 'Công ty ABC',
      taxCode: '0123456789',
      address: 'Hà Nội',
      phone: '0912345678',
      email: 'contact@abc.vn',
    });

    expect(result.success).toBe(true);
  });
});
```

---

## 4. Test Data Strategy

### Factories (not fixtures)

```ts
// tests/factories/company.ts
export function buildCompany(overrides?: Partial<CreateCompanyInput>) {
  return {
    name: 'Công ty TEST',
    taxCode: '0123456789',
    address: '123 Đường Test, Hà Nội',
    ...overrides,
  };
}

// Usage in tests
const company = buildCompany({ taxCode: '9876543210' });
```

### Unique data per test

- Generate unique tax codes, emails per test run
- Use `Date.now()` or random suffix for unique names
- Never hardcode IDs that depend on auto-increment order

### No production data

- Test with synthetic Vietnamese company data
- Never copy production DB to test environment
- Use realistic but fake: "Công ty TNHH ABC", Vietnamese addresses, phone formats

---

## 5. Tools

| Purpose | Tool | Why |
|---|---|---|
| Test runner | Vitest | Native TS, Vite-native, 200ms cold start, Jest-compatible API |
| API testing | Supertest | No server startup needed, chainable assertions |
| Component testing | React Testing Library | User-centric queries, accessibility-first |
| Mocking | `vi.fn()` / `vi.mock()` | Module-level mocking, spy on functions |
| Mock API (frontend) | MSW (Mock Service Worker) | Intercepts at network layer, realistic |
| Coverage | `@vitest/coverage-v8` | Built into Node.js, fast |
| Type checking | TypeScript `tsc --noEmit` | Separate from test execution |
| Linting | ESLint + @typescript-eslint | Catch issues before tests |

---

## 6. CI Pipeline

```
PR opened
  │
  ├─→ tsc --noEmit          (type check, ~5s)
  ├─→ eslint .              (lint, ~3s)
  ├─→ vitest run --coverage (unit + integration + component, ~30s)
  │
  └─→ All green → merge eligible
```

**CI rules:**

- `vitest run` (not watch mode) — CI must exit cleanly
- Coverage thresholds: 80% lines, 80% functions, 70% branches
- Fail build if thresholds not met
- Integration tests: sequential (`pool: 'forks'`) to avoid DB conflicts
- Unit tests: parallel (default Vitest behavior)

---

## 7. Risk-Based Test Prioritization

| Feature | Risk | Impact | Test Depth |
|---|---|---|---|
| Financial calculations (tax, rounding) | High | Regulatory fines, audit failure | Unit tests with edge cases + property tests |
| Auth & company isolation | High | Data breach, cross-company leak | Integration tests, every endpoint |
| Company CRUD | Medium | Data loss, incorrect display | Integration tests, happy + error paths |
| User management | Medium | Unauthorized access | Integration tests, permission checks |
| Dashboard display | Low | Incorrect numbers shown | Component tests |
| UI styling | Low | Cosmetic issues | Skip for now |

---

## 8. Entry & Exit Criteria

### Entry Criteria (start testing a feature)

- [ ] Code compiles (`tsc --noEmit` passes)
- [ ] ESLint passes with no new errors
- [ ] Feature is demonstrable (not half-built)

### Exit Criteria (feature is "done")

- [ ] Unit tests pass for all calculation logic
- [ ] Integration tests pass for all API endpoints
- [ ] Component tests pass for user-facing forms
- [ ] Coverage thresholds met for new code
- [ ] No `any` types without justification
- [ ] Error messages are user-friendly (Vietnamese)
- [ ] Test data is synthetic, not production-derived

---

## 9. What NOT to Test

- Framework behavior (Express routing, React rendering)
- Zod internals (trust the library)
- Simple getters/setters
- Third-party library correctness
- CSS styling (use visual regression later)
- Database schema (auto-created by `initDatabase()`)

---

## 10. Metrics & Reporting

| Metric | Target | How to Measure |
|---|---|---|
| Test coverage (lines) | ≥ 80% | `vitest run --coverage` |
| Test coverage (functions) | ≥ 80% | `vitest run --coverage` |
| Test coverage (branches) | ≥ 70% | `vitest run --coverage` |
| Test pass rate | 100% | CI pipeline |
| Flaky test rate | < 2% | Track `it.skip` / flaky markers |
| Defect escape rate | Track | Bugs found in production vs test |
| Test execution time | < 60s | CI pipeline timing |

---

## 11. Review Cadence

- **Weekly:** Review flaky tests, update test data
- **Sprint end:** Coverage report, new test gaps identified
- **Quarterly:** Full strategy review, adjust risk priorities
- **On major change:** New features, architecture shifts, new integrations

---

## Appendix: Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Correct Approach |
|---|---|---|
| Testing implementation details | Tests break on refactor | Test user behavior |
| Mocking the database | Mocks lie about SQL correctness | Use real SQLite (in-memory) |
| Snapshot sprawl | Nobody reviews 500-line snapshots | Assert specific elements |
| 100% coverage chasing | Diminishing returns, brittle tests | Focus on critical paths |
| `fireEvent` for interactions | Doesn't simulate real events | Use `userEvent.setup()` |
| `container.querySelector` | Breaks on CSS changes | Use `screen.getByRole()` |
| Shared test state | Tests fail in unpredictable order | Clean before each test |
| Testing third-party libs | Waste of time, trust the lib | Test your integration with it |
| Skipping async `await` | False positives | Always `await` async assertions |
| Mixing test environments | jsdom tests running in Node | Split by environment |
