using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Token).HasMaxLength(500).IsRequired();
        builder.HasIndex(e => e.Token).IsUnique();
        builder.Property(e => e.JwtId).HasMaxLength(100).IsRequired();
        builder.Property(e => e.DeviceInfo).HasMaxLength(200);
        builder.Property(e => e.IpAddress).HasMaxLength(50);
        builder.Property(e => e.ReplacedByToken).HasMaxLength(500);
        builder.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
        builder.HasIndex(e => e.UserId);
    }
}
