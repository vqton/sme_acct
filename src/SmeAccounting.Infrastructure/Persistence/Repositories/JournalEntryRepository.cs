using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.GeneralLedger;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Infrastructure.Persistence.Repositories;

public class JournalEntryRepository : IJournalEntryRepository
{
    private readonly ApplicationDbContext _context;

    public JournalEntryRepository(ApplicationDbContext context) => _context = context;

    public async Task<JournalEntry?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.JournalEntries.Include(e => e.Lines).FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<List<JournalEntry>> GetByFiscalPeriodAsync(Guid fiscalPeriodId, CancellationToken ct = default) =>
        await _context.JournalEntries.Where(e => e.FiscalPeriodId == fiscalPeriodId).OrderBy(e => e.EntryNumber).ToListAsync(ct);

    public async Task<List<JournalEntry>> GetAllAsync(CancellationToken ct = default) =>
        await _context.JournalEntries.OrderByDescending(e => e.EntryNumber).ToListAsync(ct);

    public async Task<List<JournalEntry>> GetByAccountAsync(Guid accountId, CancellationToken ct = default) =>
        await _context.JournalEntryLines
            .Where(l => l.AccountId == accountId)
            .Select(l => l.JournalEntry)
            .Distinct()
            .ToListAsync(ct);

    public async Task<string> GetNextEntryNumberAsync(Guid fiscalPeriodId, CancellationToken ct = default)
    {
        var fiscalPeriod = await _context.FiscalPeriods.FindAsync(new object[] { fiscalPeriodId }, ct);
        if (fiscalPeriod == null) return "JE-0001";
        var prefix = $"JE-{fiscalPeriod.FiscalYearId.ToString("N")[..4]}-{fiscalPeriod.PeriodNumber:D2}-";
        var last = await _context.JournalEntries
            .Where(e => e.EntryNumber.StartsWith(prefix))
            .OrderByDescending(e => e.EntryNumber)
            .Select(e => e.EntryNumber)
            .FirstOrDefaultAsync(ct);
        if (last == null) return $"{prefix}0001";
        var num = int.Parse(last[^4..]) + 1;
        return $"{prefix}{num:D4}";
    }

    public void Add(JournalEntry entry) => _context.JournalEntries.Add(entry);
    public void Update(JournalEntry entry) => _context.JournalEntries.Update(entry);
}
