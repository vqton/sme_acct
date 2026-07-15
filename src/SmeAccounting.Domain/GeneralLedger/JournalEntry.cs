using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Enums;

namespace SmeAccounting.Domain.GeneralLedger;

public class JournalEntry : BaseEntity
{
    public string EntryNumber { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public DateOnly PostingDate { get; private set; }
    public JournalEntryStatus Status { get; private set; }
    public Guid FiscalPeriodId { get; private set; }

    private readonly List<JournalEntryLine> _lines = new();
    public IReadOnlyCollection<JournalEntryLine> Lines => _lines.AsReadOnly();

    private JournalEntry() { }

    public JournalEntry(string entryNumber, string description, DateOnly postingDate, Guid fiscalPeriodId)
    {
        EntryNumber = entryNumber;
        Description = description;
        PostingDate = postingDate;
        FiscalPeriodId = fiscalPeriodId;
        Status = Enums.JournalEntryStatus.Draft;
    }

    public void AddLine(Guid accountId, EntryType entryType, decimal amount, string? description = null)
    {
        if (Status != Enums.JournalEntryStatus.Draft)
            throw new InvalidOperationException("Cannot modify a posted journal entry");

        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        var lineNumber = _lines.Count + 1;
        _lines.Add(new JournalEntryLine(Id, accountId, entryType, amount, lineNumber, description));
    }

    public void RemoveLine(Guid lineId)
    {
        if (Status != Enums.JournalEntryStatus.Draft)
            throw new InvalidOperationException("Cannot modify a posted journal entry");

        var line = _lines.FirstOrDefault(l => l.Id == lineId)
            ?? throw new InvalidOperationException("Line not found");
        _lines.Remove(line);
    }

    public void Post()
    {
        if (Status != Enums.JournalEntryStatus.Draft)
            throw new InvalidOperationException("Already posted");

        if (_lines.Count < 2)
            throw new InvalidOperationException("Journal entry must have at least 2 lines");

        var totalDebits = _lines.Where(l => l.EntryType == Enums.EntryType.Debit).Sum(l => l.Amount.Amount);
        var totalCredits = _lines.Where(l => l.EntryType == Enums.EntryType.Credit).Sum(l => l.Amount.Amount);

        if (totalDebits != totalCredits)
            throw new InvalidOperationException($"Debits ({totalDebits}) must equal credits ({totalCredits})");

        Status = Enums.JournalEntryStatus.Posted;
    }

    public void Reverse(string reason)
    {
        if (Status != Enums.JournalEntryStatus.Posted)
            throw new InvalidOperationException("Only posted entries can be reversed");

        Status = Enums.JournalEntryStatus.Reversed;
    }
}
