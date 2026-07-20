using System.ComponentModel.DataAnnotations;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Areas.Admin.Models;

public class CompanyViewModel
{
    public string ActiveTab { get; set; } = "info";
    public CompanyInfoForm Info { get; set; } = new();
    public CompanySettingsForm Settings { get; set; } = new();
}

public class CompanyInfoForm
{
    [Required(ErrorMessage = "Company name is required")]
    [StringLength(400)]
    public string Name { get; set; } = string.Empty;

    [StringLength(100)]
    public string? TaxCode { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? Phone { get; set; }

    [EmailAddress, StringLength(256)]
    public string? Email { get; set; }

    [StringLength(200)]
    public string? Website { get; set; }

    [StringLength(200)]
    public string? LegalRepresentative { get; set; }

    [StringLength(200)]
    public string? RepPosition { get; set; }
}

public class CompanySettingsForm
{
    [Range(1, 12)]
    public int FiscalYearStartMonth { get; set; } = 1;

    [Required, StringLength(10)]
    public string CurrencyCode { get; set; } = "VND";

    [Range(0, 6)]
    public int DecimalPlaces { get; set; } = 0;

    public InventoryMethod? InventoryMethod { get; set; }

    [StringLength(100)]
    public string? TaxMethod { get; set; }

    public bool EnableMultiCurrency { get; set; }
    public bool EnableDepartmentManagement { get; set; } = true;
}
