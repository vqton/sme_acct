using FluentResults;
using MediatR;

namespace SmeAccounting.Application.GeneralLedger.Queries.GetJournalEntries;

public record GetJournalEntriesQuery(Guid? FiscalPeriodId = null) : IRequest<Result<List<JournalEntryDto>>>;

public record JournalEntryDto(
    Guid Id, string EntryNumber, string Description, DateOnly PostingDate,
    string Status, int LineCount, decimal TotalDebits, decimal TotalCredits
);
