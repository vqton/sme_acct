using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public sealed class PermissionRepository : IPermissionRepository
{
    private readonly ApplicationDbContext _context;

    public PermissionRepository(ApplicationDbContext context) => _context = context;

    public async Task<List<Permission>> GetAllAsync(CancellationToken ct = default) =>
        await _context.Permissions.OrderBy(p => p.Resource).ThenBy(p => p.Action).ToListAsync(ct);

    public async Task<Permission?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.Permissions.FindAsync([id], ct);
}
