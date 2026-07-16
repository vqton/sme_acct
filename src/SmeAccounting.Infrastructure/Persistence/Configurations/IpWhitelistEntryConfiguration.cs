using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.Entities;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class IpWhitelistEntryConfiguration : IEntityTypeConfiguration<IpWhitelistEntry>
{
    public void Configure(EntityTypeBuilder<IpWhitelistEntry> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.IpAddressOrRange).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(200);
        builder.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);
        builder.HasOne(e => e.Company).WithMany().HasForeignKey(e => e.CompanyId).OnDelete(DeleteBehavior.Cascade);
    }
}
