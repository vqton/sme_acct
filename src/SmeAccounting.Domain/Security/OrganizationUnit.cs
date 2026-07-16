using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Security;

public class OrganizationUnit : BaseEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int Level { get; private set; }
    public Guid CompanyId { get; private set; }
    public Entities.Company Company { get; private set; } = null!;

    public Guid? ParentId { get; private set; }
    public OrganizationUnit? Parent { get; private set; }
    public ICollection<OrganizationUnit> Children { get; private set; } = new List<OrganizationUnit>();
    public ICollection<UserOrganizationUnit> UserOrgUnits { get; private set; } = new List<UserOrganizationUnit>();

    private OrganizationUnit() { }

    public OrganizationUnit(string code, string name, Guid companyId, string? description = null, Guid? parentId = null)
    {
        Code = code;
        Name = name;
        CompanyId = companyId;
        Description = description;
        ParentId = parentId;
        Level = parentId == null ? 0 : 1;
    }
}
