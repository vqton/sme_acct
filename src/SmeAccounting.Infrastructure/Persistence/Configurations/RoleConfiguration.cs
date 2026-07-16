using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.HasIndex(e => new { e.Name, e.CompanyId }).IsUnique();
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.HasOne(e => e.ParentRole).WithMany().HasForeignKey(e => e.ParentRoleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(e => e.CompanyId);
    }
}
