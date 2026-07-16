namespace SmeAccounting.Domain.Security;

public record PasswordPolicy
{
    public int MinLength { get; init; } = 8;
    public int MaxLength { get; init; } = 128;
    public bool RequireUppercase { get; init; } = true;
    public bool RequireLowercase { get; init; } = true;
    public bool RequireDigit { get; init; } = true;
    public bool RequireSpecialChar { get; init; } = true;
    public int MaxLoginAttempts { get; init; } = 5;
    public int LockoutMinutes { get; init; } = 15;
    public int PasswordHistoryCount { get; init; } = 5;
    public int MaxActiveSessions { get; init; } = 3;
    public int RefreshTokenExpiryDays { get; init; } = 7;
    public int AccessTokenExpiryMinutes { get; init; } = 15;

    public ValidationResult Validate(string password)
    {
        var errors = new List<string>();
        if (password.Length < MinLength) errors.Add($"Min length: {MinLength}");
        if (password.Length > MaxLength) errors.Add($"Max length: {MaxLength}");
        if (RequireUppercase && !password.Any(char.IsUpper)) errors.Add("Requires uppercase");
        if (RequireLowercase && !password.Any(char.IsLower)) errors.Add("Requires lowercase");
        if (RequireDigit && !password.Any(char.IsDigit)) errors.Add("Requires digit");
        if (RequireSpecialChar && password.All(c => char.IsLetterOrDigit(c))) errors.Add("Requires special char");
        return new ValidationResult(errors.Count == 0, errors);
    }
}

public record ValidationResult(bool IsValid, List<string> Errors);
