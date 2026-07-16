using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Domain.Interfaces;

public interface IPermissionRepository
{
    Task<List<Permission>> GetAllAsync(CancellationToken ct = default);
    Task<Permission?> GetByIdAsync(Guid id, CancellationToken ct = default);
}
