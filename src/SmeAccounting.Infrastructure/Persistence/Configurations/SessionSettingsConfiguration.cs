using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class SessionSettingsConfiguration : IEntityTypeConfiguration<SessionSettings>
{
    public void Configure(EntityTypeBuilder<SessionSettings> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.AccessTokenExpiryMinutes).IsRequired().HasDefaultValue(15);
        builder.Property(e => e.RefreshTokenExpiryDays).IsRequired().HasDefaultValue(7);
        builder.Property(e => e.MaxConcurrentSessions).IsRequired().HasDefaultValue(3);
        builder.Property(e => e.EnforceSessionTimeout).IsRequired().HasDefaultValue(true);
        builder.HasOne(e => e.Company).WithMany().HasForeignKey(e => e.CompanyId).OnDelete(DeleteBehavior.Cascade);
    }
}
