namespace SmeAccounting.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsSystem { get; private set; }
    public Guid CompanyId { get; private set; }
    public Guid? ParentRoleId { get; private set; }
    public Role? ParentRole { get; private set; }
    public HashSet<Permission> Permissions { get; private set; } = new();

    public ICollection<User> Users { get; private set; } = new HashSet<User>();

    private Role() { }

    public Role(string name, Guid companyId, string? description = null, bool isSystem = false)
    {
        Name = name;
        CompanyId = companyId;
        Description = description;
        IsSystem = isSystem;
    }

    public void UpdateInfo(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetParent(Guid? parentRoleId)
    {
        if (parentRoleId == Id) return;
        ParentRoleId = parentRoleId;
    }

    public void AddPermission(Permission permission) => Permissions.Add(permission);
    public void RemovePermission(Permission permission) => Permissions.Remove(permission);
}
