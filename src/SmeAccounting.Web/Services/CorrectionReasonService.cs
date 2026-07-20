using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Services;

public static class CorrectionReasonService
{
    private static readonly HashSet<string> CriticalFields =
    [
        "TaxCode",
        "EnterpriseCode",
        "NameVietnamese",
        "NameEnglish",
        "CharterCapital",
        "PaidInCapital",
        "LegalRepresentative",
        "CompanyType",
        "HeadOfficeAddress",
    ];

    public static bool IsCriticalField(string fieldName) =>
        CriticalFields.Contains(fieldName);

    public static bool RequireCorrectionReason(string fieldName, object? oldValue, object? newValue)
    {
        if (!IsCriticalField(fieldName)) return false;
        return !Equals(oldValue, newValue);
    }
}
