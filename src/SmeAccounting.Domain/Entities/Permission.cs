namespace SmeAccounting.Domain.Entities;

public class Permission : BaseCatalogEntity
{
    public string Resource { get; protected set; } = string.Empty;
    public string Action { get; protected set; } = string.Empty;

    public ICollection<Role> Roles { get; protected set; } = new HashSet<Role>();

    private Permission() : base("", "") {}
    public Permission(string code, string name, string resource, string action) : base(code, name)
    {
        Resource = resource;
        Action = action;
    }
}
