using FluentAssertions;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Domain.UnitTests.Entities;

public class CompanyEntityTests
{
    [Fact]
    public void Create_NewCompany_DefaultsToActiveStatus()
    {
        var company = new Company { NameVietnamese = "Test Co" };
        company.Status.Should().Be(CompanyStatus.Active);
    }

    [Fact]
    public void Create_NewCompany_HasNewGuid()
    {
        var company = new Company();
        company.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void SetStatus_Suspended_ChangesStatus()
    {
        var company = new Company { NameVietnamese = "Test Co" };
        company.Status = CompanyStatus.Suspended;
        company.Status.Should().Be(CompanyStatus.Suspended);
    }

    [Fact]
    public void LegalRepresentatives_Default_IsEmpty()
    {
        var company = new Company();
        company.LegalRepresentatives.Should().BeEmpty();
    }

    [Fact]
    public void BusinessLines_Default_IsEmpty()
    {
        var company = new Company();
        company.BusinessLines.Should().BeEmpty();
    }

    [Fact]
    public void CapitalContributors_Default_IsEmpty()
    {
        var company = new Company();
        company.CapitalContributors.Should().BeEmpty();
    }

    [Fact]
    public void BankAccounts_Default_IsEmpty()
    {
        var company = new Company();
        company.BankAccounts.Should().BeEmpty();
    }

    [Fact]
    public void Branches_Default_IsEmpty()
    {
        var company = new Company();
        company.Branches.Should().BeEmpty();
    }

    [Fact]
    public void FormerNames_Default_IsEmpty()
    {
        var company = new Company();
        company.FormerNames.Should().BeEmpty();
    }

    [Fact]
    public void Settings_WhenCreated_IsNullByDefault()
    {
        var company = new Company();
        company.Settings.Should().BeNull();
    }

    [Fact]
    public void UserCompanies_Default_IsEmpty()
    {
        var company = new Company();
        company.UserCompanies.Should().BeEmpty();
    }

    [Fact]
    public void CreatedAt_DefaultsToUtcNow()
    {
        var company = new Company();
        company.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}

public class CompanySettingsEntityTests
{
    [Fact]
    public void Create_DefaultSettings_HasVNDDefaults()
    {
        var settings = new CompanySettings();
        settings.CurrencyCode.Should().Be("VND");
        settings.FiscalYearStartMonth.Should().Be(1);
    }

    [Fact]
    public void Create_DefaultSettings_DecimalPlacesZero()
    {
        var settings = new CompanySettings();
        settings.DecimalPlaces.Should().Be(0);
    }

    [Fact]
    public void Create_DefaultSettings_RegimeIsTT99()
    {
        var settings = new CompanySettings();
        settings.AccountingRegime.Should().Be(AccountingRegime.TT99);
    }

    [Fact]
    public void Create_DefaultSettings_TaxCalcMethodIsKhauTru()
    {
        var settings = new CompanySettings();
        settings.TaxCalculationMethod.Should().Be(TaxCalculationMethod.KhauTru);
    }

    [Fact]
    public void Create_DefaultSettings_EnableDepartmentIsTrue()
    {
        var settings = new CompanySettings();
        settings.EnableDepartmentManagement.Should().BeTrue();
    }

    [Fact]
    public void Create_DefaultSettings_RoundingMethodIsHalfUp()
    {
        var settings = new CompanySettings();
        settings.RoundingMethod.Should().Be(RoundingMethod.RoundHalfUp);
    }
}

public class LegalRepresentativeEntityTests
{
    [Fact]
    public void Create_LegalRep_HasRequiredFields()
    {
        var rep = new LegalRepresentative
        {
            FullName = "Nguyen Van A",
            VNeIDNumber = "001234567890",
            Position = "Giam doc",
            IsPrimary = true,
            FromDate = new DateTime(2026, 1, 1)
        };
        rep.FullName.Should().Be("Nguyen Van A");
        rep.IsPrimary.Should().BeTrue();
        rep.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Create_LegalRep_DefaultsToActive()
    {
        var rep = new LegalRepresentative();
        rep.IsActive.Should().BeTrue();
    }
}

public class CapitalContributorEntityTests
{
    [Fact]
    public void Create_Contributor_HasRequiredFields()
    {
        var contributor = new CapitalContributor
        {
            ContributorType = ContributorType.Individual,
            FullName = "Nguyen Van B",
            CapitalContribution = 500_000_000m,
            OwnershipRatio = 50.00m,
            ContributionDate = new DateTime(2026, 1, 1),
            IsFounder = true
        };
        contributor.CapitalContribution.Should().Be(500_000_000m);
        contributor.OwnershipRatio.Should().Be(50.00m);
        contributor.IsFounder.Should().BeTrue();
    }
}

public class BusinessLineEntityTests
{
    [Fact]
    public void Create_BusinessLine_HasRequiredFields()
    {
        var line = new BusinessLine
        {
            VsicCode = "5610",
            VsicLevel = 4,
            Name = "Nha hang an uong",
            IsPrimary = true,
            StartDate = new DateTime(2026, 1, 1)
        };
        line.IsPrimary.Should().BeTrue();
        line.EndDate.Should().BeNull();
    }
}

public class CompanyBankAccountEntityTests
{
    [Fact]
    public void Create_BankAccount_DefaultsToVND()
    {
        var acct = new CompanyBankAccount
        {
            AccountNumber = "1234567890",
            AccountName = "Test Account",
            BankName = "Vietcombank",
            IsPrimaryTaxPayment = true
        };
        acct.CurrencyCode.Should().Be("VND");
        acct.IsActive.Should().BeTrue();
    }
}

public class BranchEntityTests
{
    [Fact]
    public void Create_Branch_HasRequiredFields()
    {
        var branch = new Branch
        {
            BranchType = BranchType.Branch,
            Name = "Chi nhanh Ha Noi",
            Address = "So 1, Hoan Kiem, Ha Noi",
            DateOpened = new DateTime(2026, 1, 1)
        };
        branch.BranchType.Should().Be(BranchType.Branch);
    }
}

public class CompanyLicenseEntityTests
{
    [Fact]
    public void Create_License_HasRequiredFields()
    {
        var license = new CompanyLicense
        {
            LicenseType = CompanyLicenseType.BusinessRegCert,
            LicenseNumber = "123456",
            IssuedBy = "So KH&DT Ha Noi",
            DateIssued = new DateTime(2026, 1, 1)
        };
        license.LicenseType.Should().Be(CompanyLicenseType.BusinessRegCert);
    }
}
