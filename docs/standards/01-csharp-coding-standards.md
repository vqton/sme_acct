# C# Coding Standards — SmeAccounting

**Version:** 1.0  
**Date:** 2026-07-16  
**Author:** Solution Architect (20+ yrs)  
**Sources:** Microsoft .NET docs, dotnet/runtime, Roslyn analyzers, SonarSource, .NET community

---

## 1. Tooling Setup (MUST)

### 1.1 Directory.Build.props (Solution Root)

Create `Directory.Build.props` at solution root. Applies to all projects automatically:

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <CodeAnalysisTreatWarningsAsErrors>true</CodeAnalysisTreatWarningsAsErrors>
    <AnalysisLevel>latest-all</AnalysisLevel>
    <AnalysisMode>All</AnalysisMode>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <AccelerateBuildsInVisualStudio>true</AccelerateBuildsInVisualStudio>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Meziantou.Analyzer" Version="2.0.257">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="SonarAnalyzer.CSharp" Version="10.16.0">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Roslynator.Analyzers" Version="4.14.1">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>
</Project>
```

Test projects additionally reference `xunit.analyzers`.

### 1.2 .editorconfig (Solution Root)

Create `.editorconfig` at solution root. Enforced at build time.

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 4
insert_final_newline = true
trim_trailing_whitespace = true
end_of_line = lf

[*.cs]
# === NAMING RULES ===
# Interface: I prefix
dotnet_naming_rule.interface_should_be_ipascal.severity = error
dotnet_naming_rule.interface_should_be_ipascal.symbols = interface
dotnet_naming_rule.interface_should_be_ipascal.style = ipascal
dotnet_naming_symbols.interface.applicable_kinds = interface
dotnet_naming_style.ipascal.capitalization = pascal_case
dotnet_naming_style.ipascal.required_prefix = I

# Private fields: _camelCase
dotnet_naming_rule.private_fields_underscored.severity = error
dotnet_naming_rule.private_fields_underscored.symbols = private_fields
dotnet_naming_rule.private_fields_underscored.style = underscored
dotnet_naming_symbols.private_fields.applicable_kinds = field
dotnet_naming_symbols.private_fields.applicable_accessibilities = private
dotnet_naming_style.underscored.capitalization = camel_case
dotnet_naming_style.underscored.required_prefix = _

# Private static fields: s_camelCase
dotnet_naming_rule.private_static_fields.severity = error
dotnet_naming_rule.private_static_fields.symbols = private_static_fields
dotnet_naming_rule.private_static_fields.style = static_prefix
dotnet_naming_symbols.private_static_fields.applicable_kinds = field
dotnet_naming_symbols.private_static_fields.applicable_accessibilities = private
dotnet_naming_symbols.private_static_fields.required_modifiers = static
dotnet_naming_style.static_prefix.capitalization = camel_case
dotnet_naming_style.static_prefix.required_prefix = s_

# Async methods: Async suffix
dotnet_naming_rule.async_methods_end_in_async.severity = error
dotnet_naming_rule.async_methods_end_in_async.symbols = any_async_methods
dotnet_naming_rule.async_methods_end_in_async.style = end_in_async
dotnet_naming_symbols.any_async_methods.applicable_kinds = method
dotnet_naming_symbols.any_async_methods.required_modifiers = async
dotnet_naming_style.end_in_async.required_suffix = Async
dotnet_naming_style.end_in_async.capitalization = pascal_case

# Public members: PascalCase
dotnet_naming_rule.public_members_should_be_pascal.severity = error
dotnet_naming_rule.public_members_should_be_pascal.symbols = public_members
dotnet_naming_rule.public_members_should_be_pascal.style = pascal
dotnet_naming_symbols.public_members.applicable_kinds = class, struct, enum, property, method, event, delegate, record
dotnet_naming_symbols.public_members.applicable_accessibilities = public, internal, protected, protected_internal
dotnet_naming_style.pascal.capitalization = pascal_case

# === STYLE RULES ===
# Braces: Allman style
csharp_prefer_braces = true:error
csharp_prefer_simple_using_statement = true:suggestion
csharp_style_namespace_declarations = file_scoped:error
csharp_style_prefer_primary_constructors = true:suggestion
csharp_style_prefer_null_check_over_type_check = true:suggestion
csharp_style_throw_expression = true:suggestion
csharp_style_conditional_delegate_call = true:suggestion
csharp_style_prefer_local_over_anonymous_function = true:suggestion
csharp_style_prefer_method_group_conversion = true:suggestion

# Expression-bodied members
csharp_style_expression_bodied_properties = true:suggestion
csharp_style_expression_bodied_indexers = true:suggestion
csharp_style_expression_bodied_accessors = true:suggestion
csharp_style_expression_bodied_lambdas = true:suggestion

# var preferences
csharp_style_var_for_built_in_types = false:warning
csharp_style_var_when_type_is_apparent = true:suggestion
csharp_style_var_elsewhere = false:silent

# Modifier preferences
dotnet_style_require_accessibility_modifiers = for_non_interface_members:error
dotnet_style_readonly_field = true:warning

# this. preferences
dotnet_style_qualification_for_field = false:warning
dotnet_style_qualification_for_property = false:warning
dotnet_style_qualification_for_method = false:warning
dotnet_style_qualification_for_event = false:warning

# Language keywords
dotnet_style_predefined_type_for_locals_parameters_members = true:error
dotnet_style_predefined_type_for_member_access = true:error

# Expression-level
dotnet_style_coalesce_expression = true:warning
dotnet_style_null_propagation = true:warning
dotnet_style_object_initializer = true:suggestion
dotnet_style_collection_initializer = true:suggestion
dotnet_style_explicit_tuple_names = true:warning
dotnet_style_prefer_auto_properties = true:warning
dotnet_style_prefer_compound_assignment = true:suggestion
dotnet_style_prefer_conditional_expression_over_assignment = true:silent
dotnet_style_prefer_conditional_expression_over_return = true:silent
dotnet_style_prefer_is_null_check_over_reference_equality_method = true:warning

# Pattern matching
csharp_style_pattern_matching_over_is_with_cast_check = true:suggestion
csharp_style_pattern_matching_over_as_with_null_check = true:suggestion
csharp_style_pattern_matching = true:suggestion

# === FORMATTING ===
csharp_new_line_before_open_brace = all
csharp_new_line_before_else = true
csharp_new_line_before_catch = true
csharp_new_line_before_finally = true
csharp_new_line_before_members_in_object_initializers = true
csharp_new_line_before_members_in_anonymous_types = true

csharp_indent_case_contents = true
csharp_indent_switch_labels = true
csharp_indent_labels = no_change

csharp_space_after_cast = false
csharp_space_after_keywords_in_control_flow_statements = true
csharp_space_before_colon_in_inheritance_clause = true
csharp_space_after_colon_in_inheritance_clause = true
csharp_space_around_binary_operators = before_and_after

csharp_preserve_single_line_blocks = true
csharp_preserve_single_line_statements = false

# === QUALITY RULES (Enforce as error) ===
# Cyclomatic complexity
dotnet_code_quality.CA1502.api_surface = public
dotnet_diagnostic.CA1502.severity = warning
dotnet_code_quality.CA1502.threshold = 15

# Class coupling
dotnet_diagnostic.CA1506.severity = warning
dotnet_code_quality.CA1506.threshold = 30

# Unused parameters
dotnet_code_quality_unused_parameters = non_public:warning

# Security
dotnet_diagnostic.CA2100.severity = error     # SQL injection
dotnet_diagnostic.CA3001.severity = error     # XSS
dotnet_diagnostic.CA3003.severity = error     # Path traversal
dotnet_diagnostic.CA3006.severity = error     # Command injection
dotnet_diagnostic.CA5350.severity = error     # Weak crypto
dotnet_diagnostic.CA5351.severity = error     # Broken crypto
dotnet_diagnostic.CA5369.severity = warning   # XML deserialization

# Performance
dotnet_diagnostic.CA1845.severity = warning   # Span-based string concat
dotnet_diagnostic.CA1846.severity = warning   # AsSpan over Substring
dotnet_diagnostic.CA1852.severity = warning   # Seal internal types

# === SUPPRESSIONS (per-project overrides in child .editorconfig) ===
# CS1591: XML doc not required on private/internal but should be configured per-project
dotnet_diagnostic.CS1591.severity = suggestion

# Tests overrides in tests/.editorconfig
[src/SmeAccounting.Tests/**/*.cs]
dotnet_diagnostic.CS1591.severity = none
dotnet_diagnostic.CA1502.severity = none
dotnet_diagnostic.CA1506.severity = none
dotnet_diagnostic.SA1600.severity = none
dotnet_naming_rule.async_methods_end_in_async.severity = suggestion
```

---

## 2. Naming Conventions

### 2.1 Quick Reference

| Element | Convention | Example | Rule |
|---|---|---|---|
| Namespace | `PascalCase`, file-scoped | `SmeAccounting.Domain.Entities` | ENFORCED |
| Class / Record | `PascalCase` | `User`, `Company` | ENFORCED |
| Interface | `I` + `PascalCase` | `IUserRepository` | ENFORCED |
| Method | `PascalCase`, verb/verb-phrase | `GetByIdAsync` | ENFORCED |
| Property | `PascalCase`, noun/adjective | `FullName`, `IsActive` | ENFORCED |
| Private field | `_camelCase` | `_userRepo`, `_context` | ENFORCED |
| Private static field | `s_camelCase` | `s_defaultPolicy` | ENFORCED |
| Constant (any scope) | `PascalCase` | `MaxLoginAttempts` | ENFORCED |
| Method parameter | `camelCase` | `string username` | ENFORCED |
| Local variable | `camelCase` | `var user = ...` | ENFORCED |
| Async method suffix | `Async` | `SaveChangesAsync` | ENFORCED |
| Enum values | `PascalCase` | `AccountType.Asset` | ENFORCED |
| Type parameter | `T` or `TPrefix` | `TEntity`, `TId` | GUIDELINE |

### 2.2 What NOT to Do

- No Hungarian notation (`strName`, `intCount`)
- No underscores in public members (`User_Name` -> `UserName`)
- No abbreviations except widely known (`Id`, `Json`, `Xml`, `Io`, `Db`)
- No single-letter names except loop counters (`i`, `j`) or type params (`T`)
- No `m_` prefix (legacy C++ style)

---

## 3. Language Conventions

### 3.1 File Structure Order

```
1. using directives (outside namespace, alphabetical, System.* first)
2. File-scoped namespace declaration
3. Type declaration
4. Members (ordered by convention below)
```

### 3.2 Type Member Order

Within a type, order by:

1. Constants
2. Static fields
3. Private fields
4. Constructors (primary constructor preferred)
5. Properties
6. Methods (public -> internal -> protected -> private)
7. Events
8. Nested types

### 3.3 Access Modifier Order

```
[public | internal | protected | private] [static] [readonly] [virtual | override | abstract] [async]
```

### 3.4 Braces (Allman Style)

```csharp
// GOOD
public void Method()
{
    DoSomething();
}

// BAD
public void Method() {
    DoSomething();
}
```

Single-statement blocks: braces required unless ALL branches fit one line.

```csharp
// GOOD — all branches one line
if (x == 0) return;

// GOOD — mixed branches require braces everywhere
if (x == 0)
{
    return;
}
else
{
    DoSomething();
    return;
}

// BAD — mixed
if (x == 0) return;
else
{
    DoSomething();
}
```

### 3.5 Nullable Reference Types

```csharp
// GOOD
string? name;
string nonNull = "hello";
public User? GetUser(Guid id) => ...

// ALWAYS use 'is null' / 'is not null', never '== null'
if (user is null) return;
if (user is not null) return;

// DO NOT use '== null' or '!= null'
```

### 3.6 `var` Usage

```csharp
// GOOD — type obvious from right side
var user = new User(...);
var stream = new FileStream(...);
var list = new List<string>();
var dict = new Dictionary<string, int>();

// GOOD — LINQ queries and anonymous types
var result = users.Where(u => u.IsActive).ToList();

// BAD — type not obvious
var user = GetUser(id);       // Use explicit type: User user = GetUser(id);
var data = ParseData(input);  // Use explicit type
```

### 3.7 Pattern Matching

```csharp
// GOOD
if (user is { IsActive: true, Roles.Count: > 0 }) ...

// GOOD — switch expression
var result = account.Type switch
{
    AccountType.Asset or AccountType.Expense => EntryType.Debit,
    AccountType.Liability or AccountType.Equity => EntryType.Credit,
    _ => EntryType.Debit
};

// BAD — is + cast pattern
if (obj is User) { var user = (User)obj; ... }

// GOOD — pattern match
if (obj is User user) ...
```

### 3.8 Primary Constructors

```csharp
// GOOD — simple initialization
public class UserService(IUserRepository userRepo) : IUserService
{
    public async Task<User?> GetByIdAsync(Guid id) =>
        await userRepo.GetByIdAsync(id);
}

// GOOD — with validation, use traditional constructor
public class Account
{
    private readonly string _code;

    public Account(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Code required", nameof(code));
        _code = code;
    }
}
```

### 3.9 `nameof` over String Literals

```csharp
// GOOD
throw new ArgumentNullException(nameof(id));
ArgumentNullException.ThrowIfNullOrEmpty(username);

// BAD
throw new ArgumentNullException("id");
```

### 3.10 Collection Expressions (C# 12+)

```csharp
// GOOD
int[] numbers = [1, 2, 3];
List<string> names = ["Alice", "Bob"];
int[] combined = [..first, ..second];

// BAD (old style)
int[] numbers = new int[] { 1, 2, 3 };
List<string> names = new List<string> { "Alice", "Bob" };
```

---

## 4. Architecture Conventions

### 4.1 Layer Rules (Clean Architecture)

```
Web (Controllers) -> Application (CQRS) -> Domain (Entities)
Infrastructure (Persistence) -> Domain (Interfaces)
```

- **Domain**: Zero dependencies. No EF Core, no MediatR, no FluentResults.
- **Application**: Depends only on Domain. Pure CQRS via MediatR.
- **Infrastructure**: Depends on Application. Implements Domain interfaces.
- **Web**: Depends on Application + Infrastructure. Top-level entry point.

### 4.2 Dependency Injection

```csharp
// GOOD — centralized in layer's DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<IAssemblyMarker>());
        return services;
    }
}

// BAD — service registration scattered across controllers
```

### 4.3 Records for DTOs and Commands

```csharp
// GOOD — immutable DTOs
public record UserDto(Guid Id, string Username, string Email);

// GOOD — command/query records
public record GetUserQuery(Guid UserId) : IRequest<Result<UserDto>>;

// AVOID — mutable DTOs with get/set (unless EF entity)
```

### 4.4 Result Pattern

Use `FluentResults` for all command/query results. Never return `null`, never throw for expected failures.

```csharp
// GOOD
public async Task<Result<UserDto>> Handle(GetUserQuery query, CancellationToken ct)
{
    var user = await _userRepo.GetByIdAsync(query.UserId, ct);
    if (user is null)
        return Result.Fail("User not found");
    return Result.Ok(new UserDto(user.Id, ...));
}

// BAD
public UserDto? Handle(GetUserQuery query, ...)  // null returned
```

---

## 5. Async Conventions

```csharp
// GOOD
public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
{
    return await _context.Users.FindAsync(new object[] { id }, ct);
}

// BAD — .Result / .Wait() (FORBIDDEN)
var user = _userRepo.GetByIdAsync(id).Result;

// BAD — async void (FORBIDDEN except event handlers)
public async void Button_Click() { ... }

// GOOD — CancellationToken as last parameter with default
Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);

// LIBRARY CODE — use ConfigureAwait(false)
await _context.SaveChangesAsync(ct).ConfigureAwait(false);

// APPLICATION CODE — ConfigureAwait(false) NOT needed (ASP.NET Core)
await _mediator.Send(command, ct);
```

---

## 6. Exceptions

- Use specific exception types: `ArgumentException`, `InvalidOperationException`, `NotFoundException`
- Use `ArgumentException.ThrowIfNullOrEmpty()` in .NET 10+
- Never catch `Exception` without rethrowing or handling
- Expected failures go through `Result` pattern, not exceptions

```csharp
// GOOD
ArgumentException.ThrowIfNullOrEmpty(username);
Result.Fail("Invalid credentials");

// BAD
throw new Exception("Invalid credentials");
```

---

## 7. Error Message Standards

- User-facing errors: Vietnamese for accounting application
- Developer errors: English (exceptions, logs)
- Use constants for repeated messages
- Never expose stack traces to client

---

## 8. Banned APIs

| Banned API | Replacement | Reason |
|---|---|---|
| `DateTime.Now` | `DateTime.UtcNow` | Timezone consistency |
| `GC.Collect()` | — | Performance |
| `Console.Write/WriteLine` | `ILogger<T>` | Structured logging |
| `Task.Result` / `.Wait()` | `await` | Deadlock risk |
| `async void` | `async Task` | Exception handling |
| `== null` / `!= null` | `is null` / `is not null` | Pattern matching |
| `new Random()` | `Random.Shared` | Thread safety |
| `Environment.GetEnvironmentVariable()` | `IConfiguration` | DI principle |

---

## 9. Entity Design Rules

```csharp
// GOOD — encapsulate behavior
public class User : BaseEntity
{
    public string Username { get; private set; }
    public bool IsActive { get; private set; }

    public void Activate()
    {
        IsActive = true;
    }

    public void Disable()
    {
        IsActive = false;
    }
}

// BAD — anemic, public setters everywhere
public class User
{
    public string Username { get; set; }  // Anyone can change
    public bool IsActive { get; set; }
}

// GOOD — BaseCatalogEntity with protected (not public) setters
public abstract class BaseCatalogEntity : BaseEntity
{
    public string Code { get; protected set; }
    public string Name { get; protected set; }
}
```

---

## 10. Test Conventions

```csharp
// GOOD — clear test names
[Fact]
public async Task GetById_ExistingUser_ReturnsUser() { ... }

[Theory]
[InlineData(null)]
[InlineData("")]
public async Task CreateUser_InvalidUsername_Throws(string username) { ... }

// BAD
[Fact]
public void Test1() { }  // Delete this
[Fact]
public void Test() { }

// Test naming: {Method}_{Scenario}_{Expected}

// Use FluentAssertions
result.IsSuccess.Should().BeTrue();
user.Should().NotBeNull();
user.Username.Should().Be("admin");
```

---

## 11. Code Review Checklist

- [ ] No `== null` / `!= null` — use `is null` / `is not null`
- [ ] No `async void`
- [ ] No `.Result` / `.Wait()`
- [ ] No `DateTime.Now`
- [ ] No `Exception` base type caught
- [ ] All async methods suffixed `Async`
- [ ] All private fields prefixed `_`
- [ ] All interfaces prefixed `I`
- [ ] No public setters on entities
- [ ] No string literals where `nameof()` works
- [ ] No unused `using` directives
- [ ] No unused parameters
- [ ] CancellationToken forwarded to all async calls
- [ ] Namespace matches folder path
- [ ] File-scoped namespace declarations
- [ ] Sealed keyword on internal types that don't need inheritance
