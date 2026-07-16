namespace SmeAccounting.Domain.Entities;

public class SessionSettings : BaseEntity
{
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    public int AccessTokenExpiryMinutes { get; private set; } = 15;
    public int RefreshTokenExpiryDays { get; private set; } = 7;
    public int MaxConcurrentSessions { get; private set; } = 3;
    public bool EnforceSessionTimeout { get; private set; } = true;

    private SessionSettings() { }

    public SessionSettings(Guid companyId, int accessTokenExpiryMinutes = 15, int refreshTokenExpiryDays = 7, int maxConcurrentSessions = 3)
    {
        CompanyId = companyId;
        AccessTokenExpiryMinutes = accessTokenExpiryMinutes;
        RefreshTokenExpiryDays = refreshTokenExpiryDays;
        MaxConcurrentSessions = maxConcurrentSessions;
    }
}
