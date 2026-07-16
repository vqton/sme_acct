using Microsoft.EntityFrameworkCore;
using SmeAccounting.Application.Common.Interfaces;
using SmeAccounting.Infrastructure.Persistence.Interceptors;
using SmeAccounting.Domain.Entities;
namespace SmeAccounting.IntegrationTests.Audit;

public sealed class AuditSaveChangesInterceptorTests
{
    [Fact]
    public async Task SaveChanges_AddEntity_CreatesAuditRecord()
    {
        using var ctx = CreateContext(out var currentUser);
        currentUser.UserId.Returns("user-123");

        var entity = new TestAuditedEntity { Name = "Test" };
        ctx.TestEntities.Add(entity);
        await ctx.SaveChangesAsync();

        var audits = await ctx.AuditLog.ToListAsync();
        audits.Should().ContainSingle();
        audits[0].Operation.Should().Be("Added");
        audits[0].ChangedBy.Should().Be("user-123");
    }

    [Fact]
    public async Task SaveChanges_ModifyEntity_CreatesAuditWithOldAndNewValues()
    {
        using var ctx = CreateContext(out var currentUser);
        currentUser.UserId.Returns("user-123");

        var entity = new TestAuditedEntity { Name = "Original" };
        ctx.TestEntities.Add(entity);
        await ctx.SaveChangesAsync();

        entity.Name = "Updated";
        await ctx.SaveChangesAsync();

        var audits = await ctx.AuditLog.OrderBy(a => a.CreatedAt).ToListAsync();
        audits.Should().HaveCount(2);
        audits[1].Operation.Should().Be("Modified");
        audits[1].NewValues.Should().Contain("Updated");
    }

    [Fact]
    public async Task SaveChanges_DeleteEntity_CreatesAuditWithDeletedOperation()
    {
        using var ctx = CreateContext(out var currentUser);
        currentUser.UserId.Returns("user-123");

        var entity = new TestAuditedEntity { Name = "DeleteMe" };
        ctx.TestEntities.Add(entity);
        await ctx.SaveChangesAsync();

        ctx.TestEntities.Remove(entity);
        await ctx.SaveChangesAsync();

        var audits = await ctx.AuditLog.OrderBy(a => a.CreatedAt).ToListAsync();
        audits.Should().HaveCount(2);
        audits[1].Operation.Should().Be("Deleted");
    }

    [Fact]
    public async Task SaveChanges_WithoutUser_FallsBackToSystem()
    {
        using var ctx = CreateContext(out var currentUser);
        currentUser.UserId.Returns((string?)null);

        var entity = new TestAuditedEntity { Name = "SystemTest" };
        ctx.TestEntities.Add(entity);
        await ctx.SaveChangesAsync();

        var audit = await ctx.AuditLog.SingleAsync();
        audit.ChangedBy.Should().Be("system");
    }

    [Fact]
    public async Task SaveChanges_AuditEntityChanges_NotAudited()
    {
        using var ctx = CreateContext(out var currentUser);
        currentUser.UserId.Returns("user-123");

        var entity = new TestAuditedEntity { Name = "NoLoop" };
        ctx.TestEntities.Add(entity);
        await ctx.SaveChangesAsync();

        var audits = await ctx.AuditLog.ToListAsync();
        audits.Should().ContainSingle();
    }

    private static TestDbContext CreateContext(out ICurrentUserService currentUser)
    {
        currentUser = Substitute.For<ICurrentUserService>();
        var interceptor = new AuditSaveChangesInterceptor(currentUser);
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .AddInterceptors(interceptor)
            .Options;
        return new TestDbContext(options);
    }
}

public sealed class TestAuditedEntity : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}

public sealed class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }

    public DbSet<TestAuditedEntity> TestEntities => Set<TestAuditedEntity>();
    public DbSet<AuditEntity> AuditLog => Set<AuditEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TestAuditedEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200);
        });
        modelBuilder.Entity<AuditEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TableName).HasMaxLength(100);
            e.Property(x => x.Operation).HasMaxLength(20);
            e.Property(x => x.RecordId).HasMaxLength(50);
            e.Property(x => x.ChangedBy).HasMaxLength(100);
        });
    }
}
