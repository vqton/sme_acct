using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.GeneralLedger;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly ApplicationDbContext _context;

    public AccountRepository(ApplicationDbContext context) => _context = context;

    public async Task<Account?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.Accounts.Include(a => a.Children).FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task<Account?> GetByCodeAsync(string code, CancellationToken ct = default) =>
        await _context.Accounts.FirstOrDefaultAsync(a => a.Code == code, ct);

    public async Task<List<Account>> GetAllAsync(CancellationToken ct = default) =>
        await _context.Accounts.OrderBy(a => a.Code).ToListAsync(ct);

    public async Task<List<Account>> GetRootAccountsAsync(CancellationToken ct = default) =>
        await _context.Accounts.Where(a => a.ParentId == null).OrderBy(a => a.Code).ToListAsync(ct);

    public async Task<List<Account>> GetChildrenAsync(Guid parentId, CancellationToken ct = default) =>
        await _context.Accounts.Where(a => a.ParentId == parentId).OrderBy(a => a.Code).ToListAsync(ct);

    public async Task<bool> CodeExistsAsync(string code, CancellationToken ct = default) =>
        await _context.Accounts.AnyAsync(a => a.Code == code, ct);

    public void Add(Account account) => _context.Accounts.Add(account);
    public void Update(Account account) => _context.Accounts.Update(account);
    public void Delete(Account account) => _context.Accounts.Remove(account);
}
