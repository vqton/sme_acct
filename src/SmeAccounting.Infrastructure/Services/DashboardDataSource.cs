using Microsoft.EntityFrameworkCore;
using SmeAccounting.Application.Common.Interfaces;
using SmeAccounting.Application.GeneralLedger.Queries.GetDashboardData;
using SmeAccounting.Domain.Enums;
using SmeAccounting.Domain.GeneralLedger;
using SmeAccounting.Infrastructure.Persistence;

namespace SmeAccounting.Infrastructure.Services;

public sealed class DashboardDataSource : IDashboardDataSource
{
    private readonly ApplicationDbContext _db;

    public DashboardDataSource(ApplicationDbContext db) => _db = db;

    public async Task<DashboardDataDto> GetDashboardDataAsync(Guid companyId, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        var company = await _db.Companies.FirstOrDefaultAsync(c => c.Id == companyId, ct);

        var openPeriods = await _db.FiscalPeriods
            .Where(p => p.FiscalYear.CompanyId == companyId && p.Status == FiscalPeriodStatus.Open)
            .CountAsync(ct);

        var allPeriods = await _db.FiscalPeriods
            .Where(p => p.FiscalYear.CompanyId == companyId)
            .ToListAsync(ct);

        var currentPeriod = allPeriods
            .Where(p => p.StartDate <= today && p.EndDate >= today)
            .MaxBy(p => p.StartDate);

        var allAccounts = await _db.Accounts
            .Where(a => a.IsActive)
            .ToListAsync(ct);

        var totalAccounts = await _db.Accounts.CountAsync(ct);
        var activeAccounts = allAccounts.Count;

        var assetAccounts = allAccounts.Count(a => a.Type == AccountType.Asset || a.Type == AccountType.ContraAsset);
        var liabilityAccounts = allAccounts.Count(a => a.Type == AccountType.Liability || a.Type == AccountType.ContraLiability);
        var equityAccounts = allAccounts.Count(a => a.Type == AccountType.Equity || a.Type == AccountType.ContraEquity);
        var revenueAccounts = allAccounts.Count(a => a.Type == AccountType.Revenue || a.Type == AccountType.ContraRevenue);
        var expenseAccounts = allAccounts.Count(a => a.Type == AccountType.Expense || a.Type == AccountType.ContraExpense);

        var postedEntries = await _db.JournalEntries
            .CountAsync(e => e.Status == JournalEntryStatus.Posted, ct);

        var draftEntries = await _db.JournalEntries
            .CountAsync(e => e.Status == JournalEntryStatus.Draft, ct);

        var activeUsers = await _db.Users
            .CountAsync(u => u.CompanyId == companyId && u.IsActive, ct);

        List<JournalEntry> periodEntries = new();
        decimal totalDebits = 0;
        decimal totalCredits = 0;

        if (currentPeriod is not null)
        {
            periodEntries = await _db.JournalEntries
                .Where(e => e.FiscalPeriodId == currentPeriod.Id && e.Status == JournalEntryStatus.Posted)
                .Include(e => e.Lines)
                .ToListAsync(ct);

            totalDebits = periodEntries.Sum(e => e.Lines
                .Where(l => l.EntryType == EntryType.Debit).Sum(l => l.Amount.Amount));

            totalCredits = periodEntries.Sum(e => e.Lines
                .Where(l => l.EntryType == EntryType.Credit).Sum(l => l.Amount.Amount));
        }

        var recentEntries = (await _db.JournalEntries
            .Where(e => e.Status == JournalEntryStatus.Posted)
            .Include(e => e.Lines)
            .ToListAsync(ct))
            .OrderByDescending(e => e.PostingDate)
            .Take(5)
            .ToList();

        var recentDtos = recentEntries.Select(e => new RecentJournalEntryDto(
            e.Id, e.EntryNumber, e.Description, e.PostingDate, e.Status.ToString(),
            e.Lines.Sum(l => l.Amount.Amount)
        )).ToList();

        var allLines = await _db.JournalEntryLines
            .Where(l => l.JournalEntry.Status == JournalEntryStatus.Posted)
            .ToListAsync(ct);

        var topLevelAccounts = allAccounts.Where(a => a.ParentId is null).ToList();
        var accountBalances = new List<AccountBalanceDto>();

        foreach (var acc in topLevelAccounts)
        {
            var accLines = allLines.Where(l => l.AccountId == acc.Id).ToList();

            var debitSum = accLines.Where(l => l.EntryType == EntryType.Debit).Sum(l => l.Amount.Amount);
            var creditSum = accLines.Where(l => l.EntryType == EntryType.Credit).Sum(l => l.Amount.Amount);

            var balance = acc.NormalBalance == EntryType.Debit
                ? debitSum - creditSum
                : creditSum - debitSum;

            accountBalances.Add(new AccountBalanceDto(
                acc.Code, acc.Name, acc.Type.ToString(),
                balance, acc.NormalBalance.ToString()
            ));
        }

        return new DashboardDataDto(
            CompanyName: company?.Name ?? "SmeAccounting",
            OpenFiscalPeriods: openPeriods,
            CurrentPeriodId: currentPeriod?.Id,
            CurrentPeriodLabel: currentPeriod?.Label,
            PostedEntriesThisPeriod: periodEntries.Count,
            TotalDebitsThisPeriod: totalDebits,
            TotalCreditsThisPeriod: totalCredits,
            TotalAccounts: totalAccounts,
            ActiveAccounts: activeAccounts,
            AssetAccounts: assetAccounts,
            LiabilityAccounts: liabilityAccounts,
            EquityAccounts: equityAccounts,
            RevenueAccounts: revenueAccounts,
            ExpenseAccounts: expenseAccounts,
            ActiveUsers: activeUsers,
            TotalPostedEntries: postedEntries,
            DraftEntries: draftEntries,
            RecentEntries: recentDtos,
            TopLevelAccountBalances: accountBalances
        );
    }
}
