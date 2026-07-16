# Coding Standards — SmeAccounting

## Documents

| File | Content |
|---|---|
| `01-csharp-coding-standards.md` | Naming, style, language conventions, architecture rules, banned APIs, test conventions, review checklist |
| `02-analyzer-configuration.md` | Roslyn/Sonar/Meziantou/Roslynator rules, complexity thresholds, per-project overrides, CI enforcement |
| `03-project-structure.md` | Folder layout, CQRS conventions, dependency flow, file naming, test structure |
| `04-security-and-exceptions.md` | JWT config, password policy, exception hierarchy, global handler, audit trail, SQL injection, logging, secrets |
| `05-test-strategy.md` | ISO 29119 test strategy: scope, risk register, test pyramid, levels, regulatory compliance, entry/exit criteria, CI pipeline, defect lifecycle |
| `06-test-approach.md` | ISO 29119-3 test design: techniques, templates, isolation, assertion philosophy, regulatory test design patterns |
| `07-test-process.md` | ISO 29119-2 test process: sprint activities, RACI, defect management, reporting, metrics, SLAs, escalation |
| `08-implementation-roadmap.md` | 13-task phased roadmap: dependency graph, skills allocation, risk management, acceptance gates, delivery schedule |

## Quick Setup

```bash
# 1. Create Directory.Build.props at solution root
# 2. Create .editorconfig at solution root
# 3. Add analyzer NuGet packages (see 02-analyzer-configuration)
# 4. Run build:
dotnet build --warnaserror
```

## Codebase Violations — Status

### Fixed (This Sprint)

| Severity | Issue | File | Fix |
|---|---|---|---|---|
| HIGH | No .editorconfig | — | Created at solution root |
| HIGH | No Directory.Build.props | — | Created at solution root |
| HIGH | No analyzer packages | — | Added SonarAnalyzer/Meziantou/Roslynator via Directory.Build.props |
| HIGH | No AnalysisLevel/EnforceCodeStyle | — | Added to Directory.Build.props |
| MED | `UnitTest1.cs` placeholder | Tests/UnitTest1.cs | Deleted |
| MED | BaseCatalogEntity public setters | `Domain/Entities/BaseCatalogEntity.cs` | Changed to `protected set` |
| MED | BaseCatalogEntity subclass public setters | `Domain/Entities/Permission.cs` | Changed to `protected set` |
| MED | Money literal error + missing null checks | `Domain/ValueObjects/Money.cs` | Used `ArgumentNullException` + `string.Equals(Ordinal)` |
| MED | Role.Users public setter (CA2227) | `Domain/Entities/Role.cs` | Changed to `private set` |
| MED | User.IsPasswordReused string compare (MA0006) | `Domain/Entities/User.cs` | Used `string.Equals(Ordinal)` |
| MED | User.AddRole Contains guard (CA1868) | `Domain/Entities/User.cs` | Removed redundant `Contains` check |
| MED | User.HasRole string compare (MA0006) | `Domain/Entities/User.cs` | Used `string.Equals(Ordinal)` |
| MED | PasswordPolicy null check missing (CA1062) | `Domain/Security/PasswordPolicy.cs` | Added null guard |
| LOW | AuthController `Guid.Parse` inline | `Web/Controllers/AuthController.cs` | Used method-level variable + null check |

### Deferred / Known Limitations

| Severity | Issue | Reason |
|---|---|---|
| LOW | EF Core 9.x with net10.0 target | Pomelo 10.x not released yet — pinned to 9.0.3 |
| NOTE | 216 analyzer warnings (existing code) | All build as warnings, not errors. Fix incrementally. |

### Replaced by Architecture Tests (Phase 2)

The following runtime violations are now enforced by `NetArchTest`:

| Rule | File | Enforcement |
|---|---|---|
| Domain → Application/Infrastructure | All domain projects | `Domain_ShouldNotReference_ApplicationOrInfrastructure` |
| Application → Infrastructure | Application layer | `Application_ShouldNotReference_Infrastructure` |
| Controllers no EF Core | Web layer | `Controllers_ShouldOnlyDependOn_MediatR` |

## Source References

- [Microsoft .NET Coding Conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- [dotnet/runtime Coding Style](https://github.com/dotnet/runtime/blob/main/docs/coding-guidelines/coding-style.md)
- [.NET Code Analysis (CAxxxx)](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/overview)
- [SonarAnalyzer for C#](https://github.com/SonarSource/sonar-dotnet)
- [Meziantou.Analyzer](https://github.com/meziantou/Meziantou.Analyzer)
- [Roslynator](https://github.com/dotnet/roslynator)
