namespace SmeAccounting.Domain.Entities;

public class Permission : BaseCatalogEntity
{
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;

    public ICollection<Role> Roles { get; set; } = new HashSet<Role>();

    private Permission() : base("", "") {}
    public Permission(string code, string name, string resource, string action) : base(code, name)
    {
        Resource = resource;
        Action = action;
    }
}
