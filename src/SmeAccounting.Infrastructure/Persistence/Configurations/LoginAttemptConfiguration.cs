using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Security;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class LoginAttemptConfiguration : IEntityTypeConfiguration<LoginAttempt>
{
    public void Configure(EntityTypeBuilder<LoginAttempt> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Username).HasMaxLength(50).IsRequired();
        builder.Property(e => e.IpAddress).HasMaxLength(50).IsRequired();
        builder.Property(e => e.DeviceInfo).HasMaxLength(200);
        builder.Property(e => e.FailureReason).HasMaxLength(500);
        builder.Property(e => e.Result).HasConversion<string>().HasMaxLength(30);
        builder.HasIndex(e => new { e.Username, e.AttemptedAt });
    }
}
