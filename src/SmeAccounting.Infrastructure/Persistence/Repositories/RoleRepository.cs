using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;

    public RoleRepository(ApplicationDbContext context) => _context = context;

    public async Task<Role?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.Roles.Include(r => r.Permissions).FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<Role?> GetByNameAsync(string name, CancellationToken ct = default) =>
        await _context.Roles.Include(r => r.Permissions).FirstOrDefaultAsync(r => r.Name == name, ct);

    public async Task<List<Role>> GetAllAsync(CancellationToken ct = default) =>
        await _context.Roles.Include(r => r.Permissions).OrderBy(r => r.Name).ToListAsync(ct);

    public async Task<List<FeaturePermission>> GetRolePermissionsAsync(Guid roleId, CancellationToken ct = default) =>
        await _context.FeaturePermissions.Include(fp => fp.Feature).Where(fp => fp.RoleId == roleId).ToListAsync(ct);

    public async Task<HashSet<string>> GetUserEffectivePermissionsAsync(Guid userId, CancellationToken ct = default)
    {
        var roles = await _context.Users
            .Where(u => u.Id == userId)
            .SelectMany(u => u.Roles)
            .Select(r => r.Id)
            .ToListAsync(ct);

        var perms = await _context.FeaturePermissions
            .Include(fp => fp.Feature)
            .Where(fp => roles.Contains(fp.RoleId))
            .Select(fp => $"{fp.Feature!.Code}:{fp.Access}")
            .ToHashSetAsync(ct);

        return perms;
    }

    public void Add(Role role) => _context.Roles.Add(role);
    public void Update(Role role) => _context.Roles.Update(role);
    public void AddPermission(FeaturePermission permission) => _context.FeaturePermissions.Add(permission);
    public void RemovePermission(FeaturePermission permission) => _context.FeaturePermissions.Remove(permission);
}
