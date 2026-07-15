using FluentResults;
using MediatR;

namespace SmeAccounting.Application.GeneralLedger.Commands.CreateJournalEntry;

public record CreateJournalEntryCommand(
    string Description,
    DateOnly PostingDate,
    Guid FiscalPeriodId,
    List<JournalEntryLineDto> Lines
) : IRequest<Result<Guid>>;

public record JournalEntryLineDto(Guid AccountId, string EntryType, decimal Amount, string? Description = null);
