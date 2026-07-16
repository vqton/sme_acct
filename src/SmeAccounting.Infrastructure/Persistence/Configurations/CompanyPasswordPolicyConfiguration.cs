using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class CompanyPasswordPolicyConfiguration : IEntityTypeConfiguration<CompanyPasswordPolicy>
{
    public void Configure(EntityTypeBuilder<CompanyPasswordPolicy> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.MinLength).IsRequired().HasDefaultValue(8);
        builder.Property(e => e.MaxLength).IsRequired().HasDefaultValue(128);
        builder.Property(e => e.RequireUppercase).IsRequired().HasDefaultValue(true);
        builder.Property(e => e.RequireLowercase).IsRequired().HasDefaultValue(true);
        builder.Property(e => e.RequireDigit).IsRequired().HasDefaultValue(true);
        builder.Property(e => e.RequireSpecialChar).IsRequired().HasDefaultValue(true);
        builder.Property(e => e.MaxLoginAttempts).IsRequired().HasDefaultValue(5);
        builder.Property(e => e.LockoutMinutes).IsRequired().HasDefaultValue(15);
        builder.Property(e => e.PasswordHistoryCount).IsRequired().HasDefaultValue(5);
        builder.HasOne(e => e.Company).WithMany().HasForeignKey(e => e.CompanyId).OnDelete(DeleteBehavior.Cascade);
    }
}
