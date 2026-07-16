using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Security;

public class UserOrganizationUnit : BaseEntity
{
    public Guid UserId { get; private set; }
    public Entities.User User { get; private set; } = null!;
    public Guid OrganizationUnitId { get; private set; }
    public OrganizationUnit OrganizationUnit { get; private set; } = null!;
    public bool IsPrimary { get; private set; }

    private UserOrganizationUnit() { }

    public UserOrganizationUnit(Guid userId, Guid orgUnitId, bool isPrimary = false)
    {
        UserId = userId;
        OrganizationUnitId = orgUnitId;
        IsPrimary = isPrimary;
    }
}
