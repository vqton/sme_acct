using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.UnitTests.Entities;

public class UserTests
{
    private static User CreateUser() => new("testuser", "test@example.com", "hash123", "Test", "User", Guid.NewGuid());

    [Fact]
    public void Constructor_SetsActiveAndProperties()
    {
        var user = new User("testuser", "test@example.com", "hash123", "Test", "User", Guid.NewGuid());
        user.Username.Should().Be("testuser");
        user.Email.Should().Be("test@example.com");
        user.IsActive.Should().BeTrue();
        user.FullName.Should().Be("Test User");
    }

    [Fact]
    public void SetPassword_UpdatesHashAndStoresPrevious()
    {
        var user = CreateUser();
        user.SetPassword("newHash456");
        user.PasswordHash.Should().Be("newHash456");
        user.PreviousPasswordHashes.Should().Contain("hash123");
    }

    [Fact]
    public void IsPasswordReused_ReturnsTrue_WhenMatchesCurrent()
    {
        var user = CreateUser();
        user.IsPasswordReused("hash123").Should().BeTrue();
    }

    [Fact]
    public void IsPasswordReused_ReturnsTrue_WhenMatchesPrevious()
    {
        var user = CreateUser();
        user.SetPassword("newHash456");
        user.IsPasswordReused("hash123").Should().BeTrue();
    }

    [Fact]
    public void IsPasswordReused_ReturnsFalse_ForNewPassword()
    {
        var user = CreateUser();
        user.IsPasswordReused("neverUsedBefore").Should().BeFalse();
    }

    [Fact]
    public void Enable_SetsActive()
    {
        var user = CreateUser();
        user.Disable();
        user.Enable();
        user.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Disable_SetsInactive()
    {
        var user = CreateUser();
        user.Disable();
        user.IsActive.Should().BeFalse();
    }

    [Fact]
    public void SetLastLogin_ResetsFailedAttemptsAndLockout()
    {
        var user = CreateUser();
        user.RecordFailedAttempt(5, 15);
        user.SetLastLogin();
        user.FailedLoginAttempts.Should().Be(0);
        user.IsLockedOut().Should().BeFalse();
    }

    [Fact]
    public void RecordFailedAttempt_AfterMaxAttempts_LocksOut()
    {
        var user = CreateUser();
        user.RecordFailedAttempt(3, 15);
        user.FailedLoginAttempts.Should().Be(1);
        user.IsLockedOut().Should().BeFalse();
        user.RecordFailedAttempt(3, 15);
        user.RecordFailedAttempt(3, 15);
        user.FailedLoginAttempts.Should().Be(3);
        user.IsLockedOut().Should().BeTrue();
    }

    [Fact]
    public void IsLockedOut_ReturnsFalse_WhenNoLockout()
    {
        var user = CreateUser();
        user.IsLockedOut().Should().BeFalse();
    }

    [Fact]
    public void Unlock_ResetsLockout()
    {
        var user = CreateUser();
        user.RecordFailedAttempt(3, 15);
        user.RecordFailedAttempt(3, 15);
        user.RecordFailedAttempt(3, 15);
        user.Unlock();
        user.IsLockedOut().Should().BeFalse();
        user.FailedLoginAttempts.Should().Be(0);
    }

    [Fact]
    public void AddRole_AddsRole()
    {
        var user = CreateUser();
        var role = new Role("Admin", Guid.NewGuid());
        user.AddRole(role);
        user.Roles.Should().Contain(role);
    }

    [Fact]
    public void AddRole_SameRoleTwice_DoesNotDuplicate()
    {
        var user = CreateUser();
        var role = new Role("Admin", Guid.NewGuid());
        user.AddRole(role);
        user.AddRole(role);
        user.Roles.Should().HaveCount(1);
    }

    [Fact]
    public void RemoveRole_RemovesRole()
    {
        var user = CreateUser();
        var role = new Role("Admin", Guid.NewGuid());
        user.AddRole(role);
        user.RemoveRole(role);
        user.Roles.Should().BeEmpty();
    }

    [Fact]
    public void HasRole_ReturnsTrue_WhenAssigned()
    {
        var user = CreateUser();
        user.AddRole(new Role("Admin", Guid.NewGuid()));
        user.HasRole("Admin").Should().BeTrue();
    }

    [Fact]
    public void HasRole_ReturnsFalse_WhenNotAssigned()
    {
        var user = CreateUser();
        user.AddRole(new Role("Admin", Guid.NewGuid()));
        user.HasRole("User").Should().BeFalse();
    }

    [Fact]
    public void EnableMfa_SetsMfaEnabled()
    {
        var user = CreateUser();
        user.EnableMfa("secret123");
        user.MfaEnabled.Should().BeTrue();
        user.MfaSecret.Should().Be("secret123");
    }

    [Fact]
    public void DisableMfa_ClearsMfa()
    {
        var user = CreateUser();
        user.EnableMfa("secret123");
        user.DisableMfa();
        user.MfaEnabled.Should().BeFalse();
        user.MfaSecret.Should().BeNull();
    }
}
