namespace SmeAccounting.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public HashSet<Permission> Permissions { get; private set; } = new();

    public ICollection<User> Users { get; set; } = new HashSet<User>();

    private Role() { }

    public Role(string name, string? description = null)
    {
        Name = name;
        Description = description;
    }

    public void AddPermission(Permission permission) => Permissions.Add(permission);
    public void RemovePermission(Permission permission) => Permissions.Remove(permission);
}
