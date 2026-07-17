using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context) => _context = context;

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default) =>
        await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Username == username, ct);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<List<User>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default) =>
        await _context.Users.Where(u => u.CompanyId == companyId).Include(u => u.Roles).ToListAsync(ct);

    public async Task<List<User>> GetAllAsync(CancellationToken ct = default) =>
        await _context.Users.Include(u => u.Roles).OrderBy(u => u.Username).ToListAsync(ct);

    public async Task<bool> UsernameExistsAsync(string username, CancellationToken ct = default) =>
        await _context.Users.AnyAsync(u => u.Username == username, ct);

    public async Task<bool> EmailExistsAsync(string email, CancellationToken ct = default) =>
        await _context.Users.AnyAsync(u => u.Email == email, ct);

    public void Add(User user) => _context.Users.Add(user);
    public void Update(User user) => _context.Users.Update(user);

    public async Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default) =>
        await _context.RefreshTokens.Include(rt => rt.User).FirstOrDefaultAsync(rt => rt.Token == token, ct);

    public async Task<List<RefreshToken>> GetActiveRefreshTokensAsync(Guid userId, CancellationToken ct = default) =>
        await _context.RefreshTokens.Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow).ToListAsync(ct);

    public void AddRefreshToken(RefreshToken token) => _context.RefreshTokens.Add(token);
    public void RevokeRefreshToken(RefreshToken token)
    {
        token.Revoke();
        _context.RefreshTokens.Update(token);
    }

    public async Task<int> GetFailedAttemptsAsync(string username, TimeSpan within, CancellationToken ct = default)
    {
        var since = DateTime.UtcNow - within;
        return await _context.LoginAttempts.CountAsync(la =>
            la.Username == username && la.AttemptedAt >= since && la.Result != LoginResult.Success, ct);
    }

    public void AddLoginAttempt(LoginAttempt attempt) => _context.LoginAttempts.Add(attempt);

    public async Task RevokeAllUserRefreshTokensAsync(Guid userId, CancellationToken ct = default)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync(ct);
        foreach (var token in activeTokens)
            token.Revoke();
    }
}
