using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmeAccounting.Web.Models;

namespace SmeAccounting.Web.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<UserCompany> UserCompanies => Set<UserCompany>();
    public DbSet<LegalRepresentative> LegalRepresentatives => Set<LegalRepresentative>();
    public DbSet<BusinessLine> BusinessLines => Set<BusinessLine>();
    public DbSet<CapitalContributor> CapitalContributors => Set<CapitalContributor>();
    public DbSet<CompanyBankAccount> CompanyBankAccounts => Set<CompanyBankAccount>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<CompanyLicense> CompanyLicenses => Set<CompanyLicense>();
    public DbSet<CompanySeal> CompanySeals => Set<CompanySeal>();
    public DbSet<CompanyDocument> CompanyDocuments => Set<CompanyDocument>();
    public DbSet<FormerName> FormerNames => Set<FormerName>();
    public DbSet<AuditAssignment> AuditAssignments => Set<AuditAssignment>();
    public DbSet<StatusChangeLog> StatusChangeLogs => Set<StatusChangeLog>();

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("acc");

        modelBuilder.ApplyConfiguration(new CompanyConfiguration());
        modelBuilder.ApplyConfiguration(new CompanySettingsConfiguration());
        modelBuilder.ApplyConfiguration(new LegalRepresentativeConfiguration());
        modelBuilder.ApplyConfiguration(new BusinessLineConfiguration());
        modelBuilder.ApplyConfiguration(new CapitalContributorConfiguration());
        modelBuilder.ApplyConfiguration(new CompanyBankAccountConfiguration());
        modelBuilder.ApplyConfiguration(new BranchConfiguration());
        modelBuilder.ApplyConfiguration(new CompanyLicenseConfiguration());
        modelBuilder.ApplyConfiguration(new CompanySealConfiguration());
        modelBuilder.ApplyConfiguration(new CompanyDocumentConfiguration());
        modelBuilder.ApplyConfiguration(new FormerNameConfiguration());
        modelBuilder.ApplyConfiguration(new AuditAssignmentConfiguration());
        modelBuilder.ApplyConfiguration(new StatusChangeLogConfiguration());
        modelBuilder.ApplyConfiguration(new UserCompanyConfiguration());
    }
}
