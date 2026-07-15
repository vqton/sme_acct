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

    public HashSet<Role> Roles { get; private set; } = new();

    private User() { }

    public User(string username, string email, string passwordHash, string firstName, string lastName)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        IsActive = true;
    }

    public void SetPassword(string newHash) { PasswordHash = newHash; }
    public void Enable() { IsActive = true; }
    public void Disable() { IsActive = false; }
    public void SetLastLogin() { LastLogin = DateTime.UtcNow; }
    public void AddRole(Role role) { if (!Roles.Contains(role)) Roles.Add(role); }
    public void RemoveRole(Role role) { Roles.Remove(role); }
}
