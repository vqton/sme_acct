using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Domain.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Role?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<List<Role>> GetAllAsync(CancellationToken ct = default);
    Task<List<FeaturePermission>> GetRolePermissionsAsync(Guid roleId, CancellationToken ct = default);
    Task<HashSet<string>> GetUserEffectivePermissionsAsync(Guid userId, CancellationToken ct = default);
    void Add(Role role);
    void Update(Role role);
    void AddPermission(FeaturePermission permission);
    void RemovePermission(FeaturePermission permission);
    void Remove(Role role);
}
