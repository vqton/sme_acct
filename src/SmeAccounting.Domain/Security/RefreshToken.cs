using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Security;

public class RefreshToken : BaseEntity
{
    public string Token { get; private set; } = string.Empty;
    public string JwtId { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public Entities.User User { get; private set; } = null!;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? ReplacedByToken { get; private set; }
    public string? DeviceInfo { get; private set; }
    public string? IpAddress { get; private set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsExpired && !IsRevoked;

    private RefreshToken() { }

    public RefreshToken(string token, string jwtId, Guid userId, DateTime expiresAt, string? deviceInfo = null, string? ipAddress = null)
    {
        Token = token;
        JwtId = jwtId;
        UserId = userId;
        ExpiresAt = expiresAt;
        DeviceInfo = deviceInfo;
        IpAddress = ipAddress;
    }

    public void Revoke(string? replacedBy = null)
    {
        RevokedAt = DateTime.UtcNow;
        ReplacedByToken = replacedBy;
    }
}
