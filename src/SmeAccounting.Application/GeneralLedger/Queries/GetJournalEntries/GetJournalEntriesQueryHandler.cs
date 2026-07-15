using FluentResults;
using MediatR;
using SmeAccounting.Domain.Enums;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.GeneralLedger.Queries.GetJournalEntries;

public class GetJournalEntriesQueryHandler : IRequestHandler<GetJournalEntriesQuery, Result<List<JournalEntryDto>>>
{
    private readonly IJournalEntryRepository _repository;

    public GetJournalEntriesQueryHandler(IJournalEntryRepository repository) => _repository = repository;

    public async Task<Result<List<JournalEntryDto>>> Handle(GetJournalEntriesQuery query, CancellationToken ct)
    {
        var entries = query.FiscalPeriodId.HasValue
            ? await _repository.GetByFiscalPeriodAsync(query.FiscalPeriodId.Value, ct)
            : await _repository.GetAllAsync(ct);

        var dtos = entries.Select(e => new JournalEntryDto(
            e.Id, e.EntryNumber, e.Description, e.PostingDate, e.Status.ToString(),
            e.Lines.Count,
            e.Lines.Where(l => l.EntryType == EntryType.Debit).Sum(l => l.Amount.Amount),
            e.Lines.Where(l => l.EntryType == EntryType.Credit).Sum(l => l.Amount.Amount)
        )).ToList();

        return Result.Ok(dtos);
    }
}
