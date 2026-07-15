using FluentResults;
using MediatR;
using SmeAccounting.Domain.Enums;
using SmeAccounting.Domain.GeneralLedger;
using SmeAccounting.Domain.Interfaces;

namespace SmeAccounting.Application.GeneralLedger.Commands.CreateJournalEntry;

public class CreateJournalEntryCommandHandler : IRequestHandler<CreateJournalEntryCommand, Result<Guid>>
{
    private readonly IJournalEntryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateJournalEntryCommandHandler(IJournalEntryRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateJournalEntryCommand command, CancellationToken ct)
    {
        var entryNumber = await _repository.GetNextEntryNumberAsync(command.FiscalPeriodId, ct);
        var entry = new JournalEntry(entryNumber, command.Description, command.PostingDate, command.FiscalPeriodId);

        foreach (var line in command.Lines)
        {
            var entryType = line.EntryType.ToLower() switch
            {
                "debit" => EntryType.Debit,
                "credit" => EntryType.Credit,
                _ => throw new ArgumentException($"Invalid entry type: {line.EntryType}")
            };
            entry.AddLine(line.AccountId, entryType, line.Amount, line.Description);
        }

        try
        {
            entry.Post();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Fail(ex.Message);
        }

        _repository.Add(entry);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(entry.Id);
    }
}
