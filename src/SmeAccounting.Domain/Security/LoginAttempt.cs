using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Security;

public enum LoginResult
{
    Success = 1,
    InvalidCredentials = 2,
    AccountLocked = 3,
    AccountInactive = 4,
    MfaRequired = 5
}

public class LoginAttempt : BaseEntity
{
    public Guid? UserId { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string IpAddress { get; private set; } = string.Empty;
    public string? DeviceInfo { get; private set; }
    public LoginResult Result { get; private set; }
    public DateTime AttemptedAt { get; private set; }
    public string? FailureReason { get; private set; }

    private LoginAttempt() { }

    public LoginAttempt(string username, string ipAddress, LoginResult result, Guid? userId = null, string? deviceInfo = null, string? failureReason = null)
    {
        Username = username;
        IpAddress = ipAddress;
        Result = result;
        UserId = userId;
        DeviceInfo = deviceInfo;
        FailureReason = failureReason;
        AttemptedAt = DateTime.UtcNow;
    }
}
