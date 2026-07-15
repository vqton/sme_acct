using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Enums;
using SmeAccounting.Domain.ValueObjects;

namespace SmeAccounting.Domain.GeneralLedger;

public class JournalEntryLine : BaseEntity
{
    public Guid JournalEntryId { get; private set; }
    public JournalEntry JournalEntry { get; private set; } = null!;
    public Guid AccountId { get; private set; }
    public Account Account { get; private set; } = null!;
    public EntryType EntryType { get; private set; }
    public Money Amount { get; private set; } = null!;
    public int LineNumber { get; private set; }
    public string? Description { get; private set; }

    private JournalEntryLine() { }

    public JournalEntryLine(Guid journalEntryId, Guid accountId, EntryType entryType, decimal amount, int lineNumber, string? description = null)
    {
        JournalEntryId = journalEntryId;
        AccountId = accountId;
        EntryType = entryType;
        Amount = new Money(amount, "USD");
        LineNumber = lineNumber;
        Description = description;
    }
}
