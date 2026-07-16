using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Interfaces;

public interface ICompanyPasswordPolicyRepository
{
    Task<CompanyPasswordPolicy?> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
}
