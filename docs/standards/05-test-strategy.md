# Test Strategy — SmeAccounting

**Version:** 1.0  
**Date:** 2026-07-16  
**Author:** QA Expert (20+ yrs)  
**Standards:** ISO/IEC/IEEE 29119, ISTQB CTFL/CT-TAS, IEEE 730-2026

---

## 1. Introduction & Scope

### 1.1 Purpose

Define testing approach for SmeAccounting — Vietnamese SME accounting platform built with Clean Architecture (C# .NET 10). Strategy aligns with regulatory requirements (TT 99/2025/TT-BTC, NĐ 254/2026/NĐ-CP, Luật Kế toán 88/2015) and industry best practices.

### 1.2 Scope

**In scope:**
- Domain entities + value objects (business rules)
- Application CQRS command/query handlers
- Infrastructure persistence (EF Core, repositories)
- Web API controllers + auth pipeline
- Integration with external systems (VNeID, eTax, digital signature, e-invoice)
- Cross-cutting: audit trail, logging, security

**Out of scope:**
- Third-party library testing (FluentValidation, MediatR, EF Core internals)
- UI/Browser E2E tests (Blazor components — manual testing only)
- Infrastructure deployment testing (separate DevOps scope)
- Performance/load testing (separate non-functional strategy phase)

### 1.3 Quality Objectives

| Objective | Target | Measured By |
|---|---|---|
| Defect escape rate (PROD) | < 3% of total defects | Production incident tracking |
| Unit test coverage (Domain) | >= 90% line, >= 80% branch | Coverlet + ReportGenerator |
| Integration test coverage (API critical paths) | 100% of critical flows | Test traceability matrix |
| Architecture rule compliance | 0 violations | NetArchTest in CI |
| Regulatory compliance test coverage | 100% of mandatory controls | Compliance traceability matrix |
| Test suite execution time | < 5 min (unit), < 10 min (all) | CI pipeline timing |

---

## 2. Risk Register

| ID | Risk | Probability | Impact | RPN | Mitigation | Test Coverage |
|---|---|---|---|---|---|---|
| R1 | Data integrity violation (audit trail bypass) | Low | Critical | 12 | EF Core interceptor tests, rollback verification | Integration |
| R2 | Unauthorized data access (permission bypass) | Medium | Critical | 16 | Auth tests at API + handler level | Integration + Unit |
| R3 | Incorrect VAT/tax calculation | Medium | High | 12 | Domain unit tests per tax rule | Unit |
| R4 | E-invoice format non-compliance | Medium | High | 12 | Contract tests with tax authority schema | Integration |
| R5 | Concurrency data corruption | Low | High | 8 | Pessimistic/concurrency tests | Integration |
| R6 | VNeID integration failure | Medium | High | 12 | Mock integration tests + contract | Integration |
| R7 | Session hijacking / token theft | Medium | Critical | 16 | JWT validation + rotation tests | Security |
| R8 | Multi-company data leakage | Low | Critical | 8 | Data isolation query tests | Integration |

RPN = Probability × Impact (1-4 scale each). Critical ≥ 12.

---

## 3. Test Pyramid & Distribution

```
         ┌──────────────┐
         │   E2E (5%)   │  ← Critical user journeys only
         ├──────────────┤
         │Integration   │  ← 25%: real DB, real HTTP, external contracts
         ├──────────────┤
         │Architecture  │  ← Always run: NetArchTest layer rules
         ├──────────────┤
         │Unit (70%)    │  ← Domain + Application handlers, fast
         └──────────────┘
```

Total target: 400+ tests, suite complete in < 15 min.

| Layer | Test Count Target | Run Time | Dependencies |
|---|---|---|---|
| Domain unit tests | 200+ | < 2 sec | None |
| Application handler tests | 100+ | < 5 sec | NSubstitute mocks |
| Architecture tests | 15 | < 1 sec | NetArchTest |
| Infrastructure integration | 50+ | < 5 min | Testcontainers (MySQL) |
| API integration | 30+ | < 3 min | WebApplicationFactory |
| Contract tests | 10 | < 2 min | WireMock.NET |

---

## 4. Test Levels

### 4.1 Level 1 — Domain Unit Tests

**Goal:** Verify business rules in complete isolation.

**Rules:**
- Zero mocks, zero databases, zero I/O
- Test entities, value objects, domain services
- Every calculation/logic branch must be tested
- Error paths tested before happy paths

**Framework:** xUnit + FluentAssertions

```csharp
// Template
public class AccountTests
{
    [Fact]
    public void MoveTo_SameId_ThrowsInvalidOperation()
    {
        var account = new Account("1111", "Cash", AccountType.Asset);
        account.Invoking(a => a.MoveTo(account.Id))
            .Should().Throw<InvalidOperationException>();
    }

    [Theory]
    [InlineData(AccountType.Asset, EntryType.Debit)]
    [InlineData(AccountType.Liability, EntryType.Credit)]
    public void Constructor_SetsNormalBalanceByType(AccountType type, EntryType expected)
    {
        var account = new Account("1111", "Test", type);
        account.NormalBalance.Should().Be(expected);
    }
}
```

**What to test in Domain:**

| Entity | Priority | Key Behaviors |
|---|---|---|
| User | Critical | Password set, reuse check, lockout, role assignment |
| Account | Critical | Normal balance derivation, parent validation |
| JournalEntry | Critical | Post validation, balanced entry rule, line constraints |
| Money | High | Add/subtract with currency check, zero, negate |
| RefreshToken | High | Expiry, revocation, rotation |
| LoginAttempt | Medium | Result tracking |
| FiscalYear | Medium | Period boundaries, close/open transitions |
| OrganizationUnit | Low | Hierarchy navigation |

### 4.2 Level 2 — Application Handler Tests

**Goal:** Verify CQRS command/query handler orchestration.

**Rules:**
- Mock all repository interfaces (NSubstitute)
- Test: success path, validation failure, not-found, auth failure
- Assert: correct Result/Failure, correct repository calls
- CancellationToken propagation verified

```csharp
public class LoginCommandHandlerTests
{
    private readonly IUserRepository _userRepo = Substitute.For<IUserRepository>();
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _handler = new LoginCommandHandler(
            _userRepo, Substitute.For<IRoleRepository>(),
            Substitute.For<ITokenService>(),
            Substitute.For<IPasswordHasher>(),
            Substitute.For<IUnitOfWork>());
    }

    [Fact]
    public async Task Handle_UnknownUser_ReturnsFailure()
    {
        _userRepo.GetByUsernameAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((User?)null);

        var result = await _handler.Handle(new LoginCommand("nonexistent", "pass"), default);

        result.IsFailed.Should().BeTrue();
    }
}
```

| Handler | Mock Dependencies | Key Scenarios |
|---|---|---|
| LoginCommandHandler | IUserRepository, IPasswordHasher, ITokenService, IUnitOfWork | Success, invalid pw, locked, inactive |
| LogoutCommandHandler | IUserRepository, IUnitOfWork | Valid token, expired token |
| RefreshTokenCommandHandler | IUserRepository, ITokenService, IUnitOfWork | Valid rotation, expired, invalid |
| ChangePasswordCommandHandler | IUserRepository, IPasswordHasher, IUnitOfWork | Correct, wrong current, reuse |
| CreateAccountCommandHandler | IAccountRepository, IUnitOfWork | Valid, duplicate code |
| CreateJournalEntryCommandHandler | IJournalEntryRepository, IUnitOfWork | Balanced, unbalanced, duplicate ref |
| GetCurrentUserQueryHandler | IUserRepository, IRoleRepository | Found, not found |
| GetAccountsQueryHandler | IAccountRepository | Empty, with data |
| GetJournalEntriesQueryHandler | IJournalEntryRepository | Period filter, pagination |

### 4.3 Level 3 — Architecture Tests

**Goal:** Enforce Clean Architecture layer rules programmatically.

**Tool:** NetArchTest

```csharp
public class ArchitectureTests
{
    private static readonly Assembly DomainAssembly = typeof(BaseEntity).Assembly;
    private static readonly Assembly ApplicationAssembly = typeof(DependencyInjection).Assembly;
    private static readonly Assembly InfrastructureAssembly = typeof(Infrastructure.DependencyInjection).Assembly;
    private static readonly Assembly WebAssembly = typeof(Program).Assembly;

    [Fact]
    public void Domain_ShouldNotReference_ApplicationOrInfrastructure()
    {
        var result = Types.InAssembly(DomainAssembly)
            .Should().NotHaveDependencyOn("SmeAccounting.Application")
            .And().NotHaveDependencyOn("SmeAccounting.Infrastructure")
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_ShouldNotReference_Infrastructure()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .Should().NotHaveDependencyOn("SmeAccounting.Infrastructure")
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Handlers_ShouldBeInternalAndSealed()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .That().HaveNameEndingWith("Handler")
            .Should().BeSealed()
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Entities_ShouldNotHavePublicSetters()
    {
        var result = Types.InAssembly(DomainAssembly)
            .That().AreClasses()
            .And().ImplementInterface(typeof(BaseEntity))
            .Should().NotHavePropertyWithPublicSetter()
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Controllers_ShouldOnlyDependOn_MediatR()
    {
        var result = Types.InAssembly(WebAssembly)
            .That().HaveNameEndingWith("Controller")
            .Should().NotHaveDependencyOn("Microsoft.EntityFrameworkCore")
            .GetResult();
        result.IsSuccessful.Should().BeTrue();
    }
}
```

**Rules enforced:**

| Rule | Violation = Build Fail |
|---|---|
| Domain → Application | Yes |
| Domain → Infrastructure | Yes |
| Application → Infrastructure | Yes |
| Application → Web | Yes |
| Infrastructure → Web | Yes |
| All handlers sealed | Yes |
| Entities no public setters | Yes |
| Controllers no EF Core | Yes |
| Public methods have null checks | Warning |

### 4.4 Level 4 — Infrastructure Integration Tests

**Goal:** Verify EF Core configuration, repository behavior, and data access with REAL database.

**Rules:**
- **MUST use Testcontainers** (real MySQL/PostgreSQL) — never InMemory
- InMemory has different SQL translation — hides bugs
- Each test class gets its own container (destroy after)
- Test: CRUD, queries, unique constraints, FK behavior, migrations

**Tool:** xUnit + Testcontainers.MySql + FluentAssertions

```csharp
public class UserRepositoryTests : IAsyncLifetime
    // Each test project has a ContainerFixture:
    // spins up real MySQL, runs migrations
{
    private readonly MySqlContainer _container;
    private ApplicationDbContext _context = null!;
    private UserRepository _repo = null!;

    public UserRepositoryTests()
    {
        _container = new MySqlBuilder()
            .WithDatabase("smeaccounting_test")
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _container.StartAsync();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseMySql(_container.GetConnectionString(), ServerVersion.AutoDetect(_container.GetConnectionString()))
            .Options;
        _context = new ApplicationDbContext(options);
        await _context.Database.MigrateAsync();
        _repo = new UserRepository(_context);
    }

    public async Task DisposeAsync() => await _container.DisposeAsync();

    [Fact]
    public async Task GetByUsernameAsync_ExistingUser_ReturnsUser()
    {
        var user = new User("testuser", "test@example.com", "hash", "Test", "User", Guid.NewGuid());
        _repo.Add(user);
        await _context.SaveChangesAsync();

        var found = await _repo.GetByUsernameAsync("testuser");
        found.Should().NotBeNull();
        found!.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task UsernameExistsAsync_ReturnsTrue_WhenExists()
    {
        var user = new User("existing", "e@test.com", "hash", "E", "U", Guid.NewGuid());
        _repo.Add(user);
        await _context.SaveChangesAsync();

        var exists = await _repo.UsernameExistsAsync("existing");
        exists.Should().BeTrue();
    }
}
```

**What to integration test in Infrastructure:**

| Component | Priority | Test Cases |
|---|---|---|
| UserRepository | Critical | CRUD, username/email uniqueness, refresh token lifecycle, login attempts aggregation |
| AccountRepository | Critical | GetRootAccountsAsync, hierarchy queries, code uniqueness |
| JournalEntryRepository | Critical | Period filter, date range, pagination, status transitions |
| RoleRepository | High | Permission resolution, hierarchy, feature access checks |
| OrganizationUnitRepository | Medium | Tree queries, parent/child |
| JwtTokenService | High | Token generation, validation, expiry |


### 4.5 Level 5 — API Integration Tests

**Goal:** Verify full HTTP pipeline — routing, auth, middleware, serialization, error handling.

**Tool:** WebApplicationFactory + Testcontainers

```csharp
public class AuthControllerTests : IClassFixture<SmeAccountingApiFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTests(SmeAccountingApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Username = "admin",
            Password = "Admin@123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var token = await response.Content.ReadFromJsonAsync<TokenResponse>();
        token.Should().NotBeNull();
        token!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_InvalidPassword_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            Username = "admin",
            Password = "wrong"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/auth/me");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
```

**Critical API journeys:**

| Endpoint | Tests |
|---|---|
| POST /api/auth/login | Valid, invalid creds, locked account, inactive account |
| POST /api/auth/refresh | Valid rotation, expired, replayed (double-use) |
| POST /api/auth/logout | Valid, already revoked |
| GET /api/auth/me | Authenticated, unauthenticated, deleted user |
| POST /api/auth/change-password | Valid, wrong current, weak new, reused |

### 4.6 Contract Tests

**Goal:** Verify external system integration contracts.

**Tool:** WireMock.NET / Pact

**Areas:**
- VNeID API contract (identity verification, member management)
- eTax API contract (tax declaration submission, receipt verification)
- eSigner/E-invoice provider contract (digital signature, invoice transmission)
- E-invoice XML schema validation (per NĐ 254/2026/NĐ-CP format)

```csharp
public class VNeIDContractTests
{
    [Fact]
    public async Task VerifyIdentity_ReturnsExpectedSchema()
    {
        var mockServer = WireMock.Server.Start();
        mockServer.Given(Request.Create().WithPath("/api/verify"))
            .RespondWith(Response.Create()
                .WithBodyAsJson(new { verified = true, level = "2" })
                .WithStatusCode(200));

        var client = new HttpClient { BaseAddress = new Uri(mockServer.Urls[0]) };
        var response = await client.PostAsJsonAsync("/api/verify", new { id = "test" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        // Validate response schema matches VNeID spec
    }
}
```

---

## 5. Regulatory Compliance Testing

Mandatory test areas per Vietnamese regulations:

| Regulation | Requirement | Test Approach |
|---|---|---|
| TT 99/2025/TT-BTC Điều 28 | Corrections must leave audit trail | Integration: verify AuditLog entries on every update |
| TT 99/2025/TT-BTC Điều 28 | Software must prevent intentional data tampering | Integration: verify direct DB modification detection |
| TT 99/2025/TT-BTC Điều 28 | Must provide data to competent authorities | Integration: verify data export API |
| TT 99/2025/TT-BTC Điều 28 | Must connect to e-invoice / e-signature systems | Contract: verify API contract with e-invoice provider |
| NĐ 69/2024/NĐ-CP | VNeID required for tax e-transactions | Integration: mock VNeID flow |
| NĐ 23/2025/NĐ-CP | Digital signature on tax declarations | Contract: verify eSigner integration |
| NĐ 254/2026/NĐ-CP | E-invoice XML format compliance | Contract: validate XML against XSD |
| Luật Kế toán Điều 26 | Accounting records preserve original values | Integration: verify OldValues captured |
| Luật Kế toán Điều 41 | Min 5-year retention | Unit: verify soft-delete, no hard-delete |

---

## 6. What NOT to Test

```
❌ Controllers — test via API integration (WebApplicationFactory), not unit tests
❌ Repository implementations — integration tests only (real DB)
❌ DI registration — if app starts, registrations work
❌ Simple DTOs with no logic — just properties
❌ Trivial delegation (method A calls method B, no branching)
❌ Third-party library behavior — FluentValidation, MediatR, EF Core internals
❌ Framework code — ASP.NET model binding, routing
❌ Code that requires 6+ mocks to test — refactor first
❌ Test framework internals — don't test xUnit or FluentAssertions

Signs of bad tests:
  ✗ Assertions never fail ("Expected: True, Actual: True" with no logic)
  ✗ Mocking DbContext directly (integration test instead)
  ✗ 10+ mocks per handler test (handler does too much)
  ✗ Tests that pass even when production code is broken
  ✗ Tests that fail on refactoring without behavior change
```

---

## 7. Coverage Goals & Measurement

| Metric | Target | Tool |
|---|---|---|
| Line coverage (Domain) | ≥ 90% | Coverlet |
| Branch coverage (Domain) | ≥ 80% | Coverlet |
| Line coverage (Application) | ≥ 80% | Coverlet |
| Line coverage (Infrastructure) | ≥ 60% (integration-heavy) | Coverlet |
| Overall line coverage | ≥ 75% | Coverlet |
| Error path coverage | ≥ 90% of known error paths | Manual audit |

### Coverlet Configuration

```xml
<PackageReference Include="coverlet.collector" Version="6.0.4">
  <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

```bash
dotnet test --collect:"XPlat Code Coverage" --settings coverlet.runsettings
```

### Quality Gates (CI)

| Gate | Pass Criteria |
|---|---|
| All unit tests pass | 100% |
| All architecture tests pass | 0 violations |
| Coverage >= 75% | Fails build if below |
| No security hotspots | 0 CA5351, CA2100, CA3001 warnings |
| All integration tests pass | 100% |
| SonarQube quality gate | Pass |

---

## 8. Test Project Structure

```
tests/
├── SmeAccounting.Architecture.Tests/      # NetArchTest rules
│   ├── LayerDependencyTests.cs
│   ├── NamingConventionTests.cs
│   └── SealingTests.cs
│
├── SmeAccounting.Domain.UnitTests/        # Domain logic, no mocks
│   ├── Entities/
│   │   ├── UserTests.cs
│   │   ├── AccountTests.cs
│   │   └── JournalEntryTests.cs
│   └── ValueObjects/
│       └── MoneyTests.cs
│
├── SmeAccounting.Application.UnitTests/   # Handler tests, mocked repos
│   ├── Security/
│   │   ├── LoginCommandHandlerTests.cs
│   │   ├── ChangePasswordCommandHandlerTests.cs
│   │   ├── RefreshTokenCommandHandlerTests.cs
│   │   └── GetCurrentUserQueryHandlerTests.cs
│   └── Accounts/
│       └── CreateAccountCommandHandlerTests.cs
│
├── SmeAccounting.IntegrationTests/        # Testcontainers + WebApplicationFactory
│   ├── Repositories/
│   │   ├── UserRepositoryTests.cs
│   │   ├── AccountRepositoryTests.cs
│   │   └── JournalEntryRepositoryTests.cs
│   ├── Controllers/
│   │   ├── AuthControllerTests.cs
│   │   └── AccountsControllerTests.cs
│   └── Audit/
│       └── AuditSaveChangesInterceptorTests.cs
│
├── SmeAccounting.ContractTests/           # WireMock.NET
│   ├── VNeIDContractTests.cs
│   ├── EInvoiceContractTests.cs
│   └── ESignerContractTests.cs
│
└── SmeAccounting.SecurityTests/           # Penetration-style tests
    ├── JwtTokenValidationTests.cs
    └── PermissionAuthorizationTests.cs
```

---

## 9. Test Data Strategy

| Approach | Used For | Details |
|---|---|---|
| **Builders** (Test Data Builder pattern) | Domain unit tests | `new UserBuilder().WithUsername("test").Build()` |
| **Seed data** | Integration tests | `DatabaseFixture` contains static seed data (admin user, roles, chart of accounts) |
| **AutoFixture** | Handler tests | Auto-generate valid DTOs for commands |
| **Bogus/Faker** | Contract tests | Generate realistic Vietnamese names, tax IDs, addresses |

```csharp
// Builder pattern example
public class UserBuilder
{
    private string _username = "defaultuser";
    private string _email = "default@test.com";
    // ...

    public UserBuilder WithUsername(string username)
    {
        _username = username;
        return this;
    }

    public User Build() => new(_username, _email, "hash", "First", "Last", Guid.NewGuid());
}
```

---

## 10. Entry & Exit Criteria

### Entry Criteria (per release)

- [ ] All unit tests pass
- [ ] All architecture tests pass
- [ ] Code coverage >= 75%
- [ ] No critical/blocker SonarQube issues
- [ ] Integration tests pass against real DB (Testcontainers)
- [ ] Security scan complete (no high severity)
- [ ] Regulatory compliance checklist verified
- [ ] Code review completed

### Exit Criteria (per release)

- [ ] All planned test cases executed
- [ ] 0 open critical defects
- [ ] < 5 open high defects (all risk-assessed)
- [ ] Regression test pass rate >= 99%
- [ ] Performance benchmarks met (NFRs)
- [ ] Compliance audit report generated
- [ ] Test summary report delivered

---

## 11. Tooling & Infrastructure

| Tool | Version | Purpose |
|---|---|---|
| xUnit | Latest | Test framework |
| FluentAssertions | Latest | Readable assertions |
| NSubstitute | Latest | Mocking |
| Testcontainers.MySql | Latest | Real DB integration tests |
| Microsoft.AspNetCore.Mvc.Testing | Built-in | API test host |
| WireMock.NET | Latest | Contract testing |
| Coverlet | Latest | Code coverage |
| ReportGenerator | Latest | Coverage HTML reports |
| NetArchTest | Latest | Architecture rule enforcement |
| SonarAnalyzer.CSharp | Latest | Static analysis |
| Bogus | Latest | Fake data generation |

---

## 12. Defect Lifecycle

```
Discovery → Triage → Assign → Fix → Verify → Close

States: New → Triaged → In Progress → Fixed → Verified → Closed
       ↗ Reopened ↘ Rejected

SLAs:
  Critical:   Triage < 2h, Fix < 8h
  High:       Triage < 4h, Fix < 24h
  Medium:     Triage < 24h, Fix < 72h
  Low:        Triage < 1w, Fix next sprint

Severity:
  Critical: Data loss, security breach, regulatory violation
  High:     Core feature broken, no workaround
  Medium:   Feature broken with workaround, non-core
  Low:      Cosmetic, minor UX
```

---

## 13. CI Pipeline

```yaml
# .github/workflows/test.yml
jobs:
  architecture-tests:
    run: dotnet test tests/SmeAccounting.Architecture.Tests  # Fastest, run first

  unit-tests:
    needs: architecture-tests
    run: dotnet test tests/SmeAccounting.Domain.UnitTests
    run: dotnet test tests/SmeAccounting.Application.UnitTests
    with-coverage: dotnet test --collect:"XPlat Code Coverage"

  integration-tests:
    needs: unit-tests
    run: dotnet test tests/SmeAccounting.IntegrationTests  # Uses Testcontainers

  sonarqube:
    needs: integration-tests
    run: sonar-scanner  # Quality gate check

  publish:
    needs: [sonarqube, integration-tests]
    # Only if all quality gates pass
```

---

## 14. Exclusions & Assumptions

**Excluded from first version:**
- Playwright/Selenium browser E2E tests (Blazor UI tested manually)
- Performance/load testing (separate phase)
- Chaos engineering

**Assumptions:**
- MySQL database (via Pomelo.EntityFrameworkCore.MySql)
- Docker available in CI (for Testcontainers)
- SonarQube server available for quality gates
- VNeID/eTax/eSigner APIs available for contract testing

---

## 15. Delivery Schedule

| Phase | Duration | Deliverables |
|---|---|---|
| P0: Foundation | Sprint 1 | Architecture tests, test project structure, CI pipeline, Domain tests (User, Account, JournalEntry) |
| P1: Core | Sprint 2-3 | All Domain tests, all Application handler tests, Auth API tests |
| P2: Infrastructure | Sprint 4 | Repository integration tests with Testcontainers, audit trail tests |
| P3: Compliance | Sprint 5 | VNeID/eTax/e-invoice contract tests, regulatory audit tests |
| P4: Hardening | Sprint 6 | Security tests, edge cases, coverage analysis, test documentation |
