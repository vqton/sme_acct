namespace SmeAccounting.Web.Models;

public class Company
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string? EnterpriseCode { get; set; }
    public string? TaxCode { get; set; }

    public CompanyType? CompanyType { get; set; }

    [Obsolete("Use NameVietnamese instead")]
    public string Name { get; set; } = string.Empty;
    public string? NameVietnamese { get; set; }
    public string? NameEnglish { get; set; }
    public string? AbbreviatedName { get; set; }

    [Obsolete("Use LegalRepresentatives collection instead")]
    public string? LegalRepresentative { get; set; }
    [Obsolete("Use LegalRepresentatives collection instead")]
    public string? RepPosition { get; set; }

    [Obsolete("Use HeadOfficeAddress + Province/District/Ward instead")]
    public string? Address { get; set; }

    [Obsolete("Use Status == CompanyStatus.Active instead")]
    public bool IsActive { get => Status == CompanyStatus.Active; set { if (value) Status = CompanyStatus.Active; } }

    public decimal? CharterCapital { get; set; }
    public decimal? PaidInCapital { get; set; }

    public DateTime? DateOfEstablishment { get; set; }
    public DateTime? DateOfOperationCommencement { get; set; }

    public CompanyStatus Status { get; set; } = CompanyStatus.Active;
    public string? ReasonForDissolution { get; set; }

    public string? HeadOfficeAddress { get; set; }
    public string? HeadOfficeProvinceId { get; set; }
    public string? HeadOfficeDistrictId { get; set; }
    public string? HeadOfficeWardId { get; set; }

    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }

    public string? TaxOfficeId { get; set; }
    public string? TaxOfficeName { get; set; }
    public string? TaxDepartment { get; set; }
    public string? ManagedByTaxAuthorityCode { get; set; }

    public string? VNeIDOrganizationId { get; set; }
    public VNeIDStatus VNeIDStatus { get; set; } = VNeIDStatus.NotRegistered;
    public DateTime? LastVNeIDSyncAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByUserId { get; set; }
    public string? UpdatedByUserId { get; set; }
    public DateTime? FirstPeriodStartDate { get; set; }
    public int ClosedPeriodCount { get; set; }

    public CompanySettings? Settings { get; set; }
    public ICollection<LegalRepresentative> LegalRepresentatives { get; set; } = [];
    public ICollection<BusinessLine> BusinessLines { get; set; } = [];
    public ICollection<CapitalContributor> CapitalContributors { get; set; } = [];
    public ICollection<CompanyBankAccount> BankAccounts { get; set; } = [];
    public ICollection<Branch> Branches { get; set; } = [];
    public ICollection<CompanyLicense> Licenses { get; set; } = [];
    public ICollection<CompanyDocument> Documents { get; set; } = [];
    public CompanySeal? Seal { get; set; }
    public ICollection<FormerName> FormerNames { get; set; } = [];
    public ICollection<AuditAssignment> AuditAssignments { get; set; } = [];
    public ICollection<UserCompany> UserCompanies { get; set; } = [];
}

public class CompanySettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public int FiscalYearStartMonth { get; set; } = 1;
    public string CurrencyCode { get; set; } = "VND";
    public int DecimalPlaces { get; set; } = 0;
    public RoundingMethod RoundingMethod { get; set; } = RoundingMethod.RoundHalfUp;
    public AccountingRegime AccountingRegime { get; set; } = AccountingRegime.TT99;
    public TaxCalculationMethod TaxCalculationMethod { get; set; } = TaxCalculationMethod.KhauTru;
    public string? TaxMethod { get; set; }
    public InventoryMethod? InventoryMethod { get; set; }
    public bool EnableMultiCurrency { get; set; }
    public bool EnableDepartmentManagement { get; set; } = true;
    public ExchangeRateSource DefaultExchangeRateSource { get; set; } = ExchangeRateSource.StateBank;
    public DateTime? LastPeriodClosed { get; set; }
    public DateTime? FirstPeriodStartDate { get; set; }
    public int ClosedPeriodCount { get; set; }

    public Company Company { get; set; } = null!;
}

public class UserCompany
{
    public string UserId { get; set; } = string.Empty;
    public Guid CompanyId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public string? Role { get; set; }

    public ApplicationUser User { get; set; } = null!;
    public Company Company { get; set; } = null!;
}

public class LegalRepresentative
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string? VNeIDNumber { get; set; }
    public string Position { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public string? AuthorizationScope { get; set; }
    public string? DigitalCertSerial { get; set; }
    public string? DigitalCertProvider { get; set; }
    public DateTime? DigitalCertExpiry { get; set; }
    public DateTime? VNeIDVerifiedAt { get; set; }
    public DateTime FromDate { get; set; } = DateTime.UtcNow;
    public DateTime? ToDate { get; set; }
    public bool IsActive { get; set; } = true;

    public Company Company { get; set; } = null!;
}

public class BusinessLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public string VsicCode { get; set; } = string.Empty;
    public int VsicLevel { get; set; } = 4;
    public string Name { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? LicenseReference { get; set; }

    public Company Company { get; set; } = null!;
}

public class CapitalContributor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public ContributorType ContributorType { get; set; }
    public string? FullName { get; set; }
    public string? OrganizationName { get; set; }
    public string? IdNumber { get; set; }
    public string ContributionType { get; set; } = "Member";
    public decimal CapitalContribution { get; set; }
    public decimal OwnershipRatio { get; set; }
    public DateTime ContributionDate { get; set; }
    public string? ContributionCertificate { get; set; }
    public bool IsFounder { get; set; }

    public Company Company { get; set; } = null!;
}

public class CompanyBankAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string? BankBranch { get; set; }
    public string? SwiftCode { get; set; }
    public string CurrencyCode { get; set; } = "VND";
    public bool IsPrimaryTaxPayment { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime OpenedDate { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
}

public class Branch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public BranchType BranchType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? TaxCode { get; set; }
    public string? Phone { get; set; }
    public string? ManagerName { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime DateOpened { get; set; }
    public DateTime? DateClosed { get; set; }

    public Company Company { get; set; } = null!;
}

public class CompanyLicense
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public CompanyLicenseType LicenseType { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public string IssuedBy { get; set; } = string.Empty;
    public DateTime DateIssued { get; set; }
    public DateTime? DateExpiry { get; set; }
    public string? FileUrl { get; set; }
    public string? Notes { get; set; }

    public Company Company { get; set; } = null!;
}

public class CompanySeal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public string? SealRegistrationNumber { get; set; }
    public string? SealImageUrl { get; set; }
    public string? IssuedBy { get; set; }
    public DateTime? DateRegistered { get; set; }
    public string? Notes { get; set; }

    public Company Company { get; set; } = null!;
}

public class CompanyDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public DocumentType DocumentType { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
}

public class FormerName
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public string Name { get; set; } = string.Empty;
    public DateTime FromDate { get; set; }
    public DateTime? ToDate { get; set; }

    public Company Company { get; set; } = null!;
}

public class AuditAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public string AuditFirmName { get; set; } = string.Empty;
    public string? AuditFirmTaxCode { get; set; }
    public string? AuditFirmAddress { get; set; }
    public int AssignmentYear { get; set; }
    public string? EngagementPartner { get; set; }
    public DateTime? AuditStartDate { get; set; }
    public DateTime? AuditEndDate { get; set; }
    public string? AuditReportReference { get; set; }
    public AuditAssignmentStatus Status { get; set; } = AuditAssignmentStatus.Assigned;

    public Company Company { get; set; } = null!;
}

public class StatusChangeLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CompanyId { get; set; }

    public CompanyStatus OldStatus { get; set; }
    public CompanyStatus NewStatus { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ChangedByUserId { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public DateTime EffectiveDate { get; set; }
    public string? DocumentRef { get; set; }

    public Company Company { get; set; } = null!;
}
