using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<List<User>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> UsernameExistsAsync(string username, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    void Add(User user);
    void Update(User user);

    Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken ct = default);
    Task<List<RefreshToken>> GetActiveRefreshTokensAsync(Guid userId, CancellationToken ct = default);
    void AddRefreshToken(RefreshToken token);
    void RevokeRefreshToken(RefreshToken token);

    Task<int> GetFailedAttemptsAsync(string username, TimeSpan within, CancellationToken ct = default);
    void AddLoginAttempt(LoginAttempt attempt);
}
