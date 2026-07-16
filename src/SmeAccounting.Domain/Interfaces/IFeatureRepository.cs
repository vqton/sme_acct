using SmeAccounting.Domain.Security;

namespace SmeAccounting.Domain.Interfaces;

public interface IFeatureRepository
{
    Task<Feature?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Feature?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<List<Feature>> GetAllAsync(CancellationToken ct = default);
    Task<List<Feature>> GetRootFeaturesAsync(CancellationToken ct = default);
    Task<List<Feature>> GetChildrenAsync(Guid parentId, CancellationToken ct = default);
    void Add(Feature feature);
}
