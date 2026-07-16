# Roslyn Analyzer Configuration — SmeAccounting

**Sources:** Microsoft.CodeAnalysis.NetAnalyzers, SonarAnalyzer, Roslynator, Meziantou.Analyzer

---

## 1. Analyzer Stack (Which & Why)

| Analyzer | Purpose | Install |
|---|---|---|
| Built-in .NET (CAxxxx) | Security, performance, design, reliability | Built-in with .NET SDK |
| Built-in IDE (IDExxxx) | Code style, formatting, naming | Built-in with .NET SDK |
| SonarAnalyzer.CSharp | Cognitive complexity, code smells, bugs | NuGet |
| Meziantou.Analyzer | Async, LINQ, strings, performance | NuGet |
| Roslynator.Analyzers | Refactoring, readability, simplifications | NuGet |

## 2. Key CA Rules — Severity Override

```ini
# === DESIGN ===
dotnet_diagnostic.CA1000.severity = warning      # Don't declare static members in generic types
dotnet_diagnostic.CA1031.severity = warning      # Do not catch general exception types
dotnet_diagnostic.CA1032.severity = warning      # Implement standard exception constructors
dotnet_diagnostic.CA1034.severity = warning      # Nested types should not be visible
dotnet_diagnostic.CA1052.severity = warning      # Static holder types should be Static

# === PERFORMANCE ===
dotnet_diagnostic.CA1822.severity = warning      # Mark members as static
dotnet_diagnostic.CA1845.severity = suggestion   # Use span-based string concat
dotnet_diagnostic.CA1846.severity = suggestion   # Prefer AsSpan over Substring
dotnet_diagnostic.CA1852.severity = error        # Seal internal types
dotnet_diagnostic.CA1861.severity = warning      # Avoid constant arrays as arguments

# === RELIABILITY ===
dotnet_diagnostic.CA2007.severity = suggestion   # Consider ConfigureAwait
dotnet_diagnostic.CA2016.severity = error        # Forward CancellationToken

# === USAGE ===
dotnet_diagnostic.CA2201.severity = error        # Do not raise reserved exception types
dotnet_diagnostic.CA2208.severity = error        # Instantiate argument exceptions correctly

# === SECURITY ===
dotnet_diagnostic.CA2100.severity = error        # SQL injection
dotnet_diagnostic.CA3001.severity = error        # XSS
dotnet_diagnostic.CA3002.severity = error        # LDAP injection
dotnet_diagnostic.CA3003.severity = error        # Path traversal
dotnet_diagnostic.CA3004.severity = warning      # Info disclosure
dotnet_diagnostic.CA3006.severity = error        # Command injection
dotnet_diagnostic.CA3007.severity = error        # Open redirect
dotnet_diagnostic.CA5350.severity = error        # Weak crypto (TripleDES)
dotnet_diagnostic.CA5351.severity = error        # Broken crypto (MD5)
dotnet_diagnostic.CA5369.severity = warning      # XmlReader settings

# === GLOBALIZATION ===
dotnet_diagnostic.CA1303.severity = warning      # Do not pass literals as localized params
dotnet_diagnostic.CA1309.severity = warning      # Use ordinal string comparison
```

## 3. SonarAnalyzer Key Rules

```ini
# === COGNITIVE COMPLEXITY ===
dotnet_diagnostic.S3776.severity = warning       # Cognitive complexity threshold (default 15)
dotnet_diagnostic.S1541.severity = warning       # Cyclomatic complexity (default 10)
dotnet_diagnostic.S138.severity = warning        # Method too long (>200 lines)

# === CODE SMELLS ===
dotnet_diagnostic.S1067.severity = warning       # Expressions should not be too complex
dotnet_diagnostic.S107.severity = warning        # Methods should not have too many params (>7)
dotnet_diagnostic.S112.severity = error          # General exceptions should never be thrown
dotnet_diagnostic.S1135.severity = warning       # Track uses of TODO
dotnet_diagnostic.S125.severity = warning        # Remove commented-out code
dotnet_diagnostic.S3405.severity = warning       # ToString() should not be redundant

# === NULLABLE ===
dotnet_diagnostic.S3900.severity = warning       # Arg should be checked for null
dotnet_diagnostic.S4200.severity = warning       # Native methods should be wrapped

# === ASYNC ===
dotnet_diagnostic.S3168.severity = error         # async methods should return Task (not void)
dotnet_diagnostic.S4462.severity = warning       # Task.Result in async method
```

## 4. Meziantou Key Rules

```ini
# === PERFORMANCE ===
dotnet_diagnostic.MA0001.severity = warning      # Use StringBuilder for concatenation in loops
dotnet_diagnostic.MA0011.severity = warning      # Use Count property instead of Any()
dotnet_diagnostic.MA0075.severity = warning      # Do not use implicit culture-sensitive ToString
dotnet_diagnostic.MA0078.severity = warning      # Use 'typeof' instead of 'GetType()' for type equality

# === ASYNC ===
dotnet_diagnostic.MA0022.severity = warning      # Use 'Task.ConfigureAwait(false)'
dotnet_diagnostic.MA0045.severity = suggestion   # Use 'ValueTask' instead of 'Task' for hot paths
dotnet_diagnostic.MA0080.severity = warning      # Use 'Index' instead of manual indexer

# === STRING ===
dotnet_diagnostic.MA0027.severity = suggestion   # Use 'string.Equals' instead of '=='
dotnet_diagnostic.MA0035.severity = warning      # Use 'string.IndexOf' with StringComparison
```

---

## 5. Complexity Thresholds

| Metric | Threshold | Rule | Action |
|---|---|---|---|
| Cyclomatic complexity | ≤ 15 per method | CA1502 | Refactor |
| Cognitive complexity | ≤ 15 per method | S3776 | Refactor |
| Method lines | ≤ 40 | S138 | Extract |
| Class lines | ≤ 300 | S138 | Extract |
| Parameters | ≤ 5 per method | CA1502 | Introduce param object |
| Nesting depth | ≤ 4 | Custom | Extract method |
| Class coupling | ≤ 30 | CA1506 | Reduce dependencies |
| Method count | ≤ 15 per class | Custom | Split class |

---

## 6. Suppression Rules

### Suppress Only When Justified

```csharp
[SuppressMessage("Critical", "CA2100", Justification = "Parameterized via EF Core, no SQL injection")]
```

### Never Suppress

- `CA2100` (SQL injection) — only via justified comment above
- `CA3001`-`CA3007` (security) — never suppress
- `CA5350`-`CA5351` (crypto) — never suppress
- `CA2201` (reserved exceptions) — never suppress

---

## 7. Per-Project Overrides

### Tests (`src/SmeAccounting.Tests/.editorconfig`)

```ini
root = true

[*.cs]
dotnet_diagnostic.CS1591.severity = none         # No XML doc required
dotnet_diagnostic.CA1502.severity = none         # Cyclomatic complexity relaxed
dotnet_diagnostic.CA1506.severity = none         # Class coupling relaxed
dotnet_diagnostic.CA1822.severity = none         # Test methods can be non-static
dotnet_diagnostic.CA1861.severity = none         # Constant args allowed in tests
dotnet_diagnostic.CA2007.severity = none         # ConfigureAwait not needed in tests
dotnet_diagnostic.S138.severity = none           # Test methods can be long
dotnet_diagnostic.S3168.severity = none          # async void allowed in test events
```

### Infrastructure Persistence (`src/SmeAccounting.Infrastructure/.editorconfig`)

```ini
[*.cs]
dotnet_diagnostic.CA2100.severity = error        # SQL injection — CRITICAL in persistence
dotnet_diagnostic.CA5350.severity = error        # Crypto must be audited here
```

---

## 8. CI Enforcement

In `Directory.Build.props`:

```xml
<PropertyGroup>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <CodeAnalysisTreatWarningsAsErrors>true</CodeAnalysisTreatWarningsAsErrors>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <AnalysisLevel>latest-all</AnalysisLevel>
    <AnalysisMode>All</AnalysisMode>
</PropertyGroup>
```

Build command:

```bash
dotnet build --warnaserror
```

SonarQube quality gate:

- Coverage >= 80%
- Duplication <= 3%
- Security hotspots = 0
- Critical issues = 0
