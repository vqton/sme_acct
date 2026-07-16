using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Security;

public enum FeatureAction
{
    View = 1,
    Create = 2,
    Edit = 3,
    Delete = 4,
    Print = 5,
    Export = 6,
    Approve = 7
}

[Flags]
public enum FeatureAccess
{
    None = 0,
    View = 1 << 0,
    Create = 1 << 1,
    Edit = 1 << 2,
    Delete = 1 << 3,
    Print = 1 << 4,
    Export = 1 << 5,
    Approve = 1 << 6,
    Full = View | Create | Edit | Delete | Print | Export | Approve
}

public class FeaturePermission : BaseEntity
{
    public Guid RoleId { get; private set; }
    public Entities.Role Role { get; private set; } = null!;
    public Guid FeatureId { get; private set; }
    public Feature Feature { get; private set; } = null!;
    public FeatureAccess Access { get; private set; }
    public bool IsAllowed { get; private set; }

    private FeaturePermission() { }

    public FeaturePermission(Guid roleId, Guid featureId, FeatureAccess access, bool isAllowed = true)
    {
        RoleId = roleId;
        FeatureId = featureId;
        Access = access;
        IsAllowed = isAllowed;
    }

    public void Grant(FeatureAccess access) { Access |= access; IsAllowed = true; }
    public void Deny(FeatureAccess access) { Access &= ~access; }
    public bool HasAccess(FeatureAction action) => IsAllowed && Access.HasFlag((FeatureAccess)(1 << (int)action));
}
