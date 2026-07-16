using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public class OrganizationUnitRepository : IOrganizationUnitRepository
{
    private readonly ApplicationDbContext _context;

    public OrganizationUnitRepository(ApplicationDbContext context) => _context = context;

    public async Task<OrganizationUnit?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.OrganizationUnits.Include(ou => ou.Children).FirstOrDefaultAsync(ou => ou.Id == id, ct);

    public async Task<List<OrganizationUnit>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default) =>
        await _context.OrganizationUnits.Where(ou => ou.CompanyId == companyId).Include(ou => ou.Children).ToListAsync(ct);

    public async Task<List<OrganizationUnit>> GetRootUnitsAsync(Guid companyId, CancellationToken ct = default) =>
        await _context.OrganizationUnits.Where(ou => ou.CompanyId == companyId && ou.ParentId == null).ToListAsync(ct);

    public async Task<List<OrganizationUnit>> GetChildrenAsync(Guid parentId, CancellationToken ct = default) =>
        await _context.OrganizationUnits.Where(ou => ou.ParentId == parentId).ToListAsync(ct);

    public async Task<List<UserOrganizationUnit>> GetUserOrgUnitsAsync(Guid userId, CancellationToken ct = default) =>
        await _context.UserOrganizationUnits.Include(uou => uou.OrganizationUnit).Where(uou => uou.UserId == userId).ToListAsync(ct);

    public void Add(OrganizationUnit unit) => _context.OrganizationUnits.Add(unit);
    public void AddUserOrgUnit(UserOrganizationUnit uou) => _context.UserOrganizationUnits.Add(uou);
}
