using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class FeaturePermissionConfiguration : IEntityTypeConfiguration<FeaturePermission>
{
    public void Configure(EntityTypeBuilder<FeaturePermission> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Access).HasConversion<string>().HasMaxLength(50);
        builder.HasOne(e => e.Role).WithMany().HasForeignKey(e => e.RoleId);
        builder.HasOne(e => e.Feature).WithMany().HasForeignKey(e => e.FeatureId);
        builder.HasIndex(e => new { e.RoleId, e.FeatureId }).IsUnique();
    }
}
