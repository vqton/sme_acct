using SmeAccounting.Domain.GeneralLedger;

namespace SmeAccounting.Domain.Interfaces;

public interface IAccountRepository
{
    Task<Account?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Account?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<List<Account>> GetAllAsync(CancellationToken ct = default);
    Task<List<Account>> GetRootAccountsAsync(CancellationToken ct = default);
    Task<List<Account>> GetChildrenAsync(Guid parentId, CancellationToken ct = default);
    Task<bool> CodeExistsAsync(string code, CancellationToken ct = default);
    void Add(Account account);
    void Update(Account account);
    void Delete(Account account);
}
