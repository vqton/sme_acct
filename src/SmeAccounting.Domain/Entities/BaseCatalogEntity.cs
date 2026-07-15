namespace SmeAccounting.Domain.Entities;

public abstract class BaseCatalogEntity : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    protected BaseCatalogEntity(string code, string name)
    {
        Code = code;
        Name = name;
    }
}
