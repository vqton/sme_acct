using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class AuditEntityConfiguration : IEntityTypeConfiguration<AuditEntity>
{
    public void Configure(EntityTypeBuilder<AuditEntity> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.TableName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Operation).HasMaxLength(20).IsRequired();
        builder.Property(e => e.RecordId).HasMaxLength(50).IsRequired();
        builder.Property(e => e.ChangedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.IpAddress).HasMaxLength(50);
        builder.Property(e => e.UserAgent).HasMaxLength(500);
    }
}
