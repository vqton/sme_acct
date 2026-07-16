using SmeAccounting.Domain.Security;

namespace SmeAccounting.Domain.Interfaces;

public interface IOrganizationUnitRepository
{
    Task<OrganizationUnit?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<OrganizationUnit>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<List<OrganizationUnit>> GetRootUnitsAsync(Guid companyId, CancellationToken ct = default);
    Task<List<OrganizationUnit>> GetChildrenAsync(Guid parentId, CancellationToken ct = default);
    Task<List<UserOrganizationUnit>> GetUserOrgUnitsAsync(Guid userId, CancellationToken ct = default);
    void Add(OrganizationUnit unit);
    void AddUserOrgUnit(UserOrganizationUnit uou);
}
