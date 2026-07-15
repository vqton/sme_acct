using SmeAccounting.Domain.GeneralLedger;

namespace SmeAccounting.Domain.Interfaces;

public interface IJournalEntryRepository
{
    Task<JournalEntry?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<JournalEntry>> GetByFiscalPeriodAsync(Guid fiscalPeriodId, CancellationToken ct = default);
    Task<List<JournalEntry>> GetByAccountAsync(Guid accountId, CancellationToken ct = default);
    Task<List<JournalEntry>> GetAllAsync(CancellationToken ct = default);
    Task<string> GetNextEntryNumberAsync(Guid fiscalPeriodId, CancellationToken ct = default);
    void Add(JournalEntry entry);
    void Update(JournalEntry entry);
}
