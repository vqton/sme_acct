namespace SmeAccounting.Domain.Entities;

public class CompanyPasswordPolicy : BaseEntity
{
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    public int MinLength { get; private set; } = 8;
    public int MaxLength { get; private set; } = 128;
    public bool RequireUppercase { get; private set; } = true;
    public bool RequireLowercase { get; private set; } = true;
    public bool RequireDigit { get; private set; } = true;
    public bool RequireSpecialChar { get; private set; } = true;
    public int MaxLoginAttempts { get; private set; } = 5;
    public int LockoutMinutes { get; private set; } = 15;
    public int PasswordHistoryCount { get; private set; } = 5;

    private CompanyPasswordPolicy() { }

    public CompanyPasswordPolicy(Guid companyId)
    {
        CompanyId = companyId;
    }

    public Domain.Security.PasswordPolicy ToDomainPolicy() => new()
    {
        MinLength = MinLength,
        MaxLength = MaxLength,
        RequireUppercase = RequireUppercase,
        RequireLowercase = RequireLowercase,
        RequireDigit = RequireDigit,
        RequireSpecialChar = RequireSpecialChar,
        MaxLoginAttempts = MaxLoginAttempts,
        LockoutMinutes = LockoutMinutes,
        PasswordHistoryCount = PasswordHistoryCount,
    };
}
