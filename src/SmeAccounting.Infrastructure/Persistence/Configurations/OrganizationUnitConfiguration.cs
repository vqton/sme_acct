using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class OrganizationUnitConfiguration : IEntityTypeConfiguration<OrganizationUnit>
{
    public void Configure(EntityTypeBuilder<OrganizationUnit> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.HasOne(e => e.Company).WithMany().HasForeignKey(e => e.CompanyId);
        builder.HasOne(e => e.Parent).WithMany(e => e.Children).HasForeignKey(e => e.ParentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(e => e.UserOrgUnits).WithOne(e => e.OrganizationUnit).HasForeignKey(e => e.OrganizationUnitId);
    }
}
