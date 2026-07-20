# SmeAccounting — Agent Instructions

Vietnamese SME accounting platform. .NET 10 / ASP.NET Core MVC / EF Core / SQL Server.

## Build & Run

```bash
dotnet build SmeAccounting.slnx
dotnet run --project src/SmeAccounting.Web
```

## Tests

```bash
dotnet test tests/SmeAccounting.Domain.UnitTests
dotnet test tests/SmeAccounting.IntegrationTests
dotnet test SmeAccounting.slnx              # all
```

Framework: xUnit + FluentAssertions + NSubstitute.

## Architecture (Current State)

Single monolithic Web project (`src/SmeAccounting.Web`). Docs describe Clean Architecture layers (Domain/Application/Infrastructure) but code is not yet separated — everything lives in the Web project.

| Folder | Purpose |
|--------|---------|
| `Models/` | Entities, value objects, enums, view models |
| `Data/` | DbContext + EF configurations |
| `Controllers/` | MVC controllers (Auth, Home, Profile) |
| `Areas/` | Feature areas (Admin, Tax, GeneralLedger, etc.) |
| `Services/` | Domain services (CompanyStatusMachine, etc.) |
| `Authorization/` | Custom auth handlers + permission system |
| `Middleware/` | IP whitelist, rate limiting |

## Database — Critical Gotcha

Schema is created via **raw SQL in Program.cs**, not EF Core migrations. The `Migrations/` folder exists but is not the source of truth. When adding tables/columns, update both the raw SQL in `Program.cs` AND the EF model/config.

Default schema: `acc` (set in `ApplicationDbContext.OnModelCreating`).

## Domain Conventions

Central entity: `Company` (multi-tenant, GUID PK). All domain tables have `CompanyId` FK.

**Deprecated properties (DO NOT USE):**
- `Company.Name` → use `NameVietnamese`
- `Company.Address` → use `HeadOfficeAddress` + Province/District/Ward IDs
- `Company.IsActive` → use `Status == CompanyStatus.Active`
- `Company.LegalRepresentative` → use `LegalRepresentatives` collection

**Status machine:** `Company.Status` transitions are defined in `Services/CompanyStatusMachine.cs`. Active→Suspended/Dissolved/Bankrupt/Converting; Suspended→Active/Dissolved; terminal states: Dissolved, Bankrupt, Merged.

**Multi-company isolation:** Users linked to companies via `UserCompany` join table. Always filter queries by company context.

## Regulatory Context

Vietnamese law compliance: TT 99/2025/TT-BTC (accounting), NĐ 168/2025/NĐ-CP (enterprise registration), NĐ 69/2024 (VNeID), NĐ 23/2025 (digital signatures). Domain terminology in `UBIQUITOUS_LANGUAGE.md`.

## Seed Data

Default admin: `admin` / `Admin@123` (created in Program.cs on first run).

## Test Conventions

- Unit tests: `tests/SmeAccounting.Domain.UnitTests/` — entities, value objects, domain services
- Integration tests: `tests/SmeAccounting.IntegrationTests/` — requires SQL Server
- Test method naming: `Method_Scenario_ExpectedResult`
- Use FluentAssertions (`.Should().Be()`, `.Should().BeEmpty()`, etc.)
