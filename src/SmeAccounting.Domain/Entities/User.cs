using SmeAccounting.Domain.Enums;
using SmeAccounting.Domain.ValueObjects;

namespace SmeAccounting.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public bool IsAdmin { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLogin { get; private set; }
    public DateTime? LockoutEnd { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public bool MfaEnabled { get; private set; }
    public string? MfaSecret { get; private set; }
    public Guid CompanyId { get; private set; }

    public HashSet<Role> Roles { get; private set; } = new();
    private readonly List<string> _previousPasswordHashes = new();
    public IReadOnlyCollection<string> PreviousPasswordHashes => _previousPasswordHashes.AsReadOnly();

    private User() { }

    public User(string username, string email, string passwordHash, string firstName, string lastName, Guid companyId)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        CompanyId = companyId;
        IsActive = true;
    }

    public void SetPassword(string newHash)
    {
        _previousPasswordHashes.Add(PasswordHash);
        if (_previousPasswordHashes.Count > 10) _previousPasswordHashes.RemoveAt(0);
        PasswordHash = newHash;
    }

    public bool IsPasswordReused(string newHash) => _previousPasswordHashes.Contains(newHash) || PasswordHash == newHash;
    public void Enable() { IsActive = true; }
    public void Disable() { IsActive = false; }
    public void SetLastLogin() { LastLogin = DateTime.UtcNow; FailedLoginAttempts = 0; LockoutEnd = null; }
    public void RecordFailedAttempt(int maxAttempts, int lockoutMinutes)
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= maxAttempts)
            LockoutEnd = DateTime.UtcNow.AddMinutes(lockoutMinutes);
    }
    public bool IsLockedOut() => LockoutEnd.HasValue && LockoutEnd > DateTime.UtcNow;
    public void Unlock() { LockoutEnd = null; FailedLoginAttempts = 0; }
    public void AddRole(Role role) { if (!Roles.Contains(role)) Roles.Add(role); }
    public void RemoveRole(Role role) { Roles.Remove(role); }
    public bool HasRole(string roleName) => Roles.Any(r => r.Name == roleName);
    public string FullName => $"{FirstName} {LastName}";
    public void EnableMfa(string secret) { MfaEnabled = true; MfaSecret = secret; }
    public void DisableMfa() { MfaEnabled = false; MfaSecret = null; }
}
