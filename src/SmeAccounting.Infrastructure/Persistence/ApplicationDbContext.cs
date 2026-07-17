using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.DomainEvents;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.GeneralLedger;
using SmeAccounting.Domain.Interfaces;
using SmeAccounting.Domain.Security;
using SmeAccounting.Domain.Rules;
using SmeAccounting.Domain.Workflow;

namespace SmeAccounting.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<FiscalYear> FiscalYears => Set<FiscalYear>();
    public DbSet<FiscalPeriod> FiscalPeriods => Set<FiscalPeriod>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<AuditEntity> AuditLog => Set<AuditEntity>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<JournalEntryLine> JournalEntryLines => Set<JournalEntryLine>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<FeaturePermission> FeaturePermissions => Set<FeaturePermission>();
    public DbSet<OrganizationUnit> OrganizationUnits => Set<OrganizationUnit>();
    public DbSet<UserOrganizationUnit> UserOrganizationUnits => Set<UserOrganizationUnit>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<LoginAttempt> LoginAttempts => Set<LoginAttempt>();
    public DbSet<SessionSettings> SessionSettings => Set<SessionSettings>();
    public DbSet<CompanyPasswordPolicy> CompanyPasswordPolicies => Set<CompanyPasswordPolicy>();
    public DbSet<IpWhitelistEntry> IpWhitelistEntries => Set<IpWhitelistEntry>();
    public DbSet<ApprovalWorkflow> ApprovalWorkflows => Set<ApprovalWorkflow>();
    public DbSet<RegulatoryRule> RegulatoryRules => Set<RegulatoryRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Ignore<DomainEvent>();

        var dateOnlyConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateOnly, DateTime>(
            v => v.ToDateTime(TimeOnly.MinValue),
            v => DateOnly.FromDateTime(v));

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateOnly))
                    property.SetValueConverter(dateOnlyConverter);
                else if (property.ClrType == typeof(DateOnly?))
                    property.SetValueConverter(dateOnlyConverter);
            }
        }

        modelBuilder.ApplyConfiguration(new Configurations.CompanyConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.FiscalYearConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.FiscalPeriodConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.UserConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.RoleConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.PermissionConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.AuditEntityConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.AccountConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.JournalEntryConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.JournalEntryLineConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.FeatureConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.FeaturePermissionConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.OrganizationUnitConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.UserOrganizationUnitConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.RefreshTokenConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.LoginAttemptConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.SessionSettingsConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.CompanyPasswordPolicyConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.IpWhitelistEntryConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.ApprovalWorkflowConfiguration());
        modelBuilder.ApplyConfiguration(new Configurations.RegulatoryRuleConfiguration());
    }
}
