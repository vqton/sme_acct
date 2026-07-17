using FluentResults;
using MediatR;

namespace SmeAccounting.Application.GeneralLedger.Queries.GetDashboardData;

public record GetDashboardDataQuery(Guid UserId) : IRequest<Result<DashboardDataDto>>;

public record DashboardDataDto(
    string CompanyName,
    int OpenFiscalPeriods,

    Guid? CurrentPeriodId,
    string? CurrentPeriodLabel,
    int PostedEntriesThisPeriod,
    decimal TotalDebitsThisPeriod,
    decimal TotalCreditsThisPeriod,

    int TotalAccounts,
    int ActiveAccounts,
    int AssetAccounts,
    int LiabilityAccounts,
    int EquityAccounts,
    int RevenueAccounts,
    int ExpenseAccounts,

    int ActiveUsers,
    int TotalPostedEntries,
    int DraftEntries,

    List<RecentJournalEntryDto> RecentEntries,
    List<AccountBalanceDto> TopLevelAccountBalances
);

public record RecentJournalEntryDto(
    Guid Id, string EntryNumber, string Description, DateOnly PostingDate,
    string Status, decimal Total
);

public record AccountBalanceDto(
    string AccountCode, string AccountName, string AccountType,
    decimal Balance, string NormalBalance
);
