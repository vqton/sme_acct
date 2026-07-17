using SmeAccounting.Domain.Security;

namespace SmeAccounting.Domain.UnitTests.Security;

public class LoginAttemptTests
{
    [Fact]
    public void Constructor_SetsProperties()
    {
        var userId = Guid.NewGuid();
        var attempt = new LoginAttempt("testuser", "192.168.1.1", LoginResult.Success, userId, "Chrome/120", null);

        attempt.Username.Should().Be("testuser");
        attempt.IpAddress.Should().Be("192.168.1.1");
        attempt.Result.Should().Be(LoginResult.Success);
        attempt.UserId.Should().Be(userId);
        attempt.DeviceInfo.Should().Be("Chrome/120");
        attempt.FailureReason.Should().BeNull();
        attempt.AttemptedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Constructor_FailureReasonSetForErrorResult()
    {
        var attempt = new LoginAttempt("testuser", "10.0.0.1", LoginResult.InvalidCredentials, null, null, "InvalidCredentials");

        attempt.FailureReason.Should().Be("InvalidCredentials");
    }

    [Fact]
    public void Constructor_FailureReasonNullForSuccess()
    {
        var attempt = new LoginAttempt("testuser", "10.0.0.1", LoginResult.Success);

        attempt.FailureReason.Should().BeNull();
    }

    [Fact]
    public void Constructor_UsernameEmpty_Allowed()
    {
        var attempt = new LoginAttempt("", "10.0.0.1", LoginResult.InvalidCredentials);

        attempt.Username.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_UnknownIp_UsesProvidedValue()
    {
        var attempt = new LoginAttempt("testuser", "unknown", LoginResult.AccountLocked);

        attempt.IpAddress.Should().Be("unknown");
    }
}
