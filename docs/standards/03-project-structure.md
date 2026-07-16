# Project Structure & Conventions — SmeAccounting

---

## 1. Solution Layout

```
SmeAccounting/
├── .editorconfig                          # Solution-wide coding standards
├── .gitignore
├── Directory.Build.props                  # Shared MSBuild properties
├── Directory.Packages.props               # Central NuGet package versions
├── global.json                            # .NET SDK version pinning
│
├── src/
│   ├── SmeAccounting.Domain/              # Zero dependencies
│   │   ├── Entities/                       # User, Company, Role, etc.
│   │   ├── Enums/                          # AccountType, EntryType, etc.
│   │   ├── ValueObjects/                   # Money, Address, etc.
│   │   ├── Interfaces/                     # IUserRepository, ITokenService, etc.
│   │   └── Security/                       # Feature, LoginAttempt, PasswordPolicy
│   │
│   ├── SmeAccounting.Application/         # Depends only on Domain
│   │   ├── Accounts/
│   │   │   ├── Commits/                    # Commands subfolder
│   │   │   └── Queries/                    # Queries subfolder
│   │   ├── GeneralLedger/
│   │   ├── Security/
│   │   │   ├── Commands/
│   │   │   │   ├── Login/
│   │   │   │   ├── Logout/
│   │   │   │   ├── ChangePassword/
│   │   │   │   └── RefreshToken/
│   │   │   ├── Queries/
│   │   │   │   └── GetCurrentUser/
│   │   │   └── Common/                     # Shared DTOs
│   │   ├── Common/
│   │   │   └── Behaviors/                  # MediatR pipelines
│   │   └── DependencyInjection.cs
│   │
│   ├── SmeAccounting.Infrastructure/      # Depends on Application
│   │   ├── Persistence/
│   │   │   ├── Configurations/             # EF Core entity configurations
│   │   │   └── Repositories/               # Implementation of Domain interfaces
│   │   ├── Security/                       # JwtTokenService, PasswordHasher
│   │   └── DependencyInjection.cs
│   │
│   ├── SmeAccounting.Web/                 # Entry point
│   │   ├── Controllers/
│   │   ├── Authorization/                  # Custom auth handlers
│   │   ├── Components/                     # Blazor components
│   │   └── Program.cs
│   │
│   └── SmeAccounting.Tests/
│       ├── Domain/
│       ├── Application/
│       └── Integration/
│
└── docs/
    ├── brd/                                # Business requirements
    ├── adr/                                # Architecture decisions
    ├── domain/                             # Ubiquitous language
    └── standards/                          # Coding standards (this)
```

---

## 2. CQRS Command/Query Structure

Each feature follows CQRS with 3 files:

```
Feature/
├── Commands/
│   └── CreateAccount/
│       ├── CreateAccountCommand.cs          # IRequest<Result<T>>
│       ├── CreateAccountCommandHandler.cs   # IRequestHandler
│       └── CreateAccountCommandValidator.cs # AbstractValidator (FluentValidation)
└── Queries/
    └── GetAccounts/
        ├── GetAccountsQuery.cs
        └── GetAccountsQueryHandler.cs
```

### Command/Query Naming

- Commands: **Verb + Noun** (`CreateUserCommand`, `PostJournalEntryCommand`)
- Queries: **Get + Noun(s)** (`GetUserQuery`, `GetJournalEntriesQuery`)
- Handlers: **CommandName + Handler** (`CreateUserCommandHandler`)
- Validators: **CommandName + Validator** (`CreateUserCommandValidator`)

---

## 3. MediatR Pipeline Behaviors

Order in DI registration:

```
1. LoggingBehavior — logs command/query execution
2. ValidationBehavior — runs FluentValidation validators
3. Command/Query Handler
```

---

## 4. Assembly Naming

| Project | Assembly | Root Namespace |
|---|---|---|
| Domain | `SmeAccounting.Domain` | `SmeAccounting.Domain` |
| Application | `SmeAccounting.Application` | `SmeAccounting.Application` |
| Infrastructure | `SmeAccounting.Infrastructure` | `SmeAccounting.Infrastructure` |
| Web | `SmeAccounting.Web` | `SmeAccounting.Web` |
| Tests | `SmeAccounting.Tests` | `SmeAccounting.Tests` |

---

## 5. Namespace Convention

Namespace must match folder path exactly:

```csharp
// File: src/SmeAccounting.Domain/Entities/User.cs
namespace SmeAccounting.Domain.Entities;

// File: src/SmeAccounting.Application/Security/Commands/Login/LoginCommandHandler.cs
namespace SmeAccounting.Application.Security.Commands.Login;
```

---

## 6. Dependency Flow (Strict)

```
Web --> Application --> Domain
  |         |
  +--> Infrastructure --> Application --> Domain
```

**Rules:**
- Domain: references nothing external except .NET BCL
- Application: references Domain + MediatR + FluentValidation + FluentResults + Microsoft.Extensions
- Infrastructure: references Application + EF Core + third-party libs
- Web: references Application + Infrastructure
- Tests: references all layers + xUnit + FluentAssertions + NSubstitute

---

## 7. File Naming

- One class/record per file (exceptions: tiny related DTOs)
- File name = type name: `User.cs`, `LoginCommandHandler.cs`
- Tests: `{ClassName}Tests.cs` -> `AccountTests.cs`

---

## 8. Test Project Structure

```
SmeAccounting.Tests/
├── Domain/
│   ├── AccountTests.cs              # Unit tests for Account entity
│   ├── JournalEntryTests.cs
│   └── MoneyTests.cs
├── Application/
│   └── Security/
│       ├── LoginCommandHandlerTests.cs
│       ├── ChangePasswordCommandHandlerTests.cs
│       └── ...
└── Integration/
    └── AuthControllerTests.cs
```

- ❌ **Never** have `UnitTest1.cs` or placeholder tests
- ✅ Every command/query handler should have tests
- ✅ Test files mirror source structure
