using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public class FeatureRepository : IFeatureRepository
{
    private readonly ApplicationDbContext _context;

    public FeatureRepository(ApplicationDbContext context) => _context = context;

    public async Task<Feature?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.Features.Include(f => f.Children).FirstOrDefaultAsync(f => f.Id == id, ct);

    public async Task<Feature?> GetByCodeAsync(string code, CancellationToken ct = default) =>
        await _context.Features.Include(f => f.Children).FirstOrDefaultAsync(f => f.Code == code, ct);

    public async Task<List<Feature>> GetAllAsync(CancellationToken ct = default) =>
        await _context.Features.Include(f => f.Children).OrderBy(f => f.Module).ThenBy(f => f.Code).ToListAsync(ct);

    public async Task<List<Feature>> GetRootFeaturesAsync(CancellationToken ct = default) =>
        await _context.Features.Where(f => f.ParentId == null).OrderBy(f => f.Module).ThenBy(f => f.Code).ToListAsync(ct);

    public async Task<List<Feature>> GetChildrenAsync(Guid parentId, CancellationToken ct = default) =>
        await _context.Features.Where(f => f.ParentId == parentId).OrderBy(f => f.Code).ToListAsync(ct);

    public void Add(Feature feature) => _context.Features.Add(feature);
}
