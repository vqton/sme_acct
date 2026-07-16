using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class UserOrganizationUnitConfiguration : IEntityTypeConfiguration<UserOrganizationUnit>
{
    public void Configure(EntityTypeBuilder<UserOrganizationUnit> builder)
    {
        builder.HasKey(e => e.Id);
        builder.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
        builder.HasOne(e => e.OrganizationUnit).WithMany(e => e.UserOrgUnits).HasForeignKey(e => e.OrganizationUnitId);
        builder.HasIndex(e => new { e.UserId, e.OrganizationUnitId }).IsUnique();
    }
}
