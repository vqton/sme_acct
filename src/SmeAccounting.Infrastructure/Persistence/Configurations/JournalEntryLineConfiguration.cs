using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmeAccounting.Domain.GeneralLedger;

namespace SmeAccounting.Infrastructure.Persistence.Configurations;

public class JournalEntryLineConfiguration : IEntityTypeConfiguration<JournalEntryLine>
{
    public void Configure(EntityTypeBuilder<JournalEntryLine> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.EntryType).HasConversion<string>().HasMaxLength(10);
        builder.OwnsOne(e => e.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 2).IsRequired();
            money.Property(m => m.CurrencyCode).HasColumnName("CurrencyCode").HasMaxLength(3).IsRequired();
        });
        builder.Property(e => e.Description).HasMaxLength(500);
    }
}
