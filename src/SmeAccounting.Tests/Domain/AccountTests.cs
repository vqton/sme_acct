using SmeAccounting.Domain.Enums;
using SmeAccounting.Domain.GeneralLedger;
using FluentAssertions;

namespace SmeAccounting.Tests.Domain;

public class AccountTests
{
    [Fact]
    public void CreateAccount_WithAssetType_SetsNormalBalanceToDebit()
    {
        var account = new Account("1.1.1", "Cash", AccountType.Asset);
        account.NormalBalance.Should().Be(EntryType.Debit);
    }

    [Fact]
    public void CreateAccount_WithLiabilityType_SetsNormalBalanceToCredit()
    {
        var account = new Account("2.1.1", "Accounts Payable", AccountType.Liability);
        account.NormalBalance.Should().Be(EntryType.Credit);
    }

    [Fact]
    public void CreateAccount_WithRevenueType_SetsNormalBalanceToCredit()
    {
        var account = new Account("4.1.1", "Sales Revenue", AccountType.Revenue);
        account.NormalBalance.Should().Be(EntryType.Credit);
    }

    [Fact]
    public void CreateAccount_WithExpenseType_SetsNormalBalanceToDebit()
    {
        var account = new Account("5.1.1", "Rent Expense", AccountType.Expense);
        account.NormalBalance.Should().Be(EntryType.Debit);
    }

    [Fact]
    public void CreateAccount_WithEquityType_SetsNormalBalanceToCredit()
    {
        var account = new Account("3.1.1", "Owner's Equity", AccountType.Equity);
        account.NormalBalance.Should().Be(EntryType.Credit);
    }

    [Fact]
    public void CreateAccount_WithParentId_StoresParent()
    {
        var child = new Account("1.1.2", "Checking", AccountType.Asset, parentId: Guid.NewGuid());
        child.ParentId.Should().HaveValue();
    }

    [Fact]
    public void ActivateAccount_SetsIsActiveTrue()
    {
        var account = new Account("1.1.1", "Cash", AccountType.Asset);
        account.Deactivate();
        account.IsActive.Should().BeFalse();
        account.Activate();
        account.IsActive.Should().BeTrue();
    }

    [Fact]
    public void RenameAccount_UpdatesName()
    {
        var account = new Account("1.1.1", "Cash", AccountType.Asset);
        account.Rename("Petty Cash");
        account.Name.Should().Be("Petty Cash");
    }

    [Fact]
    public void MoveAccount_ToDifferentParent_UpdatesParentId()
    {
        var account = new Account("1.1.1", "Cash", AccountType.Asset);
        var newParent = Guid.NewGuid();
        account.MoveTo(newParent);
        account.ParentId.Should().Be(newParent);
    }

    [Fact]
    public void MoveAccount_ToOwnId_Throws()
    {
        var account = new Account("1.1.1", "Cash", AccountType.Asset);
        var act = () => account.MoveTo(account.Id);
        act.Should().Throw<InvalidOperationException>().WithMessage("*own parent*");
    }
}
