using FluentValidation;

namespace SmeAccounting.Application.GeneralLedger.Commands.CreateJournalEntry;

public class CreateJournalEntryCommandValidator : AbstractValidator<CreateJournalEntryCommand>
{
    public CreateJournalEntryCommandValidator()
    {
        RuleFor(v => v.Description).NotEmpty().MaximumLength(500);
        RuleFor(v => v.Lines).NotEmpty().Must(lines => lines.Count >= 2)
            .WithMessage("Journal entry must have at least 2 lines");
        RuleForEach(v => v.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.Amount).GreaterThan(0);
            line.RuleFor(l => l.EntryType).Must(t => t is "debit" or "credit" or "Debit" or "Credit")
                .WithMessage("Entry type must be 'debit' or 'credit'");
        });
    }
}
