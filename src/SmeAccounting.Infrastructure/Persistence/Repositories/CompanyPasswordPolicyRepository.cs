using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public sealed class CompanyPasswordPolicyRepository : ICompanyPasswordPolicyRepository
{
    private readonly ApplicationDbContext _context;

    public CompanyPasswordPolicyRepository(ApplicationDbContext context) => _context = context;

    public async Task<CompanyPasswordPolicy?> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default) =>
        await _context.CompanyPasswordPolicies.FirstOrDefaultAsync(p => p.CompanyId == companyId, ct);
}
