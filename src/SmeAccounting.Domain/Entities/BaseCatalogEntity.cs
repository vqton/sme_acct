namespace SmeAccounting.Domain.Entities;

public abstract class BaseCatalogEntity : BaseEntity
{
    public string Code { get; protected set; } = string.Empty;
    public string Name { get; protected set; } = string.Empty;
    public string? Description { get; protected set; }
    public bool IsActive { get; protected set; } = true;

    protected BaseCatalogEntity(string code, string name)
    {
        Code = code;
        Name = name;
    }
}
