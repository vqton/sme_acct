using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Data;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.EnterpriseCode).HasMaxLength(15);
        builder.HasIndex(c => c.EnterpriseCode).IsUnique().HasFilter("[EnterpriseCode] IS NOT NULL");

        builder.Property(c => c.TaxCode).HasMaxLength(15);
        builder.HasIndex(c => c.TaxCode).IsUnique().HasFilter("[TaxCode] IS NOT NULL");

        builder.Property(c => c.Name).HasMaxLength(400);
        builder.Property(c => c.NameVietnamese).HasMaxLength(400);
        builder.Property(c => c.NameEnglish).HasMaxLength(400);
        builder.Property(c => c.AbbreviatedName).HasMaxLength(100);
        builder.HasIndex(c => c.NameVietnamese);

        builder.Property(c => c.CompanyType).HasConversion<int>();
        builder.Property(c => c.Status).HasConversion<int>().HasDefaultValue(CompanyStatus.Active);
        builder.Property(c => c.VNeIDStatus).HasConversion<int>().HasDefaultValue(VNeIDStatus.NotRegistered);
        builder.HasIndex(c => c.Status);

        builder.Property(c => c.CharterCapital).HasColumnType("decimal(18,2)");
        builder.Property(c => c.PaidInCapital).HasColumnType("decimal(18,2)");

        builder.Property(c => c.HeadOfficeAddress).HasMaxLength(500);
        builder.Property(c => c.HeadOfficeProvinceId).HasMaxLength(10);
        builder.Property(c => c.HeadOfficeDistrictId).HasMaxLength(10);
        builder.Property(c => c.HeadOfficeWardId).HasMaxLength(10);
        builder.Property(c => c.Phone).HasMaxLength(100);
        builder.Property(c => c.Email).HasMaxLength(256);
        builder.Property(c => c.Website).HasMaxLength(200);
        builder.Property(c => c.LogoUrl).HasMaxLength(512);

        builder.Property(c => c.ReasonForDissolution).HasMaxLength(2000);
        builder.Property(c => c.TaxOfficeId).HasMaxLength(20);
        builder.Property(c => c.TaxOfficeName).HasMaxLength(200);
        builder.Property(c => c.TaxDepartment).HasMaxLength(200);
        builder.Property(c => c.ManagedByTaxAuthorityCode).HasMaxLength(20);

        builder.Property(c => c.VNeIDOrganizationId).HasMaxLength(50);
        builder.HasIndex(c => c.VNeIDOrganizationId);

        builder.Property(c => c.CreatedByUserId).HasMaxLength(450);
        builder.Property(c => c.UpdatedByUserId).HasMaxLength(450);
        builder.HasIndex(c => c.CreatedByUserId);

        builder.HasOne(c => c.Settings)
            .WithOne(s => s.Company)
            .HasForeignKey<CompanySettings>(s => s.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.Seal)
            .WithOne(s => s.Company)
            .HasForeignKey<CompanySeal>(s => s.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.LegalRepresentatives)
            .WithOne(lr => lr.Company)
            .HasForeignKey(lr => lr.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.BusinessLines)
            .WithOne(bl => bl.Company)
            .HasForeignKey(bl => bl.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.CapitalContributors)
            .WithOne(cc => cc.Company)
            .HasForeignKey(cc => cc.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.BankAccounts)
            .WithOne(ba => ba.Company)
            .HasForeignKey(ba => ba.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Branches)
            .WithOne(b => b.Company)
            .HasForeignKey(b => b.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Licenses)
            .WithOne(l => l.Company)
            .HasForeignKey(l => l.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Documents)
            .WithOne(d => d.Company)
            .HasForeignKey(d => d.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.FormerNames)
            .WithOne(fn => fn.Company)
            .HasForeignKey(fn => fn.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.AuditAssignments)
            .WithOne(aa => aa.Company)
            .HasForeignKey(aa => aa.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.UserCompanies)
            .WithOne(uc => uc.Company)
            .HasForeignKey(uc => uc.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class CompanySettingsConfiguration : IEntityTypeConfiguration<CompanySettings>
{
    public void Configure(EntityTypeBuilder<CompanySettings> builder)
    {
        builder.ToTable("CompanySettings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(s => s.RoundingMethod).HasConversion<int>().HasDefaultValue(RoundingMethod.RoundHalfUp);
        builder.Property(s => s.AccountingRegime).HasConversion<int>().HasDefaultValue(AccountingRegime.TT99);
        builder.Property(s => s.TaxCalculationMethod).HasConversion<int>().HasDefaultValue(TaxCalculationMethod.KhauTru);
        builder.Property(s => s.TaxMethod).HasMaxLength(100);
        builder.Property(s => s.InventoryMethod).HasConversion<int?>();
        builder.Property(s => s.DefaultExchangeRateSource).HasConversion<int>().HasDefaultValue(ExchangeRateSource.StateBank);
    }
}

public class LegalRepresentativeConfiguration : IEntityTypeConfiguration<LegalRepresentative>
{
    public void Configure(EntityTypeBuilder<LegalRepresentative> builder)
    {
        builder.ToTable("LegalRepresentatives");

        builder.HasKey(lr => lr.Id);

        builder.Property(lr => lr.FullName).HasMaxLength(200).IsRequired();
        builder.Property(lr => lr.VNeIDNumber).HasMaxLength(12);
        builder.Property(lr => lr.Position).HasMaxLength(200);
        builder.Property(lr => lr.AuthorizationScope).HasMaxLength(500);
        builder.Property(lr => lr.DigitalCertSerial).HasMaxLength(200);
        builder.Property(lr => lr.DigitalCertProvider).HasMaxLength(200);

        builder.HasIndex(lr => new { lr.CompanyId, lr.VNeIDNumber }).IsUnique().HasFilter("[VNeIDNumber] IS NOT NULL");
    }
}

public class BusinessLineConfiguration : IEntityTypeConfiguration<BusinessLine>
{
    public void Configure(EntityTypeBuilder<BusinessLine> builder)
    {
        builder.ToTable("BusinessLines");

        builder.HasKey(bl => bl.Id);

        builder.Property(bl => bl.VsicCode).HasMaxLength(10).IsRequired();
        builder.Property(bl => bl.Name).HasMaxLength(500).IsRequired();
        builder.Property(bl => bl.LicenseReference).HasMaxLength(200);
        builder.HasIndex(bl => new { bl.CompanyId, bl.VsicCode });
    }
}

public class CapitalContributorConfiguration : IEntityTypeConfiguration<CapitalContributor>
{
    public void Configure(EntityTypeBuilder<CapitalContributor> builder)
    {
        builder.ToTable("CapitalContributors");

        builder.HasKey(cc => cc.Id);

        builder.Property(cc => cc.ContributorType).HasConversion<int>();
        builder.Property(cc => cc.FullName).HasMaxLength(200);
        builder.Property(cc => cc.OrganizationName).HasMaxLength(200);
        builder.Property(cc => cc.IdNumber).HasMaxLength(15);
        builder.Property(cc => cc.ContributionType).HasMaxLength(50);
        builder.Property(cc => cc.CapitalContribution).HasColumnType("decimal(18,2)");
        builder.Property(cc => cc.OwnershipRatio).HasColumnType("decimal(5,2)");
        builder.Property(cc => cc.ContributionCertificate).HasMaxLength(200);
    }
}

public class CompanyBankAccountConfiguration : IEntityTypeConfiguration<CompanyBankAccount>
{
    public void Configure(EntityTypeBuilder<CompanyBankAccount> builder)
    {
        builder.ToTable("CompanyBankAccounts");

        builder.HasKey(ba => ba.Id);

        builder.Property(ba => ba.AccountNumber).HasMaxLength(50).IsRequired();
        builder.Property(ba => ba.AccountName).HasMaxLength(200).IsRequired();
        builder.Property(ba => ba.BankName).HasMaxLength(200).IsRequired();
        builder.Property(ba => ba.BankBranch).HasMaxLength(200);
        builder.Property(ba => ba.SwiftCode).HasMaxLength(20);
        builder.Property(ba => ba.CurrencyCode).HasMaxLength(3);
    }
}

public class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.BranchType).HasConversion<int>();
        builder.Property(b => b.Name).HasMaxLength(400).IsRequired();
        builder.Property(b => b.Address).HasMaxLength(500);
        builder.Property(b => b.TaxCode).HasMaxLength(15);
        builder.Property(b => b.Phone).HasMaxLength(100);
        builder.Property(b => b.ManagerName).HasMaxLength(200);
        builder.Property(b => b.Status).HasMaxLength(50);
    }
}

public class CompanyLicenseConfiguration : IEntityTypeConfiguration<CompanyLicense>
{
    public void Configure(EntityTypeBuilder<CompanyLicense> builder)
    {
        builder.ToTable("CompanyLicenses");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.LicenseType).HasConversion<int>();
        builder.Property(l => l.LicenseNumber).HasMaxLength(100).IsRequired();
        builder.Property(l => l.IssuedBy).HasMaxLength(200);
        builder.Property(l => l.FileUrl).HasMaxLength(1000);
        builder.Property(l => l.Notes).HasMaxLength(1000);
    }
}

public class CompanySealConfiguration : IEntityTypeConfiguration<CompanySeal>
{
    public void Configure(EntityTypeBuilder<CompanySeal> builder)
    {
        builder.ToTable("CompanySeals");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.SealRegistrationNumber).HasMaxLength(50);
        builder.Property(s => s.SealImageUrl).HasMaxLength(1000);
        builder.Property(s => s.IssuedBy).HasMaxLength(200);
        builder.Property(s => s.Notes).HasMaxLength(1000);
    }
}

public class CompanyDocumentConfiguration : IEntityTypeConfiguration<CompanyDocument>
{
    public void Configure(EntityTypeBuilder<CompanyDocument> builder)
    {
        builder.ToTable("CompanyDocuments");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.DocumentType).HasConversion<int>();
        builder.Property(d => d.FileName).HasMaxLength(500).IsRequired();
        builder.Property(d => d.FileUrl).HasMaxLength(1000).IsRequired();
        builder.Property(d => d.ContentType).HasMaxLength(100);
    }
}

public class FormerNameConfiguration : IEntityTypeConfiguration<FormerName>
{
    public void Configure(EntityTypeBuilder<FormerName> builder)
    {
        builder.ToTable("FormerNames");

        builder.HasKey(fn => fn.Id);

        builder.Property(fn => fn.Name).HasMaxLength(400).IsRequired();
    }
}

public class AuditAssignmentConfiguration : IEntityTypeConfiguration<AuditAssignment>
{
    public void Configure(EntityTypeBuilder<AuditAssignment> builder)
    {
        builder.ToTable("AuditAssignments");

        builder.HasKey(aa => aa.Id);

        builder.Property(aa => aa.AuditFirmName).HasMaxLength(200).IsRequired();
        builder.Property(aa => aa.AuditFirmTaxCode).HasMaxLength(15);
        builder.Property(aa => aa.AuditFirmAddress).HasMaxLength(500);
        builder.Property(aa => aa.EngagementPartner).HasMaxLength(200);
        builder.Property(aa => aa.AuditReportReference).HasMaxLength(200);
        builder.Property(aa => aa.Status).HasConversion<int>();
    }
}

public class StatusChangeLogConfiguration : IEntityTypeConfiguration<StatusChangeLog>
{
    public void Configure(EntityTypeBuilder<StatusChangeLog> builder)
    {
        builder.ToTable("StatusChangeLogs");

        builder.HasKey(scl => scl.Id);

        builder.Property(scl => scl.OldStatus).HasConversion<int>();
        builder.Property(scl => scl.NewStatus).HasConversion<int>();
        builder.Property(scl => scl.Reason).HasMaxLength(1000).IsRequired();
        builder.Property(scl => scl.ChangedByUserId).HasMaxLength(450);
        builder.Property(scl => scl.DocumentRef).HasMaxLength(200);

        builder.HasOne(scl => scl.Company)
            .WithMany()
            .HasForeignKey(scl => scl.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(scl => scl.CompanyId);
        builder.HasIndex(scl => scl.ChangedAt);
    }
}

public class UserCompanyConfiguration : IEntityTypeConfiguration<UserCompany>
{
    public void Configure(EntityTypeBuilder<UserCompany> builder)
    {
        builder.ToTable("UserCompanies");

        builder.HasKey(uc => new { uc.UserId, uc.CompanyId });

        builder.Property(uc => uc.Role).HasMaxLength(50);

        builder.HasOne(uc => uc.User)
            .WithMany()
            .HasForeignKey(uc => uc.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(uc => uc.Company)
            .WithMany(c => c.UserCompanies)
            .HasForeignKey(uc => uc.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
