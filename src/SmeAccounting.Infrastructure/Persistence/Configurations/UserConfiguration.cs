using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Username).HasMaxLength(50).IsRequired();
        builder.HasIndex(e => e.Username).IsUnique();
        builder.Property(e => e.Email).HasMaxLength(100).IsRequired();
        builder.HasIndex(e => e.Email).IsUnique();
        builder.Property(e => e.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.LastName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.MfaSecret).HasMaxLength(200);
        builder.Property(e => e.FullName).HasComputedColumnSql("CONCAT(FirstName, ' ', LastName)");
        builder.Ignore(e => e.PreviousPasswordHashes);
        builder.HasMany(e => e.Roles).WithMany(e => e.Users);
        builder.HasIndex(e => e.CompanyId);
    }
}
