using SmeAccounting.Domain.Enums;
using SmeAccounting.Domain.GeneralLedger;
using FluentAssertions;

namespace SmeAccounting.Domain.UnitTests.GeneralLedger;

public class JournalEntryTests
{
    private static readonly Guid FiscalPeriodId = Guid.NewGuid();
    private static readonly Guid CashId = Guid.NewGuid();
    private static readonly Guid RevenueId = Guid.NewGuid();

    private JournalEntry CreateBalancedEntry()
    {
        var entry = new JournalEntry("JE-001", "Test entry", DateOnly.FromDateTime(DateTime.UtcNow), FiscalPeriodId);
        entry.AddLine(CashId, EntryType.Debit, 1000m);
        entry.AddLine(RevenueId, EntryType.Credit, 1000m);
        return entry;
    }

    [Fact]
    public void CreateJournalEntry_SetsStatusToDraft()
    {
        var entry = new JournalEntry("JE-001", "Test", DateOnly.FromDateTime(DateTime.UtcNow), FiscalPeriodId);
        entry.Status.Should().Be(JournalEntryStatus.Draft);
    }

    [Fact]
    public void AddLine_AddsToLinesCollection()
    {
        var entry = new JournalEntry("JE-001", "Test", DateOnly.FromDateTime(DateTime.UtcNow), FiscalPeriodId);
        entry.AddLine(CashId, EntryType.Debit, 100m);
        entry.Lines.Should().HaveCount(1);
    }

    [Fact]
    public void AddLine_WithNegativeAmount_Throws()
    {
        var entry = new JournalEntry("JE-001", "Test", DateOnly.FromDateTime(DateTime.UtcNow), FiscalPeriodId);
        var act = () => entry.AddLine(CashId, EntryType.Debit, -100m);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void AddLine_AssignsSequentialLineNumbers()
    {
        var entry = new JournalEntry("JE-001", "Test", DateOnly.FromDateTime(DateTime.UtcNow), FiscalPeriodId);
        entry.AddLine(CashId, EntryType.Debit, 100m);
        entry.AddLine(RevenueId, EntryType.Credit, 100m);
        entry.Lines.ElementAt(0).LineNumber.Should().Be(1);
        entry.Lines.ElementAt(1).LineNumber.Should().Be(2);
    }

    [Fact]
    public void Post_WithBalancedEntry_SetsStatusToPosted()
    {
        var entry = CreateBalancedEntry();
        entry.Post();
        entry.Status.Should().Be(JournalEntryStatus.Posted);
    }

    [Fact]
    public void Post_WithSingleLine_Throws()
    {
        var entry = new JournalEntry("JE-001", "Test", DateOnly.FromDateTime(DateTime.UtcNow), FiscalPeriodId);
        entry.AddLine(CashId, EntryType.Debit, 100m);
        var act = () => entry.Post();
        act.Should().Throw<InvalidOperationException>().WithMessage("*at least 2*");
    }

    [Fact]
    public void Post_WithUnbalancedEntry_Throws()
    {
        var entry = new JournalEntry("JE-001", "Test", DateOnly.FromDateTime(DateTime.UtcNow), FiscalPeriodId);
        entry.AddLine(CashId, EntryType.Debit, 100m);
        entry.AddLine(RevenueId, EntryType.Credit, 99m);
        var act = () => entry.Post();
        act.Should().Throw<InvalidOperationException>().WithMessage("*Debits*credits*");
    }

    [Fact]
    public void Post_AlreadyPosted_Throws()
    {
        var entry = CreateBalancedEntry();
        entry.Post();
        var act = () => entry.Post();
        act.Should().Throw<InvalidOperationException>().WithMessage("*Already posted*");
    }

    [Fact]
    public void AddLine_AfterPost_Throws()
    {
        var entry = CreateBalancedEntry();
        entry.Post();
        var act = () => entry.AddLine(CashId, EntryType.Debit, 100m);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Cannot modify*");
    }

    [Fact]
    public void RemoveLine_RemovesFromCollection()
    {
        var entry = CreateBalancedEntry();
        var lineId = entry.Lines.First().Id;
        entry.RemoveLine(lineId);
        entry.Lines.Should().HaveCount(1);
    }

    [Fact]
    public void RemoveLine_AfterPost_Throws()
    {
        var entry = CreateBalancedEntry();
        entry.Post();
        var lineId = entry.Lines.First().Id;
        var act = () => entry.RemoveLine(lineId);
        act.Should().Throw<InvalidOperationException>().WithMessage("*Cannot modify*");
    }

    [Fact]
    public void Reverse_PostedEntry_SetsStatusToReversed()
    {
        var entry = CreateBalancedEntry();
        entry.Post();
        entry.Reverse("Erroneous entry");
        entry.Status.Should().Be(JournalEntryStatus.Reversed);
    }

    [Fact]
    public void Reverse_DraftEntry_Throws()
    {
        var entry = CreateBalancedEntry();
        var act = () => entry.Reverse("No reason");
        act.Should().Throw<InvalidOperationException>().WithMessage("*Only posted*");
    }
}
