# Security & Exception Handling Standards

---

## 1. Authentication & Authorization

### JWT Token Configuration

| Parameter | Value | Rationale |
|---|---|---|
| Algorithm | HMAC-SHA256 | Industry standard |
| Access token expiry | 15 min | Short-lived, minimizes theft impact |
| Refresh token expiry | 7 days | Balance UX + security |
| Max active sessions | 3 | Prevent token abuse |
| Clock skew | 0 | Strict validation |

### Required Validation

```csharp
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuerSigningKey = true,    // REQUIRED
    IssuerSigningKey = key,              // REQUIRED
    ValidateIssuer = true,               // REQUIRED
    ValidIssuer = issuer,               // Match configured value
    ValidateAudience = true,             // REQUIRED
    ValidAudience = audience,            // Match configured value
    ValidateLifetime = true,             // REQUIRED
    ClockSkew = TimeSpan.Zero,          // REQUIRED — no tolerance
};
```

### Password Policy

| Parameter | Minimum | Notes |
|---|---|---|
| Length | 8 chars | 128 max |
| Uppercase | >= 1 | |
| Lowercase | >= 1 | |
| Digit | >= 1 | |
| Special char | >= 1 | |
| History | 10 passwords | Prevent reuse |
| Lockout | 5 attempts / 15 min | Configurable |
| Hash | PBKDF2-SHA512, 100K iterations | Current standard |

### Rate Limiting (MUST Implement)

- Login endpoint: 5 requests/min per IP
- Refresh token: 10 requests/min
- Password change: 3 requests/min per user

---

## 2. Password Storage

```csharp
// CURRENT STANDARD — PBKDF2-SHA512 with 100K iterations
// GOOD
var salt = RandomNumberGenerator.GetBytes(16);
var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA512, 32);

// DO NOT USE
var hash = MD5.HashData(password);          // FORBIDDEN — CA5351
var hash = SHA256.HashData(password);       // FORBIDDEN — no salt
var hash = BCrypt.Net.BCrypt.Hash(password); // If added, acceptable
```

---

## 3. Exception Handling

### Hierarchy

```csharp
// Application exceptions (business logic failures)
public abstract class ApplicationException : Exception
{
    public string Code { get; }
    protected ApplicationException(string code, string message) : base(message)
    {
        Code = code;
    }
}

public class NotFoundException : ApplicationException
{
    public NotFoundException(string resource) : base("NOT_FOUND", $"{resource} not found") { }
}

public class ValidationException : ApplicationException
{
    public IReadOnlyList<string> Errors { get; }
    public ValidationException(IReadOnlyList<string> errors) : base("VALIDATION", "Validation failed")
    {
        Errors = errors;
    }
}
```

### Global Exception Handler

```csharp
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var result = exception switch
        {
            NotFoundException => Results.Problem(detail: exception.Message, statusCode: 404),
            ValidationException ve => Results.Problem(detail: string.Join("; ", ve.Errors), statusCode: 400),
            _ => Results.Problem(detail: "Internal server error", statusCode: 500)
        };
        await result.ExecuteAsync(context);
    });
});
```

### What to NOT Catch

```csharp
// FORBIDDEN — catches everything
try { ... }
catch (Exception ex) { return Result.Fail(ex.Message); }

// GOOD — catch specific, expected failures
try { ... }
catch (DbUpdateConcurrencyException ex)
{
    return Result.Fail("Data was modified by another user. Refresh and retry.");
}
```

---

## 4. Audit Trail (Regulatory Requirement per TT 99/2025/TT-BTC)

### EF Core Interceptor

```csharp
public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        var context = eventData.Context;
        if (context is null) return base.SavingChangesAsync(eventData, result, ct);

        var entries = context.ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted);

        foreach (var entry in entries)
        {
            // Capture OldValues + NewValues before save
            // Store in AuditLog table
        }

        return base.SavingChangesAsync(eventData, result, ct);
    }
}
```

**Rules:**
- All entity modifications must produce audit record
- Must capture: OldValues, NewValues, UserId, Timestamp, IP, UserAgent
- Corrections must preserve original values (no silent modification)
- Never allow hard-delete of accounting data — use soft-delete

---

## 5. SQL Injection Prevention

```csharp
// GOOD — parameterized, never raw SQL
var user = await _context.Users
    .FirstOrDefaultAsync(u => u.Username == username, ct);

// FORBIDDEN — string concatenation
var sql = $"SELECT * FROM Users WHERE Username = '{username}'";
var user = await _context.Users.FromSqlRaw(sql).ToListAsync();

// EXCEPTION — EF Core raw SQL with parameters
var users = await _context.Users
    .FromSql($"SELECT * FROM Users WHERE Username = {username}")
    .ToListAsync();
```

---

## 6. Logging Standards

```csharp
// GOOD — structured logging with Serilog
_logger.LogInformation("User {UserId} logged in from {IpAddress}", userId, ipAddress);

// BAD — string interpolation (loses structured data)
_logger.LogInformation($"User {userId} logged in from {ipAddress}");

// DO NOT LOG
// - Passwords (even hashed)
// - Full credit card numbers
// - Personal secrets
// - JWT secrets or signing keys
```

---

## 7. Data Protection

- All connection strings in User Secrets / Key Vault, never in code
- JWT signing key: min 256 bits, rotated every 90 days
- Refresh tokens: cryptographically random (64 bytes via `RandomNumberGenerator`)
- CORS: restrict to known origins in PROD
- HTTPS: REQUIRED in PROD, HSTS enabled

---

## 8. Configuration Secrets

```json
// appsettings.Development.json — OK for dev defaults
// appsettings.Production.json — MUST NOT include secrets

// User Secrets (dev) or Azure Key Vault / HashiCorp Vault (prod)
{
  "Jwt": {
    "Secret": "from-user-secrets-or-vault",
    "Issuer": "SmeAccounting",
    "Audience": "SmeAccounting"
  },
  "ConnectionStrings": {
    "DefaultConnection": "from-user-secrets-or-vault"
  }
}
```
