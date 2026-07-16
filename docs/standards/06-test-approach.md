# Test Approach — SmeAccounting

**Version:** 1.0  
**Date:** 2026-07-16  
**Standard:** ISO/IEC/IEEE 29119-3 (Test Documentation)

---

## 1. Test Design Techniques

| Technique | When | Example |
|---|---|---|
| **Equivalence Partitioning** | Input has ranges/classes | Account code length: valid (3-15 chars), invalid (< 3, > 15) |
| **Boundary Value Analysis** | Edge cases of partitions | Account code: 3, 4, 14, 15 chars |
| **Decision Table** | Multiple condition combinations | Login: {valid user, valid pw} → success; {valid user, wrong pw} → failure; {locked user, valid pw} → failure; {inactive user, valid pw} → failure |
| **State Transition** | Entity status changes | JournalEntry: Draft → Posted → Reversed (invalid: Draft → Reversed) |
| **Pairwise** | Many input combos, few failures | Filter combinations on journal entry list |
| **Cause-Effect Graphing** | Business rules with complex conditions | VNeID auth level + role + company membership → access decision |
| **Error Guessing** | Known patterns | SQL injection on username, XSS on display name |

### 1.1 Technique Selection Matrix

| Test Level | Primary Technique | Secondary |
|---|---|---|
| Domain unit | Equivalence Partitioning, Boundary Value, State Transition | Decision Table, Error Guessing |
| Application handler | Decision Table, State Transition | Equivalence Partitioning |
| Architecture | Checklist-based | — |
| Integration | State Transition, Classification Tree | Pairwise, Error Guessing |
| API | Use Case Testing, Decision Table | Boundary Value |
| Contract | Checklist-based (per spec) | — |
| Security | Attack-based, Threat Modeling | Fuzz |

---

## 2. Test Types by Objective

### 2.1 Functional Testing

| Sub-type | Scope | Technique |
|---|---|---|
| Correctness | Every handler returns expected Result/Failure | Decision Table |
| Input validation | FluentValidation rules for each command/query | EP + BVA |
| Error handling | All error paths return proper ProblemDetails | Error Guessing |
| State transitions | JournalEntry status lifecycle | State Transition |
| Data integrity | Audit trail matches entity changes | Decision Table |
| Boundary behavior | Account code limits, money precision, date ranges | BVA |

### 2.2 Non-Functional Testing

| Sub-type | Approach | Tool |
|---|---|---|
| Performance | Key API endpoints under load (separate phase) | k6 (planned) |
| Security | JWT validation, permission bypass, SQL injection, XSS | Integration + static analysis (SonarQube) |
| Concurrency | Same journal entry modified by 2 users | Integration with parallel requests |
| Recovery | DB connection drop, service restart | Integration (Testcontainers lifecycle) |
| Compatibility | .NET 10 version correctness | Build-time |

### 2.3 Structural Testing

| Sub-type | Approach |
|---|---|
| Statement coverage | Every line executed (Domain: ≥ 90%) |
| Branch coverage | Every if/else/switch case (Domain: ≥ 80%) |
| Condition coverage | Every boolean sub-expression (complex predicates) |
| Path coverage | Every linear code sequence (critical methods only) |
| Data flow testing | def-use pairs for Money arithmetic, audit trail accumulation |

---

## 3. Test Case Templates

### 3.1 Unit Test Template (Domain)

```
File: tests/SmeAccounting.Domain.UnitTests/Entities/JournalEntryTests.cs

Test: Post_BalancedEntry_SetsPostedStatus
  Arrange:
    Account a1 = new("1111", "Cash", Asset)
    Account a2 = new("4111", "Revenue", Liability)
    JournalEntry entry = new("REF001", DateTime.Today, "Test")
    entry.AddLine(a1, 100_000m, null)
    entry.AddLine(a2, null, 100_000m)
  Act:
    entry.Post()
  Assert:
    entry.Status == Posted
    entry.PostedAt != null
    a1.Balance == 100000
    a2.Balance == -100000

Test: Post_UnbalancedEntry_ThrowsInvalidOperation
  Arrange:
    JournalEntry entry = new("REF002", DateTime.Today, "Unbalanced")
    entry.AddLine(accountAsset, 100_000m, null)
    entry.AddLine(accountLiability, null, 50_000m)
  Act:
    Action act = () => entry.Post()
  Assert:
    act throws InvalidOperationException("Journal entry is not balanced")
```

### 3.2 Integration Test Template

```
File: tests/SmeAccounting.IntegrationTests/Controllers/AuthControllerTests.cs

Fixture: SmeAccountingApiFactory
  - Spins up Testcontainers.MySql
  - Runs EF Core migrations
  - Seeds: admin user (Admin@123), reader role, admin role

Test: Login_WithValidAdminCredentials_Returns200WithToken
  Arrange:
    HttpClient client = factory.CreateClient()
    var payload = new { Username = "admin", Password = "Admin@123" }
  Act:
    HttpResponseMessage response = await client.PostAsJsonAsync("/api/auth/login", payload)
  Assert:
    response.StatusCode == 200
    TokenResponse body = await response.Content.ReadFromJsonAsync<TokenResponse>()
    body.AccessToken matches JWT pattern
    body.RefreshToken is not null
    body.ExpiresAt > now

Test: Login_WithWrongPassword_Returns401
  Arrange:
    HttpClient client = factory.CreateClient()
    var payload = new { Username = "admin", Password = "wrong" }
  Act:
    HttpResponseMessage response = await client.PostAsJsonAsync("/api/auth/login", payload)
  Assert:
    response.StatusCode == 401
```

### 3.3 Contract Test Template

```
File: tests/SmeAccounting.ContractTests/EInvoiceContractTests.cs

Test: SubmitInvoice_ReturnsAcceptedResponse
  Mock: EInvoiceProvider API (WireMock.NET)
    Request: POST /api/invoices
      Body matches e-invoice XML schema
      Auth header valid
    Response: 202 Accepted
      Body: { "invoiceId": "INV001", "status": "Pending", "submittedAt": "..." }
  
  Arrange:
    WireMock server stubs the POST
    EInvoiceService service = new(server.Url, httpClient)
    InvoiceXml invoice = BuildSampleInvoice()
  Act:
    SubmissionResult result = await service.SubmitAsync(invoice)
  Assert:
    result.Status == SubmissionStatus.Accepted
    result.InvoiceId == "INV001"
    WireMock verifies request body matches XSD schema
```

---

## 4. Assertion Philosophy

```csharp
// GOOD: Behavior assertion — test what, not how
result.IsSuccess.Should().BeTrue();
result.Value.Username.Should().Be("admin");

// BAD: Fragile internal assertion
user.Status.Should().Be(UserStatus.Active);  // May change — test behavior not status

// GOOD: Verify correct method called on mock
jwtService.Received(1).GenerateToken(user, Arg.Any<CancellationToken>());

// BAD: Over-specification
jwtService.Received(1)
    .GenerateToken(Arg.Is<User>(u => u.Id == userId && u.Username == "admin"),
        Arg.Any<CancellationToken>());  // Tests implementation details

// ALWAYS: Test error paths first
[Fact]
public void CannotCreateUser_WithEmptyUsername()
{
    Action act = () => new User("", "email@test.com", "hash", "F", "L", Guid.NewGuid());
    act.Should().Throw<ArgumentException>();
}
```

### 4.1 Assertion Library Configuration

```csharp
// Use FluentAssertions globally — no Xunit.Assert calls
global using FluentAssertions;
```

---

## 5. Isolation Strategy

| Test Level | Isolation Mechanism | Why |
|---|---|---|
| Domain unit | No I/O, no mocks | Pure logic, fast, trustworthy |
| Application handler | NSubstitute for all dependencies | Verify orchestration, fast |
| Architecture | Static assembly reflection | No runtime dependencies |
| Integration | Testcontainers (real DB) each class | Deterministic, no shared state |
| API | WebApplicationFactory + Testcontainers | Full pipeline validation |
| Contract | WireMock.NET http stubs | No real external dependency |

### 5.1 What Isolation Means per Level

```csharp
// Domain Unit — ZERO dependencies
[Fact]
public void Money_Add_SameCurrency_ReturnsSum()
{
    var a = new Money(100, "VND");
    var b = new Money(50, "VND");
    (a + b).Should().Be(new Money(150, "VND"));
}

// Application Handler — mocked repos only
[Fact]
public async Task Login_Success_ReturnsToken()
{
    userRepo.GetByUsernameAsync(username, default).Returns(user);
    passwordHasher.VerifyHashedPassword(user, password).Returns(true);
    tokenService.GenerateToken(user, default).Returns(tokenResult);

    var result = await handler.Handle(cmd, default);

    result.IsSuccess.Should().BeTrue();
    tokenService.Received(1).GenerateToken(Arg.Any<User>(), Arg.Any<CancellationToken>());
}

// Integration — real DB via Testcontainer
[Fact]
public async Task User_WhenCreated_IsPersisted()
{
    var user = new UserBuilder().Build();
    repo.Add(user);
    await context.SaveChangesAsync();

    var saved = await repo.GetByUsernameAsync(user.Username);
    saved.Should().NotBeNull();
}
```

---

## 6. Regulatory Test Design

### 6.1 Audit Trail — Detection Test

Verifies audit trail captures every data change with old + new values.

```csharp
[Theory]
[InlineData("Username", "oldName", "newName")]
[InlineData("Email", "old@test.com", "new@test.com")]
[InlineData("Status", "Active", "Inactive")]
public void UpdateUserProperty_CreatesAuditEntry(string property, string oldVal, string newVal)
{
    var user = new UserBuilder.WithUsername("oldName").Build();
    var entry = new AuditEntry(user.Id, "User", property, oldVal, newVal, AuditAction.Update);

    entry.EntityId.Should().Be(user.Id);
    entry.PropertyName.Should().Be(property);
    entry.OldValue.Should().Be(oldVal);
    entry.NewValue.Should().Be(newVal);
    entry.Action.Should().Be(AuditAction.Update);
}
```

### 6.2 Tax Calculation — Decision Table

| Tình huống | Doanh thu | Chi phí | VAT đầu ra | VAT đầu vào | Kết quả |
|---|---|---|---|---|---|
| Mua hàng có VAT | — | 10.000.000 | — | 1.000.000 | Phải trả 11.000.000 |
| Bán hàng có VAT | 20.000.000 | — | 2.000.000 | — | Phải thu 22.000.000 |
| Mua hàng không VAT | — | 10.000.000 | — | — | Phải trả 10.000.000 |
| Chiết khấu | -1.000.000 | — | -100.000 | — | Phải thu -1.100.000 |

### 6.3 VNeID Integration — State Transition

```
ManualCreate ──→ PendingVNeID ──→ VNeIDVerified (eID Level 2)
                                    ↕
                              VNeIDFailed ──→ ManualFulfillment
```

Verify: user created via VNeID cannot bypass verification; expired eID re-prompts.

---

## 7. Naming Conventions

```csharp
// Test class: [Entity/Handler]Tests
public class UserTests { }

// Test method: [Action]_[Scenario]_[ExpectedResult]
public void Login_InvalidPassword_ReturnsFailure()
public void Post_BalancedEntry_SetsStatusPosted()
public void MoveTo_SameId_ThrowsInvalidOperation()

// Test file: matches class name
UserTests.cs

// Test data builder: [Entity]Builder
public class UserBuilder { }
```

---

## 8. Code Review Checklist for Tests

- [ ] Test name follows `Method_Scenario_Expected` convention
- [ ] Arrange/Act/Assert sections separated by blank lines
- [ ] No `Thread.Sleep` or `Task.Delay`
- [ ] No `[Fact(Skip = "...")]` — delete or fix
- [ ] No `var` for `ActionResult` types (use explicit type)
- [ ] No multiple asserts that mask each other (use separate tests)
- [ ] No hardcoded dates (use `DateTime.Today` or builder defaults)
- [ ] No leaking DB connection strings or secrets
- [ ] Every test is deterministic (no random seeds without seed value)
- [ ] No mocking `DbContext` — use integration tests instead
