using SmeAccounting.Domain.ValueObjects;

namespace SmeAccounting.Domain.Entities;

public class Company : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? TradeName { get; private set; }
    public string TaxId { get; private set; } = string.Empty;
    public string? RegistrationNumber { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public Address? Address { get; private set; }
    public string? Website { get; private set; }
    public string? LogoPath { get; private set; }
    public int? FiscalYearEnd { get; private set; }

    public ICollection<FiscalYear> FiscalYears { get; private set; } = new List<FiscalYear>();

    private Company() { }

    public Company(string name, string taxId)
    {
        Name = name;
        TaxId = taxId;
    }
}
