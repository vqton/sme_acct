using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Security;

public class Feature : BaseEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Module { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }

    public Guid? ParentId { get; private set; }
    public Feature? Parent { get; private set; }
    public ICollection<Feature> Children { get; private set; } = new List<Feature>();

    private Feature() { }

    public Feature(string code, string name, string module, string? description = null, Guid? parentId = null, int sortOrder = 0)
    {
        Code = code;
        Name = name;
        Module = module;
        Description = description;
        ParentId = parentId;
        SortOrder = sortOrder;
    }

    public bool IsRoot => ParentId == null;
    public string FullCode => Parent == null ? Code : $"{Parent.FullCode}.{Code}";
}
