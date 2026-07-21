# Code Quality Standards — SME Accounting

Rules enforced in this codebase. Reference before writing code.

---

## TypeScript

### Strict Mode (Non-Negotiable)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

`strict` = floor, not ceiling. Enable additional flags as project grows.

### Type Safety

- **`unknown` over `any`**. Only use `any` as deliberate escape hatch with comment.
- **No `as` type assertions** unless unavoidable (e.g. DOM APIs). Use type guards instead.
- **Explicit return types** on exported functions. Inference OK for local helpers.
- **`interface` for object shapes**, `type` for unions, primitives, utility types. Pick one rule per codebase; this project uses both contextually.
- **Branded types** for domain identifiers: `type CompanyId = string & { __brand: 'CompanyId' }` prevents mixing IDs.

### Enums vs Constants

```ts
// Prefer const objects over enums for tree-shaking
export const CompanyStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DRAFT: 'draft',
} as const;

export type CompanyStatus = typeof CompanyStatus[keyof typeof CompanyStatus];
```

### Nullability

- Use `strictNullChecks` (included in `strict`).
- Prefer `??` over `||` for default values (only catches `null`/`undefined`, not `0`/`''`).
- Optional chaining `?.` for nested access.
- Return `null` explicitly, not `undefined`, for "no value".

### Discriminated Unions (State Machines)

```ts
// Instead of boolean flags
type CompanyState =
  | { status: 'draft' }
  | { status: 'active'; activatedAt: Date }
  | { status: 'suspended'; reason: string };

// Exhaustive switch
function getStatusLabel(state: CompanyState): string {
  switch (state.status) {
    case 'draft': return 'Nháp';
    case 'active': return 'Đang hoạt động';
    case 'suspended': return 'Đình chỉ';
    case _: {
      const _: never = state;
      return _;
    }
  }
}
```

### Utility Types

Leverage built-in: `Partial<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `Awaited<T>`.

```ts
// Input DTO: all fields optional except required ones
type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;

// Update DTO: everything optional
type UpdateCompanyInput = Partial<Omit<Company, 'id' | 'createdAt'>>;
```

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Types/Interfaces | PascalCase | `Company`, `CreateCompanyInput` |
| Type parameters | `T` prefix | `TResult`, `TEntity` |
| Variables/functions | camelCase | `getCompanyById`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files (types) | kebab-case, `.types.ts` | `company.types.ts` |
| Files (others) | kebab-case | `company-repository.ts` |
| React components | PascalCase | `CompanyCard.tsx` |
| Custom hooks | `use` prefix | `useCompany.ts` |

### Naming Rules

- **No abbreviations**: `company` not `co`, `quantity` not `qty`.
- **No Hungarian notation**: `name` not `strName`.
- **Boolean props/functions**: prefix with `is`, `has`, `should`, `can`.
- **Event handlers**: `handle` prefix for component callbacks, `on` prefix for prop callbacks.
- **Domain terms**: match `UBIQUITOUS_LANGUAGE.md` exactly.

---

## Functions

### Size and Shape

- **Target < 25 lines** per function.
- **Target < 3 parameters**. Group related values into objects beyond that.
- **One responsibility**. If you describe it with "and" or "or", split it.
- **No side effects** in pure functions. Isolate I/O at boundaries.
- **Early returns** over deep nesting.

```ts
// Good: early return, single purpose
function validateTaxCode(taxCode: string): ValidationResult {
  if (taxCode.length !== 10 && taxCode.length !== 14) {
    return { valid: false, error: 'MST phải 10 hoặc 14 chữ số' };
  }
  if (!/^\d+$/.test(taxCode)) {
    return { valid: false, error: 'MST chỉ chứa chữ số' };
  }
  return { valid: true };
}
```

### Error Handling

- Use custom error classes for domain errors.
- Never swallow errors silently.
- In controllers: catch, map to HTTP status, return structured error.
- In use cases: let domain errors propagate to controller layer.

```ts
class InsufficientFundsError extends Error {
  constructor(required: Money, available: Money) {
    super(`Cần ${required.amount} ${required.currency}, chỉ có ${available.amount}`);
    this.name = 'InsufficientFundsError';
  }
}
```

---

## React + TypeScript

### Component Rules

- **One component per file**. Named exports preferred.
- **< 200 lines**. Extract sub-components or hooks when exceeding.
- **Props default to required**. Only mark `?` optional when truly optional.
- **Interface for props**, `type` for everything else (community convention).
- **Extend HTML props** for wrapper components:

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return <button className={`btn btn-${variant} btn-${size}`} {...props} />;
}
```

### Custom Hooks

- **Explicit return types** on hooks. Don't trust inference.
- **Return object**, not array (except for well-known patterns like `[value, setter]`).
- **Hooks in `hooks/` directory**, not co-located with components.
- **Logic in hooks**, rendering in components. Separate concerns.

```ts
interface UseCompanyResult {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

function useCompany(id: string): UseCompanyResult {
  // ... implementation
}
```

### State Management

- **Discriminated unions** over boolean flags for complex state.
- **Zustand** or React context for shared state (avoid prop drilling).
- **Server state** (API data) kept separate from UI state.

```ts
// Bad
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [data, setData] = useState(null);

// Good
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

const [state, setState] = useState<FetchState<Company[]>>({ status: 'idle' });
```

### Form Handling

- **Zod** for validation schemas (shared between client and server).
- **Controlled components** for most forms.
- Display validation errors inline, not in alerts.

---

## Project Structure

### Client

```
client/src/
├── components/          # Shared/reusable components
│   └── Button/
│       ├── Button.tsx
│       └── index.ts
├── features/            # Feature-specific code
│   └── companies/
│       ├── CompanyList.tsx
│       ├── CompanyForm.tsx
│       └── useCompanies.ts
├── hooks/               # Shared custom hooks
├── services/            # API client functions
├── types/               # Shared domain types only
├── utils/               # Pure utility functions
└── App.tsx
```

### Server

```
server/src/
├── domain/              # Entities, value objects, repo interfaces
│   ├── entities/
│   └── value-objects/
├── application/         # Use cases
├── infrastructure/      # DB implementations, external services
│   └── database/
└── presentation/        # Controllers, middleware, routes
```

### Barrel Files

- One `index.ts` per component folder is fine.
- **No global barrel** for all components (circular dependency risk).
- Use `import type` for type-only imports.

---

## Code Organization

### Imports Order

```ts
// 1. External packages
import { Router } from 'express';
import { z } from 'zod';

// 2. Internal domain
import { Company } from '@domain/entities/Company';
import { CreateCompany } from '@application/use-cases/CreateCompany';

// 3. Types (type-only)
import type { Request, Response } from 'express';
```

### Exports

- **Named exports** over default exports (better refactoring, better tree-shaking).
- **Export types alongside implementations**.
- Don't export internal helpers.

---

## Error Handling Patterns

### Server (Express)

```ts
// Controller: thin, delegates to use cases
async function createCompany(req: Request, res: Response) {
  try {
    const input = CreateCompanySchema.parse(req.body); // Zod validation
    const company = await createCompanyUseCase.execute(input);
    res.status(201).json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    if (error instanceof DuplicateTaxCodeError) {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
}
```

### Client (React)

- Use **Error Boundaries** for component-level error recovery.
- Display user-friendly messages (Vietnamese for UI).
- Log technical details to console/service, not UI.

---

## Validation

- **Zod schemas** shared between client and server.
- Validate at trust boundaries: API input, form submission, database output.
- Never trust client input — always validate server-side.
- Domain validation in entities, transport validation in controllers.

```ts
// Shared schema (used by both client and server)
export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Tên công ty không được để trống'),
  taxCode: z.string().regex(/^\d{10,14}$/, 'MST phải 10 hoặc 14 chữ số'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
```

---

## Testing (When Added)

- **Co-locate tests** with source: `CompanyRepository.test.ts` next to `CompanyRepository.ts`.
- **Test behavior, not implementation**.
- **Mock at boundaries** (DB, HTTP), not internal functions.
- Use `vitest` (aligns with Vite toolchain).
- Type tests for public APIs using `expect-type`.

---

## Linting and Formatting

- **ESLint** with TypeScript rules (`@typescript-eslint`).
- **Prettier** for formatting (enforced via ESLint integration).
- **Husky + lint-staged** for pre-commit checks.
- **No unused imports/variables** (enforced by `noUnusedLocals`).

### ESLint Rules (Key)

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why | Fix |
|---|---|---|
| `any` type | Defeats TypeScript purpose | Use `unknown` + type guards |
| Boolean flag soup | 2ⁿ impossible states | Discriminated unions |
| God components | Hard to test, modify | Extract hooks + sub-components |
| Magic strings/numbers | Hidden meaning | Named constants |
| Deep nesting (>3 levels) | Hard to follow | Early returns, extract functions |
| `console.log` in prod | Noise, security risk | Structured logger |
| Implicit returns | Missed code paths | Enable `noImplicitReturns` |
| Default export barrels | Circular deps | Named exports only |
| Mixing concerns in one file | Hard to find, test | SRP per file |

---

## Review Checklist

Before submitting code:

- [ ] `tsc --noEmit` passes (zero errors)
- [ ] ESLint passes (zero warnings in new code)
- [ ] No `any` types without justification comment
- [ ] Functions < 25 lines, < 3 params
- [ ] Components < 200 lines
- [ ] Names match ubiquitous language
- [ ] Validation at trust boundaries
- [ ] Error messages in Vietnamese for user-facing text
- [ ] No secrets, connection strings, or credentials in code
- [ ] Domain errors have descriptive messages
