using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.Enums;

namespace SmeAccounting.Domain.GeneralLedger;

public class Account : BaseEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public AccountType Type { get; private set; }
    public EntryType NormalBalance { get; private set; }
    public bool IsActive { get; private set; } = true;

    public Guid? ParentId { get; private set; }
    public Account? Parent { get; private set; }
    public ICollection<Account> Children { get; private set; } = new List<Account>();

    private Account() { }

    public Account(string code, string name, AccountType type, string? description = null, Guid? parentId = null)
    {
        Code = code;
        Name = name;
        Type = type;
        Description = description;
        ParentId = parentId;
        NormalBalance = type switch
        {
            AccountType.Asset => EntryType.Debit,
            AccountType.Expense => EntryType.Debit,
            AccountType.Liability => EntryType.Credit,
            AccountType.Equity => EntryType.Credit,
            AccountType.Revenue => EntryType.Credit,
            AccountType.ContraAsset => EntryType.Credit,
            AccountType.ContraLiability => EntryType.Debit,
            AccountType.ContraEquity => EntryType.Debit,
            _ => EntryType.Debit
        };
    }

    public void Rename(string name) => Name = name;
    public void UpdateDescription(string? description) => Description = description;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void MoveTo(Guid? newParentId)
    {
        if (newParentId.HasValue && newParentId.Value == Id)
            throw new InvalidOperationException("Account cannot be its own parent");
        ParentId = newParentId;
    }
}
