using Microsoft.EntityFrameworkCore;
using SmeAccounting.Domain.Entities;
using SmeAccounting.Domain.GeneralLedger;
using SmeAccounting.Domain.Interfaces;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
    }
}
